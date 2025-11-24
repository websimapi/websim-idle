// Host player list + dropdown rendering extracted from ui-host.js

export function renderRealtimeUsers(peers, listEl, onViewPlayer, players) {
    if (!listEl) return;
    listEl.innerHTML = '';
    const allPlayers = Array.isArray(players) ? players : [];

    peers.forEach(peer => {
        const li = document.createElement('li');

        // Find if this realtime WebSim user is linked to a Twitch player profile
        const linkedPlayer = allPlayers.find(p => p.linkedWebsimId === peer.id);

        if (linkedPlayer) {
            // Linked realtime user: show "WebSim Twitch" and make clickable
            li.classList.add('linked-profile', 'clickable');
            li.innerHTML = `
                <span class="user-name">${peer.username}</span>
                <span class="user-meta">(linked ${linkedPlayer.username})</span>
            `;
            if (typeof onViewPlayer === 'function') {
                li.addEventListener('click', () => onViewPlayer(linkedPlayer));
            }
        } else {
            // Unlinked realtime user: WebSim username only, grey, not clickable (no profile)
            li.classList.add('unlinked-no-profile');
            li.innerHTML = `
                <span class="user-name">${peer.username}</span>
                <span class="user-meta">(no profile)</span>
            `;
        }

        listEl.appendChild(li);
    });
}

export function renderTwitchUsers(players, peers, listEl, onViewPlayer) {
    if (!listEl) return;
    listEl.innerHTML = '';
    const peersMap = peers || {};

    (players || []).forEach(player => {
        const li = document.createElement('li');
        const isLinked = !!player.linkedWebsimId && !!peersMap[player.linkedWebsimId];

        li.classList.add('twitch-user-item', 'clickable');

        let linkedLabel = '';
        if (isLinked) {
            const peerInfo = peersMap[player.linkedWebsimId];
            const websimName = peerInfo?.username || player.linkedWebsimId;
            linkedLabel = `(linked ${websimName})`;
        } else {
            // Unlinked Twitch users still have a profile and are playing
            linkedLabel = '(unlinked)';
        }

        li.innerHTML = `
            <span class="user-name">${player.username}</span>
            <span class="user-meta">${linkedLabel}</span>
        `;

        if (typeof onViewPlayer === 'function') {
            li.addEventListener('click', () => onViewPlayer(player));
        }

        listEl.appendChild(li);
    });
}

export function setupPresenceAndPlayerList({
    uiManager,
    network,
    realtimeUsersList,
    twitchUsersList,
    onViewPlayer
}) {
    // Hook host-specific callbacks
    network.onPresenceUpdate = (peers) => {
        // Re-render realtime users whenever presence changes, using the last known players list
        renderRealtimeUsers(peers, realtimeUsersList, onViewPlayer, network.lastPlayers || []);
    };

    network.onPlayerListUpdate = (players, peers) => {
        // Cache players for use in presence updates and realtime/twitch rendering
        network.lastPlayers = Array.isArray(players) ? players : [];

        renderTwitchUsers(players, peers, twitchUsersList, onViewPlayer);
        renderRealtimeUsers(
            Object.entries(peers || {}).map(([id, info]) => ({
                id,
                username: info.username
            })),
            realtimeUsersList,
            onViewPlayer,
            network.lastPlayers
        );
    };

    // Trigger Initial Updates immediately to sync with existing network state
    // 1. Populate presence if already available on the room
    if (network.room && network.room.peers) {
        const initialPeers = Object.entries(network.room.peers).map(([id, info]) => ({
            id,
            username: info.username
        }));
        // Fire manual presence update to render lists immediately
        if (network.onPresenceUpdate) {
            network.onPresenceUpdate(initialPeers);
        }
    }

    // 2. Trigger player list refresh.
    // We use the promise approach if initialization is pending, but ALSO try immediately
    // to catch cases where initialization was fast or synchronous.
    if (typeof network.refreshPlayerList === 'function') {
        // Immediate attempt
        network.refreshPlayerList();

        // Promise-based attempt (for post-init refresh)
        if (network.ready && typeof network.ready.then === 'function') {
            network.ready.then(() => {
                network.refreshPlayerList();
            });
        }
    }
}