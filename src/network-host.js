import { savePlayer, getPlayer, getAllPlayers } from './db.js';
import { SKILLS } from './skills.js';
import { appendHostLog, ONE_HOUR_MS, getAvailableEnergyCount, normalizeActiveEnergy } from './network-common.js';

// Helper: random integer between min and max inclusive
function randomInt(min, max) {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

// Helper: resolve rewards for a completed task based on its reward definition
function resolveTaskRewards(taskDef) {
    const rewards = {};
    if (!taskDef || !taskDef.reward) return rewards;

    const r = taskDef.reward;

    if (r.type === 'quantity') {
        const qty = randomInt(r.min, r.max);
        if (qty > 0) {
            rewards[r.itemId] = (rewards[r.itemId] || 0) + qty;
        }
    } else if (r.type === 'lootTable' && Array.isArray(r.table)) {
        r.table.forEach(entry => {
            if (Math.random() <= (entry.chance ?? 0)) {
                const qty = randomInt(entry.min ?? 1, entry.max ?? 1);
                if (qty > 0) {
                    rewards[entry.itemId] = (rewards[entry.itemId] || 0) + qty;
                }
            }
        });
    }

    return rewards;
}

// Host-only message handler wiring
export function setupHostListeners(networkManager) {
    const room = networkManager.room;

    room.onmessage = async (event) => {
        const data = event.data;
        const senderId = data.clientId; // WebSim client ID

        // Ignore directed messages not meant for this host client
        if (data.targetId && data.targetId !== room.clientId) return;

        // Host handles both host-specific and client-style messages

        if (data.type === 'link_code_generated') {
            appendHostLog(`Generated link code "${data.code}" for WebSim client ${senderId}.`);
            if (networkManager.onLinkCode) networkManager.onLinkCode(data.code);
            return;
        } else if (data.type === 'link_success') {
            // Store token locally (host can also be a linked client)
            if (data.token) {
                localStorage.setItem('sq_token', data.token);
            }
            appendHostLog(`Host received link_success for a client.`);
            if (networkManager.onLinkSuccess && data.playerData) networkManager.onLinkSuccess(data.playerData);
            return;
        } else if (data.type === 'sync_data' || data.type === 'state_update' || data.type === 'energy_update') {
            if (data.playerData && networkManager.onStateUpdate) {
                networkManager.onStateUpdate(data.playerData);
            }
            return;
        } else if (data.type === 'token_invalid') {
            // Host's local client token was rejected/expired
            localStorage.removeItem('sq_token');
            if (networkManager.onTokenInvalid) networkManager.onTokenInvalid();
            return;
        }

        if (data.type === 'request_link_code') {
            // Generate 6-character code
            const code = networkManager.generateLinkCode();
            networkManager.pendingLinks[code] = {
                websimClientId: senderId,
                createdAt: Date.now()
            };
            appendHostLog(`Link code "${code}" created for WebSim client ${senderId}.`);

            room.send({
                type: 'link_code_generated',
                targetId: senderId,
                code: code
            });
        } else if (data.type === 'sync_request') {
            // Verify token
            const player = await networkManager.validateToken(data.token);
            if (player) {
                // Update link if changed
                if (player.linkedWebsimId !== senderId) {
                    player.linkedWebsimId = senderId;
                    await savePlayer(player.twitchId, player);
                    appendHostLog(`Sync updated link for ${player.username} to WebSim client ${senderId}.`);
                }

                room.send({
                    type: 'sync_data',
                    targetId: senderId,
                    playerData: player
                });
            } else {
                appendHostLog(`sync_request from ${senderId} failed token validation (expired/invalid).`);
                room.send({
                    type: 'token_invalid',
                    targetId: senderId
                });
            }
        } else if (data.type === 'start_task') {
            const player = await networkManager.validateToken(data.token);
            if (player) {
                // Normalize legacy structures
                if (!Array.isArray(player.energy)) player.energy = [];
                if (!player.inventory) player.inventory = {};
                if (player.activeEnergy && !player.activeEnergy.startTime) {
                    player.activeEnergy = null;
                }

                // Clear expired active energy if needed
                await normalizeActiveEnergy(player);

                const now = Date.now();
                const totalAvailable = getAvailableEnergyCount(player);
                if (totalAvailable <= 0) {
                    appendHostLog(`Task start denied for ${player.username}: no energy (pool empty and no active cell).`);
                    // Optionally, notify the client of denial
                } else {
                    // If no active energy cell, activate one by consuming stored energy
                    const hasActiveEnergy =
                        player.activeEnergy &&
                        (now - (player.activeEnergy.startTime || 0)) < ONE_HOUR_MS;

                    if (!hasActiveEnergy) {
                        if (player.energy.length > 0) {
                            player.energy.shift(); // consume one stored energy
                            player.activeEnergy = { startTime: now };
                            appendHostLog(`Energy cell activated for ${player.username} (expires in 1h).`);
                        } else {
                            // This should not happen due to totalAvailable > 0, but guard anyway
                            appendHostLog(
                                `Task start denied for ${player.username}: race condition left no stored energy.`
                            );
                            await savePlayer(player.twitchId, player);
                            return;
                        }
                    }

                    // Set Task (uses current active energy cell, but does not consume additional charges)
                    player.activeTask = {
                        taskId: data.taskId,
                        startTime: now,
                        duration: data.duration
                    };

                    await savePlayer(player.twitchId, player);
                    appendHostLog(`Task "${data.taskId}" started for ${player.username}.`);

                    // Broadcast update
                    room.send({
                        type: 'state_update',
                        targetId: senderId,
                        playerData: player
                    });
                }
            } else {
                appendHostLog(`start_task from ${senderId} failed token validation (expired/invalid).`);
                room.send({
                    type: 'token_invalid',
                    targetId: senderId
                });
            }
        } else if (data.type === 'stop_task') {
            const player = await networkManager.validateToken(data.token);
            if (player) {
                appendHostLog(`Task "${player.activeTask?.taskId || 'unknown'}" stopped for ${player.username}.`);
                player.activeTask = null;
                await savePlayer(player.twitchId, player);
                room.send({
                    type: 'state_update',
                    targetId: senderId,
                    playerData: player
                });
            } else {
                appendHostLog(`stop_task from ${senderId} failed token validation (expired/invalid).`);
                room.send({
                    type: 'token_invalid',
                    targetId: senderId
                });
            }
        } else if (data.type === 'client_delink') {
            // A client (or host) is requesting to de-link their Twitch account
            const player = await networkManager.validateToken(data.token);
            if (player) {
                appendHostLog(`De-link requested for ${player.username}. Clearing linked WebSim client.`);
                player.linkedWebsimId = null;
                await savePlayer(player.twitchId, player);

                // Tell that client their token is no longer valid
                room.send({
                    type: 'token_invalid',
                    targetId: senderId
                });

                // Refresh Twitch user list so UI reflects de-link
                networkManager.refreshPlayerList();
            } else {
                appendHostLog(`client_delink from ${senderId} failed token validation (expired/invalid).`);
            }
        }
    };
}

export function setupPresenceWatcher(networkManager) {
    const room = networkManager.room;

    // Host tracks realtime Websim users
    room.subscribePresence(() => {
        if (!networkManager.onPresenceUpdate) return;
        const peers = Object.entries(room.peers || {}).map(([id, info]) => ({
            id,
            username: info.username
        }));
        networkManager.onPresenceUpdate(peers);
        // Also refresh Twitch users list so linked WebSim usernames stay up to date
        networkManager.refreshPlayerList();
    });

    // Initial fire
    if (networkManager.onPresenceUpdate) {
        const peers = Object.entries(room.peers || {}).map(([id, info]) => ({
            id,
            username: info.username
        }));
        networkManager.onPresenceUpdate(peers);
    }
}

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
                if (player.activeEnergy && !player.activeEnergy.startTime) {
                    player.activeEnergy = null;
                }

                // Handle energy expiry
                if (player.activeEnergy) {
                    const expired = (now - (player.activeEnergy.startTime || 0)) >= ONE_HOUR_MS;
                    if (expired) {
                        appendHostLog(`Background: active energy expired for ${player.username}.`);
                        player.activeEnergy = null;

                        // If the player is still doing a task and has stored energy, auto-activate the next cell
                        if (player.activeTask && player.energy.length > 0) {
                            player.energy.shift(); // consume next stored energy
                            player.activeEnergy = { startTime: now };
                            appendHostLog(
                                `Background: new energy cell auto-activated for ${player.username} (expires in 1h).`
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

                    for (const [sid, skill] of Object.entries(SKILLS)) {
                        const found = skill.tasks.find(t => t.id === taskId);
                        if (found) {
                            skillId = sid;
                            taskDef = found;
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

                        // Resolve rewards and XP
                        const xpGained = taskDef?.xp ?? 0;
                        const rewards = resolveTaskRewards(taskDef);

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

                    // Clear active task
                    player.activeTask = null;
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