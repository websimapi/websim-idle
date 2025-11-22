export const SCAVENGING_SKILL = {
    id: 'scavenging',
    name: 'Scavenging',
    description: 'Search through wastelands for valuable scrap and components.',
    icon: 'scavenging_icon.png',
    tasks: [
        // BEGINNER TIER (Level 1–10)
        {
            id: 'sc_trash',
            name: 'Sift Trash',
            level: 1,
            duration: 3000,
            xp: 5,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.8, min: 1, max: 3 },
                    { itemId: 'torn_cloth', name: 'Torn Cloth', chance: 0.5, min: 1, max: 2 },
                    { itemId: 'bottle_caps', name: 'Bottle Caps', chance: 0.4, min: 1, max: 5 }
                ]
            }
        },
        {
            id: 'sc_loose_scrap',
            name: 'Collect Loose Scrap',
            level: 2,
            duration: 3500,
            xp: 6,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.85, min: 1, max: 4 },
                    { itemId: 'bottle_caps', name: 'Bottle Caps', chance: 0.35, min: 1, max: 4 }
                ]
            }
        },
        {
            id: 'sc_debris',
            name: 'Pick Through Debris',
            level: 3,
            duration: 4000,
            xp: 8,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.8, min: 1, max: 4 },
                    { itemId: 'torn_cloth', name: 'Torn Cloth', chance: 0.45, min: 1, max: 3 }
                ]
            }
        },
        {
            id: 'sc_abandoned_camps',
            name: 'Search Abandoned Camps',
            level: 5,
            duration: 5000,
            xp: 12,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'torn_cloth', name: 'Torn Cloth', chance: 0.7, min: 1, max: 3 },
                    { itemId: 'bottle_caps', name: 'Bottle Caps', chance: 0.6, min: 2, max: 6 },
                    { itemId: 'old_gears', name: 'Old Gears', chance: 0.25, min: 1, max: 2 }
                ]
            }
        },
        {
            id: 'sc_rusted_metal',
            name: 'Harvest Rusted Metal',
            level: 8,
            duration: 6000,
            xp: 18,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.9, min: 2, max: 5 },
                    { itemId: 'ancient_scrap', name: 'Ancient Scrap', chance: 0.2, min: 1, max: 1 }
                ]
            }
        },

        // INTERMEDIATE TIER (Level 11–25)
        {
            id: 'sc_rubble',
            name: 'Sort Construction Rubble',
            level: 12,
            duration: 7000,
            xp: 25,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.85, min: 2, max: 5 },
                    { itemId: 'ancient_scrap', name: 'Ancient Scrap', chance: 0.25, min: 1, max: 2 }
                ]
            }
        },
        {
            id: 'sc_old_tools',
            name: 'Scavenge Old Tools',
            level: 14,
            duration: 7500,
            xp: 28,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'old_gears', name: 'Old Gears', chance: 0.6, min: 1, max: 3 },
                    { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.7, min: 1, max: 4 }
                ]
            }
        },
        {
            id: 'sc_furniture',
            name: 'Strip Furniture Frames',
            level: 15,
            duration: 8000,
            xp: 30,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.75, min: 1, max: 4 },
                    { itemId: 'torn_cloth', name: 'Torn Cloth', chance: 0.5, min: 1, max: 3 }
                ]
            }
        },
        {
            id: 'sc_outposts',
            name: 'Search Deserted Outposts',
            level: 18,
            duration: 9000,
            xp: 40,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.7, min: 2, max: 5 },
                    { itemId: 'ancient_scrap', name: 'Ancient Scrap', chance: 0.35, min: 1, max: 2 },
                    { itemId: 'mysterious_orb', name: 'Mysterious Orb', chance: 0.08, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'sc_appliances',
            name: 'Dismantle Small Appliances',
            level: 20,
            duration: 10000,
            xp: 50,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'circuit_board', name: 'Circuit Board', chance: 0.65, min: 1, max: 2 },
                    { itemId: 'broken_chip', name: 'Broken Chip', chance: 0.6, min: 1, max: 4 }
                ]
            }
        },
        {
            id: 'sc_barricades',
            name: 'Tear Down Barricades',
            level: 22,
            duration: 11000,
            xp: 55,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.85, min: 3, max: 6 },
                    { itemId: 'ancient_scrap', name: 'Ancient Scrap', chance: 0.3, min: 1, max: 2 }
                ]
            }
        },

        // ADVANCED TIER (Level 26–40)
        {
            id: 'sc_ruins',
            name: 'Explore Ruins',
            level: 30,
            duration: 10000,
            xp: 65,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'ancient_scrap', name: 'Ancient Scrap', chance: 0.6, min: 1, max: 3 },
                    { itemId: 'old_gears', name: 'Old Gears', chance: 0.5, min: 1, max: 3 },
                    { itemId: 'mysterious_orb', name: 'Mysterious Orb', chance: 0.15, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'sc_vehicles',
            name: 'Dismantle Vehicles',
            level: 32,
            duration: 12000,
            xp: 75,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.8, min: 3, max: 7 },
                    { itemId: 'old_gears', name: 'Old Gears', chance: 0.55, min: 1, max: 3 },
                    { itemId: 'circuit_board', name: 'Circuit Board', chance: 0.25, min: 1, max: 2 }
                ]
            }
        },
        {
            id: 'sc_industrial',
            name: 'Strip Industrial Scrap',
            level: 34,
            duration: 13000,
            xp: 90,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.85, min: 3, max: 7 },
                    { itemId: 'ancient_scrap', name: 'Ancient Scrap', chance: 0.45, min: 1, max: 3 }
                ]
            }
        },
        {
            id: 'sc_cores',
            name: 'Salvage Machinery Cores',
            level: 37,
            duration: 14000,
            xp: 120,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'circuit_board', name: 'Circuit Board', chance: 0.65, min: 1, max: 2 },
                    { itemId: 'power_core', name: 'Power Core', chance: 0.3, min: 1, max: 1 },
                    { itemId: 'broken_chip', name: 'Broken Chip', chance: 0.5, min: 1, max: 4 }
                ]
            }
        },
        {
            id: 'sc_cargo',
            name: 'Break Open Cargo Containers',
            level: 40,
            duration: 15000,
            xp: 150,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.7, min: 3, max: 8 },
                    { itemId: 'power_core', name: 'Power Core', chance: 0.25, min: 1, max: 2 },
                    { itemId: 'mysterious_orb', name: 'Mysterious Orb', chance: 0.15, min: 1, max: 1 }
                ]
            }
        },

        // EXPERT TIER (Level 41–60)
        {
            id: 'sc_power_cells',
            name: 'Extract Power Cells',
            level: 42,
            duration: 16000,
            xp: 170,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'power_core', name: 'Power Core', chance: 0.4, min: 1, max: 2 },
                    { itemId: 'circuit_board', name: 'Circuit Board', chance: 0.5, min: 1, max: 2 }
                ]
            }
        },
        {
            id: 'sc_drones',
            name: 'Recover Drone Parts',
            level: 45,
            duration: 17000,
            xp: 200,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'drone_parts', name: 'Drone Parts', chance: 0.65, min: 1, max: 3 },
                    { itemId: 'circuit_board', name: 'Circuit Board', chance: 0.45, min: 1, max: 2 }
                ]
            }
        },
        {
            id: 'sc_tech',
            name: 'Salvage Tech',
            level: 50,
            duration: 20000,
            xp: 80,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'circuit_board', name: 'Circuit Board', chance: 0.65, min: 1, max: 2 },
                    { itemId: 'power_core', name: 'Power Core', chance: 0.25, min: 1, max: 1 },
                    { itemId: 'broken_chip', name: 'Broken Chip', chance: 0.5, min: 1, max: 4 }
                ]
            }
        },
        {
            id: 'sc_mech',
            name: 'Disassemble Mech Frames',
            level: 55,
            duration: 22000,
            xp: 260,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'mech_plating', name: 'Mech Plating', chance: 0.6, min: 1, max: 3 },
                    { itemId: 'scrap_metal', name: 'Scrap Metal', chance: 0.7, min: 3, max: 8 },
                    { itemId: 'power_core', name: 'Power Core', chance: 0.2, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'sc_lab',
            name: 'Strip Laboratory Consoles',
            level: 58,
            duration: 23000,
            xp: 300,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'lab_components', name: 'Lab Components', chance: 0.6, min: 1, max: 3 },
                    { itemId: 'circuit_board', name: 'Circuit Board', chance: 0.5, min: 1, max: 2 },
                    { itemId: 'mysterious_orb', name: 'Mysterious Orb', chance: 0.1, min: 1, max: 1 }
                ]
            }
        },

        // LEGENDARY TIER (Level 60–80)
        {
            id: 'sc_quantum',
            name: 'Extract Quantum Components',
            level: 62,
            duration: 24000,
            xp: 350,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'quantum_components', name: 'Quantum Components', chance: 0.55, min: 1, max: 2 },
                    { itemId: 'power_core', name: 'Power Core', chance: 0.3, min: 1, max: 2 }
                ]
            }
        },
        {
            id: 'sc_automatons',
            name: 'Disassemble Ancient Automatons',
            level: 70,
            duration: 26000,
            xp: 500,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'automaton_core', name: 'Automaton Core', chance: 0.6, min: 1, max: 2 },
                    { itemId: 'ancient_scrap', name: 'Ancient Scrap', chance: 0.45, min: 1, max: 3 }
                ]
            }
        },
        {
            id: 'sc_research',
            name: 'Raid Fallen Research Sites',
            level: 75,
            duration: 28000,
            xp: 650,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'research_data', name: 'Research Data Cache', chance: 0.55, min: 1, max: 2 },
                    { itemId: 'mysterious_orb', name: 'Mysterious Orb', chance: 0.2, min: 1, max: 1 },
                    { itemId: 'circuit_board', name: 'Circuit Board', chance: 0.4, min: 1, max: 3 }
                ]
            }
        },
        {
            id: 'sc_star_tech',
            name: 'Harvest Star-Era Tech',
            level: 80,
            duration: 30000,
            xp: 900,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'star_tech', name: 'Star-Era Tech Relic', chance: 0.6, min: 1, max: 1 },
                    { itemId: 'quantum_components', name: 'Quantum Components', chance: 0.5, min: 1, max: 2 },
                    { itemId: 'power_core', name: 'Power Core', chance: 0.35, min: 1, max: 2 },
                    { itemId: 'mysterious_orb', name: 'Mysterious Orb', chance: 0.15, min: 1, max: 1 }
                ]
            }
        }
    ]
};