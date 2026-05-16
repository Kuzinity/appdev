README.txt
================================================================
BYJAY — Pins & Italian Charms, Manila
Website Project Submission
================================================================

HOW TO RUN
----------
Option A (simplest):  Double-click index.html — opens in your default browser.
Option B (recommended): Run a local server:
  - On Mac/Linux:   open Terminal in this folder, run "python3 -m http.server 8000"
                    then visit http://localhost:8000 in any browser
  - On Windows:     same as above, but in PowerShell or Command Prompt

Both options work. The local server is recommended only because some browsers
restrict certain features (like clipboard) when opening files directly.


PAGES
-----
index.html        — Homepage (the entry point)
shop.html         — Product catalog with cart, search, filter, sort
drops.html        — Limited-edition Italian charm bracelets
reviews.html      — Customer reviews + submission form
contact.html      — Social cards, About, contact form, FAQ
thank-you.html    — Post-order confirmation page (reached after checkout)
home.html         — Legacy URL alias (redirects to index.html)
admin.html        — Hidden admin dashboard (see ADMIN ACCESS below)


ADMIN ACCESS
------------
Type "admin.html" at the end of the URL in the address bar.
   Example: http://localhost:8000/admin.html

Login credentials (hardcoded for demo):
   Username: byjay
   Password: pinsforever

The admin panel has 7 tabs: Dashboard, Orders, Products, Reviews,
Messages, Newsletter, Settings. Sample data is pre-seeded on first load.


WHAT THE WEBSITE DOES
---------------------
- Persistent shopping cart (saved to your browser, survives page refresh)
- Wishlist with heart icons on every product
- Live search and category filtering on the shop page
- Product detail modal (click any product image)
- Deal of the Day banner with daily rotation and countdown timer
- Customer review submission with star rating
- Contact form (saves messages to admin)
- Newsletter signup
- FAQ accordion section
- Full admin dashboard with order tracking, stock management, CSV export

All data is saved using browser localStorage. No server required.


TESTING THE DEMO FLOW
---------------------
1. Open index.html → see the homepage with Deal of the Day banner
2. Click "SHOP" in the nav
3. Add 2-3 products to cart using the "+ ADD" buttons
4. Click the cart icon (top right) → drawer slides in
5. Click "CHECKOUT VIA DM" → redirects to thank-you.html
6. Open admin.html in a new tab → log in with the credentials above
7. The Orders tab should show your new order


TECHNOLOGIES USED
-----------------
- HTML5, CSS3, JavaScript (ES6+) — no frameworks, no build step
- Tailwind CSS (loaded via CDN)
- AOS (Animate On Scroll, loaded via CDN)
- Google Fonts: Bebas Neue, DM Sans
- Browser localStorage for persistence


PROJECT TEAM
------------
University of Santo Tomas
College of Information and Computing Sciences

================================================================
