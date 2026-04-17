/* ═══════════════════════════════════════════════════════════
   SAVORLY — API Module
   Handles all communication with the backend server
═══════════════════════════════════════════════════════════ */

const API_URL = 'https://recipe-backend-production.up.railway.app/api/ask';

// Max image size: 5MB
const MAX_IMAGE_SIZE_MB = 5;

// Common non-food patterns to reject
const NON_FOOD_PATTERNS = [
  /write|poem|story|essay|code|song|joke|lyric/i,
  /tell\s+me|explain|translate|summarize|describe/i,
  /what\s+is|who\s+is|how\s+are\s+you/i,
  /hello+|hi+\s|hey+\s|good\s+(morning|evening|night)/i,
  /help\s+me\s+(with|to)\s+(?!cook|make|prepare)/i,
  /^(yes|no|ok|okay|sure|thanks|thank you|please)$/i,
];

// Known food-related keywords to validate against
const FOOD_KEYWORDS = [
  'chicken','beef','lamb','pork','fish','shrimp','egg','tofu','meat','turkey','duck','salmon','tuna',
  'tomato','potato','onion','garlic','ginger','carrot','pepper','lemon','lime','spinach','broccoli',
  'mushroom','zucchini','eggplant','cabbage','lettuce','cucumber','celery','corn','pea','bean',
  'rice','pasta','bread','flour','noodle','oat','wheat','barley',
  'milk','butter','cream','cheese','yogurt','oil','olive','vinegar','sauce','salt','sugar','honey',
  'apple','banana','orange','mango','strawberry','grape','avocado','coconut',
  'cumin','paprika','turmeric','coriander','basil','thyme','oregano','rosemary','cinnamon','curry',
  'soy','tahini','mayo','ketchup','mustard','stock','broth',
  // Arabic food words
  'دجاج','لحم','سمك','بيض','طماطم','بصل','ثوم','أرز','خبز','زيت','ملح','سكر','جبن','لبن','بطاطس',
  'جزر','فلفل','ليمون','بهارات','كمون','كزبرة','زبدة','طحينة','خيار','باذنجان'
];

/**
 * Validates that a text input looks like a food ingredient list.
 * @param {string} text
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateIngredientInput(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    return { valid: false, error: 'Please enter at least one ingredient.' };
  }

  if (trimmed.length < 3) {
    return { valid: false, error: 'Input is too short. Please enter ingredient names.' };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Input is too long. Please keep it under 500 characters.' };
  }

  // Check for obvious non-food requests
  for (const pattern of NON_FOOD_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Please enter food ingredients only, like: chicken, garlic, lemon.' };
    }
  }

  // Check that at least one word matches a known food keyword
  const words = trimmed.toLowerCase().split(/[\s,،\n]+/).filter(w => w.length >= 2);
  const hasFood = words.some(word =>
    FOOD_KEYWORDS.some(keyword => word.includes(keyword) || keyword.includes(word))
  );

  if (!hasFood) {
    return { valid: false, error: 'No food ingredients detected. Please enter ingredient names like: chicken, garlic, rice.' };
  }

  return { valid: true, error: null };
}

/**
 * Validates an image file before upload.
 * @param {File} file
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateImageFile(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
    return { valid: false, error: `"${file.name}" is not a supported image format. Use JPG, PNG, or WEBP.` };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_IMAGE_SIZE_MB) {
    return { valid: false, error: `"${file.name}" is too large (${sizeMB.toFixed(1)}MB). Max size is ${MAX_IMAGE_SIZE_MB}MB.` };
  }

  return { valid: true, error: null };
}

/**
 * Sends a prompt to the AI backend and returns the text response.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function askAI(prompt) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  return data.choices?.[0]?.message?.content || '';
}

/**
 * Safely extracts and parses a JSON object from an AI text response.
 * Handles cases where the model adds extra text around the JSON.
 * @param {string} text - Raw AI response text
 * @returns {object}
 */
function parseJSON(text) {
  const clean = text.replace(/```json|```/g, '').trim();
  const start = clean.indexOf('{');
  const end   = clean.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No valid JSON found in response');
  return JSON.parse(clean.slice(start, end + 1));
}

/**
 * Asks the AI to identify ingredients from a text description.
 * @param {string[]} ingredients
 * @returns {Promise<object>} Parsed recipe data
 */
async function fetchRecipes(ingredients, language = 'English') {
  const prompt = `You are a world-class culinary AI. The user has these ingredients: ${ingredients.join(', ')}

Respond in ${language}. Return ONLY a valid JSON object. No markdown, no code blocks, no explanation before or after.

Use exactly this structure:
{
  "detectedIngredients": ["ingredient1", "ingredient2"],
  "recipes": [
    {
      "id": "r1",
      "title": "Recipe Name With Spaces",
      "emoji": "🍝",
      "origin": "Country Name",
      "cuisine": "Cuisine Type",
      "description": "A proper sentence with spaces describing the dish. Second sentence here.",
      "prepTime": "10 min",
      "cookTime": "20 min",
      "servings": 4,
      "difficulty": "Easy",
      "matchScore": 90,
      "availableIngredients": ["ingredient1"],
      "missingIngredients": ["missing1"],
      "allIngredients": [{"name": "ingredient name", "amount": "2 cups", "have": true}],
      "isSmart": false,
      "smartSuggestion": "",
      "steps": [{"title": "Step Title", "instruction": "Clear instruction with spaces, timing, and technique."}],
      "tips": "A helpful chef tip with proper spacing.",
      "nutrition": {"calories": 350, "protein": "30g", "carbs": "20g", "fat": "15g"}
    }
  ]
}

Rules:
- Return exactly 6 recipes from different world cuisines
- All text fields MUST have normal spaces between words
- matchScore = percentage of user ingredients available, sort by matchScore descending
- isSmart = true only if user has 70% or more but needs just 1-2 more ingredients
- The emoji field MUST be a food emoji like 🍝 🍛 🌮 🥘 🍜 🥗 — never a country code or flag
- Exactly 5 steps per recipe, each instruction 1-2 clear sentences
- 5 to 6 ingredients per recipe
- Return ONLY the JSON object, nothing else`;

  const text = await askAI(prompt);
  return parseJSON(text);
}

/**
 * Asks the AI to identify ingredients from an image description prompt.
 * @returns {Promise<string[]>} List of detected ingredients
 */
async function detectIngredientsFromImage() {
  const prompt = 'List all food ingredients visible. Reply ONLY with minified JSON: {"ingredients":["item1","item2"]}';
  const text = await askAI(prompt);
  const parsed = parseJSON(text);
  return parsed.ingredients || [];
}