import { SKILLS } from './skills.js';

export function renderSkillsList(uiManager) {
    const { skillsList } = uiManager;
    if (!skillsList) return;

    skillsList.innerHTML = '';
    Object.values(SKILLS).forEach(skill => {
        const div = document.createElement('div');
        div.className = 'skill-item';
        div.innerHTML = `
                <img src="${skill.icon}" alt="${skill.name}">
                <span>${skill.name}</span>
            `;
        div.onclick = () => showSkillDetails(uiManager, skill);
        skillsList.appendChild(div);
    });
}

export function showSkillDetails(uiManager, skill) {
    const { skillDetails, state, computeEnergyCount } = uiManager;
    if (!skillDetails) return;

    skillDetails.style.display = 'block';
    document.getElementById('detail-icon').src = skill.icon;
    document.getElementById('detail-name').innerText = skill.name;
    document.getElementById('detail-desc').innerText = skill.description;

    const grid = document.getElementById('task-grid');
    grid.innerHTML = '';

    skill.tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';

        const hasEnergy = state && computeEnergyCount(state) > 0;
        const isBusy = state && state.activeTask;

        card.innerHTML = `
                <h4>${task.name}</h4>
                <p>Time: ${task.duration / 1000}s</p>
                <p>XP: ${task.xp}</p>
            `;

        const btn = document.createElement('button');
        btn.innerText = isBusy
            ? (state.activeTask.taskId === task.id ? 'In Progress' : 'Busy')
            : 'Start';

        if (isBusy || !hasEnergy) {
            btn.disabled = true;
            if (!hasEnergy && !isBusy) btn.innerText = 'No Energy';
        }

        btn.onclick = () => {
            uiManager.network.startTask(task.id, task.duration);
        };

        card.appendChild(btn);
        grid.appendChild(card);
    });
}

export function findSkillByTaskId(taskId) {
    return Object.values(SKILLS).find(s => s.tasks.some(t => t.id === taskId));
}

export function findSkillByName(name) {
    return Object.values(SKILLS).find(s => s.name === name);
}

