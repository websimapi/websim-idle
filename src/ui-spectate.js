import { updateState } from './ui-state.js';
import { findSkillByTaskId, showSkillDetails } from './ui-skills.js';
import { WOODCUTTING_TIERS, MINING_TIERS, SCAVENGING_TIERS, FISHING_TIERS } from './data-tiers.js';

export function showPlayerProfile(uiManager, playerData) {
    if (!playerData) return;
    uiManager.spectatingId = playerData.twitchId;
    // Reset spectate update tracking so the next live update for this user
    // can decide whether to suppress reward toasts.
    uiManager.spectateFirstUpdateSeen = false;

    // NEW: auto-select skill + tier based on the user's current/last task
    const taskContainer = playerData.activeTask || playerData.pausedTask || null;
    let selectedSkill = null;
    let selectedTierId = null;
    let activeTierKey = null;

    if (taskContainer && taskContainer.taskId) {
        const skill = findSkillByTaskId(taskContainer.taskId);
        if (skill) {
            selectedSkill = skill;

            // Determine which tier set + state key to use for this skill
            let tiers = null;
            if (skill.id === 'woodcutting') {
                tiers = WOODCUTTING_TIERS;
                activeTierKey = 'woodcuttingActiveTier';
            } else if (skill.id === 'mining') {
                tiers = MINING_TIERS;
                activeTierKey = 'miningActiveTier';
            } else if (skill.id === 'scavenging') {
                tiers = SCAVENGING_TIERS;
                activeTierKey = 'scavengingActiveTier';
            } else if (skill.id === 'fishing') {
                tiers = FISHING_TIERS;
                activeTierKey = 'fishingActiveTier';
            }

            if (tiers && activeTierKey) {
                const taskDef = skill.tasks.find(t => t.id === taskContainer.taskId);
                const taskLevel = taskDef && typeof taskDef.level === 'number' ? taskDef.level : 1;
                const tierMatch = tiers.find(t => taskLevel >= t.minLevel && taskLevel <= t.maxLevel);
                if (tierMatch) {
                    selectedTierId = tierMatch.id;
                    uiManager[activeTierKey] = selectedTierId;
                }
            }
        }
    }

    // When switching to spectate another user, suppress reward toasts for their existing inventory
    updateState(uiManager, playerData, { suppressRewards: true });

    // NEW: ensure the correct skill detail tab is visible after state update
    if (selectedSkill) {
        uiManager.currentSkillId = selectedSkill.id;
        showSkillDetails(uiManager, selectedSkill);
    }

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