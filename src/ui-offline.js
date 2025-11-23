import { renderItemGrid } from './ui-inventory.js';

export function initOfflinePopupListeners(uiManager) {
    const closePopup = () => {
        if (uiManager.offlinePopup) uiManager.offlinePopup.style.display = 'none';
    };

    if (uiManager.offlineCloseBtn) uiManager.offlineCloseBtn.onclick = closePopup;
    if (uiManager.offlineCloseX) uiManager.offlineCloseX.onclick = closePopup;

    if (uiManager.offlineSuppressBtn) {
        uiManager.offlineSuppressBtn.onclick = () => {
            localStorage.setItem('sq_suppress_catchup', 'true');
            closePopup();
        };
    }
}

export function checkOfflineEarnings(uiManager, newPlayerData) {
    // Don't show if suppressed
    if (localStorage.getItem('sq_suppress_catchup') === 'true') return;

    const rawLast = localStorage.getItem('sq_last_inventory');
    if (!rawLast) {
        // First time load or no history, just save current and return
        if (newPlayerData && newPlayerData.inventory) {
            localStorage.setItem('sq_last_inventory', JSON.stringify(newPlayerData.inventory));
        }
        return;
    }

    let lastInventory = {};
    try {
        lastInventory = JSON.parse(rawLast);
    } catch (e) {
        lastInventory = {};
    }

    const currentInventory = newPlayerData.inventory || {};
    const diff = {};
    let hasDiff = false;

    // Calculate items gained
    for (const [itemId, qty] of Object.entries(currentInventory)) {
        const oldQty = lastInventory[itemId] || 0;
        const gained = qty - oldQty;
        if (gained > 0) {
            diff[itemId] = gained;
            hasDiff = true;
        }
    }

    if (hasDiff) {
        showOfflinePopup(uiManager, diff, newPlayerData);
    }

    // Update local snapshot
    localStorage.setItem('sq_last_inventory', JSON.stringify(currentInventory));
}

export function showOfflinePopup(uiManager, earnings, playerData) {
    if (!uiManager.offlinePopup) return;

    // Render items
    renderItemGrid(uiManager.offlineLootGrid, earnings);

    // Show active skill text
    if (uiManager.offlineSkillInfo) {
        let text = 'Automated Tasks';
        if (playerData.activeTask) {
            const task = uiManager.getTaskDefById(playerData.activeTask.taskId);
            text = task ? `Currently: ${task.name}` : text;
        } else if (playerData.pausedTask) {
            const task = uiManager.getTaskDefById(playerData.pausedTask.taskId);
            text = task ? `Paused: ${task.name}` : 'Idle';
        }
        uiManager.offlineSkillInfo.innerText = text;
    }

    uiManager.offlinePopup.style.display = 'flex';
}