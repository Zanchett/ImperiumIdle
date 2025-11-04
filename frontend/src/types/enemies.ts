export interface Enemy {
  id: string
  name: string
  image: string
  level: number
  health: number
  maxHealth: number
  attacks: {
    name: string
    damage: number
    type: string
  }[]
  takesDamage: {
    from: string
    multiplier: number
  }[]
  xpReward: number
  goldReward: number
  hitChance: number // Enemy's hit chance against player (for enemy attacks)
  attackSpeed: number // Attack speed in milliseconds
  // Affinity values for different attack types (affinity = base hit chance multiplier, 0-100)
  affinity: {
    bash: number // Affinity against bash attacks
    cut: number // Affinity against cut attacks
    stab: number // Affinity against stab attacks
    block: number // Affinity against block (not used in hit chance, but kept for consistency)
  }
  armor: number // Armor rating (d in hit chance formula)
}

export type DungeonCategory = 'standard' | 'veteran' | 'chaos-infested' | 'daemon-princes' | 'forbidden-relics'

export interface Dungeon {
  id: string
  name: string
  level: number
  enemies: Enemy[]
  description: string
  category: DungeonCategory
}

export const DUNGEONS: Dungeon[] = [
  // Standard Engagements
  {
    id: 'abandoned-facility',
    name: 'Abandoned Facility',
    level: 1,
    description: 'Forsaken Imperial outpost overrun by chaos',
    category: 'standard',
    enemies: [
      {
        id: 'chaos-cultist',
        name: 'Chaos Cultist',
        image: '👹',
        level: 1,
        health: 12,
        maxHealth: 12,
        attacks: [
          { name: 'Wild Strike', damage: 8, type: 'physical' },
          { name: 'Dark Chant', damage: 5, type: 'chaos' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 1.0 },
          { from: 'chaos', multiplier: 1.2 },
        ],
        xpReward: 10,
        goldReward: 25,
        hitChance: 60, // Level 1
        attackSpeed: 4000,
        affinity: {
          bash: 55,
          cut: 90,
          stab: 65,
          block: 55,
        },
        armor: 30,
      },
      {
        id: 'mutant-scavenger',
        name: 'Mutant Scavenger',
        image: '🧬',
        level: 3,
        health: 18,
        maxHealth: 18,
        attacks: [
          { name: 'Claw Swipe', damage: 12, type: 'physical' },
          { name: 'Toxic Bite', damage: 8, type: 'poison' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 0.9 },
          { from: 'fire', multiplier: 1.5 },
        ],
        xpReward: 20,
        goldReward: 40,
        hitChance: 65,
        attackSpeed: 4000,
        affinity: {
          bash: 55,
          cut: 55,
          stab: 90,
          block: 55,
        },
        armor: 40,
      },
      {
        id: 'corrupted-guardian',
        name: 'Corrupted Guardian',
        image: '🤖',
        level: 5,
        health: 25,
        maxHealth: 25,
        attacks: [
          { name: 'Plasma Bolt', damage: 15, type: 'energy' },
          { name: 'Overcharge', damage: 20, type: 'energy' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 1.1 },
          { from: 'energy', multiplier: 0.8 },
        ],
        xpReward: 35,
        goldReward: 60,
        hitChance: 70,
        attackSpeed: 4000,
        affinity: {
          bash: 45,
          cut: 55,
          stab: 65,
          block: 55,
        },
        armor: 60,
      },
    ],
  },
  {
    id: 'chaos-wastes',
    name: 'Chaos Wastes',
    level: 10,
    description: 'Tainted lands where reality breaks down',
    category: 'standard',
    enemies: [
      {
        id: 'daemon-spawn',
        name: 'Daemon Spawn',
        image: '👺',
        level: 10,
        health: 35,
        maxHealth: 35,
        attacks: [
          { name: 'Warp Claw', damage: 20, type: 'chaos' },
          { name: 'Soul Drain', damage: 15, type: 'chaos' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 1.0 },
          { from: 'chaos', multiplier: 0.9 },
          { from: 'holy', multiplier: 1.5 },
        ],
        xpReward: 50,
        goldReward: 100,
        hitChance: 70, // Level 10
        attackSpeed: 4000,
        affinity: {
          bash: 55,
          cut: 55,
          stab: 55,
          block: 55,
        },
        armor: 50,
      },
      {
        id: 'possessed-marine',
        name: 'Possessed Marine',
        image: '⚔️',
        level: 15,
        health: 45,
        maxHealth: 45,
        attacks: [
          { name: 'Chainsword Strike', damage: 25, type: 'physical' },
          { name: 'Warp Rage', damage: 30, type: 'chaos' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 0.9 },
          { from: 'chaos', multiplier: 1.0 },
          { from: 'holy', multiplier: 1.3 },
        ],
        xpReward: 75,
        goldReward: 150,
        hitChance: 72, // Level 15
        attackSpeed: 4000,
        affinity: {
          bash: 55,
          cut: 55,
          stab: 55,
          block: 55,
        },
        armor: 70,
      },
    ],
  },
  // Veteran Operations
  {
    id: 'void-station',
    name: 'Void Station Alpha',
    level: 25,
    description: 'Derelict space station crawling with xenos',
    category: 'veteran',
    enemies: [
      {
        id: 'void-predator',
        name: 'Void Predator',
        image: '🌌',
        level: 25,
        health: 70,
        maxHealth: 70,
        attacks: [
          { name: 'Void Claw', damage: 35, type: 'void' },
          { name: 'Phase Strike', damage: 45, type: 'void' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 0.9 },
          { from: 'void', multiplier: 0.7 },
          { from: 'holy', multiplier: 1.4 },
        ],
        xpReward: 150,
        goldReward: 300,
        hitChance: 75, // Level 25
        attackSpeed: 4000,
        affinity: {
          bash: 55,
          cut: 55,
          stab: 55,
          block: 55,
        },
        armor: 100,
      },
      {
        id: 'eldar-ranger',
        name: 'Eldar Ranger',
        image: '🏹',
        level: 30,
        health: 85,
        maxHealth: 85,
        attacks: [
          { name: 'Shuriken Volley', damage: 40, type: 'physical' },
          { name: 'Psychic Bolt', damage: 50, type: 'psychic' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 1.0 },
          { from: 'psychic', multiplier: 1.1 },
          { from: 'holy', multiplier: 1.2 },
        ],
        xpReward: 180,
        goldReward: 350,
        hitChance: 77, // Level 30
        attackSpeed: 4000,
        affinity: {
          bash: 55,
          cut: 55,
          stab: 55,
          block: 55,
        },
        armor: 120,
      },
    ],
  },
  {
    id: 'imperial-bunker',
    name: 'Fortified Bunker',
    level: 35,
    description: 'Heavily defended Imperial stronghold',
    category: 'veteran',
    enemies: [
      {
        id: 'storm-trooper',
        name: 'Elite Storm Trooper',
        image: '⚔️',
        level: 35,
        health: 100,
        maxHealth: 100,
        attacks: [
          { name: 'Hot-Shot Volley', damage: 50, type: 'energy' },
          { name: 'Grenade Launcher', damage: 65, type: 'explosive' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 0.95 },
          { from: 'energy', multiplier: 1.0 },
          { from: 'explosive', multiplier: 0.9 },
        ],
        xpReward: 220,
        goldReward: 450,
        hitChance: 78, // Level 35
        attackSpeed: 4000,
        affinity: {
          bash: 55,
          cut: 55,
          stab: 55,
          block: 55,
        },
        armor: 140,
      },
    ],
  },
  // Chaos-Infested Zones
  {
    id: 'warp-rift',
    name: 'Warp Rift',
    level: 50,
    description: 'Reality tear spewing daemonic entities',
    category: 'chaos-infested',
    enemies: [
      {
        id: 'bloodletter',
        name: 'Bloodletter',
        image: '🔴',
        level: 50,
        health: 150,
        maxHealth: 150,
        attacks: [
          { name: 'Hellblade', damage: 70, type: 'chaos' },
          { name: 'Blood Rage', damage: 90, type: 'chaos' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 1.1 },
          { from: 'chaos', multiplier: 0.8 },
          { from: 'holy', multiplier: 1.6 },
        ],
        xpReward: 300,
        goldReward: 600,
        hitChance: 80, // Level 50
        attackSpeed: 4000,
        affinity: {
          bash: 55,
          cut: 55,
          stab: 55,
          block: 55,
        },
        armor: 200,
      },
      {
        id: 'plaguebearer',
        name: 'Plaguebearer',
        image: '🟢',
        level: 55,
        health: 170,
        maxHealth: 170,
        attacks: [
          { name: 'Noxious Cloud', damage: 60, type: 'poison' },
          { name: 'Corrupting Touch', damage: 80, type: 'chaos' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 1.0 },
          { from: 'poison', multiplier: 0.5 },
          { from: 'holy', multiplier: 1.5 },
        ],
        xpReward: 350,
        goldReward: 700,
        hitChance: 81, // Level 55
        attackSpeed: 4000,
        affinity: {
          bash: 55,
          cut: 55,
          stab: 55,
          block: 55,
        },
        armor: 220,
      },
    ],
  },
  {
    id: 'black-crusade',
    name: 'Black Crusade Outpost',
    level: 65,
    description: 'Forward base of a Chaos warband',
    category: 'chaos-infested',
    enemies: [
      {
        id: 'chaos-champion',
        name: 'Chaos Champion',
        image: '⚔️',
        level: 65,
        health: 210,
        maxHealth: 210,
        attacks: [
          { name: 'Power Sword Strike', damage: 100, type: 'chaos' },
          { name: 'Warpfire', damage: 120, type: 'chaos' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 0.9 },
          { from: 'chaos', multiplier: 0.85 },
          { from: 'holy', multiplier: 1.7 },
        ],
        xpReward: 450,
        goldReward: 900,
        hitChance: 83, // Level 65
        attackSpeed: 4000,
        affinity: {
          bash: 55,
          cut: 55,
          stab: 55,
          block: 55,
        },
        armor: 260,
      },
    ],
  },
  // Daemon Princes (Bosses)
  {
    id: 'bloodthirster',
    name: 'Bloodthirster of Khorne',
    level: 80,
    description: 'Greater Daemon of Khorne, Lord of Battle',
    category: 'daemon-princes',
    enemies: [
      {
        id: 'bloodthirster-boss',
        name: 'Bloodthirster',
        image: '👹',
        level: 80,
        health: 300,
        maxHealth: 300,
        attacks: [
          { name: 'Axe of Khorne', damage: 200, type: 'chaos' },
          { name: 'Whip of Fire', damage: 180, type: 'chaos' },
          { name: 'Rage of Khorne', damage: 250, type: 'chaos' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 1.0 },
          { from: 'chaos', multiplier: 0.7 },
          { from: 'holy', multiplier: 2.0 },
        ],
        xpReward: 1000,
        goldReward: 5000,
        hitChance: 85, // Level 80
        attackSpeed: 4000,
        affinity: {
          bash: 40,
          cut: 40,
          stab: 40,
          block: 40,
        },
        armor: 400,
      },
    ],
  },
  {
    id: 'great-unclean-one',
    name: 'Great Unclean One',
    level: 85,
    description: 'Greater Daemon of Nurgle, Plaguefather',
    category: 'daemon-princes',
    enemies: [
      {
        id: 'great-unclean-one-boss',
        name: 'Great Unclean One',
        image: '🟢',
        level: 85,
        health: 350,
        maxHealth: 350,
        attacks: [
          { name: 'Plague Scythe', damage: 180, type: 'poison' },
          { name: 'Nurgle\'s Rot', damage: 150, type: 'poison' },
          { name: 'Corrupting Embrace', damage: 220, type: 'chaos' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 0.95 },
          { from: 'poison', multiplier: 0.4 },
          { from: 'holy', multiplier: 1.9 },
        ],
        xpReward: 1200,
        goldReward: 6000,
        hitChance: 86, // Level 85
        attackSpeed: 4000,
        affinity: {
          bash: 40,
          cut: 40,
          stab: 40,
          block: 40,
        },
        armor: 450,
      },
    ],
  },
  // Forbidden Relics
  {
    id: 'archeotech-vault',
    name: 'Archeotech Vault',
    level: 40,
    description: 'Ancient vault containing pre-Imperial technology',
    category: 'forbidden-relics',
    enemies: [
      {
        id: 'construct-guardian',
        name: 'Automaton Guardian',
        image: '🤖',
        level: 40,
        health: 115,
        maxHealth: 115,
        attacks: [
          { name: 'Tesla Arc', damage: 55, type: 'energy' },
          { name: 'Gauss Beam', damage: 70, type: 'energy' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 1.2 },
          { from: 'energy', multiplier: 0.6 },
          { from: 'explosive', multiplier: 1.3 },
        ],
        xpReward: 280,
        goldReward: 800,
        hitChance: 79, // Level 40
        attackSpeed: 4000,
        affinity: {
          bash: 55,
          cut: 55,
          stab: 55,
          block: 55,
        },
        armor: 160,
      },
      {
        id: 'phase-warrior',
        name: 'Phase Warrior',
        image: '⚡',
        level: 45,
        health: 130,
        maxHealth: 130,
        attacks: [
          { name: 'Phase Blade', damage: 65, type: 'energy' },
          { name: 'Quantum Strike', damage: 85, type: 'void' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 1.3 },
          { from: 'energy', multiplier: 0.8 },
          { from: 'void', multiplier: 0.9 },
        ],
        xpReward: 320,
        goldReward: 1000,
        hitChance: 82, // Level 60
        attackSpeed: 4000,
        affinity: {
          bash: 55,
          cut: 55,
          stab: 55,
          block: 55,
        },
        armor: 240,
      },
    ],
  },
  {
    id: 'eldar-webway',
    name: 'Eldar Webway Portal',
    level: 60,
    description: 'Dimensional gateway protected by Aeldari forces',
    category: 'forbidden-relics',
    enemies: [
      {
        id: 'howling-banshee',
        name: 'Howling Banshee',
        image: '👻',
        level: 60,
        health: 190,
        maxHealth: 190,
        attacks: [
          { name: 'Power Sword', damage: 80, type: 'psychic' },
          { name: 'Banshee Howl', damage: 70, type: 'psychic' },
        ],
        takesDamage: [
          { from: 'physical', multiplier: 0.95 },
          { from: 'psychic', multiplier: 1.2 },
          { from: 'energy', multiplier: 1.1 },
        ],
        xpReward: 400,
        goldReward: 1200,
        hitChance: 84, // Level 70
        attackSpeed: 4000,
        affinity: {
          bash: 55,
          cut: 55,
          stab: 55,
          block: 55,
        },
        armor: 280,
      },
    ],
  },
]

