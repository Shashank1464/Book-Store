/* ============================================================
   BookVerse — Auth Module (Login, Register, Session)
   ============================================================ */

window.BV = window.BV || {};

BV.Auth = (() => {

  const render = () => {
    return `
      <div class="page-content">
        <div class="container" style="max-width:460px;padding-block:var(--sp-16)">
          <div class="card card-solid" style="border-radius:var(--radius-2xl);overflow:hidden">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,var(--clr-primary) 0%,var(--clr-accent) 100%);padding:var(--sp-8);text-align:center">
              <div style="font-size:2.5rem;margin-bottom:var(--sp-2)">📚</div>
              <h2 style="color:#fff;font-size:var(--text-2xl);font-weight:var(--fw-black)">Welcome to BookVerse</h2>
              <p style="color:rgba(255,255,255,0.8);font-size:var(--text-sm);margin-top:var(--sp-2)">Your world of books awaits</p>
            </div>

            <div class="card-body" style="padding:var(--sp-8)">
              <!-- Tabs -->
              <div class="tabs" id="auth-tabs" style="margin-bottom:var(--sp-6)">
                <button class="tab-btn active" onclick="BV.Auth.switchTab('login')">Sign In</button>
                <button class="tab-btn" onclick="BV.Auth.switchTab('register')">Create Account</button>
              </div>

              <!-- Login Form -->
              <div id="tab-login" class="tab-content active">
                <form id="login-form" onsubmit="BV.Auth.handleLogin(event)">
                  <div style="display:flex;flex-direction:column;gap:var(--sp-4)">
                    <div class="form-group">
                      <label class="form-label required">Email Address</label>
                      <div class="input-wrapper has-icon-left">
                        <span class="input-icon">📧</span>
                        <input type="email" id="login-email" class="form-control" placeholder="you@example.com" required autocomplete="email">
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="form-label required">Password</label>
                      <div class="input-wrapper has-icon-left has-icon-right">
                        <span class="input-icon">🔒</span>
                        <input type="password" id="login-password" class="form-control" placeholder="Enter password" required autocomplete="current-password">
                        <span class="input-icon input-icon-right" id="toggle-pass" onclick="BV.Auth.togglePassword('login-password','toggle-pass')">👁</span>
                      </div>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:space-between">
                      <label class="form-check">
                        <input type="checkbox" id="remember-me">
                        <span style="font-size:var(--text-sm);color:var(--clr-text-muted)">Remember me</span>
                      </label>
                      <button type="button" style="font-size:var(--text-sm);color:var(--clr-primary);background:none;border:none;cursor:pointer">Forgot password?</button>
                    </div>
                    <div id="login-error" class="form-error" style="display:none"></div>
                    <button type="submit" class="btn btn-gradient btn-lg w-full" id="login-btn">
                      Sign In to BookVerse
                    </button>
                  </div>
                </form>

                <!-- Demo accounts -->
                <div style="margin-top:var(--sp-6);padding:var(--sp-4);background:var(--clr-surface-2);border-radius:var(--radius-lg);border:1px solid var(--clr-border)">
                  <p style="font-size:var(--text-xs);color:var(--clr-text-faint);text-align:center;margin-bottom:var(--sp-3);font-weight:var(--fw-semibold);text-transform:uppercase;letter-spacing:.06em">Demo Accounts</p>
                  <div style="display:flex;flex-direction:column;gap:var(--sp-2)">
                    ${[
                      {label:'👑 Admin', email:'admin@bookverse.com', pass:'admin123'},
                      {label:'🛍️ Seller', email:'sarah@example.com', pass:'pass123'},
                      {label:'📖 Buyer', email:'emily@example.com', pass:'pass123'},
                    ].map(d => `
                      <button type="button" class="btn btn-ghost btn-sm" onclick="BV.Auth.fillDemo('${d.email}','${d.pass}')" style="justify-content:flex-start;gap:var(--sp-2)">
                        <span>${d.label}</span>
                        <span style="color:var(--clr-text-faint);font-size:var(--text-xs)">${d.email}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Register Form -->
              <div id="tab-register" class="tab-content">
                <form id="register-form" onsubmit="BV.Auth.handleRegister(event)">
                  <div style="display:flex;flex-direction:column;gap:var(--sp-4)">
                    <div class="form-group">
                      <label class="form-label required">Full Name</label>
                      <div class="input-wrapper has-icon-left">
                        <span class="input-icon">👤</span>
                        <input type="text" id="reg-name" class="form-control" placeholder="Your full name" required>
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="form-label required">Email Address</label>
                      <div class="input-wrapper has-icon-left">
                        <span class="input-icon">📧</span>
                        <input type="email" id="reg-email" class="form-control" placeholder="you@example.com" required>
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="form-label required">Password</label>
                      <div class="input-wrapper has-icon-left has-icon-right">
                        <span class="input-icon">🔒</span>
                        <input type="password" id="reg-password" class="form-control" placeholder="Min 6 characters" required minlength="6" oninput="BV.Auth.checkStrength(this.value)">
                        <span class="input-icon input-icon-right" onclick="BV.Auth.togglePassword('reg-password',this)">👁</span>
                      </div>
                      <div id="strength-bar" style="height:4px;border-radius:var(--radius-full);background:var(--clr-surface-3);margin-top:4px;overflow:hidden">
                        <div id="strength-fill" style="height:100%;width:0%;border-radius:var(--radius-full);transition:width .3s,background .3s"></div>
                      </div>
                      <span id="strength-label" class="form-hint"></span>
                    </div>
                    <div class="form-group">
                      <label class="form-label required">I want to</label>
                      <select id="reg-role" class="form-control">
                        <option value="buyer">📖 Buy books</option>
                        <option value="seller">🏪 Buy & Sell books</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-check">
                        <input type="checkbox" id="reg-terms" required>
                        <span style="font-size:var(--text-sm);color:var(--clr-text-muted)">I agree to the <a style="color:var(--clr-primary)">Terms & Privacy Policy</a></span>
                      </label>
                    </div>
                    <div id="register-error" class="form-error" style="display:none"></div>
                    <button type="submit" class="btn btn-gradient btn-lg w-full" id="reg-btn">
                      Create My Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const switchTab = (tab) => {
    document.querySelectorAll('#auth-tabs .tab-btn').forEach((btn, i) => {
      btn.classList.toggle('active', (i===0 && tab==='login') || (i===1 && tab==='register'));
    });
    document.getElementById('tab-login').classList.toggle('active', tab==='login');
    document.getElementById('tab-register').classList.toggle('active', tab==='register');
  };

  const togglePassword = (inputId, iconEl) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    if (typeof iconEl === 'string') {
      const el = document.getElementById(iconEl);
      if (el) el.textContent = show ? '🙈' : '👁';
    } else if (iconEl) {
      iconEl.textContent = show ? '🙈' : '👁';
    }
  };

  const checkStrength = (pass) => {
    const fill = document.getElementById('strength-fill');
    const label = document.getElementById('strength-label');
    if (!fill || !label) return;
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    const levels = [
      {pct:'0%', color:'', text:''},
      {pct:'25%', color:'var(--clr-danger)', text:'Weak'},
      {pct:'50%', color:'var(--clr-warning)', text:'Fair'},
      {pct:'75%', color:'var(--clr-info)', text:'Good'},
      {pct:'100%', color:'var(--clr-success)', text:'Strong'},
    ];
    const lv = levels[Math.min(score, 4)];
    fill.style.width = lv.pct;
    fill.style.background = lv.color;
    label.textContent = lv.text;
    label.style.color = lv.color;
  };

  const fillDemo = (email, pass) => {
    const emailEl = document.getElementById('login-email');
    const passEl  = document.getElementById('login-password');
    if (emailEl) emailEl.value = email;
    if (passEl)  passEl.value = pass;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass  = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    const btn   = document.getElementById('login-btn');

    errEl.style.display = 'none';
    btn.classList.add('btn-loading');
    btn.disabled = true;

    setTimeout(() => {
      btn.classList.remove('btn-loading');
      btn.disabled = false;

      const users = BV.Store.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email && u.password === pass);

      if (!user) {
        errEl.textContent = '❌ Invalid email or password';
        errEl.style.display = 'flex';
        return;
      }
      if (user.isBanned) {
        errEl.textContent = '🚫 Your account has been suspended. Contact support.';
        errEl.style.display = 'flex';
        return;
      }

      BV.Store.setSession(user);
      BV.Auth.updateNavbar();
      BV.Store.updateNotifBadge();
      BV.UI.toast(`Welcome back, ${user.name.split(' ')[0]}! 👋`, 'You\'re now signed in.', 'success');
      BV.App.navigate('home');
    }, 800);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const name  = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const pass  = document.getElementById('reg-password').value;
    const role  = document.getElementById('reg-role').value;
    const errEl = document.getElementById('register-error');
    const btn   = document.getElementById('reg-btn');

    errEl.style.display = 'none';

    const existing = BV.Store.getUsers().find(u => u.email.toLowerCase() === email);
    if (existing) {
      errEl.textContent = '❌ An account with this email already exists';
      errEl.style.display = 'flex';
      return;
    }

    btn.classList.add('btn-loading');
    btn.disabled = true;

    setTimeout(() => {
      btn.classList.remove('btn-loading');
      btn.disabled = false;

      const newUser = {
        id: 'u' + String(Date.now()).slice(-6),
        name, email, password: pass, role,
        avatar: name[0].toUpperCase(),
        bio: '',
        joinDate: new Date().toISOString(),
        isBanned: false,
        sellerRating: 0,
        totalSales: 0,
      };
      BV.Store.addUser(newUser);
      BV.Store.setSession(newUser);
      BV.Auth.updateNavbar();
      BV.UI.toast(`Welcome to BookVerse, ${name.split(' ')[0]}! 🎉`, 'Your account has been created.', 'success');
      BV.App.navigate('home');
    }, 900);
  };

  const updateNavbar = () => {
    const session = BV.Store.getSession();
    const authArea = document.getElementById('nav-auth-area');
    if (!authArea) return;

    if (session) {
      const initials = session.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
      authArea.innerHTML = `
        <div class="user-menu dropdown" id="user-menu-dropdown">
          <div class="user-menu-trigger" onclick="BV.Auth.toggleUserMenu()">
            <div class="avatar avatar-sm">${initials}</div>
            <span class="user-menu-name truncate">${session.name.split(' ')[0]}</span>
            <span class="user-menu-arrow">▾</span>
          </div>
          <div class="dropdown-menu" id="user-dropdown">
            <div style="padding:var(--sp-4);border-bottom:1px solid var(--clr-border)">
              <div style="font-weight:var(--fw-semibold);font-size:var(--text-sm)">${BV.UI.escapeHtml(session.name)}</div>
              <div style="font-size:var(--text-xs);color:var(--clr-text-muted)">${BV.UI.escapeHtml(session.email)}</div>
              <span class="badge badge-primary" style="margin-top:var(--sp-1)">${session.role}</span>
            </div>
            <button class="dropdown-item" onclick="BV.Auth.toggleUserMenu();BV.App.navigate('dashboard')"><span class="icon">📊</span>Dashboard</button>
            <button class="dropdown-item" onclick="BV.Auth.toggleUserMenu();BV.App.navigate('orders')"><span class="icon">📦</span>My Orders</button>
            <button class="dropdown-item" onclick="BV.Auth.toggleUserMenu();BV.App.navigate('wishlist')"><span class="icon">❤️</span>Wishlist</button>
            ${session.role === 'seller' || session.role === 'admin' ? `<button class="dropdown-item" onclick="BV.Auth.toggleUserMenu();BV.App.navigate('marketplace',null,null,'list')"><span class="icon">🏪</span>List a Book</button>` : ''}
            ${session.role === 'admin' ? `<div class="dropdown-divider"></div><button class="dropdown-item" onclick="BV.Auth.toggleUserMenu();BV.App.navigate('admin')"><span class="icon">⚙️</span>Admin Panel</button>` : ''}
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" onclick="BV.Auth.logout()"><span class="icon">🚪</span>Sign Out</button>
          </div>
        </div>
      `;
    } else {
      authArea.innerHTML = `
        <button class="btn btn-ghost btn-sm" onclick="BV.App.navigate('auth')">Sign In</button>
        <button class="btn btn-primary btn-sm" onclick="BV.App.navigate('auth')">Join Free</button>
      `;
    }
  };

  const toggleUserMenu = () => {
    const menu = document.getElementById('user-dropdown');
    const wrap = document.getElementById('user-menu-dropdown');
    if (!menu) return;
    const isOpen = menu.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      menu.classList.add('open');
      wrap && wrap.classList.add('open');
    }
  };

  const closeAllDropdowns = () => {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.notif-dropdown').forEach(d => d.classList.remove('open'));
  };

  const logout = () => {
    BV.Store.clearSession();
    updateNavbar();
    BV.UI.toast('Signed out', 'See you next time! 👋', 'info');
    BV.App.navigate('home');
  };

  return { render, switchTab, togglePassword, checkStrength, fillDemo, handleLogin, handleRegister, updateNavbar, toggleUserMenu, closeAllDropdowns, logout };
})();
