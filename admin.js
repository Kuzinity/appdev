admin.js
/* ============================================================
   BYJAY ADMIN — JavaScript
   ============================================================
   Handles:
     - Login / logout (hardcoded credentials, sessionStorage)
     - Tab switching
     - Loading data from localStorage (orders, reviews, messages,
       newsletter, products stock)
     - Rendering each tab
     - Actions: delete, verify, change status, export to CSV,
       toggle stock, change password, wipe data

   Storage keys (shared with the main site):
     byjay_orders     — array of orders placed via cart checkout
     byjay_reviews    — array of user-submitted reviews
     byjay_messages   — array of contact form submissions
     byjay_newsletter — array of email strings (just emails)
     byjay_stock      — object: { "product name": true/false }
     byjay_admin_pw   — string (custom admin password override)
   ============================================================ */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────
  // CONFIG
  // ─────────────────────────────────────────────────────
  const ADMIN_USER = 'byjay';
  const DEFAULT_ADMIN_PASS = 'pinsforever';
  const SESSION_KEY = 'byjay_admin_session';

  // Storage helpers
  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function getAdminPass() {
    return localStorage.getItem('byjay_admin_pw') || DEFAULT_ADMIN_PASS;
  }

  // ─────────────────────────────────────────────────────
  // SEED DATA (so admin doesn't look empty on first visit)
  // Only seeds if there's nothing there yet.
  // ─────────────────────────────────────────────────────
  function seedDataIfEmpty() {
    if (!localStorage.getItem('byjay_orders')) {
      const sampleOrders = [
        {
          id: 'ORD-1001',
          date: new Date(Date.now() - 86400000 * 3).toISOString(),
          items: [
            { name: 'Snoopy Classic Pin', price: 350, qty: 2, category: 'snoopy' },
            { name: 'Music Note Pin', price: 320, qty: 1, category: 'music' }
          ],
          total: 1020,
          status: 'delivered',
          customer: 'Sample Customer'
        },
        {
          id: 'ORD-1002',
          date: new Date(Date.now() - 86400000).toISOString(),
          items: [
            { name: 'Hirono Dream Pin', price: 380, qty: 1, category: 'hirono' }
          ],
          total: 380,
          status: 'shipped',
          customer: 'Sample Customer'
        },
        {
          id: 'ORD-1003',
          date: new Date(Date.now() - 3600000 * 2).toISOString(),
          items: [
            { name: 'Sanrio Hello Kitty Pin', price: 400, qty: 1, category: 'sanrio' },
            { name: 'Smiski Glow Pin', price: 360, qty: 2, category: 'smiski' }
          ],
          total: 1120,
          status: 'pending',
          customer: 'Sample Customer'
        }
      ];
      save('byjay_orders', sampleOrders);
    }

    if (!localStorage.getItem('byjay_messages')) {
      const sampleMessages = [
        {
          id: 'MSG-' + Date.now(),
          name: 'Maria Reyes',
          email: 'maria@example.com',
          subject: 'Custom F1 charm request',
          body: 'Hi Jay! I love your F1 charms — would it be possible to do a custom one with the Ferrari logo and the number 16 for Charles Leclerc? Thanks!',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          read: false
        },
        {
          id: 'MSG-' + (Date.now() + 1),
          name: 'Andre Cruz',
          email: 'andre@example.com',
          subject: 'Bulk order inquiry',
          body: 'Hello, I\'m interested in ordering 10 Snoopy pins for my friend\'s birthday party. Do you offer bulk discounts? Looking forward to your reply.',
          date: new Date(Date.now() - 3600000 * 6).toISOString(),
          read: false
        }
      ];
      save('byjay_messages', sampleMessages);
    }
  }

  // ─────────────────────────────────────────────────────
  // PRODUCT CATALOG (matches the shop.html cards)
  // ─────────────────────────────────────────────────────
  const PRODUCTS = [
    { name: 'Snoopy Classic Pin',     price: 350, category: 'snoopy',  image: 'snoopy.jpg' },
    { name: 'Snoopy Vol.2 Pin',       price: 350, category: 'snoopy',  image: 'snoopy2.jpg' },
    { name: 'Peanuts Gang Pin',       price: 380, category: 'snoopy',  image: 'snoopy3.webp' },
    { name: 'Music Note Pin',         price: 320, category: 'music',   image: 'cd1.jpg' },
    { name: 'Vinyl Record Pin',       price: 340, category: 'music',   image: 'cd2.jpg' },
    { name: 'CD Aesthetic Pin',       price: 320, category: 'music',   image: 'cd3.jpg' },
    { name: 'Hirono Dream Pin',       price: 380, category: 'hirono',  image: 'hirono1.webp' },
    { name: 'Hirono Sad Pin',         price: 380, category: 'hirono',  image: 'hirono2.jpg' },
    { name: 'Hirono Reflection Pin',  price: 400, category: 'hirono',  image: 'hirono3.jpg' },
    { name: 'Vibe Quote Pin',         price: 300, category: 'quotes',  image: 'quotes1.webp' },
    { name: 'Mood Quote Pin',         price: 300, category: 'quotes',  image: 'quotes2.webp' },
    { name: 'Statement Quote Pin',    price: 320, category: 'quotes',  image: 'quotes3.jpg' },
    { name: 'Smiski Glow Pin',        price: 360, category: 'smiski',  image: 'smiski.jpg' },
    { name: 'Smiski Crouching Pin',   price: 360, category: 'smiski',  image: 'smiski2.jpg' },
    { name: 'Smiski Living Pin',      price: 380, category: 'smiski',  image: 'smiski3.webp' },
    { name: 'Sanrio Hello Kitty Pin', price: 400, category: 'sanrio',  image: 'sanrio.jpg' },
    { name: 'Sanrio Cinnamoroll Pin', price: 400, category: 'sanrio',  image: 'sanrio2.jpg' },
    { name: 'Sanrio Kuromi Pin',      price: 400, category: 'sanrio',  image: 'sanrio3.jpg' },
    { name: 'F1 Limited Bracelet',    price: 999, category: 'limited', image: 'f1.png' },
    { name: 'Rapunzel Charm Watch',   price: 999, category: 'limited', image: 'rapunzel.png' },
    { name: 'Spider-Man Bracelet',    price: 850, category: 'limited', image: 'spiderman.png' },
    { name: 'Linked in Love Set',     price: 1200, category: 'limited', image: 'linked.png' }
  ];

  // ─────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────
  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }

  function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminLayout').style.display = 'none';
  }

  function showAdmin() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminLayout').style.display = 'grid';
    renderAll();
  }

  function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    const errEl = document.getElementById('loginError');
    const card = document.getElementById('loginCard');

    if (user === ADMIN_USER && pass === getAdminPass()) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      errEl.textContent = '';
      showAdmin();
    } else {
      errEl.textContent = '✗ Wrong username or password';
      card.classList.remove('shake');
      void card.offsetWidth; // restart animation
      card.classList.add('shake');
      document.getElementById('loginPass').value = '';
      document.getElementById('loginPass').focus();
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginError').textContent = '';
    showLogin();
  }

  // ─────────────────────────────────────────────────────
  // TAB SWITCHING
  // ─────────────────────────────────────────────────────
  function switchTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(p => {
      p.classList.toggle('active', p.dataset.tabPanel === tabName);
    });
    // Close mobile sidebar after navigation
    const sb = document.getElementById('adminSidebar');
    if (sb) sb.classList.remove('open');
    // Re-render the visible tab in case data changed
    renderTab(tabName);
  }

  function renderTab(name) {
    switch (name) {
      case 'dashboard':  renderDashboard(); break;
      case 'orders':     renderOrders(); break;
      case 'products':   renderProducts(); break;
      case 'reviews':    renderReviews(); break;
      case 'messages':   renderMessages(); break;
      case 'newsletter': renderNewsletter(); break;
      case 'settings':   /* static */ break;
    }
  }

  // ─────────────────────────────────────────────────────
  // RENDER: DASHBOARD
  // ─────────────────────────────────────────────────────
  function renderDashboard() {
    const orders = load('byjay_orders', []);
    const reviews = load('byjay_reviews', []);
    const products = PRODUCTS;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    document.getElementById('statOrders').textContent = orders.length;
    document.getElementById('statRevenue').textContent = totalRevenue.toLocaleString();
    document.getElementById('statProducts').textContent = products.length;
    document.getElementById('statReviews').textContent = reviews.length;

    // Avg star rating
    if (reviews.length > 0) {
      const avg = reviews.reduce((s, r) => s + (r.stars || 0), 0) / reviews.length;
      document.getElementById('statReviewsTrend').textContent = 'avg ' + '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
    } else {
      document.getElementById('statReviewsTrend').textContent = 'no reviews yet';
    }

    // Recent orders (top 3)
    const recentOrders = document.getElementById('recentOrders');
    if (orders.length === 0) {
      recentOrders.innerHTML = '<p style="color: var(--a-text-muted); font-size: 13px; text-align: center; padding: 18px;">No orders yet.</p>';
    } else {
      recentOrders.innerHTML = orders.slice(0, 3).map(o => {
        const itemCount = (o.items || []).reduce((s, i) => s + (i.qty || 1), 0);
        return `
          <div class="mini-list-row">
            <div>
              <strong>${esc(o.id)}</strong>
              <div style="font-size: 11px; color: var(--a-text-muted);">${itemCount} item${itemCount !== 1 ? 's' : ''} · ${shortDate(o.date)}</div>
            </div>
            <div class="mini-list-row-amount">PHP ${(o.total || 0).toLocaleString()}</div>
          </div>`;
      }).join('');
    }

    // Recent reviews (top 3)
    const recentReviews = document.getElementById('recentReviews');
    if (reviews.length === 0) {
      recentReviews.innerHTML = '<p style="color: var(--a-text-muted); font-size: 13px; text-align: center; padding: 18px;">No reviews yet.</p>';
    } else {
      recentReviews.innerHTML = reviews.slice(0, 3).map(r => `
        <div class="mini-list-row">
          <div>
            <strong>${esc(r.name)}</strong>
            <div style="font-size: 11px; color: var(--a-gold);">${'★'.repeat(r.stars || 0)}</div>
          </div>
          <div style="font-size: 11px; color: var(--a-text-muted); margin-left: auto; max-width: 50%; text-align: right;">"${esc((r.text || '').substring(0, 50))}${(r.text || '').length > 50 ? '…' : ''}"</div>
        </div>
      `).join('');
    }

    // Best-selling categories (based on order items)
    const catCounts = {};
    orders.forEach(o => {
      (o.items || []).forEach(i => {
        const c = i.category || 'other';
        catCounts[c] = (catCounts[c] || 0) + (i.qty || 1);
      });
    });
    const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    const max = sorted.length > 0 ? sorted[0][1] : 1;
    const bestEl = document.getElementById('bestCategories');
    if (sorted.length === 0) {
      bestEl.innerHTML = '<p style="color: var(--a-text-muted); font-size: 13px; text-align: center; padding: 18px;">No sales yet — place a test order to see data.</p>';
    } else {
      bestEl.innerHTML = sorted.map(([cat, count]) => `
        <div class="bar-row">
          <div class="bar-name">${esc(cat).charAt(0).toUpperCase() + esc(cat).slice(1)}</div>
          <div class="bar-track"><div class="bar-fill" style="width: ${(count / max * 100).toFixed(0)}%"></div></div>
          <div class="bar-count">${count}</div>
        </div>
      `).join('');
    }

    // Update sidebar badges
    document.getElementById('ordersBadge').textContent = orders.length;
    document.getElementById('reviewsBadge').textContent = reviews.length;
    const messages = load('byjay_messages', []);
    const unread = messages.filter(m => !m.read).length;
    document.getElementById('messagesBadge').textContent = unread;
  }

  // ─────────────────────────────────────────────────────
  // RENDER: ORDERS
  // ─────────────────────────────────────────────────────
  function renderOrders() {
    const orders = load('byjay_orders', []);
    const tbody = document.getElementById('ordersTbody');
    const tableWrap = document.getElementById('ordersTableWrap');
    const empty = document.getElementById('ordersEmpty');

    if (orders.length === 0) {
      tableWrap.style.display = 'none';
      empty.style.display = 'block';
      return;
    }
    tableWrap.style.display = '';
    empty.style.display = 'none';

    tbody.innerHTML = orders.map((o, idx) => {
      const itemCount = (o.items || []).reduce((s, i) => s + (i.qty || 1), 0);
      const status = o.status || 'pending';
      return `
        <tr class="order-row" data-order-idx="${idx}">
          <td><strong>${esc(o.id)}</strong></td>
          <td>${fmtDate(o.date)}</td>
          <td>${itemCount} item${itemCount !== 1 ? 's' : ''}</td>
          <td><strong>PHP ${(o.total || 0).toLocaleString()}</strong></td>
          <td>
            <select class="status-select badge badge-${status}" onclick="event.stopPropagation()" onchange="window.adminSetOrderStatus(${idx}, this.value)">
              ${['pending','confirmed','shipped','delivered','cancelled'].map(s =>
                `<option value="${s}" ${s === status ? 'selected' : ''}>${s}</option>`
              ).join('')}
            </select>
          </td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); window.adminDeleteOrder(${idx})">Delete</button>
          </td>
        </tr>
        <tr class="order-detail" id="orderDetail-${idx}" style="display: none;">
          <td colspan="6">
            <div class="order-detail-items">
              ${(o.items || []).map(i => `
                <div class="order-detail-item">
                  <span><strong>${esc(i.name)}</strong> <span style="color: var(--a-text-muted);">· ${esc(i.category || 'pin')}</span></span>
                  <span>× ${i.qty || 1}</span>
                  <span><strong>PHP ${((i.price || 0) * (i.qty || 1)).toLocaleString()}</strong></span>
                </div>
              `).join('')}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Wire up row clicks (expand/collapse)
    tbody.querySelectorAll('.order-row').forEach(row => {
      row.addEventListener('click', () => {
        const idx = row.dataset.orderIdx;
        const detail = document.getElementById('orderDetail-' + idx);
        detail.style.display = detail.style.display === 'none' ? '' : 'none';
      });
    });
  }

  // ─────────────────────────────────────────────────────
  // RENDER: PRODUCTS
  // ─────────────────────────────────────────────────────
  function renderProducts() {
    const stock = load('byjay_stock', {});
    const grid = document.getElementById('productsGrid');

    grid.innerHTML = PRODUCTS.map(p => {
      const inStock = stock[p.name] !== false; // default true
      const checked = inStock ? 'checked' : '';
      return `
        <div class="product-card-adm">
          <div class="product-card-img">
            <img src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.style.display='none'">
          </div>
          <p class="product-card-name">${esc(p.name)}</p>
          <p class="product-card-cat">${esc(p.category)}</p>
          <p class="product-card-price">PHP ${p.price.toLocaleString()}</p>
          <div class="product-card-actions">
            <label class="stock-toggle ${inStock ? 'in-stock' : ''}">
              <input type="checkbox" ${checked} onchange="window.adminToggleStock('${escAttr(p.name)}', this.checked)">
              <span class="stock-slider"></span>
              <span>${inStock ? 'In Stock' : 'Sold out'}</span>
            </label>
          </div>
        </div>
      `;
    }).join('');
  }

  // ─────────────────────────────────────────────────────
  // RENDER: REVIEWS
  // ─────────────────────────────────────────────────────
  function renderReviews() {
    const reviews = load('byjay_reviews', []);
    const list = document.getElementById('reviewsList');
    const empty = document.getElementById('reviewsEmpty');

    if (reviews.length === 0) {
      list.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    list.innerHTML = reviews.map((r, idx) => `
      <div class="review-row ${r.hidden ? 'hidden-review' : ''}">
        <div>
          <div class="review-head">
            <span class="review-name">${esc(r.name)}</span>
            <span class="review-stars">${'★'.repeat(r.stars || 0)}${'☆'.repeat(5 - (r.stars || 0))}</span>
            ${r.verified ? '<span class="badge badge-verified">✓ Verified</span>' : ''}
            ${r.hidden ? '<span class="badge badge-cancelled">Hidden</span>' : ''}
            <span class="review-meta">${esc(r.date || '')} ${r.item ? '· ' + esc(r.item) : ''}</span>
          </div>
          <p class="review-text">${esc(r.text)}</p>
        </div>
        <div class="review-actions">
          <button class="btn btn-outline btn-sm" onclick="window.adminToggleVerified(${idx})">
            ${r.verified ? '✓ Verified' : 'Verify'}
          </button>
          <button class="btn btn-outline btn-sm" onclick="window.adminToggleHidden(${idx})">
            ${r.hidden ? 'Unhide' : 'Hide'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="window.adminDeleteReview(${idx})">Delete</button>
        </div>
      </div>
    `).join('');
  }

  // ─────────────────────────────────────────────────────
  // RENDER: MESSAGES
  // ─────────────────────────────────────────────────────
  function renderMessages() {
    const messages = load('byjay_messages', []);
    const list = document.getElementById('messagesList');
    const empty = document.getElementById('messagesEmpty');

    if (messages.length === 0) {
      list.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    list.innerHTML = messages.map((m, idx) => `
      <div class="message-card ${m.read ? '' : 'unread'}">
        <div class="message-head">
          <div>
            <span class="message-from">${esc(m.name)}</span>
            <span class="message-email">· ${esc(m.email)}</span>
            ${!m.read ? '<span class="badge badge-pending" style="margin-left:8px;">NEW</span>' : ''}
          </div>
          <span class="message-date">${fmtDate(m.date)}</span>
        </div>
        ${m.subject ? `<p style="font-size: 12px; color: var(--a-text-muted); margin: 0 0 4px;"><strong>Subject:</strong> ${esc(m.subject)}</p>` : ''}
        <div class="message-body">${esc(m.body)}</div>
        <div class="message-actions">
          ${!m.read ? `<button class="btn btn-outline btn-sm" onclick="window.adminMarkRead(${idx})">Mark as read</button>` : ''}
          <button class="btn btn-outline btn-sm" onclick="window.adminReply('${escAttr(m.email)}')">Reply via Email</button>
          <button class="btn btn-danger btn-sm" onclick="window.adminDeleteMessage(${idx})">Delete</button>
        </div>
      </div>
    `).join('');
  }

  // ─────────────────────────────────────────────────────
  // RENDER: NEWSLETTER
  // ─────────────────────────────────────────────────────
  function renderNewsletter() {
    const emails = load('byjay_newsletter', []);
    const list = document.getElementById('newsletterList');
    const empty = document.getElementById('newsletterEmpty');

    if (emails.length === 0) {
      list.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    list.innerHTML = emails.map((email, idx) => `
      <div class="simple-row">
        <span style="font-size: 22px;">📧</span>
        <div class="simple-row-main">
          <p class="simple-row-title">${esc(email)}</p>
          <p class="simple-row-sub">Subscribed #${idx + 1}</p>
        </div>
        <div class="simple-row-actions">
          <button class="btn btn-outline btn-sm" onclick="window.adminCopyEmail('${escAttr(email)}')">📋 Copy</button>
          <button class="btn btn-danger btn-sm" onclick="window.adminDeleteEmail(${idx})">Delete</button>
        </div>
      </div>
    `).join('');
  }

  function renderAll() {
    renderDashboard();
    // The other tabs render lazily when switched to,
    // but we render them once so badges & counts are right.
    renderOrders();
    renderReviews();
    renderMessages();
    renderNewsletter();
    renderProducts();
  }

  // ─────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────
  function setOrderStatus(idx, status) {
    const orders = load('byjay_orders', []);
    if (!orders[idx]) return;
    orders[idx].status = status;
    save('byjay_orders', orders);
    renderOrders();
    renderDashboard();
    toast(`Order ${orders[idx].id} → ${status}`, 'success');
  }

  function deleteOrder(idx) {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    const orders = load('byjay_orders', []);
    orders.splice(idx, 1);
    save('byjay_orders', orders);
    renderOrders();
    renderDashboard();
    toast('Order deleted', 'success');
  }

  function clearOrders() {
    if (!confirm('Delete ALL orders? This cannot be undone.')) return;
    save('byjay_orders', []);
    renderOrders();
    renderDashboard();
    toast('All orders cleared', 'success');
  }

  function exportOrders() {
    const orders = load('byjay_orders', []);
    if (orders.length === 0) { toast('No orders to export', 'error'); return; }
    const rows = [['Order ID', 'Date', 'Items', 'Quantity', 'Total (PHP)', 'Status']];
    orders.forEach(o => {
      const itemList = (o.items || []).map(i => `${i.name} (x${i.qty || 1})`).join('; ');
      const qty = (o.items || []).reduce((s, i) => s + (i.qty || 1), 0);
      rows.push([o.id, fmtDate(o.date), itemList, qty, o.total, o.status]);
    });
    downloadCSV(rows, 'byjay-orders.csv');
    toast('Orders exported', 'success');
  }

  function toggleStock(name, inStock) {
    const stock = load('byjay_stock', {});
    stock[name] = inStock;
    save('byjay_stock', stock);
    renderProducts();
    toast(`${name} → ${inStock ? 'In Stock' : 'Sold out'}`, 'success');
  }

  function resetStock() {
    if (!confirm('Reset all products to "in stock"?')) return;
    save('byjay_stock', {});
    renderProducts();
    toast('All products reset to in stock', 'success');
  }

  function toggleVerified(idx) {
    const reviews = load('byjay_reviews', []);
    if (!reviews[idx]) return;
    reviews[idx].verified = !reviews[idx].verified;
    save('byjay_reviews', reviews);
    renderReviews();
    toast(reviews[idx].verified ? 'Marked as verified' : 'Verification removed', 'success');
  }

  function toggleHidden(idx) {
    const reviews = load('byjay_reviews', []);
    if (!reviews[idx]) return;
    reviews[idx].hidden = !reviews[idx].hidden;
    save('byjay_reviews', reviews);
    renderReviews();
    toast(reviews[idx].hidden ? 'Review hidden' : 'Review unhidden', 'success');
  }

  function deleteReview(idx) {
    if (!confirm('Delete this review?')) return;
    const reviews = load('byjay_reviews', []);
    reviews.splice(idx, 1);
    save('byjay_reviews', reviews);
    renderReviews();
    renderDashboard();
    toast('Review deleted', 'success');
  }

  function markRead(idx) {
    const messages = load('byjay_messages', []);
    if (!messages[idx]) return;
    messages[idx].read = true;
    save('byjay_messages', messages);
    renderMessages();
    renderDashboard();
  }

  function markAllRead() {
    const messages = load('byjay_messages', []);
    messages.forEach(m => m.read = true);
    save('byjay_messages', messages);
    renderMessages();
    renderDashboard();
    toast('All messages marked as read', 'success');
  }

  function deleteMessage(idx) {
    if (!confirm('Delete this message?')) return;
    const messages = load('byjay_messages', []);
    messages.splice(idx, 1);
    save('byjay_messages', messages);
    renderMessages();
    renderDashboard();
    toast('Message deleted', 'success');
  }

  function clearMessages() {
    if (!confirm('Delete ALL messages? This cannot be undone.')) return;
    save('byjay_messages', []);
    renderMessages();
    renderDashboard();
    toast('All messages cleared', 'success');
  }

  function reply(email) {
    window.location.href = 'mailto:' + email + '?subject=Re: Your BYJAY inquiry';
  }

  function copyEmail(email) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(() => toast(`Copied: ${email}`, 'success'));
    } else {
      toast(email, 'success');
    }
  }

  function deleteEmail(idx) {
    if (!confirm('Remove this subscriber?')) return;
    const emails = load('byjay_newsletter', []);
    emails.splice(idx, 1);
    save('byjay_newsletter', emails);
    renderNewsletter();
    toast('Subscriber removed', 'success');
  }

  function clearEmails() {
    if (!confirm('Delete ALL newsletter subscribers?')) return;
    save('byjay_newsletter', []);
    renderNewsletter();
    toast('Newsletter list cleared', 'success');
  }

  function exportEmails() {
    const emails = load('byjay_newsletter', []);
    if (emails.length === 0) { toast('No emails to export', 'error'); return; }
    const rows = [['Email']];
    emails.forEach(e => rows.push([e]));
    downloadCSV(rows, 'byjay-newsletter.csv');
    toast('Newsletter exported', 'success');
  }

  function changePassword() {
    const input = document.getElementById('newPassword');
    const newPw = input.value.trim();
    if (!newPw) { toast('Enter a new password first', 'error'); return; }
    if (newPw.length < 4) { toast('Password must be at least 4 characters', 'error'); return; }
    localStorage.setItem('byjay_admin_pw', newPw);
    input.value = '';
    toast('Password updated. Use the new one next time you log in.', 'success');
  }

  function wipeAll() {
    if (!confirm('This will permanently delete ALL admin data:\n\n• All orders\n• All reviews\n• All messages\n• All newsletter subscribers\n• Stock status for every product\n• Custom admin password\n\nAre you sure?')) return;
    if (!confirm('Really sure? This cannot be undone.')) return;
    ['byjay_orders','byjay_reviews','byjay_messages','byjay_newsletter','byjay_stock','byjay_admin_pw'].forEach(k => localStorage.removeItem(k));
    seedDataIfEmpty();
    renderAll();
    toast('All admin data has been wiped', 'success');
  }

  // ─────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function escAttr(s) {
    return String(s == null ? '' : s).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }
  function fmtDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-PH', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return iso; }
  }
  function shortDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = (now - d) / 1000; // seconds
      if (diff < 60) return 'just now';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
      if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
      if (diff < 86400 * 7) return Math.floor(diff / 86400) + 'd ago';
      return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    } catch (e) { return iso; }
  }

  function downloadCSV(rows, filename) {
    const csv = rows.map(r =>
      r.map(cell => {
        const s = String(cell == null ? '' : cell);
        // Quote if contains comma, quote, or newline
        if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      }).join(',')
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  let toastTimeout = null;
  function toast(message, type) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = message;
    t.className = 'toast show' + (type ? ' toast-' + type : '');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => t.className = 'toast', 2800);
  }

  // ─────────────────────────────────────────────────────
  // EXPOSE GLOBALS (for inline onclick handlers)
  // ─────────────────────────────────────────────────────
  window.switchTab = switchTab;
  window.adminSetOrderStatus = setOrderStatus;
  window.adminDeleteOrder = deleteOrder;
  window.adminClearOrders = clearOrders;
  window.adminExportOrders = exportOrders;
  window.adminToggleStock = toggleStock;
  window.adminResetStock = resetStock;
  window.adminToggleVerified = toggleVerified;
  window.adminToggleHidden = toggleHidden;
  window.adminDeleteReview = deleteReview;
  window.adminMarkRead = markRead;
  window.adminMarkAllRead = markAllRead;
  window.adminDeleteMessage = deleteMessage;
  window.adminClearMessages = clearMessages;
  window.adminReply = reply;
  window.adminCopyEmail = copyEmail;
  window.adminDeleteEmail = deleteEmail;
  window.adminClearEmails = clearEmails;
  window.adminExportEmails = exportEmails;
  window.adminChangePassword = changePassword;
  window.adminWipeAll = wipeAll;

  // ─────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────
  function init() {
    seedDataIfEmpty();

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Tab buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Mobile sidebar toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('adminSidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    if (isLoggedIn()) showAdmin();
    else showLogin();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
