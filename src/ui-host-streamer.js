// Streamer mode helpers extracted from ui-host.js

// Helper: compute available energy for a player (mirrors server-side getAvailableEnergyCount)
function getPlayerEnergyCount(player) {
    if (!player) return 0;
    const now = Date.now();
    let active = 0;

    if (player.activeEnergy) {
        if (typeof player.activeEnergy.consumedMs === 'number') {
            if (player.activeEnergy.consumedMs < 60 * 60 * 1000) {
                active = 1;
            }
        } else if (player.activeEnergy.startTime) {
            if (now - (player.activeEnergy.startTime || 0) < 60 * 60 * 1000) {
                active = 1;
            }
        }
    }

    const stored = Array.isArray(player.energy) ? player.energy.length : 0;
    return stored + active;
}

// Helper: choose next viewer in streamer mode
function selectNextStreamerTarget(uiManager, network, { preferDifferent, allowRandom }) {
    const players = Array.isArray(network.lastPlayers) ? network.lastPlayers : [];
    const candidates = players.filter((p) => getPlayerEnergyCount(p) > 0);

    if (!candidates.length) {
        uiManager.streamerCurrentTwitchId = null;
        uiManager.streamerLastRotateAt = Date.now();
        uiManager.stopSpectating();
        return;
    }

    const currentId = uiManager.spectatingId || uiManager.streamerCurrentTwitchId;

    // Prefer users with active tasks (most recent actions), ordered by latest startTime
    const active = candidates
        .filter((p) => p.activeTask && p.activeTask.taskId)
        .sort(
            (a, b) =>
                (b.activeTask.startTime || 0) -
                (a.activeTask.startTime || 0)
        );

    let target = null;

    const pickFromList = (list) => {
        if (!list.length) return null;
        if (preferDifferent && list.length > 1) {
            const different = list.find((p) => p.twitchId !== currentId);
            return different || list[0];
        }
        return list[0];
    };

    target = pickFromList(active);

    // If no active tasks, optionally pick a random candidate
    if (!target && allowRandom) {
        const pool = preferDifferent
            ? candidates.filter((p) => p.twitchId !== currentId)
            : candidates.slice();
        if (pool.length) {
            target = pool[Math.floor(Math.random() * pool.length)];
        }
    }

    if (!target) {
        // Fallback: just keep current view
        return;
    }

    uiManager.streamerCurrentTwitchId = target.twitchId;
    uiManager.streamerLastRotateAt = Date.now();

    if (typeof uiManager.showPlayerProfile === 'function') {
        uiManager.showPlayerProfile(target);
    }
}

