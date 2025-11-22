export const SCAVENGING_TIER_1 = [
    // TIER 1 – JUNK & SCRAP (Lv 1–10)
    {
        id: 'sc_trash',
        name: 'Sift Trash',
        level: 1,
        duration: 3000,
        xp: 5,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'scrap_metal_bits', name: 'Scrap Metal Bits', chance: 0.65, min: 1, max: 3 },
                { itemId: 'frayed_wire', name: 'Frayed Wire', chance: 0.40, min: 1, max: 2 },
                { itemId: 'plastic_shards', name: 'Plastic Shards', chance: 0.50, min: 2, max: 4 },
                { itemId: 'rusted_bolt', name: 'Rusted Bolt', chance: 0.18, min: 1, max: 1 },
                { itemId: 'bent_spoon', name: 'Bent Spoon', chance: 0.05, min: 1, max: 1 },
                { itemId: 'lost_coin', name: 'Lost Coin', chance: 0.01, min: 1, max: 1 }
            ]
        }
    },
    {
        id: 'sc_rubble',
        name: 'Pick Through Rubble',
        level: 5,
        duration: 4000,
        xp: 12,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'stone_fragments', name: 'Stone Fragments', chance: 0.55, min: 1, max: 4 },
                { itemId: 'cracked_tile', name: 'Cracked Tile', chance: 0.35, min: 1, max: 3 },
                { itemId: 'rusted_nails', name: 'Rusted Nails', chance: 0.40, min: 2, max: 5 },
                { itemId: 'broken_tool_handle', name: 'Broken Tool Handle', chance: 0.15, min: 1, max: 1 },
                { itemId: 'intact_brick', name: 'Intact Brick', chance: 0.12, min: 1, max: 1 },
                { itemId: 'small_gem_chip', name: 'Small Gem Chip', chance: 0.02, min: 1, max: 1 }
            ]
        }
    },
    {
        id: 'sc_crate',
        name: 'Check Abandoned Crate',
        level: 8,
        duration: 4500,
        xp: 18,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'wood_scraps', name: 'Wood Scraps', chance: 0.70, min: 2, max: 4 },
                { itemId: 'torn_cloth', name: 'Torn Cloth', chance: 0.50, min: 1, max: 2 },
                { itemId: 'rusted_hinges', name: 'Rusted Hinges', chance: 0.30, min: 1, max: 2 },
                { itemId: 'lost_coin', name: 'Lost Coin', chance: 0.10, min: 1, max: 3 },
                { itemId: 'mysterious_orb', name: 'Mysterious Orb', chance: 0.001, min: 1, max: 1 }
            ]
        }
    },
    // Legacy Task Restoration
    {
        id: 'sc_scavenge_junk',
        name: 'Scavenge Junk',
        level: 3,
        duration: 3500,
        xp: 10,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.6, min: 1, max: 2 },
                { itemId: 'bottle_caps', name: 'Bottle Caps', chance: 0.4, min: 2, max: 5 },
                { itemId: 'plastic_shards', name: 'Plastic Shards', chance: 0.3, min: 1, max: 3 }
            ]
        }
    }
];