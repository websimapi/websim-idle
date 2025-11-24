import { savePlayer } from './db.js';
import { SKILLS } from './skills.js';
import { getLevelInfo, computeSkillXp } from './xp.js';
import { appendHostLog } from './network-common.js';
import { ensureActiveEnergyAndStartTask } from './host-chat-utils.js';

export async function handleMiningCommand(networkManager, player, twitchId, username, lowerMsg) {
    const parts = lowerMsg.split(/\s+/);
    const arg = (parts[1] || '').trim();

    const mineSkill = SKILLS.mining;
    const totalXp = computeSkillXp(player, mineSkill.id);
    const levelInfo = getLevelInfo(totalXp);
    const playerLevel = levelInfo.level;

    let targetTask = null;
    const isGeneric = !arg;

    if (!arg) {
        // Highest task they meet the level requirement for
        const candidates = mineSkill.tasks
            .filter(t => playerLevel >= (t.level || 1))
            .sort((a, b) => (b.level || 1) - (a.level || 1));
        targetTask = candidates[0] || null;
    } else {
        // Fuzzy search for task ID or Name
        targetTask = mineSkill.tasks.find(t => 
            t.id.includes(arg) || 
            t.name.toLowerCase().includes(arg)
        );
    }

    if (!targetTask) {
        appendHostLog(`!mine from ${username} failed: no eligible mining task found.`);
    } else if (playerLevel < (targetTask.level || 1)) {
        appendHostLog(
            `!mine from ${username} denied: level ${playerLevel} < required ${targetTask.level} for "${targetTask.name}".`
        );
    } else {
        await ensureActiveEnergyAndStartTask(
            networkManager,
            player,
            twitchId,
            username,
            targetTask,
            '!mine',
            { fromGenericCommand: isGeneric }
        );
    }
}

export async function handleWoodcuttingCommand(networkManager, player, twitchId, username, lowerMsg) {
    // Parse full argument (supports multi-word like "black locust")
    const parts = lowerMsg.split(/\s+/);
    const argRaw = parts.slice(1).join(' ').trim().toLowerCase();
    const isGeneric = !argRaw;

    const woodSkill = SKILLS.woodcutting;
    const totalXp = computeSkillXp(player, woodSkill.id);
    const levelInfo = getLevelInfo(totalXp);
    const playerLevel = levelInfo.level;

    let targetTask = null;

    if (!argRaw) {
        // Generic: highest task they meet the level requirement for
        const candidates = woodSkill.tasks
            .filter(t => playerLevel >= (t.level || 1))
            .sort((a, b) => (b.level || 1) - (a.level || 1));
        targetTask = candidates[0] || null;
    } else {
        // Specific: map common tree names to explicit task IDs
        const key = argRaw.replace(/\s+/g, '_');
        const treeMap = {
            birch: 'wc_birch',
            pine: 'wc_pine',
            willow: 'wc_willow',
            poplar: 'wc_poplar',
            alder: 'wc_alder',
            maple: 'wc_maple',
            cedar: 'wc_cedar',
            elm: 'wc_elm',
            chestnut: 'wc_chestnut',
            beech: 'wc_beech',
            oak: 'wc_oak',
            ash: 'wc_ash',
            walnut: 'wc_walnut',
            sycamore: 'wc_sycamore',
            hornbeam: 'wc_hornbeam',
            yew: 'wc_yew',
            cherry: 'wc_cherry',
            ebony: 'wc_ebony',
            olive: 'wc_olive',
            ironwood: 'wc_ironwood',
            black_locust: 'wc_black_locust',
            blacklocust: 'wc_black_locust',
            dragonfir: 'wc_dragonfir',
            world_oak: 'wc_world_oak',
            worldoak: 'wc_world_oak'
        };

        let targetTaskId = treeMap[key] || null;

        if (!targetTaskId) {
            // Fallback: fuzzy search by id or name
            targetTask = woodSkill.tasks.find(t =>
                t.id.toLowerCase().includes(argRaw) ||
                t.name.toLowerCase().includes(argRaw)
            );
        } else {
            targetTask = woodSkill.tasks.find(t => t.id === targetTaskId) || null;
        }

        if (!targetTask) {
            appendHostLog(`!chop from ${username} ignored: unknown tree "${argRaw}".`);
        }
    }

    if (!targetTask) {
        appendHostLog(`!chop from ${username} failed: no eligible woodcutting task for level ${playerLevel}.`);
    } else if (playerLevel < (targetTask.level || 1)) {
        appendHostLog(
            `!chop from ${username} denied: level ${playerLevel} < required ${targetTask.level} for \"${targetTask.name}\".`
        );
    } else {
        await ensureActiveEnergyAndStartTask(
            networkManager,
            player,
            twitchId,
            username,
            targetTask,
            '!chop',
            { fromGenericCommand: isGeneric }
        );
    }
}

