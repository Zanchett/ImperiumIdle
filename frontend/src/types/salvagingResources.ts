export interface SalvagingResource {
  id: string
  name: string
  levelRequired: number
  icon?: string
  baseTime: number // Time in seconds to gather
  xpReward: number
  respawnTime: number // Time in seconds before resource respawns (0 = no respawn)
  value: number // Gold/throne gelt value
  description: string
}

export const SALVAGING_RESOURCES: SalvagingResource[] = [
  { id: 'ferrite-ore', name: 'Ferrite Ore', levelRequired: 1, baseTime: 3, xpReward: 5, respawnTime: 1, value: 0, icon: '⚙️', description: 'Corroded metal fragments from destroyed vehicles' },
  { id: 'roughsteel-scrap', name: 'Roughsteel Scrap', levelRequired: 1, baseTime: 3, xpReward: 7, respawnTime: 5, value: 198, icon: '🔩', description: 'Small fragments of Imperial armor plating' },
  { id: 'gunmetal-ore', name: 'Gunmetal Ore', levelRequired: 1, baseTime: 3, xpReward: 7, respawnTime: 5, value: 198, icon: '🪟', description: 'Shattered transparisteel from ruined structures' },
  { id: 'cobalt-fragments', name: 'Cobalt Fragments', levelRequired: 15, baseTime: 3, xpReward: 14, respawnTime: 10, value: 495, icon: '🔋', description: 'Partially drained fuel cells from Imperial equipment' },
  { id: 'void-slate-cluster', name: 'Void-Slate Cluster', levelRequired: 30, baseTime: 3, xpReward: 18, respawnTime: 10, value: 1287, icon: '🛡️', description: 'Damaged armor plating from Astartes equipment' },
  { id: 'oxidized-iron', name: 'Oxidized Iron', levelRequired: 30, baseTime: 3, xpReward: 25, respawnTime: 15, value: 2475, icon: '💀', description: 'Deactivated servo-skull units for parts' },
  { id: 'pyrestone-ore', name: 'Pyrestone Ore', levelRequired: 40, baseTime: 3, xpReward: 28, respawnTime: 15, value: 2970, icon: '💎', description: 'Raw adamantium extracted from fortress ruins' },
  { id: 'power-conduits', name: 'Power Conduits', levelRequired: 40, baseTime: 3, xpReward: 28, respawnTime: 120, value: 9900, icon: '⚡', description: 'Salvaged energy transmission components' },
  { id: 'machine-spirits', name: 'Impure Gold ore', levelRequired: 50, baseTime: 3, xpReward: 65, respawnTime: 20, value: 6435, icon: '🤖', description: 'Salvaged cogitator cores with intact data' },
  { id: 'vox-units', name: 'Vox Units', levelRequired: 70, baseTime: 3, xpReward: 71, respawnTime: 30, value: 8712, icon: '📻', description: 'Communication equipment from fallen guardsmen' },
  { id: 'auspex-scanners', name: 'Auspex Scanners', levelRequired: 80, baseTime: 3, xpReward: 86, respawnTime: 60, value: 9900, icon: '📡', description: 'Advanced detection equipment' },
  { id: 'plasma-coils', name: 'Plasma Coils', levelRequired: 85, baseTime: 3, xpReward: 95, respawnTime: 240, value: 74250, icon: '🌀', description: 'Dangerous but valuable plasma weapon components' },
  { id: 'psyker-crystals', name: 'Psyker Crystals', levelRequired: 270, baseTime: 3, xpReward: 101, respawnTime: 120, value: 13350, icon: '🔮', description: 'Crystallized psychic energy from battlefield sites' },
  { id: 'archeotech-fragments', name: 'Archeotech Fragments', levelRequired: 100, baseTime: 3, xpReward: 30, respawnTime: 130, value: 297, icon: '⚛️', description: 'Ancient technology from the Dark Age' },
  { id: 'gene-seed', name: 'Gene-Seed', levelRequired: 100, baseTime: 3, xpReward: 112, respawnTime: 130, value: 18312, icon: '🧬', description: 'Sacred Astartes genetic material' },
  { id: 'warp-cores', name: 'Warp Cores', levelRequired: 100, baseTime: 3, xpReward: 265, respawnTime: 0, value: 297000, icon: '🌌', description: 'Contained warp energy sources' },
  { id: 'emperor-relics', name: 'Emperor Relics', levelRequired: 102, baseTime: 3, xpReward: 92, respawnTime: 140, value: 23760, icon: '👑', description: 'Sacred artifacts blessed by the Emperor' },
  { id: 'primarch-essence', name: 'Primarch Essence', levelRequired: 105, baseTime: 3, xpReward: 96, respawnTime: 150, value: 29205, icon: '⭐', description: 'Traces of Primarch genetic material' },
  { id: 'chaos-artifacts', name: 'Chaos Artifacts', levelRequired: 108, baseTime: 3, xpReward: 119, respawnTime: 160, value: 39600, icon: '😈', description: 'Dangerous but powerful corrupted relics' },
  { id: 'necron-technology', name: 'Necron Technology', levelRequired: 110, baseTime: 3, xpReward: 385, respawnTime: 0, value: 445500, icon: '🤖', description: 'Ancient xenos technology of immense power' },
  { id: 'eldar-spirit-stones', name: 'Eldar Spirit Stones', levelRequired: 112, baseTime: 3, xpReward: 330, respawnTime: 0, value: 74250, icon: '💎', description: 'Psychically active xenos soul containers' },
  { id: 'tyranid-biomass', name: 'Tyranid Biomass', levelRequired: 115, baseTime: 3, xpReward: 138, respawnTime: 180, value: 56925, icon: '🦠', description: 'Adaptive alien biological material' },
  { id: 'void-shards', name: 'Void Shards', levelRequired: 118, baseTime: 3, xpReward: 510, respawnTime: 0, value: 643500, icon: '🕳️', description: 'Fragments of reality itself from the Warp' },
]

// Salvaging resource placeholder images - each resource has its own image path for easy swapping
export const SALVAGING_RESOURCE_IMAGES: Record<string, string> = {
  'ferrite-ore': '/images/resources/ferrite.png',
  'roughsteel-scrap': '/images/resources/scrap.png',
  'broken-glass': '/images/resources/augment_equip.png',
  'promethium-cells': '/images/resources/augment_equip.png',
  'ceramite-plates': '/images/resources/augment_equip.png',
  'servo-skulls': '/images/resources/augment_equip.png',
  'adamantium-ore': '/images/resources/augment_equip.png',
  'power-conduits': '/images/resources/augment_equip.png',
  'machine-spirits': '/images/resources/augment_equip.png',
  'vox-units': '/images/resources/augment_equip.png',
  'auspex-scanners': '/images/resources/augment_equip.png',
  'plasma-coils': '/images/resources/augment_equip.png',
  'psyker-crystals': '/images/resources/augment_equip.png',
  'archeotech-fragments': '/images/resources/augment_equip.png',
  'gene-seed': '/images/resources/augment_equip.png',
  'warp-cores': '/images/resources/augment_equip.png',
  'emperor-relics': '/images/resources/augment_equip.png',
  'primarch-essence': '/images/resources/augment_equip.png',
  'chaos-artifacts': '/images/resources/augment_equip.png',
  'necron-technology': '/images/resources/augment_equip.png',
  'eldar-spirit-stones': '/images/resources/augment_equip.png',
  'tyranid-biomass': '/images/resources/augment_equip.png',
  'void-shards': '/images/resources/augment_equip.png',
}
