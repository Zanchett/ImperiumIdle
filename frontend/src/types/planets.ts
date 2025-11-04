export type PlanetType = 
  | 'agri-world' 
  | 'mining-world' 
  | 'grave-world' 
  | 'forge-world' 
  | 'research-world' 
  | 'shrine-world' 
  | 'hive-world' 
  | 'death-world' 
  | 'void-station'

export interface PlanetTradeItem {
  resourceId: string
  resourceName: string
  icon: string
  buyPrice: number | null // null if not buying
  sellPrice: number | null // null if not selling
  availableQuantity: number // How much is available (0 = unlimited)
  maxQuantity: number // Maximum available at once
}

export interface Planet {
  id: string
  name: string
  type: PlanetType
  discovered: boolean
  contactCostGold: number
  contactDuration: number // in milliseconds
  tradeItems: PlanetTradeItem[]
  rotationInterval: number // in milliseconds
  nextRotation: number // timestamp
  size: 'small' | 'medium' | 'large' // Affects contact cost and trade variety
  reputation: number // 0-100, affects prices
}

export interface ActiveContactTask {
  planetId: string
  startTime: number
  duration: number
  completed: boolean
}

export const PLANET_TYPES: Record<PlanetType, { name: string; icon: string; description: string }> = {
  'agri-world': {
    name: 'Agri-World',
    icon: '🌾',
    description: 'Fertile worlds dedicated to agricultural production. Source of food and organic materials.',
  },
  'mining-world': {
    name: 'Mining-World',
    icon: '⛏️',
    description: 'Rich in mineral deposits. Primary source of ores and raw metals.',
  },
  'grave-world': {
    name: 'Grave-World',
    icon: '⚰️',
    description: 'Desolate worlds covered in wreckage and debris. Valuable scrap materials can be found.',
  },
  'forge-world': {
    name: 'Forge-World',
    icon: '🔥',
    description: 'Industrial worlds producing refined materials, alloys, and crafted components.',
  },
  'research-world': {
    name: 'Research-World',
    icon: '🔬',
    description: 'Centers of technological advancement. Source of data crystals and research materials.',
  },
  'shrine-world': {
    name: 'Shrine-World',
    icon: '⛪',
    description: 'Sacred worlds producing blessed materials and ceremonial components.',
  },
  'hive-world': {
    name: 'Hive-World',
    icon: '🐝',
    description: 'Biological worlds with exotic organic compounds and bio-materials.',
  },
  'death-world': {
    name: 'Death-World',
    icon: '💀',
    description: 'Dangerous worlds with rare, high-value materials. High risk, high reward.',
  },
  'void-station': {
    name: 'Void-Station',
    icon: '🚀',
    description: 'Deep space trading posts with unique items and exotic goods.',
  },
}

// Resource pools for each planet type
export const PLANET_RESOURCE_POOLS: Record<PlanetType, string[]> = {
  'agri-world': [
    // Food resources
    'apples', 'oranges', 'wheat', 'corn', 'potatoes', 'grapes', 'carrots', 'tomatoes',
    'bananas', 'berries', 'cabbage', 'onions', 'peppers', 'mushrooms', 'cucumbers',
    'avocados', 'pumpkins', 'watermelons', 'pineapples', 'strawberries', 'peaches',
    'mangoes', 'kiwis', 'dragon-fruit', 'starfruit',
    // Herb resources
    'medicinal-herbs', 'thyme', 'basil', 'oregano', 'rosemary', 'sage', 'mint',
    'lavender', 'chamomile', 'ginseng', 'echinacea', 'aloe-vera', 'ginseng-root',
    'valerian', 'st-johns-wort', 'turmeric', 'ginger', 'feverfew', 'milk-thistle',
    'ashwagandha', 'rhodiola', 'reishi', 'cordyceps', 'warp-herb', 'emperor-blessing',
    // Legacy/other food items
    'food', 'rations', 'vegetables', 'fruits', 'meat', 'preserved-food',
    'organic-compounds', 'fertilizer', 'grain', 'protein', 'vitamins'
  ],
  'mining-world': [
    'iron-ore', 'copper-ore', 'tin-ore', 'coal', 'gold-ore', 'silver-ore', 'platinum-ore',
    'rare-earth', 'crystals', 'gems', 'minerals', 'stone', 'salt'
  ],
  'grave-world': [
    'scrap-metal', 'wreckage', 'broken-components', 'ruined-armor', 'damaged-weapons',
    'salvage', 'debris', 'junk', 'recyclables', 'metal-scraps', 'electronic-waste'
  ],
  'forge-world': [
    'iron-bar', 'steel-bar', 'copper-bar', 'bronze-bar', 'alloy', 'refined-metal',
    'circuits', 'components', 'cogitator-parts', 'mechanical-parts'
  ],
  'research-world': [
    'data-crystals', 'research-notes', 'tech-schematics', 'exotic-components',
    'quantum-processors', 'neural-interfaces', 'advanced-circuits'
  ],
  'shrine-world': [
    'blessed-metal', 'relics', 'ceremonial-components', 'holy-icons', 'sacred-texts',
    'consecrated-materials', 'ritual-items'
  ],
  'hive-world': [
    'organic-compounds', 'bio-materials', 'exotic-resources', 'biological-samples',
    'enzyme-extracts', 'genetic-material', 'life-crystals'
  ],
  'death-world': [
    'rare-crystals', 'void-stuff', 'exotic-alloys', 'warp-touched-materials',
    'ancient-artifacts', 'precious-metals', 'dangerous-compounds'
  ],
  'void-station': [
    'unique-items', 'rare-equipment', 'exotic-goods', 'void-artifacts',
    'special-components', 'premium-materials', 'luxury-items'
  ],
}

