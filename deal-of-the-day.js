deal-of-the-day.js
/* ============================================================
   BYJAY — Deal of the Day
   ============================================================
   Picks one product per day to feature at a discount. The
   selection is deterministic based on the calendar date, so
   everyone who visits the site on the same day sees the same
   deal, and at midnight it rolls over to the next one.

   No randomness, no backend — pure date math.

   USAGE:
     <script src="deal-of-the-day.js"></script>
     <div id="dotd-banner"></div>          (for big homepage banner)
     <div id="dotd-strip"></div>           (for slim shop-page strip)
   ============================================================ */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────
  // 1. POOL of products that can become "deal of the day"
  // Mirrors the catalog in shop.html / admin.js
  // Each gets a discount percentage between 15-30%, also
  // deterministic per product so the price is stable.
  // ─────────────────────────────────────────────────────
  const DEAL_POOL = [
    { name: 'Snoopy Classic Pin',     price: 350, category: 'snoopy',  image: 'snoopy.jpg',     discount: 25 },
    { name: 'Music Note Pin',         price: 320, category: 'music',   image: 'cd1.jpg',         discount: 20 },
    { name: 'Hirono Dream Pin',       price: 380, category: 'hirono',  image: 'hirono1.webp',    discount: 30 },
    { name: 'Vibe Quote Pin',         price: 300, category: 'quotes',  image: 'quotes1.webp',    discount: 15 },
    { name: 'Smiski Glow Pin',        price: 360, category: 'smiski',  image: 'smiski.jpg',      discount: 25 },
    { name: 'Sanrio Hello Kitty Pin', price: 400, category: 'sanrio',  image: 'sanrio.jpg',      discount: 20 },
    { name: 'Snoopy Vol.2 Pin',       price: 350, category: 'snoopy',  image: 'snoopy2.jpg',     discount: 18 },
    { name: 'Vinyl Record Pin',       price: 340, category: 'music',   image: 'cd2.jpg',         discount: 22 },
    { name: 'Hirono Sad Pin',         price: 380, category: 'hirono',  image: 'hirono2.jpg',     discount: 28 },
    { name: 'Mood Quote Pin',         price: 300, category: 'quotes',  image: 'quotes2.webp',    discount: 17 },
    { name: 'Smiski Crouching Pin',   price: 360, category: 'smiski',  image: 'smiski2.jpg',     discount: 23 },
    { name: 'Sanrio Cinnamoroll Pin', price: 400, category: 'sanrio',  image: 'sanrio2.jpg',     discount: 25 },
    { name: 'Peanuts Gang Pin',       price: 380, category: 'snoopy',  image: 'snoopy3.webp',    discount: 20 },
    { name: 'CD Aesthetic Pin',       price: 320, category: 'music',   image: 'cd3.jpg',         discount: 19 }
  ];

  // ─────────────────────────────────────────────────────
  // 2. DETERMINISTIC SELECTION
  // Use day-of-year as the index into the deal pool.
  // Same date → same deal, every browser, every refresh.
  // ─────────────────────────────────────────────────────
  function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function getTodaysDeal() {
    const now = new Date();
    const idx = getDayOfYear(now) % DEAL_POOL.length;
    const product = DEAL_POOL[idx];
    const salePrice = Math.round(product.price * (100 - product.discount) / 100);
    const savings = product.price - salePrice;

    return {
      ...product,
      salePrice,
      savings,
      isDeal: true
    };
  }

  // ─────────────────────────────────────────────────────
  // 3. COUNTDOWN TO MIDNIGHT
  // ─────────────────────────────────────────────────────
  function msUntilMidnight() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    return tomorrow - now;
  }

  function formatCountdown(ms) {
    if (ms <= 0) return { h: '00', m: '00', s: '00' };
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return { h, m, s };
  }

  // ─────────────────────────────────────────────────────
  // 4. RENDER FULL BANNER (homepage)
  // ─────────────────────────────────────────────────────
  function renderBanner(deal) {
    const wrap = document.getElementById('dotd-banner');
    if (!wrap) return;

    wrap.innerHTML = `
      <section class="dotd-banner">
        <div class="dotd-inner">

          <div class="dotd-text">
            <div class="dotd-pulse">
              <span class="dotd-pulse-dot"></span>
              <span class="dotd-pulse-text">LIVE NOW · DEAL OF THE DAY</span>
            </div>
            <h2 class="dotd-headline">${escapeHtml(deal.discount)}% OFF<br>TODAY ONLY</h2>
            <p class="dotd-product-name">${escapeHtml(deal.name)}</p>

            <div class="dotd-pricing">
              <span class="dotd-sale-price">PHP ${deal.salePrice.toLocaleString()}</span>
              <span class="dotd-original-price">PHP ${deal.price.toLocaleString()}</span>
              <span class="dotd-save-badge">SAVE PHP ${deal.savings.toLocaleString()}</span>
            </div>

            <div class="dotd-countdown" id="dotd-countdown-big">
              <p class="dotd-countdown-label">⏰ ENDS IN</p>
              <div class="dotd-countdown-time">
                <div class="dotd-time-box"><span class="dotd-time-num" data-cd="h">00</span><span class="dotd-time-lbl">HRS</span></div>
                <div class="dotd-time-sep">:</div>
                <div class="dotd-time-box"><span class="dotd-time-num" data-cd="m">00</span><span class="dotd-time-lbl">MIN</span></div>
                <div class="dotd-time-sep">:</div>
                <div class="dotd-time-box"><span class="dotd-time-num" data-cd="s">00</span><span class="dotd-time-lbl">SEC</span></div>
              </div>
            </div>

            <div class="dotd-actions">
              <button id="dotd-add-btn" class="dotd-btn-primary">+ ADD TO CART · PHP ${deal.salePrice.toLocaleString()}</button>
              <a href="./shop.html" class="dotd-btn-secondary">VIEW SHOP →</a>
            </div>
            <p class="dotd-note">✦ Limited to one deal per day · Rotates at midnight</p>
          </div>

          <div class="dotd-image-side">
            <div class="dotd-image-glow"></div>
            <div class="dotd-discount-stamp">
              <span class="dotd-stamp-pct">-${escapeHtml(deal.discount)}%</span>
              <span class="dotd-stamp-lbl">TODAY</span>
            </div>
            <img src="${escapeHtml(deal.image)}" alt="${escapeHtml(deal.name)} - Deal of the Day" class="dotd-image">
          </div>

        </div>
      </section>
    `;

    // Wire up the add-to-cart button. Uses the same cart system from
    // shop-features.js, so the discounted item lands in the same cart.
    const addBtn = document.getElementById('dotd-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        addDealToCart(deal);
      });
    }
  }

  // ─────────────────────────────────────────────────────
  // 5. RENDER SLIM STRIP (shop page)
  // ─────────────────────────────────────────────────────
  function renderStrip(deal) {
    const wrap = document.getElementById('dotd-strip');
    if (!wrap) return;

    wrap.innerHTML = `
      <div class="dotd-strip">
        <div class="dotd-strip-inner">
          <span class="dotd-strip-flame">🔥</span>
          <div class="dotd-strip-text">
            <strong>DEAL OF THE DAY:</strong>
            <span>${escapeHtml(deal.name)} — ${escapeHtml(deal.discount)}% OFF</span>
          </div>
          <div class="dotd-strip-price">
            <span class="dotd-strip-sale">PHP ${deal.salePrice.toLocaleString()}</span>
            <span class="dotd-strip-original">PHP ${deal.price.toLocaleString()}</span>
          </div>
          <div class="dotd-strip-countdown">
            <span data-cd="h">00</span>:<span data-cd="m">00</span>:<span data-cd="s">00</span>
          </div>
          <button id="dotd-strip-btn" class="dotd-strip-btn">+ ADD</button>
        </div>
      </div>
    `;

    const stripBtn = document.getElementById('dotd-strip-btn');
    if (stripBtn) {
      stripBtn.addEventListener('click', () => {
        addDealToCart(deal);
      });
    }
  }

  // ─────────────────────────────────────────────────────
  // 6. ADD DEAL TO CART (uses the cart system in shop-features.js)
  // ─────────────────────────────────────────────────────
  function addDealToCart(deal) {
    // We add it to the cart with the sale price, and tag the name
    // so the cart shows it as a "deal" item.
    const item = {
      name: deal.name + ' ⚡ Daily Deal',
      price: deal.salePrice,
      category: deal.category,
      image: deal.image,
      original: deal.price,
      isDeal: true
    };
    // Mirror what shop-features.js does (save direct to localStorage)
    try {
      const cart = JSON.parse(localStorage.getItem('byjay_cart')) || [];
      const existing = cart.find(i => i.name === item.name);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ ...item, qty: 1 });
      }
      localStorage.setItem('byjay_cart', JSON.stringify(cart));
    } catch (e) { /* best-effort */ }

    // Update the cart count badge in the header if shop-features is loaded
    const badge = document.getElementById('bj-cartCount');
    if (badge) {
      const cart = JSON.parse(localStorage.getItem('byjay_cart')) || [];
      const count = cart.reduce((s, i) => s + i.qty, 0);
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
    // Show toast
    const t = document.getElementById('bj-toast');
    if (t) {
      t.textContent = `⚡ ${deal.name} added at ${deal.discount}% off!`;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2500);
    }
    // Tiny celebration: button flash
    const btns = document.querySelectorAll('#dotd-add-btn, #dotd-strip-btn');
    btns.forEach(b => {
      b.classList.add('dotd-flash');
      setTimeout(() => b.classList.remove('dotd-flash'), 600);
    });
  }

  // ─────────────────────────────────────────────────────
  // 7. UPDATE COUNTDOWN TIMER (every second)
  // ─────────────────────────────────────────────────────
  function tickCountdown() {
    const remaining = msUntilMidnight();
    const { h, m, s } = formatCountdown(remaining);
    document.querySelectorAll('[data-cd="h"]').forEach(el => el.textContent = h);
    document.querySelectorAll('[data-cd="m"]').forEach(el => el.textContent = m);
    document.querySelectorAll('[data-cd="s"]').forEach(el => el.textContent = s);

    // When the timer hits 0, the day has rolled over → reload to get the new deal
    if (remaining <= 1000) {
      setTimeout(() => location.reload(), 1500);
    }
  }

  // ─────────────────────────────────────────────────────
  // 8. UTIL
  // ─────────────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ─────────────────────────────────────────────────────
  // 9. INIT
  // ─────────────────────────────────────────────────────
  function init() {
    const deal = getTodaysDeal();
    renderBanner(deal);
    renderStrip(deal);
    tickCountdown();
    setInterval(tickCountdown, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
