import { ITEM_NAMES, ITEM_ICONS } from './item-data.js';

// Re-export for backward compatibility with other modules that import from here
export { ITEM_NAMES, ITEM_ICONS };

// Shared helper to render a grid of items (itemId -> quantity)
export function renderItemGrid(containerEl, itemsMap) {
    if (!containerEl) return;
    containerEl.innerHTML = '';
    
    const entries = Object.entries(itemsMap || {}).filter(([, qty]) => qty > 0);

    if (entries.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'inventory-empty';
        emptyDiv.textContent = 'Nothing collected';
        containerEl.appendChild(emptyDiv);
        return;
    }

    // Sort items alphabetically
    entries.sort((a, b) => a[0].localeCompare(b[0]));

    entries.forEach(([itemId, qty]) => {
        const slot = document.createElement('div');
        slot.className = 'inventory-item';

        const displayName = ITEM_NAMES[itemId] || itemId;
        slot.dataset.name = displayName;
        slot.setAttribute('aria-label', displayName);
        slot.title = displayName;

        const iconPath = ITEM_ICONS[itemId] || '';
        if (iconPath) {
            const img = document.createElement('img');
            img.src = iconPath;
            img.alt = displayName;
            slot.appendChild(img);
        } else {
            const span = document.createElement('span');
            span.textContent = displayName.charAt(0).toUpperCase();
            slot.appendChild(span);
        }

        const qtyBadge = document.createElement('div');
        qtyBadge.className = 'inventory-qty';
        qtyBadge.textContent = qty;
        slot.appendChild(qtyBadge);

        containerEl.appendChild(slot);
    });
}

export function renderInventory(inventoryListEl, playerData) {
    if (!inventoryListEl) return;
    
    // Use shared renderer
    renderItemGrid(inventoryListEl, playerData?.inventory || {});

    // Add specific inventory-list class if missing (handled by CSS usually but good for safety)
    inventoryListEl.classList.add('inventory-list');
}