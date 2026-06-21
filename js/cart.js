/* ============================================================
   BookVerse — Book Detail, Cart, Wishlist, Orders, Dashboard, Admin
   ============================================================ */

window.BV = window.BV || {};

/* ─────────────────────────────────────────────────────────────
   BROWSE (Full Bookstore Page)
───────────────────────────────────────────────────────────── */
BV.Browse = (() => {
  let currentFilters = { sort: 'popular' };
  let currentPage = 1;
  const PER_PAGE = 12;
  let viewMode = 'grid';

  const render = (initialCategory, initialQuery) => {
    if (initialCategory) currentFilters.category = initialCategory;
    if (initialQuery) currentFilters.searchQuery = initialQuery;

    return `
      <div class="page-content">
        <div class="container">
          <div class="page-header">
            <div class="breadcrumb"><span onclick="BV.App.navigate('home')" style="cursor:pointer">Home</span><span class="sep">›</span><span>Bookstore</span></div>
            <h1>📚 Bookstore</h1>
            <p>Explore our curated collection of ${BV.Store.getStoreBooks().length}+ books</p>
          </div>
          <div class="browse-layout">
            <!-- Filter Sidebar -->
            <aside class="filter-sidebar">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-4)">
                <h4>Filters</h4>
                <button class="btn btn-ghost btn-sm" onclick="BV.Browse.resetFilters()">Reset All</button>
              </div>

              <div class="filter-section" style="padding-top:0">
                <div class="search-bar" style="border-radius:var(--radius-md)">
                  <span class="search-icon">🔍</span>
                  <input type="text" id="bs-search" placeholder="Search books..." value="${initialQuery||''}" oninput="BV.Browse.applyFilters()">
                </div>
              </div>

              <div class="filter-section">
                <div class="filter-title">Category</div>
                <div class="filter-body">
                  <label class="filter-check">
                    <label style="cursor:pointer;display:flex;align-items:center;gap:var(--sp-2)">
                      <input type="radio" name="bs-cat" value="" ${!currentFilters.category?'checked':''} onchange="BV.Browse.setFilter('category',null)">
                      <span style="font-size:var(--text-sm);color:var(--clr-text-muted)">All Categories</span>
                    </label>
                    <span class="filter-count">${BV.Store.getStoreBooks().length}</span>
                  </label>
                  ${BV.Store.getCategories().map(cat => `
                    <label class="filter-check">
                      <label style="cursor:pointer;display:flex;align-items:center;gap:var(--sp-2)">
                        <input type="radio" name="bs-cat" value="${cat.name}" ${currentFilters.category===cat.name?'checked':''} onchange="BV.Browse.setFilter('category','${cat.name}')">
                        <span style="font-size:var(--text-sm);color:var(--clr-text-muted)">${cat.name}</span>
                      </label>
                      <span class="filter-count">${cat.count}</span>
                    </label>
                  `).join('')}
                </div>
              </div>

              <div class="filter-section">
                <div class="filter-title">Min Rating</div>
                <div class="filter-body">
                  ${[4.5, 4.0, 3.5, 3.0].map(r => `
                    <label style="cursor:pointer;display:flex;align-items:center;gap:var(--sp-2)">
                      <input type="radio" name="bs-rating" value="${r}" ${currentFilters.minRating===r?'checked':''} onchange="BV.Browse.setFilter('minRating',${r})">
                      <span style="font-size:var(--text-sm);color:var(--clr-gold)">★★★★☆</span>
                      <span style="font-size:var(--text-xs);color:var(--clr-text-muted)">${r}+ stars</span>
                    </label>
                  `).join('')}
                  <label style="cursor:pointer;display:flex;align-items:center;gap:var(--sp-2)">
                    <input type="radio" name="bs-rating" value="" ${!currentFilters.minRating?'checked':''} onchange="BV.Browse.setFilter('minRating',null)">
                    <span style="font-size:var(--text-sm);color:var(--clr-text-muted)">All Ratings</span>
                  </label>
                </div>
              </div>

              <div class="filter-section">
                <div class="filter-title">Max Price</div>
                <div class="filter-body">
                  <input type="range" id="bs-max-price" min="0" max="2500" step="50" value="${(currentFilters.maxPrice||30)*83}" oninput="BV.Browse.updatePriceRange(this.value)">
                  <div class="price-range-display"><span>₹0</span><span id="bs-price-display">₹${((currentFilters.maxPrice||30)*83).toFixed(0)}</span></div>
                </div>
              </div>

              <div class="filter-section">
                <div class="filter-title">Availability</div>
                <div class="filter-body">
                  <label class="form-check">
                    <input type="checkbox" id="bs-instock" ${currentFilters.inStock?'checked':''} onchange="BV.Browse.setFilter('inStock',this.checked||null)">
                    <span style="font-size:var(--text-sm);color:var(--clr-text-muted)">In Stock Only</span>
                  </label>
                </div>
              </div>
            </aside>

            <!-- Book Grid -->
            <main>
              <div class="sort-bar">
                <div class="sort-bar-left">
                  <span class="result-count" id="bs-count">Loading...</span>
                </div>
                <div class="sort-bar-right">
                  <div class="view-toggle">
                    <button class="view-btn ${viewMode==='grid'?'active':''}" onclick="BV.Browse.setView('grid')" title="Grid">⊞</button>
                    <button class="view-btn ${viewMode==='list'?'active':''}" onclick="BV.Browse.setView('list')" title="List">☰</button>
                  </div>
                  <select class="form-control" style="width:auto;font-size:var(--text-xs);padding:0.4rem 2rem 0.4rem 0.75rem" onchange="BV.Browse.setFilter('sort',this.value)">
                    <option value="popular" ${currentFilters.sort==='popular'?'selected':''}>Most Popular</option>
                    <option value="rating" ${currentFilters.sort==='rating'?'selected':''}>Highest Rated</option>
                    <option value="price-asc" ${currentFilters.sort==='price-asc'?'selected':''}>Price: Low to High</option>
                    <option value="price-desc" ${currentFilters.sort==='price-desc'?'selected':''}>Price: High to Low</option>
                    <option value="newest" ${currentFilters.sort==='newest'?'selected':''}>Newest First</option>
                  </select>
                </div>
              </div>

              <div id="books-grid" class="${viewMode==='grid'?'browse-grid browse-grid-4':''}"></div>
              <div id="bs-pagination" style="margin-top:var(--sp-8)"></div>
            </main>
          </div>
        </div>
      </div>
    `;
  };

  const renderGrid = () => {
    const query = document.getElementById('bs-search')?.value?.trim() || '';
    const results = BV.Store.searchBooks(query, currentFilters);
    const total = Math.ceil(results.length / PER_PAGE);
    const paginated = results.slice((currentPage-1)*PER_PAGE, currentPage*PER_PAGE);

    const countEl = document.getElementById('bs-count');
    if (countEl) countEl.textContent = `${results.length} book${results.length!==1?'s':''} found`;

    const grid = document.getElementById('books-grid');
    if (!grid) return;

    if (!paginated.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📚</div><h3>No books found</h3><p>Try adjusting your search or filters.</p><button class="btn btn-outline" onclick="BV.Browse.resetFilters()">Clear Filters</button></div>`;
    } else {
      if (viewMode === 'list') {
        grid.className = '';
        grid.innerHTML = `<div style="display:flex;flex-direction:column;gap:var(--sp-4)">${paginated.map(b => bookListItemHTML(b)).join('')}</div>`;
      } else {
        grid.className = 'browse-grid browse-grid-4';
        grid.innerHTML = paginated.map(b => BV.UI.bookCardHTML(b, 'store')).join('');
      }
    }

    const paginationEl = document.getElementById('bs-pagination');
    if (paginationEl) paginationEl.innerHTML = BV.UI.paginationHTML(currentPage, total, 'BV.Browse.goToPage');
  };

  const bookListItemHTML = (book) => {
    const gradient = BV.Store.getBookGradient(book.category);
    const discount = book.originalPrice ? Math.round((1 - book.price/book.originalPrice)*100) : 0;
    return `
      <div style="display:flex;gap:var(--sp-4);padding:var(--sp-4);background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-xl);cursor:pointer;transition:all var(--dur-base)" onclick="BV.App.navigate('book','${book.id}','store')" onmouseenter="this.style.borderColor='var(--clr-border-hover)'" onmouseleave="this.style.borderColor='var(--glass-border)'">
        <div style="width:80px;height:110px;border-radius:var(--radius-md);overflow:hidden;flex-shrink:0;background:${gradient};display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);font-weight:var(--fw-bold);color:rgba(255,255,255,0.8);text-align:center;padding:4px">${BV.UI.escapeHtml(book.title)}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:var(--text-xs);color:var(--clr-primary);font-weight:var(--fw-semibold);text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">${book.category}</div>
          <h4 style="font-size:var(--text-md);font-weight:var(--fw-bold);margin-bottom:2px;line-clamp:1">${BV.UI.escapeHtml(book.title)}</h4>
          <div style="font-size:var(--text-sm);color:var(--clr-text-muted);margin-bottom:var(--sp-2)">by ${BV.UI.escapeHtml(book.author)}</div>
          <div style="display:flex;align-items:center;gap:var(--sp-2);margin-bottom:var(--sp-3)">
            ${BV.UI.starsHTML(book.rating)}
            <span style="font-size:var(--text-xs);color:var(--clr-gold)">${book.rating}</span>
            <span style="font-size:var(--text-xs);color:var(--clr-text-faint)">(${(book.reviewCount||0).toLocaleString()})</span>
          </div>
          <p style="font-size:var(--text-xs);color:var(--clr-text-muted);line-height:var(--lh-relaxed);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${BV.UI.escapeHtml(book.description)}</p>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;gap:var(--sp-3);flex-shrink:0">
          <div style="text-align:right">
            <div style="font-size:var(--text-lg);font-weight:var(--fw-black)">₹${(book.price*83).toFixed(0)}</div>
            ${book.originalPrice ? `<div style="font-size:var(--text-xs);color:var(--clr-text-faint);text-decoration:line-through">₹${(book.originalPrice*83).toFixed(0)}</div>` : ''}
            ${discount >= 10 ? `<div style="font-size:var(--text-xs);color:var(--clr-success);font-weight:var(--fw-semibold)">${discount}% off</div>` : ''}
          </div>
          <div style="display:flex;gap:var(--sp-2)">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="event.stopPropagation();BV.UI.toggleWishlistBtn(this,'${book.id}')" title="Wishlist">❤️</button>
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();BV.UI.addToCartBtn('${book.id}','store',this)">🛒 Add to Cart</button>
          </div>
        </div>
      </div>
    `;
  };

  const init = (initialCategory, initialQuery) => {
    if (initialCategory) currentFilters.category = initialCategory;
    if (initialQuery) currentFilters.searchQuery = initialQuery;
    renderGrid();
  };

  const goToPage = (page) => { currentPage = page; renderGrid(); window.scrollTo({top:0,behavior:'smooth'}); };
  const setFilter = (key, val) => { if (val!=null) currentFilters[key]=val; else delete currentFilters[key]; currentPage=1; renderGrid(); };
  const applyFilters = () => { currentPage=1; renderGrid(); };
  const updatePriceRange = (val) => {
    const el = document.getElementById('bs-price-display');
    if (el) el.textContent = `₹${val}`;
    currentFilters.maxPrice = val/83;
    renderGrid();
  };
  const resetFilters = () => {
    currentFilters = { sort:'popular' };
    currentPage = 1;
    const s = document.getElementById('bs-search'); if(s) s.value='';
    const p = document.getElementById('bs-max-price'); if(p) { p.value=2500; updatePriceRange(2500); }
    document.querySelectorAll('input[name="bs-cat"]').forEach(r=>{ if(r.value==='') r.checked=true; });
    document.querySelectorAll('input[name="bs-rating"]').forEach(r=>{ if(r.value==='') r.checked=true; });
    renderGrid();
  };
  const setView = (mode) => {
    viewMode = mode;
    document.querySelectorAll('.view-btn').forEach((b,i) => b.classList.toggle('active', (i===0&&mode==='grid')||(i===1&&mode==='list')));
    renderGrid();
  };

  return { render, init, goToPage, setFilter, applyFilters, updatePriceRange, resetFilters, setView };
})();

/* ─────────────────────────────────────────────────────────────
   BOOK DETAIL
───────────────────────────────────────────────────────────── */
BV.BookDetail = (() => {
  const render = (id, source='store') => {
    let book = source === 'marketplace' ? BV.Store.getListingById(id) : BV.Store.getStoreBookById(id);
    if (!book) return `<div class="page-content"><div class="container"><div class="empty-state"><div class="empty-icon">🔍</div><h3>Book not found</h3><button class="btn btn-primary" onclick="BV.App.navigate('bookstore')">Browse Books</button></div></div></div>`;

    const reviews = BV.Store.getBookReviews(id);
    const seller = source === 'marketplace' ? BV.Store.getUserById(book.sellerId) : null;
    const relatedBooks = BV.Store.getStoreBooks().filter(b => b.category === book.category && b.id !== id).slice(0, 6);
    const gradient = BV.Store.getBookGradient(book.category || 'Fiction');
    const inWishlist = BV.Store.isInWishlist(id);
    const inCart = BV.Store.getCart().some(c => c.bookId === id);
    const avgRating = reviews.length ? reviews.reduce((s,r)=>s+r.rating,0)/reviews.length : book.rating || 0;

    // Increment marketplace view count
    if (source === 'marketplace') BV.Store.updateListing(id, { viewCount: (book.viewCount||0)+1 });

    return `
      <div class="page-content">
        <div class="container">
          <div class="breadcrumb" style="margin-bottom:var(--sp-6)">
            <span onclick="BV.App.navigate('home')" style="cursor:pointer">Home</span>
            <span class="sep">›</span>
            <span onclick="BV.App.navigate(source==='marketplace'?'marketplace':'bookstore')" style="cursor:pointer">${source==='marketplace'?'Marketplace':'Bookstore'}</span>
            <span class="sep">›</span>
            <span>${BV.UI.escapeHtml(book.title)}</span>
          </div>

          <div class="book-detail-layout">
            <!-- Cover & Buy -->
            <div class="book-detail-cover">
              <div class="book-detail-cover-img" style="background:${gradient}">
                <div class="book-detail-cover-title">${BV.UI.escapeHtml(book.title)}</div>
                <div class="book-detail-cover-author">by ${BV.UI.escapeHtml(book.author)}</div>
              </div>

              <!-- Price Box -->
              <div class="card card-solid" style="margin-top:var(--sp-5);border-radius:var(--radius-xl)">
                <div class="card-body">
                  <div style="display:flex;align-items:baseline;gap:var(--sp-2);margin-bottom:var(--sp-2)">
                    <span style="font-size:var(--text-3xl);font-weight:var(--fw-black)">₹${(book.price*83).toFixed(0)}</span>
                    ${book.originalPrice ? `<span style="font-size:var(--text-sm);color:var(--clr-text-faint);text-decoration:line-through">₹${(book.originalPrice*83).toFixed(0)}</span>` : ''}
                    ${book.originalPrice ? `<span style="font-size:var(--text-sm);color:var(--clr-success);font-weight:var(--fw-semibold)">${Math.round((1-book.price/book.originalPrice)*100)}% off</span>` : ''}
                  </div>
                  ${source === 'marketplace' && book.condition ? `<span class="badge condition-${book.condition==='New'?'new':book.condition==='Like New'?'like':book.condition==='Good'?'good':book.condition==='Fair'?'fair':'poor'}" style="margin-bottom:var(--sp-3)">${book.condition}</span>` : ''}
                  ${source === 'store' && book.stock !== undefined ? `<div style="font-size:var(--text-xs);color:${book.stock>5?'var(--clr-success)':book.stock>0?'var(--clr-warning)':'var(--clr-danger)'};margin-bottom:var(--sp-3)">${book.stock>5?'✅ In Stock':book.stock>0?`⚠️ Only ${book.stock} left`:'❌ Out of Stock'}</div>` : ''}

                  <div class="book-detail-actions">
                    <button class="btn btn-gradient btn-lg" id="buy-now-btn" onclick="BV.BookDetail.buyNow('${id}','${source}')">
                      ⚡ Buy Now
                    </button>
                    <button class="btn btn-primary btn-lg ${inCart?'btn-outline':''}" id="add-cart-btn" onclick="BV.UI.addToCartBtn('${id}','${source}',this)">
                      🛒 ${inCart ? 'In Cart' : 'Add to Cart'}
                    </button>
                    <button class="btn btn-ghost btn-lg ${inWishlist?'btn-accent':''}" id="wishlist-btn" onclick="BV.UI.toggleWishlistBtn(this,'${id}')">
                      ${inWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
                    </button>
                  </div>

                  <div style="display:flex;gap:var(--sp-3);margin-top:var(--sp-3);padding-top:var(--sp-3);border-top:1px solid var(--clr-border)">
                    ${[{icon:'🚚',text:'Free delivery above ₹500'},{icon:'↩️',text:'7-day return policy'},{icon:'🔒',text:'Secure payment'}].map(f=>`
                      <div style="display:flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--clr-text-muted)">
                        <span>${f.icon}</span><span>${f.text}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              ${seller ? `
                <div style="margin-top:var(--sp-4)">
                  <div class="seller-info" onclick="BV.App.navigate('profile', '${seller.id}')">
                    <div class="avatar avatar-md">${seller.name[0].toUpperCase()}</div>
                    <div>
                      <div class="seller-name">${BV.UI.escapeHtml(seller.name)}</div>
                      <div class="seller-rating">★ ${seller.sellerRating} <span style="color:var(--clr-text-faint)">(${seller.totalSales} sales)</span></div>
                    </div>
                    <span style="margin-left:auto;color:var(--clr-primary);font-size:var(--text-xs)">View Profile →</span>
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Book Info -->
            <div>
              <div style="margin-bottom:var(--sp-2)">
                <span class="badge badge-primary">${source === 'marketplace' ? '🏪 Marketplace' : '📚 BookVerse Store'}</span>
                ${book.bestseller ? '<span class="badge badge-gold" style="margin-left:var(--sp-2)">🔥 Bestseller</span>' : ''}
                ${book.newArrival ? '<span class="badge badge-teal" style="margin-left:var(--sp-2)">✨ New Arrival</span>' : ''}
              </div>

              <h1 style="font-size:var(--text-3xl);font-weight:var(--fw-black);line-height:var(--lh-tight);margin-bottom:var(--sp-2)">${BV.UI.escapeHtml(book.title)}</h1>
              <p style="font-size:var(--text-lg);color:var(--clr-text-muted);margin-bottom:var(--sp-4)">by <span style="color:var(--clr-primary)">${BV.UI.escapeHtml(book.author)}</span></p>

              <div style="display:flex;align-items:center;gap:var(--sp-4);margin-bottom:var(--sp-6)">
                <div style="display:flex;align-items:center;gap:var(--sp-2)">
                  ${BV.UI.starsHTML(avgRating, 16)}
                  <span style="font-size:var(--text-lg);font-weight:var(--fw-bold);color:var(--clr-gold)">${avgRating.toFixed(1)}</span>
                </div>
                <span style="color:var(--clr-text-muted);font-size:var(--text-sm)">${(book.reviewCount||reviews.length).toLocaleString()} reviews</span>
                ${source === 'store' && book.stock !== undefined ? `<span style="color:var(--clr-text-faint);font-size:var(--text-sm)">•</span><span style="font-size:var(--text-sm);color:var(--clr-text-muted)">${book.stock} in stock</span>` : ''}
              </div>

              <!-- Description -->
              <div style="margin-bottom:var(--sp-8)">
                <h3 style="margin-bottom:var(--sp-3)">About this book</h3>
                <p style="color:var(--clr-text-muted);line-height:var(--lh-relaxed);font-size:var(--text-base)">${BV.UI.escapeHtml(book.description||'')}</p>
              </div>

              <!-- Book Metadata -->
              ${source === 'store' ? `
              <div style="margin-bottom:var(--sp-8)">
                <h3 style="margin-bottom:var(--sp-4)">Book Details</h3>
                <div class="book-meta-grid">
                  ${[
                    {label:'ISBN', value:book.isbn||'N/A'},
                    {label:'Publisher', value:book.publisher||'N/A'},
                    {label:'Published', value:book.publishYear||'N/A'},
                    {label:'Pages', value:book.pages||'N/A'},
                    {label:'Language', value:book.language||'English'},
                    {label:'Category', value:book.category||'N/A'},
                  ].map(m=>`<div class="book-meta-item"><div class="book-meta-label">${m.label}</div><div class="book-meta-value">${BV.UI.escapeHtml(String(m.value))}</div></div>`).join('')}
                </div>
              </div>
              ` : ''}

              <!-- Reviews Section -->
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-5)">
                  <h3>Reviews & Ratings</h3>
                  <button class="btn btn-outline btn-sm" onclick="BV.BookDetail.showReviewForm('${id}','${source}')">✍️ Write a Review</button>
                </div>

                <!-- Rating Summary -->
                <div style="display:flex;gap:var(--sp-8);align-items:center;padding:var(--sp-5);background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-xl);margin-bottom:var(--sp-6)">
                  <div style="text-align:center;flex-shrink:0">
                    <div style="font-size:var(--text-5xl);font-weight:var(--fw-black);line-height:1;color:var(--clr-gold)">${avgRating.toFixed(1)}</div>
                    ${BV.UI.starsHTML(avgRating, 18)}
                    <div style="font-size:var(--text-xs);color:var(--clr-text-muted);margin-top:4px">${reviews.length} reviews</div>
                  </div>
                  <div style="flex:1">
                    ${[5,4,3,2,1].map(s => {
                      const count = reviews.filter(r=>r.rating===s).length;
                      const pct = reviews.length ? (count/reviews.length)*100 : 0;
                      return `<div class="rating-bar-row"><span class="rating-bar-label">${s} ★</span><div class="rating-bar-track"><div class="rating-bar-fill" style="width:${pct}%"></div></div><span class="rating-bar-count">${count}</span></div>`;
                    }).join('')}
                  </div>
                </div>

                <!-- Review List -->
                <div id="reviews-list">
                  ${reviews.length ? reviews.map(r => reviewCardHTML(r)).join('') :
                    `<div class="empty-state" style="padding:var(--sp-8)"><div class="empty-icon">📝</div><h3>No reviews yet</h3><p>Be the first to share your thoughts!</p></div>`
                  }
                </div>
              </div>

              <!-- Related Books -->
              ${relatedBooks.length ? `
              <div style="margin-top:var(--sp-10)">
                <h3 style="margin-bottom:var(--sp-5)">More in ${book.category}</h3>
                <div class="books-scroll">
                  ${relatedBooks.map(b => BV.UI.bookCardHTML(b,'store')).join('')}
                </div>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const reviewCardHTML = (r) => {
    const user = BV.Store.getUserById(r.userId);
    return `
      <div class="review-card" style="margin-bottom:var(--sp-4)">
        <div class="review-header">
          <div class="review-user">
            ${BV.UI.avatarHTML(user,'sm')}
            <div>
              <div class="review-user-name">${user ? BV.UI.escapeHtml(user.name) : 'Anonymous'}</div>
              <div class="review-date">${BV.UI.formatDate(r.createdAt)}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:var(--sp-1)">${BV.UI.starsHTML(r.rating, 13)}<span style="font-size:var(--text-sm);font-weight:var(--fw-bold);color:var(--clr-gold)">${r.rating}</span></div>
        </div>
        <p class="review-text">${BV.UI.escapeHtml(r.text)}</p>
        <div class="review-helpful">
          <span>Helpful?</span>
          <button onclick="BV.BookDetail.markHelpful('${r.id}',this)">👍 Yes (${r.helpful||0})</button>
        </div>
      </div>
    `;
  };

  const showReviewForm = (bookId, source) => {
    const session = BV.Store.getSession();
    if (!session) { BV.UI.toast('Sign in required', 'Please login to write a review', 'warning'); BV.App.navigate('auth'); return; }
    const existing = BV.Store.getBookReviews(bookId).find(r => r.userId === session.id);
    if (existing) { BV.UI.toast('Already reviewed', 'You have already reviewed this book', 'info'); return; }

    BV.UI.openModal(`
      <div class="modal-header"><span class="modal-title">✍️ Write a Review</span><button class="modal-close" onclick="BV.UI.closeModal()">✕</button></div>
      <div class="modal-body">
        <form onsubmit="BV.BookDetail.submitReview(event,'${bookId}','${source}')">
          <div style="display:flex;flex-direction:column;gap:var(--sp-5)">
            <div class="form-group">
              <label class="form-label">Your Rating</label>
              <div class="star-rating" id="star-input">
                ${[5,4,3,2,1].map(n=>`<label for="star-${n}"><input type="radio" id="star-${n}" name="rating" value="${n}" required>★</label>`).join('')}
              </div>
            </div>
            <div class="form-group">
              <label class="form-label required">Your Review</label>
              <textarea class="form-control" name="text" rows="5" placeholder="Share your experience with this book..." required minlength="20"></textarea>
              <span class="form-hint">Minimum 20 characters</span>
            </div>
            <button type="submit" class="btn btn-gradient">Submit Review</button>
          </div>
        </form>
      </div>
    `, 'modal-sm');
  };

  const submitReview = (e, bookId, source) => {
    e.preventDefault();
    const session = BV.Store.getSession();
    if (!session) return;
    const fd = new FormData(e.target);
    const rating = parseInt(fd.get('rating'));
    const text = fd.get('text');
    if (!rating || !text) return;
    BV.Store.addReview({ bookId, userId: session.id, rating, text });
    BV.UI.closeModal();
    BV.UI.toast('Review submitted! 🎉', 'Thank you for sharing your thoughts', 'success');
    BV.App.navigate('book', bookId, source);
  };

  const markHelpful = (reviewId, btn) => {
    BV.Store.markHelpful(reviewId);
    const review = BV.Store.getReviews().find(r => r.id === reviewId);
    if (btn && review) btn.textContent = `👍 Yes (${review.helpful||0})`;
  };

  const buyNow = (bookId, source) => {
    const session = BV.Store.getSession();
    if (!session) { BV.UI.toast('Sign in required','Please login to buy','warning'); BV.App.navigate('auth'); return; }
    BV.UI.addToCartBtn(bookId, source, null);
    setTimeout(() => BV.App.navigate('cart'), 300);
  };

  return { render, showReviewForm, submitReview, markHelpful, buyNow };
})();

/* ─────────────────────────────────────────────────────────────
   CART
───────────────────────────────────────────────────────────── */
BV.Cart = (() => {
  let step = 1;
  let appliedCoupon = null;
  const COUPONS = { 'BOOKVERSE10': 0.10, 'FIRST20': 0.20, 'SAVE50': 0.05 };

  const render = () => {
    const session = BV.Store.getSession();
    if (!session) return `<div class="page-content"><div class="container" style="padding-block:var(--sp-20)"><div class="empty-state"><div class="empty-icon">🛒</div><h3>Sign in to view your cart</h3><button class="btn btn-primary" onclick="BV.App.navigate('auth')">Sign In</button></div></div></div>`;
    return `
      <div class="page-content">
        <div class="container">
          <div class="page-header"><h1>🛒 Shopping Cart</h1></div>
          <!-- Steps -->
          <div class="steps" style="max-width:500px;margin-bottom:var(--sp-8)">
            <div class="step ${step>=1?'active':''} ${step>1?'done':''}">
              <div class="step-num">${step>1?'✓':'1'}</div>
              <span class="step-label">Cart</span>
              <div class="step-line"></div>
            </div>
            <div class="step ${step>=2?'active':''} ${step>2?'done':''}">
              <div class="step-num">${step>2?'✓':'2'}</div>
              <span class="step-label">Shipping</span>
              <div class="step-line"></div>
            </div>
            <div class="step ${step>=3?'active':''}">
              <div class="step-num">3</div>
              <span class="step-label">Payment</span>
            </div>
          </div>
          <div id="cart-step-content"></div>
        </div>
      </div>
    `;
  };

  const renderStep = () => {
    const el = document.getElementById('cart-step-content');
    if (!el) return;
    if (step === 1) el.innerHTML = renderCartItems();
    if (step === 2) el.innerHTML = renderShipping();
    if (step === 3) el.innerHTML = renderPayment();
  };

  const renderCartItems = () => {
    const cart = BV.Store.getCart();
    if (!cart.length) return `<div class="empty-state"><div class="empty-icon">🛒</div><h3>Your cart is empty</h3><p>Browse our bookstore and add some books!</p><button class="btn btn-primary" onclick="BV.App.navigate('bookstore')">Browse Books</button></div>`;

    const items = cart.map(item => {
      const book = item.source==='store' ? BV.Store.getStoreBookById(item.bookId) : BV.Store.getListingById(item.bookId);
      if (!book) return '';
      const gradient = BV.Store.getBookGradient(book.category||'Fiction');
      return `
        <div class="cart-item">
          <div class="cart-item-cover" style="background:${gradient};display:flex;align-items:center;justify-content:center">
            <span style="font-size:var(--text-xs);color:rgba(255,255,255,0.8);text-align:center;padding:4px;font-weight:var(--fw-bold)">${BV.UI.escapeHtml(book.title)}</span>
          </div>
          <div class="cart-item-info">
            <div class="cart-item-title">${BV.UI.escapeHtml(book.title)}</div>
            <div class="cart-item-author">by ${BV.UI.escapeHtml(book.author)}</div>
            <span class="badge ${item.source==='marketplace'?'badge-accent':'badge-primary'}" style="margin-top:4px">${item.source==='marketplace'?'Marketplace':'Store'}</span>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--sp-3)">
            <div class="qty-control">
              <button class="qty-btn" onclick="BV.Cart.updateQty('${item.bookId}','${item.source}',${(item.quantity||1)-1})">−</button>
              <span class="qty-value">${item.quantity||1}</span>
              <button class="qty-btn" onclick="BV.Cart.updateQty('${item.bookId}','${item.source}',${(item.quantity||1)+1})">+</button>
            </div>
            <div class="cart-item-price">₹${(item.price*(item.quantity||1)*83).toFixed(0)}</div>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="BV.Cart.removeItem('${item.bookId}','${item.source}')" title="Remove">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    const subtotal = BV.Store.getCartTotal();
    const discount = appliedCoupon ? subtotal * COUPONS[appliedCoupon] : 0;
    const shipping = subtotal*83 >= 500 ? 0 : 49;
    const total = subtotal - discount;
    const tax = total * 0.18;

    return `
      <div style="display:grid;grid-template-columns:1fr 360px;gap:var(--sp-6);align-items:start">
        <div>
          <div style="display:flex;flex-direction:column;gap:var(--sp-3)">${items}</div>
          <div style="margin-top:var(--sp-4);display:flex;justify-content:space-between">
            <button class="btn btn-ghost btn-sm" onclick="BV.App.navigate('bookstore')">← Continue Shopping</button>
            <button class="btn btn-danger btn-sm" onclick="BV.Cart.clearCart()">🗑️ Clear Cart</button>
          </div>
        </div>
        <div class="card card-solid" style="border-radius:var(--radius-xl);position:sticky;top:calc(var(--nav-h)+var(--sp-4))">
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--sp-4)">
            <h4>Order Summary</h4>
            <div class="coupon-input">
              <input type="text" class="form-control" id="coupon-input" placeholder="Coupon code" value="${appliedCoupon||''}">
              <button class="btn btn-outline btn-sm" onclick="BV.Cart.applyCoupon()">Apply</button>
            </div>
            ${appliedCoupon ? `<div style="color:var(--clr-success);font-size:var(--text-xs)">✅ Coupon "${appliedCoupon}" applied — ${COUPONS[appliedCoupon]*100}% off!</div>` : '<span class="form-hint">Try: BOOKVERSE10, FIRST20, SAVE50</span>'}
            <hr class="divider">
            <div style="display:flex;flex-direction:column;gap:var(--sp-2)">
              ${[
                {label:'Subtotal', val:`₹${(subtotal*83).toFixed(0)}`},
                {label:'Discount', val:`-₹${(discount*83).toFixed(0)}`, color:'var(--clr-success)'},
                {label:'Shipping', val:shipping===0?'Free 🎉':`₹${shipping}`},
                {label:'Tax (GST 18%)', val:`₹${(tax*83).toFixed(0)}`},
              ].map(r=>`
                <div style="display:flex;justify-content:space-between;font-size:var(--text-sm)">
                  <span style="color:var(--clr-text-muted)">${r.label}</span>
                  <span ${r.color?`style="color:${r.color}"`:''}>${r.val}</span>
                </div>
              `).join('')}
              <hr class="divider">
              <div style="display:flex;justify-content:space-between;font-weight:var(--fw-bold);font-size:var(--text-lg)">
                <span>Total</span>
                <span style="color:var(--clr-primary)">₹${((total+tax)*83+shipping).toFixed(0)}</span>
              </div>
            </div>
            <button class="btn btn-gradient btn-lg w-full" onclick="BV.Cart.nextStep()">Proceed to Checkout →</button>
            <div style="display:flex;align-items:center;justify-content:center;gap:var(--sp-2);font-size:var(--text-xs);color:var(--clr-text-faint)">
              🔒 Secure & encrypted checkout
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const renderShipping = () => `
    <div style="display:grid;grid-template-columns:1fr 360px;gap:var(--sp-6)">
      <div class="card card-solid" style="border-radius:var(--radius-xl)">
        <div class="card-header"><h4>📍 Shipping Address</h4></div>
        <div class="card-body">
          <form id="shipping-form" style="display:flex;flex-direction:column;gap:var(--sp-4)">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4)">
              <div class="form-group"><label class="form-label required">Full Name</label><input type="text" class="form-control" name="name" required placeholder="Your full name"></div>
              <div class="form-group"><label class="form-label required">Phone</label><input type="text" class="form-control" name="phone" required placeholder="+91 XXXXX XXXXX"></div>
            </div>
            <div class="form-group"><label class="form-label required">Street Address</label><input type="text" class="form-control" name="street" required placeholder="House/Flat No, Street, Locality"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--sp-4)">
              <div class="form-group"><label class="form-label required">City</label><input type="text" class="form-control" name="city" required placeholder="City"></div>
              <div class="form-group"><label class="form-label required">State</label><input type="text" class="form-control" name="state" required placeholder="State"></div>
              <div class="form-group"><label class="form-label required">PIN Code</label><input type="text" class="form-control" name="zip" required placeholder="123456" maxlength="6"></div>
            </div>
          </form>
        </div>
        <div class="card-footer" style="display:flex;gap:var(--sp-3);justify-content:space-between">
          <button class="btn btn-ghost" onclick="BV.Cart.prevStep()">← Back to Cart</button>
          <button class="btn btn-primary" onclick="BV.Cart.submitShipping()">Continue to Payment →</button>
        </div>
      </div>
      ${cartSummaryHTML()}
    </div>
  `;

  const renderPayment = () => `
    <div style="display:grid;grid-template-columns:1fr 360px;gap:var(--sp-6)">
      <div class="card card-solid" style="border-radius:var(--radius-xl)">
        <div class="card-header"><h4>💳 Payment Method</h4></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:var(--sp-3)">
          ${[
            {id:'razorpay', label:'Razorpay', icon:'💳', desc:'UPI, Cards, Net Banking, Wallets'},
            {id:'upi', label:'UPI', icon:'📱', desc:'Pay via Google Pay, PhonePe, Paytm'},
            {id:'cod', label:'Cash on Delivery', icon:'💵', desc:'Pay when you receive the order'},
          ].map((m,i) => `
            <label class="payment-method ${i===0?'selected':''}" id="pay-${m.id}" onclick="BV.Cart.selectPayment('${m.id}')">
              <input type="radio" name="payment" value="${m.id}" ${i===0?'checked':''} style="display:none">
              <div class="payment-logo">${m.icon}</div>
              <div style="flex:1">
                <div style="font-weight:var(--fw-semibold);font-size:var(--text-sm)">${m.label}</div>
                <div style="font-size:var(--text-xs);color:var(--clr-text-muted)">${m.desc}</div>
              </div>
              <span style="color:var(--clr-primary);font-size:18px;flex-shrink:0">◎</span>
            </label>
          `).join('')}

          <div style="padding:var(--sp-4);background:var(--clr-primary-dim);border:1px solid var(--clr-primary);border-radius:var(--radius-lg);font-size:var(--text-xs);color:var(--clr-primary-light);margin-top:var(--sp-2)">
            🔒 <strong>Razorpay Integration Ready</strong> — In production, clicking "Place Order" will open the Razorpay payment gateway for secure checkout.
          </div>
        </div>
        <div class="card-footer" style="display:flex;justify-content:space-between">
          <button class="btn btn-ghost" onclick="BV.Cart.prevStep()">← Back</button>
          <button class="btn btn-gradient btn-lg" onclick="BV.Cart.placeOrder()">🎉 Place Order</button>
        </div>
      </div>
      ${cartSummaryHTML()}
    </div>
  `;

  const cartSummaryHTML = () => {
    const cart = BV.Store.getCart();
    const subtotal = BV.Store.getCartTotal();
    const discount = appliedCoupon ? subtotal * COUPONS[appliedCoupon] : 0;
    const shipping = subtotal*83 >= 500 ? 0 : 49;
    const total = subtotal - discount;
    const tax = total * 0.18;
    return `
      <div class="card card-solid" style="border-radius:var(--radius-xl);position:sticky;top:calc(var(--nav-h)+var(--sp-4))">
        <div class="card-body" style="display:flex;flex-direction:column;gap:var(--sp-3)">
          <h4>Order Summary</h4>
          <div style="font-size:var(--text-xs);color:var(--clr-text-muted)">${cart.length} item${cart.length!==1?'s':''}</div>
          <hr class="divider">
          ${[
            {l:'Subtotal',v:`₹${(subtotal*83).toFixed(0)}`},
            {l:'Discount',v:`-₹${(discount*83).toFixed(0)}`,c:'var(--clr-success)'},
            {l:'Shipping',v:shipping===0?'FREE 🎉':`₹${shipping}`},
            {l:'GST (18%)',v:`₹${(tax*83).toFixed(0)}`},
          ].map(r=>`<div style="display:flex;justify-content:space-between;font-size:var(--text-sm)"><span style="color:var(--clr-text-muted)">${r.l}</span><span ${r.c?`style="color:${r.c}"`:''}>${r.v}</span></div>`).join('')}
          <hr class="divider">
          <div style="display:flex;justify-content:space-between;font-weight:var(--fw-bold);font-size:var(--text-lg)">
            <span>Total</span><span style="color:var(--clr-primary)">₹${((total+tax)*83+shipping).toFixed(0)}</span>
          </div>
        </div>
      </div>
    `;
  };

  const init = () => { step = 1; appliedCoupon = null; renderStep(); };
  const nextStep = () => { if (BV.Store.getCart().length === 0) { BV.UI.toast('Cart is empty','Add some books first','warning'); return; } step = Math.min(3, step+1); updateStepIndicator(); renderStep(); window.scrollTo({top:0,behavior:'smooth'}); };
  const prevStep = () => { step = Math.max(1, step-1); updateStepIndicator(); renderStep(); };

  const updateStepIndicator = () => {
    document.querySelectorAll('.step').forEach((el, i) => {
      el.classList.toggle('active', i+1 === step);
      el.classList.toggle('done', i+1 < step);
      const num = el.querySelector('.step-num');
      if (num) num.textContent = i+1 < step ? '✓' : String(i+1);
    });
  };

  const updateQty = (bookId, source, qty) => {
    if (qty <= 0) { removeItem(bookId, source); return; }
    BV.Store.updateCartQty(bookId, source, qty);
    renderStep();
  };
  const removeItem = (bookId, source) => { BV.Store.removeFromCart(bookId, source); renderStep(); };
  const clearCart = () => { BV.UI.confirm('Clear Cart','Remove all items from your cart?', ()=>{ BV.Store.clearCart(); renderStep(); }, true); };

  const applyCoupon = () => {
    const code = document.getElementById('coupon-input')?.value?.trim().toUpperCase();
    if (COUPONS[code]) { appliedCoupon = code; BV.UI.toast(`Coupon applied! 🎉`, `${COUPONS[code]*100}% discount applied.`, 'success'); renderStep(); }
    else { BV.UI.toast('Invalid coupon', 'Code not found. Try BOOKVERSE10', 'error'); }
  };

  const submitShipping = () => {
    const form = document.getElementById('shipping-form');
    if (!form || !form.checkValidity()) { form?.reportValidity(); return; }
    const fd = new FormData(form);
    window._checkoutShipping = Object.fromEntries(fd.entries());
    nextStep();
  };

  const selectPayment = (method) => {
    document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
    document.getElementById(`pay-${method}`)?.classList.add('selected');
  };

  const placeOrder = () => {
    const session = BV.Store.getSession();
    if (!session) return;
    const selectedPayment = document.querySelector('.payment-method.selected input')?.value || 'razorpay';
    const cart = BV.Store.getCart();
    const subtotal = BV.Store.getCartTotal();
    const discount = appliedCoupon ? subtotal * COUPONS[appliedCoupon] : 0;
    const shipping = subtotal*83>=500 ? 0 : 49/83;
    const tax = (subtotal-discount)*0.18;
    const total = subtotal - discount + tax + shipping;

    const orderData = {
      userId: session.id,
      items: cart.map(c => {
        const b = c.source==='store' ? BV.Store.getStoreBookById(c.bookId) : BV.Store.getListingById(c.bookId);
        return { ...c, title: b?.title||'Unknown' };
      }),
      total: total,
      shippingAddress: window._checkoutShipping || { name: session.name },
      paymentMethod: selectedPayment,
      trackingNumber: 'BV' + String(Date.now()).slice(-9),
    };

    // Simulate Razorpay integration
    if (selectedPayment === 'razorpay') {
      BV.UI.toast('🔐 Processing payment...', 'Razorpay gateway integration ready', 'info', 2000);
    }

    setTimeout(() => {
      const order = BV.Store.placeOrder(orderData);
      renderOrderConfirmation(order);
      BV.Store.updateCartBadge();
    }, selectedPayment === 'razorpay' ? 1500 : 500);
  };

  const renderOrderConfirmation = (order) => {
    const el = document.getElementById('cart-step-content');
    if (!el) return;
    el.innerHTML = `
      <div style="text-align:center;padding:var(--sp-16) var(--sp-6);max-width:500px;margin:auto">
        <div style="width:80px;height:80px;border-radius:50%;background:var(--clr-success-dim);border:3px solid var(--clr-success);display:flex;align-items:center;justify-content:center;font-size:2.5rem;margin:0 auto var(--sp-6)" class="anim-scale-in">🎉</div>
        <h2 style="font-size:var(--text-2xl);margin-bottom:var(--sp-3)">Order Placed Successfully!</h2>
        <p style="color:var(--clr-text-muted);margin-bottom:var(--sp-6)">Your order <strong style="color:var(--clr-primary)">${order.id}</strong> has been confirmed. You'll receive updates via notifications.</p>
        <div style="background:var(--clr-success-dim);border:1px solid var(--clr-success);border-radius:var(--radius-xl);padding:var(--sp-4);margin-bottom:var(--sp-8);text-align:left">
          <div style="font-size:var(--text-sm);display:flex;flex-direction:column;gap:var(--sp-2)">
            <div style="display:flex;justify-content:space-between"><span>Order ID:</span><strong>${order.id}</strong></div>
            <div style="display:flex;justify-content:space-between"><span>Total:</span><strong>₹${(order.total*83).toFixed(0)}</strong></div>
            <div style="display:flex;justify-content:space-between"><span>Status:</span><span class="badge badge-success">Confirmed</span></div>
            <div style="display:flex;justify-content:space-between"><span>Tracking:</span><strong>${order.trackingNumber}</strong></div>
          </div>
        </div>
        <div style="display:flex;gap:var(--sp-4);justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="BV.App.navigate('orders')">View My Orders</button>
          <button class="btn btn-outline" onclick="BV.App.navigate('bookstore')">Continue Shopping</button>
        </div>
      </div>
    `;
    // Update step indicator
    document.querySelector('.steps')?.remove();
  };

  return { render, init, nextStep, prevStep, updateQty, removeItem, clearCart, applyCoupon, submitShipping, selectPayment, placeOrder };
})();

/* ─────────────────────────────────────────────────────────────
   WISHLIST
───────────────────────────────────────────────────────────── */
BV.Wishlist = (() => {
  const render = () => {
    const session = BV.Store.getSession();
    if (!session) return `<div class="page-content"><div class="container" style="padding-block:var(--sp-20)"><div class="empty-state"><div class="empty-icon">❤️</div><h3>Sign in to view wishlist</h3><button class="btn btn-primary" onclick="BV.App.navigate('auth')">Sign In</button></div></div></div>`;
    const ids = BV.Store.getWishlist();
    const books = ids.map(id => BV.Store.getStoreBookById(id)).filter(Boolean);

    return `
      <div class="page-content">
        <div class="container">
          <div class="page-header">
            <h1>❤️ My Wishlist</h1>
            <p>${books.length} saved book${books.length!==1?'s':''}</p>
          </div>
          ${books.length ? `
            <div style="display:flex;justify-content:flex-end;gap:var(--sp-3);margin-bottom:var(--sp-5)">
              <button class="btn btn-primary btn-sm" onclick="BV.Wishlist.addAllToCart()">🛒 Add All to Cart</button>
              <button class="btn btn-ghost btn-sm" onclick="BV.Wishlist.clearAll()">Clear All</button>
            </div>
            <div class="browse-grid browse-grid-4" id="wishlist-grid">
              ${books.map(b => wishlistCard(b)).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-icon">🤍</div>
              <h3>Your wishlist is empty</h3>
              <p>Save books you love and revisit them anytime.</p>
              <button class="btn btn-primary" onclick="BV.App.navigate('bookstore')">Discover Books</button>
            </div>
          `}
        </div>
      </div>
    `;
  };

  const wishlistCard = (book) => {
    const gradient = BV.Store.getBookGradient(book.category);
    const discount = book.originalPrice ? Math.round((1-book.price/book.originalPrice)*100) : 0;
    return `
      <div class="book-card hover-lift">
        <div class="book-cover" onclick="BV.App.navigate('book','${book.id}','store')" style="cursor:pointer">
          <div class="book-cover-bg" style="background:${gradient}"></div>
          <div class="book-cover-overlay"></div>
          <div class="book-cover-text"><div class="book-cover-title">${BV.UI.escapeHtml(book.title)}</div></div>
          ${discount>=10?`<div class="book-card-badges"><span class="badge badge-accent">-${discount}%</span></div>`:''}
        </div>
        <div class="book-card-body">
          <div class="book-category">${book.category}</div>
          <div class="book-title">${BV.UI.escapeHtml(book.title)}</div>
          <div class="book-author">by ${BV.UI.escapeHtml(book.author)}</div>
          <div class="book-price-row">
            <div><span class="book-price">₹${(book.price*83).toFixed(0)}</span>${book.originalPrice?`<span class="book-price-original">₹${(book.originalPrice*83).toFixed(0)}</span>`:''}</div>
          </div>
          <div style="display:flex;gap:var(--sp-2);margin-top:var(--sp-2)">
            <button class="btn btn-primary btn-sm flex-1" onclick="BV.UI.addToCartBtn('${book.id}','store',this)">🛒 Add to Cart</button>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="BV.Wishlist.remove('${book.id}')" title="Remove">🗑️</button>
          </div>
        </div>
      </div>
    `;
  };

  const remove = (bookId) => {
    BV.Store.removeFromWishlist(bookId);
    BV.App.navigate('wishlist');
    BV.UI.toast('Removed from wishlist','','info',2000);
  };
  const clearAll = () => { BV.UI.confirm('Clear Wishlist','Remove all books from your wishlist?',()=>{ BV.Store.setWishlist([]); BV.Store.updateWishlistBadge(); BV.App.navigate('wishlist'); },true); };
  const addAllToCart = () => {
    const session = BV.Store.getSession();
    if (!session) { BV.App.navigate('auth'); return; }
    BV.Store.getWishlist().forEach(id => {
      const b = BV.Store.getStoreBookById(id);
      if (b) BV.Store.addToCart({ bookId:id, source:'store', price:b.price, title:b.title, author:b.author });
    });
    BV.Store.updateCartBadge();
    BV.UI.toast('All items added to cart! 🛒','','success');
    BV.App.navigate('cart');
  };

  return { render, remove, clearAll, addAllToCart };
})();

/* ─────────────────────────────────────────────────────────────
   ORDERS
───────────────────────────────────────────────────────────── */
BV.Orders = (() => {
  const render = () => {
    const session = BV.Store.getSession();
    if (!session) return `<div class="page-content"><div class="container" style="padding-block:var(--sp-20)"><div class="empty-state"><div class="empty-icon">📦</div><h3>Sign in to view orders</h3><button class="btn btn-primary" onclick="BV.App.navigate('auth')">Sign In</button></div></div></div>`;

    const orders = session.role === 'admin' ? BV.Store.getOrders() : BV.Store.getUserOrders(session.id);
    orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    return `
      <div class="page-content">
        <div class="container">
          <div class="page-header">
            <h1>📦 My Orders</h1>
            <p>${orders.length} order${orders.length!==1?'s':''} total</p>
          </div>
          ${orders.length ? `
            <div style="display:flex;flex-direction:column;gap:var(--sp-4)">
              ${orders.map(o => orderCardHTML(o)).join('')}
            </div>
          ` : `
            <div class="empty-state"><div class="empty-icon">📦</div><h3>No orders yet</h3><p>Start shopping to see your orders here!</p><button class="btn btn-primary" onclick="BV.App.navigate('bookstore')">Shop Now</button></div>
          `}
        </div>
      </div>
    `;
  };

  const orderCardHTML = (order) => {
    const statusColors = { pending:'warning', confirmed:'info', shipped:'primary', delivered:'success', cancelled:'danger' };
    return `
      <div class="card card-solid" style="border-radius:var(--radius-xl);overflow:hidden">
        <div class="card-header" style="background:var(--clr-surface-2)">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3)">
            <div style="display:flex;align-items:center;gap:var(--sp-4)">
              <div>
                <div style="font-weight:var(--fw-bold);font-size:var(--text-sm)">${order.id}</div>
                <div style="font-size:var(--text-xs);color:var(--clr-text-muted)">${BV.UI.formatDate(order.createdAt)}</div>
              </div>
              ${BV.UI.orderStatusHTML(order.status)}
            </div>
            <div style="display:flex;align-items:center;gap:var(--sp-4)">
              <span style="font-weight:var(--fw-bold)">₹${(order.total*83).toFixed(0)}</span>
              ${order.trackingNumber ? `<span style="font-size:var(--text-xs);color:var(--clr-text-muted)">Track: ${order.trackingNumber}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="card-body">
          <div style="display:flex;flex-direction:column;gap:var(--sp-2)">
            ${(order.items||[]).map(item => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--sp-2) 0;border-bottom:1px solid var(--clr-border)">
                <div>
                  <div style="font-size:var(--text-sm);font-weight:var(--fw-medium)">${BV.UI.escapeHtml(item.title||'')}</div>
                  <div style="font-size:var(--text-xs);color:var(--clr-text-muted)">Qty: ${item.quantity||1}</div>
                </div>
                <span style="font-size:var(--text-sm);font-weight:var(--fw-semibold)">₹${(item.price*(item.quantity||1)*83).toFixed(0)}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="card-footer" style="display:flex;justify-content:flex-end;gap:var(--sp-3)">
          ${order.status==='delivered' ? `<button class="btn btn-outline btn-sm" onclick="BV.App.navigate('bookstore')">📝 Write Review</button>` : ''}
          ${order.status==='pending'||order.status==='confirmed' ? `<button class="btn btn-ghost btn-sm danger" onclick="BV.Orders.cancelOrder('${order.id}')">Cancel Order</button>` : ''}
          <button class="btn btn-primary btn-sm" onclick="BV.Orders.viewDetails('${order.id}')">View Details</button>
        </div>
      </div>
    `;
  };

  const cancelOrder = (id) => {
    BV.UI.confirm('Cancel Order', 'Are you sure you want to cancel this order?', () => {
      BV.Store.updateOrderStatus(id, 'cancelled');
      BV.UI.toast('Order cancelled', '', 'info');
      BV.App.navigate('orders');
    }, true);
  };

  const viewDetails = (id) => {
    const order = BV.Store.getOrders().find(o => o.id === id);
    if (!order) return;
    BV.UI.openModal(`
      <div class="modal-header"><span class="modal-title">Order ${order.id}</span><button class="modal-close" onclick="BV.UI.closeModal()">✕</button></div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:var(--sp-4)">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4)">
          ${[{l:'Status',v:BV.UI.orderStatusHTML(order.status)},{l:'Date',v:BV.UI.formatDate(order.createdAt)},{l:'Payment',v:order.paymentMethod||'N/A'},{l:'Tracking',v:order.trackingNumber||'Pending'}].map(r=>`<div><div style="font-size:var(--text-xs);color:var(--clr-text-faint);margin-bottom:2px">${r.l}</div><div style="font-size:var(--text-sm);font-weight:var(--fw-medium)">${r.v}</div></div>`).join('')}
        </div>
        <hr class="divider">
        <div><h5 style="margin-bottom:var(--sp-3)">Items</h5>${(order.items||[]).map(i=>`<div style="display:flex;justify-content:space-between;font-size:var(--text-sm);padding:var(--sp-2) 0;border-bottom:1px solid var(--clr-border)"><span>${BV.UI.escapeHtml(i.title||'')} × ${i.quantity||1}</span><span>₹${(i.price*(i.quantity||1)*83).toFixed(0)}</span></div>`).join('')}</div>
        ${order.shippingAddress ? `<div><h5 style="margin-bottom:var(--sp-3)">Shipping To</h5><p style="font-size:var(--text-sm);color:var(--clr-text-muted);line-height:var(--lh-relaxed)">${BV.UI.escapeHtml(order.shippingAddress.name||'')}<br>${BV.UI.escapeHtml(order.shippingAddress.street||'')}<br>${BV.UI.escapeHtml(order.shippingAddress.city||'')} ${BV.UI.escapeHtml(order.shippingAddress.zip||'')}</p></div>` : ''}
        <div style="display:flex;justify-content:space-between;font-weight:var(--fw-bold);border-top:1px solid var(--clr-border);padding-top:var(--sp-3)"><span>Total</span><span style="color:var(--clr-primary)">₹${(order.total*83).toFixed(0)}</span></div>
      </div>
    `);
  };

  return { render, cancelOrder, viewDetails };
})();

/* ─────────────────────────────────────────────────────────────
   USER PROFILE (Seller)
───────────────────────────────────────────────────────────── */
BV.Profile = (() => {
  const render = (userId) => {
    const session = BV.Store.getSession();
    const targetId = userId || session?.id;
    const user = BV.Store.getUserById(targetId);
    if (!user) return `<div class="page-content"><div class="container"><div class="empty-state"><div class="empty-icon">👤</div><h3>User not found</h3></div></div></div>`;

    const isOwn = session?.id === user.id;
    const listings = BV.Store.getListings().filter(l => l.sellerId === user.id && l.status === 'active');
    const orders = BV.Store.getUserOrders(user.id);

    return `
      <div class="page-content">
        <div class="container">
          <div style="display:grid;grid-template-columns:300px 1fr;gap:var(--sp-8);align-items:start">
            <!-- Profile Card -->
            <div class="card card-solid" style="border-radius:var(--radius-2xl);overflow:hidden;position:sticky;top:calc(var(--nav-h)+var(--sp-4))">
              <div style="background:linear-gradient(135deg,var(--clr-primary),var(--clr-accent));padding:var(--sp-8);text-align:center">
                <div class="avatar avatar-2xl avatar-ring" style="margin:0 auto var(--sp-4)">${user.name[0].toUpperCase()}</div>
                <h2 style="color:#fff;font-size:var(--text-xl)">${BV.UI.escapeHtml(user.name)}</h2>
                <span class="badge badge-gold" style="margin-top:var(--sp-2)">${user.role}</span>
              </div>
              <div class="card-body" style="display:flex;flex-direction:column;gap:var(--sp-4)">
                ${user.bio ? `<p style="font-size:var(--text-sm);color:var(--clr-text-muted);line-height:var(--lh-relaxed)">${BV.UI.escapeHtml(user.bio)}</p>` : ''}
                ${user.sellerRating ? `<div style="display:flex;align-items:center;gap:var(--sp-2)"><span style="color:var(--clr-gold);font-size:var(--text-lg)">★</span><span style="font-weight:var(--fw-bold)">${user.sellerRating}</span><span style="font-size:var(--text-xs);color:var(--clr-text-muted)">seller rating</span></div>` : ''}
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3);text-align:center">
                  <div style="padding:var(--sp-3);background:var(--glass-bg);border-radius:var(--radius-lg)"><div style="font-weight:var(--fw-bold);font-size:var(--text-lg)">${listings.length}</div><div style="font-size:var(--text-xs);color:var(--clr-text-muted)">Listings</div></div>
                  <div style="padding:var(--sp-3);background:var(--glass-bg);border-radius:var(--radius-lg)"><div style="font-weight:var(--fw-bold);font-size:var(--text-lg)">${user.totalSales||0}</div><div style="font-size:var(--text-xs);color:var(--clr-text-muted)">Sales</div></div>
                </div>
                <div style="font-size:var(--text-xs);color:var(--clr-text-faint)">📅 Member since ${BV.UI.formatDate(user.joinDate)}</div>
                ${isOwn ? `<button class="btn btn-outline btn-sm" onclick="BV.Profile.editProfile()">✏️ Edit Profile</button>` : `<button class="btn btn-primary btn-sm">💬 Contact Seller</button>`}
              </div>
            </div>

            <!-- Content -->
            <div>
              ${listings.length ? `
                <div class="section-header"><div class="section-header-text"><div class="section-label">Active</div><h3>Marketplace Listings</h3></div></div>
                <div class="browse-grid">${listings.map(l => BV.UI.marketplaceCardHTML(l)).join('')}</div>
              ` : `<div class="empty-state"><div class="empty-icon">📦</div><h3>No active listings</h3></div>`}

              ${isOwn && orders.length ? `
                <div style="margin-top:var(--sp-8)">
                  <div class="section-header"><div class="section-header-text"><div class="section-label">Recent</div><h3>My Orders</h3></div><button class="btn btn-outline btn-sm" onclick="BV.App.navigate('orders')">All Orders</button></div>
                  <div style="display:flex;flex-direction:column;gap:var(--sp-3)">
                    ${orders.slice(0,3).map(o => `
                      <div class="card card-solid" style="border-radius:var(--radius-lg)">
                        <div class="card-body" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3)">
                          <div><div style="font-weight:var(--fw-bold);font-size:var(--text-sm)">${o.id}</div><div style="font-size:var(--text-xs);color:var(--clr-text-muted)">${BV.UI.formatDate(o.createdAt)}</div></div>
                          ${BV.UI.orderStatusHTML(o.status)}
                          <span style="font-weight:var(--fw-bold)">₹${(o.total*83).toFixed(0)}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const editProfile = () => {
    const session = BV.Store.getSession();
    if (!session) return;
    BV.UI.openModal(`
      <div class="modal-header"><span class="modal-title">✏️ Edit Profile</span><button class="modal-close" onclick="BV.UI.closeModal()">✕</button></div>
      <div class="modal-body">
        <form onsubmit="BV.Profile.saveProfile(event)" style="display:flex;flex-direction:column;gap:var(--sp-4)">
          <div class="form-group"><label class="form-label required">Full Name</label><input type="text" class="form-control" name="name" value="${BV.UI.escapeHtml(session.name)}" required></div>
          <div class="form-group"><label class="form-label">Bio</label><textarea class="form-control" name="bio" rows="3" placeholder="Tell others about yourself...">${BV.UI.escapeHtml(session.bio||'')}</textarea></div>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      </div>
    `, 'modal-sm');
  };

  const saveProfile = (e) => {
    e.preventDefault();
    const session = BV.Store.getSession();
    if (!session) return;
    const fd = new FormData(e.target);
    const changes = { name: fd.get('name'), bio: fd.get('bio') };
    BV.Store.updateUser(session.id, changes);
    BV.Store.setSession({ ...session, ...changes });
    BV.Auth.updateNavbar();
    BV.UI.closeModal();
    BV.UI.toast('Profile updated!', '', 'success');
    BV.App.navigate('profile');
  };

  return { render, editProfile, saveProfile };
})();
