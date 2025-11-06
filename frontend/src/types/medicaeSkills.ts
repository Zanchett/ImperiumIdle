export enum MedicaeSkillType {
  Healing = 'healing',
  Buff = 'buff',
  Passive = 'passive',
}

export interface MedicaeSkill {
  id: string
  name: string
  type: MedicaeSkillType
  levelRequired: number
  knowledgePointCost: number
  prerequisites: string[] // IDs of skills that must be unlocked first
  icon: string
  description: string
}

export const MEDICAE_SKILL_TREE: MedicaeSkill[] = [
  {
    id: 'first-aid',
    name: 'First Aid',
    type: MedicaeSkillType.Healing,
    levelRequired: 1,
    knowledgePointCost: 5,
    prerequisites: [],
    icon: '🩹',
    description: 'A basic healing ability, restores a small amount of health.',
  },
  {
    id: 'combat-stimms',
    name: 'Combat Stimms',
    type: MedicaeSkillType.Buff,
    levelRequired: 10,
    knowledgePointCost: 10,
    prerequisites: ['first-aid'],
    icon: '💉',
    description: 'Inject combat stimms to temporarily increase attack speed.',
  },
  {
    id: 'med-kit',
    name: 'Med-Kit',
    type: MedicaeSkillType.Healing,
    levelRequired: 15,
    knowledgePointCost: 15,
    prerequisites: ['first-aid'],
    icon: '🧰',
    description: 'Advanced medical kit that restores more health than first aid.',
  },
  {
    id: 'regeneration-serum',
    name: 'Regeneration Serum',
    type: MedicaeSkillType.Passive,
    levelRequired: 20,
    knowledgePointCost: 20,
    prerequisites: ['med-kit'],
    icon: '💚',
    description: 'Passive health regeneration over time.',
  },
  {
    id: 'adrenaline-boost',
    name: 'Adrenaline Boost',
    type: MedicaeSkillType.Buff,
    levelRequired: 25,
    knowledgePointCost: 25,
    prerequisites: ['combat-stimms'],
    icon: '⚡',
    description: 'Temporary boost to damage and critical hit chance.',
  },
  {
    id: 'field-surgery',
    name: 'Field Surgery',
    type: MedicaeSkillType.Healing,
    levelRequired: 30,
    knowledgePointCost: 30,
    prerequisites: ['med-kit'],
    icon: '🔪',
    description: 'Major healing procedure that restores significant health.',
  },
  {
    id: 'pain-suppression',
    name: 'Pain Suppression',
    type: MedicaeSkillType.Passive,
    levelRequired: 35,
    knowledgePointCost: 35,
    prerequisites: ['regeneration-serum'],
    icon: '🛡️',
    description: 'Reduces incoming damage by suppressing pain responses.',
  },
  {
    id: 'bionic-repair',
    name: 'Bionic Repair',
    type: MedicaeSkillType.Healing,
    levelRequired: 40,
    knowledgePointCost: 40,
    prerequisites: ['field-surgery'],
    icon: '🤖',
    description: 'Advanced healing that works on both biological and mechanical systems.',
  },
  {
    id: 'rejuvenat-injection',
    name: 'Rejuvenat Injection',
    type: MedicaeSkillType.Buff,
    levelRequired: 45,
    knowledgePointCost: 45,
    prerequisites: ['adrenaline-boost'],
    icon: '⏳',
    description: 'Temporary boost to all combat stats and health regeneration.',
  },
  {
    id: 'emperor-blessing',
    name: 'Emperor\'s Blessing',
    type: MedicaeSkillType.Healing,
    levelRequired: 50,
    knowledgePointCost: 50,
    prerequisites: ['bionic-repair'],
    icon: '👑',
    description: 'Divine healing that fully restores health and provides temporary invulnerability.',
  },
  {
    id: 'immortality-protocol',
    name: 'Immortality Protocol',
    type: MedicaeSkillType.Passive,
    levelRequired: 100,
    knowledgePointCost: 100,
    prerequisites: ['emperor-blessing'],
    icon: '♾️',
    description: 'Ultimate passive ability: chance to survive fatal damage.',
  },
]

