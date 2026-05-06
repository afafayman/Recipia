/* ═══════════════════════════════════════════════════════════
   RECIPIA — UI Module
═══════════════════════════════════════════════════════════ */

/* ── APPLY TRANSLATIONS ── */
function applyTranslations(tx) {
  const s = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const h = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML   = val; };

  s('logoTagline',    tx.tagline);
  s('eyebrow',        tx.eyebrow);
  h('heroTitle',      tx.heroTitle);
  s('heroSubtitle',   tx.heroSub);
  s('tabTextLabel',   tx.tabText);
  s('tabImgLabel',    tx.tabImg);
  s('findBtnLabel',   tx.findBtn);
  s('inputHint',      tx.inputHint);
  s('uploadTitle',    tx.uploadTitle);
  s('uploadSub',      tx.uploadSub);
  s('analyzeBtnLabel',tx.analyzeBtn);
  s('langBtn',        tx.langBtn);
  s('mobileLangBtn',  tx.langBtn);
  s('footerText',     tx.footerText);
  s('nav-home',       tx.navExplore);
  s('nav-categories', tx.navCategories);
  s('nav-stats',      tx.navStats);
  s('nav-fav',        tx.navFavorites);
  s('mnav-home',      tx.navExplore);
  s('mnav-categories',tx.navCategories);
  s('mnav-stats',     tx.navStats);
  s('mnav-fav',       tx.navFavorites);
  s('catTitleMain',   tx.catTitleMain);
  s('catTitleSub',    tx.catTitleSub);
  s('catSubtitle',    tx.catSubtitle);
  s('statsTitleMain', tx.statsTitleMain);
  s('statsTitleSub',  tx.statsTitleSub);
  s('statsSubtitle',  tx.statsSubtitle);
  s('favTitleMain',   tx.favTitleMain);
  s('favTitleSub',    tx.favTitleSub);
  s('favSubtitle',    tx.favSub);

  const authBtn = document.getElementById('authBtn');
  if (authBtn && !authBtn.classList.contains('signed-in')) authBtn.textContent = 'Sign In';
}

