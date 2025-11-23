import { SKILLS } from './skills.js';
import { renderInventory, ITEM_ICONS, ITEM_NAMES } from './ui-inventory.js';
import { findSkillByTaskId, findSkillByName, showSkillDetails, renderSkillsList } from './ui-skills.js';

const ONE_HOUR_MS = 60 * 60 * 1000;

export function updateState(uiManager, playerData, options = {}) {
    const suppressRewards = !!options.suppressRewards;
    const prevActiveTask = uiManager.state ? uiManager.state.activeTask : null;
    
    // Check for inventory changes to spawn reward toast
    const oldState = uiManager.state;
    if (!suppressRewards && oldState && oldState.inventory && playerData.inventory) {
        const gained = {};
        let hasGained = false;

        for (const [itemId, qty] of Object.entries(playerData.inventory)) {
            const oldQty = oldState.inventory[itemId] || 0;
            const diff = qty - oldQty;
            if (diff > 0) {
                gained[itemId] = diff;
                hasGained = true;
            }
        }

        if (hasGained) {
            showRewardsToast(gained);
        }
    }

    uiManager.state = playerData;

    // Mirror persisted stop/start info into local helpers
    uiManager._manualStop = !!playerData.manualStop;
    uiManager._isIdle = !!playerData.pausedTask;
    uiManager._lastTask = playerData.pausedTask || playerData.activeTask || uiManager._lastTask;

    // Update User Info
    if (uiManager.usernameDisplay && playerData.username) {
        uiManager.usernameDisplay.innerText = playerData.username;
    }

    // Update Energy (stored + active cell)
    const energyCount = uiManager.computeEnergyCount(playerData);
    uiManager.energyCount.innerText = `${energyCount}/12`;

    // Determine if we have an active energy cell (used for auto-restart + UI behavior)
    const now = Date.now();
    const hasActiveEnergy =
        playerData.activeEnergy &&
        (
            typeof playerData.activeEnergy.consumedMs === 'number'
                ? playerData.activeEnergy.consumedMs < ONE_HOUR_MS
                : now - (playerData.activeEnergy.startTime || 0) < ONE_HOUR_MS
        );

    // Update energy cell drain bar (percent + visual state)
    if (uiManager.energyBarFill && uiManager.energyBarBg) {
        const ae = playerData.activeEnergy;
        if (ae && hasActiveEnergy) {
            let consumedMs;

            if (typeof ae.consumedMs === 'number') {
                consumedMs = ae.consumedMs;
            } else if (ae.startTime && playerData.activeTask) {
                // Legacy approximation if we still have an old-style startTime
                consumedMs = Math.max(0, Math.min(ONE_HOUR_MS, now - (ae.startTime || 0)));
            } else {
                consumedMs = 0;
            }

            let remainingPct = 100 - (consumedMs / ONE_HOUR_MS) * 100;
            if (remainingPct < 0) remainingPct = 0;
            if (remainingPct > 100) remainingPct = 100;
            uiManager.energyBarFill.style.width = `${remainingPct}%`;

            // Treat the bar as "draining" while a task is running
            const isDraining = !!(hasActiveEnergy && playerData.activeTask);

            // Toggle classes for visual state
            uiManager.energyBarBg.classList.toggle('draining', isDraining);
            uiManager.energyBarBg.classList.toggle('idle', !isDraining);
            uiManager.energyBarFill.classList.toggle('draining', isDraining);
            uiManager.energyBarFill.classList.toggle('idle', !isDraining);
        } else {
            // No active energy
            uiManager.energyBarFill.style.width = '0%';
            uiManager.energyBarBg.classList.remove('draining', 'idle');
            uiManager.energyBarFill.classList.remove('draining', 'idle');
        }
    }

    if (!playerData.activeTask && !hasActiveEnergy) {
        // If there is no active task and no active energy, clear any manual-stop suppression
        uiManager._manualStop = false;
        uiManager._isIdle = false;
    }

    // Update Active Task UI
    const shouldShowTaskHeader = !!(playerData.activeTask || hasActiveEnergy || prevActiveTask || playerData.pausedTask);
    uiManager.activeTaskContainer.style.display = shouldShowTaskHeader ? 'flex' : 'none';

    const stopBtn = document.getElementById('stop-btn');

    if (playerData.activeTask) {
        // Track the current task as the last task
        uiManager._lastTask = { ...playerData.activeTask };
        uiManager._isIdle = false;
        if (stopBtn) stopBtn.innerText = 'STOP';

        // Only restart the progress loop if the task actually changed
        const taskChanged =
            !prevActiveTask ||
            prevActiveTask.taskId !== playerData.activeTask.taskId ||
            prevActiveTask.startTime !== playerData.activeTask.startTime ||
            prevActiveTask.duration !== playerData.activeTask.duration;

        if (taskChanged) {
            uiManager.startProgressLoop(playerData.activeTask);
        }

        // NOTE: previously we re-rendered the entire skill details view here
        // on every state update; this was removed to keep UI switches client-side
        // and avoid unnecessary work on realtime updates.
    } else {
        // No active task: if we also have no active energy, fully reset UI;
        // otherwise keep the header visible and the bar frozen.
        if (!hasActiveEnergy) {
            uiManager.stopProgressLoop();

            // NOTE: previously we re-rendered the entire skill details view here
            // when stopping a task; this is no longer needed for client-side UI
            // switching and has been removed to reduce lag.
        } else if (uiManager._isIdle && uiManager.state && uiManager.state.pausedTask) {
            // When idle for a specific task, ensure the header text/button reflect idle state
            const labelEl = document.getElementById('task-label');
            const taskDef = uiManager.getTaskDefById(uiManager.state.pausedTask.taskId);
            const taskName = taskDef ? taskDef.name : uiManager.state.pausedTask.taskId || 'Task';
            if (labelEl) {
                labelEl.innerText = `Idle ~ ${taskName}`;
            }
            if (stopBtn) stopBtn.innerText = 'Start';
        }
    }

    // Update skills list (levels and progress bars)
    renderSkillsList(uiManager);

    // New: if a skill is currently selected, keep its detail view in sync
    if (uiManager.currentSkillId && SKILLS[uiManager.currentSkillId]) {
        showSkillDetails(uiManager, SKILLS[uiManager.currentSkillId]);
    }

    // Update inventory panel
    renderInventory(uiManager.inventoryList, playerData);
}

function showRewardsToast(gainedItems) {
    const container = document.getElementById('task-rewards-container');
    if (!container) return;

    // Replace existing toast
    container.innerHTML = '';

    const row = document.createElement('div');
    row.className = 'reward-toast-row';

    const entries = Object.entries(gainedItems).sort((a, b) => a[0].localeCompare(b[0]));

    entries.forEach(([itemId, qty]) => {
        const pill = document.createElement('div');
        pill.className = 'reward-item-pill';

        const qtySpan = document.createElement('span');
        qtySpan.className = 'qty';
        qtySpan.innerText = `+${qty}`;

        const img = document.createElement('img');
        img.src = ITEM_ICONS[itemId] || 'item_mysterious_orb.png';
        img.alt = itemId;

        const nameSpan = document.createElement('span');
        nameSpan.innerText = ITEM_NAMES[itemId] || itemId;

        pill.appendChild(qtySpan);
        pill.appendChild(img);
        pill.appendChild(nameSpan);

        row.appendChild(pill);
    });

    container.appendChild(row);

    // Clean up DOM after animation
    setTimeout(() => {
        if (container.contains(row)) {
            row.remove();
        }
    }, 2500);
}