import { savePlayer, getAllPlayers } from './db.js';
import { SKILLS } from './skills.js';
import { appendHostLog } from './network-common.js';
import { resolveTaskRewards, rollDistributedTask } from './host-tasks-rewards.js';

const ONE_HOUR_MS = 60 * 60 * 1000;

// Helper: rebuild activeEnergy + stored energy cells from a remaining ms budget
function rebuildEnergyFromRemaining(player, remainingMs, now, hasActiveTask = false) {
    if (remainingMs <= 0) {
        player.activeEnergy = null;
        player.energy = [];
        return;
    }

    // Total whole cells + leftover time
    const fullCells = Math.floor(remainingMs / ONE_HOUR_MS);
    const leftoverMs = remainingMs % ONE_HOUR_MS;

    let storedCells = fullCells;
    let activeConsumedMs = null;

    if (leftoverMs > 0) {
        // We are partway through an active cell, plus some full stored cells
        activeConsumedMs = ONE_HOUR_MS - leftoverMs;
    } else if (fullCells > 0 && hasActiveTask) {
        // Exact boundary, but we still have an active task: treat one fresh cell as active
        activeConsumedMs = 0;
        storedCells = fullCells - 1;
    }

    if (storedCells < 0) storedCells = 0;

    // Simulate stored cell timestamps in the past so they line up with how the hours
    // would have been consumed over time instead of stamping everything with "now".
    // Oldest remaining cell sits furthest in the past.
    player.energy = [];
    for (let i = 0; i < storedCells; i++) {
        // RemainingMs covers all future energy; each stored cell represents a full hour.
        // Place the timestamps such that the newest stored cell is closest to "now".
        const cellOffsetFromEnd = (storedCells - 1 - i) * ONE_HOUR_MS;
        const ts = now - cellOffsetFromEnd;
        player.energy.push(ts);
    }

    if (activeConsumedMs !== null) {
        player.activeEnergy = { consumedMs: activeConsumedMs };
    } else {
        player.activeEnergy = null;
    }
}

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
            if (elapsed <= 0) {
                // Nothing to catch up (host restarted immediately)
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

            // --- ENERGY MODEL FOR OFFLINE TIME ---
            // Determine total remaining "active task time" based on energy cells

            // Normalize activeEnergy.consumedMs for legacy records
            let activeConsumedMs = 0;
            let hadActiveEnergy = false;
            if (player.activeEnergy) {
                hadActiveEnergy = true;
                if (typeof player.activeEnergy.consumedMs === 'number') {
                    activeConsumedMs = Math.min(
                        ONE_HOUR_MS,
                        Math.max(0, player.activeEnergy.consumedMs || 0)
                    );
                } else if (player.activeEnergy.startTime) {
                    activeConsumedMs = Math.min(
                        ONE_HOUR_MS,
                        Math.max(0, now - (player.activeEnergy.startTime || 0))
                    );
                }
            }

            const storedCells = Array.isArray(player.energy) ? player.energy.length : 0;
            const totalCellsInitial = (hadActiveEnergy ? 1 : 0) + storedCells;

            // No energy at all: task should not have progressed offline
            if (totalCellsInitial <= 0) {
                // Task cannot run without energy: put user into idle for that task
                player.pausedTask = {
                    taskId: active.taskId,
                    duration: active.duration
                };
                player.activeTask = null;
                await savePlayer(player.twitchId, player);
                continue;
            }

            // Total future active time available from all cells (in ms)
            const availableMsTotal =
                (hadActiveEnergy ? (ONE_HOUR_MS - activeConsumedMs) : 0) +
                (storedCells * ONE_HOUR_MS);

            if (availableMsTotal <= 0) {
                // All energy already effectively consumed: stop task and idle
                player.activeEnergy = null;
                player.energy = [];
                player.pausedTask = {
                    taskId: active.taskId,
                    duration: active.duration
                };
                player.activeTask = null;
                await savePlayer(player.twitchId, player);
                continue;
            }

            // Active task time while host was offline cannot exceed either elapsed time or available energy time
            const activeMs = Math.min(elapsed, availableMsTotal);

            // How many full task cycles fit into the activeMs window?
            let cycles = Math.floor(activeMs / (active.duration || 1));
            if (cycles <= 0) {
                // No full completions, but we still advanced the clock for energy.
                // Re-map remaining energy and task start time based on partial progress.

                const remainingEnergyMs = availableMsTotal - activeMs;
                const stillHasTask = remainingEnergyMs > 0;
                rebuildEnergyFromRemaining(player, remainingEnergyMs, now, stillHasTask);

                if (!stillHasTask) {
                    player.pausedTask = {
                        taskId: active.taskId,
                        duration: active.duration
                    };
                    player.activeTask = null;
                } else {
                    // Task still in progress: adjust start time so progress matches elapsed portion
                    player.activeTask.startTime = active.startTime + activeMs;
                }

                await savePlayer(player.twitchId, player);

                if (player.linkedWebsimId && networkManager && networkManager.room) {
                    networkManager.room.send({
                        type: 'state_update',
                        targetId: player.linkedWebsimId,
                        playerData: player
                    });
                }
                continue;
            }

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

            // Apply energy consumption over the activeMs window used for these cycles
            const energyConsumedMs = activeMs;
            let remainingEnergyMs = availableMsTotal - energyConsumedMs;
            if (remainingEnergyMs < 0) remainingEnergyMs = 0;

            if (remainingEnergyMs <= 0) {
                // All energy spent: clear cells and stop the task (idle)
                player.activeEnergy = null;
                player.energy = [];
                player.pausedTask = {
                    taskId: player.activeTask.taskId,
                    duration: player.activeTask.duration
                };
                player.activeTask = null;
            } else {
                // Rebuild energy cells from remainingEnergyMs, keeping one active cell if task continues
                const stillHasTask = true;
                rebuildEnergyFromRemaining(player, remainingEnergyMs, now, stillHasTask);

                // Move the activeTask startTime forward so the current cycle reflects remaining progress
                const usedForCyclesMs = cycles * active.duration;
                const leftoverTaskMs = activeMs - usedForCyclesMs;
                const newStart = active.startTime + usedForCyclesMs;
                player.activeTask.startTime = Math.min(newStart + leftoverTaskMs, now);
            }

            await savePlayer(player.twitchId, player);

            // If they are linked, notify their web client so UI reflects updated inventory/xp/energy
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