/* ── SKELETON LOADER ── */
function showSkeletons(count = 6) {
  const el    = document.getElementById('results');
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
    </div>`).join('');

  el.innerHTML = `
    <div class="loading-state" style="padding-bottom:0">
      <div class="chef-spinner">👨‍🍳</div>
      <h3 id="loadingMsg">Working the kitchen…</h3>
      <div class="loading-dots"><span></span><span></span><span></span></div>
    </div>
    <div class="skeleton-grid">${cards}</div>`;
  el.scrollIntoView({ behavior:'smooth', block:'start' });
}

function updateLoadingMsg(msg) {
  const el = document.getElementById('loadingMsg');
  if (el) el.textContent = msg;
}

/* ── ERROR STATE ── */
function showError(title, msg) {
  const el = document.getElementById('results');
  if (el) el.innerHTML = `
    <div class="loading-state">
      <div style="font-size:44px;margin-bottom:14px">⚠️</div>
      <h3 style="color:var(--coral)">${title}</h3>
      <p>${msg}</p>
    </div>`;
}

/* ── FILTER HELPER ── */
function applyFilters(recipes, filters) {
  const search = (filters.search || '').toLowerCase();
  return recipes.filter(r => {
    const ms = !search
      || r.title.toLowerCase().includes(search)
      || (r.cuisine||'').toLowerCase().includes(search)
      || (r.origin||'').toLowerCase().includes(search);
    const md = filters.difficulty === 'all'
      || (r.difficulty||'').toLowerCase().startsWith(filters.difficulty.toLowerCase().slice(0,3));
    return ms && md;
  });
}

/* ── RENDER RESULTS ── */
function renderResults(data, favorites, filters, tx, targetId = 'results') {
  const { detectedIngredients = [], recipes = [] } = data;
  const filtered   = applyFilters(recipes, filters);
  const smartCount = recipes.filter(r => r.isSmart).length;
  const el         = document.getElementById(targetId);
  if (!el) return;

  el.innerHTML = `
    <div class="results-top">
      <div>
        <div class="results-title">${tx.foundRecipes} <span>${filtered.length}</span> ${tx.forYou}</div>
        <div class="results-meta">${tx.basedOn} ${detectedIngredients.length} ${tx.ingredients} · ${smartCount} ${tx.smartSugg}</div>
      </div>
    </div>
    <div class="filters-row">
      <input class="search-box" id="searchBox" placeholder="${tx.searchPlaceholder}" value="${filters.search||''}"/>
      <button class="filter-btn ${filters.difficulty==='all'   ?'active':''}" data-filter="all">${tx.allFilter}</button>
      <button class="filter-btn ${filters.difficulty==='Easy'  ?'active':''}" data-filter="Easy">${tx.easyFilter}</button>
      <button class="filter-btn ${filters.difficulty==='Medium'?'active':''}" data-filter="Medium">${tx.mediumFilter}</button>
      <button class="filter-btn ${filters.difficulty==='Hard'  ?'active':''}" data-filter="Hard">${tx.hardFilter}</button>
    </div>
    ${detectedIngredients.length ? `
    <div class="detected-ingredients">
      <div class="detected-label">${tx.yourIngredients}</div>
      <div class="chip-row">${detectedIngredients.map(i=>`<span class="chip">${i}</span>`).join('')}</div>
    </div>` : ''}
    <div class="recipe-grid">${filtered.map((r,i)=>renderCard(r,i,favorites,tx)).join('')}</div>`;
}

/* ── RECIPE CARD ── */
function renderCard(recipe, index, favorites, tx) {
  const fav = isFavorite(favorites, recipe.id);
  return `
    <article class="recipe-card" style="animation-delay:${index*50}ms"
      data-id="${recipe.id}" tabindex="0" role="button">
      <button class="fav-btn ${fav?'active':''}" data-fav="${recipe.id}">
        ${fav?'❤️':'🤍'}
      </button>
      <div class="card-header">
        <div class="card-origin">🌍 ${recipe.origin||''}</div>
        <div class="card-badges">
          <span class="badge time">⏱ ${recipe.cookTime||''}</span>
          <span class="badge diff">${recipe.difficulty||''}</span>
          ${recipe.isSmart?'<span class="badge smart">✨ Smart</span>':''}
        </div>
      </div>
      <span class="card-emoji">${recipe.emoji||'🍽️'}</span>
      <div class="card-body">
        <h2 class="card-title">${recipe.title||''}</h2>
        <p class="card-desc">${recipe.description||''}</p>
        ${recipe.isSmart&&recipe.smartSuggestion?`<div class="smart-suggestion">${recipe.smartSuggestion}</div>`:''}
        ${recipe.nutrition?`
          <div class="nutrition-row">
            <span class="nut-badge">🔥 ${recipe.nutrition.calories} kcal</span>
            <span class="nut-badge">💪 ${recipe.nutrition.protein}</span>
            <span class="nut-badge">🌾 ${recipe.nutrition.carbs}</span>
          </div>`:''}
        <div class="card-ingredients">
          ${(recipe.availableIngredients||[]).slice(0,4).map(i=>`<span class="ing-chip">${i}</span>`).join('')}
          ${(recipe.missingIngredients||[]).slice(0,2).map(i=>`<span class="ing-chip missing">${i}</span>`).join('')}
        </div>
        <div class="card-footer">
          <button class="view-recipe-btn" data-view="${recipe.id}">${tx.viewRecipe}</button>
          <div class="match-score">${tx.match}: <strong>${recipe.matchScore||0}%</strong></div>
        </div>
      </div>
    </article>`;
}

/* ── CATEGORIES ── */
function renderCategoryGrid(lang) {
  const grid = document.getElementById('categoryGrid');
  if (!grid || !CATEGORIES) return;
  grid.innerHTML = CATEGORIES.map(cat => `
    <div class="category-card" data-cat-id="${cat.id}" role="button" tabindex="0">
      <span class="cat-emoji">${cat.emoji}</span>
      <span class="cat-name">${lang === 'ar' ? cat.nameAr : cat.name}</span>
    </div>`).join('');
}

function showCategoryLoading(catName, tx) {
  const el = document.getElementById('categoryResults');
  if (!el) return;
  el.innerHTML = `
    <div class="loading-state">
      <div class="chef-spinner">👨‍🍳</div>
      <h3>${tx.catLoading} ${catName}…</h3>
      <div class="loading-dots"><span></span><span></span><span></span></div>
    </div>`;
}

/* ── STATS PAGE ── */
async function renderStatsPage(tx, favCount, activeTab = 'global') {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;

  // Update tab UI
  document.querySelectorAll('.stats-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === activeTab);
  });

  grid.innerHTML = `
    <div class="loading-state" style="padding:40px">
      <div class="chef-spinner">👨‍🍳</div>
      <h3 style="color:var(--coral)">Loading stats…</h3>
    </div>`;

  if (activeTab === 'global') {
    await renderGlobalStats(grid, tx);
  } else {
    await renderPersonalStats(grid, tx, favCount);
  }
}

async function renderGlobalStats(grid, tx) {
  const global      = await fetchGlobalStats();
  const topCuisines = getTopNGlobal(global.cuisineCounts, 5);
  const topRecipes  = getTopNGlobal(global.recipeCounts,  5);
  const topCuisine  = topCuisines[0];
  const topRecipe   = topRecipes[0];
  const noData      = global.totalSearches === 0;

  grid.innerHTML = `
    <div class="stats-global-banner">${tx.statsGlobal}</div>
    <div class="stats-summary">
      <div class="stat-card">
        <div class="stat-icon">🔍</div>
        <div class="stat-value">${global.totalSearches}</div>
        <div class="stat-label">${tx.statSearches}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🌍</div>
        <div class="stat-value stat-value-sm">${topCuisine ? topCuisine.name : '—'}</div>
        <div class="stat-label">${tx.statTopCuisine}</div>
      </div>
      <div class="stat-card" style="grid-column:span 2">
        <div class="stat-icon">🏆</div>
        <div class="stat-value stat-value-sm">${topRecipe ? (global.recipeEmojis?.[topRecipe.name]||'') + ' ' + topRecipe.name : '—'}</div>
        <div class="stat-label">${tx.statTopRecipe}</div>
      </div>
    </div>

    ${noData ? `
      <div class="empty-state"><div class="empty-icon">📊</div><h3>${tx.statNoData}</h3></div>` : `
    <div class="stats-section">
      <div class="stats-section-title">${tx.statTopIngredients}</div>
      <div class="stats-bar-list">
        ${topCuisines.map((c,i) => {
          const pct = Math.round((c.count / (topCuisines[0]?.count||1)) * 100);
          return `
            <div class="stats-bar-row">
              <div class="stats-bar-label">${c.name}</div>
              <div class="stats-bar-track">
                <div class="stats-bar-fill" style="width:${pct}%;animation-delay:${i*100}ms"></div>
              </div>
              <div class="stats-bar-count">${c.count}x</div>
            </div>`;
        }).join('')}
      </div>
    </div>
    <div class="stats-section">
      <div class="stats-section-title">${tx.statRecentRecipes}</div>
      <div class="stats-recipe-list">
        ${topRecipes.map((r,i) => `
          <div class="stats-recipe-row">
            <div class="stats-recipe-rank">${i+1}</div>
            <div class="stats-recipe-name">${global.recipeEmojis?.[r.name]||''} ${r.name}</div>
            <div class="stats-recipe-count">${r.count} ${tx.statTimes}</div>
          </div>`).join('')}
      </div>
    </div>`}`;
}

async function renderPersonalStats(grid, tx, favCount) {
  const user = getUser();

  if (!user) {
    grid.innerHTML = `
      <div class="stats-login-prompt">
        <div class="prompt-icon">👤</div>
        <h3>Sign in to see your stats</h3>
        <p>Track your searches, favorite cuisines, and most opened recipes.</p>
        <button class="btn-primary" id="statsSignInBtn" style="margin:0 auto">Sign In</button>
      </div>`;
    document.getElementById('statsSignInBtn')?.addEventListener('click', () => openAuthModal());
    return;
  }

  const personal    = await fetchPersonalStats(getUserId());
  const topCuisines = getTopNGlobal(personal.cuisineCounts, 5);
  const topRecipes  = getTopNGlobal(personal.recipeCounts,  5);
  const noData      = personal.totalSearches === 0;

  grid.innerHTML = `
    <div class="stats-global-banner">👤 ${tx.statsPersonal || 'Your personal activity'} · ${getUsername()}</div>
    <div class="stats-summary">
      <div class="stat-card">
        <div class="stat-icon">🔍</div>
        <div class="stat-value">${personal.totalSearches}</div>
        <div class="stat-label">${tx.statSearches}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">❤️</div>
        <div class="stat-value">${favCount}</div>
        <div class="stat-label">${tx.statFavorites}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🌍</div>
        <div class="stat-value stat-value-sm">${topCuisines[0] ? topCuisines[0].name : '—'}</div>
        <div class="stat-label">${tx.statTopCuisine}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-value stat-value-sm">${topRecipes[0] ? topRecipes[0].name : '—'}</div>
        <div class="stat-label">${tx.statTopRecipe}</div>
      </div>
    </div>

    ${noData ? `
      <div class="empty-state"><div class="empty-icon">📊</div><h3>${tx.statNoData}</h3></div>` : `
    <div class="stats-section">
      <div class="stats-section-title">${tx.statTopIngredients}</div>
      <div class="stats-bar-list">
        ${topCuisines.map((c,i) => {
          const pct = Math.round((c.count / (topCuisines[0]?.count||1)) * 100);
          return `
            <div class="stats-bar-row">
              <div class="stats-bar-label">${c.name}</div>
              <div class="stats-bar-track">
                <div class="stats-bar-fill" style="width:${pct}%;animation-delay:${i*100}ms"></div>
              </div>
              <div class="stats-bar-count">${c.count}x</div>
            </div>`;
        }).join('')}
      </div>
    </div>
    <div class="stats-section">
      <div class="stats-section-title">${tx.statRecentRecipes}</div>
      <div class="stats-recipe-list">
        ${topRecipes.map((r,i) => `
          <div class="stats-recipe-row">
            <div class="stats-recipe-rank">${i+1}</div>
            <div class="stats-recipe-name">${r.name}</div>
            <div class="stats-recipe-count">${r.count} ${tx.statTimes}</div>
          </div>`).join('')}
      </div>
    </div>`}`;
}
}

/* ── FAVORITES ── */
function renderFavorites(favorites, tx) {
  const grid = document.getElementById('favGrid');
  if (!grid) return;
  if (!favorites.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🤍</div>
        <h3>${tx.emptyFav}</h3>
        <p>${tx.emptyFavSub}</p>
      </div>`;
    return;
  }
  grid.innerHTML = `<div class="recipe-grid">${favorites.map((r,i)=>renderCard(r,i,favorites,tx)).join('')}</div>`;
}

