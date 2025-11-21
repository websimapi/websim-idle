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
    const ui = new UIManager(network);

    // Setup Host Specific UI
    if (isHost) {
        document.getElementById('host-controls').style.display = 'block';
        document.getElementById('client-controls').style.display = 'none';

        // Host automatically "Links" to themselves for testing UI
        ui.authOverlay.style.display = 'none';

        // Host needs to be able to see the game, so we treat them as a player too if they want
        // But primarily they manage the bot connection
    } else {
        // Check for existing token
        const token = localStorage.getItem('sq_token');
        if (token) {
            network.syncWithToken(token);
        }
    }
}

init();