export function setupStreamerMode(uiManager, network) {
    const streamerToggleBtn = document.getElementById('host-streamer-toggle');
    if (streamerToggleBtn) {
        streamerToggleBtn.style.display = 'inline-block';

        const updateStreamerToggleLabel = () => {
            streamerToggleBtn.textContent = uiManager.streamerMode ? 'Streamer: On' : 'Streamer: Off';
            streamerToggleBtn.classList.toggle('active', !!uiManager.streamerMode);
        };

        const disableStreamerMode = () => {
            uiManager.streamerMode = false;
            uiManager.streamerCurrentTwitchId = null;
            uiManager.streamerLastRotateAt = 0;
            uiManager.streamerLastTaskSignatureByPlayer = {};
            updateStreamerToggleLabel();
            // When leaving streamer mode, stop spectating and return to own profile (if any)
            uiManager.stopSpectating();
        };

        const enableStreamerMode = () => {
            uiManager.streamerMode = true;
            uiManager.streamerLastRotateAt = Date.now();
            updateStreamerToggleLabel();
            // Immediately jump to an appropriate starting viewer
            selectNextStreamerTarget(uiManager, network, { preferDifferent: false, allowRandom: true });
        };

        streamerToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (uiManager.streamerMode) {
                disableStreamerMode();
            } else {
                enableStreamerMode();
            }
        });

        // Expose helpers so other host UI logic can drive streamer mode
        uiManager._updateStreamerToggleLabel = updateStreamerToggleLabel;
        uiManager.disableStreamerMode = disableStreamerMode;
        uiManager.enableStreamerMode = enableStreamerMode;
    }

    // Listen for global database saves to update UI if spectating and drive streamer mode
    window.addEventListener('sq:player_update', (e) => {
        const p = e.detail;
        if (!p) return;
        const now = Date.now();

        if (uiManager.spectatingId === p.twitchId) {
             // When first switching to a user, suppress the initial backlog of rewards,
             // then show incremental rewards for subsequent updates.
             const suppressRewards = !uiManager.spectateFirstUpdateSeen;
             uiManager.spectateFirstUpdateSeen = true;
             uiManager.updateState(p, { suppressRewards });
        }

        // Streamer mode: track task signatures and react to actions
        if (uiManager.isHost && uiManager.streamerMode && p && p.twitchId) {
            const prevSig = uiManager.streamerLastTaskSignatureByPlayer[p.twitchId] || '';
            const taskId = p.activeTask ? p.activeTask.taskId || '' : '';
            const startTime = p.activeTask ? p.activeTask.startTime || 0 : 0;
            const newSig = `${taskId}|${startTime}`;

            uiManager.streamerLastTaskSignatureByPlayer[p.twitchId] = newSig;

            const hasEnergy = getPlayerEnergyCount(p) > 0;

            // If current viewer just ran out of energy, schedule a rotation instead of switching immediately
            if (uiManager.spectatingId === p.twitchId && !hasEnergy) {
                uiManager.streamerNeedsRotate = true;
                return;
            }

            // NOTE: We no longer auto-rotate immediately on task completion for the current viewer.
            // Rotation is now time-throttled and handled by the periodic streamer interval.

            // If some other player just started a task (no task before, task now) and has energy,
            // treat them as "most recent command user" and mark them as a pending target.
            const prevTaskId = prevSig.split('|')[0] || '';
            if (p.twitchId !== uiManager.spectatingId && !prevTaskId && taskId && hasEnergy) {
                uiManager.streamerPendingTargetId = p.twitchId;
                uiManager.streamerPendingTargetTs = now;
            }
        }
    });

    // Periodic Streamer Mode driver (host only)
    if (uiManager.isHost && !uiManager.streamerInterval) {
        uiManager.streamerInterval = setInterval(() => {
            if (!uiManager.streamerMode) return;

            const players = Array.isArray(network.lastPlayers) ? network.lastPlayers : [];
            const candidates = players.filter((p) => getPlayerEnergyCount(p) > 0);

            // If no one has any energy, show no user until someone has energy
            if (!candidates.length) {
                if (uiManager.spectatingId) {
                    uiManager.streamerCurrentTwitchId = null;
                    uiManager.streamerLastRotateAt = Date.now();
                    uiManager.stopSpectating();
                }
                return;
            }

            const now = Date.now();
            const sinceLastRotate = now - (uiManager.streamerLastRotateAt || 0);

            // 1) If we have a pending "most recent command" target, and it's been at least 5s,
            //    switch to that user.
            if (uiManager.streamerPendingTargetId && sinceLastRotate >= 5000) {
                const target = candidates.find(
                    (p) => p.twitchId === uiManager.streamerPendingTargetId
                );
                if (target) {
                    uiManager.streamerCurrentTwitchId = target.twitchId;
                    uiManager.streamerLastRotateAt = now;
                    uiManager.streamerNeedsRotate = false;
                    if (typeof uiManager.showPlayerProfile === 'function') {
                        uiManager.showPlayerProfile(target);
                    }
                }
                // Clear pending target regardless, so we don't get stuck
                uiManager.streamerPendingTargetId = null;
                uiManager.streamerPendingTargetTs = 0;
                return;
            }

            // 2) If we need to rotate away from the current viewer (e.g., they ran out of energy),
            //    do so once 5s have passed since the last switch.
            if (uiManager.streamerNeedsRotate && sinceLastRotate >= 5000) {
                uiManager.streamerNeedsRotate = false;
                selectNextStreamerTarget(uiManager, network, {
                    preferDifferent: true,
                    allowRandom: true
                });
                return;
            }

            // 3) If no recent commands triggered a pending target, and no rotation has happened
            //    for 25s, auto-switch to another active user.
            const elapsed = sinceLastRotate;
            if (elapsed >= 25000) {
                selectNextStreamerTarget(uiManager, network, {
                    preferDifferent: true,
                    allowRandom: true
                });
            }
        }, 3000);
    }
}