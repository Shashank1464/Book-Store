/* ============================================================
   BookVerse — Application Router & Initializer
   ============================================================ */

window.BV = window.BV || {};

BV.App = (() => {

  /* ─────────────────────────────────────────
     NAVIGATION
  ───────────────────────────────────────── */
  const navigate = (page, id=null, source=null, extra=null, query=null) => {
    BV.Auth.closeAllDropdowns();
    const app = document.getElementById('app');
    if (!app) return;

    // Transition out
    app.style.opacity = '0';
    app.style.transform = 'translateY(8px)';
    app.style.transition = 'opacity 0.15s, transform 0.15s';

    setTimeout(() => {
      let html = '';

      switch(page) {
        case 'home':
          html = BV.Home.render();
          break;
        case 'bookstore':
          html = BV.Browse.render(extra, query);
          break;
        case 'marketplace':
          html = BV.Marketplace.render(extra, query);
          break;
        case 'book':
          html = BV.BookDetail.render(id, source || 'store');
          break;
        case 'cart':
          html = BV.Cart.render();
          break;
        case 'wishlist':
          html = BV.Wishlist.render();
          break;
        case 'orders':
          html = BV.Orders.render();
          break;
        case 'dashboard':
          html = BV.Dashboard.render();
          break;
        case 'profile':
          html = BV.Profile.render(id);
          break;
        case 'admin':
          html = BV.Admin.render();
          break;
        case 'auth':
          html = BV.Auth.render();
          break;
        default:
          html = BV.Home.render();
      }

      app.innerHTML = html;

      // Transition in
      app.style.transition = '';
      requestAnimationFrame(() => {
        app.style.opacity = '1';
        app.style.transform = 'translateY(0)';
        app.style.transition = 'opacity 0.25s, transform 0.25s';
      });

      // Post-render hooks
      requestAnimationFrame(() => {
        // Initialize page-specific logic
        if (page === 'home') {
          BV.UI.observeAnimations();
        }
        if (page === 'bookstore') {
          BV.Browse.init(extra, query);
        }
        if (page === 'marketplace') {
          BV.Marketplace.init(extra, query);
          if (extra === 'list') {
            setTimeout(() => BV.Marketplace.showListingForm(), 200);
          }
        }
        if (page === 'cart') {
          BV.Cart.init();
        }

        // Update active nav link
        updateActiveNavLink(page);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update badges
        BV.Store.updateCartBadge();
        BV.Store.updateWishlistBadge();
        BV.Store.updateNotifBadge();
      });
    }, 150);
  };

  const updateActiveNavLink = (page) => {
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkPage = link.dataset.page;
      link.classList.toggle('active', linkPage === page);
    });
    document.querySelectorAll('.drawer-link').forEach(link => {
      const linkPage = link.dataset.page;
      link.classList.toggle('active', linkPage === page);
    });
  };

  /* ─────────────────────────────────────────
     NOTIFICATIONS PANEL
  ───────────────────────────────────────── */
  const toggleNotifications = () => {
    const dropdown = document.getElementById('notif-dropdown');
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains('open');
    BV.Auth.closeAllDropdowns();
    if (!isOpen) {
      dropdown.classList.add('open');
      renderNotifications();
    }
  };

  const renderNotifications = () => {
    const session = BV.Store.getSession();
    const list = document.getElementById('notif-list');
    if (!list || !session) return;

    const notifs = BV.Store.getUserNotifications(session.id);
    if (!notifs.length) {
      list.innerHTML = '<div class="notif-empty">🔔 No notifications yet</div>';
      return;
    }

    list.innerHTML = notifs.slice(0, 10).map(n => `
      <div class="notif-item ${n.read?'':'unread'}" onclick="BV.App.markNotifRead('${n.id}')">
        <div class="notif-icon" style="background:${n.read?'var(--clr-surface-3)':'var(--clr-primary-dim)'}">${n.icon||'🔔'}</div>
        <div class="notif-content">
          <div class="notif-msg">${BV.UI.escapeHtml(n.message)}</div>
          <div class="notif-time">${BV.UI.formatTimeAgo(n.createdAt)}</div>
        </div>
      </div>
    `).join('');
  };

  const markNotifRead = (id) => {
    BV.Store.markNotifRead(id);
    renderNotifications();
  };

  const markAllNotifRead = () => {
    const session = BV.Store.getSession();
    if (session) BV.Store.markAllNotifRead(session.id);
    renderNotifications();
    BV.Store.updateNotifBadge();
  };

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  const init = () => {
    // Initialize store (seed data)
    BV.Store.init();

    // Render initial page
    navigate('home');

    // Auth navbar
    BV.Auth.updateNavbar();

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
      });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown') && !e.target.closest('.notif-bell') && !e.target.closest('.notif-dropdown') && !e.target.closest('.user-menu')) {
        BV.Auth.closeAllDropdowns();
      }
    });

    // Mobile drawer
    document.getElementById('hamburger-btn')?.addEventListener('click', () => {
      toggleDrawer(true);
    });
    document.getElementById('drawer-overlay')?.addEventListener('click', () => {
      toggleDrawer(false);
    });
    document.getElementById('drawer-close')?.addEventListener('click', () => {
      toggleDrawer(false);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        BV.UI.closeModal();
        BV.Auth.closeAllDropdowns();
        toggleDrawer(false);
      }
    });

    // Update badges
    setTimeout(() => {
      BV.Store.updateCartBadge();
      BV.Store.updateWishlistBadge();
      BV.Store.updateNotifBadge();
    }, 100);
  };

  const toggleDrawer = (open) => {
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('drawer-overlay');
    const hamburger = document.getElementById('hamburger-btn');
    if (drawer) drawer.classList.toggle('open', open);
    if (overlay) overlay.classList.toggle('open', open);
    if (hamburger) hamburger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  const drawerNavigate = (page) => {
    toggleDrawer(false);
    navigate(page);
  };

  return { navigate, init, toggleNotifications, renderNotifications, markNotifRead, markAllNotifRead, toggleDrawer, drawerNavigate };
})();

// Boot the app
document.addEventListener('DOMContentLoaded', () => {
  BV.App.init();
});
