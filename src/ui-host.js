// Host-only UI logic split out of UIManager

import { replaceAllPlayers } from './db.js';
import { setupStreamerMode } from './ui-host-streamer.js';
import { setupPresenceAndPlayerList, renderRealtimeUsers, renderTwitchUsers } from './ui-host-users.js';
import { setupHostExportImport } from './ui-host-export-import.js';

export function setupHostUI(uiManager) {
    const {
        network,
        hostUserMenu,
        hostUserBtn,
        hostUserDropdown,
        realtimeUsersList,
        twitchUsersList,
        exportDataBtn,
        importDataBtn,
        importDataInput
    } = uiManager;

    // Show host user menu
    if (hostUserMenu) {
        hostUserMenu.style.display = 'flex';
    }

    // Host console <-> chat view toggle
    const hostConsole = uiManager.hostConsoleContainer;
    const toggleBtn = document.getElementById('host-console-toggle');
    if (hostConsole && toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isChat = hostConsole.classList.toggle('chat-view');
            toggleBtn.textContent = isChat ? 'Chat' : 'Host Console';
        });
    }

    // Helper: when a host clicks a user, show their profile (skills/inventory) in the main UI
    const onViewPlayer = (player) => {
        if (!player) return;
        if (typeof uiManager.showPlayerProfile === 'function') {
            uiManager.showPlayerProfile(player);
        }
    };
    
    // Attach a refresher to uiManager so we can update the dropdown content dynamically
    uiManager.refreshHostUserMenu = () => {
        // If spectating, add a "Return to My Profile" button at the top
        const existingReturnBtn = hostUserDropdown.querySelector('#host-return-btn-container');
        if (uiManager.spectatingId) {
            if (!existingReturnBtn) {
                const container = document.createElement('div');
                container.id = 'host-return-btn-container';
                container.className = 'dropdown-section';
                container.innerHTML = `
                    <button class="primary-btn small-primary-btn" style="width:100%; font-size:0.8rem;">
                        Return to My Profile
                    </button>
                `;
                container.querySelector('button').onclick = () => {
                    uiManager.stopSpectating();
                };
                hostUserDropdown.insertBefore(container, hostUserDropdown.firstChild);
            }
        } else {
            if (existingReturnBtn) {
                existingReturnBtn.remove();
            }
        }
    };

    // Host dropdown interactions
    if (hostUserBtn && hostUserDropdown) {
        hostUserBtn.addEventListener('click', () => {
            const isOpen = hostUserDropdown.style.display === 'block';
            hostUserDropdown.style.display = isOpen ? 'none' : 'block';
            if (!isOpen) {
                uiManager.refreshHostUserMenu();
                // Force a refresh when opening the menu to ensure it's up to date
                network.refreshPlayerList();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!hostUserMenu) return;
            if (!hostUserMenu.contains(e.target)) {
                hostUserDropdown.style.display = 'none';
            }
        });
    }

    // Host export/import data controls (moved to helper for clarity)
    setupHostExportImport({
        network,
        exportDataBtn,
        importDataBtn,
        importDataInput,
        replaceAllPlayers
    });

    // Track latest players list on the network manager so we can correlate peers <-> players
    network.lastPlayers = network.lastPlayers || [];

    // Host presence/player list callbacks + initial sync (moved to helper)
    setupPresenceAndPlayerList({
        uiManager,
        network,
        realtimeUsersList,
        twitchUsersList,
        onViewPlayer
    });

    // Streamer Mode (moved to dedicated module for clarity)
    setupStreamerMode(uiManager, network);
    
    // Tombstone: streamer-mode wiring moved to ui-host-streamer.js
    // Tombstone: presence/player list wiring and rendering moved to ui-host-users.js
    // Tombstone: export/import wiring moved to ui-host-export-import.js
}