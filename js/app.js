/* ═══════════════════════════════════════════════════════════
   SAVORLY — Main App
   Entry point. Manages state and wires up all events.
═══════════════════════════════════════════════════════════ */

/* ── APP STATE ── */
const state = {
  currentLang:    'en',
  currentTheme:   'light',
  currentPage:    'home',
  uploadedImages: [],
  allRecipes:     [],
  detectedIngredients: [],
  favorites:      loadFavorites(),
  filters:        { difficulty: 'all', search: '' },
};

/* ── HELPERS ── */
const t = () => TRANSLATIONS[state.currentLang];

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Restore saved theme
  const savedTheme = localStorage.getItem('savorly_theme') || 'light';
  setTheme(savedTheme);

  // Restore saved language
  const savedLang = localStorage.getItem('savorly_lang') || 'en';
  state.currentLang = savedLang;
  document.body.classList.toggle('ar', savedLang === 'ar');
  document.documentElement.lang = savedLang;
  applyTranslations(t());

  // Wire up events
  wireEvents();
});

/* ══════════════════════════════════════════════════════════
   EVENT WIRING
   All event listeners in one place (no inline onclick)
══════════════════════════════════════════════════════════ */
function wireEvents() {
  // Find recipes button
  document.getElementById('findBtn').addEventListener('click', handleFindRecipes);

  // Enter key in textarea
  document.getElementById('ingredientInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFindRecipes();
    }
  });

  // Image upload
  document.getElementById('imgInput').addEventListener('change', handleImageUpload);

  // Analyse images button
  document.getElementById('analyzeBtn').addEventListener('click', handleAnalyseImages);

  // Modal overlay click to close
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) closeModal();
  });

  // Results area — event delegation for cards, fav buttons, filter buttons, search
  document.getElementById('results').addEventListener('click', handleResultsClick);
  document.getElementById('results').addEventListener('input', handleResultsInput);

  // Favorites page — event delegation
  document.getElementById('favGrid').addEventListener('click', handleFavGridClick);

  // Drag and drop on upload zone
  const dz = document.getElementById('dropZone');
  dz.addEventListener('dragover',  (e) => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', ()  => dz.classList.remove('drag-over'));
  dz.addEventListener('drop',      handleDrop);

  // Keyboard accessibility: open card on Enter
  document.getElementById('results').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('recipe-card')) {
      handleOpenModal(e.target.dataset.id);
    }
  });

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ══════════════════════════════════════════════════════════
   EVENT HANDLERS
══════════════════════════════════════════════════════════ */

/** Handles clicks inside the results section via delegation */
function handleResultsClick(e) {
  const favBtn  = e.target.closest('[data-fav]');
  const viewBtn = e.target.closest('[data-view]');
  const card    = e.target.closest('.recipe-card');
  const filterBtn = e.target.closest('[data-filter]');

  if (favBtn) {
    e.stopPropagation();
    handleToggleFav(favBtn.dataset.fav);
  } else if (viewBtn) {
    e.stopPropagation();
    handleOpenModal(viewBtn.dataset.view);
  } else if (card) {
    handleOpenModal(card.dataset.id);
  } else if (filterBtn) {
    state.filters.difficulty = filterBtn.dataset.filter;
    refreshResults();
  }
}

/** Handles input in search box via delegation */
function handleResultsInput(e) {
  if (e.target.id === 'searchBox') {
    state.filters.search = e.target.value;
    refreshResults();
  }
}

/** Handles clicks inside the favorites grid */
function handleFavGridClick(e) {
  const favBtn = e.target.closest('[data-fav]');
  const viewBtn = e.target.closest('[data-view]');
  const card   = e.target.closest('.recipe-card');

  if (favBtn) {
    e.stopPropagation();
    handleToggleFav(favBtn.dataset.fav);
  } else if (viewBtn) {
    e.stopPropagation();
    handleOpenModal(viewBtn.dataset.view, true);
  } else if (card) {
    handleOpenModal(card.dataset.id, true);
  }
}

/** Finds recipes from typed ingredients */
async function handleFindRecipes() {
  const raw = document.getElementById('ingredientInput').value.trim();

  // Validate input before sending to AI
  const validation = validateIngredientInput(raw);
  if (!validation.valid) {
    showError('Invalid Input', validation.error);
    return;
  }

  const ingredients = raw.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  showSkeletons(6);
  updateLoadingMsg(t().loading2);

  try {
    const lang = state.currentLang === 'ar' ? 'Arabic' : 'English';
    const data = await fetchRecipes(ingredients, lang);
    state.allRecipes          = data.recipes;
    state.detectedIngredients = data.detectedIngredients;
    state.filters             = { difficulty: 'all', search: '' };
    renderResults(data, state.favorites, state.filters, t());
  } catch (err) {
    showError(t().wrongTitle, t().errorRecipes + err.message);
  }
}

