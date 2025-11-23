import { NetworkManager } from './network.js';
import { UIManager, preloadGameAssets } from './ui.js';

async function init() {
    const project = await window.websim.getCurrentProject();
    const currentUser = await window.websim.getCurrentUser();
    const creator = await window.websim.getCreator();

    const isHost = currentUser.id === creator.id;

    const room = new WebsimSocket();
    await room.initialize();

    console.log(`Initializing Game. Role: ${isHost ? 'HOST' : 'CLIENT'}`);

    // preload all UI, scene, and item assets before showing the app
    try {
        console.log('[Loader] Starting asset preload...');
        
        const loadingBar = document.getElementById('loading-progress-bar');
        const loadingText = document.getElementById('loading-text');

        await preloadGameAssets((loaded, total) => {
            if (total > 0) {
                const pct = Math.floor((loaded / total) * 100);
                if (loadingBar) loadingBar.style.width = `${pct}%`;
                if (loadingText) loadingText.innerText = `Loading Assets... ${pct}%`;
            }
        });
        
        console.log('[Loader] Asset preload complete.');
    } catch (e) {
        console.warn('[Loader] Asset preload encountered an error, continuing anyway.', e);
    }

    // Pass user info to network manager
    const network = new NetworkManager(room, isHost, currentUser);
    const ui = new UIManager(network, isHost);

    // Hook up specific Sync callback for offline progress check
    network.onSyncData = (playerData) => {
        ui.checkOfflineEarnings(playerData);
    };

    // Setup Host Specific UI
    if (isHost) {
        const savedChannel = localStorage.getItem('sq_host_channel');
        document.getElementById('host-controls').style.display = 'block';
        if (savedChannel) {
            const connected = network.connectTwitch(savedChannel);
            if (connected) {
                const statusEl = document.getElementById('tmi-status');
                if (statusEl) {
                    statusEl.innerText = "🟢"; // Connected icon
                    statusEl.title = `Connected to ${savedChannel}`;
                }
                // After auto-connect, attempt auto-sync with stored token
                const token = localStorage.getItem('sq_token');
                if (token) {
                    network.syncWithToken(token);
                }
            }
        }
    } else {
        // Client: if we already have a stored token from a previous link,
        // automatically sync with the host so we don't appear as "Guest" on reload.
        const token = localStorage.getItem('sq_token');
        if (token) {
            network.syncWithToken(token);
        }
    }

    // Show console/chat pane for all users (host and regular clients)
    const hostConsole = document.getElementById('host-console-container');
    if (hostConsole) {
        hostConsole.style.display = 'flex';

        // For regular users, always show chat view (input visible)
        if (!isHost) {
            hostConsole.classList.add('chat-view');

            // Ensure the header label reads "Chat" for regular users
            const toggleBtn = document.getElementById('host-console-toggle');
            if (toggleBtn) {
                toggleBtn.textContent = 'Chat';
            }
        }
    }

    // fade out and remove the loading screen once everything is ready
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
        setTimeout(() => {
            if (loadingScreen && loadingScreen.parentNode) {
                loadingScreen.parentNode.removeChild(loadingScreen);
            }
        }, 500); // matches CSS transition duration
    }
}

init();