export const SCAVENGING_TIER_3 = [
    // TIER 3 – ABANDONED STRUCTURES (Lv 25–45)
    {
        id: 'sc_shack',
        name: 'Search Abandoned Shack',
        level: 25,
        duration: 10000,
        xp: 65,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'wood_scraps', name: 'Wood Scraps', chance: 0.60, min: 2, max: 5 },
                { itemId: 'rusted_hinges', name: 'Rusted Hinges', chance: 0.35, min: 1, max: 2 },
                { itemId: 'fabric_scraps', name: 'Fabric Scraps', chance: 0.30, min: 1, max: 1 },
                { itemId: 'intact_lock', name: 'Intact Lock', chance: 0.15, min: 1, max: 1 },
                { itemId: 'polished_stone', name: 'Polished Stone', chance: 0.10, min: 1, max: 1 },
                { itemId: 'old_journal_page', name: 'Old Journal Page', chance: 0.02, min: 1, max: 1 },
                { itemId: 'strange_key', name: 'Strange Key', chance: 0.0015, min: 1, max: 1 }
            ]
        }
    },
    // Legacy Task Restoration
    {
        id: 'sc_decode_signal',
        name: 'Decode Signal',
        level: 32,
        duration: 12500,
        xp: 95,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'research_data', name: 'Research Data', chance: 0.6, min: 1, max: 2 },
                { itemId: 'encrypted_drive', name: 'Encrypted Drive', chance: 0.3, min: 1, max: 1 },
                { itemId: 'star_tech', name: 'Star-Era Tech Relic', chance: 0.05, min: 1, max: 1 }
            ]
        }
    },
    {
        id: 'sc_outpost',
        name: 'Loot Ruined Outpost',
        level: 30,
        duration: 12000,
        xp: 85,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'metal_panel', name: 'Metal Panel', chance: 0.55, min: 1, max: 2 },
                { itemId: 'wire_bundle', name: 'Wire Bundle', chance: 0.40, min: 1, max: 3 },
                { itemId: 'reinforced_bolts', name: 'Reinforced Bolts', chance: 0.35, min: 1, max: 3 },
                { itemId: 'structural_beam_piece', name: 'Structural Beam Piece', chance: 0.15, min: 1, max: 1 },
                { itemId: 'military_tag', name: 'Military Tag', chance: 0.08, min: 1, max: 1 },
                { itemId: 'encrypted_drive', name: 'Encrypted Drive', chance: 0.025, min: 1, max: 1 },
                { itemId: 'outpost_badge', name: 'Outpost Badge', chance: 0.001, min: 1, max: 1 }
            ]
        }
    },
    {
        id: 'sc_warehouse',
        name: 'Warehouse Salvage',
        level: 35,
        duration: 13500,
        xp: 110,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'sheet_metal', name: 'Sheet Metal', chance: 0.60, min: 1, max: 2 },
                { itemId: 'large_crate_splinter', name: 'Large Crate Splinter', chance: 0.35, min: 1, max: 4 },
                { itemId: 'loose_bearings', name: 'Loose Bearings', chance: 0.40, min: 2, max: 5 },
                { itemId: 'conveyor_belt_scrap', name: 'Conveyor Belt Scrap', chance: 0.14, min: 1, max: 1 },
                { itemId: 'storage_label_roll', name: 'Storage Label Roll', chance: 0.10, min: 1, max: 1 },
                { itemId: 'broken_loader_arm', name: 'Broken Loader Arm', chance: 0.02, min: 1, max: 1 },
                { itemId: 'data_fragment', name: 'Data Fragment', chance: 0.0008, min: 1, max: 1 }
            ]
        }
    },
    {
        id: 'sc_fortress',
        name: 'Explore Fortress Ruins',
        level: 40,
        duration: 15000,
        xp: 140,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'broken_masonry', name: 'Broken Masonry', chance: 0.55, min: 2, max: 5 },
                { itemId: 'iron_strut', name: 'Iron Strut', chance: 0.35, min: 1, max: 2 },
                { itemId: 'worn_banner_cloth', name: 'Worn Banner Cloth', chance: 0.30, min: 1, max: 1 },
                { itemId: 'reinforced_iron_plate', name: 'Reinforced Iron Plate', chance: 0.14, min: 1, max: 1 },
                { itemId: 'ancient_relief_fragment', name: 'Ancient Relief Fragment', chance: 0.09, min: 1, max: 1 },
                { itemId: 'royal_seal', name: 'Royal Seal', chance: 0.015, min: 1, max: 1 },
                { itemId: 'ornate_chest_plate', name: 'Ornate Chest Plate (Broken)', chance: 0.0005, min: 1, max: 1 }
            ]
        }
    },
    {
        id: 'sc_bunker',
        name: 'Excavate Bunkers',
        level: 42,
        duration: 16000,
        xp: 160,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'concrete_chunk', name: 'Concrete Chunk', chance: 0.60, min: 2, max: 4 },
                { itemId: 'rebar_fragment', name: 'Rebar Fragment', chance: 0.45, min: 1, max: 3 },
                { itemId: 'old_rations', name: 'Old Rations', chance: 0.25, min: 1, max: 2 },
                { itemId: 'ammo_casing', name: 'Ammo Casing', chance: 0.30, min: 2, max: 5 },
                { itemId: 'military_tag', name: 'Military Tag', chance: 0.10, min: 1, max: 1 }
            ]
        }
    }
];