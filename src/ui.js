import { SKILLS } from './skills.js';
import { setupHostUI } from './ui-host.js';
import { renderSkillsList, showSkillDetails, findSkillByTaskId, findSkillByName } from './ui-skills.js';
import { renderInventory } from './ui-inventory.js';

const ONE_HOUR_MS = 60 * 60 * 1000; // matches server-side energy duration

export class UIManager {
    constructor(networkManager, isHost = false) {
        this.network = networkManager;
        this.state = null;
        this.activeTaskInterval = null;
        this.isHost = isHost;
        this.currentEnergyStartTime = null; // legacy tracker, no longer used for timing
        // Local mirrors of persisted state for convenience
        this._manualStop = false; // mirrors playerData.manualStop
        this._lastTask = null;    // mirrors playerData.pausedTask or activeTask
        this._isIdle = false;     // derived from playerData.pausedTask

        // Elements
        this.skillsList = document.getElementById('skills-list');
        this.authOverlay = document.getElementById('auth-overlay');
        this.skillDetails = document.getElementById('skill-details');
        this.activeTaskContainer = document.getElementById('active-task-container');
        this.energyCount = document.getElementById('energy-count');
        this.energyBarFill = document.getElementById('energy-cell-bar');
        this.energyBarBg = document.getElementById('energy-cell-bar-bg');
        this.usernameDisplay = document.getElementById('username');
        this.userAvatar = document.getElementById('user-avatar');
        this.linkAccountBtn = document.getElementById('link-account-btn');
        this.inventoryList = document.getElementById('inventory-list');

        // Host-specific elements
        this.hostUserMenu = document.getElementById('host-user-menu');
        this.hostUserBtn = document.getElementById('host-user-btn');
        this.hostUserDropdown = document.getElementById('host-user-dropdown');
        this.realtimeUsersList = document.getElementById('realtime-users-list');
        this.twitchUsersList = document.getElementById('twitch-users-list');

        // Host data export/import controls
        this.exportDataBtn = document.getElementById('export-data-btn');
        this.importDataBtn = document.getElementById('import-data-btn');
        this.importDataInput = document.getElementById('import-data-input');

        // Client user dropdown elements (also used by host now)
        this.userInfoEl = document.getElementById('user-info');
        this.clientUserDropdown = document.getElementById('client-user-dropdown');
        this.clientDelinkBtn = document.getElementById('client-delink-btn');

        // Pre-fill host channel if saved
        const savedChannel = localStorage.getItem('sq_host_channel');
        const channelInput = document.getElementById('twitch-channel-input');
        if (savedChannel && channelInput) {
            channelInput.value = savedChannel;
        }

        // Host UI visibility and wiring
        if (this.isHost) {
            setupHostUI(this);
        }

        this.initListeners();
        renderSkillsList(this);
        this.updateAuthUI();
    }

    // Helper: compute available energy from player state
    computeEnergyCount(playerData) {
        if (!playerData) return 0;
        const now = Date.now();
        let active = 0;

        if (playerData.activeEnergy) {
            if (typeof playerData.activeEnergy.consumedMs === 'number') {
                if (playerData.activeEnergy.consumedMs < ONE_HOUR_MS) {
                    active = 1;
                }
            } else if (playerData.activeEnergy.startTime) {
                if (now - (playerData.activeEnergy.startTime || 0) < ONE_HOUR_MS) {
                    active = 1;
                }
            }
        }

        const stored = Array.isArray(playerData.energy) ? playerData.energy.length : 0;
        return stored + active;
    }

    // Helper: get task definition by ID
    getTaskDefById(taskId) {
        if (!taskId) return null;
        for (const skill of Object.values(SKILLS)) {
            const t = skill.tasks.find((t) => t.id === taskId);
            if (t) return t;
        }
        return null;
    }

