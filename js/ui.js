/* ═══════════════════════════════════════════════════════════
   SAVORLY — UI Module
   All DOM rendering functions
═══════════════════════════════════════════════════════════ */

/* ── SKELETON LOADER ── */

/**
 * Renders skeleton loading cards while recipes are being fetched.
 * @param {number} count - Number of skeleton cards to show
 */
function showSkeletons(count = 6) {
  const el = document.getElementById('results');
  const cards = Array.from({ length: count }, () => `
    <div class="skeleton-card" aria-hidden="true">
      <div class="sk-header">
        <div class="skeleton-block sk-badge"></div>
        <div class="skeleton-block sk-badge2"></div>
      </div>
      <div class="skeleton-block sk-emoji"></div>
      <div class="skeleton-block sk-title"></div>
      <div class="skeleton-block sk-desc"></div>
      <div class="skeleton-block sk-desc2"></div>
      <div class="sk-chips">
        <div class="skeleton-block sk-chip"></div>
        <div class="skeleton-block sk-chip"></div>
        <div class="skeleton-block sk-chip"></div>
      </div>
      <div class="sk-footer">
        <div class="skeleton-block sk-btn"></div>
        <div class="skeleton-block sk-score"></div>
      </div>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="loading-state" style="padding-bottom:0">
      <div class="chef-spinner" aria-label="Loading">👨‍🍳</div>
      <h3 id="loadingMsg">Working the kitchen…</h3>
      <div class="loading-dots"><span></span><span></span><span></span></div>
    </div>
    <div class="skeleton-grid" role="status" aria-label="Loading recipes">${cards}</div>
  `;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Updates the loading message text (called while skeletons are showing).
 * @param {string} msg
 */
function updateLoadingMsg(msg) {
  const el = document.getElementById('loadingMsg');
  if (el) el.textContent = msg;
}

/* ── ERROR STATE ── */

/**
 * Renders an error message in the results area.
 * @param {string} title
 * @param {string} msg
 */
function showError(title, msg) {
  document.getElementById('results').innerHTML = `
    <div class="loading-state" role="alert">
      <div style="font-size:44px;margin-bottom:14px" aria-hidden="true">⚠️</div>
      <h3 style="color:var(--coral)">${title}</h3>
      <p>${msg}</p>
    </div>`;
}

/* ── RESULTS ── */

/**
 * Renders the full results section with filters and recipe cards.
 * @param {object} data - { detectedIngredients, recipes }
 * @param {object[]} favorites
 * @param {object} filters - { difficulty, search }
 * @param {object} tx - Translation strings
 */
function renderResults(data, favorites, filters, tx) {
  const { detectedIngredients, recipes } = data;
  const filtered = applyFilters(recipes, filters);
  const smartCount = recipes.filter(r => r.isSmart).length;

  document.getElementById('results').innerHTML = `
    <div class="results-top">
      <div>
        <div class="results-title">${tx.foundRecipes} <span>${filtered.length}</span> ${tx.forYou}</div>
        <div class="results-meta">${tx.basedOn} ${detectedIngredients.length} ${tx.ingredients} · ${smartCount} ${tx.smartSugg}</div>
      </div>
    </div>

    <div class="filters-row" role="group" aria-label="Filter recipes">
      <input
        class="search-box"
        id="searchBox"
        placeholder="${tx.searchPlaceholder}"
        value="${filters.search}"
        aria-label="${tx.searchPlaceholder}"
      />
      <button class="filter-btn ${filters.difficulty === 'all'    ? 'active' : ''}" data-filter="all">${tx.allFilter}</button>
      <button class="filter-btn ${filters.difficulty === 'Easy'   ? 'active' : ''}" data-filter="Easy">${tx.easyFilter}</button>
      <button class="filter-btn ${filters.difficulty === 'Medium' ? 'active' : ''}" data-filter="Medium">${tx.mediumFilter}</button>
      <button class="filter-btn ${filters.difficulty === 'Hard'   ? 'active' : ''}" data-filter="Hard">${tx.hardFilter}</button>
    </div>

    <div class="detected-ingredients">
      <div class="detected-label">${tx.yourIngredients}</div>
      <div class="chip-row">${detectedIngredients.map(i => `<span class="chip">${i}</span>`).join('')}</div>
    </div>

    <div class="recipe-grid" id="recipeGrid">
      ${filtered.map((r, i) => renderCard(r, i, favorites, tx)).join('')}
    </div>
  `;
}

/**
 * Filters recipes based on search text and difficulty.
 * @param {object[]} recipes
 * @param {object} filters
 * @returns {object[]}
 */
function applyFilters(recipes, filters) {
  const search = filters.search.toLowerCase();
  return recipes.filter(r => {
    const matchSearch = !search
      || r.title.toLowerCase().includes(search)
      || r.cuisine.toLowerCase().includes(search)
      || r.origin.toLowerCase().includes(search);
    const matchDiff = filters.difficulty === 'all'
      || r.difficulty.toLowerCase().startsWith(filters.difficulty.toLowerCase().slice(0, 3));
    return matchSearch && matchDiff;
  });
}

/* ── RECIPE CARD ── */

/**
 * Renders a single recipe card HTML string.
 * @param {object} recipe
 * @param {number} index - For staggered animation delay
 * @param {object[]} favorites
 * @param {object} tx
 * @returns {string} HTML string
 */
function renderCard(recipe, index, favorites, tx) {
  const fav = isFavorite(favorites, recipe.id);
  return `
    <article
      class="recipe-card"
      style="animation-delay:${index * 50}ms"
      data-id="${recipe.id}"
      aria-label="${recipe.title}"
      tabindex="0"
      role="button"
    >
      <button class="fav-btn ${fav ? 'active' : ''}" data-fav="${recipe.id}" aria-label="${fav ? 'Remove from favorites' : 'Add to favorites'}">
        ${fav ? '❤️' : '🤍'}
      </button>
      <div class="card-header">
        <div class="card-origin">🌍 ${recipe.origin}</div>
        <div class="card-badges">
          <span class="badge time">⏱ ${recipe.cookTime}</span>
          <span class="badge diff">${recipe.difficulty}</span>
          ${recipe.isSmart ? '<span class="badge smart">✨ Smart</span>' : ''}
        </div>
      </div>
      <span class="card-emoji" aria-hidden="true">${recipe.emoji}</span>
      <div class="card-body">
        <h2 class="card-title">${recipe.title}</h2>
        <p class="card-desc">${recipe.description}</p>
        ${recipe.isSmart && recipe.smartSuggestion
          ? `<div class="smart-suggestion">${recipe.smartSuggestion}</div>` : ''}
        ${recipe.nutrition
          ? `<div class="nutrition-row">
               <span class="nut-badge">🔥 ${recipe.nutrition.calories} kcal</span>
               <span class="nut-badge">💪 ${recipe.nutrition.protein}</span>
               <span class="nut-badge">🌾 ${recipe.nutrition.carbs}</span>
             </div>` : ''}
        <div class="card-ingredients">
          ${(recipe.availableIngredients || []).slice(0, 4).map(i => `<span class="ing-chip">${i}</span>`).join('')}
          ${(recipe.missingIngredients   || []).slice(0, 2).map(i => `<span class="ing-chip missing">${i}</span>`).join('')}
        </div>
        <div class="card-footer">
          <button class="view-recipe-btn" data-view="${recipe.id}">${tx.viewRecipe}</button>
          <div class="match-score">${tx.match}: <strong>${recipe.matchScore}%</strong></div>
        </div>
      </div>
    </article>`;
}

/* ── MODAL ── */

/**
 * Renders and shows the recipe detail modal.
 * @param {object} recipe
 * @param {object} tx
 */
function openModal(recipe, tx) {
  document.getElementById('modalInner').innerHTML = `
    <div class="modal-header">
      <div>
        <div class="modal-origin-line">
          <span class="modal-origin-badge">🌍 ${recipe.origin}</span>
          <span style="font-size:12px;color:var(--text-dim)">${recipe.cuisine}</span>
        </div>
        <h2 class="modal-title" id="modalTitle">${recipe.emoji} ${recipe.title}</h2>
      </div>
      <button class="modal-close" id="modalCloseBtn" aria-label="Close recipe">×</button>
    </div>
    <div class="modal-body">
      <p class="modal-desc">${recipe.description}</p>
      ${recipe.isSmart && recipe.smartSuggestion
        ? `<div class="smart-suggestion" style="margin-bottom:18px">${recipe.smartSuggestion}</div>` : ''}

      <div class="modal-section-title">${tx.atAGlance}</div>
      <div class="modal-meta">
        <div class="meta-item"><div class="meta-value">${recipe.prepTime}</div><div class="meta-label">${tx.prep}</div></div>
        <div class="meta-item"><div class="meta-value">${recipe.cookTime}</div><div class="meta-label">${tx.cook}</div></div>
        <div class="meta-item"><div class="meta-value">${recipe.servings}</div><div class="meta-label">${tx.servings}</div></div>
        <div class="meta-item"><div class="meta-value">${recipe.difficulty}</div><div class="meta-label">${tx.difficulty}</div></div>
        <div class="meta-item"><div class="meta-value" style="color:var(--mint-dim)">${recipe.matchScore}%</div><div class="meta-label">${tx.match}</div></div>
      </div>

      ${recipe.nutrition ? `
        <div class="modal-section-title">${tx.nutritionSection}</div>
        <div class="nutrition-grid">
          <div class="nut-item"><div class="nut-value">${recipe.nutrition.calories}</div><div class="nut-label">${tx.calories}</div></div>
          <div class="nut-item"><div class="nut-value">${recipe.nutrition.protein}</div><div class="nut-label">${tx.protein}</div></div>
          <div class="nut-item"><div class="nut-value">${recipe.nutrition.carbs}</div><div class="nut-label">${tx.carbs}</div></div>
          <div class="nut-item"><div class="nut-value">${recipe.nutrition.fat}</div><div class="nut-label">${tx.fat}</div></div>
        </div>` : ''}

      <div class="modal-section-title">${tx.ingredientsSection}</div>
      <div class="ingredients-grid">
        ${(recipe.allIngredients || []).map(i => `
          <div class="ing-row">
            <span class="ing-check">${i.have ? '✅' : '❌'}</span>
            <span class="ing-name" style="${!i.have ? 'opacity:0.5;text-decoration:line-through' : ''}">${i.name}</span>
            <span class="ing-amount">${i.amount}</span>
          </div>`).join('')}
      </div>

      <div class="modal-section-title">${tx.preparation}</div>
      <div class="steps-list">
        ${(recipe.steps || []).map((s, i) => `
          <div class="step-item">
            <div class="step-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</div>
            <div class="step-content">
              <div class="step-title">${s.title}</div>
              <p class="step-text">${s.instruction}</p>
            </div>
          </div>`).join('')}
      </div>

      ${recipe.tips ? `
        <div class="chef-tip">
          <div class="chef-tip-label">${tx.chefTip}</div>
          <p class="chef-tip-text">${recipe.tips}</p>
        </div>` : ''}
    </div>`;

  const overlay = document.getElementById('modal');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Close button inside modal
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
}

/**
 * Closes the recipe modal.
 */
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.body.style.overflow = '';
}

/* ── FAVORITES PAGE ── */

/**
 * Renders the favorites page.
 * @param {object[]} favorites
 * @param {object} tx
 */
function renderFavorites(favorites, tx) {
  const titleEl = document.getElementById('favTitle');
  const words = tx.favPageTitle.split(' ');
  titleEl.innerHTML = `${words[0]} <span>${words.slice(1).join(' ')}</span>`;
  document.getElementById('favSubtitle').textContent = tx.favSub;

  const grid = document.getElementById('favGrid');
  if (!favorites.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon" aria-hidden="true">🤍</div>
        <h3>${tx.emptyFav}</h3>
        <p>${tx.emptyFavSub}</p>
      </div>`;
    return;
  }
  grid.innerHTML = `<div class="recipe-grid">${favorites.map((r, i) => renderCard(r, i, favorites, tx)).join('')}</div>`;
}

/* ── TRANSLATIONS ── */

/**
 * Applies all translation strings to the DOM.
 * @param {object} tx
 */
function applyTranslations(tx) {
  document.getElementById('logoTagline').textContent    = tx.tagline;
  document.getElementById('eyebrow').textContent        = tx.eyebrow;
  document.getElementById('heroTitle').innerHTML        = tx.heroTitle;
  document.getElementById('heroSubtitle').textContent   = tx.heroSub;
  document.getElementById('tabTextLabel').textContent   = tx.tabText;
  document.getElementById('tabImgLabel').textContent    = tx.tabImg;
  document.getElementById('findBtnLabel').textContent   = tx.findBtn;
  document.getElementById('inputHint').textContent      = tx.inputHint;
  document.getElementById('uploadTitle').textContent    = tx.uploadTitle;
  document.getElementById('uploadSub').textContent      = tx.uploadSub;
  document.getElementById('analyzeBtnLabel').textContent = tx.analyzeBtn;
  document.getElementById('langBtn').textContent        = tx.langBtn;
  document.getElementById('footerText').textContent     = tx.footerText;
  document.getElementById('ingredientInput').placeholder = tx.inputPlaceholder;
}
