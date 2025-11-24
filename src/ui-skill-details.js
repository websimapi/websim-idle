import { SKILLS } from './skills.js';
import { getLevelInfo, computeSkillXp } from './xp.js';
import { WOODCUTTING_TIERS, MINING_TIERS, SCAVENGING_TIERS, FISHING_TIERS } from './data-tiers.js';

// Helper to create a standard Task Card
function createTaskCard(uiManager, task, playerLevel, state) {
    const { computeEnergyCount } = uiManager;
    
    const card = document.createElement('div');
    card.className = 'task-card';

    const hasEnergy = state && computeEnergyCount(state) > 0;
    const isBusy = state && state.activeTask;
    const isThisActive = isBusy && state.activeTask.taskId === task.id;
    const requiredLevel = task.level || 1;
    const hasRequiredLevel = playerLevel >= requiredLevel;

    // Handle Distributed Task Display
    if (task.isDistributed) {
        card.classList.add('distributed-task-card');
        // Use native tooltip instead of an in-card description block
        if (task.description) {
            card.title = task.description;
        }
        card.innerHTML = `
            <h4 style="color:var(--accent);">${task.name}</h4>
            <div class="task-meta-row">
                <span>Var. Time</span>
                <span>Var. XP</span>
                <span style="color:${hasRequiredLevel ? 'var(--accent)' : 'var(--text-dim)'}">
                    Unlock: Lv ${requiredLevel}
                </span>
            </div>
        `;
    } else {
        card.innerHTML = `
            <h4>${task.name}</h4>
            <div class="task-meta-row">
                <span>${task.duration / 1000}s</span>
                <span>${task.xp} XP</span>
                <span>Lv ${requiredLevel}</span>
            </div>
        `;
    }

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

        // Distributed Gather Logic
        if (task.isDistributed) {
            // 1. Find all valid tasks in this tier
            // We need to look up the skill object to find tasks again, or pass context.
            // We can use uiManager.currentSkillId to find the skill definition.
            const skill = SKILLS[uiManager.currentSkillId];
            if (!skill) return;

            let tierTasks = [];
            if (task.tierId) {
                // Determine correct tier set based on skill to avoid ID collisions (e.g. 'beginner' exists in multiple skills)
                let targetTiers = [];
                if (skill.id === 'woodcutting') targetTiers = WOODCUTTING_TIERS;
                else if (skill.id === 'mining') targetTiers = MINING_TIERS;
                else if (skill.id === 'scavenging') targetTiers = SCAVENGING_TIERS;
                else if (skill.id === 'fishing') targetTiers = FISHING_TIERS;

                const tierDef = targetTiers.find(t => t.id === task.tierId);

                if (tierDef) {
                    tierTasks = skill.tasks.filter(t => 
                        !t.isDistributed && 
                        (t.level || 1) >= tierDef.minLevel && 
                        (t.level || 1) <= tierDef.maxLevel
                    );
                }
            }

            if (tierTasks.length === 0) return;

            // 2. Calculate Double Roll Chance
            // Base 1%, +1% per level above requirement, max 50%
            const levelDiff = Math.max(0, playerLevel - requiredLevel);
            let chance = 0.01 + (levelDiff * 0.01);
            if (chance > 0.50) chance = 0.50;

            // 3. Perform Roll
            const resolvedIds = [];
            
            // Roll 1
            const task1 = tierTasks[Math.floor(Math.random() * tierTasks.length)];
            resolvedIds.push(task1.id);

            // Roll 2?
            const isDouble = Math.random() < chance;
            let task2 = null;
            if (isDouble) {
                task2 = tierTasks[Math.floor(Math.random() * tierTasks.length)];
                resolvedIds.push(task2.id);
            }

            // 4. Calculate Duration
            // "if you roll twice it will take the lowest time for the tasks"
            let finalDuration = task1.duration;
            if (task2) {
                finalDuration = Math.min(task1.duration, task2.duration);
            }

            // 5. Start Task with Meta
            uiManager.network.startTask(task.id, finalDuration, {
                resolvedTaskIds: resolvedIds,
                isDoubleRoll: isDouble
            });
            
            return;
        }

        uiManager.network.startTask(task.id, task.duration);
    };

    card.appendChild(btn);
    return card;
}

