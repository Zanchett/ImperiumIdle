import { FOOD_RESOURCES } from './foodResources'

export interface Seed {
  id: string
  name: string
  cropId: string // The food resource ID this seed produces
  levelRequired: number
  image?: string
  icon?: string
  cost: number // Cost to buy seed
  growTime: number // Time in seconds to grow
  xpReward: number // XP gained when harvested
  yield: number // Amount of crop produced per harvest
  description: string
}

// Generate seeds from food resources
export const SEEDS: Seed[] = FOOD_RESOURCES.map((food) => ({
  id: `${food.id}-seed`,
  name: `${food.name} Seeds`,
  cropId: food.id,
  levelRequired: food.levelRequired,
  image: food.image,
  icon: food.icon,
  cost: Math.max(10, Math.floor(food.value * 0.3)), // Seed cost is 30% of crop value, minimum 10
  growTime: Math.max(30, food.levelRequired * 5), // Base grow time scales with level
  xpReward: Math.max(5, Math.floor(food.levelRequired * 2)), // XP scales with level
  yield: 1 + Math.floor(food.levelRequired / 20), // Higher level crops yield more (1-6)
  description: `Seeds for growing ${food.name.toLowerCase()}. ${food.description}`,
}))

// Get seed by crop ID
export function getSeedByCropId(cropId: string): Seed | undefined {
  return SEEDS.find((seed) => seed.cropId === cropId)
}

// Get seed by ID
export function getSeedById(seedId: string): Seed | undefined {
  return SEEDS.find((seed) => seed.id === seedId)
}

