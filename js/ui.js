/* ============================================================
   BookVerse — UI Utilities (Toast, Modal, Helpers)
   ============================================================ */

window.BV = window.BV || {};

BV.UI = (() => {

  /* ─────────────────────────────────────────
     TOAST
  ───────────────────────────────────────── */
  const toast = (title, msg='', type='info', duration=3500) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `
      <span class="toast-icon">${icons[type]||'ℹ️'}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
      </div>
      <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
    `;
    container.appendChild(t);
    setTimeout(() => {
      t.classList.add('hiding');
      setTimeout(() => t.remove(), 350);
    }, duration);
  };

  /* ─────────────────────────────────────────
     MODAL
  ───────────────────────────────────────── */
  let activeModal = null;

  const openModal = (html, size='') => {
    const overlay = document.getElementById('modal-overlay');
    const inner = document.getElementById('modal-inner');
    if (!overlay || !inner) return;
    inner.className = `modal ${size}`;
    inner.innerHTML = html;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    activeModal = overlay;
    // Close on overlay click
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
    return inner;
  };

  const closeModal = () => {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) { overlay.classList.remove('active'); }
    document.body.style.overflow = '';
    activeModal = null;
  };

  /* ─────────────────────────────────────────
     CONFIRM DIALOG
  ───────────────────────────────────────── */
  const confirm = (title, msg, onConfirm, danger=false) => {
    openModal(`
      <div class="modal-header">
        <span class="modal-title">${title}</span>
        <button class="modal-close" onclick="BV.UI.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <p style="color:var(--clr-text-muted);line-height:var(--lh-relaxed)">${msg}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" onclick="BV.UI.closeModal()">Cancel</button>
        <button class="btn ${danger?'btn-danger':'btn-primary'} btn-sm" id="confirm-btn">Confirm</button>
      </div>
    `, 'modal-sm');
    document.getElementById('confirm-btn').onclick = () => { closeModal(); onConfirm(); };
  };

  /* ─────────────────────────────────────────
     LOADING
  ───────────────────────────────────────── */
  const showLoading = (containerId) => {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = `<div style="display:flex;justify-content:center;padding:var(--sp-12)"><div class="spinner"></div></div>`;
  };

  const showSkeletons = (containerId, count=6) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = Array(count).fill(0).map(() => `
      <div class="book-card" style="pointer-events:none">
        <div class="skeleton" style="height:220px;border-radius:var(--radius-xl) var(--radius-xl) 0 0;"></div>
        <div class="book-card-body">
          <div class="skeleton skeleton-line short"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line medium"></div>
          <div style="margin-top:auto;padding-top:var(--sp-3);border-top:1px solid var(--clr-border)">
            <div class="skeleton skeleton-line short"></div>
          </div>
        </div>
      </div>
    `).join('');
  };

  /* ─────────────────────────────────────────
     BOOK COVER HTML
  ───────────────────────────────────────── */
  const bookCoverHTML = (book, height='220px') => {
    const gradient = BV.Store.getBookGradient(book.category);
    return `
      <div class="book-cover-bg" style="background:${gradient};height:${height}"></div>
      <div class="book-cover-overlay"></div>
      <div class="book-cover-text">
        <div class="book-cover-title">${escapeHtml(book.title)}</div>
        <div class="book-cover-author">${escapeHtml(book.author)}</div>
      </div>
    `;
  };

  /* ─────────────────────────────────────────
     STAR RATING HTML
  ───────────────────────────────────────── */
  const starsHTML = (rating, size=11) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push(`<span class="star filled" style="font-size:${size}px">★</span>`);
      else if (rating >= i - 0.5) stars.push(`<span class="star half" style="font-size:${size}px">★</span>`);
      else stars.push(`<span class="star" style="font-size:${size}px">☆</span>`);
    }
    return `<div class="stars">${stars.join('')}</div>`;
  };

  /* ─────────────────────────────────────────
     BOOK CARD HTML
  ───────────────────────────────────────── */
  const bookCardHTML = (book, source='store') => {
    const inWishlist = BV.Store.isInWishlist(book.id);
    const discount = book.originalPrice ? Math.round((1 - book.price/book.originalPrice)*100) : 0;
    return `
      <div class="book-card hover-lift" data-id="${book.id}" data-source="${source}" onclick="BV.App.navigate('book', '${book.id}', '${source}')">
        <div class="book-cover">
          ${bookCoverHTML(book)}
          <div class="book-card-badges">
            ${book.bestseller ? '<span class="badge badge-gold">🔥 Bestseller</span>' : ''}
            ${book.newArrival ? '<span class="badge badge-teal">✨ New</span>' : ''}
            ${discount >= 10 ? `<span class="badge badge-accent">-${discount}%</span>` : ''}
          </div>
          <div class="book-card-actions">
            <button class="book-card-action-btn ${inWishlist?'active':''}" title="Wishlist"
              onclick="event.stopPropagation(); BV.UI.toggleWishlistBtn(this, '${book.id}')">❤️</button>
            <button class="book-card-action-btn" title="Quick View"
              onclick="event.stopPropagation(); BV.App.navigate('book','${book.id}','${source}')">👁</button>
          </div>
        </div>
        <div class="book-card-body">
          <div class="book-category">${escapeHtml(book.category)}</div>
          <div class="book-title">${escapeHtml(book.title)}</div>
          <div class="book-author">by ${escapeHtml(book.author)}</div>
          <div class="book-rating">
            ${starsHTML(book.rating)}
            <span class="rating-value">${book.rating}</span>
            <span class="rating-count">(${(book.reviewCount||0).toLocaleString()})</span>
          </div>
          <div class="book-price-row">
            <div>
              <span class="book-price">₹${(book.price * 83).toFixed(0)}</span>
              ${book.originalPrice ? `<span class="book-price-original">₹${(book.originalPrice*83).toFixed(0)}</span>` : ''}
            </div>
            <button class="book-add-cart" title="Add to Cart"
              onclick="event.stopPropagation(); BV.UI.addToCartBtn('${book.id}', '${source}', this)">🛒</button>
          </div>
        </div>
      </div>
    `;
  };

  /* ─────────────────────────────────────────
     MARKETPLACE CARD HTML
  ───────────────────────────────────────── */
  const marketplaceCardHTML = (listing) => {
    const seller = BV.Store.getUserById(listing.sellerId);
    const gradient = BV.Store.getBookGradient(listing.category || 'Fiction');
    const conditionClass = {
      'New':'condition-new', 'Like New':'condition-like',
      'Good':'condition-good', 'Fair':'condition-fair', 'Poor':'condition-poor'
    }[listing.condition] || 'condition-good';

    return `
      <div class="book-card hover-lift" onclick="BV.App.navigate('book', '${listing.id}', 'marketplace')">
        <div class="book-cover">
          <div class="book-cover-bg" style="background:${gradient}"></div>
          <div class="book-cover-overlay"></div>
          <div class="book-cover-text">
            <div class="book-cover-title">${escapeHtml(listing.title)}</div>
            <div class="book-cover-author">${escapeHtml(listing.author)}</div>
          </div>
          <div class="book-card-badges">
            <span class="badge ${conditionClass}">${listing.condition}</span>
          </div>
        </div>
        <div class="book-card-body">
          <div class="book-category">${listing.category || 'Books'}</div>
          <div class="book-title">${escapeHtml(listing.title)}</div>
          <div class="book-author">by ${escapeHtml(listing.author)}</div>
          <div style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--text-xs);color:var(--clr-text-muted)">
            <span>Sold by</span>
            <span style="color:var(--clr-primary-light);font-weight:var(--fw-semibold)">${seller ? escapeHtml(seller.name) : 'Unknown'}</span>
            ${seller ? `<span style="color:var(--clr-gold)">★ ${seller.sellerRating}</span>` : ''}
          </div>
          <div class="book-price-row">
            <div>
              <span class="book-price">₹${(listing.price * 83).toFixed(0)}</span>
              ${listing.originalPrice ? `<span class="book-price-original">₹${(listing.originalPrice*83).toFixed(0)}</span>` : ''}
            </div>
            <button class="book-add-cart" title="Add to Cart"
              onclick="event.stopPropagation(); BV.UI.addToCartBtn('${listing.id}', 'marketplace', this)">🛒</button>
          </div>
        </div>
      </div>
    `;
  };

  /* ─────────────────────────────────────────
     BUTTON ACTIONS
  ───────────────────────────────────────── */
  const toggleWishlistBtn = (btn, bookId) => {
    const session = BV.Store.getSession();
    if (!session) { toast('Sign in required', 'Please login to add to wishlist', 'warning'); BV.App.navigate('auth'); return; }
    const added = BV.Store.toggleWishlist(bookId);
    btn.classList.toggle('active', added);
    btn.innerHTML = added ? '❤️' : '🤍';
    toast(added ? 'Added to wishlist!' : 'Removed from wishlist', '', added ? 'success' : 'info', 2000);
    // Animate
    if (added) { btn.style.animation = 'heartBeat 0.5s'; setTimeout(() => btn.style.animation='', 600); }
  };

  const addToCartBtn = (bookId, source, btn) => {
    const session = BV.Store.getSession();
    if (!session) { toast('Sign in required', 'Please login to add to cart', 'warning'); BV.App.navigate('auth'); return; }

    let book;
    if (source === 'store') book = BV.Store.getStoreBookById(bookId);
    else book = BV.Store.getListingById(bookId);
    if (!book) return;

    BV.Store.addToCart({ bookId, source, price: book.price, title: book.title, author: book.author });
    toast('Added to cart!', `${book.title}`, 'success', 2500);
    // Animate cart icon
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) { cartBtn.classList.add('bump'); setTimeout(() => cartBtn.classList.remove('bump'), 500); }
    // Animate button
    if (btn) { btn.style.animation = 'cartBounce 0.4s'; setTimeout(() => btn.style.animation='', 500); }
  };

  /* ─────────────────────────────────────────
     AVATAR HTML
  ───────────────────────────────────────── */
  const avatarHTML = (user, size='md') => {
    if (!user) return `<div class="avatar avatar-${size}">?</div>`;
    const initials = user.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : '?';
    return `<div class="avatar avatar-${size}">${initials}</div>`;
  };

  /* ─────────────────────────────────────────
     ORDER STATUS
  ───────────────────────────────────────── */
  const orderStatusHTML = (status) => {
    return `<span class="order-status status-${status}"><span class="status-dot"></span>${status.charAt(0).toUpperCase()+status.slice(1)}</span>`;
  };

  /* ─────────────────────────────────────────
     FORMAT HELPERS
  ───────────────────────────────────────── */
  const formatPrice = (usd) => `₹${(usd * 83).toFixed(0)}`;
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  };
  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff/60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins/60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs/24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateStr);
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  /* ─────────────────────────────────────────
     RIPPLE EFFECT
  ───────────────────────────────────────── */
  const addRipple = (el) => {
    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.cssText = `left:${x}px;top:${y}px;width:${Math.max(rect.width,rect.height)}px;height:${Math.max(rect.width,rect.height)}px;transform:translate(-50%,-50%) scale(0)`;
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  };

  /* ─────────────────────────────────────────
     PAGINATION
  ───────────────────────────────────────── */
  const paginationHTML = (current, total, onPage) => {
    if (total <= 1) return '';
    const pages = [];
    const range = 2;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - range && i <= current + range)) {
        pages.push(i);
      } else if (pages[pages.length-1] !== '...') {
        pages.push('...');
      }
    }
    return `
      <div class="pagination">
        <button class="page-btn" ${current===1?'disabled':''} onclick="${onPage}(${current-1})">‹</button>
        ${pages.map(p => p === '...'
          ? `<span style="padding:0 var(--sp-2);color:var(--clr-text-faint)">…</span>`
          : `<button class="page-btn ${p===current?'active':''}" onclick="${onPage}(${p})">${p}</button>`
        ).join('')}
        <button class="page-btn" ${current===total?'disabled':''} onclick="${onPage}(${current+1})">›</button>
      </div>
    `;
  };

  /* ─────────────────────────────────────────
     SCROLL ANIMATION
  ───────────────────────────────────────── */
  const observeAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-fade-in-up');
          entry.target.style.opacity = '1';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });
  };

  return {
    toast, openModal, closeModal, confirm,
    showLoading, showSkeletons,
    bookCoverHTML, starsHTML, bookCardHTML, marketplaceCardHTML,
    toggleWishlistBtn, addToCartBtn,
    avatarHTML, orderStatusHTML,
    formatPrice, formatDate, formatTimeAgo, escapeHtml,
    addRipple, paginationHTML, observeAnimations,
  };
})();
