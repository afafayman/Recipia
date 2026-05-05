/* ═══════════════════════════════════════════════════════════
   RECIPIA — Main App
═══════════════════════════════════════════════════════════ */

const state = {
  currentLang:         'en',
  currentTheme:        'light',
  currentPage:         'home',
  uploadedImages:      [],
  allRecipes:          [],
  detectedIngredients: [],
  favorites:           loadFavorites(),
  filters:             { difficulty: 'all', search: '' },
  activeCategoryId:    null,
  categoryRecipes:     [],
  categoryFilters:     { difficulty: 'all', search: '' },
};

const t = () => TRANSLATIONS[state.currentLang];

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  restorePreferences();
  wireEvents();
});

function restorePreferences() {
  const theme = localStorage.getItem('recipia_theme') || 'light';
  const lang  = localStorage.getItem('recipia_lang')  || 'en';
  setTheme(theme);
  state.currentLang = lang;
  document.body.classList.toggle('ar', lang === 'ar');
  document.documentElement.lang = lang;
  applyTranslations(t());
}

/* ── WIRE EVENTS ── */
function wireEvents() {
  // Logo
  document.getElementById('logoBtn').addEventListener('click', () => showPage('home'));

  // Desktop nav
  document.getElementById('nav-home').addEventListener('click',       () => showPage('home'));
  document.getElementById('nav-categories').addEventListener('click', () => showPage('categories'));
  document.getElementById('nav-stats').addEventListener('click',      () => showPage('stats'));
  document.getElementById('nav-fav').addEventListener('click',        () => showPage('favorites'));

  // Theme & Lang
  document.getElementById('themeBtn').addEventListener('click',      toggleTheme);
  document.getElementById('langBtn').addEventListener('click',       toggleLang);
  document.getElementById('mobileThemeBtn').addEventListener('click',toggleTheme);
  document.getElementById('mobileLangBtn').addEventListener('click', toggleLang);

  // Mobile nav
  document.getElementById('hamburger').addEventListener('click',       openMobileNav);
  document.getElementById('mobileNavClose').addEventListener('click',  closeMobileNav);
  document.getElementById('mobileNav').addEventListener('click', (e) => {
    if (e.target === document.getElementById('mobileNav')) closeMobileNav();
  });
  document.getElementById('mnav-home-btn').addEventListener('click',       () => { showPage('home');       closeMobileNav(); });
  document.getElementById('mnav-categories-btn').addEventListener('click', () => { showPage('categories'); closeMobileNav(); });
  document.getElementById('mnav-stats-btn').addEventListener('click',      () => { showPage('stats');      closeMobileNav(); });
  document.getElementById('mnav-fav-btn').addEventListener('click',        () => { showPage('favorites');  closeMobileNav(); });

  // Search
  document.getElementById('findBtn').addEventListener('click', handleFindRecipes);
  document.getElementById('ingredientInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFindRecipes(); }
  });

  // Tabs
  document.getElementById('tab-text').addEventListener('click',  () => switchTab('text'));
  document.getElementById('tab-image').addEventListener('click', () => switchTab('image'));

  // Image upload
  document.getElementById('imgInput').addEventListener('change',   handleImageUpload);
  document.getElementById('analyzeBtn').addEventListener('click',  handleAnalyseImages);

  // Drag & drop
  const dz = document.getElementById('dropZone');
  dz.addEventListener('dragover',  (e) => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', ()  => dz.classList.remove('drag-over'));
  dz.addEventListener('drop',      handleDrop);

  // Modal close
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Results delegation
  document.getElementById('results').addEventListener('click',  handleResultsClick);
  document.getElementById('results').addEventListener('input',  handleResultsInput);
  document.getElementById('results').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('recipe-card')) handleOpenModal(e.target.dataset.id);
  });

  // Category grid delegation
  document.getElementById('categoryGrid').addEventListener('click', handleCategoryClick);

  // Category results delegation
  document.getElementById('categoryResults').addEventListener('click', handleCategoryResultsClick);
  document.getElementById('categoryResults').addEventListener('input', handleCategoryResultsInput);

  // Favorites delegation
  document.getElementById('favGrid').addEventListener('click', handleFavGridClick);

  // Stats reset
  document.getElementById('statsGrid').addEventListener('click', (e) => {
    if (e.target.id === 'resetStatsBtn') { clearStats(); renderStatsPage(t(), state.favorites.length); }
  });
}

/* ── MOBILE NAV ── */
function openMobileNav()  { document.getElementById('mobileNav').classList.add('open');    document.body.style.overflow = 'hidden'; }
function closeMobileNav() { document.getElementById('mobileNav').classList.remove('open'); document.body.style.overflow = ''; }

