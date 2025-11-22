import { SKILLS } from './skills.js';
import { setupHostUI } from './ui-host.js';
import { renderSkillsList } from './ui-skills.js';
import { renderInventory, renderItemGrid } from './ui-inventory.js';
import { initListeners as initListenersImpl } from './ui-init.js';
import { updateState as updateStateImpl } from './ui-state.js';
import { startProgressLoop as startProgressLoopImpl, stopProgressLoop as stopProgressLoopImpl } from './ui-progress.js';

const ONE_HOUR_MS = 60 * 60 * 1000; // matches server-side energy duration

// Preload woodcutting scene images so they are ready when switching tabs/skills
function preloadWoodcuttingScenes() {
    const scenePaths = [
        'scene_wood_beginner.png',
        'scene_wood_intermediate.png',
        'scene_wood_advanced.png',
        'scene_wood_expert.png',
        'scene_wood_legendary.png'
    ];

    scenePaths.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Preload scavenging scene images so they are ready when switching tabs/skills
function preloadScavengingScenes() {
    const scenePaths = [
        'scene_scav_beginner.png',
        'scene_scav_intermediate.png',
        'scene_scav_advanced.png',
        'scene_scav_expert.png',
        'scene_scav_legendary.png'
    ];

    scenePaths.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// New: preload fishing scene images for tiered fishing regions
function preloadFishingScenes() {
    const scenePaths = [
        'scene_fish_beginner.png',
        'scene_fish_intermediate.png',
        'scene_fish_advanced.png',
        'scene_fish_expert.png',
        'scene_fish_legendary.png'
    ];

    scenePaths.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

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
        // New: remember selected tier in woodcutting UI
        this.woodcuttingActiveTier = 'beginner';
        // New: remember selected tier in scavenging UI
        this.scavengingActiveTier = 'beginner';
        // New: remember selected tier in fishing UI
        this.fishingActiveTier = 'beginner';
        // New: track which skill is currently selected in the UI
        this.currentSkillId = null;
        
        // New: Host spectating mode
        this.spectatingId = null;

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
        
        // Inventory Tabs
        this.tabInventory = document.getElementById('tab-inventory');
        this.tabEquipment = document.getElementById('tab-equipment');
        this.inventoryView = document.getElementById('inventory-view');
        this.equipmentView = document.getElementById('equipment-view');

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

        // Offline Popup Elements
        this.offlinePopup = document.getElementById('offline-popup');
        this.offlineCloseBtn = document.getElementById('offline-close-btn');
        this.offlineCloseX = document.getElementById('offline-close-x');
        this.offlineSuppressBtn = document.getElementById('offline-suppress-btn');
        this.offlineLootGrid = document.getElementById('offline-loot-grid');
        this.offlineSkillInfo = document.getElementById('offline-skill-info');

        // Chat / console elements
        this.chatInput = document.getElementById('chat-input');
        this.chatSendBtn = document.getElementById('chat-send-btn');
        this.chatLog = document.getElementById('host-console-log');
        this.hostConsoleContainer = document.getElementById('host-console-container');

        // Preload woodcutting and scavenging region scenes to avoid flash-on-load when switching
        preloadWoodcuttingScenes();
        preloadScavengingScenes();
        // Also preload fishing regions for smooth tier switching
        preloadFishingScenes();

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
        this.initOfflinePopupListeners(); // Attach offline popup listeners
        this.initChatListeners(); // Attach chat UI listeners
        renderSkillsList(this);
        this.updateAuthUI();
    }

    initOfflinePopupListeners() {
        const closePopup = () => {
            if (this.offlinePopup) this.offlinePopup.style.display = 'none';
        };

        if (this.offlineCloseBtn) this.offlineCloseBtn.onclick = closePopup;
        if (this.offlineCloseX) this.offlineCloseX.onclick = closePopup;

        if (this.offlineSuppressBtn) {
            this.offlineSuppressBtn.onclick = () => {
                localStorage.setItem('sq_suppress_catchup', 'true');
                closePopup();
            };
        }
    }

    // Check if we should show offline earnings based on previous local state
    checkOfflineEarnings(newPlayerData) {
        // Don't show if suppressed
        if (localStorage.getItem('sq_suppress_catchup') === 'true') return;
        
        const rawLast = localStorage.getItem('sq_last_inventory');
        if (!rawLast) {
            // First time load or no history, just save current and return
            if (newPlayerData && newPlayerData.inventory) {
                localStorage.setItem('sq_last_inventory', JSON.stringify(newPlayerData.inventory));
            }
            return;
        }

        let lastInventory = {};
        try {
            lastInventory = JSON.parse(rawLast);
        } catch (e) {
            lastInventory = {};
        }

        const currentInventory = newPlayerData.inventory || {};
        const diff = {};
        let hasDiff = false;

        // Calculate items gained
        for (const [itemId, qty] of Object.entries(currentInventory)) {
            const oldQty = lastInventory[itemId] || 0;
            const gained = qty - oldQty;
            if (gained > 0) {
                diff[itemId] = gained;
                hasDiff = true;
            }
        }

        if (hasDiff) {
            this.showOfflinePopup(diff, newPlayerData);
        }

        // Update local snapshot
        localStorage.setItem('sq_last_inventory', JSON.stringify(currentInventory));
    }

    showOfflinePopup(earnings, playerData) {
        if (!this.offlinePopup) return;

        // Render items
        renderItemGrid(this.offlineLootGrid, earnings);

        // Show active skill text
        if (this.offlineSkillInfo) {
            let text = 'Automated Tasks';
            if (playerData.activeTask) {
                const task = this.getTaskDefById(playerData.activeTask.taskId);
                text = task ? `Currently: ${task.name}` : text;
            } else if (playerData.pausedTask) {
                const task = this.getTaskDefById(playerData.pausedTask.taskId);
                text = task ? `Paused: ${task.name}` : 'Idle';
            }
            this.offlineSkillInfo.innerText = text;
        }

        this.offlinePopup.style.display = 'flex';
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
        initListenersImpl(this);
    }

    updateAuthUI() {
        const hasToken = !!localStorage.getItem('sq_token');
        // If spectating, we are "logged in" as the spectated user visually,
        // but we might want to hide the Link button to avoid confusion.
        // However, the prompt implies returning to "Linked Profile View".
        
        // If spectating, show the spectated user's name/avatar (handled by updateState)
        // but hide the Link button.
        const effectiveToken = this.spectatingId ? true : hasToken;

        if (this.linkAccountBtn) {
            this.linkAccountBtn.style.display = effectiveToken ? 'none' : 'inline-block';
        }

        if (this.userAvatar) {
            this.userAvatar.style.display = effectiveToken ? 'block' : 'none';
        }
        if (this.usernameDisplay) {
            this.usernameDisplay.style.display = effectiveToken ? 'inline-block' : 'none';
            if (!effectiveToken) {
                this.usernameDisplay.innerText = 'Guest';
            }
        }

        // Hide dropdown when not linked or when spectating (host menu handles switching back)
        if (this.clientUserDropdown) {
             if (!hasToken || this.spectatingId) {
                 this.clientUserDropdown.style.display = 'none';
             }
        }
    }

    updateState(playerData) {
        // If spectating, only accept updates for the spectated player
        if (this.spectatingId) {
            if (!playerData || playerData.twitchId !== this.spectatingId) {
                return; 
            }
        } else {
            // If not spectating, verify this is meant for us (should be handled by network layer mostly, 
            // but double check if we get a random object)
        }

        // Always update local inventory cache on state update so "offline" means actual time away
        if (!this.spectatingId && playerData && playerData.inventory) {
            localStorage.setItem('sq_last_inventory', JSON.stringify(playerData.inventory));
        }

        updateStateImpl(this, playerData);
    }

    startProgressLoop(taskData) {
        startProgressLoopImpl(this, taskData);
    }

    stopProgressLoop() {
        stopProgressLoopImpl(this);
    }

    // Host-only helper: inspect another player's profile in the UI
    showPlayerProfile(playerData) {
        if (!playerData) return;
        this.spectatingId = playerData.twitchId;
        this.updateState(playerData);
        this.updateAuthUI();
        
        // Force refresh of the host menu to show "Back" button
        if (this.isHost && typeof this.refreshHostUserMenu === 'function') {
            this.refreshHostUserMenu();
        }
    }

    // Host-only helper: return to own view
    stopSpectating() {
        this.spectatingId = null;
        const token = localStorage.getItem('sq_token');
        if (token) {
            this.network.syncWithToken(token);
        } else {
            // Reset to guest
            this.usernameDisplay.innerText = 'Guest';
            this.energyCount.innerText = '0/12';
            this.energyBarFill.style.width = '0%';
            this.skillsList.innerHTML = '';
            this.inventoryList.innerHTML = '';
            this.activeTaskContainer.style.display = 'none';
            this.updateAuthUI();
        }

        if (this.isHost && typeof this.refreshHostUserMenu === 'function') {
            this.refreshHostUserMenu();
        }
    }

    initChatListeners() {
        if (this.chatInput && this.chatSendBtn) {
            const sendChat = () => {
                const text = this.chatInput.value.trim();
                if (!text) return;

                // Optimistically render own message
                const username =
                    (this.state && this.state.username) ||
                    (this.network.user && (this.network.user.username || this.network.user.name)) ||
                    'You';
                this.appendChatMessage({
                    username,
                    text,
                    self: true
                });

                this.network.sendChatMessage(text);
                this.chatInput.value = '';
            };

            this.chatSendBtn.addEventListener('click', sendChat);
            this.chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendChat();
                }
            });
        }

        // Receive chat messages from network
        this.network.onChatMessage = (data) => {
            // Skip rendering if this message originated from this client;
            // we already rendered it optimistically.
            if (this.network.room && data && data.clientId && data.clientId === this.network.room.clientId) {
                return;
            }

            const isSelf =
                this.network.room &&
                data &&
                data.clientId &&
                data.clientId === this.network.room.clientId;

            this.appendChatMessage({
                username: data.username || 'Player',
                text: data.text || '',
                self: !!isSelf
            });
        };
    }

    appendChatMessage({ username, text, self }) {
        if (!this.chatLog || !text) return;

        // Ensure bottom-aligned layout in chat view by inserting a spacer
        if (this.hostConsoleContainer && this.hostConsoleContainer.classList.contains('chat-view')) {
            let spacer = this.chatLog.querySelector('.chat-spacer');
            if (!spacer) {
                spacer = document.createElement('div');
                spacer.className = 'chat-spacer';
                this.chatLog.insertBefore(spacer, this.chatLog.firstChild);
            }
        }

        const line = document.createElement('div');
        line.className = 'chat-line' + (self ? ' self' : '');
        const userSpan = document.createElement('span');
        userSpan.className = 'chat-user';
        userSpan.textContent = `${username}:`;
        const msgSpan = document.createElement('span');
        msgSpan.textContent = text;
        line.appendChild(userSpan);
        line.appendChild(msgSpan);
        this.chatLog.appendChild(line);
        this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }
}