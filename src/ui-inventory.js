// Friendly names for inventory items
export const ITEM_NAMES = {
    log_oak: 'Oak Logs',
    log_willow: 'Willow Logs',
    log_maple: 'Maple Logs',
    fish_shrimp: 'Shrimp',
    fish_trout: 'Trout',
    fish_shark: 'Shark',
    scrap_metal: 'Scrap Metal',
    torn_cloth: 'Torn Cloth',
    bottle_caps: 'Bottle Caps',
    ancient_scrap: 'Ancient Scrap',
    old_gears: 'Old Gears',
    mysterious_orb: 'Mysterious Orb',
    circuit_board: 'Circuit Board',
    power_core: 'Power Core',
    broken_chip: 'Broken Chip'
};

export function renderInventory(inventoryListEl, playerData) {
    if (!inventoryListEl) return;
    inventoryListEl.innerHTML = '';

    const inv = playerData?.inventory || {};
    const entries = Object.entries(inv).filter(([, qty]) => qty > 0);

    if (entries.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Empty';
        inventoryListEl.appendChild(li);
        return;
    }

    entries.sort((a, b) => a[0].localeCompare(b[0]));

    entries.forEach(([itemId, qty]) => {
        const li = document.createElement('li');
        const name = ITEM_NAMES[itemId] || itemId;
        li.innerHTML = `
                <span>${name}</span>
                <span>${qty}</span>
            `;
        inventoryListEl.appendChild(li);
    });
}