import { Planet, PlanetType, PLANET_TYPES, PLANET_RESOURCE_POOLS } from '../types/planets'

// Generate planet names based on type
const PLANET_NAME_POOLS: Record<PlanetType, string[]> = {
  'agri-world': [
    'Agri-Primus', 'Greenhaven', 'Fertile Sigma', 'Crop-World Alpha', 'Harvest Beta',
    'Breadbasket Gamma', 'Verdant Prime', 'Farmstead Delta', 'Grain Epsilon', 'Orchard Zeta'
  ],
  'mining-world': [
    'Mining-Primus', 'Ore-Depot Alpha', 'Ironhold Beta', 'Crystal Vein Gamma', 'Dig-Site Delta',
    'Extraction Prime', 'Mine-Works Epsilon', 'Quarry Zeta', 'Deep-Core Alpha', 'Strike Site Beta'
  ],
  'grave-world': [
    'Grave-Primus', 'Wreckage Alpha', 'Debris Field Beta', 'Scrap-Pile Gamma', 'Ruins Delta',
    'Desolation Prime', 'Wasteland Epsilon', 'Salvage Point Zeta', 'Junk-Heap Alpha', 'Dead Zone Beta'
  ],
  'forge-world': [
    'Forge-Primus', 'Ironworks Alpha', 'Steelworks Beta', 'Foundry Gamma', 'Anvil Delta',
    'Workshop Prime', 'Craft-Hold Epsilon', 'Industry Zeta', 'Smith-Forge Alpha', 'Manufactory Beta'
  ],
  'research-world': [
    'Research-Primus', 'Tech-Labs Alpha', 'Data-Core Beta', 'Archive Gamma', 'Library Delta',
    'Knowledge Prime', 'Study-Site Epsilon', 'Academy Zeta', 'Institute Alpha', 'Laboratory Beta'
  ],
  'shrine-world': [
    'Shrine-Primus', 'Temple Alpha', 'Sanctuary Beta', 'Cathedral Gamma', 'Sanctum Delta',
    'Holy Prime', 'Consecrated Epsilon', 'Sacred Zeta', 'Divine Alpha', 'Reverent Beta'
  ],
  'hive-world': [
    'Hive-Primus', 'Swarm Alpha', 'Nest Beta', 'Colony Gamma', 'Hive Delta',
    'Organic Prime', 'Biological Epsilon', 'Life-Form Zeta', 'Bio-Core Alpha', 'Living Beta'
  ],
  'death-world': [
    'Death-Primus', 'Peril Alpha', 'Danger Zone Beta', 'Hazard Gamma', 'Threat Delta',
    'Lethal Prime', 'Deadly Epsilon', 'Fatal Zeta', 'Toxic Alpha', 'Void-Touched Beta'
  ],
  'void-station': [
    'Void-Station Alpha', 'Deep Space Beta', 'Orbital Gamma', 'Outpost Delta', 'Terminal Prime',
    'Waystation Epsilon', 'Hub Zeta', 'Nexus Alpha', 'Gateway Beta', 'Station Gamma'
  ],
}

// Generate planets for each type
export function generateInitialPlanets(): Planet[] {
  const planets: Planet[] = []
  
  // Generate planets for each type
  const planetTypes: PlanetType[] = [
    'agri-world',
    'mining-world',
    'grave-world',
    'forge-world',
    'research-world',
    'shrine-world',
    'hive-world',
    'death-world',
    'void-station',
  ]
  
  // Track used names per type to avoid duplicates
  const usedNamesPerType: Record<PlanetType, Set<string>> = {} as Record<PlanetType, Set<string>>
  
  planetTypes.forEach((type) => {
    usedNamesPerType[type] = new Set()
    // Generate 2-3 planets of each type with different sizes
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large']
    const count = Math.floor(Math.random() * 2) + 2 // 2-3 planets
    const namePool = PLANET_NAME_POOLS[type]
    
    for (let i = 0; i < count && i < namePool.length; i++) {
      // Get available names for this type
      const availableNames = namePool.filter(n => !usedNamesPerType[type].has(n))
      if (availableNames.length === 0) break // No more names available
      
      const randomIndex = Math.floor(Math.random() * availableNames.length)
      const randomName = availableNames[randomIndex]
      usedNamesPerType[type].add(randomName)
      
      const size = sizes[Math.floor(Math.random() * sizes.length)]
      
      // Create unique ID with index
      const uniqueId = `${type}-${randomName.toLowerCase().replace(/\s+/g, '-')}-${i}`
      
      const multiplier = {
        small: { gold: 1000, duration: 30000, items: 3 },
        medium: { gold: 2500, duration: 60000, items: 5 },
        large: { gold: 5000, duration: 120000, items: 8 },
      }[size]
      
      const rotationIntervals = {
        small: 3600000,
        medium: 7200000,
        large: 14400000,
      }
      
      planets.push({
        id: uniqueId,
        name: randomName,
        type,
        discovered: false,
        contactCostGold: multiplier.gold,
        contactDuration: multiplier.duration,
        tradeItems: [],
        rotationInterval: rotationIntervals[size],
        nextRotation: Date.now() + rotationIntervals[size],
        size,
        reputation: 50,
      })
    }
  })
  
  return planets
}

