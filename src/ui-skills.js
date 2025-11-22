import { SKILLS } from './skills.js';
import { getLevelInfo, computeSkillXp } from './xp.js';
import { showSkillDetails } from './ui-skill-details.js';

export function renderSkillsList(uiManager) {
    const { skillsList, state } = uiManager;
    if (!skillsList) return;

    skillsList.innerHTML = '';
    Object.values(SKILLS).forEach(skill => {
        const div = document.createElement('div');
        div.className = 'skill-item';

        // Highlight the currently selected skill in the sidebar
        if (uiManager.currentSkillId && uiManager.currentSkillId === skill.id) {
            div.classList.add('active');
        }

        const totalXp = computeSkillXp(state, skill.id);
        const levelInfo = getLevelInfo(totalXp);
        const progressPct = Math.round(levelInfo.progress * 100);

        div.innerHTML = `
                <img src="${skill.icon}" alt="${skill.name}">
                <div class="skill-text">
                    <div class="skill-name-row">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-level-label">Lv ${levelInfo.level}</span>
                    </div>
                    <div class="skill-xp-bar">
                        <div class="skill-xp-fill" style="width:${progressPct}%;"></div>
                    </div>
                </div>
            `;
        div.onclick = () => {
            // Immediately update selected skill and visual highlight locally
            uiManager.currentSkillId = skill.id;
            if (uiManager.skillsList) {
                const items = uiManager.skillsList.querySelectorAll('.skill-item');
                items.forEach(itemEl => {
                    itemEl.classList.toggle('active', itemEl === div);
                });
            }
            showSkillDetails(uiManager, skill);
        };
        skillsList.appendChild(div);
    });
}

export function findSkillByTaskId(taskId) {
    return Object.values(SKILLS).find(s => s.tasks.some(t => t.id === taskId));
}

export function findSkillByName(name) {
    return Object.values(SKILLS).find(s => s.name === name);
}

// Re-export for existing imports that expect showSkillDetails from this module
export { showSkillDetails } from './ui-skill-details.js';