export async function handleScavengingCommand(networkManager, player, twitchId, username, lowerMsg) {
    const scavSkill = SKILLS.scavenging;
    const parts = lowerMsg.split(/\s+/);
    const baseCmd = parts[0];
    const arg = (parts[1] || '').trim();
    const isScavCmd =
        baseCmd === '!sc' ||
        baseCmd === '!scavenge' ||
        baseCmd === '!salvage' ||
        baseCmd === '!sift' ||
        baseCmd === '!explore';

    if (!isScavCmd) return;

    const totalXp = computeSkillXp(player, scavSkill.id);
    const levelInfo = getLevelInfo(totalXp);
    const playerLevel = levelInfo.level;

    let targetTask = null;
    const isGeneric = !arg;

    if (!arg) {
        // Generic scavenging: highest task they meet the level requirement for
        const candidates = scavSkill.tasks
            .filter(t => playerLevel >= (t.level || 1))
            .sort((a, b) => (b.level || 1) - (a.level || 1));
        
        targetTask = candidates[0] || null;

        if (!targetTask) {
            appendHostLog(`${baseCmd} from ${username} failed: no eligible scavenging task for level ${playerLevel}.`);
            return;
        }
    } else {
        // Specific scavenging: fuzzy search by id or name
        targetTask = scavSkill.tasks.find(t =>
            t.id.toLowerCase().includes(arg) ||
            t.name.toLowerCase().includes(arg)
        );

        if (!targetTask) {
            appendHostLog(`${baseCmd} from ${username} ignored: unknown scavenging target "${arg}".`);
            return;
        }
    }

    if (playerLevel < (targetTask.level || 1)) {
        appendHostLog(
            `${baseCmd} from ${username} denied: level ${playerLevel} < required ${targetTask.level} for "${targetTask.name}".`
        );
    } else {
        await ensureActiveEnergyAndStartTask(
            networkManager,
            player,
            twitchId,
            username,
            targetTask,
            baseCmd,
            { fromGenericCommand: isGeneric }
        );
    }
}

export async function handleFishingCommand(networkManager, player, twitchId, username, lowerMsg) {
    const parts = lowerMsg.split(/\s+/);
    const baseCmd = parts[0];
    const argRaw = parts.slice(1).join(' ').trim().toLowerCase();

    const fishSkill = SKILLS.fishing;
    let requested = '';

    if (baseCmd === '!fish') {
        requested = argRaw; // full request, e.g. "shrimp", "shallow tidepools"
    } else if (baseCmd === '!net') {
        requested = 'shrimp';
    } else if (baseCmd === '!lure') {
        requested = 'trout';
    } else if (baseCmd === '!harpoon') {
        requested = 'shark';
    }

    const totalXp = computeSkillXp(player, fishSkill.id);
    const levelInfo = getLevelInfo(totalXp);
    const playerLevel = levelInfo.level;

    let targetTask = null;
    const isGeneric = baseCmd === '!fish' && !requested;

    if (!requested) {
        // Generic: highest fish they meet the level requirement for
        const candidates = fishSkill.tasks
            .filter(t => playerLevel >= (t.level || 1))
            .sort((a, b) => (b.level || 1) - (a.level || 1));
        targetTask = candidates[0] || null;
    } else {
        const key = requested.replace(/\s+/g, '_');

        // Map of specific !fish targets to concrete task IDs (including region/tier shortcuts)
        const fishMap = {
            // Low-level fish
            shrimp: 'fi_shrimp',
            minnow: 'fi_minnow',
            sardine: 'fi_sardine',
            crab: 'fi_small_crab',
            small_crab: 'fi_small_crab',
            anchovy: 'fi_anchovy',

            // Mid-tier fish
            bass: 'fi_bass',
            catfish: 'fi_catfish',
            carp: 'fi_carp',
            trout: 'fi_trout',
            salmon: 'fi_salmon',
            pike: 'fi_pike',
            mackerel: 'fi_mackerel',
            snapper: 'fi_snapper',
            sea_bass: 'fi_sea_bass',
            seabass: 'fi_sea_bass',
            eel: 'fi_eel',
            swordfish: 'fi_swordfish_young',
            swordfish_young: 'fi_swordfish_young',

            // High-tier / expert fish
            tuna: 'fi_tuna',
            marlin: 'fi_marlin',
            giant_eel: 'fi_giant_eel',
            shark: 'fi_shark',
            leviathan: 'fi_leviathan',
            abyssal_lanternfish: 'fi_abyssal_lanternfish',
            elder_turtle: 'fi_elder_turtle',
            cosmic_carp: 'fi_cosmic_carp',

            // Region / tier shortcuts (Shallow Tidepools beginner distributed task)
            shallow: 'dist_fishing_beginner',
            shallow_tidepools: 'dist_fishing_beginner',
            shallow_tidepool: 'dist_fishing_beginner',
            tidepools: 'dist_fishing_beginner',
            st: 'dist_fishing_beginner'
        };

        let targetTaskId =
            fishMap[key] ||
            fishMap[requested.split(/\s+/)[0]] ||
            null;

        if (targetTaskId) {
            targetTask = fishSkill.tasks.find(t => t.id === targetTaskId) || null;
        }

        // Fallback to legacy explicit mappings if still not found
        if (!targetTask) {
            if (requested === 'shrimp') {
                targetTask = fishSkill.tasks.find(t => t.id === 'fi_shrimp') || null;
            } else if (requested === 'trout') {
                targetTask = fishSkill.tasks.find(t => t.id === 'fi_trout') || null;
            } else if (requested === 'shark') {
                targetTask = fishSkill.tasks.find(t => t.id === 'fi_shark') || null;
            }
        }

        // Final fallback: fuzzy search by id or name
        if (!targetTask) {
            targetTask = fishSkill.tasks.find(t =>
                t.id.toLowerCase().includes(requested) ||
                t.name.toLowerCase().includes(requested)
            );
        }

        if (!targetTask) {
            appendHostLog(`${baseCmd} from ${username} ignored: unknown fish "${requested}".`);
        }
    }

    if (!targetTask) {
        appendHostLog(`${baseCmd} from ${username} failed: no eligible fishing task for level ${playerLevel}.`);
    } else if (playerLevel < (targetTask.level || 1)) {
        appendHostLog(
            `${baseCmd} from ${username} denied: level ${playerLevel} < required ${targetTask.level} for \"${targetTask.name}\".`
        );
    } else {
        await ensureActiveEnergyAndStartTask(
            networkManager,
            player,
            twitchId,
            username,
            targetTask,
            baseCmd,
            { fromGenericCommand: isGeneric }
        );
    }
}