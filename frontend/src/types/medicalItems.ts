export interface MedicalItem {
  id: string
  name: string
  icon: string
  description: string
  value: number // Gold value
}

export const MEDICAL_ITEMS: MedicalItem[] = [
  {
    id: 'ripped-bandage',
    name: 'Ripped Bandage',
    icon: '🩹',
    description: 'Torn medical cloth, can be used for basic wound care.',
    value: 5,
  },
  {
    id: 'medical-gauze',
    name: 'Medical Gauze',
    icon: '🩺',
    description: 'Sterile gauze for treating wounds.',
    value: 10,
  },
  {
    id: 'pain-reliever',
    name: 'Pain Reliever',
    icon: '💊',
    description: 'Basic pain medication for minor injuries.',
    value: 15,
  },
  {
    id: 'antiseptic',
    name: 'Antiseptic',
    icon: '🧴',
    description: 'Disinfectant solution for preventing infection.',
    value: 20,
  },
  {
    id: 'surgical-thread',
    name: 'Surgical Thread',
    icon: '🧵',
    description: 'Sterile thread for suturing wounds.',
    value: 25,
  },
  {
    id: 'combat-stims',
    name: 'Combat Stimms',
    icon: '💉',
    description: 'Performance-enhancing combat stimulants.',
    value: 50,
  },
  {
    id: 'blood-pack',
    name: 'Blood Pack',
    icon: '🩸',
    description: 'Preserved blood for transfusions.',
    value: 75,
  },
  {
    id: 'organ-preserver',
    name: 'Organ Preserver',
    icon: '🧊',
    description: 'Cryogenic container for preserving organs.',
    value: 100,
  },
  {
    id: 'bionic-component',
    name: 'Bionic Component',
    icon: '🔧',
    description: 'Mechanical parts for bionic enhancements.',
    value: 150,
  },
  {
    id: 'gene-serum',
    name: 'Gene Serum',
    icon: '🧬',
    description: 'Genetic modification serum.',
    value: 200,
  },
  {
    id: 'rejuvenat-dose',
    name: 'Rejuvenat Dose',
    icon: '⚗️',
    description: 'Anti-aging treatment serum.',
    value: 300,
  },
  {
    id: 'psyker-essence',
    name: 'Psyker Essence',
    icon: '🔮',
    description: 'Concentrated psychic energy for healing.',
    value: 400,
  },
  {
    id: 'emperor-blessing-charm',
    name: 'Emperor\'s Blessing Charm',
    icon: '👑',
    description: 'Sacred charm imbued with divine healing power.',
    value: 500,
  },
]

