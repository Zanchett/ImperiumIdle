export interface MedicaeResearchTopic {
  id: string
  name: string
  levelRequired: number
  baseTime: number // Time in seconds to research
  xpReward: number
  knowledgePointsReward: number
  icon?: string
  description: string
  // Optional item drop chance
  itemDrop?: {
    itemId: string // ID of the medical item that can drop
    dropChance: number // Percentage chance (0-100) to get the item
  }
  // Optional knowledge drop chance
  knowledgeDrop?: {
    rarity: number // 1-12, representing different rarity tiers
    dropChance: number // Percentage chance (0-100) to get knowledge
  }
}

export const MEDICAE_RESEARCH_TOPICS: MedicaeResearchTopic[] = [
  {
    id: 'basic-anatomy',
    name: 'Basic Anatomy',
    levelRequired: 1,
    baseTime: 3,
    xpReward: 5,
    knowledgePointsReward: 1,
    icon: '🦴',
    description: 'Fundamental understanding of biological structures.',
    itemDrop: {
      itemId: 'ripped-bandage',
      dropChance: 10, // 10% chance
    },
    knowledgeDrop: {
      rarity: 1, // Common
      dropChance: 25, // 25% chance
    },
  },
  {
    id: 'wound-dressing',
    name: 'Wound Dressing Techniques',
    levelRequired: 5,
    baseTime: 3,
    xpReward: 10,
    knowledgePointsReward: 2,
    icon: '🩹',
    description: 'Basic methods for treating minor injuries and preventing infection.',
    itemDrop: {
      itemId: 'medical-gauze',
      dropChance: 15, // 15% chance
    },
    knowledgeDrop: {
      rarity: 2, // Uncommon
      dropChance: 30, // 30% chance
    },
  },
  {
    id: 'pain-management',
    name: 'Pain Management',
    levelRequired: 10,
    baseTime: 3,
    xpReward: 15,
    knowledgePointsReward: 3,
    icon: '💊',
    description: 'Techniques for alleviating pain and discomfort in patients.',
    itemDrop: {
      itemId: 'pain-reliever',
      dropChance: 20, // 20% chance
    },
    knowledgeDrop: {
      rarity: 3, // Rare
      dropChance: 35, // 35% chance
    },
  },
  {
    id: 'combat-medicine',
    name: 'Combat Medicine',
    levelRequired: 15,
    baseTime: 3,
    xpReward: 20,
    knowledgePointsReward: 4,
    icon: '⚔️',
    description: 'Emergency medical procedures for battlefield injuries.',
    itemDrop: {
      itemId: 'antiseptic',
      dropChance: 25, // 25% chance
    },
    knowledgeDrop: {
      rarity: 4, // Epic
      dropChance: 30, // 30% chance
    },
  },
  {
    id: 'surgical-procedures',
    name: 'Surgical Procedures',
    levelRequired: 20,
    baseTime: 3,
    xpReward: 25,
    knowledgePointsReward: 5,
    icon: '🔪',
    description: 'Advanced surgical techniques for complex injuries.',
    itemDrop: {
      itemId: 'surgical-thread',
      dropChance: 30, // 30% chance
    },
    knowledgeDrop: {
      rarity: 5, // Legendary
      dropChance: 25, // 25% chance
    },
  },
  {
    id: 'organ-repair',
    name: 'Organ Repair',
    levelRequired: 25,
    baseTime: 3,
    xpReward: 30,
    knowledgePointsReward: 6,
    icon: '❤️',
    description: 'Methods for repairing damaged internal organs.',
    itemDrop: {
      itemId: 'blood-pack',
      dropChance: 25, // 25% chance
    },
    knowledgeDrop: {
      rarity: 6, // Mythic
      dropChance: 20, // 20% chance
    },
  },
  {
    id: 'prosthetics',
    name: 'Prosthetics',
    levelRequired: 30,
    baseTime: 3,
    xpReward: 35,
    knowledgePointsReward: 7,
    icon: '🦾',
    description: 'Creation and installation of prosthetic limbs and organs.',
    itemDrop: {
      itemId: 'organ-preserver',
      dropChance: 30, // 30% chance
    },
    knowledgeDrop: {
      rarity: 7, // Ancient
      dropChance: 18, // 18% chance
    },
  },
  {
    id: 'gene-therapy',
    name: 'Gene Therapy',
    levelRequired: 35,
    baseTime: 3,
    xpReward: 40,
    knowledgePointsReward: 8,
    icon: '🧬',
    description: 'Advanced genetic modification and healing techniques.',
    itemDrop: {
      itemId: 'gene-serum',
      dropChance: 20, // 20% chance
    },
    knowledgeDrop: {
      rarity: 8, // Divine
      dropChance: 15, // 15% chance
    },
  },
  {
    id: 'bionic-enhancements',
    name: 'Bionic Enhancements',
    levelRequired: 40,
    baseTime: 3,
    xpReward: 45,
    knowledgePointsReward: 9,
    icon: '🤖',
    description: 'Integration of mechanical and biological systems.',
    itemDrop: {
      itemId: 'bionic-component',
      dropChance: 25, // 25% chance
    },
    knowledgeDrop: {
      rarity: 9, // Celestial
      dropChance: 12, // 12% chance
    },
  },
  {
    id: 'rejuvenat-treatments',
    name: 'Rejuvenat Treatments',
    levelRequired: 45,
    baseTime: 3,
    xpReward: 50,
    knowledgePointsReward: 10,
    icon: '⏳',
    description: 'Anti-aging and life extension procedures.',
    itemDrop: {
      itemId: 'rejuvenat-dose',
      dropChance: 20, // 20% chance
    },
    knowledgeDrop: {
      rarity: 10, // Transcendent
      dropChance: 10, // 10% chance
    },
  },
  {
    id: 'psyker-healing',
    name: 'Psyker Healing',
    levelRequired: 50,
    baseTime: 3,
    xpReward: 55,
    knowledgePointsReward: 11,
    icon: '🔮',
    description: 'Psyker-assisted healing and restoration techniques.',
    itemDrop: {
      itemId: 'psyker-essence',
      dropChance: 15, // 15% chance
    },
    knowledgeDrop: {
      rarity: 11, // Primordial
      dropChance: 8, // 8% chance
    },
  },
  {
    id: 'apothecary-arts',
    name: 'Apothecary Arts',
    levelRequired: 55,
    baseTime: 3,
    xpReward: 60,
    knowledgePointsReward: 12,
    icon: '⚗️',
    description: 'Advanced pharmaceutical and alchemical medicine.',
    itemDrop: {
      itemId: 'combat-stims',
      dropChance: 35, // 35% chance
    },
    knowledgeDrop: {
      rarity: 12, // Cosmic
      dropChance: 5, // 5% chance
    },
  },
  {
    id: 'necromancy-healing',
    name: 'Necromancy Healing',
    levelRequired: 60,
    baseTime: 3,
    xpReward: 65,
    knowledgePointsReward: 13,
    icon: '💀',
    description: 'Dark arts of preserving life beyond natural limits.',
    itemDrop: {
      itemId: 'organ-preserver',
      dropChance: 40, // 40% chance
    },
    knowledgeDrop: {
      rarity: 11, // Primordial
      dropChance: 12, // 12% chance
    },
  },
  {
    id: 'emperor-blessing',
    name: 'Emperor\'s Blessing',
    levelRequired: 70,
    baseTime: 3,
    xpReward: 75,
    knowledgePointsReward: 15,
    icon: '👑',
    description: 'Divine healing through faith in the Emperor.',
    itemDrop: {
      itemId: 'emperor-blessing-charm',
      dropChance: 10, // 10% chance (rare)
    },
    knowledgeDrop: {
      rarity: 12, // Cosmic
      dropChance: 3, // 3% chance (very rare)
    },
  },
  {
    id: 'immortality-research',
    name: 'Immortality Research',
    levelRequired: 100,
    baseTime: 3,
    xpReward: 100,
    knowledgePointsReward: 20,
    icon: '♾️',
    description: 'Ultimate goal of medical science: eternal life.',
    itemDrop: {
      itemId: 'rejuvenat-dose',
      dropChance: 50, // 50% chance
    },
    knowledgeDrop: {
      rarity: 12, // Cosmic
      dropChance: 15, // 15% chance
    },
  },
]

