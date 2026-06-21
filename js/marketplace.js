/* ============================================================
   BookVerse — Marketplace Module
   ============================================================ */

window.BV = window.BV || {};

BV.Marketplace = (() => {
  let currentFilters = { sort: 'newest' };
  let currentPage = 1;
  const PER_PAGE = 12;

  const render = (initialCategory, initialQuery) => {
    if (initialCategory) currentFilters.category = initialCategory;
    if (initialQuery) currentFilters.query = initialQuery;

    return `
      <div class="page-content">
        <div class="container">
          <div class="page-header">
            <div class="breadcrumb"><span onclick="BV.App.navigate('home')" style="cursor:pointer">Home</span><span class="sep">›</span><span>Marketplace</span></div>
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sp-4);flex-wrap:wrap">
              <div>
                <h1>📦 Book Marketplace</h1>
                <p>Discover pre-loved books from our community of sellers</p>
              </div>
              <button class="btn btn-gradient" id="list-book-btn" onclick="BV.Marketplace.showListingForm()">
                + List Your Book
              </button>
            </div>
          </div>

          <div class="browse-layout">
            <!-- Filter Sidebar -->
            <aside class="filter-sidebar" id="marketplace-filters">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-4)">
                <h4 style="font-size:var(--text-base)">Filters</h4>
                <button class="btn btn-ghost btn-sm" onclick="BV.Marketplace.resetFilters()">Reset</button>
              </div>

              <!-- Search -->
              <div class="filter-section" style="padding-top:0">
                <div class="search-bar" style="border-radius:var(--radius-md)">
                  <span class="search-icon">🔍</span>
                  <input type="text" id="mp-search" placeholder="Search listings..." value="${initialQuery||''}" oninput="BV.Marketplace.applyFilters()">
                </div>
              </div>

              <!-- Category -->
              <div class="filter-section">
                <div class="filter-title">Category <span class="toggle-icon">▾</span></div>
                <div class="filter-body">
                  ${['Fiction','Sci-Fi','Fantasy','Dystopian','Self-Help','History','Psychology','Finance','Science','Thriller','Romance','Biography'].map(cat => `
                    <label class="filter-check">
                      <label style="cursor:pointer;display:flex;align-items:center;gap:var(--sp-2)">
                        <input type="radio" name="mp-cat" value="${cat}" ${currentFilters.category===cat?'checked':''} onchange="BV.Marketplace.setFilter('category','${cat}')">
                        <span style="font-size:var(--text-sm);color:var(--clr-text-muted)">${cat}</span>
                      </label>
                      <span class="filter-count">${BV.Store.getListings().filter(l=>l.category===cat&&l.status==='active').length}</span>
                    </label>
                  `).join('')}
                  <label class="filter-check">
                    <label style="cursor:pointer;display:flex;align-items:center;gap:var(--sp-2)">
                      <input type="radio" name="mp-cat" value="" ${!currentFilters.category?'checked':''} onchange="BV.Marketplace.setFilter('category',null)">
                      <span style="font-size:var(--text-sm);color:var(--clr-text-muted)">All Categories</span>
                    </label>
                  </label>
                </div>
              </div>

              <!-- Condition -->
              <div class="filter-section">
                <div class="filter-title">Condition <span class="toggle-icon">▾</span></div>
                <div class="filter-body">
                  ${['New','Like New','Good','Fair','Poor'].map(cond => `
                    <label class="filter-check">
                      <label style="cursor:pointer;display:flex;align-items:center;gap:var(--sp-2)">
                        <input type="checkbox" value="${cond}" ${currentFilters.condition===cond?'checked':''} onchange="BV.Marketplace.setCondition('${cond}', this.checked)">
                        <span class="badge ${getBadgeClass(cond)}">${cond}</span>
                      </label>
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- Price Range -->
              <div class="filter-section">
                <div class="filter-title">Price Range <span class="toggle-icon">▾</span></div>
                <div class="filter-body">
                  <input type="range" id="mp-max-price" min="0" max="2000" value="${(currentFilters.maxPrice||24.99)*83}" step="50" oninput="BV.Marketplace.updatePriceRange(this.value)">
                  <div class="price-range-display"><span>₹0</span><span id="mp-price-display">₹${((currentFilters.maxPrice||24.99)*83).toFixed(0)}</span></div>
                </div>
              </div>
            </aside>

            <!-- Listings Grid -->
            <main>
              <div class="sort-bar">
                <div class="sort-bar-left">
                  <span class="result-count" id="mp-count">Loading...</span>
                </div>
                <div class="sort-bar-right">
                  <select class="form-control" style="width:auto;padding:0.4rem 2rem 0.4rem 0.75rem;font-size:var(--text-xs)" onchange="BV.Marketplace.setFilter('sort',this.value)">
                    <option value="newest" ${currentFilters.sort==='newest'?'selected':''}>Newest First</option>
                    <option value="price-asc" ${currentFilters.sort==='price-asc'?'selected':''}>Price: Low to High</option>
                    <option value="price-desc" ${currentFilters.sort==='price-desc'?'selected':''}>Price: High to Low</option>
                    <option value="popular" ${currentFilters.sort==='popular'?'selected':''}>Most Viewed</option>
                  </select>
                </div>
              </div>

              <div class="browse-grid browse-grid-4" id="marketplace-grid"></div>
              <div id="mp-pagination" style="margin-top:var(--sp-8)"></div>
            </main>
          </div>
        </div>
      </div>
    `;
  };

  const getBadgeClass = (condition) => ({
    'New':'condition-new', 'Like New':'condition-like',
    'Good':'condition-good', 'Fair':'condition-fair', 'Poor':'condition-poor'
  }[condition] || 'condition-good');

  const renderGrid = () => {
    const query = document.getElementById('mp-search')?.value?.trim() || '';
    const results = BV.Store.searchMarketplace(query, currentFilters);
    const total = Math.ceil(results.length / PER_PAGE);
    const paginated = results.slice((currentPage-1)*PER_PAGE, currentPage*PER_PAGE);

    const countEl = document.getElementById('mp-count');
    if (countEl) countEl.textContent = `${results.length} listing${results.length!==1?'s':''} found`;

    const grid = document.getElementById('marketplace-grid');
    if (!grid) return;

    if (!paginated.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">📦</div>
          <h3>No listings found</h3>
          <p>Try adjusting your filters or be the first to list a book in this category!</p>
          <button class="btn btn-primary" onclick="BV.Marketplace.showListingForm()">List Your Book</button>
        </div>
      `;
    } else {
      grid.innerHTML = paginated.map(l => BV.UI.marketplaceCardHTML(l)).join('');
    }

    const pagination = document.getElementById('mp-pagination');
    if (pagination) pagination.innerHTML = BV.UI.paginationHTML(currentPage, total, 'BV.Marketplace.goToPage');
  };

  const init = (initialCategory, initialQuery) => {
    if (initialCategory) currentFilters.category = initialCategory;
    if (initialQuery) { currentFilters.query = initialQuery; }
    renderGrid();
  };

  const goToPage = (page) => { currentPage = page; renderGrid(); window.scrollTo({top:0,behavior:'smooth'}); };

  const setFilter = (key, val) => {
    if (val) currentFilters[key] = val;
    else delete currentFilters[key];
    currentPage = 1;
    renderGrid();
  };

  const setCondition = (cond, checked) => {
    if (checked) currentFilters.condition = cond;
    else delete currentFilters.condition;
    currentPage = 1;
    renderGrid();
  };

  const applyFilters = () => { currentPage = 1; renderGrid(); };

  const updatePriceRange = (val) => {
    const el = document.getElementById('mp-price-display');
    if (el) el.textContent = `₹${val}`;
    currentFilters.maxPrice = val / 83;
    renderGrid();
  };

  const resetFilters = () => {
    currentFilters = { sort: 'newest' };
    currentPage = 1;
    const searchEl = document.getElementById('mp-search');
    if (searchEl) searchEl.value = '';
    const priceEl = document.getElementById('mp-max-price');
    if (priceEl) { priceEl.value = 2000; updatePriceRange(2000); }
    document.querySelectorAll('input[name="mp-cat"]').forEach(r => { if (r.value === '') r.checked = true; });
    document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(c => c.checked = false);
    renderGrid();
  };

  const showListingForm = () => {
    const session = BV.Store.getSession();
    if (!session) { BV.UI.toast('Sign in required', 'Please login to list a book', 'warning'); BV.App.navigate('auth'); return; }
    if (session.role === 'buyer') {
      BV.UI.confirm('Become a Seller', 'You need a seller account to list books. Would you like to upgrade your account to seller?', () => {
        BV.Store.updateUser(session.id, { role: 'seller' });
        BV.Store.setSession({ ...session, role: 'seller' });
        BV.Auth.updateNavbar();
        BV.UI.toast('Account upgraded!', 'You are now a seller', 'success');
        showListingForm();
      });
      return;
    }
    renderListingModal();
  };

  const renderListingModal = (editListing=null) => {
    const isEdit = !!editListing;
    BV.UI.openModal(`
      <div class="modal-header">
        <span class="modal-title">${isEdit ? '✏️ Edit Listing' : '📤 List Your Book'}</span>
        <button class="modal-close" onclick="BV.UI.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <form id="listing-form" onsubmit="BV.Marketplace.submitListing(event, ${isEdit ? `'${editListing.id}'` : 'null'})">
          <div style="display:flex;flex-direction:column;gap:var(--sp-4)">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4)">
              <div class="form-group">
                <label class="form-label required">Book Title</label>
                <input type="text" class="form-control" name="title" placeholder="Enter book title" value="${isEdit?BV.UI.escapeHtml(editListing.title):''}" required>
              </div>
              <div class="form-group">
                <label class="form-label required">Author</label>
                <input type="text" class="form-control" name="author" placeholder="Author name" value="${isEdit?BV.UI.escapeHtml(editListing.author):''}" required>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4)">
              <div class="form-group">
                <label class="form-label">ISBN</label>
                <input type="text" class="form-control" name="isbn" placeholder="978-..." value="${isEdit?editListing.isbn||'':''}">
              </div>
              <div class="form-group">
                <label class="form-label required">Category</label>
                <select class="form-control" name="category" required>
                  <option value="">Select category</option>
                  ${['Fiction','Sci-Fi','Fantasy','Dystopian','Self-Help','History','Psychology','Finance','Science','Thriller','Romance','Biography','Children','Non-Fiction','Philosophy'].map(cat =>
                    `<option value="${cat}" ${isEdit&&editListing.category===cat?'selected':''}>${cat}</option>`
                  ).join('')}
                </select>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4)">
              <div class="form-group">
                <label class="form-label required">Condition</label>
                <select class="form-control" name="condition" required>
                  ${['New','Like New','Good','Fair','Poor'].map(c =>
                    `<option value="${c}" ${isEdit&&editListing.condition===c?'selected':''}>${c}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label required">Your Price (₹)</label>
                <div class="input-wrapper has-icon-left">
                  <span class="input-icon">₹</span>
                  <input type="number" class="form-control" name="priceInr" placeholder="e.g. 299" min="1" value="${isEdit?(editListing.price*83).toFixed(0):''}" required>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label required">Description</label>
              <textarea class="form-control" name="description" rows="4" placeholder="Describe the condition, any highlights, notes, etc." required>${isEdit?BV.UI.escapeHtml(editListing.description):''}</textarea>
            </div>
            <div style="padding:var(--sp-4);background:var(--clr-primary-dim);border:1px solid var(--clr-primary);border-radius:var(--radius-lg);font-size:var(--text-xs);color:var(--clr-primary-light)">
              💡 <strong>Tip:</strong> Books in "Like New" or "New" condition sell 3x faster. Be honest about the condition!
            </div>
          </div>
          <div class="modal-footer" style="margin-top:var(--sp-5);padding:0;border:none;justify-content:flex-end">
            <button type="button" class="btn btn-ghost" onclick="BV.UI.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Update Listing' : '📤 Publish Listing'}</button>
          </div>
        </form>
      </div>
    `, 'modal-lg');
  };

  const submitListing = (e, editId) => {
    e.preventDefault();
    const session = BV.Store.getSession();
    if (!session) return;
    const form = e.target;
    const fd = new FormData(form);
    const priceInr = parseFloat(fd.get('priceInr'));
    const data = {
      sellerId: session.id,
      title: fd.get('title'),
      author: fd.get('author'),
      isbn: fd.get('isbn'),
      category: fd.get('category'),
      condition: fd.get('condition'),
      price: priceInr / 83,
      description: fd.get('description'),
      images: [],
      status: 'active',
    };

    if (editId) {
      BV.Store.updateListing(editId, data);
      BV.UI.toast('Listing updated!', 'Your listing has been updated.', 'success');
    } else {
      BV.Store.addListing(data);
      BV.UI.toast('Book listed! 🎉', 'Your book is now live on the marketplace.', 'success');
      BV.Store.addNotification({ userId: session.id, type: 'listing', message: `Your book "${data.title}" is now live!`, icon: '📤' });
    }
    BV.UI.closeModal();
    renderGrid();
  };

  return { render, init, goToPage, setFilter, setCondition, applyFilters, updatePriceRange, resetFilters, showListingForm, renderListingModal, submitListing };
})();
