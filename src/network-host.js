import { installHostMessageHandler } from './host-messages.js';
import { setupPresenceWatcher as setupPresenceWatcherImpl } from './host-presence.js';
import { startTaskCompletionLoop as startTaskCompletionLoopImpl, applyOfflineProgress as applyOfflineProgressImpl } from './host-tasks.js';

// Host-only message handler wiring
export function setupHostListeners(networkManager) {
    installHostMessageHandler(networkManager);
}

export function setupPresenceWatcher(networkManager) {
    return setupPresenceWatcherImpl(networkManager);
}

export function startTaskCompletionLoop(networkManager) {
    return startTaskCompletionLoopImpl(networkManager);
}

// New: one-shot offline progress application helper
export function applyOfflineProgress(networkManager) {
    return applyOfflineProgressImpl(networkManager);
}