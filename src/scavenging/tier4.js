export const SCAVENGING_TIER_4 = [
    // TIER 4 – PRECURSOR TECH (Lv 45–70)
    {
        id: 'sc_vehicles',
        name: 'Dismantle Vehicles',
        level: 50,
        duration: 18000,
        xp: 200,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'engine_scrap', name: 'Engine Scrap', chance: 0.60, min: 1, max: 3 },
                { itemId: 'belt_hose_parts', name: 'Belt & Hose Parts', chance: 0.40, min: 1, max: 2 },
                { itemId: 'electronic_fragments', name: 'Electronic Fragments', chance: 0.30, min: 1, max: 3 },
                { itemId: 'intact_spark_unit', name: 'Intact Spark Unit', chance: 0.15, min: 1, max: 1 },
                { itemId: 'reinforced_gear', name: 'Reinforced Gear', chance: 0.10, min: 1, max: 1 },
                { itemId: 'vehicle_data_core', name: 'Vehicle Data Core', chance: 0.012, min: 1, max: 1 },
                { itemId: 'prototype_motor_part', name: 'Prototype Motor Part', chance: 0.0004, min: 1, max: 1 }
            ]
        }
    },
    // Legacy Task Restoration
    {
        id: 'sc_extract_core',
        name: 'Extract Core',
        level: 52,
        duration: 19000,
        xp: 220,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'automaton_core', name: 'Automaton Core', chance: 0.4, min: 1, max: 1 },
                { itemId: 'power_core', name: 'Power Core', chance: 0.35, min: 1, max: 1 },
                { itemId: 'mech_plating', name: 'Mech Plating', chance: 0.5, min: 1, max: 2 }
            ]
        }
    },
    {
        id: 'sc_industrial',
        name: 'Industrial Harvest',
        level: 55,
        duration: 20000,
        xp: 250,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'alloy_plates', name: 'Alloy Plates', chance: 0.55, min: 1, max: 3 },
                { itemId: 'power_coil', name: 'Power Coil', chance: 0.40, min: 1, max: 1 },
                { itemId: 'metal_tubing', name: 'Metal Tubing', chance: 0.35, min: 1, max: 3 },
                { itemId: 'hydraulic_rod', name: 'Hydraulic Rod', chance: 0.16, min: 1, max: 1 },
                { itemId: 'spark_blueprint_fragment', name: 'Spark Blueprint Fragment', chance: 0.08, min: 1, max: 1 },
                { itemId: 'reactor_shard', name: 'Reactor Shard', chance: 0.01, min: 1, max: 1 },
                { itemId: 'stabilized_core_fragment', name: 'Stabilized Core Fragment', chance: 0.0003, min: 1, max: 1 }
            ]
        }
    },
    {
        id: 'sc_lab',
        name: 'Precursor Lab Scrapping',
        level: 60,
        duration: 22000,
        xp: 320,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'lab_scrap', name: 'Lab Scrap', chance: 0.50, min: 1, max: 3 },
                { itemId: 'broken_analyzer', name: 'Broken Analyzer', chance: 0.40, min: 1, max: 1 },
                { itemId: 'crystalized_data_powder', name: 'Crystalized Data Powder', chance: 0.30, min: 1, max: 1 },
                { itemId: 'intact_sensor', name: 'Intact Sensor', chance: 0.14, min: 1, max: 1 },
                { itemId: 'precursor_alloy', name: 'Precursor Alloy', chance: 0.09, min: 1, max: 1 },
                { itemId: 'biometric_keycard', name: 'Biometric Keycard', chance: 0.01, min: 1, max: 1 },
                { itemId: 'miniature_energy_cell', name: 'Miniature Energy Cell', chance: 0.0003, min: 1, max: 1 }
            ]
        }
    },
    {
        id: 'sc_plasma',
        name: 'Plasma Vent Maintenance',
        level: 65,
        duration: 24000,
        xp: 380,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'plasma_residue', name: 'Plasma Residue', chance: 0.55, min: 1, max: 2 },
                { itemId: 'burnt_coil', name: 'Burnt Coil', chance: 0.45, min: 1, max: 2 },
                { itemId: 'heat_sink', name: 'Heat Sink', chance: 0.35, min: 1, max: 1 },
                { itemId: 'power_regulator', name: 'Power Regulator', chance: 0.15, min: 1, max: 1 },
                { itemId: 'cooling_module', name: 'Cooling Module', chance: 0.10, min: 1, max: 1 }
            ]
        }
    },
    {
        id: 'sc_tech',
        name: 'Salvage Tech',
        level: 70,
        duration: 25000,
        xp: 450,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'advanced_circuitry', name: 'Advanced Circuitry', chance: 0.50, min: 1, max: 3 },
                { itemId: 'tech_casing', name: 'Tech Casing', chance: 0.40, min: 1, max: 2 },
                { itemId: 'hardened_plate', name: 'Hardened Plate', chance: 0.30, min: 1, max: 1 },
                { itemId: 'power_regulator', name: 'Power Regulator', chance: 0.15, min: 1, max: 1 },
                { itemId: 'cooling_module', name: 'Cooling Module', chance: 0.08, min: 1, max: 1 },
                { itemId: 'ai_data_node', name: 'AI Data Node', chance: 0.008, min: 1, max: 1 },
                { itemId: 'tech_core', name: 'Tech Core', chance: 0.0002, min: 1, max: 1 }
            ]
        }
    }
];