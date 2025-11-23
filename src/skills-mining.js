export const MINING_SKILL = {
    id: 'mining',
    name: 'Mining',
    description: 'Strike the earth to uncover ores, gems, and ancient secrets.',
    icon: 'mining_icon.png',
    tasks: [
        // TIER 1 – SOFT EARTH & BASICS (Lv 1–10)
        {
            id: 'mi_stone',
            name: 'Quarry Crumbled Stone',
            level: 1,
            duration: 3000, // 3s
            xp: 5,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'small_stone', name: 'Small Stone', chance: 0.70, min: 2, max: 5 },
                    { itemId: 'cracked_pebble', name: 'Cracked Pebble', chance: 0.50, min: 1, max: 3 },
                    { itemId: 'rough_flint', name: 'Rough Flint', chance: 0.10, min: 1, max: 1 },
                    { itemId: 'dull_shard', name: 'Dull Shard', chance: 0.01, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_limestone',
            name: 'Cut Limestone',
            level: 5,
            duration: 4000, // 4s
            xp: 12,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'limestone_chunk', name: 'Limestone Chunk', chance: 0.70, min: 2, max: 4 },
                    { itemId: 'chalk_dust', name: 'Chalk Dust', chance: 0.40, min: 1, max: 3 },
                    { itemId: 'fossil_fragment', name: 'Fossil Fragment', chance: 0.12, min: 1, max: 1 },
                    { itemId: 'ancient_shell', name: 'Ancient Shell', chance: 0.012, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_coal',
            name: 'Mine Coal Seam',
            level: 10,
            duration: 5000, // 5s
            xp: 18,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'coal', name: 'Coal', chance: 0.70, min: 1, max: 4 },
                    { itemId: 'dense_coal', name: 'Dense Coal', chance: 0.35, min: 1, max: 2 },
                    { itemId: 'volatile_ember', name: 'Volatile Ember', chance: 0.12, min: 1, max: 1 },
                    { itemId: 'ember_core', name: 'Ember Core', chance: 0.009, min: 1, max: 1 }
                ]
            }
        },

        // TIER 2 – BASIC METALS (Lv 10–25)
        {
            id: 'mi_copper',
            name: 'Mine Copper Vein',
            level: 10,
            duration: 6000, // 6s
            xp: 25,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'copper_ore', name: 'Copper Ore', chance: 0.75, min: 1, max: 3 },
                    { itemId: 'malachite_chip', name: 'Malachite Chip', chance: 0.30, min: 1, max: 1 },
                    { itemId: 'copper_nugget', name: 'Copper Nugget', chance: 0.12, min: 1, max: 1 },
                    { itemId: 'pure_copper_node', name: 'Pure Copper Node', chance: 0.01, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_tin',
            name: 'Mine Tin Vein',
            level: 15,
            duration: 7000, // 7s
            xp: 30,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'tin_ore', name: 'Tin Ore', chance: 0.70, min: 1, max: 3 },
                    { itemId: 'cassiterite_shard', name: 'Cassiterite Shard', chance: 0.35, min: 1, max: 1 },
                    { itemId: 'tin_nugget', name: 'Tin Nugget', chance: 0.10, min: 1, max: 1 },
                    { itemId: 'smelters_lump', name: 'Smelter’s Lump', chance: 0.009, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_iron',
            name: 'Mine Iron Vein',
            level: 20,
            duration: 8000, // 8s
            xp: 40,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'iron_ore', name: 'Iron Ore', chance: 0.70, min: 2, max: 4 },
                    { itemId: 'hematite_chunk', name: 'Hematite Chunk', chance: 0.40, min: 1, max: 2 },
                    { itemId: 'iron_nugget', name: 'Iron Nugget', chance: 0.12, min: 1, max: 1 },
                    { itemId: 'pure_iron_crystal', name: 'Pure Iron Crystal', chance: 0.008, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_saltpeter',
            name: 'Excavate Saltpeter',
            level: 25,
            duration: 9000, // 9s
            xp: 50,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'saltpeter', name: 'Saltpeter', chance: 0.55, min: 2, max: 5 },
                    { itemId: 'nitric_compound', name: 'Nitric Compound', chance: 0.10, min: 1, max: 1 },
                    { itemId: 'mineral_crystal', name: 'Mineral Crystal', chance: 0.012, min: 1, max: 1 },
                    { itemId: 'stabilized_powder', name: 'Stabilized Powder', chance: 0.0005, min: 1, max: 1 }
                ]
            }
        },

        // TIER 3 – HARDER STONE & MID-METALS (Lv 25–50)
        {
            id: 'mi_silver',
            name: 'Mine Silver Vein',
            level: 30,
            duration: 10000, // 10s
            xp: 65,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'silver_ore', name: 'Silver Ore', chance: 0.65, min: 1, max: 3 },
                    { itemId: 'native_silver', name: 'Native Silver', chance: 0.12, min: 1, max: 1 },
                    { itemId: 'polished_silver_chip', name: 'Polished Silver Chip', chance: 0.012, min: 1, max: 1 },
                    { itemId: 'silver_spirit_token', name: 'Silver Spirit Token', chance: 0.0004, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_gold',
            name: 'Mine Gold Vein',
            level: 35,
            duration: 12000, // 12s
            xp: 85,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'gold_ore', name: 'Gold Ore', chance: 0.55, min: 1, max: 2 },
                    { itemId: 'gold_flake', name: 'Gold Flake', chance: 0.35, min: 1, max: 3 },
                    { itemId: 'gold_nugget', name: 'Gold Nugget', chance: 0.10, min: 1, max: 1 },
                    { itemId: 'pure_gold_ingot', name: 'Pure Gold Ingot (Raw)', chance: 0.006, min: 1, max: 1 },
                    { itemId: 'ancient_gold_sigil', name: 'Ancient Gold Sigil', chance: 0.0003, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_quartz',
            name: 'Harvest Quartz',
            level: 40,
            duration: 14000, // 14s
            xp: 100,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'quartz_crystal', name: 'Quartz Crystal', chance: 0.65, min: 1, max: 3 },
                    { itemId: 'shimmer_dust', name: 'Shimmer Dust', chance: 0.40, min: 1, max: 1 },
                    { itemId: 'prism_shard', name: 'Prism Shard', chance: 0.12, min: 1, max: 1 },
                    { itemId: 'radiant_crystal', name: 'Radiant Crystal', chance: 0.008, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_obsidian',
            name: 'Break Obsidian',
            level: 45,
            duration: 16000, // 16s
            xp: 125,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'obsidian_chunk', name: 'Obsidian Chunk', chance: 0.60, min: 1, max: 2 },
                    { itemId: 'shattered_blade_glass', name: 'Shattered Blade Glass', chance: 0.35, min: 1, max: 3 },
                    { itemId: 'black_shard', name: 'Black Shard', chance: 0.10, min: 1, max: 1 },
                    { itemId: 'volcanic_heart', name: 'Volcanic Heart', chance: 0.005, min: 1, max: 1 }
                ]
            }
        },

        // TIER 4 – RARE METALS & GEMSTONES (Lv 50–75)
        {
            id: 'mi_mithril',
            name: 'Mine Mithril',
            level: 50,
            duration: 18000, // 18s
            xp: 150,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'mithril_ore', name: 'Mithril Ore', chance: 0.55, min: 1, max: 2 },
                    { itemId: 'refined_mithril_chip', name: 'Refined Mithril Chip', chance: 0.10, min: 1, max: 1 },
                    { itemId: 'mithril_nugget', name: 'Mithril Nugget', chance: 0.008, min: 1, max: 1 },
                    { itemId: 'living_mithril_core', name: 'Living Mithril Core', chance: 0.0002, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_sapphire',
            name: 'Extract Sapphire',
            level: 55,
            duration: 20000, // 20s
            xp: 180,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'rough_sapphire', name: 'Rough Sapphire', chance: 0.45, min: 1, max: 1 },
                    { itemId: 'sapphire_shard', name: 'Sapphire Shard', chance: 0.30, min: 1, max: 2 },
                    { itemId: 'polished_sapphire', name: 'Polished Sapphire', chance: 0.12, min: 1, max: 1 },
                    { itemId: 'heart_of_the_tides', name: 'Heart of the Tides', chance: 0.004, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_ruby',
            name: 'Extract Ruby',
            level: 60,
            duration: 22000, // 22s
            xp: 220,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'rough_ruby', name: 'Rough Ruby', chance: 0.45, min: 1, max: 1 },
                    { itemId: 'ruby_fragment', name: 'Ruby Fragment', chance: 0.30, min: 1, max: 2 },
                    { itemId: 'polished_ruby', name: 'Polished Ruby', chance: 0.12, min: 1, max: 1 },
                    { itemId: 'ember_core_ruby', name: 'Ember Core Ruby', chance: 0.003, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_titanium',
            name: 'Mine Titanium',
            level: 65,
            duration: 24000, // 24s
            xp: 260,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'titanium_ore', name: 'Titanium Ore', chance: 0.40, min: 1, max: 2 },
                    { itemId: 'titanium_shard', name: 'Titanium Shard', chance: 0.30, min: 1, max: 1 },
                    { itemId: 'reinforced_titan_plate', name: 'Reinforced Titan Plate', chance: 0.10, min: 1, max: 1 },
                    { itemId: 'titanheart_alloy', name: 'Titanheart Alloy', chance: 0.003, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_emerald',
            name: 'Extract Emerald',
            level: 70,
            duration: 26000, // 26s
            xp: 300,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'rough_emerald', name: 'Rough Emerald', chance: 0.40, min: 1, max: 1 },
                    { itemId: 'emerald_flake', name: 'Emerald Flake', chance: 0.30, min: 1, max: 2 },
                    { itemId: 'polished_emerald', name: 'Polished Emerald', chance: 0.10, min: 1, max: 1 },
                    { itemId: 'verdant_core', name: 'Verdant Core', chance: 0.002, min: 1, max: 1 }
                ]
            }
        },

        // TIER 5 – ARCANE & PRECURSOR MINERALS (Lv 75–90)
        {
            id: 'mi_starsteel',
            name: 'Mine Starsteel',
            level: 75,
            duration: 30000, // 30s
            xp: 400,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'starsteel_ore', name: 'Starsteel Ore', chance: 0.35, min: 1, max: 1 },
                    { itemId: 'meteoric_fragment', name: 'Meteoric Fragment', chance: 0.08, min: 1, max: 1 },
                    { itemId: 'celestial_alloy', name: 'Celestial Alloy', chance: 0.002, min: 1, max: 1 },
                    { itemId: 'fallen_star_core', name: 'Fallen Star Core', chance: 0.0001, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_mana',
            name: 'Harvest Mana Crystals',
            level: 80,
            duration: 32000, // 32s
            xp: 480,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'mana_crystal', name: 'Mana Crystal', chance: 0.40, min: 1, max: 1 },
                    { itemId: 'arcane_shard', name: 'Arcane Shard', chance: 0.30, min: 1, max: 2 },
                    { itemId: 'pure_mana_node', name: 'Pure Mana Node', chance: 0.08, min: 1, max: 1 },
                    { itemId: 'crystalized_spell_core', name: 'Crystalized Spell Core', chance: 0.0015, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_precursor',
            name: 'Excavate Precursor Alloy',
            level: 85,
            duration: 35000, // 35s
            xp: 550,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'precursor_alloy', name: 'Precursor Alloy', chance: 0.35, min: 1, max: 2 },
                    { itemId: 'alloy_chip', name: 'Alloy Chip', chance: 0.25, min: 1, max: 1 },
                    { itemId: 'stabilized_tech_plate', name: 'Stabilized Tech Plate', chance: 0.07, min: 1, max: 1 },
                    { itemId: 'ancient_power_core', name: 'Ancient Power Core', chance: 0.0008, min: 1, max: 1 }
                ]
            }
        },
        {
            id: 'mi_quantum',
            name: 'Mine Quantum Crystals',
            level: 90,
            duration: 40000, // 40s
            xp: 700,
            reward: {
                type: 'lootTable',
                table: [
                    { itemId: 'quantum_crystal', name: 'Quantum Crystal', chance: 0.30, min: 1, max: 1 },
                    { itemId: 'phase_shard', name: 'Phase Shard', chance: 0.25, min: 1, max: 1 },
                    { itemId: 'temporal_fragment', name: 'Temporal Fragment', chance: 0.05, min: 1, max: 1 },
                    { itemId: 'quantum_singularity_core', name: 'Quantum Singularity Core', chance: 0.00005, min: 1, max: 1 }
                ]
            }
        }
    ]
};