/* ═══════════════════════════════════════════════════════════
   RECIPIA — Database Module
   Supabase operations: cache, global tracking, personal stats
═══════════════════════════════════════════════════════════ */

const SUPABASE_URL      = 'https://nkqvhktwhqueltbrjcxg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcXZoa3R3aHF1ZWx0YnJqY3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTM2MzUsImV4cCI6MjA5MzQyOTYzNX0.p7SEHdhvJLELZ-fCr9jJqQeeNMT1NPL0532VKWjXydI';
const CACHE_SIMILARITY  = 0.8;
const CACHE_MAX_AGE_MS  = 24 * 60 * 60 * 1000;

/* ── CORE REQUEST ── */
async function supabaseRequest(table, options = {}) {
  const { method = 'GET', body, params = '' } = options;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
      method,
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer':        method === 'POST' ? 'return=representation' : '',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    return res.json().catch(() => null);
  } catch {
    return null;
  }
}

/* ── HELPERS ── */
function jaccardSimilarity(a, b) {
  const setA = new Set(a.map(x => x.toLowerCase().trim()));
  const setB = new Set(b.map(x => x.toLowerCase().trim()));
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function normalizeIngredients(ingredients) {
  return ingredients.map(i => i.toLowerCase().trim()).filter(Boolean).sort();
}

function getTopNGlobal(obj, n = 5) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

/* ── CACHE ── */
async function getCachedRecipes(ingredients) {
  try {
    const normalized = normalizeIngredients(ingredients);
    const cutoff     = new Date(Date.now() - CACHE_MAX_AGE_MS).toISOString();
    const rows       = await supabaseRequest('recipe_cache', {
      params: `?created_at=gte.${cutoff}&select=id,ingredients,recipes,search_count`,
    });
    if (!rows || !Array.isArray(rows) || rows.length === 0) return null;

    let bestMatch = null;
    let bestScore = 0;
    for (const row of rows) {
      if (!row.ingredients) continue;
      const score = jaccardSimilarity(normalized, row.ingredients);
      if (score >= CACHE_SIMILARITY && score > bestScore) {
        bestScore = score;
        bestMatch = row;
      }
    }

    if (bestMatch) {
      supabaseRequest(`recipe_cache?id=eq.${bestMatch.id}`, {
        method: 'PATCH',
        body:   { search_count: (bestMatch.search_count || 1) + 1 },
      });
      console.log(`✅ Cache hit! ${Math.round(bestScore * 100)}%`);
      return bestMatch.recipes;
    }
    return null;
  } catch (e) {
    console.warn('Cache lookup failed:', e.message);
    return null;
  }
}

async function cacheRecipes(ingredients, recipesData) {
  try {
    const normalized = normalizeIngredients(ingredients);
    await supabaseRequest('recipe_cache', {
      method: 'POST',
      body: {
        ingredients_key: normalized.join(','),
        ingredients:     normalized,
        recipes:         recipesData,
        search_count:    1,
      },
    });
  } catch (e) {
    console.warn('Cache save failed:', e.message);
  }
}

/* ── TRACKING ── */
async function trackSearch(recipes) {
  try {
    const userId   = typeof getUserId === 'function' ? getUserId() : null;
    const cuisines = [...new Set(recipes.map(r => r.cuisine || r.origin || 'Other'))];
    for (const cuisine of cuisines) {
      await supabaseRequest('searches', {
        method: 'POST',
        body:   { cuisine, user_id: userId },
      });
    }
  } catch (e) {
    console.warn('trackSearch failed:', e.message);
  }
}

async function trackRecipeOpen(recipeTitle, recipeEmoji = '') {
  try {
    const userId = typeof getUserId === 'function' ? getUserId() : null;
    await supabaseRequest('recipe_opens', {
      method: 'POST',
      body:   { recipe_title: recipeTitle, recipe_emoji: recipeEmoji, user_id: userId },
    });
  } catch (e) {
    console.warn('trackRecipeOpen failed:', e.message);
  }
}

/* ── GLOBAL STATS ── */
async function fetchGlobalStats() {
  try {
    const [searches, opens] = await Promise.all([
      supabaseRequest('searches',     { params: '?select=cuisine' }),
      supabaseRequest('recipe_opens', { params: '?select=recipe_title,recipe_emoji' }),
    ]);

    const cuisineCounts = {};
    (searches || []).forEach(({ cuisine }) => {
      if (cuisine) cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
    });

    const recipeCounts = {};
    const recipeEmojis = {};
    (opens || []).forEach(({ recipe_title, recipe_emoji }) => {
      if (recipe_title) {
        recipeCounts[recipe_title] = (recipeCounts[recipe_title] || 0) + 1;
        if (recipe_emoji) recipeEmojis[recipe_title] = recipe_emoji;
      }
    });

    return {
      totalSearches: (searches || []).length,
      cuisineCounts,
      recipeCounts,
      recipeEmojis,
    };
  } catch (e) {
    console.warn('fetchGlobalStats failed:', e.message);
    return { totalSearches: 0, cuisineCounts: {}, recipeCounts: {}, recipeEmojis: {} };
  }
}

/* ── PERSONAL STATS ── */
async function fetchPersonalStats(userId) {
  if (!userId) return { totalSearches: 0, cuisineCounts: {}, recipeCounts: {}, recipeEmojis: {} };
  try {
    const [searches, opens] = await Promise.all([
      supabaseRequest('searches',     { params: `?user_id=eq.${userId}&select=cuisine` }),
      supabaseRequest('recipe_opens', { params: `?user_id=eq.${userId}&select=recipe_title,recipe_emoji` }),
    ]);

    const cuisineCounts = {};
    (searches || []).forEach(({ cuisine }) => {
      if (cuisine) cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
    });

    const recipeCounts = {};
    const recipeEmojis = {};
    (opens || []).forEach(({ recipe_title, recipe_emoji }) => {
      if (recipe_title) {
        recipeCounts[recipe_title] = (recipeCounts[recipe_title] || 0) + 1;
        if (recipe_emoji) recipeEmojis[recipe_title] = recipe_emoji;
      }
    });

    return {
      totalSearches: (searches || []).length,
      cuisineCounts,
      recipeCounts,
      recipeEmojis,
    };
  } catch (e) {
    console.warn('fetchPersonalStats failed:', e.message);
    return { totalSearches: 0, cuisineCounts: {}, recipeCounts: {}, recipeEmojis: {} };
  }
}
