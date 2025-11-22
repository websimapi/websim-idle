import { savePlayer, getPlayer, createNewPlayer, setDbChannel, getAllPlayers } from './db.js';
import { SKILLS } from './skills.js';
import { appendHostLog, ONE_HOUR_MS, getAvailableEnergyCount, normalizeActiveEnergy } from './network-common.js';
import { setupHostListeners, setupPresenceWatcher, startTaskCompletionLoop } from './network-host.js';

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

        this.initialize();
    }

    async initialize() {
        if (this.isHost) {
            // Restore channel context if available
            const savedChannel = localStorage.getItem('sq_host_channel');
            if (savedChannel) {
                setDbChannel(savedChannel);
                appendHostLog(`DB context set for channel "${savedChannel}"`);
            }

            console.log("Initializing Host Logic...");
            setupHostListeners(this);
            setupPresenceWatcher(this);
            // Initial load of Twitch users for current DB context
            this.refreshPlayerList();

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

    generateLinkCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
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

    async handleTwitchMessage(tags, message) {
        const twitchId = tags['user-id'];
        const username = tags['username'];
        const now = Date.now();

        // 1. Energy Logic
        let player = await getPlayer(twitchId);
        if (!player) {
            player = createNewPlayer(username, twitchId);
            appendHostLog(`New Twitch user detected: ${username} (${twitchId}).`);
        }

        // Ensure energy structures exist on older records
        if (!Array.isArray(player.energy)) player.energy = [];
        if (!player.skills) player.skills = {};
        if (player.activeEnergy && !player.activeEnergy.startTime) {
            // legacy safety
            player.activeEnergy = null;
        }

        // Clear expired active energy (if any)
        await normalizeActiveEnergy(player);

        // Check energy threshold (5 minutes)
        if (now - player.lastChatTime > 300000) { 
            const totalAvailable = getAvailableEnergyCount(player);
            if (totalAvailable < 12) {
                player.energy.push(now); // Add stored energy cell
                appendHostLog(`Stored energy +1 for ${username} (now ${getAvailableEnergyCount(player)}/12).`);
                // Notify if they are online via WebSim
                if (player.linkedWebsimId) {
                    this.room.send({
                        type: 'energy_update',
                        targetId: player.linkedWebsimId,
                        energy: player.energy,
                        activeEnergy: player.activeEnergy
                    });
                }
            }
            player.lastChatTime = now;
            await savePlayer(twitchId, player);
        }

        // 2. Command Logic
        if (message.startsWith('!link ')) {
            const code = message.split(' ')[1];
            appendHostLog(`!link attempt by ${username} with code "${code}".`);
            this.cleanupExpiredCodes();
            const entry = this.pendingLinks[code];
            if (entry) {
                const websimClientId = entry.websimClientId;

                // Link them
                player.linkedWebsimId = websimClientId;
                await savePlayer(twitchId, player);

                // Generate "Token"
                const token = btoa(JSON.stringify({ twitchId, exp: now + (7 * 24 * 60 * 60 * 1000) }));

                // Inform Client
                this.room.send({
                    type: 'link_success',
                    targetId: websimClientId,
                    token: token,
                    playerData: player
                });

                delete this.pendingLinks[code];
                appendHostLog(`Link success: ${username} ↔ WebSim client ${websimClientId}.`);
                console.log(`Linked ${username} to websim client ${websimClientId}`);
            } else {
                appendHostLog(`Link failed for ${username}: code "${code}" not found or expired.`);
            }
        }

        // Update Twitch user list in dropdown
        this.refreshPlayerList();
    }

    async exportChannelData() {
        if (!this.isHost) return [];
        const players = await getAllPlayers();
        appendHostLog(`Exported ${players.length} players for current channel.`);
        return players;
    }

    async importChannelData(playersArray, replaceAllPlayersFn) {
        if (!this.isHost) return;
        if (typeof replaceAllPlayersFn !== 'function') return;

        await replaceAllPlayersFn(playersArray || []);
        appendHostLog(`Imported ${playersArray?.length || 0} players for current channel (overwrote existing data).`);
        await this.refreshPlayerList();
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

            switch (data.type) {
                case 'link_code_generated':
                    if (this.onLinkCode) this.onLinkCode(data.code);
                    break;
                case 'link_success':
                    localStorage.setItem('sq_token', data.token);
                    if (this.onLinkSuccess) this.onLinkSuccess(data.playerData);
                    break;
                case 'sync_data':
                case 'state_update':
                case 'energy_update':
                    if (data.energy) {
                        // partial update handling if needed
                    }
                    if (data.playerData && this.onStateUpdate) {
                        this.onStateUpdate(data.playerData);
                    }
                    break;
                case 'token_invalid':
                    // Host rejected token (likely expired) – clear it and notify UI
                    localStorage.removeItem('sq_token');
                    if (this.onTokenInvalid) this.onTokenInvalid();
                    break;
            }
        };
    }

    requestLinkCode() {
        this.room.send({ type: 'request_link_code' });
    }

    syncWithToken(token) {
        this.room.send({ type: 'sync_request', token });
    }

    startTask(taskId, duration) {
        const token = localStorage.getItem('sq_token'); 
        this.room.send({ 
            type: 'start_task', 
            taskId, 
            duration,
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
}