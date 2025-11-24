import { SKILLS } from './skills.js';
import { setupHostUI } from './ui-host.js';
import { renderSkillsList } from './ui-skills.js';
import { renderInventory, renderItemGrid, ITEM_ICONS } from './ui-inventory.js';
import { initListeners as initListenersImpl } from './ui-init.js';
import { updateState as updateStateImpl } from './ui-state.js';
import { startProgressLoop as startProgressLoopImpl, stopProgressLoop as stopProgressLoopImpl } from './ui-progress.js';
import { preloadGameAssets } from './ui-assets.js';
import { initChatListeners, appendChatMessage } from './ui-chat.js';
import { initOfflinePopupListeners, checkOfflineEarnings, showOfflinePopup } from './ui-offline.js';
import { showPlayerProfile, stopSpectating } from './ui-spectate.js';

const ONE_HOUR_MS = 60 * 60 * 1000; // matches server-side energy duration

// Re-export preload so main.js doesn't break
export { preloadGameAssets };

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
        // New: remember selected tier in mining UI
        this.miningActiveTier = 'tier1';
        // New: remember selected tier in scavenging UI
        this.scavengingActiveTier = 'beginner';
        // New: remember selected tier in fishing UI
        this.fishingActiveTier = 'beginner';
        // New: track which skill is currently selected in the UI
        this.currentSkillId = null;
        
        // New: Host spectating mode
        this.spectatingId = null;
        // New: track whether we've already applied one live update for the currently spectated user
        this.spectateFirstUpdateSeen = false;

        // New: Streamer mode state (host only)
        this.streamerMode = false;
        this.streamerCurrentTwitchId = null;
        this.streamerLastRotateAt = 0;
        this.streamerLastTaskSignatureByPlayer = {};
        this.streamerInterval = null;

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

        // New: console collapse controls
        this.hostConsoleCollapseBtn = document.getElementById('host-console-collapse-btn');
        this.hostConsoleFloatingToggle = document.getElementById('host-console-floating-toggle');

        // Ensure default PFP is used for all users
        if (this.userAvatar) {
            this.userAvatar.src = 'user_default_pfp.png';
            this.userAvatar.alt = 'Stream Quest Adventurer';
        }

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
        initOfflinePopupListeners(this);
    }

    // Check if we should show offline earnings based on previous local state
    checkOfflineEarnings(newPlayerData) {
        checkOfflineEarnings(this, newPlayerData);
    }

    showOfflinePopup(earnings, playerData) {
        showOfflinePopup(this, earnings, playerData);
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

    updateState(playerData, options = {}) {
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

        updateStateImpl(this, playerData, options);
    }

    startProgressLoop(taskData) {
        startProgressLoopImpl(this, taskData);
    }

    stopProgressLoop() {
        stopProgressLoopImpl(this);
    }

    // Host-only helper: inspect another player's profile in the UI
    showPlayerProfile(playerData) {
        showPlayerProfile(this, playerData);
    }

    // Host-only helper: return to own view
    stopSpectating() {
        stopSpectating(this);
    }

    initChatListeners() {
        initChatListeners(this);
    }

    appendChatMessage(args) {
        appendChatMessage(this, args);
    }
}