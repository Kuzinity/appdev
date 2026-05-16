order-modal.js
/**
 * BYJAY — Shared Order & Customize Modal Logic
 * =============================================
 * Include this script on any page that needs the order or
 * customize modals. It injects its own HTML into the page
 * on DOMContentLoaded, so you only maintain one copy.
 *
 * USAGE ON ANY PAGE:
 *   1. Add this before </body>:
 *        <script src="order-modal.js"></script>
 *
 *   2. Trigger the order modal from any button:
 *        <button onclick="openOrderModal('Item Name', 'PHP 999')">Order</button>
 *
 *   3. Trigger the customize modal from any button:
 *        <button onclick="openCustomizeModal('Item Name', 'PHP 999')">Customize</button>
 *
 * FORMSPREE SETUP:
 *   Replace YOUR_FORMSPREE_ID below with your real form ID.
 *   Get one free at https://formspree.io — takes 2 minutes.
 * =============================================
 */

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BYJAY_CONFIG = {
  formspreeId:   'YOUR_FORMSPREE_ID',        // ← Replace this
  thankYouPage:  './thank-you.html',
  dmUrl:         'https://ig.me/m/byjayy__',
  igHandle:      '@byjayy__',
};
// ──────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // ── 1. INJECT MODAL HTML ──────────────────────────────────────────────────

  function injectModals() {
    const html = `

    <!-- ===================== SHARED STYLES ===================== -->
    <style>
      /* ── Reset & base ── */
      #bj-orderModal *,
      #bj-customizeModal * {
        box-sizing: border-box;
      }

      /* ── Modal entrance animation ── */
      @keyframes bjModalIn {
        from { opacity:0; transform:scale(0.95) translateY(16px); }
        to   { opacity:1; transform:scale(1)    translateY(0);    }
      }
      .bj-modal-box {
        animation: bjModalIn 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both;
      }

      /* ── Spinner ── */
      @keyframes bjSpin {
        from { transform:rotate(0deg); }
        to   { transform:rotate(360deg); }
      }
      .bj-spinner-icon {
        animation: bjSpin 0.8s linear infinite;
        display: inline-block;
        vertical-align: middle;
      }

      /* ── Scrollbar inside modal ── */
      .bj-modal-scroll::-webkit-scrollbar { width: 4px; }
      .bj-modal-scroll::-webkit-scrollbar-track { background: transparent; }
      .bj-modal-scroll::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 4px; }

      /* ── Section divider inside modal ── */
      .bj-divider {
        height: 1px;
        background: rgba(255,255,255,0.07);
        margin: 20px 0;
      }

      /* ── Field wrapper ── */
      .bj-field {
        margin-bottom: 14px;
      }

      /* ── Label ── */
      .bj-label {
        display: block;
        font-size: 10px;
        font-weight: 800;
        color: rgba(255,255,255,0.4);
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 7px;
        font-family: 'DM Sans', Arial, sans-serif;
      }

      /* ── THE KEY FIX: One unified input style for ALL input types ──
         Forces dark background on every native browser input,
         including number, date, select. No more white boxes.        ── */
      .bj-input,
      .bj-input[type="text"],
      .bj-input[type="number"],
      .bj-input[type="date"],
      .bj-input[type="email"],
      select.bj-input,
      textarea.bj-input {
        display: block;
        width: 100%;
        padding: 13px 16px;
        border-radius: 12px;
        border: 1.5px solid rgba(255,255,255,0.1);
        background-color: rgba(255,255,255,0.06) !important;
        background: rgba(255,255,255,0.06) !important;
        color: #f0e6c8 !important;
        font-size: 14px;
        font-family: 'DM Sans', Arial, sans-serif;
        font-weight: 500;
        line-height: 1.4;
        outline: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        /* Force dark on autofill too */
        -webkit-text-fill-color: #f0e6c8;
        caret-color: #c9a84c;
      }

      /* Override Chrome/Safari autofill blue tint */
      .bj-input:-webkit-autofill,
      .bj-input:-webkit-autofill:hover,
      .bj-input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px #1c1c1c inset !important;
        -webkit-text-fill-color: #f0e6c8 !important;
        transition: background-color 5000s ease-in-out 0s;
      }

      /* Date input icon color */
      .bj-input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(0.7) sepia(0.5) saturate(3) hue-rotate(5deg);
        opacity: 0.6;
        cursor: pointer;
      }

      /* Number spinners */
      .bj-input[type="number"]::-webkit-inner-spin-button,
      .bj-input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .bj-input[type="number"] { -moz-appearance: textfield; }

      /* Select arrow */
      select.bj-input {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c9a84c' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") !important;
        background-repeat: no-repeat !important;
        background-position: right 14px center !important;
        padding-right: 38px !important;
        cursor: pointer;
      }
      select.bj-input option {
        background-color: #1a1a2e;
        color: #f0e6c8;
      }

      /* Focus state */
      .bj-input:focus {
        border-color: #c9a84c;
        background-color: rgba(255,255,255,0.09) !important;
        background: rgba(255,255,255,0.09) !important;
        box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
      }

      /* Placeholder */
      .bj-input::placeholder { color: rgba(255,255,255,0.2) !important; }
      .bj-input::-webkit-input-placeholder { color: rgba(255,255,255,0.2) !important; }

      /* Read-only fields (item name + price) */
      .bj-readonly {
        opacity: 0.55;
        cursor: default;
        border-color: rgba(255,255,255,0.06) !important;
        background-color: rgba(255,255,255,0.03) !important;
        background: rgba(255,255,255,0.03) !important;
      }
      .bj-readonly:focus {
        border-color: rgba(255,255,255,0.06) !important;
        box-shadow: none !important;
      }

      /* Textarea resize handle only vertical */
      textarea.bj-input { resize: vertical; min-height: 80px; }

      /* ── Inline item preview chip (top of form) ── */
      .bj-item-chip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(201,168,76,0.08);
        border: 1px solid rgba(201,168,76,0.2);
        border-radius: 14px;
        padding: 14px 16px;
        margin-bottom: 20px;
      }
      .bj-item-chip-name {
        color: #f0e6c8;
        font-size: 14px;
        font-weight: 700;
        font-family: 'DM Sans', Arial, sans-serif;
      }
      .bj-item-chip-price {
        color: #c9a84c;
        font-size: 15px;
        font-weight: 800;
        font-family: 'DM Sans', Arial, sans-serif;
        text-shadow: 0 0 14px rgba(201,168,76,0.4);
        white-space: nowrap;
        margin-left: 12px;
      }

      /* ── Customize box ── */
      .bj-customize-box {
        padding: 16px;
        border-radius: 14px;
        border: 1px solid rgba(201,168,76,0.18);
        background: rgba(201,168,76,0.04);
      }
      .bj-customize-box .bj-label {
        color: #c9a84c;
        letter-spacing: 1.5px;
      }
      .bj-customize-hint {
        color: rgba(255,255,255,0.3);
        font-size: 12px;
        font-family: 'DM Sans', Arial, sans-serif;
        margin-bottom: 10px;
        line-height: 1.5;
      }

      /* ── Chips (color / add-on selector) ── */
      .bj-chips { display: flex; flex-wrap: wrap; gap: 8px; }
      .bj-chip { cursor: pointer; }
      .bj-chip input[type="checkbox"],
      .bj-chip input[type="radio"] { display: none; }
      .bj-chip span {
        display: inline-block;
        padding: 7px 14px;
        border-radius: 20px;
        border: 1.5px solid rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.5);
        font-size: 12px;
        font-weight: 700;
        font-family: 'DM Sans', Arial, sans-serif;
        cursor: pointer;
        transition: all 0.15s;
        user-select: none;
        letter-spacing: 0.5px;
      }
      .bj-chip input:checked + span {
        background: #7b5ea7;
        border-color: #7b5ea7;
        color: #fff;
        box-shadow: 0 2px 10px rgba(123,94,167,0.35);
      }
      .bj-chip span:hover {
        border-color: rgba(255,255,255,0.3);
        color: rgba(255,255,255,0.85);
      }

      /* ── Submit button ── */
      .bj-submit-btn {
        width: 100%;
        padding: 15px 24px;
        border-radius: 50px;
        border: none;
        background: linear-gradient(135deg, #c9a84c, #e0c060);
        color: #111;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 2px;
        font-family: 'DM Sans', Arial, sans-serif;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 20px rgba(201,168,76,0.35);
        margin-top: 20px;
      }
      .bj-submit-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #e0c060, #c9a84c);
        transform: translateY(-2px);
        box-shadow: 0 8px 28px rgba(201,168,76,0.5);
      }
      .bj-submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
      .bj-submit-plum {
        background: linear-gradient(135deg, #7b5ea7, #9b7ec7);
        box-shadow: 0 4px 20px rgba(123,94,167,0.35);
        color: #fff;
      }
      .bj-submit-plum:hover:not(:disabled) {
        background: linear-gradient(135deg, #9b7ec7, #7b5ea7);
        box-shadow: 0 8px 28px rgba(123,94,167,0.5);
      }

      /* ── Validation ── */
      .bj-input.bj-invalid {
        border-color: #ff6b6b !important;
        box-shadow: 0 0 0 3px rgba(255,107,107,0.12) !important;
      }
      .bj-error {
        background: rgba(255,107,107,0.08);
        border: 1px solid rgba(255,107,107,0.25);
        border-radius: 10px;
        padding: 10px 14px;
        font-size: 13px;
        color: #ff9999;
        margin-bottom: 14px;
        font-family: 'DM Sans', Arial, sans-serif;
      }

      /* ── Footer note below button ── */
      .bj-footer-note {
        color: rgba(255,255,255,0.2);
        font-size: 11px;
        text-align: center;
        margin-top: 12px;
        font-family: 'DM Sans', Arial, sans-serif;
        letter-spacing: 0.5px;
      }

      /* ── Row layout for quantity (keeps it from going full width) ── */
      .bj-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
    </style>

    <!-- ===================== ORDER MODAL ===================== -->
    <div id="bj-orderModal"
         class="fixed inset-0 z-[200] hidden items-center justify-center p-4"
         role="dialog" aria-modal="true" aria-labelledby="bj-orderTitle">

      <!-- Backdrop -->
      <div class="absolute inset-0" id="bj-orderBackdrop"
           style="background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);"></div>

      <!-- Modal box -->
      <div class="bj-modal-box bj-modal-scroll relative w-full max-w-md overflow-y-auto"
           style="background:#141414;border:1.5px solid rgba(201,168,76,0.25);
                  border-radius:28px;max-height:90vh;box-shadow:0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(201,168,76,0.08);">

        <div style="padding:28px 28px 24px;">

          <!-- Header -->
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;">
            <div>
              <h2 id="bj-orderTitle"
                  style="font-family:'Bebas Neue',sans-serif;font-size:2.2rem;
                         letter-spacing:3px;color:#c9a84c;line-height:1;
                         text-shadow:0 0 24px rgba(201,168,76,0.4);">
                PLACE ORDER
              </h2>
              <p style="color:rgba(255,255,255,0.35);font-size:12px;margin-top:6px;
                        font-family:'DM Sans',Arial,sans-serif;letter-spacing:0.5px;">
                We'll confirm via DM within 24 hours 💬
              </p>
            </div>
            <button id="bj-orderClose" aria-label="Close"
                    style="background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.1);
                           border-radius:50%;width:36px;height:36px;display:flex;align-items:center;
                           justify-content:center;cursor:pointer;color:rgba(255,255,255,0.5);
                           transition:all 0.2s;flex-shrink:0;margin-top:2px;"
                    onmouseover="this.style.background='rgba(255,255,255,0.12)';this.style.color='#fff';"
                    onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.5)';">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Item preview chip -->
          <div class="bj-item-chip">
            <span class="bj-item-chip-name" id="bj-orderItemDisplay">Item name</span>
            <span class="bj-item-chip-price" id="bj-orderPriceDisplay">—</span>
          </div>

          <!-- Form -->
          <form id="bj-orderForm" novalidate>
            <input type="hidden" name="_subject" value="New Order — BYJAY">
            <input type="hidden" name="type" value="order">
            <input type="hidden" id="bj-orderItem" name="item">
            <input type="hidden" id="bj-orderPrice" name="price">

            <div class="bj-field">
              <label class="bj-label">Your Name <span style="color:#ff6b6b;">*</span></label>
              <input type="text" name="name" required class="bj-input"
                     placeholder="e.g. Maria Santos" autocomplete="name">
            </div>

            <div class="bj-field">
              <label class="bj-label">Instagram / Contact <span style="color:#ff6b6b;">*</span></label>
              <input type="text" name="contact" required class="bj-input"
                     placeholder="@yourhandle or +63 912 345 6789">
            </div>

            <div class="bj-row-2">
              <div class="bj-field" style="margin-bottom:0;">
                <label class="bj-label">Quantity <span style="color:#ff6b6b;">*</span></label>
                <input type="number" name="quantity" min="1" value="1" required class="bj-input">
              </div>
              <div class="bj-field" style="margin-bottom:0;">
                <label class="bj-label">Preferred Date</label>
                <input type="date" name="preferred_date" class="bj-input">
              </div>
            </div>

            <div class="bj-field" style="margin-top:14px;">
              <label class="bj-label">Delivery Method</label>
              <select name="delivery_method" class="bj-input">
                <option value="pickup">📍 Pickup (Manila)</option>
                <option value="lalamove">🚗 Lalamove / GrabExpress</option>
                <option value="jnt">📦 J&amp;T Express</option>
                <option value="lbc">📮 LBC</option>
              </select>
            </div>

            <div class="bj-divider"></div>

            <div class="bj-field bj-customize-box">
              <label class="bj-label">🎨 Customization Request</label>
              <p class="bj-customize-hint">Color, size, text, add-ons — describe it here. Leave blank if none.</p>
              <textarea name="customization" rows="3" class="bj-input"
                        placeholder="e.g. Can I get this in silver? Add my initials?"></textarea>
            </div>

            <div class="bj-field" style="margin-top:14px;">
              <label class="bj-label">Special Notes</label>
              <textarea name="notes" rows="2" class="bj-input"
                        placeholder="Any other requests or questions..."></textarea>
            </div>

            <!-- Error message -->
            <div id="bj-orderError" class="bj-error" style="display:none;"></div>

            <button type="submit" id="bj-orderSubmit" class="bj-submit-btn">
              <span id="bj-orderBtnText">SEND ORDER REQUEST 🛒</span>
              <span id="bj-orderBtnSpinner" style="display:none;">
                <svg class="bj-spinner-icon" width="18" height="18" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83
                           M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                SENDING...
              </span>
            </button>

            <p class="bj-footer-note">We'll confirm your order via DM within 24 hours.</p>
          </form>

        </div>
      </div>
    </div>

    <!-- ===================== CUSTOMIZE MODAL ===================== -->
    <div id="bj-customizeModal"
         class="fixed inset-0 z-[200] hidden items-center justify-center p-4"
         role="dialog" aria-modal="true" aria-labelledby="bj-customizeTitle">

      <div class="absolute inset-0" id="bj-customizeBackdrop"
           style="background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);"></div>

      <div class="bj-modal-box bj-modal-scroll relative w-full max-w-md overflow-y-auto"
           style="background:#141414;border:1.5px solid rgba(123,94,167,0.35);
                  border-radius:28px;max-height:90vh;box-shadow:0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(123,94,167,0.1);">

        <div style="padding:28px 28px 24px;">

          <!-- Header -->
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;">
            <div>
              <h2 id="bj-customizeTitle"
                  style="font-family:'Bebas Neue',sans-serif;font-size:2.2rem;
                         letter-spacing:3px;color:#9b7ec7;line-height:1;
                         text-shadow:0 0 24px rgba(123,94,167,0.4);">
                CUSTOMIZE IT
              </h2>
              <p style="color:rgba(255,255,255,0.35);font-size:12px;margin-top:6px;
                        font-family:'DM Sans',Arial,sans-serif;">
                Tell us exactly how you want it ✨
              </p>
            </div>
            <button id="bj-customizeClose" aria-label="Close"
                    style="background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.1);
                           border-radius:50%;width:36px;height:36px;display:flex;align-items:center;
                           justify-content:center;cursor:pointer;color:rgba(255,255,255,0.5);
                           transition:all 0.2s;flex-shrink:0;margin-top:2px;"
                    onmouseover="this.style.background='rgba(255,255,255,0.12)';this.style.color='#fff';"
                    onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.5)';">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Item preview chip -->
          <div style="background:rgba(123,94,167,0.1);border:1px solid rgba(123,94,167,0.25);
                      border-radius:14px;padding:14px 16px;margin-bottom:20px;
                      display:flex;align-items:center;justify-content:space-between;">
            <div>
              <p style="color:rgba(123,94,167,0.8);font-size:9px;font-weight:800;
                        letter-spacing:2px;text-transform:uppercase;
                        font-family:'DM Sans',Arial,sans-serif;margin-bottom:4px;">ITEM</p>
              <p id="bj-customizeItemName"
                 style="color:#f0e6c8;font-size:14px;font-weight:700;
                        font-family:'DM Sans',Arial,sans-serif;"></p>
            </div>
            <p id="bj-customizeItemPrice"
               style="color:#9b7ec7;font-size:15px;font-weight:800;
                      font-family:'DM Sans',Arial,sans-serif;white-space:nowrap;margin-left:12px;
                      text-shadow:0 0 12px rgba(123,94,167,0.4);"></p>
          </div>

          <form id="bj-customizeForm" novalidate>
            <input type="hidden" name="_subject" value="Custom Order — BYJAY">
            <input type="hidden" name="type" value="customization">
            <input type="hidden" id="bj-customizeHiddenItem"  name="item">
            <input type="hidden" id="bj-customizeHiddenPrice" name="base_price">

            <div class="bj-field">
              <label class="bj-label">Your Name <span style="color:#ff6b6b;">*</span></label>
              <input type="text" name="name" required class="bj-input"
                     placeholder="e.g. Maria Santos" autocomplete="name">
            </div>

            <div class="bj-field">
              <label class="bj-label">Instagram / Contact <span style="color:#ff6b6b;">*</span></label>
              <input type="text" name="contact" required class="bj-input"
                     placeholder="@yourhandle or +63 912 345 6789">
            </div>

            <div class="bj-field">
              <label class="bj-label">Color Preference</label>
              <div class="bj-chips">
                <label class="bj-chip"><input type="checkbox" name="color" value="Gold"><span>🟡 Gold</span></label>
                <label class="bj-chip"><input type="checkbox" name="color" value="Silver"><span>⚪ Silver</span></label>
                <label class="bj-chip"><input type="checkbox" name="color" value="Rose Gold"><span>🌸 Rose Gold</span></label>
                <label class="bj-chip"><input type="checkbox" name="color" value="Black"><span>⚫ Black</span></label>
                <label class="bj-chip"><input type="checkbox" name="color" value="Colorful"><span>🌈 Colorful</span></label>
              </div>
            </div>

            <div class="bj-field">
              <label class="bj-label">Add-Ons</label>
              <div class="bj-chips">
                <label class="bj-chip"><input type="checkbox" name="addon" value="Initials charm"><span>🔤 Initials</span></label>
                <label class="bj-chip"><input type="checkbox" name="addon" value="Birthstone"><span>💎 Birthstone</span></label>
                <label class="bj-chip"><input type="checkbox" name="addon" value="Extra charms"><span>✨ Extra Charms</span></label>
                <label class="bj-chip"><input type="checkbox" name="addon" value="Gift wrap"><span>🎁 Gift Wrap</span></label>
              </div>
            </div>

            <div class="bj-row-2">
              <div class="bj-field" style="margin-bottom:0;">
                <label class="bj-label">Text / Initials</label>
                <input type="text" name="engraving_text" class="bj-input"
                       placeholder="e.g. JAY + ANA">
              </div>
              <div class="bj-field" style="margin-bottom:0;">
                <label class="bj-label">Bracelet Size</label>
                <select name="size" class="bj-input">
                  <option value="">Standard</option>
                  <option value="XS 14-15cm">XS — 14–15cm</option>
                  <option value="S 16-17cm">S — 16–17cm</option>
                  <option value="M 18-19cm">M — 18–19cm</option>
                  <option value="L 20-21cm">L — 20–21cm</option>
                  <option value="XL 22cm+">XL — 22cm+</option>
                </select>
              </div>
            </div>

            <div class="bj-field" style="margin-top:14px;">
              <label class="bj-label">Describe Your Vision <span style="color:#ff6b6b;">*</span></label>
              <textarea name="custom_description" rows="4" required class="bj-input"
                        placeholder="Fandom, aesthetic, vibe, references — the more detail the better!"></textarea>
            </div>

            <div class="bj-field">
              <label class="bj-label">Preferred Delivery Date</label>
              <input type="date" name="preferred_date" class="bj-input">
            </div>

            <!-- Error message -->
            <div id="bj-customizeError" class="bj-error" style="display:none;"></div>

            <button type="submit" id="bj-customizeSubmit" class="bj-submit-btn bj-submit-plum">
              <span id="bj-customizeBtnText">SUBMIT CUSTOM REQUEST ✨</span>
              <span id="bj-customizeBtnSpinner" style="display:none;">
                <svg class="bj-spinner-icon" width="18" height="18" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83
                           M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                SENDING...
              </span>
            </button>

            <p class="bj-footer-note">We'll DM you with a quote within 24–48 hours.</p>
          </form>

        </div>
      </div>
    </div>`;

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    bindEvents();
  }

  // ── 2. BIND EVENTS ────────────────────────────────────────────────────────

  function bindEvents() {
    document.getElementById('bj-orderClose')
      .addEventListener('click', closeOrderModal);
    document.getElementById('bj-customizeClose')
      .addEventListener('click', closeCustomizeModal);

    document.getElementById('bj-orderBackdrop')
      .addEventListener('click', closeOrderModal);
    document.getElementById('bj-customizeBackdrop')
      .addEventListener('click', closeCustomizeModal);

    document.getElementById('bj-orderForm')
      .addEventListener('submit', handleOrderSubmit);
    document.getElementById('bj-customizeForm')
      .addEventListener('submit', handleCustomizeSubmit);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeOrderModal();
        closeCustomizeModal();
      }
    });
  }

  // ── 3. OPEN / CLOSE ───────────────────────────────────────────────────────

  function openOrderModal(itemName, itemPrice) {
    // Hidden inputs for form submission
    document.getElementById('bj-orderItem').value  = itemName  || '';
    document.getElementById('bj-orderPrice').value = itemPrice || '';
    // Visible display elements
    document.getElementById('bj-orderItemDisplay').textContent  = itemName  || '—';
    document.getElementById('bj-orderPriceDisplay').textContent = itemPrice || '—';
    clearErrors('bj-orderForm');
    showModal('bj-orderModal');
  }

  function closeOrderModal() { hideModal('bj-orderModal'); }

  function openCustomizeModal(itemName, itemPrice) {
    document.getElementById('bj-customizeItemName').textContent  = itemName  || '';
    document.getElementById('bj-customizeItemPrice').textContent = itemPrice || '';
    document.getElementById('bj-customizeHiddenItem').value      = itemName  || '';
    document.getElementById('bj-customizeHiddenPrice').value     = itemPrice || '';
    clearErrors('bj-customizeForm');
    showModal('bj-customizeModal');
  }

  function closeCustomizeModal() { hideModal('bj-customizeModal'); }

  function showModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    // Re-trigger entrance animation
    const box = modal.querySelector('.bj-modal-box');
    box.style.animation = 'none';
    requestAnimationFrame(() => { box.style.animation = ''; });
  }

  function hideModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    const anyOpen = document.querySelector('[id^="bj-"][id$="Modal"]:not(.hidden)');
    if (!anyOpen) document.body.style.overflow = '';
  }

  // ── 4. FORM SUBMISSION ────────────────────────────────────────────────────

  function handleOrderSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form, 'bj-orderError')) return;
    submitToFormspree(form, 'bj-orderSubmit', 'bj-orderBtnText', 'bj-orderBtnSpinner', 'bj-orderError');
  }

  function handleCustomizeSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form, 'bj-customizeError')) return;
    submitToFormspree(form, 'bj-customizeSubmit', 'bj-customizeBtnText', 'bj-customizeBtnSpinner', 'bj-customizeError');
  }

  function submitToFormspree(form, btnId, textId, spinnerId, errorId) {
    const formspreeId = BYJAY_CONFIG.formspreeId;
    if (!formspreeId || formspreeId === 'YOUR_FORMSPREE_ID') {
      window.location.href = BYJAY_CONFIG.thankYouPage;
      return;
    }
    setButtonLoading(btnId, textId, spinnerId, true);
    fetch(`https://formspree.io/f/${formspreeId}`, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then((res) => {
        if (res.ok) {
          window.location.href = BYJAY_CONFIG.thankYouPage;
        } else {
          return res.json().then((data) => {
            throw new Error(data.error || 'Submission failed. Please try again.');
          });
        }
      })
      .catch((err) => {
        setButtonLoading(btnId, textId, spinnerId, false);
        showError(errorId, err.message || 'Something went wrong. Please DM us directly!');
      });
  }

  // ── 5. VALIDATION ─────────────────────────────────────────────────────────

  function validateForm(form, errorId) {
    clearErrors(form.id);
    let valid = true;
    form.querySelectorAll('[required]').forEach((field) => {
      if (!field.value.trim()) {
        field.classList.add('bj-invalid');
        valid = false;
      } else {
        field.classList.remove('bj-invalid');
      }
    });
    if (!valid) {
      showError(errorId, '⚠️ Please fill in all required fields.');
      const first = form.querySelector('.bj-invalid');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
  }

  function clearErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.bj-invalid').forEach(f => f.classList.remove('bj-invalid'));
    const errEl = form.querySelector('.bj-error');
    if (errEl) errEl.style.display = 'none';
  }

  function showError(errorId, message) {
    const el = document.getElementById(errorId);
    if (!el) return;
    el.textContent = message;
    el.style.display = 'block';
  }

  // ── 6. HELPERS ────────────────────────────────────────────────────────────

  function setButtonLoading(btnId, textId, spinnerId, loading) {
    const btn    = document.getElementById(btnId);
    const textEl = document.getElementById(textId);
    const spin   = document.getElementById(spinnerId);
    if (!btn) return;
    btn.disabled          = loading;
    textEl.style.display  = loading ? 'none'   : 'inline';
    spin.style.display    = loading ? 'inline' : 'none';
  }

  // ── 7. EXPOSE GLOBALS ─────────────────────────────────────────────────────

  window.openOrderModal      = openOrderModal;
  window.closeOrderModal     = closeOrderModal;
  window.openCustomizeModal  = openCustomizeModal;
  window.closeCustomizeModal = closeCustomizeModal;

  // ── 8. INIT ───────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectModals);
  } else {
    injectModals();
  }

})();
