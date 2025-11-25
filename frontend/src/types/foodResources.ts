export interface FoodResource {
  id: string
  name: string
  levelRequired: number
  icon?: string // Optional emoji icon (fallback if no image)
  image?: string // Image path for the food resource
  value: number // Gold value
  description: string
}

export const FOOD_RESOURCES: FoodResource[] = [
  { id: 'apples', name: 'Apples', levelRequired: 1, image: '/images/food/apples.png', value: 10, description: 'Fresh crisp apples from Imperial orchards' },
  { id: 'oranges', name: 'Oranges', levelRequired: 5, icon: '🍊', value: 15, description: 'Juicy citrus fruits rich in vitamins' },
  { id: 'wheat', name: 'Wheat', levelRequired: 10, icon: '🌾', value: 25, description: 'Golden grain essential for bread production' },
  { id: 'corn', name: 'Corn', levelRequired: 15, icon: '🌽', value: 30, description: 'Sweet yellow kernels from agri-worlds' },
  { id: 'potatoes', name: 'Potatoes', levelRequired: 20, icon: '🥔', value: 35, description: 'Starchy tubers, a staple of Imperial rations' },
  { id: 'grapes', name: 'Grapes', levelRequired: 25, icon: '🍇', value: 50, description: 'Plump purple grapes, perfect for wine or consumption' },
  { id: 'carrots', name: 'Carrots', levelRequired: 30, icon: '🥕', value: 40, description: 'Orange root vegetables packed with nutrients' },
  { id: 'tomatoes', name: 'Tomatoes', levelRequired: 35, icon: '🍅', value: 45, description: 'Ripe red tomatoes from controlled environments' },
  { id: 'bananas', name: 'Bananas', levelRequired: 40, icon: '🍌', value: 60, description: 'Tropical fruit imported from jungle worlds' },
  { id: 'berries', name: 'Berries', levelRequired: 45, icon: '🫐', value: 80, description: 'Mixed berries, a rare luxury from temperate worlds' },
  { id: 'cabbage', name: 'Cabbage', levelRequired: 50, icon: '🥬', value: 55, description: 'Hardy leafy vegetable, common in Imperial diets' },
  { id: 'onions', name: 'Onions', levelRequired: 55, icon: '🧅', value: 50, description: 'Aromatic bulbs essential for Imperial cuisine' },
  { id: 'peppers', name: 'Peppers', levelRequired: 60, icon: '🫑', value: 70, description: 'Colorful bell peppers from greenhouse worlds' },
  { id: 'mushrooms', name: 'Mushrooms', levelRequired: 65, icon: '🍄', value: 90, description: 'Edible fungi cultivated in dark chambers' },
  { id: 'cucumbers', name: 'Cucumbers', levelRequired: 70, icon: '🥒', value: 65, description: 'Cool refreshing vegetables, perfect for salads' },
  { id: 'avocados', name: 'Avocados', levelRequired: 75, icon: '🥑', value: 120, description: 'Creamy tropical fruit, a premium delicacy' },
  { id: 'pumpkins', name: 'Pumpkins', levelRequired: 80, icon: '🎃', value: 100, description: 'Large orange gourds, seasonal harvests' },
  { id: 'watermelons', name: 'Watermelons', levelRequired: 85, icon: '🍉', value: 150, description: 'Sweet juicy melons, a rare treat' },
  { id: 'pineapples', name: 'Pineapples', levelRequired: 90, icon: '🍍', value: 180, description: 'Exotic tropical fruit from paradise worlds' },
  { id: 'strawberries', name: 'Strawberries', levelRequired: 95, icon: '🍓', value: 200, description: 'Delicate red berries, highly prized' },
  { id: 'peaches', name: 'Peaches', levelRequired: 100, icon: '🍑', value: 220, description: 'Soft stone fruit, a luxury commodity' },
  { id: 'mangoes', name: 'Mangoes', levelRequired: 105, icon: '🥭', value: 250, description: 'Tropical fruit with sweet, aromatic flesh' },
  { id: 'kiwis', name: 'Kiwis', levelRequired: 110, icon: '🥝', value: 280, description: 'Exotic fruit with vibrant green flesh' },
  { id: 'dragon-fruit', name: 'Dragon Fruit', levelRequired: 115, icon: '🐉', value: 350, description: 'Rare alien fruit from distant worlds' },
  { id: 'starfruit', name: 'Starfruit', levelRequired: 118, icon: '⭐', value: 500, description: 'Legendary fruit said to grant vitality' },
]

