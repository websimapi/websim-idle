// Aggregated item name/icon registry for all skills

import { ITEM_NAMES_WOODCUTTING, ITEM_ICONS_WOODCUTTING } from './item-data-woodcutting.js';
import { ITEM_NAMES_MINING, ITEM_ICONS_MINING } from './item-data-mining.js';
import { ITEM_NAMES_FISHING, ITEM_ICONS_FISHING } from './item-data-fishing.js';
import { ITEM_NAMES_SCAVENGING, ITEM_ICONS_SCAVENGING } from './item-data-scavenging.js';
import { ITEM_NAMES_LEGACY, ITEM_ICONS_LEGACY } from './item-data-legacy.js';

export const ITEM_NAMES = {
    ...ITEM_NAMES_WOODCUTTING,
    ...ITEM_NAMES_MINING,
    ...ITEM_NAMES_FISHING,
    ...ITEM_NAMES_SCAVENGING,
    ...ITEM_NAMES_LEGACY
};

export const ITEM_ICONS = {
    ...ITEM_ICONS_WOODCUTTING,
    ...ITEM_ICONS_MINING,
    ...ITEM_ICONS_FISHING,
    ...ITEM_ICONS_SCAVENGING,
    ...ITEM_ICONS_LEGACY
};