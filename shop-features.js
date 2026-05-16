shop-features.js
/* ============================================================
   BYJAY — Shop Features
   ============================================================
   Adds the following features to every page that includes it:
     1. Shopping Cart       (persists in localStorage)
     2. Wishlist / Favorites (persists in localStorage)
     3. Product Detail Modal (click any product image)
     4. Search bar          (only on shop page)
     5. FAQ accordion       (only on contact page)
     6. Newsletter signup   (only on home page)

   USAGE:
     Add this line just before </body> on any page:
       <script src="shop-features.js"></script>

   No databases, no servers — everything saves locally in the
   user's browser using localStorage. Clearing browser data
   resets the cart and wishlist.
   ============================================================ */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────
  // 1. STORAGE HELPERS
  // ─────────────────────────────────────────────────────
  const CART_KEY = 'byjay_cart';
  const WISHLIST_KEY = 'byjay_wishlist';
  const NEWSLETTER_KEY = 'byjay_newsletter';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveWishlist(list) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  }

  // ─────────────────────────────────────────────────────
  // 2. INJECT HEADER ICONS (Cart + Wishlist)
  // ─────────────────────────────────────────────────────
  function injectHeaderIcons() {
    const desktopNav = document.querySelector('header nav.hidden.md\\:flex');
    const mobileMenuBtn = document.getElementById('menuBtn');

    // Need at least the hamburger to anchor against
    if (!mobileMenuBtn) return;

    const iconsHtml = `
      <button id="bj-wishlistBtn" class="bj-icon-btn" aria-label="Open wishlist" title="Wishlist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
        </svg>
        <span id="bj-wishlistCount" class="bj-icon-badge">0</span>
      </button>
      <button id="bj-cartBtn" class="bj-icon-btn" aria-label="Open cart" title="Cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <span id="bj-cartCount" class="bj-icon-badge">0</span>
      </button>
    `;

    // FIX: instead of inserting icons as a 4th flex child (which broke
    // the desktop layout because justify-between then spreads everything
    // out), we wrap the nav + icons + hamburger into a single right-side
    // group. That way the logo stays left and the whole right group hugs
    // together — which is what the original design intended.
    const headerRow = mobileMenuBtn.parentNode; // the .flex.items-center.justify-between div
    const rightGroup = document.createElement('div');
    rightGroup.className = 'bj-header-right flex items-center gap-2 md:gap-6';

    // Move the desktop nav (if it exists) and the hamburger into the group.
    // Then insert the icons between nav and hamburger.
    if (desktopNav) rightGroup.appendChild(desktopNav);

    const iconsWrap = document.createElement('div');
    iconsWrap.className = 'bj-header-icons flex items-center gap-1';
    iconsWrap.innerHTML = iconsHtml;
    rightGroup.appendChild(iconsWrap);

    rightGroup.appendChild(mobileMenuBtn);
    headerRow.appendChild(rightGroup);

    document.getElementById('bj-cartBtn').addEventListener('click', openCartDrawer);
    document.getElementById('bj-wishlistBtn').addEventListener('click', openWishlistDrawer);
  }

  // ─────────────────────────────────────────────────────
  // 3. INJECT CART DRAWER + WISHLIST DRAWER + PRODUCT MODAL
  // ─────────────────────────────────────────────────────
  function injectDrawers() {
    const html = `
      <!-- CART DRAWER -->
      <div id="bj-cartDrawer" class="bj-drawer hidden">
        <div class="bj-drawer-backdrop" onclick="window.byjayCloseCart()"></div>
        <aside class="bj-drawer-panel">
          <div class="bj-drawer-head">
            <h3 class="font-display text-2xl tracking-widest">YOUR CART</h3>
            <button onclick="window.byjayCloseCart()" class="bj-drawer-close" aria-label="Close cart">×</button>
          </div>
          <div id="bj-cartItems" class="bj-drawer-body"></div>
          <div class="bj-drawer-foot">
            <div class="bj-cart-totals">
              <span>SUBTOTAL</span>
              <span id="bj-cartTotal" class="bj-cart-total-amount">PHP 0</span>
            </div>
            <button id="bj-checkoutBtn" class="bj-checkout-btn" onclick="window.byjayCheckout()">
              CHECKOUT VIA DM
            </button>
            <p class="bj-cart-note">We'll confirm your order on Instagram within 24h.</p>
          </div>
        </aside>
      </div>

      <!-- WISHLIST DRAWER -->
      <div id="bj-wishlistDrawer" class="bj-drawer hidden">
        <div class="bj-drawer-backdrop" onclick="window.byjayCloseWishlist()"></div>
        <aside class="bj-drawer-panel">
          <div class="bj-drawer-head">
            <h3 class="font-display text-2xl tracking-widest">WISHLIST</h3>
            <button onclick="window.byjayCloseWishlist()" class="bj-drawer-close" aria-label="Close wishlist">×</button>
          </div>
          <div id="bj-wishlistItems" class="bj-drawer-body"></div>
        </aside>
      </div>

      <!-- PRODUCT DETAIL MODAL -->
      <div id="bj-productModal" class="bj-modal hidden">
        <div class="bj-modal-backdrop" onclick="window.byjayCloseProduct()"></div>
        <div class="bj-modal-box">
          <button onclick="window.byjayCloseProduct()" class="bj-modal-close" aria-label="Close">×</button>
          <div class="bj-product-grid">
            <div class="bj-product-imgwrap">
              <img id="bj-productImg" src="" alt="">
            </div>
            <div class="bj-product-info">
              <p id="bj-productCat" class="bj-product-cat"></p>
              <h2 id="bj-productName" class="bj-product-name"></h2>
              <p id="bj-productPrice" class="bj-product-price"></p>
              <p id="bj-productDesc" class="bj-product-desc"></p>
              <ul class="bj-product-features">
                <li>✦ Handpicked & quality-checked</li>
                <li>✦ Ships from Manila nationwide</li>
                <li>✦ Free shipping on PHP 500+</li>
              </ul>
              <div class="bj-product-actions">
                <button id="bj-addToCartBtn" class="bj-btn-primary">ADD TO CART</button>
                <button id="bj-wishToggleBtn" class="bj-btn-secondary">♡ SAVE</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TOAST NOTIFICATION -->
      <div id="bj-toast" class="bj-toast"></div>
    `;
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
  }

  // ─────────────────────────────────────────────────────
  // 4. CART OPERATIONS
  // ─────────────────────────────────────────────────────
  function addToCart(item) {
    const cart = getCart();
    const existing = cart.find(i => i.name === item.name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    saveCart(cart);
    updateCartCount();
    showToast(`${item.name} added to cart 🛒`);
  }

  function removeFromCart(name) {
    let cart = getCart();
    cart = cart.filter(i => i.name !== name);
    saveCart(cart);
    updateCartCount();
    renderCart();
  }

  function changeQty(name, delta) {
    const cart = getCart();
    const item = cart.find(i => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty < 1) {
      removeFromCart(name);
      return;
    }
    saveCart(cart);
    updateCartCount();
    renderCart();
  }

  function clearCart() {
    saveCart([]);
    updateCartCount();
    renderCart();
  }

  function cartTotal() {
    return getCart().reduce((sum, i) => sum + (i.price * i.qty), 0);
  }

  function updateCartCount() {
    const el = document.getElementById('bj-cartCount');
    if (!el) return;
    const count = getCart().reduce((sum, i) => sum + i.qty, 0);
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  }

  // ─────────────────────────────────────────────────────
  // 5. WISHLIST OPERATIONS
  // ─────────────────────────────────────────────────────
  function toggleWishlist(item) {
    const list = getWishlist();
    const idx = list.findIndex(i => i.name === item.name);
    if (idx > -1) {
      list.splice(idx, 1);
      saveWishlist(list);
      showToast(`Removed from wishlist`);
    } else {
      list.push(item);
      saveWishlist(list);
      showToast(`💛 Saved to wishlist`);
    }
    updateWishlistCount();
    refreshHeartIcons();
    renderWishlist();
  }

  function isInWishlist(name) {
    return getWishlist().some(i => i.name === name);
  }

  function updateWishlistCount() {
    const el = document.getElementById('bj-wishlistCount');
    if (!el) return;
    const count = getWishlist().length;
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  }

  // Sync all heart icons on the page with wishlist state
  function refreshHeartIcons() {
    document.querySelectorAll('.bj-heart').forEach(btn => {
      const name = btn.getAttribute('data-name');
      if (isInWishlist(name)) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  // ─────────────────────────────────────────────────────
  // 6. RENDER FUNCTIONS
  // ─────────────────────────────────────────────────────
  function renderCart() {
    const wrap = document.getElementById('bj-cartItems');
    const totalEl = document.getElementById('bj-cartTotal');
    if (!wrap || !totalEl) return;
    const cart = getCart();
    if (cart.length === 0) {
      wrap.innerHTML = `
        <div class="bj-empty">
          <div class="bj-empty-icon">🛒</div>
          <h4>Your cart is empty</h4>
          <p>Browse the shop and add some pins!</p>
          <a href="./shop.html" class="bj-btn-primary" style="margin-top:14px;display:inline-block;">SHOP NOW</a>
        </div>`;
      totalEl.textContent = 'PHP 0';
      return;
    }
    wrap.innerHTML = cart.map(item => `
      <div class="bj-cart-item">
        <div class="bj-cart-item-img">
          <img src="${item.image || ''}" alt="${item.name}" onerror="this.style.display='none'">
        </div>
        <div class="bj-cart-item-info">
          <p class="bj-cart-item-name">${item.name}</p>
          <p class="bj-cart-item-price">PHP ${item.price.toLocaleString()}</p>
          <div class="bj-qty-controls">
            <button onclick="window.byjayChangeQty('${escapeAttr(item.name)}', -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="window.byjayChangeQty('${escapeAttr(item.name)}', 1)">+</button>
            <button class="bj-remove" onclick="window.byjayRemoveFromCart('${escapeAttr(item.name)}')" title="Remove">🗑</button>
          </div>
        </div>
        <div class="bj-cart-item-sub">PHP ${(item.price * item.qty).toLocaleString()}</div>
      </div>
    `).join('');
    totalEl.textContent = 'PHP ' + cartTotal().toLocaleString();
  }

  function renderWishlist() {
    const wrap = document.getElementById('bj-wishlistItems');
    if (!wrap) return;
    const list = getWishlist();
    if (list.length === 0) {
      wrap.innerHTML = `
        <div class="bj-empty">
          <div class="bj-empty-icon">💔</div>
          <h4>No favorites yet</h4>
          <p>Tap the heart on any product to save it here.</p>
          <a href="./shop.html" class="bj-btn-primary" style="margin-top:14px;display:inline-block;">BROWSE SHOP</a>
        </div>`;
      return;
    }
    wrap.innerHTML = list.map(item => `
      <div class="bj-cart-item">
        <div class="bj-cart-item-img">
          <img src="${item.image || ''}" alt="${item.name}" onerror="this.style.display='none'">
        </div>
        <div class="bj-cart-item-info">
          <p class="bj-cart-item-name">${item.name}</p>
          <p class="bj-cart-item-price">PHP ${item.price.toLocaleString()}</p>
          <div class="bj-wish-actions">
            <button class="bj-mini-add" onclick="window.byjayAddFromWishlist('${escapeAttr(item.name)}')">+ Add to cart</button>
            <button class="bj-mini-remove" onclick="window.byjayToggleWishlistByName('${escapeAttr(item.name)}')">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function escapeAttr(s) {
    return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  // ─────────────────────────────────────────────────────
  // 7. DRAWER OPEN/CLOSE
  // ─────────────────────────────────────────────────────
  function openCartDrawer() {
    renderCart();
    const d = document.getElementById('bj-cartDrawer');
    d.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => d.classList.add('open'), 10);
  }

  function closeCartDrawer() {
    const d = document.getElementById('bj-cartDrawer');
    d.classList.remove('open');
    setTimeout(() => {
      d.classList.add('hidden');
      document.body.style.overflow = '';
    }, 250);
  }

  function openWishlistDrawer() {
    renderWishlist();
    const d = document.getElementById('bj-wishlistDrawer');
    d.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => d.classList.add('open'), 10);
  }

  function closeWishlistDrawer() {
    const d = document.getElementById('bj-wishlistDrawer');
    d.classList.remove('open');
    setTimeout(() => {
      d.classList.add('hidden');
      document.body.style.overflow = '';
    }, 250);
  }

  function checkout() {
    const cart = getCart();
    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }
    const total = cartTotal();
    const list = cart.map(i => `• ${i.name} × ${i.qty} — PHP ${(i.price * i.qty).toLocaleString()}`).join('\n');
    const message = `Hi BYJAY! I'd like to order:\n\n${list}\n\nTotal: PHP ${total.toLocaleString()}\n\nName:\nAddress:\nPayment method:`;
    // Save snapshot for thank-you page
    sessionStorage.setItem('byjay_lastOrder', JSON.stringify({ items: cart, total: total, date: new Date().toISOString() }));

    // ALSO save the order to byjay_orders so it shows up in the admin panel.
    // Each order gets a unique ID and starts as "pending".
    try {
      const allOrders = JSON.parse(localStorage.getItem('byjay_orders')) || [];
      const orderId = 'ORD-' + (1000 + allOrders.length + 1);
      const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        items: cart.map(i => ({
          name: i.name, price: i.price, qty: i.qty, category: i.category || 'pin'
        })),
        total: total,
        status: 'pending',
        customer: 'Customer (via cart)'
      };
      // Newest first
      allOrders.unshift(newOrder);
      localStorage.setItem('byjay_orders', JSON.stringify(allOrders));
    } catch (e) { /* admin saving is best-effort; don't break checkout */ }

    // Open Instagram DM with prefilled message (Instagram strips the message but the page opens)
    const dmUrl = 'https://ig.me/m/byjayy__';
    // Copy message to clipboard for easy pasting
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message).then(() => {
        showToast('Order copied! Paste it in our DM 📋');
      }).catch(() => {});
    }
    setTimeout(() => {
      window.open(dmUrl, '_blank');
      // Clear the cart now that the order has been "placed" (the user has
      // been handed off to Instagram). We snapshot it to sessionStorage
      // first so the thank-you page can show what they ordered.
      clearCart();
      closeCartDrawer();
      window.location.href = './thank-you.html';
    }, 600);
  }

  // ─────────────────────────────────────────────────────
  // 8. PRODUCT DETAIL MODAL
  // ─────────────────────────────────────────────────────
  // Sample descriptions per category — used when card has no data-desc
  const DEFAULT_DESCRIPTIONS = {
    snoopy:    'A classic Peanuts vibe — high-quality enamel pin with a soft-touch finish. Perfect on bags, jackets, or hats.',
    music:     'For the audiophile. Music-themed enamel pin with crisp linework and a glossy finish that pops on any fit.',
    hirono:    'POP MART Hirono inspired. Detailed sculpt, premium enamel, and a vibe-heavy aesthetic for the dreamy collector.',
    quotes:    'Wear what you mean. Statement enamel pin with bold typography — small in size, loud in personality.',
    smiski:    'Glow-in-the-dark friendly Smiski energy. Cute, collectible, and a guaranteed conversation starter.',
    sanrio:    'Sanrio-licensed feels with charming details. Pastel palette, smooth enamel, and pure serotonin in pin form.',
    limited:   'Part of a limited drop — once it sells out, it\'s gone for good. Numbered piece with collector-grade finishing.',
    default:   'Handpicked by Jay for quality and personality. Made with premium materials and shipped from Manila.',
  };

  function openProductModal(item) {
    document.getElementById('bj-productImg').src = item.image || '';
    document.getElementById('bj-productImg').alt = item.name;
    document.getElementById('bj-productName').textContent = item.name;
    document.getElementById('bj-productCat').textContent = (item.category || 'PIN').toUpperCase();
    document.getElementById('bj-productPrice').textContent = 'PHP ' + Number(item.price).toLocaleString();
    document.getElementById('bj-productDesc').textContent =
      item.description || DEFAULT_DESCRIPTIONS[item.category] || DEFAULT_DESCRIPTIONS.default;

    const addBtn = document.getElementById('bj-addToCartBtn');
    addBtn.onclick = () => { addToCart(item); closeProductModal(); };

    const wishBtn = document.getElementById('bj-wishToggleBtn');
    const inWish = isInWishlist(item.name);
    wishBtn.textContent = inWish ? '♥ SAVED' : '♡ SAVE';
    wishBtn.classList.toggle('active', inWish);
    wishBtn.onclick = () => {
      toggleWishlist(item);
      const nowIn = isInWishlist(item.name);
      wishBtn.textContent = nowIn ? '♥ SAVED' : '♡ SAVE';
      wishBtn.classList.toggle('active', nowIn);
    };

    const m = document.getElementById('bj-productModal');
    m.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => m.classList.add('open'), 10);
  }

  function closeProductModal() {
    const m = document.getElementById('bj-productModal');
    m.classList.remove('open');
    setTimeout(() => {
      m.classList.add('hidden');
      document.body.style.overflow = '';
    }, 250);
  }

  // ─────────────────────────────────────────────────────
  // 9. PRODUCT CARD ENHANCEMENT
  // Find every .shop-item-card that has data-name + data-price
  // and wire up: click → modal, heart toggle, add to cart
  // ─────────────────────────────────────────────────────
  function enhanceProductCards() {
    document.querySelectorAll('.shop-item-card').forEach(card => {
      const name = card.getAttribute('data-name');
      const priceStr = card.getAttribute('data-price');
      const category = card.getAttribute('data-category') || 'default';
      if (!name || !priceStr) return;
      const price = parseInt(priceStr, 10);
      const img = card.querySelector('img');
      const imageSrc = img ? img.getAttribute('src') : '';
      const item = { name, price, category, image: imageSrc };

      // Add a heart button (only if not already added)
      if (!card.querySelector('.bj-heart')) {
        const heart = document.createElement('button');
        heart.className = 'bj-heart';
        heart.setAttribute('data-name', name);
        heart.setAttribute('aria-label', 'Save to wishlist');
        heart.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>`;
        heart.onclick = (e) => {
          e.stopPropagation();
          toggleWishlist(item);
        };
        card.appendChild(heart);
      }

      // Make the card itself open the product modal (but keep the ORDER buttons working)
      const imgWrap = card.querySelector('.item-img-wrap');
      if (imgWrap && !imgWrap.dataset.bjBound) {
        imgWrap.dataset.bjBound = '1';
        imgWrap.style.cursor = 'pointer';
        imgWrap.addEventListener('click', (e) => {
          // Don't intercept if click was on a button inside the overlay
          if (e.target.closest('button')) return;
          openProductModal(item);
        });
      }

      // Wire up the buttons. Each card has TWO buttons named "ORDER":
      //   1. The hover-overlay button (inside .quickview-overlay) — repurpose to QUICK VIEW
      //   2. The bottom button (with class .btn-deal-sm or btn-plum) — repurpose to ADD
      // Doing this by container avoids the bug of renaming both to the same thing.
      const overlayBtn = card.querySelector('.quickview-overlay button');
      if (overlayBtn && !overlayBtn.dataset.bjBound) {
        overlayBtn.dataset.bjBound = '1';
        overlayBtn.textContent = 'QUICK VIEW';
        overlayBtn.title = 'Quick view';
        overlayBtn.removeAttribute('onclick');
        overlayBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openProductModal(item);
        });
      }
      // Find the "main" ORDER button — it's the one in the price row, not in the overlay
      card.querySelectorAll('button').forEach(btn => {
        if (btn.dataset.bjBound) return; // skip already-handled overlay button
        const txt = (btn.textContent || '').trim().toUpperCase();
        if (txt === 'ORDER') {
          btn.dataset.bjBound = '1';
          btn.textContent = '+ ADD';
          btn.title = 'Add to cart';
          btn.removeAttribute('onclick');
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(item);
          });
        }
      });
    });
    refreshHeartIcons();
  }

  // ─────────────────────────────────────────────────────
  // 10. SEARCH (only fires if #bj-searchInput exists)
  // ─────────────────────────────────────────────────────
  function bindSearch() {
    const input = document.getElementById('bj-searchInput');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      const cards = document.querySelectorAll('.shop-item-card');
      let visible = 0;
      cards.forEach(card => {
        const name = (card.getAttribute('data-name') || '').toLowerCase();
        const cat = (card.getAttribute('data-category') || '').toLowerCase();
        const match = q === '' || name.includes(q) || cat.includes(q);
        if (q !== '') {
          card.style.display = match ? '' : 'none';
          if (match) visible++;
        } else {
          // Search cleared — restore: remove inline display, let the
          // category filter's .hidden-item class take over again.
          card.style.display = '';
          // Count cards that AREN'T hidden by the filter
          if (!card.classList.contains('hidden-item')) visible++;
        }
      });
      const countEl = document.getElementById('countNum');
      if (countEl) countEl.textContent = visible;
      const empty = document.getElementById('emptyState');
      if (empty) empty.classList.toggle('hidden', visible !== 0);
    });
  }

  // ─────────────────────────────────────────────────────
  // 11. FAQ ACCORDION
  // ─────────────────────────────────────────────────────
  function bindFAQ() {
    document.querySelectorAll('.bj-faq-q').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.parentElement;
        const isOpen = item.classList.contains('open');
        // Close all others
        document.querySelectorAll('.bj-faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ─────────────────────────────────────────────────────
  // 12. NEWSLETTER
  // ─────────────────────────────────────────────────────
  function bindNewsletter() {
    const form = document.getElementById('bj-newsletterForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input.value.trim();
      if (!email) return;
      // Save locally so we can show confirmation persistently
      const existing = JSON.parse(localStorage.getItem(NEWSLETTER_KEY)) || [];
      if (!existing.includes(email)) existing.push(email);
      localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(existing));
      form.classList.add('bj-success');
      const success = document.getElementById('bj-newsletterSuccess');
      if (success) success.classList.remove('hidden');
      input.value = '';
      showToast('🎉 You\'re on the list!');
    });
  }

  // ─────────────────────────────────────────────────────
  // 13. TOAST NOTIFICATIONS
  // ─────────────────────────────────────────────────────
  let toastTimeout = null;
  function showToast(message) {
    const t = document.getElementById('bj-toast');
    if (!t) return;
    t.textContent = message;
    t.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => t.classList.remove('show'), 2400);
  }

  // ─────────────────────────────────────────────────────
  // 14. EXPOSE GLOBAL HOOKS
  // ─────────────────────────────────────────────────────
  window.byjayCloseCart = closeCartDrawer;
  window.byjayCloseWishlist = closeWishlistDrawer;
  window.byjayCloseProduct = closeProductModal;
  window.byjayCheckout = checkout;
  window.byjayChangeQty = changeQty;
  window.byjayRemoveFromCart = removeFromCart;
  window.byjayClearCart = clearCart;
  window.byjayAddFromWishlist = function (name) {
    const item = getWishlist().find(i => i.name === name);
    if (item) addToCart(item);
  };
  window.byjayToggleWishlistByName = function (name) {
    const item = getWishlist().find(i => i.name === name);
    if (item) toggleWishlist(item);
  };

  // ─────────────────────────────────────────────────────
  // 15. INIT
  // ─────────────────────────────────────────────────────
  function init() {
    injectHeaderIcons();
    injectDrawers();
    enhanceProductCards();
    bindSearch();
    bindFAQ();
    bindNewsletter();
    updateCartCount();
    updateWishlistCount();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCartDrawer();
        closeWishlistDrawer();
        closeProductModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
