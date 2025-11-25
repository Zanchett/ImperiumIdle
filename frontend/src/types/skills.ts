import { getExperienceForLevel } from '../utils/experience'

export type SkillCategory = 'COMBAT PROTOCOLS' | 'PASSIVE SYSTEMS' | 'NON-COMBAT PROTOCOLS'

export interface Skill {
  id: string
  name: string
  category: SkillCategory
  icon: string
  level: number
  experience: number
  experienceToNext: number
  mastery: number
  description: string
}

export interface SkillCategoryData {
  name: SkillCategory
  icon: string
  skills: Skill[]
  collapsed?: boolean
}

export const SKILL_CATEGORIES: SkillCategoryData[] = [
  {
    name: 'COMBAT PROTOCOLS',
    icon: '⚔️',
    collapsed: true,
    skills: [
      {
        id: 'bolter-training',
        name: 'Bolter Training',
        category: 'COMBAT PROTOCOLS',
        icon: '🔫',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Master the sacred art of bolter warfare. Increase damage and accuracy with ranged weapons.',
      },
      {
        id: 'melee-combat',
        name: 'Melee Combat',
        category: 'COMBAT PROTOCOLS',
        icon: '⚔️',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Close quarters combat training. Unlock powerful melee weapons and techniques.',
      },
      {
        id: 'imperial-tactics',
        name: 'Imperial Tactics',
        category: 'COMBAT PROTOCOLS',
        icon: '🛡️',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Strategic warfare knowledge. Enhance combat effectiveness through superior tactics.',
      },
      {
        id: 'fortification',
        name: 'Fortification',
        category: 'COMBAT PROTOCOLS',
        icon: '🏰',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Build and maintain defensive structures. Protect your base from invaders.',
      },
    ],
  },
  {
    name: 'PASSIVE SYSTEMS',
    icon: '⚙️',
    collapsed: true,
    skills: [
      {
        id: 'leadership',
        name: 'Leadership',
        category: 'PASSIVE SYSTEMS',
        icon: '👑',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Command your forces with unwavering authority. Increases efficiency of all operations.',
      },
      {
        id: 'supply-logistics',
        name: 'Supply Logistics',
        category: 'PASSIVE SYSTEMS',
        icon: '📦',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Manage resources and supply chains. Reduces costs and increases storage capacity.',
      },
      {
        id: 'intelligence',
        name: 'Intelligence',
        category: 'PASSIVE SYSTEMS',
        icon: '🔍',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Gather intelligence on enemy movements. Unlocks strategic advantages.',
      },
      {
        id: 'colony',
        name: 'Colony',
        category: 'PASSIVE SYSTEMS',
        icon: '🏘️',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Build and manage a thriving settlement. Recruit villagers, construct buildings, and establish a self-sustaining colony.',
      },
    ],
  },
  {
    name: 'NON-COMBAT PROTOCOLS',
    icon: '🔧',
    collapsed: false,
    skills: [
      {
        id: 'salvaging',
        name: 'Salvaging',
        category: 'NON-COMBAT PROTOCOLS',
        icon: '🗑️',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Recover valuable materials from wreckage and debris.',
      },
      {
        id: 'engineering',
        name: 'Engineering',
        category: 'NON-COMBAT PROTOCOLS',
        icon: '🔧',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Design and construct advanced machinery and equipment.',
      },
      {
        id: 'medicae',
        name: 'Medicae',
        category: 'NON-COMBAT PROTOCOLS',
        icon: '⚕️',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Heal wounds and maintain the health of your forces.',
      },
      {
        id: 'tech-use',
        name: 'Tech-Use',
        category: 'NON-COMBAT PROTOCOLS',
        icon: '💻',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Interact with and maintain advanced technology and machinery.',
      },
      {
        id: 'research',
        name: 'Research',
        category: 'NON-COMBAT PROTOCOLS',
        icon: '📚',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Unlock new technologies and improve existing systems through study.',
      },
      {
        id: 'manufactorum',
        name: 'Manufactorum',
        category: 'NON-COMBAT PROTOCOLS',
        icon: '🏭',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Mass produce weapons, armor, and equipment for your forces.',
      },
      {
        id: 'industry',
        name: 'Industry',
        category: 'NON-COMBAT PROTOCOLS',
        icon: '⚙️',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Expand industrial capacity and production efficiency.',
      },
      {
        id: 'communication',
        name: 'Communication',
        category: 'NON-COMBAT PROTOCOLS',
        icon: '📡',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Establish contact with distant worlds and trading partners across the galaxy.',
      },
      {
        id: 'commerce',
        name: 'Commerce',
        category: 'NON-COMBAT PROTOCOLS',
        icon: '💰',
        level: 1,
        experience: 0,
        experienceToNext: getExperienceForLevel(2),
        mastery: 0,
        description: 'Trade goods and materials with contacted planets for profit.',
      },
    ],
  },
]

