/**
 * Veterancy System Types
 */

export interface ResourceVeterancy {
  resourceId: string
  level: number
  experience: number
  experienceToNext: number
}

export interface SkillVeterancy {
  skillId: string
  pool: number // Total veterancy XP pool (infinite accumulation)
  level: number // Veterancy level (affects skill bonuses)
  experience: number // Experience in current veterancy level
  experienceToNext: number // Experience needed for next veterancy level
}

/**
 * Resource Veterancy Bonuses
 */
export interface ResourceVeterancyBonus {
  multiResourceChance: number // Chance to get extra resource (0-200% = 0-2 extra)
  gatherLimitIncrease: number // Additional gathers before respawn
}

/**
 * Calculate resource veterancy bonuses based on level
 */
export function getResourceVeterancyBonus(level: number): ResourceVeterancyBonus {
  // Multi-resource chance: 1% per level, max 200% (guaranteed 2 extra)
  // Formula: min(level * 1, 200) = chance percentage
  const multiResourceChance = Math.min(level, 200) // Max 200% = 2 extra guaranteed
  
  // Gather limit: +1 per 5 veterancy levels, max +50 (so 10 + 50 = 60 total max)
  const gatherLimitIncrease = Math.min(Math.floor(level / 5), 50)
  
  return {
    multiResourceChance,
    gatherLimitIncrease,
  }
}

/**
 * Skill Veterancy Bonuses (configurable per skill)
 */
export interface SkillVeterancyBonus {
  speedBonus: number // Percentage speed increase (0-50% max)
  specialBonuses: Record<string, number> // Custom bonuses per skill
}

/**
 * Calculate skill veterancy bonuses based on level
 * Each skill can have different bonus calculations
 */
export function getSkillVeterancyBonus(skillId: string, level: number): SkillVeterancyBonus {
  // Base speed bonus: 0.5% per level, capped at 50%
  const speedBonus = Math.min(level * 0.5, 50)
  
  const specialBonuses: Record<string, number> = {}
  
  // Skill-specific bonuses every 5-10 levels
  if (skillId === 'salvaging') {
    // Every 10 levels: +1% XP bonus
    specialBonuses.xpBonus = Math.floor(level / 10) * 1
    // Every 5 levels: +0.5% respawn speed
    specialBonuses.respawnSpeed = Math.floor(level / 5) * 0.5
  } else if (skillId === 'smelting') {
    // Every 10 levels: +1% chance to not consume ingredients
    specialBonuses.materialSave = Math.floor(level / 10) * 1
    // Every 5 levels: +0.5% XP bonus
    specialBonuses.xpBonus = Math.floor(level / 5) * 0.5
  }
  
  return {
    speedBonus,
    specialBonuses,
  }
}

/**
 * Veterancy XP conversion rates
 */
export const VETERANCY_CONFIG = {
  // Resource veterancy XP is gained at 1:1 ratio with skill XP when gathering
  RESOURCE_VETERANCY_RATIO: 1.0,
  
  // Skill veterancy XP is gained at 0.5:1 ratio (half of skill XP)
  SKILL_VETERANCY_RATIO: 0.5,
  
  // Conversion: 10 skill veterancy pool XP → 1 resource veterancy XP
  SKILL_TO_RESOURCE_CONVERSION: 10,
  
  // Resource veterancy level cap
  RESOURCE_VETERANCY_MAX_LEVEL: 200,
  
  // Skill veterancy level cap (but pool is infinite)
  SKILL_VETERANCY_MAX_LEVEL: 100,
  
  // Base XP needed for resource veterancy level (similar to skill XP but separate formula)
  RESOURCE_VETERANCY_BASE_XP: 50, // Base XP per level, increases with level
}

