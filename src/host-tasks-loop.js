import { savePlayer, getAllPlayers } from './db.js';
import { SKILLS } from './skills.js';
import { appendHostLog, ONE_HOUR_MS } from './network-common.js';
import { resolveTaskRewards, rollDistributedTask } from './host-tasks-rewards.js';

// Background loop: check all players for finished tasks and mark them complete
export function startTaskCompletionLoop(networkManager) {
    if (!networkManager.isHost || networkManager.taskCompletionInterval) return;

    const room = networkManager.room;

    networkManager.taskCompletionInterval = setInterval(async () => {
        try {
            const now = Date.now();
            const players = await getAllPlayers();

            for (const player of players) {
                // Ensure legacy safe structures
                if (!Array.isArray(player.energy)) player.energy = [];
                if (!player.inventory) player.inventory = {};
                if (!player.skills) player.skills = {};
                if (player.activeEnergy && !player.activeEnergy.startTime && typeof player.activeEnergy.consumedMs !== 'number') {
                    player.activeEnergy = null;
                }
                // Normalize new persisted stop/start fields
                if (typeof player.manualStop !== 'boolean') player.manualStop = false;
                if (player.pausedTask && !player.pausedTask.taskId) player.pausedTask = null;

                // Handle energy expiry and drain only while active
                if (player.activeEnergy) {
                    // New model: activeEnergy.consumedMs only increases while a task is active
                    if (typeof player.activeEnergy.consumedMs !== 'number') {
                        // Legacy fallback from old startTime model
                        if (player.activeEnergy.startTime) {
                            player.activeEnergy.consumedMs = Math.min(
                                ONE_HOUR_MS,
                                now - (player.activeEnergy.startTime || 0)
                            );
                        } else {
                            player.activeEnergy.consumedMs = 0;
                        }
                    }

                    if (player.activeTask) {
                        // Drain 1s of energy per loop while active
                        player.activeEnergy.consumedMs = Math.min(
                            ONE_HOUR_MS,
                            (player.activeEnergy.consumedMs || 0) + 1000
                        );
                    }

                    const consumed = player.activeEnergy.consumedMs || 0;
                    const expired = consumed >= ONE_HOUR_MS;

                    if (expired) {
                        appendHostLog(`Background: active energy expired for ${player.username}.`);
                        player.activeEnergy = null;

                        // If the player is still doing a task and has stored energy, auto-activate the next cell
                        if (player.activeTask && player.energy.length > 0) {
                            player.energy.shift(); // consume next stored energy
                            player.activeEnergy = { consumedMs: 0 };
                            appendHostLog(
                                `Background: new energy cell auto-activated for ${player.username} (1h of active time).`
                            );
                        }
                    }
                }

                const active = player.activeTask;
                const elapsed = active ? now - (active.startTime || 0) : 0;

                if (active && elapsed >= (active.duration || 0)) {
                    // Determine which skill this task belongs to and its definition
                    const taskId = active.taskId;
                    let skillId = null;
                    let taskDef = null;
                    let owningSkill = null;

                    for (const [sid, skill] of Object.entries(SKILLS)) {
                        const found = skill.tasks.find(t => t.id === taskId);
                        if (found) {
                            skillId = sid;
                            taskDef = found;
                            owningSkill = skill;
                            break;
                        }
                    }

                    const completedAt = now;

                    if (skillId) {
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

                        let xpGained = 0;
                        let rewards = {};

                        // Handle Distributed Gather Tasks (Dynamic Rewards)
                        if (active.meta && active.meta.resolvedTaskIds && Array.isArray(active.meta.resolvedTaskIds)) {
                            active.meta.resolvedTaskIds.forEach(subTaskId => {
                                const subTaskDef = owningSkill.tasks.find(t => t.id === subTaskId);
                                if (subTaskDef) {
                                    xpGained += (subTaskDef.xp || 0);
                                    const subRewards = resolveTaskRewards(subTaskDef);
                                    Object.entries(subRewards).forEach(([itemId, qty]) => {
                                        rewards[itemId] = (rewards[itemId] || 0) + qty;
                                    });
                                }
                            });
                        } else {
                            // Standard Task
                            xpGained = taskDef?.xp ?? 0;
                            rewards = resolveTaskRewards(taskDef);
                        }

                        // Update inventory
                        Object.entries(rewards).forEach(([itemId, qty]) => {
                            player.inventory[itemId] = (player.inventory[itemId] || 0) + qty;
                        });

                        // Append completion record
                        const completionRecord = {
                            completedAt,
                            xp: xpGained,
                            rewards
                        };

                        player.skills[skillId].tasks[taskId].push(completionRecord);

                        appendHostLog(
                            `Task "${taskId}" completed for ${player.username} at ${new Date(
                                completedAt
                            ).toLocaleTimeString()} (XP: ${xpGained}, Rewards: ${JSON.stringify(rewards)}).`
                        );
                    } else {
                        appendHostLog(
                            `Task "${taskId}" completed for ${player.username} but no matching skill was found.`
                        );
                    }

                    // AUTO-RESTART: Check energy to decide if we loop or stop
                    let hasEnergy = false;

                    // 1. Check currently active cell
                    if (player.activeEnergy && (player.activeEnergy.consumedMs || 0) < ONE_HOUR_MS) {
                        hasEnergy = true;
                    }
                    // 2. Or try to auto-consume a stored cell
                    else if (player.energy.length > 0) {
                        player.energy.shift();
                        player.activeEnergy = { consumedMs: 0 };
                        hasEnergy = true;
                        appendHostLog(`Background: new energy cell auto-activated for ${player.username} (1h active).`);
                    }

                    if (hasEnergy && skillId) {
                        // Restart task: Reset start time to now to begin next cycle
                        player.activeTask.startTime = Date.now();

                        // RE-ROLL DISTRIBUTED TASK: If this is a distributed task, we must
                        // re-roll the sub-tasks and update duration/meta for the NEXT cycle
                        // so it's not the same sub-task repeated forever.
                        if (taskDef.isDistributed && owningSkill) {
                            const roll = rollDistributedTask(player, owningSkill, taskDef);
                            if (roll) {
                                player.activeTask.duration = roll.duration;
                                player.activeTask.meta = roll.meta;
                            }
                        }

                        player.pausedTask = null;
                        player.manualStop = false;
                    } else {
                        // No energy (or invalid task), so we stop
                        if (!hasEnergy) {
                            appendHostLog(`Task "${taskId}" stopped for ${player.username}: Energy depleted.`);
                        }

                        // Save pause state
                        player.pausedTask = {
                            taskId: player.activeTask.taskId,
                            duration: player.activeTask.duration
                        };
                        player.activeTask = null;
                        player.manualStop = false;
                    }
                }

                // Persist any changes (task completion or energy expiry)
                await savePlayer(player.twitchId, player);

                // If they are linked, notify their web client so UI updates
                if (player.linkedWebsimId) {
                    room.send({
                        type: 'state_update',
                        targetId: player.linkedWebsimId,
                        playerData: player
                    });
                }
            }
        } catch (err) {
            console.error('Error in task completion loop', err);
            appendHostLog(`Error in task completion loop: ${err?.message || err}`);
        }
    }, 1000); // check every second
}