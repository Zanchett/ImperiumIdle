// Attack types for melee combat
export type AttackType = 'bash' | 'cut' | 'block' | 'stab'

/**
 * Calculate Effective Strength
 * Formula: floor((Strength Level + Medical Bonus) × Chant Bonus × Other Bonus) + Style Bonus
 * 
 * @param strengthLevel - Player's Strength sub-stat level
 * @param medicalBonus - Additive bonus from medical items (0 for now)
 * @param chantBonus - Multiplicative bonus from chants to the emperor (1.0 for now)
 * @param otherBonus - Other multiplicative bonuses (1.0 for now)
 * @param styleBonus - Additive bonus from matching weapon attack type with selected stance
 * @returns Effective Strength value
 */
export function calculateEffectiveStrength(
  strengthLevel: number,
  medicalBonus: number = 0,
  chantBonus: number = 1.0,
  otherBonus: number = 1.0,
  styleBonus: number = 0
): number {
  const baseStrength = strengthLevel + medicalBonus
  const multipliedStrength = baseStrength * chantBonus * otherBonus
  return Math.floor(multipliedStrength) + styleBonus
}

/**
 * Calculate Style Bonus
 * Style bonus is awarded when the selected attack type matches the weapon's preferred attack type.
 * If they match: positive bonus (e.g., +3 for matching)
 * If they don't match: negative bonus or zero (e.g., -1 for wrong style)
 * 
 * @param selectedAttackType - The attack type the player selected (bash, cut, stab, block)
 * @param weaponPreferredType - The weapon's preferred attack type (from equipmentStats.attackType)
 * @returns Style bonus value
 */
export function calculateStyleBonus(
  selectedAttackType: AttackType,
  weaponPreferredType: AttackType | undefined
): number {
  if (!weaponPreferredType) return 0 // No weapon, no style bonus
  
  if (selectedAttackType === weaponPreferredType) {
    // Matching style: positive bonus
    return 3
  } else {
    // Wrong style: negative bonus (reduces damage potential)
    return -1
  }
}

/**
 * Calculate Base Max Hit (Melvor Idle formula structure)
 * Formula: M × (2.2 + (Effective Skill Level / 10) + ((Effective Skill Level + 17) × Strength Bonus) / 640)
 * 
 * M = 7 (tuned to get ~16 max hit at level 1 with no weapon)
 * 
 * @param effectiveSkillLevel - Effective skill level (Strength level + style bonuses, etc.)
 * @param strengthBonus - Weapon damage (equipmentStats.damage), also called "Strength Bonus" in Melvor
 * @returns Base Max Hit value (before floor)
 */
export function calculateBaseDamage(
  effectiveSkillLevel: number,
  strengthBonus: number
): number {
  const M = 7 // Base multiplier (Melvor uses 10, we use 7 for lower scaling)
  const term1 = 2.2
  const term2 = effectiveSkillLevel / 10
  const term3 = ((effectiveSkillLevel + 17) * strengthBonus) / 640
  
  return M * (term1 + term2 + term3)
}

/**
 * Calculate Max Hit (Melvor Idle formula structure)
 * Formula: floor(Base Max Hit × (1 + (Percentage Modifier / 100))) + Flat Modifier
 * 
 * For now, we use: floor(Base Max Hit) (no modifiers yet)
 * 
 * @param baseDamage - Base Max Hit value (from calculateBaseDamage)
 * @param specialBonus - Multiplier for special attacks (1.0 for normal attacks)
 * @returns Max Hit value
 */
export function calculateMaxHit(
  baseDamage: number,
  specialBonus: number = 1.0
): number {
  // Apply special bonus multiplier first, then floor
  const modifiedDamage = baseDamage * specialBonus
  return Math.floor(modifiedDamage)
}

/**
 * Calculate Minimum Hit (Melvor Idle formula structure)
 * Formula: min(max([1 + Max Hit × Percentage Modifier] + Flat Modifier, 1), Max Hit)
 * 
 * For normal attacks, base minimum hit is 1.
 * Modifiers can increase this (percentage of max hit added to min, flat min hit damage).
 * 
 * @param maxHit - Maximum hit value
 * @param percentageModifier - Percentage of max hit to add to min hit (0-100, default 0)
 * @param flatModifier - Flat minimum hit damage bonus (default 0)
 * @returns Minimum Hit value (always between 1 and Max Hit)
 */
