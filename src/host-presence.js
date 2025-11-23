// Presence watcher (extracted from network-host.js)
export function setupPresenceWatcher(networkManager) {
    const room = networkManager.room;

    // Host tracks realtime Websim users
    room.subscribePresence(() => {
        const peers = Object.entries(room.peers || {}).map(([id, info]) => ({
            id,
            username: info.username
        }));

        // If a presence update callback is registered, call it
        if (networkManager.onPresenceUpdate) {
            networkManager.onPresenceUpdate(peers);
        }

        // Always refresh Twitch users list so linked WebSim usernames stay up to date
        if (typeof networkManager.refreshPlayerList === 'function') {
            networkManager.refreshPlayerList();
        }
    });

    // Initial fire
    if (networkManager.onPresenceUpdate) {
        const peers = Object.entries(room.peers || {}).map(([id, info]) => ({
            id,
            username: info.username
        }));
        networkManager.onPresenceUpdate(peers);
    }

    // NEW: also refresh player list on initial presence setup so user lists are in sync right away
    if (typeof networkManager.refreshPlayerList === 'function') {
        networkManager.refreshPlayerList();
    }
}