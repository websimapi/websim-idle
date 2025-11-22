export const FISHING_SKILL = {
    id: 'fishing',
    name: 'Fishing',
    description: 'Cast your line to catch fish for food and trade.',
    icon: 'fishing_icon.png',
    tasks: [
        { 
            id: 'fi_shrimp', 
            name: 'Net Shrimp', 
            level: 1, 
            duration: 4000, 
            xp: 8,
            reward: {
                type: 'quantity',
                itemId: 'fish_shrimp',
                min: 1,
                max: 20
            }
        },
        { 
            id: 'fi_trout', 
            name: 'Lure Trout', 
            level: 20, 
            duration: 9000, 
            xp: 35,
            reward: {
                type: 'quantity',
                itemId: 'fish_trout',
                min: 1,
                max: 1
            }
        },
        { 
            id: 'fi_shark', 
            name: 'Harpoon Shark', 
            level: 70, 
            duration: 15000, 
            xp: 100,
            reward: {
                type: 'quantity',
                itemId: 'fish_shark',
                min: 1,
                max: 1
            }
        }
    ]
};