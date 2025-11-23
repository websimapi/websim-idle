import { SKILLS } from './skills.js';
import { ITEM_ICONS } from './ui-inventory.js';

const UI_ASSETS = [
    'logo.png',
    'energy_icon.png',
    'user_default_pfp.png',
    'woodcutting_icon.png',
    'mining_icon.png',
    'scavenging_icon.png',
    'fishing_icon.png'
];

const SCENE_ASSETS = [
    'scene_wood_beginner.png',
    'scene_wood_intermediate.png',
    'scene_wood_advanced.png',
    'scene_wood_expert.png',
    'scene_wood_legendary.png',
    'scene_mine_tier1.png',
    'scene_mine_tier2.png',
    'scene_mine_tier3.png',
    'scene_mine_tier4.png',
    'scene_mine_tier5.png',
    'scene_scav_beginner.png',
    'scene_scav_intermediate.png',
    'scene_scav_advanced.png',
    'scene_scav_expert.png',
    'scene_scav_legendary.png',
    'scene_fish_beginner.png',
    'scene_fish_intermediate.png',
    'scene_fish_advanced.png',
    'scene_fish_expert.png',
    'scene_fish_legendary.png'
];

export async function preloadGameAssets(onProgress) {
    const allImages = new Set();

    // 1. UI Assets
    UI_ASSETS.forEach(src => allImages.add(src));

    // 2. Scene Assets
    SCENE_ASSETS.forEach(src => allImages.add(src));

    // 3. Item Icons
    Object.values(ITEM_ICONS).forEach(src => allImages.add(src));

    // 4. Skill Icons
    Object.values(SKILLS).forEach(skill => {
        if (skill.icon) allImages.add(skill.icon);
    });

    const assets = Array.from(allImages);
    const total = assets.length;
    let loaded = 0;
    
    // Concurrency Limit:
    // Use hardware concurrency when available, allow significantly more than 32,
    // but keep a sane upper bound to avoid thrashing.
    const defaultParallel = (navigator.hardwareConcurrency || 4) * 4;
    const CONCURRENCY_LIMIT = Math.min(96, Math.max(32, defaultParallel));

    console.log(`[Loader] Preloading ${total} assets (concurrency: ${CONCURRENCY_LIMIT})...`);

    // Initialize progress
    if (onProgress) onProgress(0, total);

    // Worker function: pulls from the shared index until done
    let nextIndex = 0;
    const worker = async () => {
        while (nextIndex < total) {
            const currentIndex = nextIndex++;
            const src = assets[currentIndex];
            
            await new Promise((resolve) => {
                const img = new Image();
                
                const done = () => {
                    loaded++;
                    if (onProgress) onProgress(loaded, total);
                    resolve(true);
                };

                img.onload = () => {
                    // Use img.decode() if available to prep image for rendering
                    // This prevents UI freeze/flash when first displayed
                    if ('decode' in img) {
                        img.decode()
                            .then(done)
                            .catch(() => done());
                    } else {
                        done();
                    }
                };
                
                img.onerror = () => {
                    console.warn(`[Loader] Failed to load asset: ${src}`);
                    done();
                };
                
                img.src = src;
            });
        }
    };

    // Spawn workers
    const workers = [];
    const workerCount = Math.min(total, CONCURRENCY_LIMIT);
    
    for (let i = 0; i < workerCount; i++) {
        workers.push(worker());
    }

    await Promise.all(workers);
    console.log(`[Loader] All assets loaded.`);
}