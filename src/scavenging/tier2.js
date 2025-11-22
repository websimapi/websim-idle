export const SCAVENGING_TIER_2 = [
    // TIER 2 – MECHANICAL SCRAP (Lv 10–25)
    {
        id: 'sc_scrap_piles',
        name: 'Sort Scrap Piles',
        level: 10,
        duration: 6000,
        xp: 25,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'scrap_metal_plate', name: 'Scrap Metal Plate', chance: 0.60, min: 1, max: 2 },
                { itemId: 'copper_wire', name: 'Copper Wire', chance: 0.55, min: 1, max: 3 },
                { itemId: 'gear_fragment', name: 'Gear Fragment', chance: 0.35, min: 1, max: 2 },
                { itemId: 'small_spring', name: 'Small Spring', chance: 0.20, min: 1, max: 1 },
                { itemId: 'intact_gear', name: 'Intact Gear', chance: 0.12, min: 1, max: 1 },
                { itemId: 'broken_servo', name: 'Broken Servo', chance: 0.03, min: 1, max: 1 }
            ]
        }
    },
    // Legacy Task Restoration
    {
        id: 'sc_analyze_tech',
        name: 'Analyze Tech',
        level: 12,
        duration: 6500,
        xp: 30,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'circuit_board', name: 'Circuit Board', chance: 0.4, min: 1, max: 1 },
                { itemId: 'broken_chip', name: 'Broken Chip', chance: 0.5, min: 1, max: 3 },
                { itemId: 'research_data', name: 'Research Data', chance: 0.15, min: 1, max: 1 }
            ]
        }
    },
    {
        id: 'sc_drain',
        name: 'Drain Dredging',
        level: 15,
        duration: 7500,
        xp: 35,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'slick_sludge', name: 'Slick Sludge', chance: 0.50, min: 1, max: 1 },
                { itemId: 'waterlogged_scrap', name: 'Waterlogged Scrap', chance: 0.40, min: 1, max: 3 },
                { itemId: 'moldy_cloth', name: 'Moldy Cloth', chance: 0.25, min: 1, max: 1 },
                { itemId: 'corroded_battery', name: 'Corroded Battery', chance: 0.18, min: 1, max: 1 },
                { itemId: 'intact_fuse', name: 'Intact Fuse', chance: 0.10, min: 1, max: 1 },
                { itemId: 'old_pendant', name: 'Old Pendant', chance: 0.02, min: 1, max: 1 }
            ]
        }
    },
    {
        id: 'sc_dump',
        name: 'Dump Excavation',
        level: 20,
        duration: 9000,
        xp: 50,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'mixed_scrap', name: 'Mixed Scrap', chance: 0.65, min: 2, max: 4 },
                { itemId: 'glass_shards', name: 'Glass Shards', chance: 0.50, min: 2, max: 5 },
                { itemId: 'metal_pipe_chunk', name: 'Metal Pipe Chunk', chance: 0.30, min: 1, max: 1 },
                { itemId: 'broken_circuit_board', name: 'Broken Circuit Board', chance: 0.20, min: 1, max: 2 },
                { itemId: 'intact_container', name: 'Intact Container', chance: 0.12, min: 1, max: 1 },
                { itemId: 'ancient_coin', name: 'Ancient Coin', chance: 0.015, min: 1, max: 1 },
                { itemId: 'recovered_trinket', name: 'Recovered Trinket', chance: 0.002, min: 1, max: 1 }
            ]
        }
    },
    {
        id: 'sc_drone',
        name: 'Dismantle Broken Drone',
        level: 23,
        duration: 9500,
        xp: 60,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'drone_parts', name: 'Drone Parts', chance: 0.60, min: 1, max: 2 },
                { itemId: 'small_battery', name: 'Small Battery', chance: 0.40, min: 1, max: 1 },
                { itemId: 'camera_lens', name: 'Camera Lens', chance: 0.25, min: 1, max: 1 },
                { itemId: 'copper_wire', name: 'Copper Wire', chance: 0.35, min: 1, max: 3 },
                { itemId: 'broken_chip', name: 'Broken Chip', chance: 0.15, min: 1, max: 1 }
            ]
        }
    }
];