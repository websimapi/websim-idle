export const SCAVENGING_TIER_5 = [
    // TIER 5 – HIGH-END SALVAGE (Lv 70–90)
    {
        id: 'sc_orbital',
        name: 'Orbital Debris Salvage',
        level: 75,
        duration: 28000,
        xp: 550,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'satellite_dish', name: 'Satellite Dish', chance: 0.40, min: 1, max: 1 },
                { itemId: 'solar_panel_shard', name: 'Solar Panel Shard', chance: 0.50, min: 2, max: 4 },
                { itemId: 'vacuum_sealed_pouch', name: 'Vacuum Pouch', chance: 0.25, min: 1, max: 2 },
                { itemId: 'cosmic_dust', name: 'Cosmic Dust', chance: 0.15, min: 1, max: 3 },
                { itemId: 'hyperalloy_scrap', name: 'Hyperalloy Scrap', chance: 0.10, min: 1, max: 2 }
            ]
        }
    },
    {
        id: 'sc_alien',
        name: 'Alien Artifact Recovery',
        level: 85,
        duration: 32000,
        xp: 680,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'alien_glyph', name: 'Alien Glyph', chance: 0.30, min: 1, max: 1 },
                { itemId: 'unknown_alloy', name: 'Unknown Alloy', chance: 0.25, min: 1, max: 2 },
                { itemId: 'singularity_shards', name: 'Singularity Shards', chance: 0.15, min: 1, max: 3 },
                { itemId: 'quantum_core', name: 'Quantum Core', chance: 0.002, min: 1, max: 1 }
            ]
        }
    },
    {
        id: 'sc_quantum',
        name: 'Quantum Core Retrieval',
        level: 90,
        duration: 35000,
        xp: 800,
        reward: {
            type: 'lootTable',
            table: [
                { itemId: 'hyperalloy_scrap', name: 'Hyperalloy Scrap', chance: 0.45, min: 1, max: 3 },
                { itemId: 'quantum_flux_cable', name: 'Quantum Flux Cable', chance: 0.35, min: 1, max: 1 },
                { itemId: 'stabilized_crystal_shard', name: 'Stabilized Crystal Shard', chance: 0.30, min: 1, max: 2 },
                { itemId: 'isotope_regulator', name: 'Isotope Regulator', chance: 0.12, min: 1, max: 1 },
                { itemId: 'chrono_stamped_plate', name: 'Chrono-Stamped Plate', chance: 0.07, min: 1, max: 1 },
                { itemId: 'quantum_memory_lattice', name: 'Quantum Memory Lattice', chance: 0.005, min: 1, max: 1 },
                { itemId: 'quantum_core', name: 'Quantum Core', chance: 0.0001, min: 1, max: 1 }
            ]
        }
    }
];