/* ── MODAL ── */
function openModal(recipe, tx) {
  const inner = document.getElementById('modalInner');
  if (!inner) return;
  inner.innerHTML = `
    <div class="modal-header">
      <div>
        <div class="modal-origin-line">
          <span class="modal-origin-badge">🌍 ${recipe.origin||''}</span>
          <span style="font-size:12px;color:var(--text-dim)">${recipe.cuisine||''}</span>
        </div>
        <h2 class="modal-title">${recipe.emoji||''} ${recipe.title||''}</h2>
      </div>
      <button class="modal-close" id="modalCloseBtn">×</button>
    </div>
    <div class="modal-body">
      <p class="modal-desc">${recipe.description||''}</p>
      ${recipe.isSmart&&recipe.smartSuggestion?`<div class="smart-suggestion" style="margin-bottom:18px">${recipe.smartSuggestion}</div>`:''}

      <div class="modal-section-title">${tx.atAGlance}</div>
      <div class="modal-meta">
        <div class="meta-item"><div class="meta-value">${recipe.prepTime||'—'}</div><div class="meta-label">${tx.prep}</div></div>
        <div class="meta-item"><div class="meta-value">${recipe.cookTime||'—'}</div><div class="meta-label">${tx.cook}</div></div>
        <div class="meta-item"><div class="meta-value">${recipe.servings||'—'}</div><div class="meta-label">${tx.servings}</div></div>
        <div class="meta-item"><div class="meta-value">${recipe.difficulty||'—'}</div><div class="meta-label">${tx.difficulty}</div></div>
        <div class="meta-item"><div class="meta-value" style="color:var(--mint-dim)">${recipe.matchScore||0}%</div><div class="meta-label">${tx.match}</div></div>
      </div>

      ${recipe.nutrition?`
        <div class="modal-section-title">${tx.nutritionSection}</div>
        <div class="nutrition-grid">
          <div class="nut-item"><div class="nut-value">${recipe.nutrition.calories}</div><div class="nut-label">${tx.calories}</div></div>
          <div class="nut-item"><div class="nut-value">${recipe.nutrition.protein}</div><div class="nut-label">${tx.protein}</div></div>
          <div class="nut-item"><div class="nut-value">${recipe.nutrition.carbs}</div><div class="nut-label">${tx.carbs}</div></div>
          <div class="nut-item"><div class="nut-value">${recipe.nutrition.fat}</div><div class="nut-label">${tx.fat}</div></div>
        </div>`:''}

      <div class="modal-section-title">${tx.ingredientsSection}</div>
      <div class="ingredients-grid">
        ${(recipe.allIngredients||[]).map(i=>`
          <div class="ing-row">
            <span class="ing-check">${i.have?'✅':'❌'}</span>
            <span class="ing-name" style="${!i.have?'opacity:.5;text-decoration:line-through':''}">${i.name}</span>
            <span class="ing-amount">${i.amount||''}</span>
          </div>`).join('')}
      </div>

      <div class="modal-section-title">${tx.preparation}</div>
      <div class="steps-list">
        ${(recipe.steps||[]).map((s,i)=>`
          <div class="step-item">
            <div class="step-num">${String(i+1).padStart(2,'0')}</div>
            <div class="step-content">
              <div class="step-title">${s.title||''}</div>
              <p class="step-text">${s.instruction||''}</p>
            </div>
          </div>`).join('')}
      </div>

      ${recipe.tips?`
        <div class="chef-tip">
          <div class="chef-tip-label">${tx.chefTip}</div>
          <p class="chef-tip-text">${recipe.tips}</p>
        </div>`:''}
    </div>`;

  document.getElementById('modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.body.style.overflow = '';
}
