export const WOODCUTTING_SKILL = {
    id: 'woodcutting',
    name: 'Woodcutting',
    description: 'Chop trees to gather logs for construction and firemaking.',
    icon: 'woodcutting_icon.png',
    tasks: [
        // BEGINNER TIER (Level 1–10)
        { 
            id: 'wc_birch', 
            name: 'Chop Birch', 
            level: 1, 
            duration: 3000,  // 3s
            xp: 5,
            reward: {
                type: 'quantity',
                itemId: 'log_birch',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_pine', 
            name: 'Chop Pine', 
            level: 2, 
            duration: 3500, // 3.5s
            xp: 6,
            reward: {
                type: 'quantity',
                itemId: 'log_pine',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_willow', 
            name: 'Chop Willow', 
            level: 3, 
            duration: 4000, // 4s
            xp: 8,
            reward: {
                type: 'quantity',
                itemId: 'log_willow',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_poplar', 
            name: 'Chop Poplar', 
            level: 4, 
            duration: 4500, // 4.5s
            xp: 10,
            reward: {
                type: 'quantity',
                itemId: 'log_poplar',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_alder', 
            name: 'Chop Alder', 
            level: 6, 
            duration: 5000, // 5s
            xp: 15,
            reward: {
                type: 'quantity',
                itemId: 'log_alder',
                min: 1,
                max: 3
            }
        },

        // INTERMEDIATE TIER (Level 11–20)
        { 
            id: 'wc_maple', 
            name: 'Chop Maple', 
            level: 12, 
            duration: 6000, // 6s
            xp: 25,
            reward: {
                type: 'quantity',
                itemId: 'log_maple',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_cedar', 
            name: 'Chop Cedar', 
            level: 14, 
            duration: 6500, // 6.5s
            xp: 30,
            reward: {
                type: 'quantity',
                itemId: 'log_cedar',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_elm', 
            name: 'Chop Elm', 
            level: 16, 
            duration: 7000, // 7s
            xp: 35,
            reward: {
                type: 'quantity',
                itemId: 'log_elm',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_chestnut', 
            name: 'Chop Chestnut', 
            level: 17, 
            duration: 7500, // 7.5s
            xp: 40,
            reward: {
                type: 'quantity',
                itemId: 'log_chestnut',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_beech', 
            name: 'Chop Beech', 
            level: 20, 
            duration: 8000, // 8s
            xp: 50,
            reward: {
                type: 'quantity',
                itemId: 'log_beech',
                min: 1,
                max: 3
            }
        },

        // ADVANCED TIER (Level 21–35)
        { 
            id: 'wc_oak', 
            name: 'Chop Oak', 
            level: 21, 
            duration: 9000, // 9s
            xp: 60,
            reward: {
                type: 'quantity',
                itemId: 'log_oak',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_ash', 
            name: 'Chop Ash', 
            level: 23, 
            duration: 9500, // 9.5s
            xp: 70,
            reward: {
                type: 'quantity',
                itemId: 'log_ash',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_walnut', 
            name: 'Chop Walnut', 
            level: 25, 
            duration: 10000, // 10s
            xp: 85,
            reward: {
                type: 'quantity',
                itemId: 'log_walnut',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_sycamore', 
            name: 'Chop Sycamore', 
            level: 27, 
            duration: 11000, // 11s
            xp: 100,
            reward: {
                type: 'quantity',
                itemId: 'log_sycamore',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_hornbeam', 
            name: 'Chop Hornbeam', 
            level: 30, 
            duration: 12000, // 12s
            xp: 120,
            reward: {
                type: 'quantity',
                itemId: 'log_hornbeam',
                min: 1,
                max: 3
            }
        },

        // EXPERT TIER (Level 36–50)
        { 
            id: 'wc_yew', 
            name: 'Chop Yew', 
            level: 36, 
            duration: 13000, // 13s
            xp: 150,
            reward: {
                type: 'quantity',
                itemId: 'log_yew',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_cherry', 
            name: 'Chop Cherry', 
            level: 38, 
            duration: 14000, // 14s
            xp: 180,
            reward: {
                type: 'quantity',
                itemId: 'log_cherry',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_ebony', 
            name: 'Chop Ebony', 
            level: 45, 
            duration: 16000, // 16s
            xp: 250,
            reward: {
                type: 'quantity',
                itemId: 'log_ebony',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_olive', 
            name: 'Chop Olive', 
            level: 48, 
            duration: 17000, // 17s
            xp: 300,
            reward: {
                type: 'quantity',
                itemId: 'log_olive',
                min: 1,
                max: 3
            }
        },

        // LEGENDARY TIER (Level 50–80)
        { 
            id: 'wc_ironwood', 
            name: 'Chop Ironwood', 
            level: 55, 
            duration: 20000, // 20s
            xp: 400,
            reward: {
                type: 'quantity',
                itemId: 'log_ironwood',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_black_locust', 
            name: 'Chop Black Locust', 
            level: 58, 
            duration: 22000, // 22s
            xp: 475,
            reward: {
                type: 'quantity',
                itemId: 'log_black_locust',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_dragonfir', 
            name: 'Chop Dragonfir', 
            level: 65, 
            duration: 25000, // 25s
            xp: 600,
            reward: {
                type: 'quantity',
                itemId: 'log_dragonfir',
                min: 1,
                max: 3
            }
        },
        { 
            id: 'wc_world_oak', 
            name: 'Chop World Oak', 
            level: 75, 
            duration: 30000, // 30s
            xp: 800,
            reward: {
                type: 'quantity',
                itemId: 'log_world_oak',
                min: 1,
                max: 3
            }
        }
    ]
};