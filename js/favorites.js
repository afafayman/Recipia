/* ═══════════════════════════════════════════════════════════
   RECIPIA — Favorites Module
   Handles saving/loading favorites using localStorage.
═══════════════════════════════════════════════════════════ */

const FAVORITES_KEY = 'recipia_favs';

/**
 * Loads favorites from localStorage.
 * @returns {object[]}
 */
function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Persists the favorites array to localStorage.
 * @param {object[]} favorites
 */
function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.warn('Could not save favorites:', e);
  }
}

/**
 * Returns true if a recipe ID exists in the favorites list.
 * @param {object[]} favorites
 * @param {string} id
 * @returns {boolean}
 */
function isFavorite(favorites, id) {
  return favorites.some(f => f.id === id);
}

/**
 * Immutably adds or removes a recipe from the favorites list.
 * @param {object[]} favorites
 * @param {object} recipe
 * @returns {object[]} New favorites array
 */
function toggleFavorite(favorites, recipe) {
  const exists = favorites.some(f => f.id === recipe.id);
  return exists
    ? favorites.filter(f => f.id !== recipe.id)
    : [...favorites, recipe];
}