/* ── PAGE NAV ── */
function showPage(page) {
  state.currentPage = page;
  ['home','categories','stats','favorites'].forEach(p => {
    const el = document.getElementById(`page-${p}`);
    if (el) el.classList.toggle('active', p === page);
  });
  requestAnimationFrame(() => {
    if (page === 'favorites')  renderFavorites(state.favorites, t());
    if (page === 'categories') renderCategoryGrid(state.currentLang);
    if (page === 'stats')      renderStatsPage(t(), state.favorites.length);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── TABS ── */
function switchTab(tab) {
  const isText = tab === 'text';
  document.getElementById('panel-text').hidden  = !isText;
  document.getElementById('panel-image').hidden = isText;
  document.getElementById('tab-text').classList.toggle('active', isText);
  document.getElementById('tab-image').classList.toggle('active', !isText);
  document.getElementById('tab-text').setAttribute('aria-selected',  String(isText));
  document.getElementById('tab-image').setAttribute('aria-selected', String(!isText));
}

/* ── THEME ── */
function toggleTheme() { setTheme(state.currentTheme === 'light' ? 'dark' : 'light'); }
function setTheme(theme) {
  state.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  const icon = theme === 'dark' ? '☀️' : '🌙';
  document.getElementById('themeBtn').textContent       = icon;
  document.getElementById('mobileThemeBtn').textContent = icon;
  localStorage.setItem('recipia_theme', theme);
}

/* ── LANGUAGE ── */
function toggleLang() {
  const next = state.currentLang === 'en' ? 'ar' : 'en';
  state.currentLang = next;
  document.body.classList.toggle('ar', next === 'ar');
  document.documentElement.lang = next;
  localStorage.setItem('recipia_lang', next);
  applyTranslations(t());
  if (state.allRecipes.length)      refreshResults();
  if (state.categoryRecipes.length) refreshCategoryResults();
  renderFavorites(state.favorites, t());
  if (state.currentPage === 'stats')      renderStatsPage(t(), state.favorites.length);
  if (state.currentPage === 'categories') renderCategoryGrid(next);
}

/* ── RESULTS DELEGATION ── */
function handleResultsClick(e) {
  const favBtn    = e.target.closest('[data-fav]');
  const viewBtn   = e.target.closest('[data-view]');
  const card      = e.target.closest('.recipe-card');
  const filterBtn = e.target.closest('[data-filter]');
  if (favBtn)        { e.stopPropagation(); handleToggleFav(favBtn.dataset.fav); }
  else if (viewBtn)  { e.stopPropagation(); handleOpenModal(viewBtn.dataset.view); }
  else if (card)     { handleOpenModal(card.dataset.id); }
  else if (filterBtn){ state.filters.difficulty = filterBtn.dataset.filter; refreshResults(); }
}
function handleResultsInput(e) {
  if (e.target.id === 'searchBox') { state.filters.search = e.target.value; refreshResults(); }
}

/* ── CATEGORY DELEGATION ── */
function handleCategoryClick(e) {
  const card = e.target.closest('[data-cat-id]');
  if (card) handleCategorySelect(card.dataset.catId);
}
function handleCategoryResultsClick(e) {
  const favBtn    = e.target.closest('[data-fav]');
  const viewBtn   = e.target.closest('[data-view]');
  const card      = e.target.closest('.recipe-card');
  const filterBtn = e.target.closest('[data-filter]');
  if (favBtn)        { e.stopPropagation(); handleToggleFav(favBtn.dataset.fav); }
  else if (viewBtn)  { e.stopPropagation(); handleOpenModalFromCategory(viewBtn.dataset.view); }
  else if (card)     { handleOpenModalFromCategory(card.dataset.id); }
  else if (filterBtn){ state.categoryFilters.difficulty = filterBtn.dataset.filter; refreshCategoryResults(); }
}
function handleCategoryResultsInput(e) {
  if (e.target.id === 'searchBox') { state.categoryFilters.search = e.target.value; refreshCategoryResults(); }
}
function handleOpenModalFromCategory(id) {
  const recipe = [...state.categoryRecipes, ...state.favorites].find(r => r.id === id);
  if (recipe) { recordRecipeOpen(recipe.title); trackRecipeOpen(recipe.title, recipe.emoji).catch(()=>{}); openModal(recipe, t()); }
}

/* ── FAV DELEGATION ── */
function handleFavGridClick(e) {
  const favBtn  = e.target.closest('[data-fav]');
  const viewBtn = e.target.closest('[data-view]');
  const card    = e.target.closest('.recipe-card');
  if (favBtn)       { e.stopPropagation(); handleToggleFav(favBtn.dataset.fav); }
  else if (viewBtn) { e.stopPropagation(); handleOpenModal(viewBtn.dataset.view, true); }
  else if (card)    { handleOpenModal(card.dataset.id, true); }
}

/* ── FIND RECIPES ── */
async function handleFindRecipes() {
  const raw = document.getElementById('ingredientInput').value.trim();
  if (!raw) return;
  const ingredients = raw.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  showSkeletons(6);
  updateLoadingMsg(t().loading2);
  try {
    const lang = state.currentLang === 'ar' ? 'Arabic' : 'English';
    let data = null;
    try { data = await getCachedRecipes(ingredients); } catch { data = null; }
    if (!data) {
      data = await fetchRecipes(ingredients, lang, t());
      cacheRecipes(ingredients, data).catch(() => {});
    }
    trackSearch(data.recipes).catch(() => {});
    state.allRecipes          = data.recipes;
    state.detectedIngredients = data.detectedIngredients;
    state.filters             = { difficulty: 'all', search: '' };
    recordSearch(data.recipes);
    renderResults(data, state.favorites, state.filters, t());
  } catch (err) {
    if (err.message === '__not_food__') showError(t().notFoodTitle, getRandomRejectionMessage(t()));
    else showError(t().wrongTitle, t().errorRecipes + err.message);
  }
}

/* ── ANALYSE IMAGES ── */
async function handleAnalyseImages() {
  if (!state.uploadedImages.length) return;
  showSkeletons(6);
  updateLoadingMsg(t().loading1);
  try {
    const ingredients = await detectIngredientsFromImage(state.uploadedImages);
    const lang        = state.currentLang === 'ar' ? 'Arabic' : 'English';
    const data        = await fetchRecipes(ingredients, lang, t());
    trackSearch(data.recipes).catch(() => {});
    state.allRecipes          = data.recipes;
    state.detectedIngredients = data.detectedIngredients;
    state.filters             = { difficulty: 'all', search: '' };
    recordSearch(data.recipes);
    renderResults(data, state.favorites, state.filters, t());
  } catch (err) {
    if (err.message === '__not_food__') showError(t().notFoodTitle, getRandomRejectionMessage(t()));
    else showError(t().wrongTitle, t().errorImg + err.message);
  }
}

/* ── IMAGE HANDLING ── */
function handleImageUpload(e) { Array.from(e.target.files).forEach(addImageFile); }
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('drag-over');
  Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).forEach(addImageFile);
}
function addImageFile(file) {
  const v = validateImageFile(file);
  if (!v.valid) { showError('Invalid Image', `"${file.name}" ${t()[v.errorKey]}`); return; }
  const reader = new FileReader();
  reader.onload = (ev) => { state.uploadedImages.push({ file, dataUrl: ev.target.result }); renderImagePreviews(); };
  reader.readAsDataURL(file);
}
function renderImagePreviews() {
  const grid = document.getElementById('previewGrid');
  grid.innerHTML = state.uploadedImages.map((img, i) => `
    <div class="preview-img-wrap">
      <img src="${img.dataUrl}" alt="Ingredient photo ${i+1}"/>
      <button class="remove-img" data-remove="${i}" aria-label="Remove image">×</button>
    </div>`).join('');
  grid.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => { state.uploadedImages.splice(Number(btn.dataset.remove), 1); renderImagePreviews(); });
  });
  document.getElementById('analyzeBtn').style.display = state.uploadedImages.length ? 'flex' : 'none';
}