// Helper to render Tier Tabs, Scene, and filtered Task Grid
function renderTieredSkill(uiManager, skill, tiers, activeTierKey, skillDetails) {
    const grid = document.getElementById('task-grid');
    
    // Calculate level
    const totalXp = computeSkillXp(uiManager.state, skill.id);
    const levelInfo = getLevelInfo(totalXp);
    const playerLevel = levelInfo.level;

    // Filter valid tiers
    const tiersWithTasks = tiers.map(tier => ({
        ...tier,
        tasks: skill.tasks.filter(
            task => {
                // Include standard tasks in range (exclude distributed)
                const inRange =
                    !task.isDistributed &&
                    (task.level || 1) >= tier.minLevel &&
                    (task.level || 1) <= tier.maxLevel;
                // Include distributed task for this tier
                const isTierDist = task.isDistributed && task.tierId === tier.id;
                return inRange || isTierDist;
            }
        )
    })).filter(tier => tier.tasks.length > 0);

    if (tiersWithTasks.length === 0) return;

    // Active Tier selection
    let activeTier = 
        tiersWithTasks.find(t => t.id === uiManager[activeTierKey]) || 
        tiersWithTasks[0];
    
    // Update manager state
    uiManager[activeTierKey] = activeTier.id;

    // Render Tabs
    const tabsBar = document.createElement('div');
    tabsBar.className = 'tier-tabs';

    tiersWithTasks.forEach(tier => {
        const tab = document.createElement('button');
        tab.className = 'tier-tab' + (tier.id === activeTier.id ? ' active' : '');
        tab.innerText = tier.label;
        tab.onclick = () => {
            uiManager[activeTierKey] = tier.id;
            showSkillDetails(uiManager, skill);
        };
        tabsBar.appendChild(tab);
    });

    // Render Scene
    const sceneWrapper = document.createElement('div');
    sceneWrapper.className = 'tier-scene';
    const sceneImg = document.createElement('img');
    sceneImg.src = activeTier.scene;
    sceneImg.alt = `${activeTier.label} region`;
    sceneWrapper.appendChild(sceneImg);

    // Insert before grid
    skillDetails.insertBefore(sceneWrapper, grid);
    skillDetails.insertBefore(tabsBar, sceneWrapper);

    // Render Tasks
    activeTier.tasks.forEach(task => {
        const card = createTaskCard(uiManager, task, playerLevel, uiManager.state);
        grid.appendChild(card);
    });
}

export function showSkillDetails(uiManager, skill) {
    const { skillDetails, state } = uiManager;
    if (!skillDetails) return;

    // Remember which skill is currently being shown so state updates can refresh correctly
    uiManager.currentSkillId = skill.id;

    skillDetails.style.display = 'block';

    // Handle header visibility and content
    const headerEl = skillDetails.querySelector('.skill-header');
    const isTieredSkill = ['woodcutting', 'mining', 'scavenging', 'fishing'].includes(skill.id);

    if (isTieredSkill) {
        // Hide redundant header for tiered, scene-based skills
        if (headerEl) headerEl.style.display = 'none';
    } else {
        // Show and populate header for non-tiered skills
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

    // // removed huge if/else blocks for each skill type -> using generic renderTieredSkill
    
    if (skill.id === 'woodcutting') {
        renderTieredSkill(uiManager, skill, WOODCUTTING_TIERS, 'woodcuttingActiveTier', skillDetails);
    } else if (skill.id === 'mining') {
        renderTieredSkill(uiManager, skill, MINING_TIERS, 'miningActiveTier', skillDetails);
    } else if (skill.id === 'scavenging') {
        renderTieredSkill(uiManager, skill, SCAVENGING_TIERS, 'scavengingActiveTier', skillDetails);
    } else if (skill.id === 'fishing') {
        renderTieredSkill(uiManager, skill, FISHING_TIERS, 'fishingActiveTier', skillDetails);
    } else {
        // Default Rendering (non-tiered)
        const totalXp = computeSkillXp(state, skill.id);
        const levelInfo = getLevelInfo(totalXp);
        const playerLevel = levelInfo.level;

        skill.tasks.forEach(task => {
            const card = createTaskCard(uiManager, task, playerLevel, state);
            grid.appendChild(card);
        });
    }
}