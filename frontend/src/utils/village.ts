import { Village, VillageResources, Building, Villager, BUILDING_DEFINITIONS, VILLAGER_TYPES } from '../types/village'

/**
 * Generate a random villager name
 */
function generateVillagerName(): string {
  const firstNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${firstName} ${lastName}`
}

/**
 * Initialize a new village with starting resources
 */
export function initializeVillage(): Village {
  const now = Date.now()
  
  // Create 2 starting workers
  const startingWorkers: Villager[] = []
  for (let i = 0; i < 2; i++) {
    const workerData = VILLAGER_TYPES.worker
    startingWorkers.push({
      id: `villager-${now}-${i}`,
      name: generateVillagerName(),
      type: 'worker',
      assignedBuilding: null, // Start unassigned
      efficiency: 1.0, // 100% efficiency for workers
      foodConsumption: workerData.foodConsumption,
      recruitmentCost: 0, // Free starting workers
      xpReward: 0, // No XP for starting workers
    })
  }
  
  // Create City Hall pre-built at level 1
  const cityHall: Building = {
    id: 'city-hall-initial',
    type: 'city-hall',
    level: 1,
    assignedVillagers: [],
    constructionStartTime: null,
    constructionDuration: 0,
    completed: true,
    xpReward: 0,
    lastCollectionTime: null,
    accumulatedResources: 0,
  }

  return {
    level: 1,
    resources: {
      wood: 50,
      stone: 0,
      food: 0,
      herbs: 0,
    },
    buildings: [cityHall],
    villagers: startingWorkers,
    storageCapacity: {
      wood: 200,
      stone: 100,
      food: 150,
      herbs: 100,
    },
    dailyLimits: {
      constructions: 3,
      constructionsUsed: 0,
      lastReset: now,
      recruits: 3,
      recruitsUsed: 0,
    },
    constructionQueue: [],
  }
}

/**
 * Calculate building cost with escalation
 * Formula: cost = baseCost * (1 + 0.1 * buildingCount)
 */
export function calculateBuildingCost(
  baseCost: { wood: number; stone: number },
  buildingCount: number,
  tier: 1 | 2 | 3
): { wood: number; stone: number } {
  const escalationRate = tier === 1 ? 0.1 : tier === 2 ? 0.15 : 0.2
  const multiplier = 1 + escalationRate * buildingCount
  return {
    wood: Math.ceil(baseCost.wood * multiplier),
    stone: Math.ceil(baseCost.stone * multiplier),
  }
}

/**
 * Calculate building construction time
 * Formula: (woodCost * 30s) + (stoneCost * 45s), minimum 60s
 */
export function calculateConstructionTime(cost: { wood: number; stone: number }): number {
  const time = cost.wood * 30 + cost.stone * 45
  return Math.max(time, 60) * 1000 // Convert to milliseconds
}

/**
 * Calculate building XP reward
 * Tier 1: baseXP = buildingCost * 0.5
 * Tier 2: baseXP = (woodCost + stoneCost) * 0.75
 * Upgrades: +50% XP
 */
export function calculateBuildingXP(
  cost: { wood: number; stone: number },
  tier: 1 | 2 | 3,
  isUpgrade: boolean = false
): number {
  let baseXP: number
  if (tier === 1) {
    baseXP = cost.wood * 0.5
  } else {
    baseXP = (cost.wood + cost.stone) * 0.75
  }
  return isUpgrade ? baseXP * 1.5 : baseXP
}

/**
 * Get max daily constructions based on colony level
 */
export function getMaxDailyConstructions(level: number): number {
  return 3 + Math.floor(level / 5) // +1 every 5 levels
}

/**
 * Get max daily recruits based on colony level
 */
export function getMaxDailyRecruits(level: number): number {
  const base = 3
  const bonus = Math.floor(level / 10) // +1 every 10 levels
  return Math.min(base + bonus, 8) // Max 8 recruits per day
}

/**
 * Check if daily limits should reset (at midnight)
 */
export function shouldResetDailyLimits(lastReset: number): boolean {
  const now = Date.now()
  const lastResetDate = new Date(lastReset)
  const nowDate = new Date(now)
  
  // Reset if it's a new day
  return (
    nowDate.getFullYear() !== lastResetDate.getFullYear() ||
    nowDate.getMonth() !== lastResetDate.getMonth() ||
    nowDate.getDate() !== lastResetDate.getDate()
  )
}

/**
 * Calculate production rate based on assigned villagers
 */
export function calculateProductionRate(
  baseRate: number,
  assignedVillagers: Villager[],
  villagerType: 'farmer' | 'miner' | 'worker'
): number {
  let totalEfficiency = 0
  assignedVillagers.forEach((villager) => {
    if (villager.type === villagerType || villager.type === 'worker') {
      totalEfficiency += villager.efficiency
    }
  })
  
  // If no villagers assigned, production is 0
  if (assignedVillagers.length === 0) {
    return 0
  }
  
  return baseRate * totalEfficiency
}

/**
 * Get total housing capacity from all housing buildings
 */
export function getTotalHousingCapacity(buildings: Building[]): number {
  return buildings
    .filter((b) => b.type === 'hut' || b.type === 'stone-house' || b.type === 'barracks')
    .reduce((total, building) => {
      const definition = BUILDING_DEFINITIONS.find((d) => d.id === building.type)
      if (definition?.housingCapacity) {
        return total + definition.housingCapacity
      }
      return total
    }, 0)
}

/**
 * Get maximum total building limit based on City Hall level
 * Level 1 = 10, Level 2 = 15, Level 3 = 20, Level 4 = 25, Level 5 = 30, etc.
 */
export function getMaxBuildingLimit(buildings: Building[]): number {
  const cityHall = buildings.find((b) => b.type === 'city-hall' && b.completed)
  if (!cityHall) return 10 // Default if somehow City Hall is missing
  
  const level = cityHall.level
  if (level === 1) return 10
  if (level === 2) return 15
  if (level === 3) return 20
  if (level === 4) return 25
  if (level === 5) return 30
  // After level 5, add +5 per level
  return 30 + (level - 5) * 5
}

/**
 * Calculate production rate multiplier based on building level
 * Formula: 1 + (level - 1) * 0.15 = +15% per level
 * Level 1: 1.0x (100%), Level 2: 1.15x (115%), Level 3: 1.30x (130%), etc.
 */
export function getProductionRateMultiplier(level: number): number {
  return 1 + (level - 1) * 0.15
}

/**
 * Calculate max workers based on building level and base max workers
 * Formula: baseMaxWorkers + Math.floor((level - 1) / 2)
 * Level 1: base, Level 2-3: +1, Level 4-5: +2, Level 6-7: +3, etc.
 */
export function getMaxWorkersForLevel(baseMaxWorkers: number, level: number): number {
  const additionalWorkers = Math.floor((level - 1) / 2)
  return baseMaxWorkers + additionalWorkers
}

/**
 * Calculate worker production scaling
 * Each additional worker after the first adds a percentage bonus
 * Formula: 1 (first worker) + (additionalWorkers * 0.25) = +25% per additional worker
 * Example: 1 worker = 100%, 2 workers = 125%, 3 workers = 150%, 4 workers = 175%
 */
export function getWorkerScalingMultiplier(workerCount: number): number {
  if (workerCount === 0) return 0
  if (workerCount === 1) return 1.0
  // First worker = 100%, each additional worker adds 25%
  return 1.0 + (workerCount - 1) * 0.25
}

/**
 * Calculate upgrade cost for production buildings
 * Formula: baseCost * (1.5 ^ (level - 1))
 * Level 1->2: 1.5x, Level 2->3: 2.25x, Level 3->4: 3.375x, etc.
 */
export function calculateProductionBuildingUpgradeCost(
  baseCost: { wood: number; stone: number },
  currentLevel: number
): { wood: number; stone: number } {
  const multiplier = Math.pow(1.5, currentLevel - 1)
  return {
    wood: Math.ceil(baseCost.wood * multiplier),
    stone: Math.ceil(baseCost.stone * multiplier),
  }
}

/**
 * Calculate effective production rate considering level, workers, and scaling
 * Formula: baseRate * levelMultiplier * workerScalingMultiplier * totalEfficiency
 */
export function calculateEffectiveProductionRate(
  baseRate: number,
  buildingLevel: number,
  assignedWorkers: Villager[],
  workerCount: number
): number {
  if (assignedWorkers.length === 0) return 0
  
  const levelMultiplier = getProductionRateMultiplier(buildingLevel)
  const workerScaling = getWorkerScalingMultiplier(workerCount)
  const totalEfficiency = assignedWorkers.reduce((sum, v) => sum + v.efficiency, 0)
  
  return baseRate * levelMultiplier * workerScaling * totalEfficiency
}

