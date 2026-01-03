/**
 * Maps skill IDs to their corresponding icon image paths
 */
export function getSkillIconPath(skillId: string): string {
  const iconMap: Record<string, string> = {
    'bolter-training': '/images/icons/bolter.png',
    'melee-combat': '/images/icons/melee.png',
    'imperial-tactics': '/images/icons/intelligence.png', // Using intelligence as fallback
    'fortification': '/images/icons/intelligence.png', // Using intelligence as fallback
    'leadership': '/images/icons/leadership.png',
    'supply-logistics': '/images/icons/logistics.png',
    'intelligence': '/images/icons/intelligence.png',
    'colony': '/images/icons/colony.png',
    'salvaging': '/images/icons/salvaging.png',
    'engineering': '/images/icons/engineering.png',
    'medicae': '/images/icons/medicae.png',
    'farming': '/images/icons/research.png', // Using research as fallback - TODO: add farming icon
    'research': '/images/icons/research.png',
    'manufactorum': '/images/icons/manufactorum.png',
    'industry': '/images/icons/industry.png',
    'communication': '/images/icons/communication.png',
    'commerce': '/images/icons/commerce.png',
  }

  return iconMap[skillId] || ''
}

/**
 * Checks if a skill has a custom icon image
 */
export function hasSkillIcon(skillId: string): boolean {
  return !!getSkillIconPath(skillId)
}

