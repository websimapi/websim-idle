// This file acts as an aggregator/legacy entry point for host task logic.
// The actual implementation has been split into:
// - host-tasks-rewards.js
// - host-tasks-offline.js
// - host-tasks-loop.js

export { resolveTaskRewards, rollDistributedTask } from './host-tasks-rewards.js';
export { applyOfflineProgress } from './host-tasks-offline.js';
export { startTaskCompletionLoop } from './host-tasks-loop.js';