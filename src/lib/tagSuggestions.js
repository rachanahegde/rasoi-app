// Tag suggestion utility using Compromise.js with lazy loading
// Only loads NLP when needed to keep bundle size small

// Comprehensive tag categories
export const tagCategories = {
  mealType: ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer', 'Side Dish'],
  dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Keto', 'Low-Carb', 'Paleo'],
  cuisine: ['Indian', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Mediterranean', 'American', 'French', 'Korean', 'Middle Eastern', 'Greek', 'Spanish', 'Vietnamese'],
  method: ['Baked', 'Grilled', 'Fried', 'Steamed', 'Roasted', 'Slow Cooker', 'Instant Pot', 'Air Fryer', 'No-Cook', 'One-Pot', 'Stir-Fry'],
  time: ['Quick & Easy', 'Under 30 Min', 'Make-Ahead', 'Meal Prep'],
  occasion: ['Weeknight', 'Weekend', 'Party', 'Holiday', 'Date Night', 'Kid-Friendly', 'Potluck', 'Comfort Food'],
  flavor: ['Spicy', 'Sweet', 'Savory', 'Tangy', 'Light & Fresh', 'Rich & Creamy', 'Smoky', 'Citrusy'],
  season: ['Spring', 'Summer', 'Fall', 'Winter'],
  health: ['Healthy', 'Low-Calorie', 'High-Protein', 'Heart-Healthy'],
  protein: ['Chicken', 'Beef', 'Pork', 'Fish', 'Seafood', 'Tofu', 'Beans', 'Eggs', 'Lamb', 'Turkey']
};

// Flatten all tags for easy access
export const allTags = Object.values(tagCategories).flat();

// Keyword mappings for intelligent tag suggestions
const keywordMap = {
  // Meal Types
  'Breakfast': ['breakfast', 'morning', 'brunch', 'pancake', 'waffle', 'omelette', 'cereal', 'toast'],
  'Lunch': ['lunch', 'sandwich', 'salad', 'wrap', 'soup'],
  'Dinner': ['dinner', 'supper', 'main course', 'entrée'],
  'Snack': ['snack', 'appetizer', 'finger food', 'bite'],
  'Dessert': ['dessert', 'sweet', 'cake', 'cookie', 'pie', 'pudding', 'ice cream', 'chocolate'],
  'Side Dish': ['side', 'accompaniment', 'garnish'],
  
  // Dietary
  'Vegetarian': ['vegetarian', 'veggie', 'meatless', 'no meat'],
  'Vegan': ['vegan', 'plant-based', 'dairy-free', 'no dairy', 'no eggs'],
  'Gluten-Free': ['gluten-free', 'gluten free', 'gf', 'celiac'],
  'Keto': ['keto', 'ketogenic', 'low carb'],
  'Low-Carb': ['low carb', 'low-carb', 'atkins'],
  
  // Cuisine
  'Indian': ['indian', 'curry', 'masala', 'tandoori', 'biryani', 'naan', 'dal', 'paneer', 'tikka', 'samosa', 'chutney'],
  'Italian': ['italian', 'pasta', 'pizza', 'risotto', 'lasagna', 'spaghetti', 'penne', 'parmesan', 'mozzarella', 'basil'],
  'Mexican': ['mexican', 'taco', 'burrito', 'enchilada', 'quesadilla', 'salsa', 'guacamole', 'tortilla', 'jalapeño'],
  'Chinese': ['chinese', 'stir-fry', 'wok', 'soy sauce', 'ginger', 'fried rice', 'noodles', 'dumpling'],
  'Japanese': ['japanese', 'sushi', 'ramen', 'teriyaki', 'miso', 'tempura', 'sashimi'],
  'Thai': ['thai', 'pad thai', 'curry', 'coconut milk', 'lemongrass', 'basil'],
  'Mediterranean': ['mediterranean', 'greek', 'hummus', 'falafel', 'olive oil', 'feta'],
  'Korean': ['korean', 'kimchi', 'bulgogi', 'bibimbap', 'gochujang'],
  
  // Cooking Methods
  'Baked': ['baked', 'bake', 'oven', 'roast'],
  'Grilled': ['grilled', 'grill', 'bbq', 'barbecue'],
  'Fried': ['fried', 'fry', 'deep-fried', 'pan-fried'],
  'Steamed': ['steamed', 'steam'],
  'Slow Cooker': ['slow cooker', 'crockpot', 'slow cook'],
  'Instant Pot': ['instant pot', 'pressure cooker'],
  'Air Fryer': ['air fryer', 'air fried'],
  'One-Pot': ['one pot', 'one-pot', 'single pot'],
  
  // Time
  'Quick & Easy': ['quick', 'easy', 'simple', 'fast', '15 min', '20 min', '30 min'],
  'Under 30 Min': ['30 min', '20 min', '15 min', 'quick'],
  
  // Flavor
  'Spicy': ['spicy', 'hot', 'chili', 'pepper', 'jalapeño', 'cayenne', 'sriracha'],
  'Sweet': ['sweet', 'sugar', 'honey', 'maple', 'caramel'],
  'Comfort Food': ['comfort', 'cozy', 'hearty', 'warming'],
  
  // Protein
  'Chicken': ['chicken', 'poultry'],
  'Beef': ['beef', 'steak', 'ground beef'],
  'Pork': ['pork', 'bacon', 'ham'],
  'Fish': ['fish', 'salmon', 'tuna', 'cod'],
  'Seafood': ['seafood', 'shrimp', 'crab', 'lobster'],
  'Tofu': ['tofu', 'tempeh'],
  'Beans': ['beans', 'lentils', 'chickpeas', 'legumes']
};

// Lazy load Compromise.js
let nlpInstance = null;

async function loadNLP() {
  if (!nlpInstance) {
    // Only import the minimal plugin needed
    const compromise = await import('compromise');
    nlpInstance = compromise.default;
  }
  return nlpInstance;
}

// Analyze recipe text and suggest tags
export async function suggestTags(recipeData) {
  const { title = '', description = '', ingredients = [], steps = [] } = recipeData;
  
  // Combine all text
  const allText = [
    title,
    description,
    ingredients.join(' '),
    steps.join(' ')
  ].join(' ').toLowerCase();
  
  const suggestions = new Set();
  
  // Keyword-based matching (fast, no NLP needed)
  Object.entries(keywordMap).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => allText.includes(keyword.toLowerCase()))) {
      suggestions.add(tag);
    }
  });
  
  // NLP-based analysis (lazy loaded)
  try {
    const nlp = await loadNLP();
    const doc = nlp(allText);
    
    // Extract cooking methods from verbs
    const verbs = doc.verbs().out('array');
    if (verbs.some(v => ['bake', 'baked', 'baking'].includes(v))) suggestions.add('Baked');
    if (verbs.some(v => ['grill', 'grilled', 'grilling'].includes(v))) suggestions.add('Grilled');
    if (verbs.some(v => ['fry', 'fried', 'frying'].includes(v))) suggestions.add('Fried');
    if (verbs.some(v => ['steam', 'steamed', 'steaming'].includes(v))) suggestions.add('Steamed');
    
    // Extract adjectives for flavor profiles
    const adjectives = doc.adjectives().out('array');
    if (adjectives.some(a => ['spicy', 'hot'].includes(a))) suggestions.add('Spicy');
    if (adjectives.some(a => ['sweet', 'sugary'].includes(a))) suggestions.add('Sweet');
    if (adjectives.some(a => ['healthy', 'light', 'fresh'].includes(a))) suggestions.add('Healthy');
    
  } catch (error) {
    console.warn('NLP analysis failed, using keyword matching only:', error);
  }
  
  return Array.from(suggestions);
}

// Get all available tags organized by category
export function getTagsByCategory() {
  return tagCategories;
}

// Get suggested tags based on simple keyword matching (no async needed)
export function quickSuggestTags(recipeData) {
  const { title = '', description = '', ingredients = [], steps = [] } = recipeData;
  
  const allText = [
    title,
    description,
    ingredients.join(' '),
    steps.join(' ')
  ].join(' ').toLowerCase();
  
  const suggestions = new Set();
  
  Object.entries(keywordMap).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => allText.includes(keyword.toLowerCase()))) {
      suggestions.add(tag);
    }
  });
  
  return Array.from(suggestions);
}
