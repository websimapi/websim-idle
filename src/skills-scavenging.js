import { SCAVENGING_TIER_1 } from './scavenging/tier1.js';
import { SCAVENGING_TIER_2 } from './scavenging/tier2.js';
import { SCAVENGING_TIER_3 } from './scavenging/tier3.js';
import { SCAVENGING_TIER_4 } from './scavenging/tier4.js';
import { SCAVENGING_TIER_5 } from './scavenging/tier5.js';

export const SCAVENGING_SKILL = {
    id: 'scavenging',
    name: 'Scavenging',
    description: 'Search through wastelands for valuable scrap and components.',
    icon: 'scavenging_icon.png',
    tasks: [
        ...SCAVENGING_TIER_1,
        ...SCAVENGING_TIER_2,
        ...SCAVENGING_TIER_3,
        ...SCAVENGING_TIER_4,
        ...SCAVENGING_TIER_5
    ]
};