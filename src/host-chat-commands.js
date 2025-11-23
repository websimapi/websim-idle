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
        await ensureActiveEnergyAndStartTask(networkManager, player, twitchId, username, targetTask, '!mine');
    }
}

export async function handleWoodcuttingCommand(networkManager, player, twitchId, username, lowerMsg) {
    const parts = lowerMsg.split(/\\s+/);
    const arg = (parts[1] || '').trim();

    const woodSkill = SKILLS.woodcutting;
    const totalXp = computeSkillXp(player, woodSkill.id);
    const levelInfo = getLevelInfo(totalXp);
    const playerLevel = levelInfo.level;

    let targetTask = null;

    if (!arg) {
        // Highest task they meet the level requirement for
        const candidates = woodSkill.tasks
            .filter(t => playerLevel >= (t.level || 1))
            .sort((a, b) => (b.level || 1) - (a.level || 1));
        targetTask = candidates[0] || null;
    } else if (arg === 'oak') {
        targetTask = woodSkill.tasks.find(t => t.id === 'wc_oak') || null;
    } else if (arg === 'willow') {
        targetTask = woodSkill.tasks.find(t => t.id === 'wc_willow') || null;
    } else if (arg === 'maple') {
        targetTask = woodSkill.tasks.find(t => t.id === 'wc_maple') || null;
    } else {
        appendHostLog(`!chop from ${username} ignored: unknown tree \\\"${arg}\\\".`);
    }

    if (!targetTask) {
        appendHostLog(`!chop from ${username} failed: no eligible woodcutting task for level ${playerLevel}.`);
    } else if (playerLevel < (targetTask.level || 1)) {
        appendHostLog(
            `!chop from ${username} denied: level ${playerLevel} < required ${targetTask.level} for \\\"${targetTask.name}\\\".`
        );
    } else {
        await ensureActiveEnergyAndStartTask(networkManager, player, twitchId, username, targetTask, '!chop');
    }
}

export async function handleScavengingCommand(networkManager, player, twitchId, username, lowerMsg) {
    const scavSkill = SKILLS.scavenging;
    
    // Generic !sc command finds best available task
    if (lowerMsg === '!sc' || lowerMsg === '!salvage' || lowerMsg === '!sift' || lowerMsg === '!explore') {
        const totalXp = computeSkillXp(player, scavSkill.id);
        const levelInfo = getLevelInfo(totalXp);
        const playerLevel = levelInfo.level;

        // Highest task they meet the level requirement for
        const candidates = scavSkill.tasks
            .filter(t => playerLevel >= (t.level || 1))
            .sort((a, b) => (b.level || 1) - (a.level || 1));
        
        const targetTask = candidates[0] || null;

        if (!targetTask) {
             appendHostLog(`${lowerMsg} from ${username} failed: no eligible scavenging task for level ${playerLevel}.`);
             return;
        }

        await ensureActiveEnergyAndStartTask(networkManager, player, twitchId, username, targetTask, lowerMsg);
        return;
    }

    // (Legacy explicit command handling removed since !sc is now the main driver and handles everything dynamically)
}

export async function handleFishingCommand(networkManager, player, twitchId, username, lowerMsg) {
    const parts = lowerMsg.split(/\\s+/);
    const baseCmd = parts[0];
    const arg = (parts[1] || '').trim();

    const fishSkill = SKILLS.fishing;
    let requested = '';

    if (baseCmd === '!fish') {
        requested = arg; // shrimp / trout / shark / ''
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

    if (!requested) {
        // Highest fish they meet the level requirement for
        const candidates = fishSkill.tasks
            .filter(t => playerLevel >= (t.level || 1))
            .sort((a, b) => (b.level || 1) - (a.level || 1));
        targetTask = candidates[0] || null;
    } else if (requested === 'shrimp') {
        targetTask = fishSkill.tasks.find(t => t.id === 'fi_shrimp') || null;
    } else if (requested === 'trout') {
        targetTask = fishSkill.tasks.find(t => t.id === 'fi_trout') || null;
    } else if (requested === 'shark') {
        targetTask = fishSkill.tasks.find(t => t.id === 'fi_shark') || null;
    } else {
        appendHostLog(`${baseCmd} from ${username} ignored: unknown fish \\\"${requested}\\\".`);
    }

    if (!targetTask) {
        appendHostLog(`${baseCmd} from ${username} failed: no eligible fishing task for level ${playerLevel}.`);
    } else if (playerLevel < (targetTask.level || 1)) {
        appendHostLog(
            `${baseCmd} from ${username} denied: level ${playerLevel} < required ${targetTask.level} for \\\"${targetTask.name}\\\".`
        );
    } else {
        await ensureActiveEnergyAndStartTask(networkManager, player, twitchId, username, targetTask, baseCmd);
    }
}