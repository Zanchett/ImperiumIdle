export interface HerbResource {
  id: string
  name: string
  levelRequired: number
  icon: string
  value: number // Gold value
  description: string
}

export const HERB_RESOURCES: HerbResource[] = [
  { id: 'medicinal-herbs', name: 'Medicinal Herbs', levelRequired: 1, icon: '🌿', value: 12, description: 'Basic healing herbs for treating wounds' },
  { id: 'thyme', name: 'Thyme', levelRequired: 5, icon: '🌱', value: 18, description: 'Aromatic herb used in cooking and medicine' },
  { id: 'basil', name: 'Basil', levelRequired: 10, icon: '🌿', value: 28, description: 'Fragrant herb essential for Imperial cuisine' },
  { id: 'oregano', name: 'Oregano', levelRequired: 15, icon: '🌱', value: 32, description: 'Mediterranean herb with strong flavor' },
  { id: 'rosemary', name: 'Rosemary', levelRequired: 20, icon: '🌿', value: 38, description: 'Evergreen herb with needle-like leaves' },
  { id: 'sage', name: 'Sage', levelRequired: 25, icon: '🌱', value: 55, description: 'Gray-green herb with medicinal properties' },
  { id: 'mint', name: 'Mint', levelRequired: 30, icon: '🌿', value: 42, description: 'Cooling herb, popular in teas and remedies' },
  { id: 'lavender', name: 'Lavender', levelRequired: 35, icon: '💜', value: 48, description: 'Purple flowering herb with calming scent' },
  { id: 'chamomile', name: 'Chamomile', levelRequired: 40, icon: '🌼', value: 65, description: 'Gentle herb used for relaxation and healing' },
  { id: 'ginseng', name: 'Ginseng', levelRequired: 45, icon: '🌿', value: 85, description: 'Rare root with powerful restorative properties' },
  { id: 'echinacea', name: 'Echinacea', levelRequired: 50, icon: '🌺', value: 60, description: 'Purple coneflower with immune-boosting effects' },
  { id: 'aloe-vera', name: 'Aloe Vera', levelRequired: 55, icon: '🌵', value: 75, description: 'Succulent plant with healing gel' },
  { id: 'ginseng-root', name: 'Ginseng Root', levelRequired: 60, icon: '🌿', value: 95, description: 'Mature ginseng root, highly valuable' },
  { id: 'valerian', name: 'Valerian', levelRequired: 65, icon: '🌱', value: 110, description: 'Herb known for its sedative properties' },
  { id: 'st-johns-wort', name: 'St. John\'s Wort', levelRequired: 70, icon: '🌻', value: 125, description: 'Yellow flower with antidepressant qualities' },
  { id: 'turmeric', name: 'Turmeric', levelRequired: 75, icon: '🟡', value: 140, description: 'Golden spice with anti-inflammatory properties' },
  { id: 'ginger', name: 'Ginger', levelRequired: 80, icon: '🟠', value: 160, description: 'Spicy root used in medicine and cooking' },
  { id: 'feverfew', name: 'Feverfew', levelRequired: 85, icon: '🌼', value: 180, description: 'Herb effective against fevers and headaches' },
  { id: 'milk-thistle', name: 'Milk Thistle', levelRequired: 90, icon: '🌾', value: 200, description: 'Purple flower with liver-protective compounds' },
  { id: 'ashwagandha', name: 'Ashwagandha', levelRequired: 95, icon: '🌿', value: 240, description: 'Adaptogenic herb from ancient traditions' },
  { id: 'rhodiola', name: 'Rhodiola', levelRequired: 100, icon: '🌹', value: 260, description: 'Arctic herb that enhances endurance' },
  { id: 'reishi', name: 'Reishi Mushroom', levelRequired: 105, icon: '🍄', value: 300, description: 'Medicinal mushroom with longevity benefits' },
  { id: 'cordyceps', name: 'Cordyceps', levelRequired: 110, icon: '🍄', value: 320, description: 'Rare parasitic fungus with energy-boosting properties' },
  { id: 'warp-herb', name: 'Warp Herb', levelRequired: 115, icon: '🌀', value: 400, description: 'Psyker-active plant from the Warp' },
  { id: 'emperor-blessing', name: 'Emperor\'s Blessing', levelRequired: 118, icon: '👑', value: 600, description: 'Sacred herb blessed by the Emperor Himself' },
]

