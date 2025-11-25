// Centralized item data system
// This file provides a unified interface for all items in the game

import { ENGINEERING_RECIPES } from '../engineeringResources'
import { SALVAGING_RESOURCES, SALVAGING_RESOURCE_IMAGES } from '../salvagingResources'
import { SMELTING_RECIPES } from '../smeltingResources'
import { FOOD_RESOURCES } from '../foodResources'
import { HERB_RESOURCES } from '../herbResources'
import { MEDICAL_ITEMS } from '../medicalItems'

// Placeholder image for items without images
const PLACEHOLDER_IMAGE = '/images/resources/augment_equip.png'

export interface ItemData {
  id: string
  name: string
  description: string
  image?: string // Image path (preferred)
  icon?: string // Fallback emoji/icon
  value: number
  
  // Equipment stats (if equippable)
  equipmentStats?: {
    attackType: 'bash' | 'cut' | 'block' | 'stab'
    attackScale: number
    damage?: number
    armor?: number
    armorStyle?: 'melee' | 'ranged' | 'magic' | 'hybrid'
    accuracy?: number
    critChance?: number
    armorType?: 'plate' | 'leather' | 'cloth' | 'hybrid'
    damageReductionPercent?: number
    accuracyPercent?: number
  }
  
  // Crafting/recipe data (if craftable)
  levelRequired?: number
  xpReward?: number
  ingredients?: Array<{ resourceId: string; amount: number }>
  time?: number // Crafting time in seconds
  
  // Salvaging data (if gatherable)
  baseTime?: number // Gathering time in seconds
  respawnTime?: number // Respawn time in seconds
  
  // Item type/category
  category: 'equipment' | 'resource' | 'consumable' | 'crafting-material'
}

/**
 * Get unified item data by ID from any source
 * Returns null if item not found
 */
export function getItemData(itemId: string): ItemData | null {
  // Check engineering recipes (equipment and crafting materials)
  const engineering = ENGINEERING_RECIPES.find((r) => r.id === itemId)
  if (engineering) {
    return {
      id: engineering.id,
      name: engineering.name,
      description: engineering.description,
      image: engineering.image || PLACEHOLDER_IMAGE,
      value: engineering.value,
      equipmentStats: engineering.equipmentStats,
      levelRequired: engineering.levelRequired,
      xpReward: engineering.xpReward,
      ingredients: engineering.ingredients,
      time: engineering.time,
      category: engineering.equipmentStats ? 'equipment' : 'crafting-material',
    }
  }
  
  // Check salvaging resources
  const salvaging = SALVAGING_RESOURCES.find((r) => r.id === itemId)
  if (salvaging) {
    return {
      id: salvaging.id,
      name: salvaging.name,
      description: salvaging.description,
      image: SALVAGING_RESOURCE_IMAGES[salvaging.id] || PLACEHOLDER_IMAGE,
      value: salvaging.value,
      levelRequired: salvaging.levelRequired,
      xpReward: salvaging.xpReward,
      baseTime: salvaging.baseTime,
      respawnTime: salvaging.respawnTime,
      category: 'resource',
    }
  }
  
  // Check smelting recipes (crafting materials)
  const smelting = SMELTING_RECIPES.find((r) => r.id === itemId)
  if (smelting) {
    return {
      id: smelting.id,
      name: smelting.name,
      description: smelting.description,
      image: smelting.image || PLACEHOLDER_IMAGE, // Use image property if available
      value: 0, // Smelted metals don't have direct value
      levelRequired: smelting.levelRequired,
      xpReward: smelting.xpReward,
      ingredients: smelting.ingredients,
      time: smelting.time,
      category: 'crafting-material',
    }
  }
  
  // Check food resources
  const food = FOOD_RESOURCES.find((r) => r.id === itemId)
  if (food) {
    return {
      id: food.id,
      name: food.name,
      description: food.description,
      image: food.image || PLACEHOLDER_IMAGE, // Use image property if available
      value: food.value,
      levelRequired: food.levelRequired,
      category: 'consumable',
    }
  }
  
  // Check herb resources
  const herb = HERB_RESOURCES.find((r) => r.id === itemId)
  if (herb) {
    return {
      id: herb.id,
      name: herb.name,
      description: herb.description,
      image: PLACEHOLDER_IMAGE, // Herb resources use placeholder
      value: herb.value,
      levelRequired: herb.levelRequired,
      category: 'consumable',
    }
  }
  
  // Check medical items
  const medical = MEDICAL_ITEMS.find((r) => r.id === itemId)
  if (medical) {
    return {
      id: medical.id,
      name: medical.name,
      description: medical.description,
      image: PLACEHOLDER_IMAGE, // Medical items use placeholder
      value: medical.value,
      category: 'consumable',
    }
  }
  
  return null
}

/**
 * Get item image path (preferred) or icon (fallback)
 * Returns placeholder if neither exists
 */
export function getItemImage(itemId: string): string {
  const item = getItemData(itemId)
  if (!item) return PLACEHOLDER_IMAGE
  return item.image || item.icon || PLACEHOLDER_IMAGE
}

/**
 * Get item icon (emoji) - fallback for items without images
 */
export function getItemIcon(itemId: string): string | null {
  const item = getItemData(itemId)
  if (!item) return null
  return item.icon || null
}

