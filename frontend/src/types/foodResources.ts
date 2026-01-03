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
  // Tier 1 - Beginner crops (Level 1-10)
  { id: 'apples', name: 'Apples', levelRequired: 1, image: '/images/food/apple.png', value: 10, description: 'Fresh crisp apples from Imperial orchards' },
  { id: 'wheat', name: 'Wheat', levelRequired: 3, image: '/images/food/wheat.png', value: 15, description: 'Golden grain essential for bread production' },
  { id: 'potatoes', name: 'Potatoes', levelRequired: 5, image: '/images/food/potato.png', value: 20, description: 'Starchy tubers, a staple of Imperial rations' },
  { id: 'carrots', name: 'Carrots', levelRequired: 7, image: '/images/food/carrot.png', value: 25, description: 'Orange root vegetables packed with nutrients' },
  { id: 'onions', name: 'Onions', levelRequired: 10, image: '/images/food/onion.png', value: 30, description: 'Aromatic bulbs essential for Imperial cuisine' },
  
  // Tier 2 - Intermediate crops (Level 12-30)
  { id: 'corn', name: 'Corn', levelRequired: 12, image: '/images/food/corn.png', value: 35, description: 'Sweet yellow kernels from agri-worlds' },
  { id: 'tomatoes', name: 'Tomatoes', levelRequired: 15, image: '/images/food/tomato.png', value: 40, description: 'Ripe red tomatoes from controlled environments' },
  { id: 'lettuce', name: 'Lettuce', levelRequired: 18, image: '/images/food/lettuce.png', value: 35, description: 'Fresh leafy greens for salads' },
  { id: 'peas', name: 'Peas', levelRequired: 20, image: '/images/food/peas.png', value: 45, description: 'Sweet green peas from pod plants' },
  { id: 'radish', name: 'Radish', levelRequired: 22, image: '/images/food/radish.png', value: 40, description: 'Crisp root vegetables with a sharp flavor' },
  { id: 'broccoli', name: 'Broccoli', levelRequired: 25, image: '/images/food/broccoli.png', value: 50, description: 'Nutritious green florets rich in vitamins' },
  { id: 'eggplant', name: 'Eggplant', levelRequired: 28, image: '/images/food/eggplant.png', value: 55, description: 'Purple vegetables from warm climates' },
  { id: 'zucchini', name: 'Zucchini', levelRequired: 30, image: '/images/food/zucchini.png', value: 60, description: 'Versatile summer squash' },
  
  // Tier 3 - Advanced crops (Level 35-60)
  { id: 'oranges', name: 'Oranges', levelRequired: 35, image: '/images/food/orange.png', value: 70, description: 'Juicy citrus fruits rich in vitamins' },
  { id: 'grapes', name: 'Grapes', levelRequired: 38, image: '/images/food/grape.png', value: 80, description: 'Plump purple grapes, perfect for wine or consumption' },
  { id: 'strawberries', name: 'Strawberries', levelRequired: 40, image: '/images/food/strawberry.png', value: 90, description: 'Delicate red berries, highly prized' },
  { id: 'raspberry', name: 'Raspberries', levelRequired: 42, image: '/images/food/raspberry.png', value: 95, description: 'Tart red berries from bramble bushes' },
  { id: 'cherry', name: 'Cherries', levelRequired: 45, image: '/images/food/cherry.png', value: 100, description: 'Sweet red stone fruits' },
  { id: 'peppers', name: 'Bell Peppers', levelRequired: 48, image: '/images/food/bell_pepper.png', value: 110, description: 'Colorful bell peppers from greenhouse worlds' },
  { id: 'chili-pepper', name: 'Chili Peppers', levelRequired: 50, image: '/images/food/chili_pepper.png', value: 120, description: 'Spicy peppers that add heat to dishes' },
  { id: 'garlic', name: 'Garlic', levelRequired: 52, image: '/images/food/garlic.png', value: 85, description: 'Aromatic bulbs used for flavoring' },
  { id: 'green-onion', name: 'Green Onions', levelRequired: 55, image: '/images/food/green_onion.png', value: 90, description: 'Mild allium with green stalks' },
  { id: 'red-onion', name: 'Red Onions', levelRequired: 58, image: '/images/food/red_onion.png', value: 100, description: 'Mild purple onions perfect for salads' },
  { id: 'pumpkins', name: 'Pumpkins', levelRequired: 60, image: '/images/food/pumpkin.png', value: 130, description: 'Large orange gourds, seasonal harvests' },
  
  // Tier 4 - Exotic crops (Level 65-90)
  { id: 'bananas', name: 'Bananas', levelRequired: 65, image: '/images/food/banana.png', value: 150, description: 'Tropical fruit imported from jungle worlds' },
  { id: 'pineapples', name: 'Pineapples', levelRequired: 70, image: '/images/food/pineapple.png', value: 180, description: 'Exotic tropical fruit from paradise worlds' },
  { id: 'watermelons', name: 'Watermelons', levelRequired: 75, image: '/images/food/watermelon.png', value: 200, description: 'Sweet juicy melons, a rare treat' },
  { id: 'avocados', name: 'Avocados', levelRequired: 78, image: '/images/food/avocado.png', value: 220, description: 'Creamy tropical fruit, a premium delicacy' },
  { id: 'kiwis', name: 'Kiwis', levelRequired: 80, image: '/images/food/kiwi.png', value: 250, description: 'Exotic fruit with vibrant green flesh' },
  { id: 'lemon', name: 'Lemons', levelRequired: 82, image: '/images/food/lemon.png', value: 180, description: 'Tart citrus fruits for flavoring' },
  { id: 'tangerine', name: 'Tangerines', levelRequired: 85, image: '/images/food/tangerine.png', value: 200, description: 'Sweet small citrus fruits' },
  { id: 'pear', name: 'Pears', levelRequired: 88, image: '/images/food/pear.png', value: 230, description: 'Sweet juicy fruits with soft flesh' },
  { id: 'coconut', name: 'Coconuts', levelRequired: 90, image: '/images/food/coconut.png', value: 280, description: 'Tropical nuts with refreshing water' },
  
  // Tier 5 - Rare crops (Level 95+)
  { id: 'papaya', name: 'Papayas', levelRequired: 95, image: '/images/food/papaya.png', value: 350, description: 'Exotic tropical fruit with orange flesh' },
  { id: 'pomegranate', name: 'Pomegranates', levelRequired: 100, image: '/images/food/pomegranate.png', value: 400, description: 'Ancient fruit with jewel-like seeds' },
  { id: 'durian', name: 'Durian', levelRequired: 105, image: '/images/food/durian.png', value: 500, description: 'Controversial tropical fruit with strong aroma' },
  { id: 'rosehip', name: 'Rosehips', levelRequired: 110, image: '/images/food/rosehip.png', value: 600, description: 'Rare wild fruit from rose bushes' },
]

