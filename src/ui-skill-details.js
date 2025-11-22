import { SKILLS } from './skills.js';
import { getLevelInfo, computeSkillXp } from './xp.js';

export function showSkillDetails(uiManager, skill) {
    const { skillDetails, state, computeEnergyCount } = uiManager;
    if (!skillDetails) return;

    // Remember which skill is currently being shown so state updates can refresh correctly
    uiManager.currentSkillId = skill.id;

    skillDetails.style.display = 'block';

    // Handle header visibility and content
    const headerEl = skillDetails.querySelector('.skill-header');
    if (skill.id === 'woodcutting' || skill.id === 'scavenging' || skill.id === 'fishing') {
        // Hide redundant header for tiered, scene-based skills
        if (headerEl) headerEl.style.display = 'none';
    } else {
        // Show and populate header for non-woodcutting skills
        if (headerEl) {
            headerEl.style.display = 'flex';
            const iconEl = document.getElementById('detail-icon');
            const nameEl = document.getElementById('detail-name');
            const descEl = document.getElementById('detail-desc');
            if (iconEl) iconEl.src = skill.icon;
            if (nameEl) nameEl.innerText = skill.name;
            if (descEl) descEl.innerText = skill.description;
        }
    }

    const grid = document.getElementById('task-grid');
    grid.innerHTML = '';

    // Clear any existing tier UI (tabs + scene) before re-rendering
    const oldTierEls = skillDetails.querySelectorAll('.tier-tabs, .tier-scene');
    oldTierEls.forEach(el => el.remove());

    // Compute player's current level for this skill
    const totalXp = computeSkillXp(state, skill.id);
    const levelInfo = getLevelInfo(totalXp);
    const playerLevel = levelInfo.level;

    // Special woodcutting UI with tier tabs + scene image
    if (skill.id === 'woodcutting') {
        const tiers = [
            {
                id: 'beginner',
                label: 'Whispering Sapling Glade',
                minLevel: 1,
                maxLevel: 10,
                scene: 'scene_wood_beginner.png'
            },
            {
                id: 'intermediate',
                label: 'Maplecrest Ridge',
                minLevel: 11,
                maxLevel: 20,
                scene: 'scene_wood_intermediate.png'
            },
            {
                id: 'advanced',
                label: 'Elderheart Deepwood',
                minLevel: 21,
                maxLevel: 35,
                scene: 'scene_wood_advanced.png'
            },
            {
                id: 'expert',
                label: 'Ancient Yew Sanctum',
                minLevel: 36,
                maxLevel: 50,
                scene: 'scene_wood_expert.png'
            },
            {
                id: 'legendary',
                label: 'Worldroot Canyon',
                minLevel: 51,
                maxLevel: 999,
                scene: 'scene_wood_legendary.png'
            }
        ];

        // Only include tiers that actually have tasks
        const tiersWithTasks = tiers.map(tier => ({
            ...tier,
            tasks: skill.tasks.filter(
                task => (task.level || 1) >= tier.minLevel && (task.level || 1) <= tier.maxLevel
            )
        })).filter(tier => tier.tasks.length > 0);

        if (tiersWithTasks.length === 0) {
            return;
        }

        // Determine active tier
        let activeTier = 
            tiersWithTasks.find(t => t.id === uiManager.woodcuttingActiveTier) || 
            tiersWithTasks[0];
        uiManager.woodcuttingActiveTier = activeTier.id;

        // Tabs bar
        const tabsBar = document.createElement('div');
        tabsBar.className = 'tier-tabs';

        tiersWithTasks.forEach(tier => {
            const tab = document.createElement('button');
            tab.className = 'tier-tab' + (tier.id === activeTier.id ? ' active' : '');
            tab.innerText = tier.label;
            tab.onclick = () => {
                uiManager.woodcuttingActiveTier = tier.id;
                showSkillDetails(uiManager, skill);
            };
            tabsBar.appendChild(tab);
        });

        // Scene image for active tier
        const sceneWrapper = document.createElement('div');
        sceneWrapper.className = 'tier-scene';
        const sceneImg = document.createElement('img');
        sceneImg.src = activeTier.scene;
        sceneImg.alt = `${activeTier.label} region`;
        sceneWrapper.appendChild(sceneImg);

        // Insert tabs + scene before the grid
        skillDetails.insertBefore(sceneWrapper, grid);
        skillDetails.insertBefore(tabsBar, sceneWrapper);

        // Render only tasks for active tier
        activeTier.tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';

            const hasEnergy = state && computeEnergyCount(state) > 0;
            const isBusy = state && state.activeTask;
            const isThisActive = isBusy && state.activeTask.taskId === task.id;
            const requiredLevel = task.level || 1;
            const hasRequiredLevel = playerLevel >= requiredLevel;

            card.innerHTML = `
                <h4>${task.name}</h4>
                <div class="task-meta-row">
                    <span>${task.duration / 1000}s</span>
                    <span>${task.xp} XP</span>
                    <span>Lv ${requiredLevel}</span>
                </div>
            `;

            const btn = document.createElement('button');
            if (isThisActive) {
                btn.innerText = 'In Progress';
            } else if (!hasRequiredLevel) {
                btn.innerText = `Locked (Lv ${requiredLevel})`;
            } else {
                btn.innerText = 'Start';
            }

            if ((!hasEnergy && !isThisActive) || !hasRequiredLevel) {
                btn.disabled = true;
                if (!hasEnergy && hasRequiredLevel && !isThisActive) {
                    btn.innerText = 'No Energy';
                }
            }

            btn.onclick = () => {
                if (isThisActive || !hasRequiredLevel) return;

                if (isBusy && state.activeTask.taskId !== task.id) {
                    uiManager.network.stopTask();
                }

                uiManager.network.startTask(task.id, task.duration);
            };

            card.appendChild(btn);
            grid.appendChild(card);
        });

        return;
    } else if (skill.id === 'scavenging') {
        const tiers = [
            {
                id: 'beginner',
                label: 'Scrap-Strewn Outskirts',
                minLevel: 1,
                maxLevel: 10,
                scene: 'scene_scav_beginner.png'
            },
            {
                id: 'intermediate',
                label: 'Derelict Workyards',
                minLevel: 11,
                maxLevel: 25,
                scene: 'scene_scav_intermediate.png'
            },
            {
                id: 'advanced',
                label: 'Collapsed Industrial Quarter',
                minLevel: 26,
                maxLevel: 40,
                scene: 'scene_scav_advanced.png'
            },
            {
                id: 'expert',
                label: 'Forsaken Tech Complex',
                minLevel: 41,
                maxLevel: 60,
                scene: 'scene_scav_expert.png'
            },
            {
                id: 'legendary',
                label: 'Starfall Excavation Zone',
                minLevel: 61,
                maxLevel: 999,
                scene: 'scene_scav_legendary.png'
            }
        ];

        const tiersWithTasks = tiers.map(tier => ({
            ...tier,
            tasks: skill.tasks.filter(
                task => (task.level || 1) >= tier.minLevel && (task.level || 1) <= tier.maxLevel
            )
        })).filter(tier => tier.tasks.length > 0);

        if (tiersWithTasks.length === 0) {
            return;
        }

        let activeTier = 
            tiersWithTasks.find(t => t.id === uiManager.scavengingActiveTier) || 
            tiersWithTasks[0];
        uiManager.scavengingActiveTier = activeTier.id;

        const tabsBar = document.createElement('div');
        tabsBar.className = 'tier-tabs';

        tiersWithTasks.forEach(tier => {
            const tab = document.createElement('button');
            tab.className = 'tier-tab' + (tier.id === activeTier.id ? ' active' : '');
            tab.innerText = tier.label;
            tab.onclick = () => {
                uiManager.scavengingActiveTier = tier.id;
                showSkillDetails(uiManager, skill);
            };
            tabsBar.appendChild(tab);
        });

        const sceneWrapper = document.createElement('div');
        sceneWrapper.className = 'tier-scene';
        const sceneImg = document.createElement('img');
        sceneImg.src = activeTier.scene;
        sceneImg.alt = `${activeTier.label} region`;
        sceneWrapper.appendChild(sceneImg);

        skillDetails.insertBefore(sceneWrapper, grid);
        skillDetails.insertBefore(tabsBar, sceneWrapper);

        activeTier.tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';

            const hasEnergy = state && computeEnergyCount(state) > 0;
            const isBusy = state && state.activeTask;
            const isThisActive = isBusy && state.activeTask.taskId === task.id;
            const requiredLevel = task.level || 1;
            const hasRequiredLevel = playerLevel >= requiredLevel;

            card.innerHTML = `
                <h4>${task.name}</h4>
                <div class="task-meta-row">
                    <span>${task.duration / 1000}s</span>
                    <span>${task.xp} XP</span>
                    <span>Lv ${requiredLevel}</span>
                </div>
            `;

            const btn = document.createElement('button');
            if (isThisActive) {
                btn.innerText = 'In Progress';
            } else if (!hasRequiredLevel) {
                btn.innerText = `Locked (Lv ${requiredLevel})`;
            } else {
                btn.innerText = 'Start';
            }

            if ((!hasEnergy && !isThisActive) || !hasRequiredLevel) {
                btn.disabled = true;
                if (!hasEnergy && hasRequiredLevel && !isThisActive) {
                    btn.innerText = 'No Energy';
                }
            }

            btn.onclick = () => {
                if (isThisActive || !hasRequiredLevel) return;

                if (isBusy && state.activeTask.taskId !== task.id) {
                    uiManager.network.stopTask();
                }

                uiManager.network.startTask(task.id, task.duration);
            };

            card.appendChild(btn);
            grid.appendChild(card);
        });

        return;
    } else if (skill.id === 'fishing') {
        const tiers = [
            {
                id: 'beginner',
                label: 'Shallow Tidepools',
                minLevel: 1,
                maxLevel: 10,
                scene: 'scene_fish_beginner.png'
            },
            {
                id: 'intermediate',
                label: 'River Bend Currents',
                minLevel: 11,
                maxLevel: 30,
                scene: 'scene_fish_intermediate.png'
            },
            {
                id: 'advanced',
                label: 'Coastal Shelf Waters',
                minLevel: 31,
                maxLevel: 50,
                scene: 'scene_fish_advanced.png'
            },
            {
                id: 'expert',
                label: 'Open-Sea Bluewater',
                minLevel: 51,
                maxLevel: 70,
                scene: 'scene_fish_expert.png'
            },
            {
                id: 'legendary',
                label: 'Abyssal Dream Trench',
                minLevel: 71,
                maxLevel: 999,
                scene: 'scene_fish_legendary.png'
            }
        ];

        const tiersWithTasks = tiers
            .map(tier => ({
                ...tier,
                tasks: skill.tasks.filter(
                    task => (task.level || 1) >= tier.minLevel && (task.level || 1) <= tier.maxLevel
                )
            }))
            .filter(tier => tier.tasks.length > 0);

        if (tiersWithTasks.length === 0) {
            return;
        }

        let activeTier = 
            tiersWithTasks.find(t => t.id === uiManager.fishingActiveTier) || 
            tiersWithTasks[0];
        uiManager.fishingActiveTier = activeTier.id;

        const tabsBar = document.createElement('div');
        tabsBar.className = 'tier-tabs';

        tiersWithTasks.forEach(tier => {
            const tab = document.createElement('button');
            tab.className = 'tier-tab' + (tier.id === activeTier.id ? ' active' : '');
            tab.innerText = tier.label;
            tab.onclick = () => {
                uiManager.fishingActiveTier = tier.id;
                showSkillDetails(uiManager, skill);
            };
            tabsBar.appendChild(tab);
        });

        const sceneWrapper = document.createElement('div');
        sceneWrapper.className = 'tier-scene';
        const sceneImg = document.createElement('img');
        sceneImg.src = activeTier.scene;
        sceneImg.alt = `${activeTier.label} region`;
        sceneWrapper.appendChild(sceneImg);

        skillDetails.insertBefore(sceneWrapper, grid);
        skillDetails.insertBefore(tabsBar, sceneWrapper);

        activeTier.tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';

            const hasEnergy = state && computeEnergyCount(state) > 0;
            const isBusy = state && state.activeTask;
            const isThisActive = isBusy && state.activeTask.taskId === task.id;
            const requiredLevel = task.level || 1;
            const hasRequiredLevel = playerLevel >= requiredLevel;

            card.innerHTML = `
                <h4>${task.name}</h4>
                <div class="task-meta-row">
                    <span>${task.duration / 1000}s</span>
                    <span>${task.xp} XP</span>
                    <span>Lv ${requiredLevel}</span>
                </div>
            `;

            const btn = document.createElement('button');
            if (isThisActive) {
                btn.innerText = 'In Progress';
            } else if (!hasRequiredLevel) {
                btn.innerText = `Locked (Lv ${requiredLevel})`;
            } else {
                btn.innerText = 'Start';
            }

            if ((!hasEnergy && !isThisActive) || !hasRequiredLevel) {
                btn.disabled = true;
                if (!hasEnergy && hasRequiredLevel && !isThisActive) {
                    btn.innerText = 'No Energy';
                }
            }

            btn.onclick = () => {
                if (isThisActive || !hasRequiredLevel) return;

                if (isBusy && state.activeTask.taskId !== task.id) {
                    uiManager.network.stopTask();
                }

                uiManager.network.startTask(task.id, task.duration);
            };

            card.appendChild(btn);
            grid.appendChild(card);
        });

        return;
    }

    // Default rendering for non-woodcutting skills
    skill.tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';

        const hasEnergy = state && computeEnergyCount(state) > 0;
        const isBusy = state && state.activeTask;
        const isThisActive = isBusy && state.activeTask.taskId === task.id;
        const requiredLevel = task.level || 1;
        const hasRequiredLevel = playerLevel >= requiredLevel;

        card.innerHTML = `
                <h4>${task.name}</h4>
                <div class="task-meta-row">
                    <span>${task.duration / 1000}s</span>
                    <span>${task.xp} XP</span>
                    <span>Lv ${requiredLevel}</span>
                </div>
            `;

        const btn = document.createElement('button');
        if (isThisActive) {
            btn.innerText = 'In Progress';
        } else if (!hasRequiredLevel) {
            btn.innerText = `Locked (Lv ${requiredLevel})`;
        } else {
            btn.innerText = 'Start';
        }

        if ((!hasEnergy && !isThisActive) || !hasRequiredLevel) {
            btn.disabled = true;
            if (!hasEnergy && hasRequiredLevel && !isThisActive) {
                btn.innerText = 'No Energy';
            }
        }

        btn.onclick = () => {
            if (isThisActive || !hasRequiredLevel) return;

            if (isBusy && state.activeTask.taskId !== task.id) {
                uiManager.network.stopTask();
            }

            uiManager.network.startTask(task.id, task.duration);
        };

        card.appendChild(btn);
        grid.appendChild(card);
    });
}