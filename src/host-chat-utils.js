import { savePlayer } from './db.js';
import { appendHostLog, ONE_HOUR_MS, getAvailableEnergyCount } from './network-common.js';

export async function ensureActiveEnergyAndStartTask(
    networkManager,
    player,
    twitchId,
    username,
    targetTask,
    commandLabel,
    options = {}
) {
    const room = networkManager.room;
    const now = Date.now();
    const totalAvailable = getAvailableEnergyCount(player);
    const fromGenericCommand = !!options.fromGenericCommand;

    if (totalAvailable <= 0) {
        appendHostLog(
            `${commandLabel} from ${username} denied: no energy (pool empty and no active cell).`
        );
        return;
    }

    const previousTaskId = player.activeTask?.taskId || null;

    const hasActiveEnergy =
        player.activeEnergy &&
        (typeof player.activeEnergy.consumedMs === 'number'
            ? player.activeEnergy.consumedMs < ONE_HOUR_MS
            : true);

    if (!hasActiveEnergy) {
        if (player.energy.length > 0) {
            player.energy.shift();
            player.activeEnergy = { consumedMs: 0 };
            appendHostLog(`Energy cell activated for ${username} (1h of active time).`);
        } else {
            appendHostLog(
                `${commandLabel} from ${username} denied: race condition left no stored energy.`
            );
            await savePlayer(twitchId, player);
            networkManager.refreshPlayerList();
            return;
        }
    }

    player.activeTask = {
        taskId: targetTask.id,
        startTime: now,
        duration: targetTask.duration,
        // Mark whether this came from a generic command so we can auto-upgrade.
        // For specific commands we clear meta entirely so no old generic flag lingers.
        meta: fromGenericCommand ? { fromGenericCommand: true } : null
    };
    player.pausedTask = null;
    player.manualStop = false;

    await savePlayer(twitchId, player);

    const remaining = getAvailableEnergyCount(player);

    if (previousTaskId && previousTaskId !== targetTask.id) {
        appendHostLog(
            `${commandLabel} from ${username}: switched from \"${previousTaskId}\" to \"${targetTask.name}\" (using active energy cell, ${remaining}/12 total).`
        );
    } else if (previousTaskId && previousTaskId === targetTask.id) {
        appendHostLog(
            `${commandLabel} from ${username}: restarted \"${targetTask.name}\" (using active energy cell, ${remaining}/12 total).`
        );
    } else {
        appendHostLog(
            `${commandLabel} from ${username}: started \"${targetTask.name}\" (using active energy cell, ${remaining}/12 total).`
        );
    }

    if (player.linkedWebsimId) {
        room.send({
            type: 'state_update',
            targetId: player.linkedWebsimId,
            playerData: player
        });
    }
}

