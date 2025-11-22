import { NetworkManager } from './network.js';
import { UIManager } from './ui.js';

async function init() {
    const project = await window.websim.getCurrentProject();
    const currentUser = await window.websim.getCurrentUser();
    const creator = await window.websim.getCreator();

    const isHost = currentUser.id === creator.id;

    const room = new WebsimSocket();
    await room.initialize();

    console.log(`Initializing Game. Role: ${isHost ? 'HOST' : 'CLIENT'}`);

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
}

init();