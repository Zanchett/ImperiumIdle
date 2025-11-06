export interface SmeltingRecipe {
  id: string
  name: string
  levelRequired: number
  xpReward: number
  icon?: string
  description: string
  ingredients: {
    resourceId: string
    amount: number
  }[]
  time: number // Time in seconds to smelt
}

export const SMELTING_RECIPES: SmeltingRecipe[] = [
  {
    id: 'placeholder-metal-1',
    name: 'Placeholder Metal 1',
    levelRequired: 1,
    xpReward: 5,
    icon: '🔩',
    description: 'Basic smelted metal',
    ingredients: [
      { resourceId: 'ferrite-ore', amount: 2 },
    ],
    time: 2,
  },
  {
    id: 'placeholder-metal-2',
    name: 'Placeholder Metal 2',
    levelRequired: 20,
    xpReward: 8,
    icon: '⚙️',
    description: 'Reinforced smelted metal',
    ingredients: [
      { resourceId: 'plasteel-shards', amount: 1 },
      { resourceId: 'broken-glass', amount: 1 },
    ],
    time: 3,
  },
  {
    id: 'placeholder-metal-3',
    name: 'Placeholder Metal 3',
    levelRequired: 40,
    xpReward: 12,
    icon: '🛡️',
    description: 'Hardened metal alloy',
    ingredients: [
      { resourceId: 'scrap-metal', amount: 3 },
      { resourceId: 'plasteel-shards', amount: 2 },
    ],
    time: 4,
  },
  {
    id: 'placeholder-metal-4',
    name: 'Placeholder Metal 4',
    levelRequired: 55,
    xpReward: 15,
    icon: '💎',
    description: 'Refined ceramite alloy',
    ingredients: [
      { resourceId: 'ceramite-plates', amount: 1 },
      { resourceId: 'plasteel-shards', amount: 2 },
    ],
    time: 5,
  },
  {
    id: 'placeholder-metal-5',
    name: 'Placeholder Metal 5',
    levelRequired: 40,
    xpReward: 35,
    icon: '⚡',
    description: 'Energy-infused metal',
    ingredients: [
      { resourceId: 'promethium-cells', amount: 2 },
      { resourceId: 'power-conduits', amount: 1 },
    ],
    time: 6,
  },
  {
    id: 'placeholder-metal-6',
    name: 'Placeholder Metal 6',
    levelRequired: 40,
    xpReward: 20,
    icon: '🔋',
    description: 'Adamantium alloy',
    ingredients: [
      { resourceId: 'adamantium-ore', amount: 1 },
      { resourceId: 'servo-skulls', amount: 1 },
    ],
    time: 5,
  },
  {
    id: 'placeholder-metal-7',
    name: 'Placeholder Metal 7',
    levelRequired: 40,
    xpReward: 40,
    icon: '🤖',
    description: 'Cogitator-enhanced metal',
    ingredients: [
      { resourceId: 'machine-spirits', amount: 1 },
      { resourceId: 'power-conduits', amount: 1 },
    ],
    time: 7,
  },
  {
    id: 'placeholder-metal-8',
    name: 'Placeholder Metal 8',
    levelRequired: 55,
    xpReward: 42,
    icon: '📻',
    description: 'Communication-enhanced alloy',
    ingredients: [
      { resourceId: 'vox-units', amount: 1 },
      { resourceId: 'ceramite-plates', amount: 2 },
    ],
    time: 8,
  },
  {
    id: 'placeholder-metal-9',
    name: 'Placeholder Metal 9',
    levelRequired: 70,
    xpReward: 50,
    icon: '📡',
    description: 'Sensor-enhanced metal',
    ingredients: [
      { resourceId: 'auspex-scanners', amount: 1 },
      { resourceId: 'vox-units', amount: 1 },
    ],
    time: 9,
  },
  {
    id: 'placeholder-metal-10',
    name: 'Placeholder Metal 10',
    levelRequired: 80,
    xpReward: 180,
    icon: '🌀',
    description: 'Plasma-forged alloy',
    ingredients: [
      { resourceId: 'plasma-coils', amount: 1 },
      { resourceId: 'power-conduits', amount: 2 },
      { resourceId: 'promethium-cells', amount: 3 },
    ],
    time: 12,
  },
  {
    id: 'placeholder-metal-11',
    name: 'Placeholder Metal 11',
    levelRequired: 85,
    xpReward: 60,
    icon: '⚛️',
    description: 'Archeotech-infused metal',
    ingredients: [
      { resourceId: 'archeotech-fragments', amount: 1 },
      { resourceId: 'machine-spirits', amount: 1 },
      { resourceId: 'psyker-crystals', amount: 1 },
    ],
    time: 10,
  },
  {
    id: 'placeholder-metal-12',
    name: 'Placeholder Metal 12',
    levelRequired: 100,
    xpReward: 85,
    icon: '🧬',
    description: 'Gene-seed enhanced alloy',
    ingredients: [
      { resourceId: 'gene-seed', amount: 1 },
      { resourceId: 'adamantium-ore', amount: 2 },
    ],
    time: 11,
  },
  {
    id: 'placeholder-metal-13',
    name: 'Placeholder Metal 13',
    levelRequired: 100,
    xpReward: 119,
    icon: '🌌',
    description: 'Warp-infused metal',
    ingredients: [
      { resourceId: 'warp-cores', amount: 1 },
      { resourceId: 'plasma-coils', amount: 2 },
    ],
    time: 15,
  },
  {
    id: 'placeholder-metal-14',
    name: 'Placeholder Metal 14',
    levelRequired: 105,
    xpReward: 110,
    icon: '👑',
    description: 'Emperor-blessed alloy',
    ingredients: [
      { resourceId: 'emperor-relics', amount: 1 },
      { resourceId: 'gene-seed', amount: 1 },
      { resourceId: 'primarch-essence', amount: 1 },
    ],
    time: 12,
  },
  {
    id: 'placeholder-metal-15',
    name: 'Placeholder Metal 15',
    levelRequired: 108,
    xpReward: 161,
    icon: '😈',
    description: 'Chaos-tainted metal',
    ingredients: [
      { resourceId: 'chaos-artifacts', amount: 1 },
      { resourceId: 'warp-cores', amount: 1 },
    ],
    time: 14,
  },
  {
    id: 'placeholder-metal-16',
    name: 'Placeholder Metal 16',
    levelRequired: 110,
    xpReward: 178,
    icon: '🤖',
    description: 'Necron-alloy',
    ingredients: [
      { resourceId: 'necron-technology', amount: 1 },
      { resourceId: 'archeotech-fragments', amount: 2 },
    ],
    time: 16,
  },
  {
    id: 'placeholder-metal-17',
    name: 'Placeholder Metal 17',
    levelRequired: 115,
    xpReward: 212,
    icon: '🦠',
    description: 'Tyranid-biological alloy',
    ingredients: [
      { resourceId: 'tyranid-biomass', amount: 1 },
      { resourceId: 'eldar-spirit-stones', amount: 1 },
      { resourceId: 'void-shards', amount: 1 },
    ],
    time: 18,
  },
]

