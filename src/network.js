import { getPlayer, setDbChannel, getAllPlayers } from './db.js';
import { appendHostLog } from './network-common.js';
import { setupHostListeners, setupPresenceWatcher, startTaskCompletionLoop, applyOfflineProgress } from './network-host.js';
import { handleTwitchChat } from './host-chat.js';

// Simulation of a JWT Secret (In a real app, this is server-side only)
const SECRET_KEY = "mock_secret_key_" + Math.random();

export class NetworkManager {
    constructor(room, isHost, user) {
        this.room = room;
        this.isHost = isHost;
        this.user = user;
        this.tmiClient = null;
        this.pendingLinks = {}; // code -> { websimClientId, createdAt }
        this.taskCompletionInterval = null; // interval handle for completing tasks

        this.onEnergyUpdate = null;
        this.onTaskUpdate = null;
        this.onLinkSuccess = null;
        this.onLinkCode = null;
        this.onStateUpdate = null;
        this.onPresenceUpdate = null;
        this.onPlayerListUpdate = null;
        this.onTokenInvalid = null; // fired when host rejects/expired token
        this.onChatMessage = null; // fired when any in-room chat message is received

        // Ensure DB context is set as early as possible for hosts
        if (this.isHost) {
            const savedChannel = localStorage.getItem('sq_host_channel');
            if (savedChannel) {
                setDbChannel(savedChannel);
                appendHostLog(`DB context set for channel "${savedChannel}"`);
            }
        }

        // Expose an async initialization promise so UI can wait on it
        this.ready = this.initialize();
    }

    async initialize() {
        if (this.isHost) {
            // Host-side setup (DB context was already set in constructor if a channel was saved)
            console.log("Initializing Host Logic...");
            setupHostListeners(this);
            setupPresenceWatcher(this);
            // Initial load of Twitch users for current DB context
            this.refreshPlayerList();

            // New: apply offline catch-up for any in-progress tasks before starting live loop
            await applyOfflineProgress(this);

            // Start background loop to complete finished tasks
            startTaskCompletionLoop(this);
        } else {
            console.log("Initializing Client Logic...");
            this.setupClientListeners();
        }
    }

    // --- HOST LOGIC ---

    connectTwitch(channelName) {
        if (!this.isHost) return;

        // Update DB Context
        setDbChannel(channelName);
        localStorage.setItem('sq_host_channel', channelName);
        appendHostLog(`Connecting to Twitch channel "${channelName}"...`);

        if (this.tmiClient) this.tmiClient.disconnect();

        // tmi is global from the script tag fallback if import fails, or import map
        const tmi = window.tmi; 

        this.tmiClient = new tmi.Client({
            channels: [channelName]
        });

        this.tmiClient.connect().then(() => {
            appendHostLog(`Connected to Twitch channel "${channelName}".`);
        }).catch(err => {
            console.error(err);
            appendHostLog(`Error connecting to Twitch: ${err?.message || err}`);
            
            // If connection fails, ensure the UI reflects disconnected status
            const statusEl = document.getElementById('tmi-status');
            if (statusEl) {
                 statusEl.innerText = '🔴';
                 statusEl.title = 'Disconnected';
            }
        });

        this.tmiClient.on('message', (channel, tags, message, self) => {
            if (self) return;
            // Log every message to host console
            const uname = tags['display-name'] || tags['username'] || 'unknown';
            appendHostLog(`[CHAT] ${uname}: ${message}`);
            this.handleTwitchMessage(tags, message);
        }); 

        // Reload Twitch users for this channel's DB
        this.refreshPlayerList();

        return true;
    }

    cleanupExpiredCodes() {
        const now = Date.now();
        const ttl = 5 * 60 * 1000; // 5 minutes
        for (const [code, entry] of Object.entries(this.pendingLinks)) {
            if (!entry || now - entry.createdAt > ttl) {
                appendHostLog(`Link code "${code}" expired and was removed.`);
                delete this.pendingLinks[code];
            }
        }
    }

