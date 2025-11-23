import { savePlayer, getAllPlayers } from './db.js';
import { SKILLS } from './skills.js';
import { appendHostLog } from './network-common.js';
import { resolveTaskRewards, rollDistributedTask } from './host-tasks-rewards.js';

// New: one-time offline progress application when host (re)starts
export async function applyOfflineProgress(networkManager) {
    try {
        const now = Date.now();
        const players = await getAllPlayers();
        let totalCompletions = 0;

        for (const player of players) {
            // Normalize legacy safe structures
            if (!Array.isArray(player.energy)) player.energy = [];
            if (!player.inventory) player.inventory = {};
            if (!player.skills) player.skills = {};
            if (player.activeEnergy && !player.activeEnergy.startTime && typeof player.activeEnergy.consumedMs !== 'number') {
                player.activeEnergy = null;
            }
            if (typeof player.manualStop !== 'boolean') player.manualStop = false;
            if (player.pausedTask && !player.pausedTask.taskId) player.pausedTask = null;

            const active = player.activeTask;
            if (!active || !active.taskId || !active.startTime || !active.duration) {
                continue;
            }

            const elapsed = now - (active.startTime || 0);
            if (elapsed <= active.duration) {
                // Not even one full cycle has elapsed since last start; nothing to catch up
                continue;
            }

            // Find owning skill + task definition
            const taskId = active.taskId;
            let skillId = null;
            let taskDef = null;

            for (const [sid, skill] of Object.entries(SKILLS)) {
                const found = skill.tasks.find(t => t.id === taskId);
                if (found) {
                    skillId = sid;
                    taskDef = found;
                    break;
                }
            }

            if (!skillId || !taskDef) {
                continue;
            }

            // How many full task cycles would have fit into the offline window?
            let cycles = Math.floor(elapsed / (active.duration || 1));
            if (cycles <= 0) continue;

            // Safety clamp: avoid runaway loops on very old data (bumped to 5000 for better overnight coverage)
            const MAX_CYCLES = 5000;
            if (cycles > MAX_CYCLES) cycles = MAX_CYCLES;

            // Ensure skills/structure exists
            if (!player.skills[skillId]) {
                player.skills[skillId] = { tasks: {} };
            }
            if (!player.skills[skillId].tasks) {
                player.skills[skillId].tasks = {};
            }
            if (!player.skills[skillId].tasks[taskId]) {
                player.skills[skillId].tasks[taskId] = [];
            }

            const taskRecords = player.skills[skillId].tasks[taskId];
            const skill = SKILLS[skillId];

            for (let i = 0; i < cycles; i++) {
                const completedAt = active.startTime + (i + 1) * active.duration;
                if (completedAt > now) break;

                let xpGained = 0;
                let rewards = {};

                if (taskDef.isDistributed) {
                    // Distributed Task logic:
                    // 1. Use existing meta for the first cycle (representing the state when user went offline)
                    // 2. Roll new distributed results for subsequent cycles to simulate variance
                    let currentMeta = null;
                    
                    if (i === 0 && active.meta) {
                        currentMeta = active.meta;
                    } else {
                        // Simulate a new roll for this offline cycle
                        const roll = rollDistributedTask(player, skill, taskDef);
                        if (roll) currentMeta = roll.meta;
                    }

                    if (currentMeta && Array.isArray(currentMeta.resolvedTaskIds)) {
                        currentMeta.resolvedTaskIds.forEach(subId => {
                            const subTask = skill.tasks.find(t => t.id === subId);
                            if (subTask) {
                                xpGained += (subTask.xp || 0);
                                const subRewards = resolveTaskRewards(subTask);
                                Object.entries(subRewards).forEach(([itemId, qty]) => {
                                    rewards[itemId] = (rewards[itemId] || 0) + qty;
                                });
                            }
                        });
                    }
                } else {
                    // Standard Task logic
                    xpGained = taskDef?.xp ?? 0;
                    rewards = resolveTaskRewards(taskDef);
                }

                // Update inventory
                Object.entries(rewards).forEach(([itemId, qty]) => {
                    player.inventory[itemId] = (player.inventory[itemId] || 0) + qty;
                });

                const completionRecord = {
                    completedAt,
                    xp: xpGained,
                    rewards
                };
                taskRecords.push(completionRecord);
                totalCompletions++;
            }

            // Move the activeTask startTime forward to represent the current, in-progress cycle
            const advancedTime = cycles * active.duration;
            const newStart = active.startTime + advancedTime;
            player.activeTask.startTime = Math.min(newStart, now);

            await savePlayer(player.twitchId, player);

            // If they are linked, notify their web client so UI reflects updated inventory/xp
            if (player.linkedWebsimId && networkManager && networkManager.room) {
                networkManager.room.send({
                    type: 'state_update',
                    targetId: player.linkedWebsimId,
                    playerData: player
                });
            }
        }

        if (totalCompletions > 0) {
            appendHostLog(`Offline catch-up applied: ${totalCompletions} task completions simulated while host was offline.`);
        } else {
            appendHostLog('Offline catch-up: no pending task completions detected.');
        }
    } catch (err) {
        console.error('Error applying offline progress', err);
        appendHostLog(`Error applying offline progress: ${err?.message || err}`);
    }
}