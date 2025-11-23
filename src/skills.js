import { WOODCUTTING_SKILL } from './skills-woodcutting.js';
import { SCAVENGING_SKILL } from './skills-scavenging.js';
import { FISHING_SKILL } from './skills-fishing.js';
import { MINING_SKILL } from './skills-mining.js';
import { WOODCUTTING_TIERS, MINING_TIERS, SCAVENGING_TIERS, FISHING_TIERS } from './data-tiers.js';

// Helper to inject Distributed Gather tasks into a skill
function injectDistributedTasks(skill, tiers) {
    tiers.forEach(tier => {
        // Find all tasks belonging to this tier's level range
        const tierTasks = skill.tasks.filter(t => 
            !t.isDistributed && // exclude previously injected distributed tasks
            (t.level || 1) >= tier.minLevel && (t.level || 1) <= tier.maxLevel
        );

        if (tierTasks.length === 0) return;

        // Determine unlock level (5 levels above the highest task in this tier)
        const maxTaskLevel = Math.max(...tierTasks.map(t => t.level || 1));
        const unlockLevel = maxTaskLevel + 5;

        // Add the special distributed task
        skill.tasks.push({
            id: `dist_${skill.id}_${tier.id}`,
            name: tier.label,
            description: `Gather from multiple ${tier.label} sources at once. Chance for double yields!`,
            level: unlockLevel,
            duration: 0, // Dynamic: determined at start time
            xp: 0, // Dynamic: determined at completion
            isDistributed: true,
            tierId: tier.id,
            icon: 'item_mysterious_orb.png' // Generic icon for special ability
        });
    });
}

// Inject for each skill
injectDistributedTasks(WOODCUTTING_SKILL, WOODCUTTING_TIERS);
injectDistributedTasks(MINING_SKILL, MINING_TIERS);
injectDistributedTasks(SCAVENGING_SKILL, SCAVENGING_TIERS);
injectDistributedTasks(FISHING_SKILL, FISHING_TIERS);

export const SKILLS = {
    woodcutting: WOODCUTTING_SKILL,
    mining: MINING_SKILL,
    scavenging: SCAVENGING_SKILL,
    fishing: FISHING_SKILL
};

