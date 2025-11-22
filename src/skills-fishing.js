export const FISHING_SKILL = {
    id: 'fishing',
    name: 'Fishing',
    description: 'Cast your line to catch fish for food and trade.',
    icon: 'fishing_icon.png',
    tasks: [
        // BEGINNER TIER (Level 1–10)
        {
            id: 'fi_shrimp',
            name: 'Net Shrimp',
            level: 1,
            duration: 3000, // 3s
            xp: 5,
            reward: {
                type: 'quantity',
                itemId: 'fish_shrimp',
                min: 1,
                max: 5
            }
        },
        {
            id: 'fi_minnow',
            name: 'Scoop Minnow',
            level: 2,
            duration: 3200, // 3.2s
            xp: 6,
            reward: {
                type: 'quantity',
                itemId: 'fish_minnow',
                min: 1,
                max: 6
            }
        },
        {
            id: 'fi_sardine',
            name: 'Hook Sardine',
            level: 4,
            duration: 3500, // 3.5s
            xp: 8,
            reward: {
                type: 'quantity',
                itemId: 'fish_sardine',
                min: 1,
                max: 4
            }
        },
        {
            id: 'fi_small_crab',
            name: 'Trap Small Crab',
            level: 7,
            duration: 4000, // 4s
            xp: 12,
            reward: {
                type: 'quantity',
                itemId: 'fish_small_crab',
                min: 1,
                max: 3
            }
        },
        {
            id: 'fi_anchovy',
            name: 'Line Anchovy',
            level: 10,
            duration: 4500, // 4.5s
            xp: 15,
            reward: {
                type: 'quantity',
                itemId: 'fish_anchovy',
                min: 1,
                max: 5
            }
        },

        // INTERMEDIATE TIER (Level 11–30)
        {
            id: 'fi_bass',
            name: 'Catch Bass',
            level: 12,
            duration: 6000, // 6s
            xp: 22,
            reward: {
                type: 'quantity',
                itemId: 'fish_bass',
                min: 1,
                max: 3
            }
        },
        {
            id: 'fi_catfish',
            name: 'Bottom-Fish Catfish',
            level: 15,
            duration: 7000, // 7s
            xp: 28,
            reward: {
                type: 'quantity',
                itemId: 'fish_catfish',
                min: 1,
                max: 3
            }
        },
        {
            id: 'fi_carp',
            name: 'Hook Carp',
            level: 17,
            duration: 7500, // 7.5s
            xp: 30,
            reward: {
                type: 'quantity',
                itemId: 'fish_carp',
                min: 1,
                max: 3
            }
        },
        {
            id: 'fi_trout',
            name: 'Lure Trout',
            level: 20,
            duration: 8000, // 8s
            xp: 35,
            reward: {
                type: 'quantity',
                itemId: 'fish_trout',
                min: 1,
                max: 2
            }
        },
        {
            id: 'fi_salmon',
            name: 'Run Salmon',
            level: 25,
            duration: 9000, // 9s
            xp: 45,
            reward: {
                type: 'quantity',
                itemId: 'fish_salmon',
                min: 1,
                max: 2
            }
        },
        {
            id: 'fi_pike',
            name: 'Strike Pike',
            level: 30,
            duration: 10000, // 10s
            xp: 55,
            reward: {
                type: 'quantity',
                itemId: 'fish_pike',
                min: 1,
                max: 2
            }
        },

        // ADVANCED TIER (Level 31–50)
        {
            id: 'fi_mackerel',
            name: 'Troll Mackerel',
            level: 32,
            duration: 11000, // 11s
            xp: 65,
            reward: {
                type: 'quantity',
                itemId: 'fish_mackerel',
                min: 1,
                max: 3
            }
        },
        {
            id: 'fi_snapper',
            name: 'Reef Snapper',
            level: 35,
            duration: 12000, // 12s
            xp: 75,
            reward: {
                type: 'quantity',
                itemId: 'fish_snapper',
                min: 1,
                max: 3
            }
        },
        {
            id: 'fi_sea_bass',
            name: 'Coastal Sea Bass',
            level: 38,
            duration: 13000, // 13s
            xp: 90,
            reward: {
                type: 'quantity',
                itemId: 'fish_sea_bass',
                min: 1,
                max: 2
            }
        },
        {
            id: 'fi_eel',
            name: 'Snare Eel',
            level: 40,
            duration: 14000, // 14s
            xp: 105,
            reward: {
                type: 'quantity',
                itemId: 'fish_eel',
                min: 1,
                max: 2
            }
        },
        {
            id: 'fi_swordfish_young',
            name: 'Hook Young Swordfish',
            level: 45,
            duration: 16000, // 16s
            xp: 130,
            reward: {
                type: 'quantity',
                itemId: 'fish_swordfish_young',
                min: 1,
                max: 1
            }
        },

        // EXPERT TIER (Level 51–70)
        {
            id: 'fi_tuna',
            name: 'Battle Tuna',
            level: 52,
            duration: 18000, // 18s
            xp: 170,
            reward: {
                type: 'quantity',
                itemId: 'fish_tuna',
                min: 1,
                max: 1
            }
        },
        {
            id: 'fi_marlin',
            name: 'Reel Marlin',
            level: 55,
            duration: 19000, // 19s
            xp: 200,
            reward: {
                type: 'quantity',
                itemId: 'fish_marlin',
                min: 1,
                max: 1
            }
        },
        {
            id: 'fi_giant_eel',
            name: 'Subdue Giant Eel',
            level: 60,
            duration: 20000, // 20s
            xp: 240,
            reward: {
                type: 'quantity',
                itemId: 'fish_giant_eel',
                min: 1,
                max: 1
            }
        },
        {
            id: 'fi_shark',
            name: 'Harpoon Shark',
            level: 70,
            duration: 25000, // 25s
            xp: 350,
            reward: {
                type: 'quantity',
                itemId: 'fish_shark',
                min: 1,
                max: 1
            }
        },

        // LEGENDARY TIER (Level 71–99)
        {
            id: 'fi_leviathan',
            name: 'Call the Deep-Sea Leviathan',
            level: 75,
            duration: 28000, // 28s
            xp: 450,
            reward: {
                type: 'quantity',
                itemId: 'fish_leviathan',
                min: 1,
                max: 1
            }
        },
        {
            id: 'fi_abyssal_lanternfish',
            name: 'Lure Abyssal Lanternfish',
            level: 80,
            duration: 30000, // 30s
            xp: 520,
            reward: {
                type: 'quantity',
                itemId: 'fish_abyssal_lanternfish',
                min: 1,
                max: 2
            }
        },
        {
            id: 'fi_elder_turtle',
            name: 'Guide Elder Turtle',
            level: 90,
            duration: 32000, // 32s
            xp: 700,
            reward: {
                type: 'quantity',
                itemId: 'fish_elder_turtle',
                min: 1,
                max: 1
            }
        },
        {
            id: 'fi_cosmic_carp',
            name: 'Catch Cosmic Carp',
            level: 99,
            duration: 35000, // 35s
            xp: 1200,
            reward: {
                type: 'quantity',
                itemId: 'fish_cosmic_carp',
                min: 1,
                max: 1
            }
        }
    ]
};