export function calculateMinHit(
  maxHit: number,
  percentageModifier: number = 0,
  flatModifier: number = 0
): number {
  // Base: 1 + (Max Hit × Percentage Modifier / 100) + Flat Modifier
  const baseMinHit = 1 + (maxHit * percentageModifier / 100) + flatModifier
  
  // Ensure min hit is at least 1 and never more than max hit
  return Math.min(Math.max(baseMinHit, 1), maxHit)
}

/**
 * Roll damage between minimum and maximum hit
 * This is the pre-modifier damage roll
 * 
 * @param minHit - Minimum hit value
 * @param maxHit - Maximum hit value
 * @returns Random damage value between min and max (inclusive)
 */
export function rollDamage(minHit: number, maxHit: number): number {
  // Roll between min and max (inclusive)
  return Math.floor(Math.random() * (maxHit - minHit + 1)) + minHit
}

/**
 * Calculate all damage values for a player attack (Melvor Idle formula structure)
 * This combines all the formulas into one function for convenience
 * 
 * Formula structure:
 * 1. Effective Skill Level = Strength Level + Style Bonus (style bonus from matching weapon stance)
 * 2. Base Max Hit = M × (2.2 + (Effective Skill Level / 10) + ((Effective Skill Level + 17) × Strength Bonus) / 640)
 * 3. Max Hit = floor(Base Max Hit × Special Bonus)
 * 4. Min Hit = min(max([1 + Max Hit × Percentage Modifier] + Flat Modifier, 1), Max Hit)
 * 
 * @param strengthLevel - Player's Strength sub-stat level
 * @param weaponDamage - Weapon's damage value (equipmentStats.damage) or 0 if no weapon (this is "Strength Bonus" in Melvor)
 * @param selectedAttackType - The attack type selected by the player
 * @param weaponPreferredType - The weapon's preferred attack type
 * @param medicalBonus - Bonus from medical items (0 for now, would add to skill level)
 * @param chantBonus - Multiplier from chants (1.0 for now, would multiply skill level)
 * @param specialBonus - Multiplier for special attacks (1.0 for normal)
 * @param minHitPercentageModifier - Percentage of max hit to add to min hit (from equipment/meds/chants, default 0)
 * @param minHitFlatModifier - Flat minimum hit damage bonus (from equipment/meds/chants, default 0)
 * @returns Object containing effectiveSkillLevel, baseDamage, maxHit, and minHit
 */
export function calculateMeleeDamage(
  strengthLevel: number,
  weaponDamage: number,
  selectedAttackType: AttackType,
  weaponPreferredType: AttackType | undefined,
  medicalBonus: number = 0,
  chantBonus: number = 1.0,
  specialBonus: number = 1.0,
  minHitPercentageModifier: number = 0,
  minHitFlatModifier: number = 0
): {
  effectiveStrength: number // Kept for backwards compatibility, but represents Effective Skill Level
  baseDamage: number
  maxHit: number
  minHit: number
} {
  // Calculate style bonus (matching weapon stance gives bonus to effective skill level)
  const styleBonus = calculateStyleBonus(selectedAttackType, weaponPreferredType)
  
  // Effective Skill Level = (Strength Level + Medical Bonus) × Chant Bonus + Style Bonus
  // (Melvor structure: Standard Skill Level + Hidden Skill Level, we use style bonus as hidden bonus)
  const baseSkillLevel = strengthLevel + medicalBonus
  const multipliedSkillLevel = baseSkillLevel * chantBonus
  const effectiveSkillLevel = Math.floor(multipliedSkillLevel) + styleBonus
  
  // Base Max Hit = M × (2.2 + (Effective Skill Level / 10) + ((Effective Skill Level + 17) × Strength Bonus) / 640)
  const baseDamage = calculateBaseDamage(effectiveSkillLevel, weaponDamage)
  
  // Max Hit = floor(Base Max Hit × Special Bonus)
  const maxHit = calculateMaxHit(baseDamage, specialBonus)
  
  // Min Hit = min(max([1 + Max Hit × Percentage Modifier] + Flat Modifier, 1), Max Hit)
  const minHit = calculateMinHit(maxHit, minHitPercentageModifier, minHitFlatModifier)
  
  return {
    effectiveStrength: effectiveSkillLevel, // Return as effectiveStrength for backwards compatibility
    baseDamage,
    maxHit,
    minHit,
  }
}

