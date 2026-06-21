# 📚 BookVerse — Online Bookstore & Community Marketplace

A premium, fully-featured online bookstore and community marketplace built with **HTML, CSS, and vanilla JavaScript**.

## 🚀 Quick Start

Since this is a client-side SPA, you need a local server (browsers block `localStorage` from `file://` URLs in some configurations).

### Option 1: VS Code Live Server (Recommended)
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `index.html` → **Open with Live Server**

### Option 2: Node.js
```bash
node -e "const h=require('http'),f=require('fs'),p=require('path');h.createServer((q,r)=>{let fp=p.join('.',q.url==='/'?'/index.html':q.url);try{const d=f.readFileSync(fp);const t={'.html':'text/html','.css':'text/css','.js':'application/javascript'};r.writeHead(200,{'Content-Type':t[p.extname(fp)]||'text/plain'});r.end(d);}catch(e){r.writeHead(404);r.end('Not found');}}).listen(5173,()=>console.log('Open http://localhost:5173'));"
```

## 🎯 Demo Accounts

| Role    | Email                  | Password  |
|---------|------------------------|-----------|
| 👑 Admin  | admin@bookverse.com    | admin123  |
| 🏪 Seller | sarah@example.com      | pass123   |
| 📖 Buyer  | emily@example.com      | pass123   |

## ✨ Features

### 🏪 Bookstore
- 20 curated books with rich metadata
- Advanced search and filtering (category, price, rating, stock)
- Grid and list view modes
- Sorting by popularity, price, rating, newest
- Paginated results

### 🛒 Marketplace
- 10 pre-seeded community listings
- Buy & sell used/new books
- Condition ratings (New, Like New, Good, Fair, Poor)
- Seller profiles and ratings
- List-a-Book form with instant publishing

### 🛍️ Shopping Cart
- Add from store or marketplace
- Quantity controls
- Coupon codes (try: `BOOKVERSE10`, `FIRST20`, `SAVE50`)
- 3-step checkout (Cart → Shipping → Payment)
- Razorpay integration ready
- Order confirmation

### ❤️ Wishlist
- Save books for later
- Add all to cart at once
- Move between wishlist and cart

### ⭐ Reviews & Ratings
- 5-star rating system
- Written reviews with helpful votes
- Aggregated rating breakdown
- One review per user per book

### 📦 Orders
- Full order history
- Order status tracking (pending → confirmed → shipped → delivered)
- Order cancellation
- Detailed order view with tracking numbers

### 📊 User Dashboard
- Account overview with stats
- Order history
- Marketplace listings management
- Wishlist preview
- Review history
- Account settings & profile editing
- Role upgrade (buyer → seller)

### 👑 Admin Panel
- Platform statistics overview
- Books CRUD (add, edit, delete)
- Marketplace moderation (approve/suspend/delete)
- User management (ban/unban, role changes)
- Order status management

### 🔔 Notifications
- Real-time notification bell with badge count
- Order updates, wishlist alerts, listing confirmations
- Mark individual or all as read

### 🔐 Authentication
- Login/Register with role selection
- Password strength indicator
- Demo account quick-fill buttons
- Session persistence via localStorage

## 🎨 Design

- **Dark premium theme** — Deep navy background (#0D0D1A)
- **Glassmorphism cards** — Frosted glass effect with blur
- **Animated hero** — Floating orbs, gradient text, animated stats
- **Smooth transitions** — Page transitions, hover animations, micro-interactions
- **Fully responsive** — Mobile-first, hamburger drawer for mobile
- **Google Fonts** — Inter typeface

## 🏗️ Architecture

```
index.html          # SPA shell (navbar, footer, modal, toast)
css/
  variables.css     # Design tokens
  base.css          # Reset, typography, utilities
  components.css    # All UI components
  layout.css        # Navbar, hero, grid, footer
  animations.css    # Keyframes, transitions
js/
  store.js          # State management + localStorage + seed data
  ui.js             # Toast, modal, card HTML generators
  auth.js           # Login/register/session
  bookstore.js      # Home page
  marketplace.js    # Marketplace + list-a-book
  cart.js           # Cart, browse, book detail, wishlist, orders, profile
  dashboard.js      # User dashboard + admin panel
  app.js            # Router + initialization
```

## 💳 Razorpay Integration

The checkout is Razorpay-ready. In `js/cart.js`, locate the `placeOrder()` function and replace the mock with:

```javascript
const options = {
  key: 'YOUR_RAZORPAY_KEY',
  amount: Math.round(total * 100), // in paise
  currency: 'INR',
  name: 'BookVerse',
  description: `Order ${order.id}`,
  handler: function(response) {
    // Handle successful payment
    confirmOrder(order, response.razorpay_payment_id);
  }
};
const rzp = new Razorpay(options);
rzp.open();
```

## 🔮 Future Integrations

- **Backend**: Replace `localStorage` calls with `fetch()` API calls — the schema is pre-designed
- **Database**: MongoDB/PostgreSQL for users, books, orders
- **Auth**: JWT tokens or Firebase Auth
- **Images**: Cloudinary for book cover uploads
- **Search**: Elasticsearch for full-text search
- **Email**: Nodemailer/SendGrid for order confirmations
