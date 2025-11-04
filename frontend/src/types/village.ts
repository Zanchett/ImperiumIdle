export interface VillageResources {
  wood: number
  stone: number
  food: number
  herbs: number
}

export type BuildingType =
  | 'city-hall'
  | 'hut'
  | 'stone-house'
  | 'logging-station'
  | 'quarry'
  | 'mine'
  | 'food-field'
  | 'herb-field'
  | 'apple-orchard'
  | 'orange-grove'
  | 'wheat-field'
  | 'corn-field'
  | 'potato-farm'
  | 'grape-vineyard'
  | 'carrot-field'
  | 'tomato-farm'
  | 'banana-grove'
  | 'berry-patch'
  | 'cabbage-field'
  | 'onion-farm'
  | 'pepper-field'
  | 'mushroom-cave'
  | 'cucumber-field'
  | 'avocado-grove'
  | 'pumpkin-patch'
  | 'watermelon-field'
  | 'pineapple-plantation'
  | 'strawberry-patch'
  | 'peach-orchard'
  | 'mango-grove'
  | 'kiwi-vineyard'
  | 'dragon-fruit-garden'
  | 'starfruit-tree'
  | 'medicinal-garden'
  | 'thyme-garden'
  | 'basil-garden'
  | 'oregano-field'
  | 'rosemary-grove'
  | 'sage-garden'
  | 'mint-field'
  | 'lavender-garden'
  | 'chamomile-patch'
  | 'ginseng-garden'
  | 'echinacea-field'
  | 'aloe-vera-garden'
  | 'ginseng-root-garden'
  | 'valerian-field'
  | 'st-johns-wort-patch'
  | 'turmeric-field'
  | 'ginger-garden'
  | 'feverfew-garden'
  | 'milk-thistle-field'
  | 'ashwagandha-garden'
  | 'rhodiola-field'
  | 'reishi-cave'
  | 'cordyceps-garden'
  | 'warp-herb-grove'
  | 'emperor-blessing-shrine'
  | 'alchemy-garden'
  | 'sacred-grove'
  | 'poison-garden'
  | 'spice-field'
  | 'storage-shed'
  | 'workshop'
  | 'apothecary'
  | 'market'
  | 'barracks'
  | 'forge'
  | 'library'
  | 'guild-hall'

export type VillagerType = 'worker' | 'farmer' | 'miner' | 'craftsman' | 'guard' | 'scholar'

export interface Building {
  id: string
  type: BuildingType
  level: number
  assignedVillagers: string[] // villager IDs
  constructionStartTime: number | null // timestamp when construction started
  constructionDuration: number // milliseconds
  completed: boolean
  xpReward: number // XP granted when construction completes
  lastCollectionTime: number | null // timestamp when resources were last collected
  accumulatedResources: number // resources accumulated since last collection
}

export interface Villager {
  id: string
  name: string
  type: VillagerType
  assignedBuilding: string | null // building ID
  efficiency: number // 1.0 = 100%, 1.5 = 150% (for specialized villagers)
  foodConsumption: number // food consumed per hour
  recruitmentCost: number // food cost to recruit
  xpReward: number // XP granted when recruited
}

export interface BuildingDefinition {
  id: BuildingType
  name: string
  icon: string
  description: string
  tier: 1 | 2 | 3 // 1 = wood, 2 = stone, 3 = advanced
  levelRequired: number // Colony level required
  baseCost: {
    wood: number
    stone: number
  }
  baseConstructionTime: number // seconds
  baseXP: number // base XP reward
  maxWorkers: number // max villagers that can work here
  production?: {
    resource: string // Resource ID (e.g., 'apples', 'oranges', 'medicinal-herbs', etc.)
    rate: number // per hour
    storageCapacity: number
  }
  housingCapacity?: number // for huts/stone-houses
  storageCapacity?: number // for storage-shed
  unlocksSpecializedBuildings?: BuildingType[] // Buildings that can be built once this is completed
  requiresBaseBuilding?: BuildingType // Requires at least one of this base building type to be built
}

export interface Village {
  level: number // Colony skill level
  resources: VillageResources
  buildings: Building[]
  villagers: Villager[]
  storageCapacity: {
    wood: number
    stone: number
    food: number
    herbs: number
  }
  dailyLimits: {
    constructions: number
    constructionsUsed: number
    lastReset: number // timestamp
    recruits: number
    recruitsUsed: number
  }
  constructionQueue: Building[] // buildings being constructed
}

