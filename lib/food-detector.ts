/**
 * Food Detection Utility
 * Uses TensorFlow.js MobileNet to classify images and detect if they contain food.
 * Runs 100% client-side — no API key, no internet required after model loads.
 */

// Comprehensive list of food-related ImageNet classes (MobileNet outputs)
const FOOD_CLASSES = new Set([
  // Baked goods
  'bagel', 'pretzel', 'bread', 'french loaf', 'sourdough bread', 'challah',
  'muffin', 'croissant', 'waffle', 'pizza', 'flatbread', 'pita', 'naan',
  'pancake', 'doughnut', 'cupcake', 'tart', 'pie', 'pot pie',

  // Meat & seafood
  'hot dog', 'hamburger', 'cheeseburger', 'corn dog', 'meat loaf', 'meatball',
  'sausage', 'chicken', 'steak', 'ribs', 'pulled pork', 'bacon', 'ham',
  'fish', 'lobster', 'crab', 'shrimp', 'sushi', 'sashimi', 'oyster',

  // Vegetables & fruits
  'broccoli', 'cauliflower', 'zucchini', 'cabbage', 'spinach', 'lettuce',
  'mushroom', 'bell pepper', 'cucumber', 'tomato', 'carrot', 'corn',
  'artichoke', 'asparagus', 'eggplant', 'leek', 'onion', 'garlic',
  'banana', 'apple', 'orange', 'lemon', 'strawberry', 'raspberry',
  'pineapple', 'mango', 'watermelon', 'grape', 'fig', 'pomegranate',
  'guava', 'papaya', 'jackfruit', 'durian', 'avocado', 'acorn squash',

  // Prepared dishes
  'burrito', 'guacamole', 'taco', 'nacho', 'enchilada', 'salsa',
  'noodle', 'pasta', 'spaghetti', 'macaroni', 'ravioli', 'lasagne',
  'soup', 'stew', 'curry', 'biryani', 'fried rice', 'paella',
  'salad', 'sandwich', 'wrap', 'sub',
  'dumplings', 'spring roll', 'egg roll',

  // Dairy & eggs
  'cheese', 'ice cream', 'ice lolly', 'custard', 'pudding', 'yogurt',
  'butter', 'cream', 'milk', 'egg', 'omelette',

  // Sweets & desserts
  'chocolate', 'candy', 'lollipop', 'cake', 'brownie', 'cookie',
  'macaroon', 'chocolate sauce', 'butterscotch', 'caramel',

  // Drinks (in food context)
  'cup', 'coffee', 'tea', 'juice', 'smoothie', 'milkshake',

  // Nuts & grains
  'walnut', 'peanut', 'almond', 'cashew', 'pistachio', 'sunflower seed',
  'oatmeal', 'granola', 'rice', 'quinoa',

  // Other common food terms
  'food', 'meal', 'dish', 'plate', 'bowl', 'snack', 'breakfast',
  'lunch', 'dinner', 'feast', 'buffet', 'potluck',
  'sauce', 'condiment', 'seasoning', 'spice', 'herb',

  // Partial word matches handled separately
]);

// Keywords that indicate food (for partial matching)
const FOOD_KEYWORDS = [
  'food', 'meal', 'eat', 'dish', 'cook', 'bake', 'fry', 'roast', 'grill',
  'chicken', 'beef', 'pork', 'fish', 'rice', 'bread', 'cake', 'soup',
  'salad', 'pasta', 'noodle', 'pizza', 'burger', 'taco', 'curry',
  'vegetable', 'fruit', 'grain', 'dairy', 'meat', 'seafood', 'nut',
  'sauce', 'cheese', 'egg', 'milk', 'cream', 'chocolate', 'sweet',
  'spice', 'herb', 'mushroom', 'potato', 'tomato', 'pepper', 'onion',
  'garlic', 'lemon', 'lime', 'orange', 'banana', 'apple', 'mango',
];

let modelCache: any = null;

/**
 * Load MobileNet model (cached after first load)
 */
export async function loadModel() {
  if (modelCache) return modelCache;
  // Dynamically import to avoid SSR issues
  const mobilenet = await import('@tensorflow-models/mobilenet');
  await import('@tensorflow/tfjs');
  modelCache = await mobilenet.load({ version: 2, alpha: 0.5 }); // lighter version
  return modelCache;
}

/**
 * Check if a classification label is food-related
 */
function isFoodLabel(label: string): boolean {
  const lower = label.toLowerCase();

  // Direct class match
  if (FOOD_CLASSES.has(lower)) return true;

  // Partial keyword match
  return FOOD_KEYWORDS.some(kw => lower.includes(kw));
}

export type FoodValidationResult = {
  isFood: boolean;
  confidence: number;       // 0-100
  detectedAs: string;       // what was detected
  topPredictions: { label: string; probability: number }[];
};

/**
 * Validate whether an image contains food.
 * @param imageElement - HTMLImageElement or HTMLCanvasElement or ImageData
 */
export async function validateFoodImage(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<FoodValidationResult> {
  const model = await loadModel();

  // Get top 10 predictions
  const predictions = await model.classify(imageElement, 10);

  const topPredictions = predictions.map((p: any) => ({
    label: p.className,
    probability: Math.round(p.probability * 100),
  }));

  // Check each prediction for food
  let bestFoodPrediction = { label: '', confidence: 0 };

  for (const pred of predictions) {
    if (isFoodLabel(pred.className) && pred.probability > bestFoodPrediction.confidence) {
      bestFoodPrediction = { label: pred.className, confidence: pred.probability };
    }
  }

  // Consider it food if confidence > 10% (MobileNet is sometimes conservative)
  const isFood = bestFoodPrediction.confidence > 0.10;

  return {
    isFood,
    confidence: Math.round(bestFoodPrediction.confidence * 100),
    detectedAs: bestFoodPrediction.label || topPredictions[0]?.label || 'Unknown',
    topPredictions,
  };
}

/**
 * Convert a base64 data URL to an HTMLImageElement for TF.js
 */
export function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src     = dataUrl;
  });
}
