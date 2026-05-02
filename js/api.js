/* ═══════════════════════════════════════════════════════════
   RECIPIA — API Module
   Handles all communication with the backend server,
   and image file validation.
═══════════════════════════════════════════════════════════ */

const API_URL      = '/api/ask'; // Vercel serverless function
const MAX_IMAGE_MB = 5;

/* ══════════════════════════════════════════════════════════
   VALIDATION
══════════════════════════════════════════════════════════ */

/**
 * Validates an image file before upload.
 * @param {File} file
 * @returns {{ valid: boolean, errorKey: string|null }}
 */
function validateImageFile(file) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (!allowed.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
    return { valid: false, errorKey: 'invalidImage' };
  }
  if (file.size / (1024 * 1024) > MAX_IMAGE_MB) {
    return { valid: false, errorKey: 'imageTooLarge' };
  }
  return { valid: true, errorKey: null };
}

/* ══════════════════════════════════════════════════════════
   AI COMMUNICATION
══════════════════════════════════════════════════════════ */

/**
 * Sends a prompt to the AI backend and returns the text response.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function askAI(prompt) {
  const response = await fetch(API_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ prompt }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

  return data.choices?.[0]?.message?.content || '';
}

/**
 * Safely extracts and parses a JSON object from an AI text response.
 * Handles cases where the model adds extra text around the JSON.
 * @param {string} text
 * @returns {object}
 */
function parseAIResponse(text) {
  const clean = text.replace(/```json|```/g, '').trim();
  const start = clean.indexOf('{');
  const end   = clean.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No valid JSON found in response');
  return JSON.parse(clean.slice(start, end + 1));
}

/**
 * Picks a random funny rejection message from translations.
 * @param {object} tx - current translation object
 * @returns {string}
 */
function getRandomRejectionMessage(tx) {
  const msgs = tx.notFoodMessages;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

/**
 * Fetches recipe suggestions from the AI based on a list of ingredients.
 * @param {string[]} ingredients
 * @param {string} language - 'English' or 'Arabic'
 * @param {object} tx - current translation object (for rejection messages)
 * @returns {Promise<object>}
 */
async function fetchRecipes(ingredients, language = 'English', tx = TRANSLATIONS.en) {
  const prompt = `You are a world-class culinary AI. The user has these ingredients: ${ingredients.join(', ')}

Respond in ${language}. Return ONLY a valid JSON object. No markdown, no code blocks, no explanation.

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
      "description": "A proper 2-sentence description of the dish.",
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
      "steps": [{"title": "Step Title", "instruction": "Clear instruction with timing and technique."}],
      "tips": "A helpful chef tip.",
      "nutrition": {"calories": 350, "protein": "30g", "carbs": "20g", "fat": "15g"}
    }
  ]
}

Rules:
- Return exactly 6 recipes from different world cuisines
- All text fields MUST have normal spaces between words
- matchScore = percentage of user ingredients available, sort by matchScore descending
- isSmart = true only if user has 70%+ but needs just 1-2 more ingredients
- emoji field MUST be a food emoji like 🍝 🍛 🌮 🥘 🍜 🥗 — never a country code or flag
- Exactly 5 steps per recipe, each instruction 1-2 clear sentences
- 5-6 ingredients per recipe
- Return ONLY the JSON object, nothing else`;

  const text   = await askAI(prompt);
  const parsed = parseAIResponse(text);

  // AI detected non-food input — throw funny rejection
  if (parsed.error === 'not_food') {
    throw new Error('__not_food__');
  }

  return parsed;
}

/**
 * Asks the AI to identify ingredients from a short text prompt.
 * (Image data is described via prompt since image is uploaded separately)
 * @returns {Promise<string[]>}
 */
async function detectIngredientsFromImage() {
  const prompt = 'List all food ingredients visible. Reply ONLY with valid JSON: {"ingredients":["item1","item2"]}';
  const text   = await askAI(prompt);
  const parsed = parseAIResponse(text);
  return parsed.ingredients || [];
}