export const BUILDING_DEFINITIONS: BuildingDefinition[] = [
  // City Hall - Pre-built, increases construction queue capacity
  {
    id: 'city-hall',
    name: 'City Hall',
    icon: '🏛️',
    description: 'Central administration building. Upgrade to increase construction queue capacity.',
    tier: 1,
    levelRequired: 1,
    baseCost: { wood: 0, stone: 0 }, // Pre-built, upgrade costs handled separately
    baseConstructionTime: 0,
    baseXP: 0,
    maxWorkers: 0,
  },
  // Tier 1 - Wood Buildings
  {
    id: 'logging-station',
    name: 'Logging Station',
    icon: '🪵',
    description: 'Harvests wood from nearby forests. REQUIRED: Build this first to get wood!',
    tier: 1,
    levelRequired: 1,
    baseCost: { wood: 20, stone: 0 },
    baseConstructionTime: 600, // 10 minutes
    baseXP: 10,
    maxWorkers: 1,
    production: {
      resource: 'village-wood', // Village resource, not main inventory
      rate: 12, // 12 wood per hour (1 per 5 minutes)
      storageCapacity: 50,
    },
  },
  {
    id: 'hut',
    name: 'Hut',
    icon: '🏠',
    description: 'Basic housing for one villager',
    tier: 1,
    levelRequired: 1,
    baseCost: { wood: 10, stone: 0 },
    baseConstructionTime: 300, // 5 minutes
    baseXP: 5,
    maxWorkers: 0,
    housingCapacity: 1,
    requiresBaseBuilding: 'logging-station', // Requires logging station first
  },
  // Basic Mine - produces stone for village
  {
    id: 'mine',
    name: 'Mine',
    icon: '⛏️',
    description: 'Basic stone mining for your colony',
    tier: 1,
    levelRequired: 1,
    baseCost: { wood: 20, stone: 0 },
    baseConstructionTime: 600, // 10 minutes
    baseXP: 10,
    maxWorkers: 1,
    production: {
      resource: 'village-stone', // Village resource, not main inventory
      rate: 8, // 8 stone per hour
      storageCapacity: 40,
    },
  },
  // Basic Food Field - produces food for village
  {
    id: 'food-field',
    name: 'Food Field',
    icon: '🌾',
    description: 'Basic food production for your colony',
    tier: 1,
    levelRequired: 1,
    baseCost: { wood: 15, stone: 0 },
    baseConstructionTime: 450, // 7.5 minutes
    baseXP: 7.5,
    maxWorkers: 1,
    production: {
      resource: 'village-food', // Village resource, not main inventory
      rate: 8, // 8 food per hour
      storageCapacity: 40,
    },
    requiresBaseBuilding: 'logging-station', // Requires logging station first
    unlocksSpecializedBuildings: [
      'apple-orchard', 'orange-grove', 'wheat-field', 'corn-field', 'potato-farm', 'grape-vineyard',
      'carrot-field', 'tomato-farm', 'banana-grove', 'berry-patch', 'cabbage-field', 'onion-farm',
      'pepper-field', 'mushroom-cave', 'cucumber-field', 'avocado-grove', 'pumpkin-patch', 'watermelon-field',
      'pineapple-plantation', 'strawberry-patch', 'peach-orchard', 'mango-grove', 'kiwi-vineyard',
      'dragon-fruit-garden', 'starfruit-tree'
    ],
  },
  // Specialized Food Production Buildings (unlocked from Food Field)
  {
    id: 'apple-orchard',
    name: 'Apple Orchard',
    icon: '🍎',
    description: 'Produces apples for food production',
    tier: 1,
    levelRequired: 1,
    baseCost: { wood: 15, stone: 0 },
    baseConstructionTime: 450, // 7.5 minutes
    baseXP: 7.5,
    maxWorkers: 1,
    production: {
      resource: 'apples', // Main inventory resource
      rate: 10, // 10 apples per hour
      storageCapacity: 50,
    },
    requiresBaseBuilding: 'food-field', // Requires at least one Food Field
  },
  {
    id: 'orange-grove',
    name: 'Orange Grove',
    icon: '🍊',
    description: 'Produces oranges for food production',
    tier: 1,
    levelRequired: 3,
    baseCost: { wood: 18, stone: 0 },
    baseConstructionTime: 540,
    baseXP: 9,
    maxWorkers: 1,
    production: {
      resource: 'oranges', // Main inventory resource
      rate: 8, // 8 oranges per hour
      storageCapacity: 40,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'wheat-field',
    name: 'Wheat Field',
    icon: '🌾',
    description: 'Produces wheat for baking and cooking',
    tier: 1,
    levelRequired: 5,
    baseCost: { wood: 20, stone: 0 },
    baseConstructionTime: 600,
    baseXP: 10,
    maxWorkers: 1,
    production: {
      resource: 'wheat', // Main inventory resource
      rate: 12, // 12 wheat per hour
      storageCapacity: 60,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'corn-field',
    name: 'Corn Field',
    icon: '🌽',
    description: 'Produces corn for various recipes',
    tier: 1,
    levelRequired: 7,
    baseCost: { wood: 22, stone: 0 },
    baseConstructionTime: 660,
    baseXP: 11,
    maxWorkers: 1,
    production: {
      resource: 'corn', // Main inventory resource
      rate: 14, // 14 corn per hour
      storageCapacity: 70,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'potato-farm',
    name: 'Potato Farm',
    icon: '🥔',
    description: 'Produces potatoes for hearty meals',
    tier: 1,
    levelRequired: 9,
    baseCost: { wood: 25, stone: 0 },
    baseConstructionTime: 750,
    baseXP: 12.5,
    maxWorkers: 1,
    production: {
      resource: 'potatoes', // Main inventory resource
      rate: 15, // 15 potatoes per hour
      storageCapacity: 75,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'grape-vineyard',
    name: 'Grape Vineyard',
    icon: '🍇',
    description: 'Produces grapes for wine and preserves',
    tier: 2,
    levelRequired: 12,
    baseCost: { wood: 30, stone: 10 },
    baseConstructionTime: 1200,
    baseXP: 30,
    maxWorkers: 2,
    production: {
      resource: 'grapes', // Main inventory resource
      rate: 6, // 6 grapes per hour (higher value)
      storageCapacity: 30,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'carrot-field',
    name: 'Carrot Field',
    icon: '🥕',
    description: 'Produces carrots for nutrition',
    tier: 1,
    levelRequired: 30,
    baseCost: { wood: 28, stone: 0 },
    baseConstructionTime: 840,
    baseXP: 14,
    maxWorkers: 1,
    production: {
      resource: 'carrots',
      rate: 12,
      storageCapacity: 60,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'tomato-farm',
    name: 'Tomato Farm',
    icon: '🍅',
    description: 'Produces tomatoes for cooking',
    tier: 1,
    levelRequired: 35,
    baseCost: { wood: 30, stone: 0 },
    baseConstructionTime: 900,
    baseXP: 15,
    maxWorkers: 1,
    production: {
      resource: 'tomatoes',
      rate: 11,
      storageCapacity: 55,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'banana-grove',
    name: 'Banana Grove',
    icon: '🍌',
    description: 'Tropical banana trees',
    tier: 1,
    levelRequired: 40,
    baseCost: { wood: 35, stone: 0 },
    baseConstructionTime: 1050,
    baseXP: 17.5,
    maxWorkers: 1,
    production: {
      resource: 'bananas',
      rate: 9,
      storageCapacity: 45,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'berry-patch',
    name: 'Berry Patch',
    icon: '🫐',
    description: 'Mixed berry bushes',
    tier: 1,
    levelRequired: 45,
    baseCost: { wood: 38, stone: 0 },
    baseConstructionTime: 1140,
    baseXP: 19,
    maxWorkers: 1,
    production: {
      resource: 'berries',
      rate: 7,
      storageCapacity: 35,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'cabbage-field',
    name: 'Cabbage Field',
    icon: '🥬',
    description: 'Produces cabbage for meals',
    tier: 1,
    levelRequired: 50,
    baseCost: { wood: 40, stone: 0 },
    baseConstructionTime: 1200,
    baseXP: 20,
    maxWorkers: 1,
    production: {
      resource: 'cabbage',
      rate: 13,
      storageCapacity: 65,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'onion-farm',
    name: 'Onion Farm',
    icon: '🧅',
    description: 'Produces onions for cooking',
    tier: 1,
    levelRequired: 55,
    baseCost: { wood: 42, stone: 0 },
    baseConstructionTime: 1260,
    baseXP: 21,
    maxWorkers: 1,
    production: {
      resource: 'onions',
      rate: 12,
      storageCapacity: 60,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'pepper-field',
    name: 'Pepper Field',
    icon: '🫑',
    description: 'Colorful bell peppers',
    tier: 1,
    levelRequired: 60,
    baseCost: { wood: 45, stone: 0 },
    baseConstructionTime: 1350,
    baseXP: 22.5,
    maxWorkers: 1,
    production: {
      resource: 'peppers',
      rate: 10,
      storageCapacity: 50,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'mushroom-cave',
    name: 'Mushroom Cave',
    icon: '🍄',
    description: 'Dark cultivation chambers for mushrooms',
    tier: 2,
    levelRequired: 65,
    baseCost: { wood: 35, stone: 15 },
    baseConstructionTime: 1500,
    baseXP: 37.5,
    maxWorkers: 1,
    production: {
      resource: 'mushrooms',
      rate: 8,
      storageCapacity: 40,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'cucumber-field',
    name: 'Cucumber Field',
    icon: '🥒',
    description: 'Produces cucumbers',
    tier: 1,
    levelRequired: 70,
    baseCost: { wood: 48, stone: 0 },
    baseConstructionTime: 1440,
    baseXP: 24,
    maxWorkers: 1,
    production: {
      resource: 'cucumbers',
      rate: 11,
      storageCapacity: 55,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'avocado-grove',
    name: 'Avocado Grove',
    icon: '🥑',
    description: 'Premium avocado trees',
    tier: 2,
    levelRequired: 75,
    baseCost: { wood: 40, stone: 20 },
    baseConstructionTime: 1800,
    baseXP: 45,
    maxWorkers: 2,
    production: {
      resource: 'avocados',
      rate: 6,
      storageCapacity: 30,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'pumpkin-patch',
    name: 'Pumpkin Patch',
    icon: '🎃',
    description: 'Large pumpkin gourds',
    tier: 1,
    levelRequired: 80,
    baseCost: { wood: 50, stone: 0 },
    baseConstructionTime: 1500,
    baseXP: 25,
    maxWorkers: 1,
    production: {
      resource: 'pumpkins',
      rate: 9,
      storageCapacity: 45,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'watermelon-field',
    name: 'Watermelon Field',
    icon: '🍉',
    description: 'Sweet juicy melons',
    tier: 2,
    levelRequired: 85,
    baseCost: { wood: 45, stone: 25 },
    baseConstructionTime: 2025,
    baseXP: 50.625,
    maxWorkers: 2,
    production: {
      resource: 'watermelons',
      rate: 5,
      storageCapacity: 25,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'pineapple-plantation',
    name: 'Pineapple Plantation',
    icon: '🍍',
    description: 'Exotic tropical fruit',
    tier: 2,
    levelRequired: 90,
    baseCost: { wood: 50, stone: 30 },
    baseConstructionTime: 2250,
    baseXP: 56.25,
    maxWorkers: 2,
    production: {
      resource: 'pineapples',
      rate: 4,
      storageCapacity: 20,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'strawberry-patch',
    name: 'Strawberry Patch',
    icon: '🍓',
    description: 'Delicate red berries',
    tier: 2,
    levelRequired: 95,
    baseCost: { wood: 55, stone: 35 },
    baseConstructionTime: 2475,
    baseXP: 61.875,
    maxWorkers: 2,
    production: {
      resource: 'strawberries',
      rate: 4,
      storageCapacity: 20,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'peach-orchard',
    name: 'Peach Orchard',
    icon: '🍑',
    description: 'Soft stone fruit',
    tier: 2,
    levelRequired: 100,
    baseCost: { wood: 60, stone: 40 },
    baseConstructionTime: 2700,
    baseXP: 67.5,
    maxWorkers: 2,
    production: {
      resource: 'peaches',
      rate: 3,
      storageCapacity: 15,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'mango-grove',
    name: 'Mango Grove',
    icon: '🥭',
    description: 'Tropical mango trees',
    tier: 2,
    levelRequired: 105,
    baseCost: { wood: 65, stone: 45 },
    baseConstructionTime: 2925,
    baseXP: 73.125,
    maxWorkers: 2,
    production: {
      resource: 'mangoes',
      rate: 3,
      storageCapacity: 15,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'kiwi-vineyard',
    name: 'Kiwi Vineyard',
    icon: '🥝',
    description: 'Exotic kiwi vines',
    tier: 2,
    levelRequired: 110,
    baseCost: { wood: 70, stone: 50 },
    baseConstructionTime: 3150,
    baseXP: 78.75,
    maxWorkers: 2,
    production: {
      resource: 'kiwis',
      rate: 3,
      storageCapacity: 15,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'dragon-fruit-garden',
    name: 'Dragon Fruit Garden',
    icon: '🐉',
    description: 'Rare alien fruit cultivation',
    tier: 3,
    levelRequired: 115,
    baseCost: { wood: 75, stone: 60 },
    baseConstructionTime: 3375,
    baseXP: 84.375,
    maxWorkers: 2,
    production: {
      resource: 'dragon-fruit',
      rate: 2,
      storageCapacity: 10,
    },
    requiresBaseBuilding: 'food-field',
  },
  {
    id: 'starfruit-tree',
    name: 'Starfruit Tree',
    icon: '⭐',
    description: 'Legendary fruit trees',
    tier: 3,
    levelRequired: 118,
    baseCost: { wood: 80, stone: 70 },
    baseConstructionTime: 3600,
    baseXP: 90,
    maxWorkers: 3,
    production: {
      resource: 'starfruit',
      rate: 1,
      storageCapacity: 5,
    },
    requiresBaseBuilding: 'food-field',
  },
  // Basic Herb Field - produces herbs for village
  {
    id: 'herb-field',
    name: 'Herb Field',
    icon: '🌿',
    description: 'Basic herb cultivation for your colony',
    tier: 1,
    levelRequired: 1,
    baseCost: { wood: 15, stone: 0 },
    baseConstructionTime: 450,
    baseXP: 7.5,
    maxWorkers: 1,
    production: {
      resource: 'village-herbs', // Village resource, not main inventory
      rate: 6, // 6 herbs per hour
      storageCapacity: 30,
    },
    requiresBaseBuilding: 'logging-station', // Requires logging station first
    unlocksSpecializedBuildings: [
      'medicinal-garden', 'thyme-garden', 'basil-garden', 'oregano-field', 'rosemary-grove', 'sage-garden',
      'mint-field', 'lavender-garden', 'chamomile-patch', 'ginseng-garden', 'echinacea-field', 'aloe-vera-garden',
      'ginseng-root-garden', 'valerian-field', 'st-johns-wort-patch', 'turmeric-field', 'ginger-garden',
      'feverfew-garden', 'milk-thistle-field', 'ashwagandha-garden', 'rhodiola-field', 'reishi-cave',
      'cordyceps-garden', 'warp-herb-grove', 'emperor-blessing-shrine'
    ],
  },
  // Specialized Herb Production Buildings (unlocked from Herb Field)
  {
    id: 'medicinal-garden',
    name: 'Medicinal Garden',
    icon: '🌿',
    description: 'Grows healing herbs and remedies',
    tier: 1,
    levelRequired: 1,
    baseCost: { wood: 15, stone: 0 },
    baseConstructionTime: 450,
    baseXP: 7.5,
    maxWorkers: 1,
    production: {
      resource: 'medicinal-herbs', // Main inventory resource
      rate: 8, // 8 medicinal herbs per hour
      storageCapacity: 40,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'thyme-garden',
    name: 'Thyme Garden',
    icon: '🌱',
    description: 'Aromatic thyme cultivation',
    tier: 1,
    levelRequired: 5,
    baseCost: { wood: 18, stone: 0 },
    baseConstructionTime: 540,
    baseXP: 9,
    maxWorkers: 1,
    production: {
      resource: 'thyme',
      rate: 10,
      storageCapacity: 50,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'basil-garden',
    name: 'Basil Garden',
    icon: '🌿',
    description: 'Fragrant basil plants',
    tier: 1,
    levelRequired: 10,
    baseCost: { wood: 20, stone: 0 },
    baseConstructionTime: 600,
    baseXP: 10,
    maxWorkers: 1,
    production: {
      resource: 'basil',
      rate: 11,
      storageCapacity: 55,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'oregano-field',
    name: 'Oregano Field',
    icon: '🌱',
    description: 'Mediterranean oregano',
    tier: 1,
    levelRequired: 15,
    baseCost: { wood: 22, stone: 0 },
    baseConstructionTime: 660,
    baseXP: 11,
    maxWorkers: 1,
    production: {
      resource: 'oregano',
      rate: 12,
      storageCapacity: 60,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'rosemary-grove',
    name: 'Rosemary Grove',
    icon: '🌿',
    description: 'Evergreen rosemary bushes',
    tier: 1,
    levelRequired: 20,
    baseCost: { wood: 25, stone: 0 },
    baseConstructionTime: 750,
    baseXP: 12.5,
    maxWorkers: 1,
    production: {
      resource: 'rosemary',
      rate: 10,
      storageCapacity: 50,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'sage-garden',
    name: 'Sage Garden',
    icon: '🌱',
    description: 'Medicinal sage plants',
    tier: 1,
    levelRequired: 25,
    baseCost: { wood: 28, stone: 0 },
    baseConstructionTime: 840,
    baseXP: 14,
    maxWorkers: 1,
    production: {
      resource: 'sage',
      rate: 9,
      storageCapacity: 45,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'mint-field',
    name: 'Mint Field',
    icon: '🌿',
    description: 'Cooling mint cultivation',
    tier: 1,
    levelRequired: 30,
    baseCost: { wood: 30, stone: 0 },
    baseConstructionTime: 900,
    baseXP: 15,
    maxWorkers: 1,
    production: {
      resource: 'mint',
      rate: 11,
      storageCapacity: 55,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'lavender-garden',
    name: 'Lavender Garden',
    icon: '💜',
    description: 'Purple flowering lavender',
    tier: 1,
    levelRequired: 35,
    baseCost: { wood: 32, stone: 0 },
    baseConstructionTime: 960,
    baseXP: 16,
    maxWorkers: 1,
    production: {
      resource: 'lavender',
      rate: 9,
      storageCapacity: 45,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'chamomile-patch',
    name: 'Chamomile Patch',
    icon: '🌼',
    description: 'Gentle chamomile flowers',
    tier: 1,
    levelRequired: 40,
    baseCost: { wood: 35, stone: 0 },
    baseConstructionTime: 1050,
    baseXP: 17.5,
    maxWorkers: 1,
    production: {
      resource: 'chamomile',
      rate: 8,
      storageCapacity: 40,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'ginseng-garden',
    name: 'Ginseng Garden',
    icon: '🌿',
    description: 'Rare ginseng root cultivation',
    tier: 2,
    levelRequired: 45,
    baseCost: { wood: 30, stone: 15 },
    baseConstructionTime: 1350,
    baseXP: 33.75,
    maxWorkers: 1,
    production: {
      resource: 'ginseng',
      rate: 7,
      storageCapacity: 35,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'echinacea-field',
    name: 'Echinacea Field',
    icon: '🌺',
    description: 'Purple coneflower cultivation',
    tier: 1,
    levelRequired: 50,
    baseCost: { wood: 40, stone: 0 },
    baseConstructionTime: 1200,
    baseXP: 20,
    maxWorkers: 1,
    production: {
      resource: 'echinacea',
      rate: 10,
      storageCapacity: 50,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'aloe-vera-garden',
    name: 'Aloe Vera Garden',
    icon: '🌵',
    description: 'Healing aloe plants',
    tier: 1,
    levelRequired: 55,
    baseCost: { wood: 42, stone: 0 },
    baseConstructionTime: 1260,
    baseXP: 21,
    maxWorkers: 1,
    production: {
      resource: 'aloe-vera',
      rate: 9,
      storageCapacity: 45,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'ginseng-root-garden',
    name: 'Ginseng Root Garden',
    icon: '🌿',
    description: 'Mature ginseng root cultivation',
    tier: 2,
    levelRequired: 60,
    baseCost: { wood: 35, stone: 20 },
    baseConstructionTime: 1575,
    baseXP: 39.375,
    maxWorkers: 2,
    production: {
      resource: 'ginseng-root',
      rate: 6,
      storageCapacity: 30,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'valerian-field',
    name: 'Valerian Field',
    icon: '🌱',
    description: 'Sedative valerian cultivation',
    tier: 2,
    levelRequired: 65,
    baseCost: { wood: 38, stone: 22 },
    baseConstructionTime: 1710,
    baseXP: 42.75,
    maxWorkers: 1,
    production: {
      resource: 'valerian',
      rate: 7,
      storageCapacity: 35,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'st-johns-wort-patch',
    name: 'St. John\'s Wort Patch',
    icon: '🌻',
    description: 'Yellow flower with medicinal properties',
    tier: 2,
    levelRequired: 70,
    baseCost: { wood: 40, stone: 25 },
    baseConstructionTime: 1800,
    baseXP: 45,
    maxWorkers: 1,
    production: {
      resource: 'st-johns-wort',
      rate: 6,
      storageCapacity: 30,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'turmeric-field',
    name: 'Turmeric Field',
    icon: '🟡',
    description: 'Golden spice cultivation',
    tier: 2,
    levelRequired: 75,
    baseCost: { wood: 45, stone: 30 },
    baseConstructionTime: 2025,
    baseXP: 50.625,
    maxWorkers: 2,
    production: {
      resource: 'turmeric',
      rate: 5,
      storageCapacity: 25,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'ginger-garden',
    name: 'Ginger Garden',
    icon: '🟠',
    description: 'Spicy root cultivation',
    tier: 2,
    levelRequired: 80,
    baseCost: { wood: 50, stone: 35 },
    baseConstructionTime: 2250,
    baseXP: 56.25,
    maxWorkers: 2,
    production: {
      resource: 'ginger',
      rate: 5,
      storageCapacity: 25,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'feverfew-garden',
    name: 'Feverfew Garden',
    icon: '🌼',
    description: 'Herb effective against fevers',
    tier: 2,
    levelRequired: 85,
    baseCost: { wood: 55, stone: 40 },
    baseConstructionTime: 2475,
    baseXP: 61.875,
    maxWorkers: 2,
    production: {
      resource: 'feverfew',
      rate: 4,
      storageCapacity: 20,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'milk-thistle-field',
    name: 'Milk Thistle Field',
    icon: '🌾',
    description: 'Liver-protective herb',
    tier: 2,
    levelRequired: 90,
    baseCost: { wood: 60, stone: 45 },
    baseConstructionTime: 2700,
    baseXP: 67.5,
    maxWorkers: 2,
    production: {
      resource: 'milk-thistle',
      rate: 4,
      storageCapacity: 20,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'ashwagandha-garden',
    name: 'Ashwagandha Garden',
    icon: '🌿',
    description: 'Adaptogenic herb cultivation',
    tier: 2,
    levelRequired: 95,
    baseCost: { wood: 65, stone: 50 },
    baseConstructionTime: 2925,
    baseXP: 73.125,
    maxWorkers: 2,
    production: {
      resource: 'ashwagandha',
      rate: 3,
      storageCapacity: 15,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'rhodiola-field',
    name: 'Rhodiola Field',
    icon: '🌹',
    description: 'Arctic endurance herb',
    tier: 2,
    levelRequired: 100,
    baseCost: { wood: 70, stone: 55 },
    baseConstructionTime: 3150,
    baseXP: 78.75,
    maxWorkers: 2,
    production: {
      resource: 'rhodiola',
      rate: 3,
      storageCapacity: 15,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'reishi-cave',
    name: 'Reishi Cave',
    icon: '🍄',
    description: 'Medicinal mushroom cultivation',
    tier: 2,
    levelRequired: 105,
    baseCost: { wood: 40, stone: 30 },
    baseConstructionTime: 2100,
    baseXP: 52.5,
    maxWorkers: 2,
    production: {
      resource: 'reishi',
      rate: 3,
      storageCapacity: 15,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'cordyceps-garden',
    name: 'Cordyceps Garden',
    icon: '🍄',
    description: 'Rare parasitic fungus cultivation',
    tier: 2,
    levelRequired: 110,
    baseCost: { wood: 45, stone: 35 },
    baseConstructionTime: 2400,
    baseXP: 60,
    maxWorkers: 2,
    production: {
      resource: 'cordyceps',
      rate: 2,
      storageCapacity: 10,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'warp-herb-grove',
    name: 'Warp Herb Grove',
    icon: '🌀',
    description: 'Psyker-active plant cultivation',
    tier: 3,
    levelRequired: 115,
    baseCost: { wood: 75, stone: 60 },
    baseConstructionTime: 3375,
    baseXP: 84.375,
    maxWorkers: 2,
    production: {
      resource: 'warp-herb',
      rate: 2,
      storageCapacity: 10,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'emperor-blessing-shrine',
    name: 'Emperor\'s Blessing Shrine',
    icon: '👑',
    description: 'Sacred herb blessed by the Emperor',
    tier: 3,
    levelRequired: 118,
    baseCost: { wood: 80, stone: 70 },
    baseConstructionTime: 3600,
    baseXP: 90,
    maxWorkers: 3,
    production: {
      resource: 'emperor-blessing',
      rate: 1,
      storageCapacity: 5,
    },
    requiresBaseBuilding: 'herb-field',
  },
  {
    id: 'storage-shed',
    name: 'Storage Shed',
    icon: '📦',
    description: 'Increases resource storage capacity',
    tier: 1,
    levelRequired: 6,
    baseCost: { wood: 25, stone: 0 },
    baseConstructionTime: 750,
    baseXP: 12.5,
    maxWorkers: 0,
    storageCapacity: 100, // +100 to each resource
    requiresBaseBuilding: 'logging-station',
  },
  // Tier 2 - Stone Buildings
  {
    id: 'stone-house',
    name: 'Stone House',
    icon: '🏛️',
    description: 'Houses two villagers',
    tier: 2,
    levelRequired: 10,
    baseCost: { wood: 10, stone: 20 },
    baseConstructionTime: 1200, // 20 minutes
    baseXP: 22.5,
    maxWorkers: 0,
    housingCapacity: 2,
    requiresBaseBuilding: 'logging-station',
  },
  {
    id: 'quarry',
    name: 'Quarry',
    icon: '⛏️',
    description: 'Mines stone from nearby deposits',
    tier: 2,
    levelRequired: 10,
    baseCost: { wood: 30, stone: 15 },
    baseConstructionTime: 1500,
    baseXP: 33.75,
    maxWorkers: 2,
    production: {
      resource: 'village-stone', // Village resource, not main inventory
      rate: 6, // 6 stone per hour (1 per 10 minutes)
      storageCapacity: 30,
    },
    requiresBaseBuilding: 'logging-station',
  },
  {
    id: 'workshop',
    name: 'Workshop',
    icon: '🔨',
    description: 'Unlocks advanced crafting recipes',
    tier: 2,
    levelRequired: 11,
    baseCost: { wood: 40, stone: 30 },
    baseConstructionTime: 1800,
    baseXP: 52.5,
    maxWorkers: 1,
    requiresBaseBuilding: 'logging-station',
  },
  {
    id: 'apothecary',
    name: 'Apothecary',
    icon: '🧪',
    description: 'Unlocks Apothecary sub-skill for potion crafting',
    tier: 2,
    levelRequired: 15,
    baseCost: { wood: 35, stone: 25 },
    baseConstructionTime: 2100,
    baseXP: 45,
    maxWorkers: 1,
    requiresBaseBuilding: 'logging-station',
  },
  {
    id: 'barracks',
    name: 'Barracks',
    icon: '⚔️',
    description: 'Houses guards and increases village defense',
    tier: 2,
    levelRequired: 20,
    baseCost: { wood: 50, stone: 40 },
    baseConstructionTime: 2400,
    baseXP: 67.5,
    maxWorkers: 0,
    housingCapacity: 3,
    requiresBaseBuilding: 'logging-station',
  },
  {
    id: 'market',
    name: 'Market',
    icon: '🏪',
    description: 'Enables trading with other players',
    tier: 2,
    levelRequired: 25,
    baseCost: { wood: 50, stone: 50 },
    baseConstructionTime: 3000,
    baseXP: 75,
    maxWorkers: 0,
    requiresBaseBuilding: 'logging-station',
  },
  // Tier 3 - Advanced Buildings
  {
    id: 'forge',
    name: 'Forge',
    icon: '🔥',
    description: 'Advanced metalworking and equipment crafting',
    tier: 3,
    levelRequired: 30,
    baseCost: { wood: 60, stone: 80 },
    baseConstructionTime: 3600,
    baseXP: 105,
    maxWorkers: 2,
    requiresBaseBuilding: 'logging-station',
  },
  {
    id: 'library',
    name: 'Library',
    icon: '📚',
    description: 'Research new technologies and unlock upgrades',
    tier: 3,
    levelRequired: 35,
    baseCost: { wood: 70, stone: 90 },
    baseConstructionTime: 4200,
    baseXP: 120,
    maxWorkers: 1,
    requiresBaseBuilding: 'logging-station',
  },
  {
    id: 'guild-hall',
    name: 'Guild Hall',
    icon: '🏛️',
    description: 'Join or form trading guilds with other players',
    tier: 3,
    levelRequired: 40,
    baseCost: { wood: 100, stone: 120 },
    baseConstructionTime: 5400,
    baseXP: 165,
    maxWorkers: 0,
    requiresBaseBuilding: 'logging-station',
  },
]

export const VILLAGER_TYPES: Record<VillagerType, { name: string; icon: string; description: string; baseEfficiency: number; recruitmentCost: number; xpReward: number }> = {
  worker: {
    name: 'Worker',
    icon: '👷',
    description: 'General purpose worker',
    baseEfficiency: 1.0,
    recruitmentCost: 10,
    xpReward: 2,
  },
  farmer: {
    name: 'Farmer',
    icon: '🌾',
    description: '+50% efficiency at food/herb fields',
    baseEfficiency: 1.5,
    recruitmentCost: 15,
    xpReward: 3,
  },
  miner: {
    name: 'Miner',
    icon: '⛏️',
    description: '+50% efficiency at logging/quarry',
    baseEfficiency: 1.5,
    recruitmentCost: 15,
    xpReward: 3,
  },
  craftsman: {
    name: 'Craftsman',
    icon: '🔨',
    description: 'Required for workshops, unlocks better recipes',
    baseEfficiency: 1.2,
    recruitmentCost: 20,
    xpReward: 4,
  },
  guard: {
    name: 'Guard',
    icon: '🛡️',
    description: 'Increases village defense',
    baseEfficiency: 1.0,
    recruitmentCost: 25,
    xpReward: 5,
  },
  scholar: {
    name: 'Scholar',
    icon: '📚',
    description: 'Required for library research',
    baseEfficiency: 1.3,
    recruitmentCost: 30,
    xpReward: 6,
  },
}

