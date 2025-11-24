// Host export/import wiring extracted from ui-host.js

export function setupHostExportImport({
    network,
    exportDataBtn,
    importDataBtn,
    importDataInput,
    replaceAllPlayers
}) {
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const exportPayload = await network.exportChannelData();
                const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
                    type: 'application/json'
                });

                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const channel = exportPayload?.channel || localStorage.getItem('sq_host_channel') || 'channel';
                const date = new Date().toISOString().replace(/[:.]/g, '-');
                a.href = url;
                a.download = `streamquest_${channel}_players_${date}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (err) {
                console.error('Export failed', err);
            }
        });
    }

    if (importDataBtn && importDataInput) {
        importDataBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            importDataInput.click();
        });

        importDataInput.addEventListener('change', async (e) => {
            e.stopPropagation();
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const confirmOverride = window.confirm(
                'Importing will OVERWRITE all existing player data for this channel. Continue?'
            );
            if (!confirmOverride) {
                importDataInput.value = '';
                return;
            }

            try {
                const text = await file.text();
                const parsed = JSON.parse(text);

                let players = [];
                let importChannel = null;

                if (Array.isArray(parsed)) {
                    // Legacy format: plain array of players
                    players = parsed;
                } else if (parsed && Array.isArray(parsed.players)) {
                    // New format: { channel, players: [...] }
                    players = parsed.players;
                    importChannel = parsed.channel || null;
                } else {
                    alert('Invalid import file: expected an array of players or an object with { channel, players }.');
                    importDataInput.value = '';
                    return;
                }

                await network.importChannelData({ players, channel: importChannel }, replaceAllPlayers);
                alert('Import complete. Player data has been replaced for this channel.');
            } catch (err) {
                console.error('Import failed', err);
                alert('Import failed. Check the console for details.');
            } finally {
                importDataInput.value = '';
            }
        });
    }
}