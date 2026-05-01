/* ═══════════════════════════════════════════════════════════
   RECIPIA — Stats Module
   Tracks and persists user activity in localStorage.
   Tracks: total searches, cuisine searches, recipe opens.
═══════════════════════════════════════════════════════════ */

const STATS_KEY = 'recipia_stats';

/* ── DEFAULT STATS SHAPE ── */
const DEFAULT_STATS = {
  totalSearches:  0,
  cuisineCounts:  {},   // { "Italian": 3, "Mexican": 1 }
  recipeCounts:   {},   // { "Chicken Piccata": 5, "Tacos": 2 }
  favoriteCount:  0,
};

/**
 * Loads stats from localStorage.
 * @returns {object}
 */
function loadStats() {
  try {
    const saved = JSON.parse(localStorage.getItem(STATS_KEY));
    return saved ? { ...DEFAULT_STATS, ...saved } : { ...DEFAULT_STATS };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

/**
 * Saves stats object to localStorage.
 * @param {object} stats
 */
function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Could not save stats:', e);
  }
}

/**
 * Records a new search and tracks cuisine hits.
 * @param {object[]} recipes - Returned recipe array
 */
function recordSearch(recipes) {
  const stats = loadStats();
  stats.totalSearches += 1;

  // Count each unique cuisine from results
  recipes.forEach(r => {
    const cuisine = r.cuisine || r.origin || 'Other';
    stats.cuisineCounts[cuisine] = (stats.cuisineCounts[cuisine] || 0) + 1;
  });

  saveStats(stats);
}

/**
 * Records a recipe being opened/viewed.
 * @param {string} recipeTitle
 */
function recordRecipeOpen(recipeTitle) {
  if (!recipeTitle) return;
  const stats = loadStats();
  stats.recipeCounts[recipeTitle] = (stats.recipeCounts[recipeTitle] || 0) + 1;
  saveStats(stats);
}

/**
 * Updates the saved favorite count in stats.
 * @param {number} count
 */
function recordFavoriteCount(count) {
  const stats = loadStats();
  stats.favoriteCount = count;
  saveStats(stats);
}

/**
 * Returns the top N items from a frequency object.
 * @param {object} obj - e.g. { Italian: 5, Mexican: 2 }
 * @param {number} n
 * @returns {Array<{ name: string, count: number }>}
 */
function getTopN(obj, n = 3) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

/**
 * Clears all stats (reset).
 */
function clearStats() {
  localStorage.removeItem(STATS_KEY);
}