/** Analyses uploaded images to detect ingredients */
async function handleAnalyseImages() {
  if (!state.uploadedImages.length) return;
  showSkeletons(6);
  updateLoadingMsg(t().loading1);

  try {
    const ingredients = await detectIngredientsFromImage();
    const lang = state.currentLang === 'ar' ? 'Arabic' : 'English';
    const data = await fetchRecipes(ingredients, lang);
    state.allRecipes          = data.recipes;
    state.detectedIngredients = data.detectedIngredients;
    state.filters             = { difficulty: 'all', search: '' };
    renderResults(data, state.favorites, state.filters, t());
  } catch (err) {
    showError(t().wrongTitle, t().errorImg + err.message);
  }
}

/** Handles image file selection */
function handleImageUpload(e) {
  Array.from(e.target.files).forEach(addImageFile);
}

/** Handles drag-and-drop image upload */
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('drag-over');
  Array.from(e.dataTransfer.files)
    .filter(f => f.type.startsWith('image/'))
    .forEach(addImageFile);
}

/** Reads an image file and adds it to state + preview */
function addImageFile(file) {
  // Validate image before accepting
  const validation = validateImageFile(file);
  if (!validation.valid) {
    showError('Invalid Image', validation.error);
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    state.uploadedImages.push({ file, dataUrl: ev.target.result });
    renderImagePreviews();
  };
  reader.readAsDataURL(file);
}

/** Re-renders the image preview grid */
function renderImagePreviews() {
  const grid = document.getElementById('previewGrid');
  grid.innerHTML = state.uploadedImages.map((img, i) => `
    <div class="preview-img-wrap">
      <img src="${img.dataUrl}" alt="Ingredient photo ${i + 1}"/>
      <button class="remove-img" data-remove="${i}" aria-label="Remove image">×</button>
    </div>`).join('');

  // Wire remove buttons
  grid.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.uploadedImages.splice(Number(btn.dataset.remove), 1);
      renderImagePreviews();
    });
  });

  document.getElementById('analyzeBtn').style.display =
    state.uploadedImages.length ? 'flex' : 'none';
}

/** Toggles a recipe in favorites */
function handleToggleFav(id) {
  const recipe = [...state.allRecipes, ...state.favorites].find(r => r.id === id);
  if (!recipe) return;
  state.favorites = toggleFavorite(state.favorites, recipe);
  saveFavorites(state.favorites);
  refreshResults();
  renderFavorites(state.favorites, t());
}

/** Opens the recipe modal */
function handleOpenModal(id, fromFav = false) {
  const source = fromFav
    ? state.favorites
    : [...state.allRecipes, ...state.favorites];
  const recipe = source.find(r => r.id === id);
  if (recipe) openModal(recipe, t());
}

/** Re-renders results with current state (filters, favorites) */
function refreshResults() {
  if (!state.allRecipes.length) return;
  renderResults(
    { detectedIngredients: state.detectedIngredients, recipes: state.allRecipes },
    state.favorites,
    state.filters,
    t()
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE NAVIGATION
══════════════════════════════════════════════════════════ */
function showPage(page) {
  state.currentPage = page;
  document.getElementById('page-home').classList.toggle('active', page === 'home');
  document.getElementById('page-favorites').classList.toggle('active', page === 'favorites');
  if (page === 'favorites') renderFavorites(state.favorites, t());
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════════════════════════
   TABS
══════════════════════════════════════════════════════════ */
function switchTab(tab) {
  const isText = tab === 'text';
  document.getElementById('panel-text').hidden  = !isText;
  document.getElementById('panel-image').hidden = isText;
  document.getElementById('tab-text').classList.toggle('active', isText);
  document.getElementById('tab-image').classList.toggle('active', !isText);
  document.getElementById('tab-text').setAttribute('aria-selected', isText);
  document.getElementById('tab-image').setAttribute('aria-selected', !isText);
}

/* ══════════════════════════════════════════════════════════
   THEME
══════════════════════════════════════════════════════════ */
function toggleTheme() {
  const next = state.currentTheme === 'light' ? 'dark' : 'light';
  setTheme(next);
}

function setTheme(theme) {
  state.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeBtn').textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('savorly_theme', theme);
}

/* ══════════════════════════════════════════════════════════
   LANGUAGE
══════════════════════════════════════════════════════════ */
function toggleLang() {
  const next = state.currentLang === 'en' ? 'ar' : 'en';
  state.currentLang = next;
  document.body.classList.toggle('ar', next === 'ar');
  document.documentElement.lang = next;
  localStorage.setItem('savorly_lang', next);
  applyTranslations(t());
  if (state.allRecipes.length) refreshResults();
  renderFavorites(state.favorites, t());
}
