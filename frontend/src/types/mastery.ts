/**
 * Mastery System Types
 */

export interface ResourceMastery {
  resourceId: string
  level: number
  experience: number
  experienceToNext: number
}

export interface SkillMastery {
  skillId: string
  pool: number // Total mastery XP pool (infinite accumulation)
  level: number // Mastery level (affects skill bonuses)
  experience: number // Experience in current mastery level
  experienceToNext: number // Experience needed for next mastery level
}

/**
 * Resource Mastery Bonuses
 */
export interface ResourceMasteryBonus {
  multiResourceChance: number // Chance to get extra resource (0-200% = 0-2 extra)
  gatherLimitIncrease: number // Additional gathers before respawn
}

/**
 * Calculate resource mastery bonuses based on level
 */
export function getResourceMasteryBonus(level: number): ResourceMasteryBonus {
  // Multi-resource chance: 1% per level, max 200% (guaranteed 2 extra)
  // Formula: min(level * 1, 200) = chance percentage
  const multiResourceChance = Math.min(level, 200) // Max 200% = 2 extra guaranteed
  
  // Gather limit: +1 per 5 mastery levels, max +50 (so 10 + 50 = 60 total max)
  const gatherLimitIncrease = Math.min(Math.floor(level / 5), 50)
  
  return {
    multiResourceChance,
    gatherLimitIncrease,
  }
}

/**
 * Skill Mastery Bonuses (configurable per skill)
 */
export interface SkillMasteryBonus {
  speedBonus: number // Percentage speed increase (0-50% max)
  specialBonuses: Record<string, number> // Custom bonuses per skill
}

/**
 * Calculate skill mastery bonuses based on level
 * Each skill can have different bonus calculations
 */
export function getSkillMasteryBonus(skillId: string, level: number): SkillMasteryBonus {
  // Base speed bonus: 0.5% per level, capped at 50%
  const speedBonus = Math.min(level * 0.5, 50)
  
  const specialBonuses: Record<string, number> = {}
  
  // Skill-specific bonuses every 5-10 levels
  if (skillId === 'salvaging') {
    // Every 10 levels: +1% XP bonus
    specialBonuses.xpBonus = Math.floor(level / 10) * 1
    // Every 5 levels: +0.5% respawn speed
    specialBonuses.respawnSpeed = Math.floor(level / 5) * 0.5
  }
  
  return {
    speedBonus,
    specialBonuses,
  }
}

/**
 * Mastery XP conversion rates
 */
export const MASTERY_CONFIG = {
  // Resource mastery XP is gained at 1:1 ratio with skill XP when gathering
  RESOURCE_MASTERY_RATIO: 1.0,
  
  // Skill mastery XP is gained at 0.5:1 ratio (half of skill XP)
  SKILL_MASTERY_RATIO: 0.5,
  
  // Conversion: 10 skill mastery pool XP → 1 resource mastery XP
  SKILL_TO_RESOURCE_CONVERSION: 10,
  
  // Resource mastery level cap
  RESOURCE_MASTERY_MAX_LEVEL: 200,
  
  // Skill mastery level cap (but pool is infinite)
  SKILL_MASTERY_MAX_LEVEL: 100,
  
  // Base XP needed for resource mastery level (similar to skill XP but separate formula)
  RESOURCE_MASTERY_BASE_XP: 50, // Base XP per level, increases with level
}

