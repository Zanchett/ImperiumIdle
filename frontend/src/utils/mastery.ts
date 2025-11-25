/**
 * Mastery System Utilities
 */

import { MASTERY_CONFIG } from '../types/mastery'

/**
 * Calculate resource mastery XP needed for a level
 * Uses a simpler formula than skill XP - linear scaling with slight curve
 */
export function getResourceMasteryXPForLevel(level: number): number {
  if (level <= 1) return 0
  
  // Simple formula: base * level * (1 + level/50)
  // This gives: 50, 204, 462, 824... (reasonable progression)
  const base = MASTERY_CONFIG.RESOURCE_MASTERY_BASE_XP
  return Math.floor(base * level * (1 + level / 50))
}

/**
 * Get cumulative resource mastery XP needed to reach a level
 */
export function getCumulativeResourceMasteryXP(level: number): number {
  if (level <= 1) return 0
  
  let total = 0
  for (let i = 2; i <= level; i++) {
    total += getResourceMasteryXPForLevel(i)
  }
  return total
}

/**
 * Calculate what resource mastery level from total XP
 */
export function getResourceMasteryLevelFromXP(totalXP: number): number {
  if (!totalXP || totalXP <= 0) return 1
  
  let level = 1
  let cumulativeXP = 0
  
  // Start from level 1 and work up
  while (level < MASTERY_CONFIG.RESOURCE_MASTERY_MAX_LEVEL) {
    const nextLevel = level + 1
    const levelXP = getResourceMasteryXPForLevel(nextLevel)
    
    // If adding this level's XP would exceed totalXP, we've found our level
    if (cumulativeXP + levelXP > totalXP) {
      break
    }
    
    cumulativeXP += levelXP
    level = nextLevel
  }
  
  return Math.max(1, Math.min(level, MASTERY_CONFIG.RESOURCE_MASTERY_MAX_LEVEL))
}

/**
 * Get resource mastery progress
 */
export function getResourceMasteryProgress(totalXP: number) {
  // Ensure totalXP is a valid number
  const safeXP = Math.max(0, totalXP || 0)
  
  const level = getResourceMasteryLevelFromXP(safeXP)
  const cumulativeXPForLevel = getCumulativeResourceMasteryXP(level)
  const cumulativeXPForNextLevel = level < MASTERY_CONFIG.RESOURCE_MASTERY_MAX_LEVEL 
    ? getCumulativeResourceMasteryXP(level + 1)
    : cumulativeXPForLevel
  
  const xpInCurrentLevel = Math.max(0, safeXP - cumulativeXPForLevel)
  const xpNeededForNextLevel = Math.max(0, cumulativeXPForNextLevel - cumulativeXPForLevel)
  
  return {
    level: Math.min(Math.max(1, level), MASTERY_CONFIG.RESOURCE_MASTERY_MAX_LEVEL),
    experience: xpInCurrentLevel,
    experienceToNext: level < MASTERY_CONFIG.RESOURCE_MASTERY_MAX_LEVEL ? xpNeededForNextLevel : 0,
  }
}

/**
 * Calculate chance to get extra resources based on mastery level
 * Returns: 0-200 (representing 0-200% chance, meaning 0-2 extra resources)
 */
export function getMultiResourceChance(masteryLevel: number): number {
  return Math.min(masteryLevel, 200) // 1% per level, max 200% = 2 extra guaranteed
}

/**
 * Calculate how many extra resources to give
 * Returns 0, 1, or 2 based on mastery chance
 */
export function calculateExtraResources(masteryLevel: number): number {
  const chancePercent = getMultiResourceChance(masteryLevel)
  const roll = Math.random() * 100
  
  if (roll < chancePercent - 100) {
    return 2 // Guaranteed 2 extra
  } else if (roll < chancePercent) {
    return 1 // 1 extra
  }
  return 0 // No extra
}

/**
 * Calculate gather limit increase from mastery
 */
export function getGatherLimitIncrease(masteryLevel: number): number {
  // +1 per 5 levels, max +50
  return Math.min(Math.floor(masteryLevel / 5), 50)
}

/**
 * Calculate speed bonus from skill mastery level
 * Returns percentage (0-50)
 */
export function getSpeedBonus(skillMasteryLevel: number): number {
  // 0.5% per level, max 50%
  return Math.min(skillMasteryLevel * 0.5, 50)
}

/**
 * Calculate skill mastery level from pool
 * Each level requires more pool XP
 */
export function getSkillMasteryLevelFromPool(poolXP: number): number {
  if (!poolXP || poolXP <= 0) return 0
  
  // Each level requires: level * 100 XP (1 = 100, 2 = 200, 3 = 300, etc.)
  // Cumulative: 100, 300, 600, 1000...
  let level = 0
  let cumulativeXP = 0
  
  // Start from level 0 and work up
  while (level < MASTERY_CONFIG.SKILL_MASTERY_MAX_LEVEL) {
    const nextLevel = level + 1
    const levelXP = nextLevel * 100
    
    // If adding this level's XP would exceed poolXP, we've found our level
    if (cumulativeXP + levelXP > poolXP) {
      break
    }
    
    cumulativeXP += levelXP
    level = nextLevel
  }
  
  return Math.max(0, Math.min(level, MASTERY_CONFIG.SKILL_MASTERY_MAX_LEVEL))
}

/**
 * Get skill mastery XP needed for next level
 */
export function getSkillMasteryXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= MASTERY_CONFIG.SKILL_MASTERY_MAX_LEVEL) return 0
  return (currentLevel + 1) * 100
}

/**
 * Get cumulative skill mastery XP needed for a level
 */
export function getCumulativeSkillMasteryXP(level: number): number {
  if (level <= 0) return 0
  
  let total = 0
  for (let i = 1; i <= level; i++) {
    total += i * 100
  }
  return total
}

/**
 * Calculate skill-specific bonuses based on mastery level
 */
export function getSkillMasterySpecialBonuses(skillId: string, masteryLevel: number): Record<string, number> {
  const bonuses: Record<string, number> = {}
  
  if (skillId === 'salvaging') {
    // Every 10 levels: +1% XP bonus
    bonuses.xpBonus = Math.floor(masteryLevel / 10) * 1
    // Every 5 levels: +0.5% respawn speed (reduces respawn time)
    bonuses.respawnSpeed = Math.floor(masteryLevel / 5) * 0.5
  }
  
  return bonuses
}

