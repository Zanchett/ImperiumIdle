/**
 * Maps veterancy levels to their corresponding rank icon image paths
 * Icons are named r1.png through r100.png
 * Levels above 100 use r100.png
 */
export function getVeterancyRankIconPath(level: number): string {
  // Clamp level between 1 and 100
  const rankLevel = Math.max(1, Math.min(level, 100))
  return `/images/veterancy/r${rankLevel}.png`
}

/**
 * Checks if a veterancy level has a rank icon
 */
export function hasVeterancyRankIcon(level: number): boolean {
  return level >= 1
}

