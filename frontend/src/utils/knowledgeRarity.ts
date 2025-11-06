/**
 * Knowledge Rarity Colors - 12 tiers
 * Each rarity has a unique color scheme
 */
export const KNOWLEDGE_RARITY_COLORS: Record<number, {
  background: string
  border: string
  text: string
  glow: string
  name: string
}> = {
  1: {
    background: 'rgba(128, 128, 128, 0.2)', // Gray
    border: 'rgba(128, 128, 128, 0.5)',
    text: '#808080',
    glow: 'rgba(128, 128, 128, 0.5)',
    name: 'Common',
  },
  2: {
    background: 'rgba(255, 255, 255, 0.2)', // White
    border: 'rgba(255, 255, 255, 0.5)',
    text: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.5)',
    name: 'Uncommon',
  },
  3: {
    background: 'rgba(0, 255, 0, 0.2)', // Green
    border: 'rgba(0, 255, 0, 0.5)',
    text: '#00ff00',
    glow: 'rgba(0, 255, 0, 0.5)',
    name: 'Rare',
  },
  4: {
    background: 'rgba(0, 150, 255, 0.2)', // Blue
    border: 'rgba(0, 150, 255, 0.5)',
    text: '#0096ff',
    glow: 'rgba(0, 150, 255, 0.5)',
    name: 'Epic',
  },
  5: {
    background: 'rgba(138, 43, 226, 0.2)', // Purple
    border: 'rgba(138, 43, 226, 0.5)',
    text: '#8a2be2',
    glow: 'rgba(138, 43, 226, 0.5)',
    name: 'Legendary',
  },
  6: {
    background: 'rgba(255, 140, 0, 0.2)', // Orange
    border: 'rgba(255, 140, 0, 0.5)',
    text: '#ff8c00',
    glow: 'rgba(255, 140, 0, 0.5)',
    name: 'Mythic',
  },
  7: {
    background: 'rgba(255, 20, 147, 0.2)', // Deep Pink
    border: 'rgba(255, 20, 147, 0.5)',
    text: '#ff1493',
    glow: 'rgba(255, 20, 147, 0.5)',
    name: 'Ancient',
  },
  8: {
    background: 'rgba(255, 215, 0, 0.2)', // Gold
    border: 'rgba(255, 215, 0, 0.5)',
    text: '#ffd700',
    glow: 'rgba(255, 215, 0, 0.5)',
    name: 'Divine',
  },
  9: {
    background: 'rgba(64, 224, 208, 0.2)', // Turquoise
    border: 'rgba(64, 224, 208, 0.5)',
    text: '#40e0d0',
    glow: 'rgba(64, 224, 208, 0.5)',
    name: 'Celestial',
  },
  10: {
    background: 'rgba(255, 0, 255, 0.2)', // Magenta
    border: 'rgba(255, 0, 255, 0.5)',
    text: '#ff00ff',
    glow: 'rgba(255, 0, 255, 0.5)',
    name: 'Transcendent',
  },
  11: {
    background: 'rgba(255, 69, 0, 0.2)', // Red-Orange
    border: 'rgba(255, 69, 0, 0.5)',
    text: '#ff4500',
    glow: 'rgba(255, 69, 0, 0.5)',
    name: 'Primordial',
  },
  12: {
    background: 'rgba(75, 0, 130, 0.2)', // Indigo
    border: 'rgba(75, 0, 130, 0.5)',
    text: '#4b0082',
    glow: 'rgba(75, 0, 130, 0.5)',
    name: 'Cosmic',
  },
}

export function getKnowledgeRarityColor(rarity: number) {
  return KNOWLEDGE_RARITY_COLORS[rarity] || KNOWLEDGE_RARITY_COLORS[1]
}