/* ── CATEGORIES ── */
async function handleCategorySelect(catId) {
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) return;
  state.activeCategoryId = catId;
  state.categoryFilters  = { difficulty: 'all', search: '' };
  document.querySelectorAll('.category-card').forEach(c => {
    c.classList.toggle('active', c.dataset.catId === catId);
  });
  const catName = state.currentLang === 'ar' ? cat.nameAr : cat.name;
  showCategoryLoading(catName, t());
  try {
    const lang        = state.currentLang === 'ar' ? 'Arabic' : 'English';
    const cuisineName = state.currentLang === 'ar' ? cat.nameAr : cat.name;
    const data        = await fetchRecipes(cat.ingredient.split(', '), lang, t(), cuisineName);
    state.categoryRecipes = data.recipes;
    recordSearch(data.recipes);
    renderResults(data, state.favorites, state.categoryFilters, t(), 'categoryResults');
  } catch (err) {
    document.getElementById('categoryResults').innerHTML = `
      <div class="loading-state" role="alert">
        <div style="font-size:44px;margin-bottom:14px">⚠️</div>
        <h3 style="color:var(--coral)">${t().wrongTitle}</h3>
        <p>${t().errorRecipes + err.message}</p>
      </div>`;
  }
}
function refreshCategoryResults() {
  if (!state.categoryRecipes.length) return;
  renderResults({ detectedIngredients: [], recipes: state.categoryRecipes }, state.favorites, state.categoryFilters, t(), 'categoryResults');
}

/* ── FAVORITES ── */
function handleToggleFav(id) {
  const recipe = [...state.allRecipes, ...state.categoryRecipes, ...state.favorites].find(r => r.id === id);
  if (!recipe) return;
  state.favorites = toggleFavorite(state.favorites, recipe);
  saveFavorites(state.favorites);
  recordFavoriteCount(state.favorites.length);
  refreshResults();
  refreshCategoryResults();
  renderFavorites(state.favorites, t());
}
function handleOpenModal(id, fromFav = false) {
  const pool   = fromFav ? state.favorites : [...state.allRecipes, ...state.favorites];
  const recipe = pool.find(r => r.id === id);
  if (recipe) { recordRecipeOpen(recipe.title); trackRecipeOpen(recipe.title, recipe.emoji).catch(()=>{}); openModal(recipe, t()); }
}
function refreshResults() {
  if (!state.allRecipes.length) return;
  renderResults({ detectedIngredients: state.detectedIngredients, recipes: state.allRecipes }, state.favorites, state.filters, t());
}
