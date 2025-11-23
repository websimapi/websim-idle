import { updateState } from './ui-state.js';

export function showPlayerProfile(uiManager, playerData) {
    if (!playerData) return;
    uiManager.spectatingId = playerData.twitchId;
    // Reset spectate update tracking so the next live update for this user
    // can decide whether to suppress reward toasts.
    uiManager.spectateFirstUpdateSeen = false;
    // When switching to spectate another user, suppress reward toasts for their existing inventory
    updateState(uiManager, playerData, { suppressRewards: true });
    uiManager.updateAuthUI();  

    // Force refresh of the host menu to show "Back" button
    if (uiManager.isHost && typeof uiManager.refreshHostUserMenu === 'function') {
        uiManager.refreshHostUserMenu();
    }
}

export function stopSpectating(uiManager) {
    uiManager.spectatingId = null;
    uiManager.spectateFirstUpdateSeen = false;
    const token = localStorage.getItem('sq_token');
    if (token) {
        uiManager.network.syncWithToken(token);
    } else {
        // Reset to guest
        uiManager.usernameDisplay.innerText = 'Guest';
        uiManager.energyCount.innerText = '0/12';
        uiManager.energyBarFill.style.width = '0%';
        uiManager.skillsList.innerHTML = '';
        uiManager.inventoryList.innerHTML = '';
        uiManager.activeTaskContainer.style.display = 'none';
        uiManager.updateAuthUI();
    }

    if (uiManager.isHost && typeof uiManager.refreshHostUserMenu === 'function') {
        uiManager.refreshHostUserMenu();
    }
}