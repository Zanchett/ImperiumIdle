/**
 * Veterancy System Utilities
 */

import { VETERANCY_CONFIG } from '../types/veterancy'

/**
 * Calculate resource veterancy XP needed for a level
 * Uses a simpler formula than skill XP - linear scaling with slight curve
 */
export function getResourceVeterancyXPForLevel(level: number): number {
  if (level <= 1) return 0
  
  // Simple formula: base * level * (1 + level/50)
  // This gives: 50, 204, 462, 824... (reasonable progression)
  const base = VETERANCY_CONFIG.RESOURCE_VETERANCY_BASE_XP
  return Math.floor(base * level * (1 + level / 50))
}

/**
 * Get cumulative resource veterancy XP needed to reach a level
 */
export function getCumulativeResourceVeterancyXP(level: number): number {
  if (level <= 1) return 0
  
  let total = 0
  for (let i = 2; i <= level; i++) {
    total += getResourceVeterancyXPForLevel(i)
  }
  return total
}

/**
 * Calculate what resource veterancy level from total XP
 */
export function getResourceVeterancyLevelFromXP(totalXP: number): number {
  if (!totalXP || totalXP <= 0) return 1 // Level 1, but with 0 XP in that level
  
  let level = 1
  let cumulativeXP = 0
  
  // Start from level 1 and work up
  while (level < VETERANCY_CONFIG.RESOURCE_VETERANCY_MAX_LEVEL) {
    const nextLevel = level + 1
    const levelXP = getResourceVeterancyXPForLevel(nextLevel)
    
    // If adding this level's XP would exceed totalXP, we've found our level
    if (cumulativeXP + levelXP > totalXP) {
      break
    }
    
    cumulativeXP += levelXP
    level = nextLevel
  }
  
  return Math.max(1, Math.min(level, VETERANCY_CONFIG.RESOURCE_VETERANCY_MAX_LEVEL))
}

/**
 * Get resource veterancy progress
 */
export function getResourceVeterancyProgress(totalXP: number) {
  // Ensure totalXP is a valid number
  const safeXP = Math.max(0, totalXP || 0)
  
  const level = getResourceVeterancyLevelFromXP(safeXP)
  const cumulativeXPForLevel = getCumulativeResourceVeterancyXP(level)
  const cumulativeXPForNextLevel = level < VETERANCY_CONFIG.RESOURCE_VETERANCY_MAX_LEVEL 
    ? getCumulativeResourceVeterancyXP(level + 1)
    : cumulativeXPForLevel
  
  const xpInCurrentLevel = Math.max(0, safeXP - cumulativeXPForLevel)
  const xpNeededForNextLevel = Math.max(1, cumulativeXPForNextLevel - cumulativeXPForLevel) // Ensure at least 1 to avoid division by zero
  
  return {
    level: Math.min(Math.max(1, level), VETERANCY_CONFIG.RESOURCE_VETERANCY_MAX_LEVEL),
    experience: xpInCurrentLevel,
    experienceToNext: level < VETERANCY_CONFIG.RESOURCE_VETERANCY_MAX_LEVEL ? xpNeededForNextLevel : 1,
  }
}

/**
 * Calculate chance to get extra resources based on veterancy level
 * Returns: 0-200 (representing 0-200% chance, meaning 0-2 extra resources)
 */
export function getMultiResourceChance(veterancyLevel: number): number {
  return Math.min(veterancyLevel, 200) // 1% per level, max 200% = 2 extra guaranteed
}

/**
 * Calculate how many extra resources to give
 * Returns 0, 1, or 2 based on veterancy chance
 */
export function calculateExtraResources(veterancyLevel: number): number {
  const chancePercent = getMultiResourceChance(veterancyLevel)
  const roll = Math.random() * 100
  
  if (roll < chancePercent - 100) {
    return 2 // Guaranteed 2 extra
  } else if (roll < chancePercent) {
    return 1 // 1 extra
  }
  return 0 // No extra
}

/**
 * Calculate gather limit increase from veterancy
 */
export function getGatherLimitIncrease(veterancyLevel: number): number {
  // +1 per 5 levels, max +50
  return Math.min(Math.floor(veterancyLevel / 5), 50)
}

/**
 * Calculate speed bonus from skill veterancy level
 * Returns percentage (0-50)
 */
export function getSpeedBonus(skillVeterancyLevel: number): number {
  // 0.5% per level, max 50%
  return Math.min(skillVeterancyLevel * 0.5, 50)
}

/**
 * Calculate skill veterancy level from pool
 * Each level requires more pool XP
 */
export function getSkillVeterancyLevelFromPool(poolXP: number): number {
  if (!poolXP || poolXP <= 0) return 0
  
  // Each level requires: level * 100 XP (1 = 100, 2 = 200, 3 = 300, etc.)
  // Cumulative: 100, 300, 600, 1000...
  let level = 0
  let cumulativeXP = 0
  
  // Start from level 0 and work up
  while (level < VETERANCY_CONFIG.SKILL_VETERANCY_MAX_LEVEL) {
    const nextLevel = level + 1
    const levelXP = nextLevel * 100
    
    // If adding this level's XP would exceed poolXP, we've found our level
    if (cumulativeXP + levelXP > poolXP) {
      break
    }
    
    cumulativeXP += levelXP
    level = nextLevel
  }
  
  return Math.max(0, Math.min(level, VETERANCY_CONFIG.SKILL_VETERANCY_MAX_LEVEL))
}

/**
 * Get skill veterancy XP needed for next level
 */
export function getSkillVeterancyXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= VETERANCY_CONFIG.SKILL_VETERANCY_MAX_LEVEL) return 0
  return (currentLevel + 1) * 100
}

/**
 * Get cumulative skill veterancy XP needed for a level
 */
export function getCumulativeSkillVeterancyXP(level: number): number {
  if (level <= 0) return 0
  
  let total = 0
  for (let i = 1; i <= level; i++) {
    total += i * 100
  }
  return total
}

/**
 * Calculate skill-specific bonuses based on veterancy level
 */
export function getSkillVeterancySpecialBonuses(skillId: string, veterancyLevel: number): Record<string, number> {
  const bonuses: Record<string, number> = {}
  
  if (skillId === 'salvaging') {
    // Every 10 levels: +1% XP bonus
    bonuses.xpBonus = Math.floor(veterancyLevel / 10) * 1
    // Every 5 levels: +0.5% respawn speed (reduces respawn time)
    bonuses.respawnSpeed = Math.floor(veterancyLevel / 5) * 0.5
  } else if (skillId === 'smelting') {
    // Every 10 levels: +1% chance to not consume ingredients
    bonuses.materialSave = Math.floor(veterancyLevel / 10) * 1
    // Every 5 levels: +0.5% XP bonus
    bonuses.xpBonus = Math.floor(veterancyLevel / 5) * 0.5
  } else if (skillId === 'engineering') {
    // Every 10 levels: +1% chance to not consume ingredients
    bonuses.materialSave = Math.floor(veterancyLevel / 10) * 1
    // Every 5 levels: +0.5% XP bonus
    bonuses.xpBonus = Math.floor(veterancyLevel / 5) * 0.5
  }
  
  return bonuses
}

