/* ═══════════════════════════════════════════════════════════
   SAVORLY — Favorites Module
   Handles saving/removing favorites using localStorage
═══════════════════════════════════════════════════════════ */

const FAVORITES_KEY = 'savorly_favs';

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
 * Saves favorites array to localStorage.
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
 * Checks if a recipe is in favorites.
 * @param {object[]} favorites
 * @param {string} id
 * @returns {boolean}
 */
function isFavorite(favorites, id) {
  return favorites.some(f => f.id === id);
}

/**
 * Toggles a recipe in the favorites list.
 * @param {object[]} favorites
 * @param {object} recipe
 * @returns {object[]} Updated favorites array
 */
function toggleFavorite(favorites, recipe) {
  const index = favorites.findIndex(f => f.id === recipe.id);
  if (index === -1) {
    return [...favorites, recipe];
  } else {
    return favorites.filter(f => f.id !== recipe.id);
  }
}
