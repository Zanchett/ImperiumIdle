import { Planet, PlanetTradeItem, PLANET_RESOURCE_POOLS } from '../types/planets'
import { SALVAGING_RESOURCES } from '../types/salvagingResources'
import { SMELTING_RECIPES } from '../types/smeltingResources'
import { FOOD_RESOURCES } from '../types/foodResources'
import { HERB_RESOURCES } from '../types/herbResources'

// Resource metadata for trading
interface ResourceMetadata {
  id: string
  name: string
  icon: string
  baseValue: number
}

// Get all resource metadata
function getAllResourceMetadata(): Map<string, ResourceMetadata> {
  const resources = new Map<string, ResourceMetadata>()

  // Add salvaging resources
  SALVAGING_RESOURCES.forEach((resource) => {
    resources.set(resource.id, {
      id: resource.id,
      name: resource.name,
      icon: resource.icon || '📦',
      baseValue: resource.value,
    })
  })

  // Add smelting resources
  SMELTING_RECIPES.forEach((recipe) => {
    if (!resources.has(recipe.id)) {
      resources.set(recipe.id, {
        id: recipe.id,
        name: recipe.name,
        icon: recipe.icon || '⚙️',
        baseValue: 100, // Default base value for smelted metals
      })
    }
  })

  // Add food resources
  FOOD_RESOURCES.forEach((resource) => {
    resources.set(resource.id, {
      id: resource.id,
      name: resource.name,
      icon: resource.icon,
      baseValue: resource.value,
    })
  })

  // Add herb resources
  HERB_RESOURCES.forEach((resource) => {
    resources.set(resource.id, {
      id: resource.id,
      name: resource.name,
      icon: resource.icon,
      baseValue: resource.value,
    })
  })

  return resources
}

// Generate trade items for a planet
export function generatePlanetTradeItems(planet: Planet): PlanetTradeItem[] {
  const resourceMetadata = getAllResourceMetadata()
  const resourcePool = PLANET_RESOURCE_POOLS[planet.type]
  const tradeItems: PlanetTradeItem[] = []

  // Number of items based on planet size
  const itemCounts = {
    small: 3,
    medium: 5,
    large: 8,
  }

  const numItems = itemCounts[planet.size]
  const shuffledPool = [...resourcePool].sort(() => Math.random() - 0.5)
  const selectedResources = shuffledPool.slice(0, Math.min(numItems, shuffledPool.length))

  selectedResources.forEach((resourceId) => {
    const metadata = resourceMetadata.get(resourceId)
    if (!metadata) return

    // Base price range based on planet size and reputation
    const sizeMultipliers = {
      small: { min: 0.8, max: 1.2 },
      medium: { min: 0.7, max: 1.3 },
      large: { min: 0.6, max: 1.4 },
    }

    const reputationMultiplier = 1 + (planet.reputation - 50) / 200 // -0.25 to +0.25 based on rep
    const multiplier = sizeMultipliers[planet.size]
    const basePrice = metadata.baseValue || 100

    // Random price within range
    const priceRange = basePrice * (multiplier.max - multiplier.min)
    const randomPrice = basePrice * multiplier.min + Math.random() * priceRange
    const finalPrice = Math.floor(randomPrice * (1 + reputationMultiplier))

    // Each planet can either buy OR sell each item (or both, but rare)
    const tradeType = Math.random()
    let buyPrice: number | null = null
    let sellPrice: number | null = null

    if (tradeType < 0.4) {
      // 40% chance: only buying
      buyPrice = finalPrice
    } else if (tradeType < 0.8) {
      // 40% chance: only selling
      sellPrice = finalPrice
    } else {
      // 20% chance: both buying and selling (with price difference)
      buyPrice = Math.floor(finalPrice * 0.9) // Buy slightly cheaper
      sellPrice = Math.floor(finalPrice * 1.1) // Sell slightly more expensive
    }

    // Available quantity (0 = unlimited)
    const hasLimit = Math.random() < 0.3 // 30% chance of limited quantity
    const availableQuantity = hasLimit ? Math.floor(Math.random() * 100) + 10 : 0
    const maxQuantity = availableQuantity > 0 ? availableQuantity : 999999

    tradeItems.push({
      resourceId: metadata.id,
      resourceName: metadata.name,
      icon: metadata.icon,
      buyPrice,
      sellPrice,
      availableQuantity,
      maxQuantity,
    })
  })

  return tradeItems
}

// Check and rotate planet trade items if needed
export function checkAndRotatePlanet(planet: Planet, currentTime: number): Planet | null {
  if (currentTime >= planet.nextRotation) {
    const newTradeItems = generatePlanetTradeItems(planet)
    const newNextRotation = currentTime + planet.rotationInterval

    return {
      ...planet,
      tradeItems: newTradeItems,
      nextRotation: newNextRotation,
    }
  }

  return null
}