    initListeners() {
        const connectBtn = document.getElementById('connect-twitch-btn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                const channel = document.getElementById('twitch-channel-input').value;
                if (channel) {
                    this.network.connectTwitch(channel);
                    document.getElementById('tmi-status').innerText = 'Status: Connected to ' + channel;
                    document.getElementById('tmi-status').style.color = '#4ade80';

                    // After the host connects to a Twitch channel, attempt auto-sync
                    const token = localStorage.getItem('sq_token');
                    if (token) {
                        this.network.syncWithToken(token);
                    }
                }
            });
        }

        document.getElementById('stop-btn').addEventListener('click', () => {
            const stopBtn = document.getElementById('stop-btn');
            const labelEl = document.getElementById('task-label');
            const progressEl = document.getElementById('task-progress');

            // If we are currently in idle mode for a previous task, clicking acts as "Start"
            if (this._isIdle && this.state && this.state.pausedTask) {
                const paused = this.state.pausedTask;
                const taskDef = this.getTaskDefById(paused.taskId);
                const duration = paused.duration || taskDef?.duration;

                if (duration && paused.taskId) {
                    // UI hint immediately; authoritative state will come from host
                    if (stopBtn) stopBtn.innerText = 'STOP';
                    if (labelEl && taskDef) labelEl.innerText = taskDef.name;
                    if (progressEl) progressEl.style.width = '0%';

                    this.network.startTask(paused.taskId, duration);
                }
                return;
            }

            // Normal behavior: going from active to idle; host will persist pausedTask/manualStop
            if (this.state && this.state.activeTask) {
                const currentTask = this.state.activeTask;
                const taskDef = this.getTaskDefById(currentTask.taskId);
                const taskName = taskDef ? taskDef.name : currentTask.taskId || 'Task';

                if (labelEl) {
                    labelEl.innerText = `Idle ~ ${taskName}`;
                }
                if (progressEl) {
                    progressEl.style.width = '0%';
                }
                if (stopBtn) {
                    stopBtn.innerText = 'Start';
                }

                // Stop the local progress animation immediately
                this.stopProgressLoop();
            }

            this.network.stopTask();
        });

        // Top-right link button (host + client)
        if (this.linkAccountBtn) {
            this.linkAccountBtn.addEventListener('click', () => {
                this.network.requestLinkCode();
                if (this.authOverlay) {
                    this.authOverlay.style.display = 'flex';
                }
            });
        }

        // removed inline host dropdown/menu wiring (moved to setupHostUI) {}

        // User dropdown interactions (both host and clients)
        if (this.userInfoEl && this.clientUserDropdown) {
            this.userInfoEl.addEventListener('click', (e) => {
                // Avoid toggling when clicking inside the dropdown content
                if (this.clientUserDropdown.contains(e.target)) return;
                const hasToken = !!localStorage.getItem('sq_token');
                if (!hasToken) return; // no dropdown when not linked
                const isOpen = this.clientUserDropdown.style.display === 'block';
                this.clientUserDropdown.style.display = isOpen ? 'none' : 'block';
            });

            document.addEventListener('click', (e) => {
                if (!this.userInfoEl) return;
                if (!this.userInfoEl.contains(e.target)) {
                    this.clientUserDropdown.style.display = 'none';
                }
            });
        }

        if (this.clientDelinkBtn) {
            this.clientDelinkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // De-Link for host or client: inform host, then clear token and reset UI
                this.network.requestDelink();
                localStorage.removeItem('sq_token');
                if (this.authOverlay) {
                    this.authOverlay.style.display = 'none';
                }
                if (this.clientUserDropdown) {
                    this.clientUserDropdown.style.display = 'none';
                }
                this.updateAuthUI();
            });
        }

        // Host export/import wiring moved to setupHostUI
        // removed inline export/import binding (moved to setupHostUI) {}

        // Network callbacks
        this.network.onLinkCode = (code) => {
            const codeSpan = document.getElementById('link-code');
            if (codeSpan) {
                codeSpan.innerText = code;
            }

            const copyStatusEl = document.getElementById('global-link-copy-status');

            // Copy to clipboard for convenience (host + client)
            if (navigator.clipboard) {
                const linkCommand = `!link ${code}`;
                navigator.clipboard
                    .writeText(linkCommand)
                    .then(() => {
                        if (copyStatusEl) {
                            copyStatusEl.innerText = 'Copied to Clipboard – Paste in Twitch Chat to link';
                            clearTimeout(this._copyStatusTimeout);
                            this._copyStatusTimeout = setTimeout(() => {
                                copyStatusEl.innerText = '';
                            }, 4000);
                        }
                    })
                    .catch(() => {
                        if (copyStatusEl) {
                            copyStatusEl.innerText = '';
                        }
                    });
            }
        };

        this.network.onLinkSuccess = (playerData) => {
            if (this.authOverlay) {
                this.authOverlay.style.display = 'none';
            }
            this.updateState(playerData);
            this.updateAuthUI();
        };

        this.network.onStateUpdate = (playerData) => {
            this.updateState(playerData);
            this.updateAuthUI();
        };

        // When host tells us our token is invalid/expired, force re-link flow
        this.network.onTokenInvalid = () => {
            if (this.authOverlay) {
                this.authOverlay.style.display = 'none';
            }
            this.updateAuthUI();
        };

        // Host presence/player list callbacks are now wired in setupHostUI
        // removed inline network.onPresenceUpdate and onPlayerListUpdate handlers {}
    }

    updateAuthUI() {
        const hasToken = !!localStorage.getItem('sq_token');

        if (this.linkAccountBtn) {
            this.linkAccountBtn.style.display = hasToken ? 'none' : 'inline-block';
        }

        if (this.userAvatar) {
            this.userAvatar.style.display = hasToken ? 'block' : 'none';
        }
        if (this.usernameDisplay) {
            this.usernameDisplay.style.display = hasToken ? 'inline-block' : 'none';
            if (!hasToken) {
                this.usernameDisplay.innerText = 'Guest';
            }
        }

        // Hide dropdown when not linked
        if (!hasToken && this.clientUserDropdown) {
            this.clientUserDropdown.style.display = 'none';
        }
    }

    updateState(playerData) {
        const prevActiveTask = this.state ? this.state.activeTask : null;
        this.state = playerData;

        // Mirror persisted stop/start info into local helpers
        this._manualStop = !!playerData.manualStop;
        this._isIdle = !!playerData.pausedTask;
        this._lastTask = playerData.pausedTask || playerData.activeTask || this._lastTask;

        // Update User Info
        if (this.usernameDisplay && playerData.username) {
            this.usernameDisplay.innerText = playerData.username;
        }

        // Update Energy (stored + active cell)
        const energyCount = this.computeEnergyCount(playerData);
        this.energyCount.innerText = `${energyCount}/12`;

        // Determine if we have an active energy cell (used for auto-restart + UI behavior)
        const now = Date.now();
        const hasActiveEnergy =
            playerData.activeEnergy &&
            (
                typeof playerData.activeEnergy.consumedMs === 'number'
                    ? playerData.activeEnergy.consumedMs < ONE_HOUR_MS
                    : now - (playerData.activeEnergy.startTime || 0) < ONE_HOUR_MS
            );

        // New: detect if we are about to auto-restart the previous task
        const willAutoRestart =
            hasActiveEnergy &&
            prevActiveTask &&
            !playerData.activeTask &&
            !this._manualStop;

        // Update energy cell drain bar (percent + visual state)
        if (this.energyBarFill && this.energyBarBg) {
            const ae = playerData.activeEnergy;
            if (ae && hasActiveEnergy) {
                let consumedMs;

                if (typeof ae.consumedMs === 'number') {
                    consumedMs = ae.consumedMs;
                } else if (ae.startTime && playerData.activeTask) {
                    // Legacy approximation if we still have an old-style startTime
                    consumedMs = Math.max(0, Math.min(ONE_HOUR_MS, now - (ae.startTime || 0)));
                } else {
                    consumedMs = 0;
                }

                let remainingPct = 100 - (consumedMs / ONE_HOUR_MS) * 100;
                if (remainingPct < 0) remainingPct = 0;
                if (remainingPct > 100) remainingPct = 100;
                this.energyBarFill.style.width = `${remainingPct}%`;

                // Treat the bar as "draining" while a task is running OR
                // during the brief auto-restart window to avoid a visual freeze.
                const isDraining = !!(hasActiveEnergy && (playerData.activeTask || willAutoRestart));

                // Toggle classes for visual state
                this.energyBarBg.classList.toggle('draining', isDraining);
                this.energyBarBg.classList.toggle('idle', !isDraining);
                this.energyBarFill.classList.toggle('draining', isDraining);
                this.energyBarFill.classList.toggle('idle', !isDraining);
            } else {
                // No active energy
                this.energyBarFill.style.width = '0%';
                this.energyBarBg.classList.remove('draining', 'idle');
                this.energyBarFill.classList.remove('draining', 'idle');
            }
        }

        // Auto-restart last task while energy cell is active (only when we didn't manually stop)
        if (hasActiveEnergy && prevActiveTask && !playerData.activeTask && !this._manualStop) {
            const taskId = prevActiveTask.taskId;
            let duration = prevActiveTask.duration;

            if (!duration) {
                // Fallback: look up duration from SKILLS if missing on legacy data
                for (const skill of Object.values(SKILLS)) {
                    const t = skill.tasks.find((t) => t.id === taskId);
                    if (t) {
                        duration = t.duration;
                        break;
                    }
                }
            }

            if (taskId && duration) {
                // Start the next iteration immediately and keep UI visible;
                // we'll get a fresh state_update for the new task.
                this.network.startTask(taskId, duration);
                return;
            }
        } else if (!playerData.activeTask && !hasActiveEnergy) {
            // If there is no active task and no active energy, clear any manual-stop suppression
            this._manualStop = false;
            this._isIdle = false;
        }

        // Update Active Task UI
        const shouldShowTaskHeader = !!(playerData.activeTask || hasActiveEnergy || prevActiveTask);
        this.activeTaskContainer.style.display = shouldShowTaskHeader ? 'flex' : 'none';

        const stopBtn = document.getElementById('stop-btn');

        if (playerData.activeTask) {
            // Track the current task as the last task
            this._lastTask = { ...playerData.activeTask };
            this._isIdle = false;
            if (stopBtn) stopBtn.innerText = 'STOP';

            // Only restart the progress loop if the task actually changed
            const taskChanged =
                !prevActiveTask ||
                prevActiveTask.taskId !== playerData.activeTask.taskId ||
                prevActiveTask.startTime !== playerData.activeTask.startTime ||
                prevActiveTask.duration !== playerData.activeTask.duration;

            if (taskChanged) {
                this.startProgressLoop(playerData.activeTask);
            }

            // Update Buttons in current view
            if (this.skillDetails.style.display !== 'none') {
                // Refresh grid to update disabled states
                const activeSkill = findSkillByTaskId(playerData.activeTask.taskId);
                if (activeSkill) {
                    const currentTitle = document.getElementById('detail-name').innerText;
                    const skillOfCurrentView = findSkillByName(currentTitle);
                    if (skillOfCurrentView) showSkillDetails(this, skillOfCurrentView);
                }
            }
        } else {
            // No active task: if we also have no active energy, fully reset UI;
            // otherwise keep the header visible and the bar frozen.
            if (!hasActiveEnergy) {
                this.stopProgressLoop();

                // Refresh grid to re-enable buttons
                const currentTitle = document.getElementById('detail-name').innerText;
                const skillOfCurrentView = findSkillByName(currentTitle);
                if (skillOfCurrentView) showSkillDetails(this, skillOfCurrentView);
            } else if (this._isIdle && this.state && this.state.pausedTask) {
                // When idle for a specific task, ensure the header text/button reflect idle state
                const labelEl = document.getElementById('task-label');
                const taskDef = this.getTaskDefById(this.state.pausedTask.taskId);
                const taskName = taskDef ? taskDef.name : this.state.pausedTask.taskId || 'Task';
                if (labelEl) {
                    labelEl.innerText = `Idle ~ ${taskName}`;
                }
                if (stopBtn) stopBtn.innerText = 'Start';
            }
        }

        // Update inventory panel
        renderInventory(this.inventoryList, playerData);
    }

    startProgressLoop(taskData) {
        this.stopProgressLoop();

        // Find Task Info
        let taskDef = null;
        for (const s of Object.values(SKILLS)) {
            const t = s.tasks.find((t) => t.id === taskData.taskId);
            if (t) {
                taskDef = t;
                break;
            }
        }

        if (!taskDef) return;

        document.getElementById('task-label').innerText = taskDef.name;
        const fill = document.getElementById('task-progress');

        this.activeTaskInterval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - taskData.startTime;
            let pct = (elapsed / taskData.duration) * 100;

            if (pct >= 100) {
                pct = 100;
            }

            fill.style.width = `${pct}%`;
        }, 100);
    }

    stopProgressLoop() {
        if (this.activeTaskInterval) {
            clearInterval(this.activeTaskInterval);
            this.activeTaskInterval = null;
        }
        document.getElementById('task-progress').style.width = '0%';
    }
}