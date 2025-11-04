/**
 * Melvor Idle Experience Formula
 * Experience doubles approximately every 7 levels
 * Creates a grindy late-game progression
 */

/**
 * Calculate the total cumulative experience required to reach a specific level
 * Formula: Experience = floor( (1/4) * Σ (from ℓ=1 to L-1) [ ℓ + 300 * 2^(ℓ/7) ] )
 * @param level - Target level (starting from level 1)
 * @returns Total cumulative experience required
 */
export function getCumulativeExperience(level: number): number {
  if (level <= 1) return 0
  
  let totalXP = 0
  for (let ℓ = 1; ℓ < level; ℓ++) {
    const term = ℓ + 300 * Math.pow(2, ℓ / 7)
    totalXP += term
  }
  
  return Math.floor(totalXP / 4)
}

/**
 * Calculate the experience difference between level L-1 and level L
 * Formula: Experience Difference = floor( (1/4) * (L - 1 + 300 * 2^((L-1)/7)) )
 * @param level - Target level
 * @returns Experience needed to go from level-1 to level
 */
export function getExperienceForLevel(level: number): number {
  if (level <= 1) return 0
  
  const ℓ = level - 1
  const term = ℓ + 300 * Math.pow(2, ℓ / 7)
  
  return Math.floor(term / 4)
}

/**
 * Calculate what level a player would be at given their total experience
 * @param totalExperience - Total cumulative experience
 * @returns The level the player would be at
 */
export function getLevelFromExperience(totalExperience: number): number {
  if (totalExperience < 0) return 1
  
  // Start from level 1 and work up
  let level = 1
  let cumulativeXP = 0
  
  // Keep adding XP for each level until we exceed totalExperience
  while (cumulativeXP <= totalExperience) {
    level++
    const nextLevelXP = getExperienceForLevel(level)
    cumulativeXP += nextLevelXP
    
    // Safety check to prevent infinite loops
    if (level > 1000) break
  }
  
  // Return level - 1 because we went one level too far
  return Math.max(1, level - 1)
}

/**
 * Get experience progress for current level
 * @param currentXP - Current total cumulative experience
 * @returns Object with current level, XP in current level, and XP needed for next level
 */
export function getExperienceProgress(currentXP: number) {
  const currentLevel = getLevelFromExperience(currentXP)
  const cumulativeXPForLevel = getCumulativeExperience(currentLevel)
  const cumulativeXPForNextLevel = getCumulativeExperience(currentLevel + 1)
  
  const xpInCurrentLevel = currentXP - cumulativeXPForLevel
  const xpNeededForNextLevel = cumulativeXPForNextLevel - cumulativeXPForLevel
  
  return {
    level: currentLevel,
    experience: xpInCurrentLevel,
    experienceToNext: xpNeededForNextLevel,
  }
}

