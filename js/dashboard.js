/* ============================================================
   BookVerse — Dashboard & Admin Panel
   ============================================================ */

window.BV = window.BV || {};

/* ─────────────────────────────────────────────────────────────
   USER DASHBOARD
───────────────────────────────────────────────────────────── */
BV.Dashboard = (() => {
  let activeSection = 'overview';

  const render = () => {
    const session = BV.Store.getSession();
    if (!session) return `<div class="page-content"><div class="container" style="padding-block:var(--sp-20)"><div class="empty-state"><div class="empty-icon">📊</div><h3>Sign in to view dashboard</h3><button class="btn btn-primary" onclick="BV.App.navigate('auth')">Sign In</button></div></div></div>`;

    const sections = [
      { id:'overview', label:'Overview', icon:'📊' },
      { id:'orders', label:'My Orders', icon:'📦' },
      { id:'listings', label:'My Listings', icon:'🏪', sellerOnly:true },
      { id:'wishlist', label:'Wishlist', icon:'❤️' },
      { id:'reviews', label:'My Reviews', icon:'⭐' },
      { id:'settings', label:'Account Settings', icon:'⚙️' },
    ].filter(s => !s.sellerOnly || session.role === 'seller' || session.role === 'admin');

    return `
      <div class="page-content">
        <div class="container">
          <div class="page-header">
            <h1>👋 Hello, ${BV.UI.escapeHtml(session.name.split(' ')[0])}!</h1>
            <p>Manage your account, orders and listings</p>
          </div>
          <div class="dashboard-grid">
            <!-- Sidebar Nav -->
            <aside class="dashboard-sidebar">
              <div class="card card-solid" style="border-radius:var(--radius-xl);padding:var(--sp-4);margin-bottom:var(--sp-4);text-align:center">
                <div class="avatar avatar-xl" style="margin:0 auto var(--sp-3)">${session.name[0].toUpperCase()}</div>
                <div style="font-weight:var(--fw-bold)">${BV.UI.escapeHtml(session.name)}</div>
                <div style="font-size:var(--text-xs);color:var(--clr-text-muted);margin-top:2px">${BV.UI.escapeHtml(session.email)}</div>
                <span class="badge badge-primary" style="margin-top:var(--sp-2)">${session.role}</span>
              </div>
              <nav class="dashboard-nav">
                ${sections.map(s => `
                  <button class="dashboard-nav-item ${activeSection===s.id?'active':''}" onclick="BV.Dashboard.switchSection('${s.id}')">
                    <span class="icon">${s.icon}</span>${s.label}
                  </button>
                `).join('')}
                ${session.role === 'admin' ? `
                  <div style="border-top:1px solid var(--clr-border);margin:var(--sp-2) 0;padding-top:var(--sp-2)">
                    <button class="dashboard-nav-item" onclick="BV.App.navigate('admin')">
                      <span class="icon">⚙️</span>Admin Panel
                    </button>
                  </div>
                ` : ''}
              </nav>
            </aside>

            <!-- Content -->
            <main id="dashboard-content">
              ${renderSection(session)}
            </main>
          </div>
        </div>
      </div>
    `;
  };

  const renderSection = (session) => {
    session = session || BV.Store.getSession();
    if (!session) return '';
    switch(activeSection) {
      case 'overview':  return renderOverview(session);
      case 'orders':    return renderUserOrders(session);
      case 'listings':  return renderUserListings(session);
      case 'wishlist':  return renderUserWishlist(session);
      case 'reviews':   return renderUserReviews(session);
      case 'settings':  return renderSettings(session);
      default:          return renderOverview(session);
    }
  };

  const renderOverview = (session) => {
    const orders = BV.Store.getUserOrders(session.id);
    const wishlist = BV.Store.getWishlist();
    const listings = BV.Store.getListings().filter(l=>l.sellerId===session.id&&l.status==='active');
    const reviews = BV.Store.getReviews().filter(r=>r.userId===session.id);
    const totalSpent = orders.reduce((s,o)=>s+o.total,0);

    return `
      <div style="display:flex;flex-direction:column;gap:var(--sp-6)">
        <!-- Stats -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--sp-4)">
          ${[
            {icon:'📦', label:'Total Orders', value:orders.length, color:'var(--clr-primary)', bg:'var(--clr-primary-dim)'},
            {icon:'💰', label:'Total Spent', value:`₹${(totalSpent*83).toFixed(0)}`, color:'var(--clr-gold)', bg:'var(--clr-gold-dim)'},
            {icon:'❤️', label:'Wishlist', value:wishlist.length, color:'var(--clr-accent)', bg:'var(--clr-accent-dim)'},
            {icon:'⭐', label:'Reviews', value:reviews.length, color:'var(--clr-teal)', bg:'var(--clr-teal-dim)'},
            ...(session.role==='seller'||session.role==='admin'?[{icon:'🏪', label:'Active Listings', value:listings.length, color:'var(--clr-success)', bg:'var(--clr-success-dim)'}]:[]),
          ].map(s => `
            <div class="stat-card">
              <div class="stat-icon" style="background:${s.bg};color:${s.color}">${s.icon}</div>
              <div>
                <div class="stat-value" style="color:${s.color}">${s.value}</div>
                <div class="stat-label">${s.label}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Recent Orders -->
        ${orders.length ? `
          <div>
            <div class="section-header" style="margin-bottom:var(--sp-4)"><h3>Recent Orders</h3><button class="btn btn-ghost btn-sm" onclick="BV.Dashboard.switchSection('orders')">View All →</button></div>
            <div style="display:flex;flex-direction:column;gap:var(--sp-3)">
              ${orders.slice(0,3).map(o => `
                <div class="card card-solid" style="border-radius:var(--radius-lg)">
                  <div class="card-body" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3)">
                    <div>
                      <div style="font-weight:var(--fw-bold);font-size:var(--text-sm)">${o.id}</div>
                      <div style="font-size:var(--text-xs);color:var(--clr-text-muted)">${BV.UI.formatTimeAgo(o.createdAt)} • ${(o.items||[]).length} item(s)</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:var(--sp-4)">
                      ${BV.UI.orderStatusHTML(o.status)}
                      <span style="font-weight:var(--fw-bold)">₹${(o.total*83).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Wishlist Preview -->
        ${wishlist.length ? `
          <div>
            <div class="section-header" style="margin-bottom:var(--sp-4)"><h3>❤️ Wishlist Preview</h3><button class="btn btn-ghost btn-sm" onclick="BV.App.navigate('wishlist')">View All →</button></div>
            <div class="browse-grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">
              ${wishlist.slice(0,4).map(id => {
                const b = BV.Store.getStoreBookById(id);
                if (!b) return '';
                return `<div class="book-card" style="cursor:pointer" onclick="BV.App.navigate('book','${b.id}','store')"><div class="book-cover" style="height:160px">${BV.UI.bookCoverHTML(b,'160px')}</div><div class="book-card-body"><div class="book-title" style="font-size:var(--text-xs)">${BV.UI.escapeHtml(b.title)}</div><div class="book-price" style="font-size:var(--text-sm)">₹${(b.price*83).toFixed(0)}</div></div></div>`;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  const renderUserOrders = (session) => {
    const orders = BV.Store.getUserOrders(session.id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    if (!orders.length) return `<div class="empty-state"><div class="empty-icon">📦</div><h3>No orders yet</h3><button class="btn btn-primary" onclick="BV.App.navigate('bookstore')">Start Shopping</button></div>`;
    return `<div style="display:flex;flex-direction:column;gap:var(--sp-4)">${orders.map(o => {
      return `<div class="card card-solid" style="border-radius:var(--radius-xl);overflow:hidden"><div class="card-header" style="background:var(--clr-surface-2);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3)"><div style="display:flex;align-items:center;gap:var(--sp-4)"><div><div style="font-weight:var(--fw-bold);font-size:var(--text-sm)">${o.id}</div><div style="font-size:var(--text-xs);color:var(--clr-text-muted)">${BV.UI.formatDate(o.createdAt)}</div></div>${BV.UI.orderStatusHTML(o.status)}</div><span style="font-weight:var(--fw-bold)">₹${(o.total*83).toFixed(0)}</span></div><div class="card-body">${(o.items||[]).map(i=>`<div style="display:flex;justify-content:space-between;padding:var(--sp-1) 0;border-bottom:1px solid var(--clr-border);font-size:var(--text-sm)"><span>${BV.UI.escapeHtml(i.title||'')} × ${i.quantity||1}</span><span>₹${(i.price*(i.quantity||1)*83).toFixed(0)}</span></div>`).join('')}</div></div>`;
    }).join('')}</div>`;
  };

  const renderUserListings = (session) => {
    const listings = BV.Store.getListings().filter(l=>l.sellerId===session.id);
    if (!listings.length) return `<div class="empty-state"><div class="empty-icon">🏪</div><h3>No listings yet</h3><button class="btn btn-primary" onclick="BV.Marketplace.showListingForm()">List Your First Book</button></div>`;
    return `
      <div>
        <div style="display:flex;justify-content:flex-end;margin-bottom:var(--sp-4)">
          <button class="btn btn-primary btn-sm" onclick="BV.Marketplace.showListingForm()">+ New Listing</button>
        </div>
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Book</th><th>Condition</th><th>Price</th><th>Status</th><th>Views</th><th>Actions</th></tr></thead>
            <tbody>
              ${listings.map(l=>`
                <tr>
                  <td><div style="font-weight:var(--fw-semibold);font-size:var(--text-sm)">${BV.UI.escapeHtml(l.title)}</div><div style="font-size:var(--text-xs);color:var(--clr-text-muted)">${BV.UI.escapeHtml(l.author)}</div></td>
                  <td><span class="badge condition-${l.condition==='New'?'new':l.condition==='Like New'?'like':l.condition==='Good'?'good':l.condition==='Fair'?'fair':'poor'}">${l.condition}</span></td>
                  <td>₹${(l.price*83).toFixed(0)}</td>
                  <td>${l.status==='active'?'<span class="badge badge-success">Active</span>':'<span class="badge badge-muted">Inactive</span>'}</td>
                  <td>${l.viewCount||0}</td>
                  <td style="display:flex;gap:var(--sp-2)">
                    <button class="btn btn-ghost btn-sm btn-icon" onclick="BV.Marketplace.renderListingModal(BV.Store.getListingById('${l.id}'))" title="Edit">✏️</button>
                    <button class="btn btn-ghost btn-sm btn-icon" onclick="BV.Dashboard.deleteListing('${l.id}')" title="Delete">🗑️</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const renderUserWishlist = (session) => {
    const ids = BV.Store.getWishlist();
    const books = ids.map(id=>BV.Store.getStoreBookById(id)).filter(Boolean);
    if (!books.length) return `<div class="empty-state"><div class="empty-icon">🤍</div><h3>Wishlist is empty</h3><button class="btn btn-primary" onclick="BV.App.navigate('bookstore')">Discover Books</button></div>`;
    return `<div class="browse-grid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">${books.map(b=>BV.UI.bookCardHTML(b,'store')).join('')}</div>`;
  };

  const renderUserReviews = (session) => {
    const reviews = BV.Store.getReviews().filter(r=>r.userId===session.id);
    if (!reviews.length) return `<div class="empty-state"><div class="empty-icon">⭐</div><h3>No reviews yet</h3><p>Purchase and read books to write reviews!</p></div>`;
    return `<div style="display:flex;flex-direction:column;gap:var(--sp-4)">${reviews.map(r=>{
      const book = BV.Store.getStoreBookById(r.bookId);
      return `<div class="review-card"><div style="display:flex;align-items:center;justify-content:space-between"><div style="font-weight:var(--fw-semibold);font-size:var(--text-sm)">${book?BV.UI.escapeHtml(book.title):'Unknown Book'}</div><div style="display:flex;align-items:center;gap:var(--sp-1)">${BV.UI.starsHTML(r.rating,13)}<span style="font-size:var(--text-xs);font-weight:var(--fw-bold);color:var(--clr-gold)">${r.rating}</span></div></div><p class="review-text">${BV.UI.escapeHtml(r.text)}</p><div style="font-size:var(--text-xs);color:var(--clr-text-faint)">${BV.UI.formatDate(r.createdAt)}</div></div>`;
    }).join('')}</div>`;
  };

  const renderSettings = (session) => `
    <div style="display:flex;flex-direction:column;gap:var(--sp-6)">
      <div class="card card-solid" style="border-radius:var(--radius-xl)">
        <div class="card-header"><h4>Personal Information</h4></div>
        <div class="card-body">
          <form onsubmit="BV.Dashboard.saveSettings(event)" style="display:flex;flex-direction:column;gap:var(--sp-4)">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4)">
              <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-control" name="name" value="${BV.UI.escapeHtml(session.name)}" required></div>
              <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" value="${BV.UI.escapeHtml(session.email)}" disabled></div>
            </div>
            <div class="form-group"><label class="form-label">Bio</label><textarea class="form-control" name="bio" rows="3">${BV.UI.escapeHtml(session.bio||'')}</textarea></div>
            <div style="display:flex;gap:var(--sp-3)">
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
      <div class="card card-solid" style="border-radius:var(--radius-xl)">
        <div class="card-header"><h4>Account Actions</h4></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:var(--sp-3)">
          ${session.role==='buyer'?`<button class="btn btn-outline btn-sm" style="width:fit-content" onclick="BV.Dashboard.upgradeSeller()">🏪 Upgrade to Seller Account</button>`:''  }
          <button class="btn btn-danger btn-sm" style="width:fit-content" onclick="BV.Auth.logout()">🚪 Sign Out</button>
        </div>
      </div>
    </div>
  `;

  const switchSection = (section) => {
    activeSection = section;
    document.querySelectorAll('.dashboard-nav-item').forEach(b => b.classList.toggle('active', b.textContent.trim().includes(
      section==='overview'?'Overview':section==='orders'?'Orders':section==='listings'?'Listings':section==='wishlist'?'Wishlist':section==='reviews'?'Reviews':'Settings'
    )));
    const content = document.getElementById('dashboard-content');
    if (content) content.innerHTML = renderSection();
  };

  const saveSettings = (e) => {
    e.preventDefault();
    const session = BV.Store.getSession();
    if (!session) return;
    const fd = new FormData(e.target);
    const changes = { name: fd.get('name'), bio: fd.get('bio') };
    BV.Store.updateUser(session.id, changes);
    BV.Store.setSession({...session,...changes});
    BV.Auth.updateNavbar();
    BV.UI.toast('Settings saved!','','success');
  };

  const upgradeSeller = () => {
    const session = BV.Store.getSession();
    BV.UI.confirm('Upgrade Account','Upgrade to a seller account to list books on the marketplace?', ()=>{
      BV.Store.updateUser(session.id,{role:'seller'});
      BV.Store.setSession({...session,role:'seller'});
      BV.Auth.updateNavbar();
      BV.UI.toast('Account upgraded to Seller!','You can now list books','success');
      BV.App.navigate('dashboard');
    });
  };

  const deleteListing = (id) => {
    BV.UI.confirm('Delete Listing','Are you sure you want to delete this listing?', ()=>{
      BV.Store.deleteListing(id);
      BV.UI.toast('Listing deleted','','info');
      switchSection('listings');
    }, true);
  };

  return { render, switchSection, saveSettings, upgradeSeller, deleteListing };
})();

/* ─────────────────────────────────────────────────────────────
   ADMIN PANEL
───────────────────────────────────────────────────────────── */
BV.Admin = (() => {
  let activeTab = 'dashboard';

  const render = () => {
    const session = BV.Store.getSession();
    if (!session || session.role !== 'admin') {
      return `<div class="page-content"><div class="container" style="padding-block:var(--sp-20)"><div class="empty-state"><div class="empty-icon">🔒</div><h3>Admin Access Required</h3><p>This area is restricted to admin users only.</p><button class="btn btn-primary" onclick="BV.App.navigate('auth')">Sign In as Admin</button></div></div></div>`;
    }

    const tabs = [
      { id:'dashboard', label:'Dashboard', icon:'📊' },
      { id:'books', label:'Books', icon:'📚' },
      { id:'marketplace', label:'Marketplace', icon:'🏪' },
      { id:'users', label:'Users', icon:'👥' },
      { id:'orders', label:'Orders', icon:'📦' },
    ];

    return `
      <div class="page-content">
        <div class="container">
          <div class="page-header">
            <div style="display:flex;align-items:center;gap:var(--sp-3)">
              <div style="width:44px;height:44px;background:linear-gradient(135deg,var(--clr-primary),var(--clr-accent));border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;font-size:20px">⚙️</div>
              <div><h1>Admin Panel</h1><p>Manage your BookVerse platform</p></div>
            </div>
          </div>

          <div class="admin-layout">
            <!-- Admin Nav -->
            <aside>
              <nav class="dashboard-nav" style="position:sticky;top:calc(var(--nav-h)+var(--sp-4))">
                ${tabs.map(t=>`
                  <button class="dashboard-nav-item ${activeTab===t.id?'active':''}" onclick="BV.Admin.switchTab('${t.id}')">
                    <span class="icon">${t.icon}</span>${t.label}
                  </button>
                `).join('')}
                <div style="border-top:1px solid var(--clr-border);margin:var(--sp-2) 0;padding-top:var(--sp-2)">
                  <button class="dashboard-nav-item" onclick="BV.App.navigate('home')"><span class="icon">🏠</span>Back to Site</button>
                </div>
              </nav>
            </aside>

            <!-- Admin Content -->
            <main id="admin-content">
              ${renderAdminSection()}
            </main>
          </div>
        </div>
      </div>
    `;
  };

  const renderAdminSection = () => {
    switch(activeTab) {
      case 'dashboard':   return renderAdminDashboard();
      case 'books':       return renderAdminBooks();
      case 'marketplace': return renderAdminMarketplace();
      case 'users':       return renderAdminUsers();
      case 'orders':      return renderAdminOrders();
      default:            return renderAdminDashboard();
    }
  };

  const renderAdminDashboard = () => {
    const books = BV.Store.getStoreBooks();
    const listings = BV.Store.getListings();
    const users = BV.Store.getUsers();
    const orders = BV.Store.getOrders();
    const totalRevenue = orders.reduce((s,o)=>s+o.total,0);

    return `
      <div style="display:flex;flex-direction:column;gap:var(--sp-6)">
        <h3>Platform Overview</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--sp-4)">
          ${[
            {icon:'📚', label:'Total Books', value:books.length, color:'var(--clr-primary)', bg:'var(--clr-primary-dim)'},
            {icon:'🏪', label:'Listings', value:listings.filter(l=>l.status==='active').length, color:'var(--clr-accent)', bg:'var(--clr-accent-dim)'},
            {icon:'👥', label:'Users', value:users.length, color:'var(--clr-teal)', bg:'var(--clr-teal-dim)'},
            {icon:'📦', label:'Orders', value:orders.length, color:'var(--clr-info)', bg:'var(--clr-info-dim)'},
            {icon:'💰', label:'Revenue', value:`₹${(totalRevenue*83).toFixed(0)}`, color:'var(--clr-gold)', bg:'var(--clr-gold-dim)'},
          ].map(s=>`<div class="stat-card"><div class="stat-icon" style="background:${s.bg};color:${s.color}">${s.icon}</div><div><div class="stat-value" style="color:${s.color};font-size:var(--text-2xl)">${s.value}</div><div class="stat-label">${s.label}</div></div></div>`).join('')}
        </div>

        <!-- Recent Orders -->
        <div>
          <div class="section-header" style="margin-bottom:var(--sp-4)"><h4>Recent Orders</h4><button class="btn btn-ghost btn-sm" onclick="BV.Admin.switchTab('orders')">View All</button></div>
          <div class="table-wrapper">
            <table class="table">
              <thead><tr><th>Order ID</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                ${orders.slice(-5).reverse().map(o=>{
                  const user = BV.Store.getUserById(o.userId);
                  return `<tr>
                    <td style="font-weight:var(--fw-semibold);font-size:var(--text-sm)">${o.id}</td>
                    <td style="font-size:var(--text-sm)">${user?BV.UI.escapeHtml(user.name):'Unknown'}</td>
                    <td style="font-weight:var(--fw-semibold)">₹${(o.total*83).toFixed(0)}</td>
                    <td>${BV.UI.orderStatusHTML(o.status)}</td>
                    <td style="font-size:var(--text-xs);color:var(--clr-text-muted)">${BV.UI.formatDate(o.createdAt)}</td>
                    <td><select class="form-control" style="padding:0.3rem 0.5rem;font-size:var(--text-xs);width:auto" onchange="BV.Admin.updateOrderStatus('${o.id}',this.value)">
                      ${['pending','confirmed','shipped','delivered','cancelled'].map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
                    </select></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  };

  const renderAdminBooks = () => {
    const books = BV.Store.getStoreBooks();
    return `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-5)">
          <h3>Manage Books (${books.length})</h3>
          <button class="btn btn-primary btn-sm" onclick="BV.Admin.showBookForm()">+ Add Book</button>
        </div>
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Book</th><th>Category</th><th>Price</th><th>Rating</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              ${books.map(b=>`
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:var(--sp-3)">
                      <div style="width:36px;height:48px;border-radius:var(--radius-sm);background:${BV.Store.getBookGradient(b.category)};flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative">
                        ${b.coverUrl 
                          ? `<img src="${b.coverUrl}" alt="${BV.UI.escapeHtml(b.title)}" class="book-cover-img" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` 
                          : ''
                        }
                      </div>
                      <div>
                        <div style="font-weight:var(--fw-semibold);font-size:var(--text-sm)">${BV.UI.escapeHtml(b.title)}</div>
                        <div style="font-size:var(--text-xs);color:var(--clr-text-muted)">${BV.UI.escapeHtml(b.author)}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge badge-primary">${b.category}</span></td>
                  <td>₹${(b.price*83).toFixed(0)}</td>
                  <td><span style="color:var(--clr-gold)">★</span> ${b.rating}</td>
                  <td><span style="color:${b.stock>10?'var(--clr-success)':b.stock>0?'var(--clr-warning)':'var(--clr-danger)'};font-weight:var(--fw-semibold)">${b.stock}</span></td>
                  <td>
                    <div style="display:flex;gap:var(--sp-2)">
                      <button class="btn btn-ghost btn-sm btn-icon" onclick="BV.Admin.showBookForm('${b.id}')" title="Edit">✏️</button>
                      <button class="btn btn-ghost btn-sm btn-icon" onclick="BV.Admin.deleteBook('${b.id}')" title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const renderAdminMarketplace = () => {
    const listings = BV.Store.getListings();
    return `
      <div>
        <h3 style="margin-bottom:var(--sp-5)">Marketplace Listings (${listings.length})</h3>
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Book</th><th>Seller</th><th>Condition</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${listings.map(l=>{
                const seller=BV.Store.getUserById(l.sellerId);
                return `<tr>
                  <td><div style="font-weight:var(--fw-semibold);font-size:var(--text-sm)">${BV.UI.escapeHtml(l.title)}</div><div style="font-size:var(--text-xs);color:var(--clr-text-muted)">${BV.UI.escapeHtml(l.author)}</div></td>
                  <td style="font-size:var(--text-sm)">${seller?BV.UI.escapeHtml(seller.name):'Unknown'}</td>
                  <td><span class="badge condition-${l.condition==='New'?'new':l.condition==='Like New'?'like':l.condition==='Good'?'good':l.condition==='Fair'?'fair':'poor'}">${l.condition}</span></td>
                  <td>₹${(l.price*83).toFixed(0)}</td>
                  <td>${l.status==='active'?'<span class="badge badge-success">Active</span>':'<span class="badge badge-danger">Inactive</span>'}</td>
                  <td>
                    <div style="display:flex;gap:var(--sp-2)">
                      <button class="btn btn-ghost btn-sm" onclick="BV.Admin.toggleListing('${l.id}','${l.status}')">${l.status==='active'?'⏸ Suspend':'▶ Activate'}</button>
                      <button class="btn btn-ghost btn-sm btn-icon" onclick="BV.Admin.deleteListing('${l.id}')">🗑️</button>
                    </div>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const renderAdminUsers = () => {
    const users = BV.Store.getUsers();
    return `
      <div>
        <h3 style="margin-bottom:var(--sp-5)">User Management (${users.length})</h3>
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              ${users.map(u=>`
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:var(--sp-3)">
                      <div class="avatar avatar-sm">${u.name[0].toUpperCase()}</div>
                      <div>
                        <div style="font-weight:var(--fw-semibold);font-size:var(--text-sm)">${BV.UI.escapeHtml(u.name)}</div>
                        <div style="font-size:var(--text-xs);color:var(--clr-text-muted)">${BV.UI.escapeHtml(u.email)}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge badge-primary">${u.role}</span></td>
                  <td>${u.isBanned?'<span class="badge badge-danger">Banned</span>':'<span class="badge badge-success">Active</span>'}</td>
                  <td style="font-size:var(--text-xs);color:var(--clr-text-muted)">${BV.UI.formatDate(u.joinDate)}</td>
                  <td>
                    <div style="display:flex;gap:var(--sp-2)">
                      ${u.role!=='admin'?`<button class="btn btn-ghost btn-sm" onclick="BV.Admin.toggleBan('${u.id}',${u.isBanned})">${u.isBanned?'🔓 Unban':'🚫 Ban'}</button>`:''}
                      <select class="form-control" style="padding:0.3rem;font-size:var(--text-xs);width:auto" onchange="BV.Admin.changeRole('${u.id}',this.value)">
                        ${['buyer','seller','admin'].map(r=>`<option value="${r}" ${u.role===r?'selected':''}>${r}</option>`).join('')}
                      </select>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const renderAdminOrders = () => {
    const orders = BV.Store.getOrders().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    return `
      <div>
        <h3 style="margin-bottom:var(--sp-5)">All Orders (${orders.length})</h3>
        <div class="table-wrapper">
          <table class="table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              ${orders.map(o=>{
                const user=BV.Store.getUserById(o.userId);
                return `<tr>
                  <td style="font-weight:var(--fw-bold);font-size:var(--text-sm)">${o.id}</td>
                  <td style="font-size:var(--text-sm)">${user?BV.UI.escapeHtml(user.name):'Unknown'}</td>
                  <td style="font-size:var(--text-sm)">${(o.items||[]).length} item(s)</td>
                  <td style="font-weight:var(--fw-semibold)">₹${(o.total*83).toFixed(0)}</td>
                  <td>${BV.UI.orderStatusHTML(o.status)}</td>
                  <td style="font-size:var(--text-xs);color:var(--clr-text-muted)">${BV.UI.formatDate(o.createdAt)}</td>
                  <td>
                    <select class="form-control" style="padding:0.3rem;font-size:var(--text-xs);width:auto" onchange="BV.Admin.updateOrderStatus('${o.id}',this.value)">
                      ${['pending','confirmed','shipped','delivered','cancelled','refunded'].map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
                    </select>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const switchTab = (tab) => {
    activeTab = tab;
    document.querySelectorAll('#admin-content').forEach(el => {
      if (el) el.innerHTML = renderAdminSection();
    });
    document.querySelectorAll('.dashboard-nav-item').forEach(b => {
      const labels = {dashboard:'Dashboard',books:'Books',marketplace:'Marketplace',users:'Users',orders:'Orders'};
      b.classList.toggle('active', b.textContent.includes(labels[tab]||''));
    });
    const el = document.getElementById('admin-content');
    if (el) el.innerHTML = renderAdminSection();
  };

  const showBookForm = (bookId) => {
    const book = bookId ? BV.Store.getStoreBookById(bookId) : null;
    BV.UI.openModal(`
      <div class="modal-header"><span class="modal-title">${book?'✏️ Edit Book':'📚 Add New Book'}</span><button class="modal-close" onclick="BV.UI.closeModal()">✕</button></div>
      <div class="modal-body">
        <form onsubmit="BV.Admin.saveBook(event,'${bookId||''}')" style="display:flex;flex-direction:column;gap:var(--sp-4)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4)">
            <div class="form-group"><label class="form-label required">Title</label><input type="text" class="form-control" name="title" value="${book?BV.UI.escapeHtml(book.title):''}" required></div>
            <div class="form-group"><label class="form-label required">Author</label><input type="text" class="form-control" name="author" value="${book?BV.UI.escapeHtml(book.author):''}" required></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--sp-4)">
            <div class="form-group"><label class="form-label required">Category</label><select class="form-control" name="category" required>${['Fiction','Sci-Fi','Fantasy','Dystopian','Self-Help','History','Psychology','Finance','Science','Thriller','Romance','Biography','Children','Non-Fiction','Philosophy'].map(c=>`<option value="${c}" ${book&&book.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
            <div class="form-group"><label class="form-label required">Price (₹)</label><input type="number" class="form-control" name="priceInr" value="${book?(book.price*83).toFixed(0):''}" min="1" required></div>
            <div class="form-group"><label class="form-label">Original Price (₹)</label><input type="number" class="form-control" name="originalPriceInr" value="${book&&book.originalPrice?(book.originalPrice*83).toFixed(0):''}"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--sp-4)">
            <div class="form-group"><label class="form-label">Stock</label><input type="number" class="form-control" name="stock" value="${book?book.stock:10}" min="0"></div>
            <div class="form-group"><label class="form-label">Pages</label><input type="number" class="form-control" name="pages" value="${book?book.pages:''}"></div>
            <div class="form-group"><label class="form-label">Publish Year</label><input type="number" class="form-control" name="publishYear" value="${book?book.publishYear:''}"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4)">
            <div class="form-group"><label class="form-label">Publisher</label><input type="text" class="form-control" name="publisher" value="${book?BV.UI.escapeHtml(book.publisher||''):''}"></div>
            <div class="form-group"><label class="form-label">ISBN</label><input type="text" class="form-control" name="isbn" value="${book?BV.UI.escapeHtml(book.isbn||''):''}"></div>
          </div>
          <div class="form-group"><label class="form-label">Description</label><textarea class="form-control" name="description" rows="3">${book?BV.UI.escapeHtml(book.description||''):''}</textarea></div>
          <div style="display:flex;gap:var(--sp-4)">
            <label class="form-check"><input type="checkbox" name="featured" ${book&&book.featured?'checked':''}><span style="font-size:var(--text-sm)">Featured</span></label>
            <label class="form-check"><input type="checkbox" name="bestseller" ${book&&book.bestseller?'checked':''}><span style="font-size:var(--text-sm)">Bestseller</span></label>
            <label class="form-check"><input type="checkbox" name="newArrival" ${book&&book.newArrival?'checked':''}><span style="font-size:var(--text-sm)">New Arrival</span></label>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:var(--sp-3)">
            <button type="button" class="btn btn-ghost" onclick="BV.UI.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">${book?'Update Book':'Add Book'}</button>
          </div>
        </form>
      </div>
    `, 'modal-lg');
  };

  const saveBook = (e, bookId) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      title: fd.get('title'), author: fd.get('author'), category: fd.get('category'),
      price: parseFloat(fd.get('priceInr'))/83,
      originalPrice: fd.get('originalPriceInr') ? parseFloat(fd.get('originalPriceInr'))/83 : null,
      stock: parseInt(fd.get('stock')||'10'),
      pages: parseInt(fd.get('pages')||'0') || null,
      publishYear: parseInt(fd.get('publishYear')||'0') || null,
      publisher: fd.get('publisher'), isbn: fd.get('isbn'), description: fd.get('description'),
      featured: fd.get('featured') === 'on', bestseller: fd.get('bestseller') === 'on', newArrival: fd.get('newArrival') === 'on',
      rating: bookId ? BV.Store.getStoreBookById(bookId)?.rating || 4.0 : 4.0,
      reviewCount: bookId ? BV.Store.getStoreBookById(bookId)?.reviewCount || 0 : 0,
      language: 'English',
    };
    if (bookId) { BV.Store.updateStoreBook(bookId, data); BV.UI.toast('Book updated!','','success'); }
    else { BV.Store.addStoreBook(data); BV.UI.toast('Book added!','','success'); }
    BV.UI.closeModal();
    const el = document.getElementById('admin-content');
    if (el) el.innerHTML = renderAdminBooks();
  };

  const deleteBook = (id) => { BV.UI.confirm('Delete Book','This cannot be undone.',()=>{ BV.Store.deleteStoreBook(id); BV.UI.toast('Book deleted','','info'); const el=document.getElementById('admin-content'); if(el) el.innerHTML=renderAdminBooks(); },true); };
  const toggleListing = (id, status) => { BV.Store.updateListing(id,{status:status==='active'?'suspended':'active'}); BV.UI.toast(`Listing ${status==='active'?'suspended':'activated'}`,'','info'); const el=document.getElementById('admin-content'); if(el) el.innerHTML=renderAdminMarketplace(); };
  const deleteListing = (id) => { BV.UI.confirm('Delete Listing','',()=>{ BV.Store.deleteListing(id); BV.UI.toast('Deleted','','info'); const el=document.getElementById('admin-content'); if(el) el.innerHTML=renderAdminMarketplace(); },true); };
  const toggleBan = (id, isBanned) => { BV.Store.updateUser(id,{isBanned:!isBanned}); BV.UI.toast(!isBanned?'User banned':'User unbanned','','info'); const el=document.getElementById('admin-content'); if(el) el.innerHTML=renderAdminUsers(); };
  const changeRole = (id, role) => { BV.Store.updateUser(id,{role}); BV.UI.toast('Role updated','','success'); };
  const updateOrderStatus = (id, status) => { BV.Store.updateOrderStatus(id,status); BV.UI.toast('Order status updated','','success'); };

  return { render, switchTab, showBookForm, saveBook, deleteBook, toggleListing, deleteListing, toggleBan, changeRole, updateOrderStatus };
})();