    generateLinkCode() {
        // Generate a 6-character, human-friendly link code and avoid collisions
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing 0/O/1/I
        let code = '';
        do {
            code = '';
            for (let i = 0; i < 6; i++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
        } while (this.pendingLinks[code]);
        return code;
    }

    async handleTwitchMessage(tags, message) {
        return handleTwitchChat(this, tags, message);
    }

    async exportChannelData() {
        if (!this.isHost) return [];
        const players = await getAllPlayers();
        const channel = localStorage.getItem('sq_host_channel') || null;
        appendHostLog(
            `Exported ${players.length} players for current channel${channel ? ` "${channel}"` : ''}.`
        );
        return { channel, players };
    }

    async importChannelData(importPayload, replaceAllPlayersFn) {
        if (!this.isHost) return;
        if (typeof replaceAllPlayersFn !== 'function') return;

        const playersArray = Array.isArray(importPayload)
            ? importPayload
            : importPayload?.players || [];
        const importChannel = Array.isArray(importPayload)
            ? null
            : importPayload?.channel || null;

        // If the import specifies a channel, switch DB context and remember it
        if (importChannel) {
            setDbChannel(importChannel);
            localStorage.setItem('sq_host_channel', importChannel);
            appendHostLog(`Channel context set from import: "${importChannel}".`);

            // NEW: update the host Twitch channel input field to reflect imported channel
            const channelInput = document.getElementById('twitch-channel-input');
            if (channelInput) {
                channelInput.value = importChannel;
            }
        }

        await replaceAllPlayersFn(playersArray || []);
        appendHostLog(
            `Imported ${playersArray?.length || 0} players for current channel${
                importChannel ? ` "${importChannel}"` : ''
            } (overwrote existing data).`
        );

        // NEW: after replacing all players, immediately apply offline progress so
        // any pending tasks consume the appropriate energy and grant completions.
        try {
            await applyOfflineProgress(this);
        } catch (err) {
            console.error('Error applying offline progress after import', err);
            appendHostLog(`Error applying offline progress after import: ${err?.message || err}`);
        }

        await this.refreshPlayerList();

        // Broadcast updates to connected clients and local UI
        const players = playersArray || [];
        for (const player of players) {
            // 1. Notify Linked Remote Clients
            if (player.linkedWebsimId && player.linkedWebsimId !== this.room.clientId) {
                this.room.send({
                    type: 'state_update',
                    targetId: player.linkedWebsimId,
                    playerData: player
                });
            }

            // 2. Update Local Client (if Host is playing as this user)
            if (player.linkedWebsimId === this.room.clientId) {
                if (this.onStateUpdate) {
                    this.onStateUpdate(player);
                }
            }

            // 3. Update Host Spectator View (if currently inspecting this user)
            window.dispatchEvent(new CustomEvent('sq:player_update', { detail: player }));
        }

        // After import, auto-connect to the channel specified in the file (if any)
        if (importChannel) {
            this.connectTwitch(importChannel);
        }
    }

    async refreshPlayerList() {
        if (!this.isHost || !this.onPlayerListUpdate) return;
        const players = await getAllPlayers();
        const peers = this.room.peers || {};
        this.onPlayerListUpdate(players, peers);
    }

    async validateToken(token) {
        try {
            const decoded = JSON.parse(atob(token));
            if (decoded.exp < Date.now()) return null;
            return await getPlayer(decoded.twitchId);
        } catch (e) {
            return null;
        }
    }

    // --- CLIENT LOGIC ---

    setupClientListeners() {
        this.room.onmessage = (event) => {
            const data = event.data;

            // Filter messages meant for me
            if (data.targetId && data.targetId !== this.room.clientId) return;

            try {
                switch (data.type) {
                    case 'link_code_generated':
                        if (this.onLinkCode) this.onLinkCode(data.code);
                        break;
                    case 'link_success':
                        localStorage.setItem('sq_token', data.token);
                        if (this.onLinkSuccess) this.onLinkSuccess(data.playerData);
                        break;
                    case 'sync_data':
                        // Check for offline progress before updating state (Client only)
                        if (this.onStateUpdate && data.playerData) {
                            // Assuming uiManager is hooked to onStateUpdate, we might need a specific hook
                            // But simpler: NetworkManager doesn't know about UI methods directly except via callbacks.
                            // We'll add a dedicated callback or just let the UI handle it in onStateUpdate logic?
                            // Better: Add onSyncData callback
                            if (this.onSyncData) {
                                this.onSyncData(data.playerData);
                            }
                            
                            // Proceed with standard update
                            this.onStateUpdate(data.playerData);
                        }
                        break;
                    case 'state_update':
                    case 'energy_update':
                        if (data.energy) {
                            // partial update handling if needed
                        }
                        if (data.playerData && this.onStateUpdate) {
                            this.onStateUpdate(data.playerData);
                        }
                        break;
                    case 'chat_message':
                        if (this.onChatMessage) {
                            this.onChatMessage(data);
                        }
                        break;
                    case 'token_invalid':
                        // Host rejected token (likely expired) – clear it and notify UI
                        localStorage.removeItem('sq_token');
                        if (this.onTokenInvalid) this.onTokenInvalid();
                        break;
                }
            } catch (err) {
                console.error('Error handling client message', err, data);
            }
        };
    }

    requestLinkCode() {
        this.room.send({ type: 'request_link_code' });
    }

    syncWithToken(token) {
        this.room.send({ type: 'sync_request', token });
    }

    startTask(taskId, duration, meta = null) {
        const token = localStorage.getItem('sq_token'); 
        this.room.send({ 
            type: 'start_task', 
            taskId, 
            duration,
            meta,
            token: token 
        });
    }

    stopTask() {
        this.room.send({ 
            type: 'stop_task', 
            token: localStorage.getItem('sq_token') 
        });
    }

    // New: request a de-link so host can clear the Twitch <-> WebSim association
    requestDelink() {
        const token = localStorage.getItem('sq_token');
        if (!token) return;
        this.room.send({
            type: 'client_delink',
            token
        });
    }

    // New: send an in-room chat message (host + clients)
    sendChatMessage(text) {
        if (!text) return;
        const username =
            (this.user && (this.user.username || this.user.name)) ||
            'Player';
        this.room.send({
            type: 'chat_message',
            username,
            text,
            ts: Date.now(),
            clientId: this.room.clientId
        });
    }
}