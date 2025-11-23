import { WOODCUTTING_TIERS, MINING_TIERS, SCAVENGING_TIERS, FISHING_TIERS } from './data-tiers.js';
import { getLevelInfo, computeSkillXp } from './xp.js';

// Helper: random integer between min and max inclusive
function randomInt(min, max) {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

// Helper: resolve rewards for a completed task based on its reward definition
export function resolveTaskRewards(taskDef) {
    const rewards = {};
    if (!taskDef || !taskDef.reward) return rewards;

    const r = taskDef.reward;

    if (r.type === 'quantity') {
        const qty = randomInt(r.min, r.max);
        if (qty > 0) {
            rewards[r.itemId] = (rewards[r.itemId] || 0) + qty;
        }
    } else if (r.type === 'lootTable' && Array.isArray(r.table)) {
        r.table.forEach(entry => {
            if (Math.random() <= (entry.chance ?? 0)) {
                const qty = randomInt(entry.min ?? 1, entry.max ?? 1);
                if (qty > 0) {
                    rewards[entry.itemId] = (rewards[entry.itemId] || 0) + qty;
                }
            }
        });
    }

    return rewards;
}

// Helper: Roll a new distributed task configuration (sub-tasks + duration)
export function rollDistributedTask(player, skill, distributedTaskDef) {
    // 1. Find Tier Definition
    let targetTiers = [];
    if (skill.id === 'woodcutting') targetTiers = WOODCUTTING_TIERS;
    else if (skill.id === 'mining') targetTiers = MINING_TIERS;
    else if (skill.id === 'scavenging') targetTiers = SCAVENGING_TIERS;
    else if (skill.id === 'fishing') targetTiers = FISHING_TIERS;

    const tierDef = targetTiers.find(t => t.id === distributedTaskDef.tierId);
    if (!tierDef) return null;

    // 2. Filter Sub-tasks in this tier
    const tierTasks = skill.tasks.filter(t => 
        !t.isDistributed && 
        (t.level || 1) >= tierDef.minLevel && 
        (t.level || 1) <= tierDef.maxLevel
    );

    if (tierTasks.length === 0) return null;

    // 3. Calc Double Roll Chance
    const totalXp = computeSkillXp(player, skill.id);
    const { level: playerLevel } = getLevelInfo(totalXp);
    const requiredLevel = distributedTaskDef.level || 1;

    const levelDiff = Math.max(0, playerLevel - requiredLevel);
    let chance = 0.01 + (levelDiff * 0.01);
    if (chance > 0.50) chance = 0.50;

    // 4. Perform Rolls
    const resolvedIds = [];

    // Primary Roll
    const task1 = tierTasks[Math.floor(Math.random() * tierTasks.length)];
    resolvedIds.push(task1.id);

    // Secondary Roll check
    const isDouble = Math.random() < chance;
    let task2 = null;
    if (isDouble) {
        task2 = tierTasks[Math.floor(Math.random() * tierTasks.length)];
        resolvedIds.push(task2.id);
    }

    // 5. Determine Duration (lowest of the rolled tasks)
    let finalDuration = task1.duration;
    if (task2) {
        finalDuration = Math.min(task1.duration, task2.duration);
    }

    return {
        duration: finalDuration,
        meta: {
            resolvedTaskIds: resolvedIds,
            isDoubleRoll: isDouble
        }
    };
}