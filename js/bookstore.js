/* ============================================================
   BookVerse — Home Page
   ============================================================ */

window.BV = window.BV || {};

BV.Home = (() => {

  const render = () => {
    const featuredBooks = BV.Store.getStoreBooks().filter(b => b.featured).slice(0, 8);
    const bestSellers   = BV.Store.getStoreBooks().filter(b => b.bestseller).slice(0, 8);
    const newArrivals   = BV.Store.getStoreBooks().filter(b => b.newArrival).slice(0, 6);
    const recentListings = BV.Store.getListings().filter(l => l.status === 'active').slice(0, 6);
    const categories    = BV.Store.getCategories();

    return `
      <!-- HERO -->
      <section class="hero" style="padding-top:calc(var(--nav-h) + var(--sp-16))">
        <div class="hero-bg"></div>
        <div class="hero-orb hero-orb-1"></div>
        <div class="hero-orb hero-orb-2"></div>
        <div class="hero-orb hero-orb-3"></div>
        <div class="container">
          <div class="hero-content">
            <div class="hero-badge">
              <span>✨</span> India's Premier Book Marketplace
            </div>
            <h1 class="hero-title">
              Discover, Read &<br>
              <span class="gradient-text">Connect Through</span><br>
              <span class="gradient-text">Books</span>
            </h1>
            <p class="hero-subtitle">
              Explore thousands of books from top publishers, buy & sell pre-loved books, and join a thriving community of readers.
            </p>

            <div class="hero-search-wrap">
              <div class="search-bar-hero" id="hero-search-bar">
                <span style="font-size:20px;color:rgba(255,255,255,0.4)">🔍</span>
                <input type="text" id="hero-search-input" placeholder="Search by title, author, ISBN..." onkeydown="if(event.key==='Enter') BV.Home.heroSearch()">
                <button class="btn btn-gradient btn-sm" onclick="BV.Home.heroSearch()">Search</button>
              </div>
              <div class="hero-search-tags">
                <span>Popular:</span>
                ${['Fiction','Sci-Fi','Self-Help','Fantasy','Psychology'].map(tag =>
                  `<button class="search-tag" onclick="BV.App.navigate('bookstore',null,null,'${tag}')">${tag}</button>`
                ).join('')}
              </div>
            </div>

            <div class="hero-stats" style="margin-top:var(--sp-10)">
              <div class="hero-stat"><span class="hero-stat-value">20+</span><span class="hero-stat-label">Curated Books</span></div>
              <div class="hero-stat"><span class="hero-stat-value">10+</span><span class="hero-stat-label">Marketplace Listings</span></div>
              <div class="hero-stat"><span class="hero-stat-value">5★</span><span class="hero-stat-label">Avg. Rating</span></div>
              <div class="hero-stat"><span class="hero-stat-value">100%</span><span class="hero-stat-label">Secure Payments</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- CATEGORIES -->
      <section class="section section-sm" style="background:var(--clr-surface);border-block:1px solid var(--clr-border)">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <div class="section-header-text">
              <div class="section-label">Explore</div>
              <h2>Browse by Category</h2>
              <p>Find exactly what you're looking for</p>
            </div>
            <button class="btn btn-outline btn-sm" onclick="BV.App.navigate('bookstore')">View All →</button>
          </div>
          <div class="category-grid animate-on-scroll">
            ${categories.slice(0, 12).map((cat) => {
              const icon = BV.Store.CATEGORY_ICONS[cat.name] || '📚';
              const colors = BV.Store.CATEGORY_GRADIENTS[cat.name] || ['#667eea','#764ba2'];
              return `
                <div class="category-card" onclick="BV.App.navigate('bookstore',null,null,'${cat.name}')">
                  <div class="category-icon" style="background:linear-gradient(135deg,${colors[0]},${colors[1]})">
                    ${icon}
                  </div>
                  <div class="category-name">${cat.name}</div>
                  <div class="category-count">${cat.count} book${cat.count!==1?'s':''}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </section>

      <!-- FEATURED BOOKS -->
      ${featuredBooks.length ? `
      <section class="section">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <div class="section-header-text">
              <div class="section-label">Handpicked</div>
              <h2>Featured Books</h2>
              <p>Curated picks our team loves</p>
            </div>
            <button class="btn btn-outline btn-sm" onclick="BV.App.navigate('bookstore')">View All →</button>
          </div>
          <div class="books-scroll animate-on-scroll">
            ${featuredBooks.map(b => BV.UI.bookCardHTML(b, 'store')).join('')}
          </div>
        </div>
      </section>
      ` : ''}

      <!-- BESTSELLERS -->
      ${bestSellers.length ? `
      <section class="section section-sm" style="background:var(--clr-surface);border-block:1px solid var(--clr-border)">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <div class="section-header-text">
              <div class="section-label">Top Picks</div>
              <h2>🔥 Bestsellers</h2>
              <p>The most loved books by our readers</p>
            </div>
            <button class="btn btn-outline btn-sm" onclick="BV.App.navigate('bookstore')">All Bestsellers →</button>
          </div>
          <div class="books-scroll animate-on-scroll">
            ${bestSellers.map(b => BV.UI.bookCardHTML(b, 'store')).join('')}
          </div>
        </div>
      </section>
      ` : ''}

      <!-- BANNER -->
      <section class="section section-sm">
        <div class="container">
          <div class="animate-on-scroll" style="
            background: linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-accent) 100%);
            border-radius: var(--radius-2xl);
            padding: var(--sp-12) var(--sp-10);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--sp-8);
            flex-wrap: wrap;
            position: relative;
            overflow: hidden;
          ">
            <div style="position:absolute;inset:0;background:url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"80\" cy=\"20\" r=\"30\" fill=\"rgba(255,255,255,0.05)\"/><circle cx=\"10\" cy=\"80\" r=\"40\" fill=\"rgba(255,255,255,0.03)\"/></svg>') center/cover;pointer-events:none"></div>
            <div style="position:relative">
              <h3 style="font-size:var(--text-2xl);font-weight:var(--fw-black);color:#fff;margin-bottom:var(--sp-3)">
                📚 Have books collecting dust?
              </h3>
              <p style="color:rgba(255,255,255,0.85);font-size:var(--text-base);max-width:420px;line-height:var(--lh-relaxed)">
                Join our marketplace community and sell your used books to fellow readers. It's free to list!
              </p>
            </div>
            <div style="display:flex;gap:var(--sp-3);flex-wrap:wrap;position:relative">
              <button class="btn btn-xl" style="background:#fff;color:var(--clr-primary);font-weight:var(--fw-bold)" onclick="BV.App.navigate('marketplace',null,null,'list')">
                Start Selling →
              </button>
              <button class="btn btn-xl btn-outline" style="border-color:rgba(255,255,255,0.5);color:#fff" onclick="BV.App.navigate('marketplace')">
                Browse Listings
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- MARKETPLACE SPOTLIGHT -->
      ${recentListings.length ? `
      <section class="section section-sm" style="background:var(--clr-surface);border-block:1px solid var(--clr-border)">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <div class="section-header-text">
              <div class="section-label">Community</div>
              <h2>🏪 Marketplace Spotlight</h2>
              <p>Pre-loved books from our seller community</p>
            </div>
            <button class="btn btn-outline btn-sm" onclick="BV.App.navigate('marketplace')">All Listings →</button>
          </div>
          <div class="books-scroll animate-on-scroll">
            ${recentListings.map(l => BV.UI.marketplaceCardHTML(l)).join('')}
          </div>
        </div>
      </section>
      ` : ''}

      <!-- NEW ARRIVALS -->
      ${newArrivals.length ? `
      <section class="section section-sm">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <div class="section-header-text">
              <div class="section-label">Fresh In</div>
              <h2>✨ New Arrivals</h2>
              <p>Just added to our collection</p>
            </div>
          </div>
          <div class="browse-grid animate-on-scroll">
            ${newArrivals.map(b => BV.UI.bookCardHTML(b, 'store')).join('')}
          </div>
        </div>
      </section>
      ` : ''}

      <!-- FEATURES BANNER -->
      <section class="section section-sm" style="background:var(--clr-surface);border-top:1px solid var(--clr-border)">
        <div class="container">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--sp-6)" class="animate-on-scroll">
            ${[
              { icon:'🚚', title:'Fast Delivery', desc:'Quick dispatch across India' },
              { icon:'🔒', title:'Secure Payments', desc:'Razorpay & UPI supported' },
              { icon:'↩️', title:'Easy Returns', desc:'7-day hassle-free returns' },
              { icon:'📞', title:'24/7 Support', desc:'Always here to help you' },
            ].map(f => `
              <div style="display:flex;align-items:flex-start;gap:var(--sp-4);padding:var(--sp-5);background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-xl)">
                <div style="font-size:2rem;flex-shrink:0">${f.icon}</div>
                <div>
                  <div style="font-weight:var(--fw-bold);font-size:var(--text-sm);margin-bottom:2px">${f.title}</div>
                  <div style="font-size:var(--text-xs);color:var(--clr-text-muted)">${f.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  };

  const heroSearch = () => {
    const query = document.getElementById('hero-search-input')?.value?.trim();
    if (query) BV.App.navigate('bookstore', null, null, null, query);
    else BV.App.navigate('bookstore');
  };

  return { render, heroSearch };
})();
