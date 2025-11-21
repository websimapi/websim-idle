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

    // Setup Host Specific UI
    if (isHost) {
        document.getElementById('host-controls').style.display = 'block';
        const hostConsole = document.getElementById('host-console-container');
        if (hostConsole) {
            hostConsole.style.display = 'flex';
        }
        // Host menu and auth overlay visibility handled in UIManager
    }

    // Helper to check local token expiry before attempting auto-sync
    function isLocalTokenValid(token) {
        if (!token) return false;
        try {
            const decoded = JSON.parse(atob(token));
            if (!decoded.exp) return false;
            return decoded.exp > Date.now();
        } catch (e) {
            return false;
        }
    }

    // Attempt auto-sync with stored token for both host and clients
    const token = localStorage.getItem('sq_token');
    if (isLocalTokenValid(token)) {
        network.syncWithToken(token);
    } else if (token) {
        // Clean up expired/invalid token so UI shows as unlinked
        localStorage.removeItem('sq_token');
        // Ensure UI reflects updated auth state
        if (ui && typeof ui.updateAuthVisualState === 'function') {
            ui.updateAuthVisualState();
        }
    }
}

init();