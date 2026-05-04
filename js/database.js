/* ═══════════════════════════════════════════════════════════
   RECIPIA — Database Module
   Handles all Supabase operations:
   - Recipe cache (smart matching)
   - Global search tracking
   - Global recipe open tracking
═══════════════════════════════════════════════════════════ */

const SUPABASE_URL      = 'https://nkqvhktwhqueltbrjcxg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcXZoa3R3aHF1ZWx0YnJqY3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTM2MzUsImV4cCI6MjA5MzQyOTYzNX0.p7SEHdhvJLELZ-fCr9jJqQeeNMT1NPL0532VKWjXydI';
const CACHE_SIMILARITY  = 0.8; // 80% match threshold
const CACHE_MAX_AGE_MS  = 24 * 60 * 60 * 1000; // 24 hours

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */

/**
 * Makes a request to Supabase REST API.
 */
async function supabase(table, options = {}) {
  const { method = 'GET', body, params = '' } = options;
  const url = `${SUPABASE_URL}/rest/v1/${table}${params}`;

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer':        method === 'POST' ? 'return=representation' : '',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Supabase error: ${res.status}`);
  }

  return res.json().catch(() => null);
}

/**
 * Jaccard similarity between two ingredient arrays.
 * Returns 0.0 to 1.0
 */
function jaccardSimilarity(a, b) {
  const setA        = new Set(a.map(x => x.toLowerCase().trim()));
  const setB        = new Set(b.map(x => x.toLowerCase().trim()));
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union        = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Normalizes and sorts ingredients for consistent cache keys.
 */
function normalizeIngredients(ingredients) {
  return ingredients
    .map(i => i.toLowerCase().trim())
    .filter(Boolean)
    .sort();
}

/* ══════════════════════════════════════════════════════════
   RECIPE CACHE
══════════════════════════════════════════════════════════ */

/**
 * Looks for a cached result with 80%+ ingredient similarity.
 * @param {string[]} ingredients
 * @returns {Promise<object|null>} cached recipe data or null
 */
async function getCachedRecipes(ingredients) {
  try {
    const normalized = normalizeIngredients(ingredients);

    // Fetch recent cache entries (last 24h)
    const cutoff = new Date(Date.now() - CACHE_MAX_AGE_MS).toISOString();
    const rows   = await supabase('recipe_cache', {
      params: `?created_at=gte.${cutoff}&select=ingredients_key,ingredients,recipes,search_count,id`,
    });

    if (!rows || rows.length === 0) return null;

    // Find best matching entry
    let bestMatch = null;
    let bestScore = 0;

    for (const row of rows) {
      const score = jaccardSimilarity(normalized, row.ingredients || []);
      if (score >= CACHE_SIMILARITY && score > bestScore) {
        bestScore = score;
        bestMatch = row;
      }
    }

    if (bestMatch) {
      // Increment search count silently
      supabase(`recipe_cache?id=eq.${bestMatch.id}`, {
        method: 'PATCH',
        body:   { search_count: (bestMatch.search_count || 1) + 1 },
      }).catch(() => {});

      console.log(`Cache hit! Similarity: ${Math.round(bestScore * 100)}%`);
      return bestMatch.recipes;
    }

    return null;
  } catch (e) {
    console.warn('Cache lookup failed:', e.message);
    return null;
  }
}

/**
 * Saves recipe results to cache.
 * @param {string[]} ingredients
 * @param {object} recipesData
 */
async function cacheRecipes(ingredients, recipesData) {
  try {
    const normalized = normalizeIngredients(ingredients);
    const key        = normalized.join(',');

    await supabase('recipe_cache', {
      method: 'POST',
      body: {
        ingredients_key: key,
        ingredients:     normalized,
        recipes:         recipesData,
        search_count:    1,
      },
    });
  } catch (e) {
    console.warn('Cache save failed:', e.message);
  }
}

/* ══════════════════════════════════════════════════════════
   GLOBAL STATS TRACKING
══════════════════════════════════════════════════════════ */

/**
 * Records a search event globally.
 * @param {object[]} recipes
 */
async function trackSearch(recipes) {
  try {
    const cuisines = [...new Set(recipes.map(r => r.cuisine || r.origin || 'Other'))];
    await Promise.all(cuisines.map(cuisine =>
      supabase('searches', {
        method: 'POST',
        body:   { cuisine },
      })
    ));
  } catch (e) {
    console.warn('Track search failed:', e.message);
  }
}

/**
 * Records a recipe open event globally.
 * @param {string} recipeTitle
 * @param {string} recipeEmoji
 */
async function trackRecipeOpen(recipeTitle, recipeEmoji = '') {
  try {
    await supabase('recipe_opens', {
      method: 'POST',
      body:   { recipe_title: recipeTitle, recipe_emoji: recipeEmoji },
    });
  } catch (e) {
    console.warn('Track recipe open failed:', e.message);
  }
}

/* ══════════════════════════════════════════════════════════
   GLOBAL STATS FETCHING
══════════════════════════════════════════════════════════ */

/**
 * Fetches global stats from Supabase.
 * @returns {Promise<object>}
 */
async function fetchGlobalStats() {
  try {
    const [searches, opens] = await Promise.all([
      supabase('searches', { params: '?select=cuisine' }),
      supabase('recipe_opens', { params: '?select=recipe_title,recipe_emoji' }),
    ]);

    // Count cuisines
    const cuisineCounts = {};
    (searches || []).forEach(({ cuisine }) => {
      if (cuisine) cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
    });

    // Count recipe opens
    const recipeCounts = {};
    const recipeEmojis = {};
    (opens || []).forEach(({ recipe_title, recipe_emoji }) => {
      if (recipe_title) {
        recipeCounts[recipe_title] = (recipeCounts[recipe_title] || 0) + 1;
        if (recipe_emoji) recipeEmojis[recipe_title] = recipe_emoji;
      }
    });

    return {
      totalSearches: searches?.length || 0,
      cuisineCounts,
      recipeCounts,
      recipeEmojis,
    };
  } catch (e) {
    console.warn('Fetch global stats failed:', e.message);
    return { totalSearches: 0, cuisineCounts: {}, recipeCounts: {}, recipeEmojis: {} };
  }
}

/**
 * Returns top N items from a frequency object.
 */
function getTopNGlobal(obj, n = 5) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}
