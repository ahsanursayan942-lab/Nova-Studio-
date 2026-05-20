'use strict';

/* ══════════════════════════════════════════════════════════════
   NOVA ATELIER — PAYMENT & EMAIL CONFIG
   ─────────────────────────────────────────────────────────────
   HOW TO MAKE REAL MONEY:

   STEP 1 — Sign up (all free):
     • Gumroad:    https://gumroad.com   → sell your products
     • Stripe:     https://stripe.com    → VIP subscriptions & gift cards
     • Mailchimp:  https://mailchimp.com → collect emails (free up to 500)

   STEP 2 — Replace every placeholder URL below with your real link
   STEP 3 — Save the file. Everything connects automatically.
══════════════════════════════════════════════════════════════ */
const NOVA_CONFIG = {

    /* ── GUMROAD product links ─────────────────────────────────
       gumroad.com → New Product → set price → Publish → Share → copy link */
    products: {
        1:  'https://gumroad.com/l/PRODUCT_1',   // Midnight Satin Slip Dress  $29.98
        2:  'https://gumroad.com/l/PRODUCT_2',   // High Rise Sculpt Cargo     $45.00
        3:  'https://gumroad.com/l/PRODUCT_3',   // Sequin Party Mini Dress    $15.00
        4:  'https://gumroad.com/l/PRODUCT_4',   // Essential Ribbed Crop      $12.99
        5:  'https://gumroad.com/l/PRODUCT_5',   // Archival Denim Jacket      $58.00
        6:  'https://gumroad.com/l/PRODUCT_6',   // Distressed Flare Jean      $38.00
        7:  'https://gumroad.com/l/PRODUCT_7',   // Sculpting Active Set       $22.00
        8:  'https://gumroad.com/l/PRODUCT_8',   // Faux Leather Wrap Skirt    $24.00
        9:  'https://gumroad.com/l/PRODUCT_9',   // Floral Chiffon Gown        $65.00
        10: 'https://gumroad.com/l/PRODUCT_10',  // Cropped Matte Puffer       $79.00
        11: 'https://gumroad.com/l/PRODUCT_11',  // Wide Leg Ribbed Set        $35.00
        12: 'https://gumroad.com/l/PRODUCT_12',  // Vintage Graphic Tee        $19.00
        13: 'https://gumroad.com/l/PRODUCT_13',  // Silk Wrap Front Blouse     $44.00
        14: 'https://gumroad.com/l/PRODUCT_14',  // Tailored Studio Trousers   $55.00
        15: 'https://gumroad.com/l/PRODUCT_15',  // Gold Link Chain Belt       $15.00
        16: 'https://gumroad.com/l/PRODUCT_16',  // Cut-Out Designer Swim      $38.00
        17: 'https://gumroad.com/l/PRODUCT_17',  // Linen Oversized Blazer     $89.00
        18: 'https://gumroad.com/l/PRODUCT_18',  // Asymmetric Cutout Dress    $52.00
    },

    /* ── STRIPE VIP subscription links ────────────────────────
       dashboard.stripe.com → Payment Links → + Create → Recurring price */
    vipMonthly: 'https://buy.stripe.com/VIP_MONTHLY',   // $4.99/month
    vipAnnual:  'https://buy.stripe.com/VIP_ANNUAL',    // $35.88/year ($2.99/mo)

    /* ── STRIPE gift card payment links ───────────────────────
       Create 5 one-time Payment Links on Stripe, one per amount */
    giftCard: {
        25:  'https://buy.stripe.com/GIFT_25',
        50:  'https://buy.stripe.com/GIFT_50',
        100: 'https://buy.stripe.com/GIFT_100',
        250: 'https://buy.stripe.com/GIFT_250',
        500: 'https://buy.stripe.com/GIFT_500',
    },

    /* ── MAILCHIMP email list ──────────────────────────────────
       mailchimp.com → Audience → Signup forms → Embedded forms
       Copy the "action" URL from the form code */
    mailchimpUrl: 'https://YOUR_ACCOUNT.us1.list-manage.com/subscribe/post?u=XXXX&id=XXXX',

    /* ── YOUR STORE URL (for referral links) ─────────────────── */
    storeUrl: 'https://your-nova-store.com',
};

/* ══════════════════════════════════════════════════════════════
   NOVA ATELIER — STORE ENGINE
══════════════════════════════════════════════════════════════ */
class NovaStore {

    constructor() {
        this.products      = [];
        this.wishlist      = JSON.parse(localStorage.getItem('nova_wishlist') || '[]');
        this.cart          = JSON.parse(localStorage.getItem('nova_cart')     || '[]');
        this.recentlyViewed= JSON.parse(localStorage.getItem('nova_rv')       || '[]');
        this._pendingId    = null;
        this._pendingBtn   = null;
        this._selectedSize = null;
        this._currentCat   = 'all';
        this._boot();
    }

    /* ─────────────────── BOOT ─────────────────── */
    _boot() {
        this._loader();
        this._cursor();
        this._scrollFX();
        this._cartListeners();
        this._sizeListeners();
        this._searchListeners();
        this._mobileNav();
        this._sizeTabs();
        this._quickviewListeners();
        this._hscroll();
        this._magneticButtons();
        this._cardTilt();
        this._sortListener();
        this._wishlistIconSync();
        this._heroSlideshow();
        document.getElementById('continue-shopping')
            ?.addEventListener('click', () => this.closeCart());
        this.renderCart();
        this.loadProducts();
    }

    /* ─────────────────── LOADER ─────────────────── */
    _loader() {
        const el  = document.getElementById('page-loader');
        const pct = document.getElementById('loader-pct');
        if (!el) return;
        document.body.style.overflow = 'hidden';
        let p = 0;
        const iv = setInterval(() => {
            p = Math.min(p + Math.random() * 18, 99);
            if (pct) pct.textContent = Math.round(p) + '%';
        }, 180);
        setTimeout(() => {
            clearInterval(iv);
            if (pct) pct.textContent = '100%';
            setTimeout(() => {
                el.classList.add('hidden');
                document.body.style.overflow = '';
            }, 300);
        }, 2200);
    }

    /* ─────────────────── LOAD PRODUCTS ─────────────────── */
    async loadProducts() {
        const grid = document.getElementById('product-grid');
        if (grid) {
            grid.innerHTML = Array(8).fill(0).map(() => `
                <div class="item-card revealed">
                    <div class="skeleton-card"></div>
                    <div class="item-meta" style="padding:14px 12px">
                        <div style="height:9px;background:var(--cream);margin-bottom:10px;border-radius:2px;width:60%"></div>
                        <div style="height:14px;background:var(--cream);margin-bottom:8px;border-radius:2px;width:85%"></div>
                        <div style="height:9px;background:var(--cream);border-radius:2px;width:35%"></div>
                    </div>
                </div>`).join('');
        }
        try {
            const res = await fetch('Nova.json');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            this.products = Array.isArray(data) ? data : (data.products || []);
            await new Promise(r => setTimeout(r, 450));
            this.renderProducts(this.products);
            this._setupFilters();
            this._statsCounter();
            this._buildCharts();
            this._renderRecentlyViewed();
        } catch (err) {
            console.error('[Nova] Failed:', err);
            if (grid) grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:var(--gray)">
                    <i class="fa-solid fa-circle-exclamation" style="font-size:36px;display:block;margin-bottom:16px;opacity:.25"></i>
                    <p style="font-size:14px">Make sure <strong>Nova.json</strong> is in the same folder as index.html</p>
                </div>`;
        }
    }

    /* ─────────────────── RENDER PRODUCTS ─────────────────── */
    renderProducts(list) {
        const grid    = document.getElementById('product-grid');
        const countEl = document.getElementById('product-count');
        if (!grid) return;
        if (countEl) countEl.textContent = `${list.length} items`;
        if (!list.length) {
            grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:var(--gray)">
                    <i class="fa-regular fa-face-meh" style="font-size:32px;display:block;margin-bottom:14px;opacity:.25"></i>
                    <p style="font-size:14px">No items in this category.</p>
                </div>`;
            return;
        }
        grid.innerHTML = list.map(p => this._cardHTML(p)).join('');
        this._revealCards();
        this._cardTilt();
    }

    /* ─────────────────── CARD HTML ─────────────────── */
    _cardHTML(p) {
        const wished   = this.wishlist.includes(p.id);
        const lowStock = p.stockLevel > 0 && p.stockLevel <= 4
            ? `<p class="stock-warning">ONLY ${p.stockLevel} LEFT</p>` : '';
        const oldPrice = p.oldPrice
            ? `<span class="price-old">$${p.oldPrice.toFixed(2)}</span>` : '';
        const swatches = (p.colors || []).map(c =>
            `<span class="swatch" style="background:${c}" title="${c}"></span>`).join('');
        const stars = Array.from({length:5},(_,i) =>
            `<i class="fa-${i < p.rating ? 'solid' : 'regular'} fa-star"></i>`).join('');
        return `
        <div class="item-card" data-id="${p.id}">
            <div class="img-host">
                ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
                <button class="wish-btn ${wished ? 'wished':''}"
                    onclick="novaApp.toggleWish(${p.id},this)"
                    title="${wished ? 'Remove':'Save to wishlist'}">
                    <i class="fa-${wished?'solid':'regular'} fa-heart"></i>
                </button>
                <img src="${p.img1}" class="main-img" alt="${p.name}" loading="lazy" onerror="this.style.opacity='.08'">
                <img src="${p.img2}" class="hover-img" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
                <div class="quick-view-btn">
                    <button onclick="novaApp.openQuickview(${p.id})">QUICK VIEW</button>
                </div>
                <div class="quick-add-bar" onclick="novaApp.openSize(${p.id},this)">SELECT SIZE</div>
                <button class="bundle-card-btn" onclick="window.openBundle && window.openBundle(${p.id})" title="Bundle & Save 25%">
                    <i class="fa-solid fa-bolt"></i> BUNDLE & SAVE
                </button>
                <button class="mobile-add-btn" onclick="novaApp.openSize(${p.id},this)">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
            <div class="item-meta">
                <div class="meta-top">
                    <span class="brand-tag">${p.brand||'NOVA'}</span>
                    <span class="price-now">$${p.price.toFixed(2)}</span>
                </div>
                <span class="item-name">${p.name}</span>
                <div class="price-row">${oldPrice}</div>
                <div class="stars-row">
                    <span class="stars">${stars}</span>
                    <span class="review-count">(${(p.reviewCount||0).toLocaleString()})</span>
                </div>
                ${lowStock}
                <div class="swatch-group">${swatches}</div>
            </div>
        </div>`;
    }

    /* ─────────────────── FILTERS ─────────────────── */
    _setupFilters() {
        document.querySelectorAll('.pill[data-category]').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.pill[data-category]').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this._currentCat = pill.dataset.category;
                this._applyFilters();
            });
        });
    }

    _applyFilters() {
        let list = this._currentCat === 'all' ? [...this.products]
            : this.products.filter(p => p.category === this._currentCat);
        const sort = document.getElementById('sort-select')?.value || 'default';
        if (sort === 'price-asc')  list.sort((a,b) => a.price - b.price);
        if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
        if (sort === 'rating')     list.sort((a,b) => b.rating - a.rating);
        if (sort === 'newest')     list.sort((a,b) => b.id - a.id);
        this.renderProducts(list);
    }

    _sortListener() {
        document.getElementById('sort-select')?.addEventListener('change', () => this._applyFilters());
    }

    /* ─────────────────── SIZE MODAL ─────────────────── */
    _sizeListeners() {
        const modal   = document.getElementById('size-modal');
        const close   = document.getElementById('size-modal-close');
        const confirm = document.getElementById('size-confirm');
        if (!modal) return;
        close?.addEventListener('click',   () => this._closeSize());
        confirm?.addEventListener('click', () => this._confirmSize());
        modal.addEventListener('click',    e  => { if (e.target === modal) this._closeSize(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') { this._closeSize(); this._closeQuickview(); } });
    }

    _sizeTabs() {
        document.querySelectorAll('.size-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.size-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.dataset.tab;
                document.querySelectorAll('.size-tab-body').forEach(b => b.classList.add('hidden'));
                document.getElementById(`tab-${target}`)?.classList.remove('hidden');
            });
        });
    }

    openSize(id, btnEl) {
        const p = this.products.find(x => x.id == id);
        if (!p) return;
        this._pendingId = id; this._pendingBtn = btnEl; this._selectedSize = null;
        document.getElementById('modal-brand').textContent = p.brand || 'NOVA';
        document.getElementById('modal-name').textContent  = p.name;
        const confirm = document.getElementById('size-confirm');
        if (confirm) { confirm.innerHTML = '<span>SELECT A SIZE</span>'; confirm.disabled = true; }
        const sizes = p.sizes?.length ? p.sizes : ['XS','S','M','L','XL'];
        document.getElementById('size-grid').innerHTML = sizes.map(s => `
            <button class="size-option" data-size="${s}" onclick="novaApp._pickSize('${s}',this)">
                <span>${s}</span>
            </button>`).join('');
        // Reset to sizes tab
        document.querySelectorAll('.size-tab').forEach((t,i) => t.classList.toggle('active', i===0));
        document.querySelectorAll('.size-tab-body').forEach((b,i) => b.classList.toggle('hidden', i!==0));
        document.getElementById('size-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    _pickSize(size, el) {
        document.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
        el.classList.add('selected');
        this._selectedSize = size;
        const confirm = document.getElementById('size-confirm');
        if (confirm) { confirm.innerHTML = '<span>ADD TO BAG</span>'; confirm.disabled = false; }
    }

    _confirmSize() {
        if (!this._selectedSize) return;
        const id = this._pendingId, btn = this._pendingBtn, size = this._selectedSize;
        this._closeSize();
        this.addToCart(id, btn, size);
    }

    _closeSize() {
        document.getElementById('size-modal')?.classList.remove('active');
        document.body.style.overflow = '';
        this._pendingId = null; this._pendingBtn = null; this._selectedSize = null;
    }

    /* ─────────────────── QUICKVIEW ─────────────────── */
    _quickviewListeners() {
        document.getElementById('qv-close')?.addEventListener('click', () => this._closeQuickview());
        document.getElementById('quickview-modal')?.addEventListener('click', e => {
            if (e.target === document.getElementById('quickview-modal')) this._closeQuickview();
        });
    }

    openQuickview(id) {
        const p = this.products.find(x => x.id == id);
        if (!p) return;
        this._trackRecentlyViewed(id);
        const stars = Array.from({length:5},(_,i) =>
            `<i class="fa-${i < p.rating ? 'solid':'regular'} fa-star"></i>`).join('');
        const swatches = (p.colors||[]).map(c =>
            `<span class="swatch" style="background:${c};width:20px;height:20px" title="${c}"></span>`).join('');
        const sizes = (p.sizes||['XS','S','M','L','XL']).map(s =>
            `<button class="size-option" style="width:48px;height:48px;font-size:10px" onclick="this.parentElement.querySelectorAll('.size-option').forEach(b=>b.classList.remove('selected'));this.classList.add('selected')"><span>${s}</span></button>`).join('');

        document.getElementById('qv-gallery').innerHTML = `
            <img src="${p.img1}" alt="${p.name}" onerror="this.src='${p.img2}'">`;
        document.getElementById('qv-info').innerHTML = `
            <p class="qv-brand">${p.brand||'NOVA'}</p>
            <h3 class="qv-name">${p.name}</h3>
            <div class="qv-price-row">
                <span class="qv-price">$${p.price.toFixed(2)}</span>
                ${p.oldPrice ? `<span class="qv-old-price">$${p.oldPrice.toFixed(2)}</span>` : ''}
            </div>
            <div class="qv-stars">
                <span class="stars">${stars}</span>
                <span class="review-count">(${(p.reviewCount||0).toLocaleString()} reviews)</span>
            </div>
            <p class="qv-desc">Crafted for the modern wardrobe. Precision cut, premium fabric, built to outlast the season.</p>
            ${p.colors?.length ? `<div class="qv-colors">${swatches}</div>` : ''}
            <div class="qv-sizes">${sizes}</div>
            <button class="qv-add-btn" onclick="novaApp.openSize(${p.id},this)">
                <span>SELECT SIZE & ADD TO BAG</span>
            </button>`;

        document.getElementById('quickview-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    _closeQuickview() {
        document.getElementById('quickview-modal')?.classList.remove('active');
        document.body.style.overflow = '';
    }

    /* ─────────────────── CART ─────────────────── */
    addToCart(id, btnEl, size = 'M') {
        const p = this.products.find(x => x.id == id);
        if (!p) return;
        this._trackRecentlyViewed(id);

        const doAdd = () => {
            const key = `${id}-${size}`;
            const ex  = this.cart.find(i => i.cartKey === key);
            ex ? ex.quantity++ : this.cart.push({...p, quantity:1, size, cartKey:key});
            this._saveCart();
            this.renderCart();
            this.toast(`<i class="fa-solid fa-bag-shopping"></i> "${p.name}" added to bag`);
            setTimeout(() => this.openCart(), 300);
        };

        if (btnEl?.classList) {
            const orig = btnEl.innerHTML;
            btnEl.classList.add('btn-loading');
            if (btnEl.tagName === 'BUTTON') btnEl.disabled = true;
            btnEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            setTimeout(() => {
                doAdd();
                btnEl.classList.remove('btn-loading');
                btnEl.classList.add('btn-success');
                btnEl.innerHTML = '<i class="fa-solid fa-check"></i>';
                setTimeout(() => {
                    btnEl.classList.remove('btn-success');
                    btnEl.innerHTML = orig;
                    if (btnEl.tagName === 'BUTTON') btnEl.disabled = false;
                }, 1400);
            }, 480);
        } else { doAdd(); }
    }

    updateQty(cartKey, delta) {
        const item = this.cart.find(i => i.cartKey === cartKey);
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) this.cart = this.cart.filter(i => i.cartKey !== cartKey);
        this._saveCart(); this.renderCart();
    }

    removeItem(cartKey) {
        this.cart = this.cart.filter(i => i.cartKey !== cartKey);
        this._saveCart(); this.renderCart();
    }

    _saveCart() { localStorage.setItem('nova_cart', JSON.stringify(this.cart)); }

    renderCart() {
        const body  = document.getElementById('cart-items-container');
        const count = document.getElementById('cart-count-drawer');
        if (!body) return;
        const total = this.cart.reduce((s,i) => s + i.quantity, 0);
        if (count) count.textContent = total;

        if (!this.cart.length) {
            body.innerHTML = `
                <div class="cart-empty">
                    <i class="fa-regular fa-bag-shopping"></i>
                    <p>Your bag is empty.<br><span style="opacity:.5">Add something beautiful.</span></p>
                </div>`;
        } else {
            body.innerHTML = this.cart.map(item => `
                <div class="cart-item-row">
                    <img src="${item.img1}" class="cart-item-img" alt="${item.name}" loading="lazy" onerror="this.style.opacity='.1'">
                    <div class="cart-item-info">
                        <p class="cart-item-name">${item.name}</p>
                        <p class="cart-item-size">SIZE: ${item.size}</p>
                        <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="novaApp.updateQty('${item.cartKey}',-1)">−</button>
                            <span class="qty-number">${item.quantity}</span>
                            <button class="qty-btn" onclick="novaApp.updateQty('${item.cartKey}',1)">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" onclick="novaApp.removeItem('${item.cartKey}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>`).join('');
        }
        this._refreshTotals();
    }

    _refreshTotals() {
        const subtotal = this.cart.reduce((s,i) => s + i.price * i.quantity, 0);
        const items    = this.cart.reduce((s,i) => s + i.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = items;
            el.classList.toggle('visible', items > 0);
        });
        const tv = document.getElementById('cart-total-val');
        if (tv) tv.textContent = `$${subtotal.toFixed(2)}`;
        // Shipping progress
        const threshold = 75;
        const pct = Math.min((subtotal / threshold) * 100, 100);
        const fill = document.getElementById('cart-progress-fill');
        const msg  = document.getElementById('cart-progress-msg');
        const amt  = document.getElementById('cart-progress-amt');
        if (fill) fill.style.width = pct + '%';
        if (msg && amt) {
            if (subtotal >= threshold) {
                msg.innerHTML = `<i class="fa-solid fa-truck" style="color:#16a34a"></i> <span style="color:#16a34a">You've unlocked free shipping!</span>`;
            } else {
                const remaining = (threshold - subtotal).toFixed(2);
                msg.innerHTML = `Add <strong id="cart-progress-amt">$${remaining}</strong> more for free shipping`;
            }
        }
    }

    openCart() {
        document.getElementById('cart-drawer')?.classList.add('open');
        document.getElementById('cart-overlay')?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    closeCart() {
        document.getElementById('cart-drawer')?.classList.remove('open');
        document.getElementById('cart-overlay')?.classList.remove('open');
        document.body.style.overflow = '';
    }

    _cartListeners() {
        document.getElementById('cart-bag')?.addEventListener('click',     () => this.openCart());
        document.getElementById('cart-close')?.addEventListener('click',   () => this.closeCart());
        document.getElementById('cart-overlay')?.addEventListener('click', () => this.closeCart());
    }

    /* ─────────────────── WISHLIST ─────────────────── */
    toggleWish(id, btn) {
        const idx = this.wishlist.indexOf(id);
        if (idx === -1) {
            this.wishlist.push(id);
            btn.classList.add('wished');
            btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
            this.toast(`<i class="fa-solid fa-heart" style="color:#ec4899"></i> Saved to wishlist`, 'wish');
        } else {
            this.wishlist.splice(idx, 1);
            btn.classList.remove('wished');
            btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
            this.toast(`<i class="fa-regular fa-heart"></i> Removed from wishlist`);
        }
        localStorage.setItem('nova_wishlist', JSON.stringify(this.wishlist));
        this._wishlistIconSync();
    }

    _wishlistIconSync() {
        const count = document.getElementById('wish-count');
        if (!count) return;
        count.textContent = this.wishlist.length;
        count.classList.toggle('visible', this.wishlist.length > 0);
    }

    /* ─────────────────── RECENTLY VIEWED ─────────────────── */
    _trackRecentlyViewed(id) {
        this.recentlyViewed = [id, ...this.recentlyViewed.filter(x => x !== id)].slice(0, 8);
        localStorage.setItem('nova_rv', JSON.stringify(this.recentlyViewed));
        this._renderRecentlyViewed();
    }

    _renderRecentlyViewed() {
        const section = document.getElementById('rv-section');
        const track   = document.getElementById('rv-track');
        if (!section || !track || !this.recentlyViewed.length || !this.products.length) return;
        const items = this.recentlyViewed.map(id => this.products.find(p => p.id === id)).filter(Boolean);
        if (!items.length) return;
        section.style.display = 'block';
        track.innerHTML = items.map(p => `
            <div class="rv-card" onclick="novaApp.openQuickview(${p.id})">
                <div class="rv-card-img">
                    <img src="${p.img1}" alt="${p.name}" loading="lazy" onerror="this.style.opacity='.1'">
                </div>
                <p class="rv-card-name">${p.name}</p>
                <p class="rv-card-price">$${p.price.toFixed(2)}</p>
            </div>`).join('');
    }

    /* ─────────────────── TOAST ─────────────────── */
    toast(html, type = '') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const el = document.createElement('div');
        el.className = `toast${type === 'wish' ? ' toast-wish' : type === 'success' ? ' toast-success' : ''}`;
        el.innerHTML = html;
        container.appendChild(el);
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
        setTimeout(() => {
            el.classList.remove('show');
            el.addEventListener('transitionend', () => el.remove(), {once:true});
        }, 3000);
    }

    /* ─────────────────── SEARCH ─────────────────── */
    _searchListeners() {
        const overlay = document.getElementById('search-overlay');
        const input   = document.getElementById('search-input');
        const close   = document.getElementById('search-close');
        const trigger = document.getElementById('search-trigger');
        const results = document.getElementById('search-results');
        if (!overlay) return;
        const open = () => { overlay.classList.add('active'); document.body.style.overflow='hidden'; setTimeout(() => input?.focus(), 280); };
        const shut = () => { overlay.classList.remove('active'); document.body.style.overflow=''; if(input) input.value=''; if(results) results.innerHTML=''; };
        trigger?.addEventListener('click', open);
        close?.addEventListener('click',   shut);
        overlay.addEventListener('click',  e => { if (e.target === overlay) shut(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') shut();
            if ((e.ctrlKey||e.metaKey) && e.key === 'k') { e.preventDefault(); open(); }
        });
        let timer;
        input?.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(() => this._doSearch(input.value, results), 200);
        });
    }

    _doSearch(q, resultsEl) {
        if (!resultsEl) return;
        const query = q.trim().toLowerCase();
        if (query.length < 2) { resultsEl.innerHTML = ''; return; }
        const hits = this.products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.brand||'').toLowerCase().includes(query) ||
            (p.category||'').toLowerCase().includes(query)
        ).slice(0, 6);
        if (!hits.length) {
            resultsEl.innerHTML = `<div class="search-no-results">No results for "<strong>${q}</strong>"</div>`;
            return;
        }
        resultsEl.innerHTML = hits.map(p => `
            <div class="search-result-item" onclick="novaApp._searchClick(${p.id})">
                <img src="${p.img1}" alt="${p.name}" loading="lazy" onerror="this.style.opacity='.1'">
                <div class="search-result-info">
                    <p>${p.name}</p>
                    <span>$${p.price.toFixed(2)}</span>
                </div>
            </div>`).join('');
    }

    _searchClick(id) {
        document.getElementById('search-overlay')?.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('search-input').value       = '';
        document.getElementById('search-results').innerHTML = '';
        setTimeout(() => {
            const card = document.querySelector(`.item-card[data-id="${id}"]`);
            if (card) {
                card.scrollIntoView({behavior:'smooth', block:'center'});
                card.style.outline = '2px solid var(--gold)';
                card.style.outlineOffset = '2px';
                setTimeout(() => { card.style.outline=''; card.style.outlineOffset=''; }, 2000);
            }
        }, 380);
    }

    /* ─────────────────── MOBILE NAV ─────────────────── */
    _mobileNav() {
        const toggle  = document.getElementById('menu-toggle');
        const nav     = document.getElementById('mobile-nav');
        const overlay = document.getElementById('mobile-nav-overlay');
        const close   = document.getElementById('mobile-nav-close');
        const open  = () => { nav?.classList.add('open'); overlay?.classList.add('active'); document.body.style.overflow='hidden'; };
        const shut  = () => { nav?.classList.remove('open'); overlay?.classList.remove('active'); document.body.style.overflow=''; };
        toggle?.addEventListener('click',  open);
        close?.addEventListener('click',   shut);
        overlay?.addEventListener('click', shut);
        document.querySelectorAll('.mobile-nav-links a').forEach(a => {
            a.addEventListener('click', e => {
                e.preventDefault();
                shut();
                const cat = a.dataset.cat;
                setTimeout(() => {
                    document.getElementById('shop')?.scrollIntoView({behavior:'smooth'});
                    if (cat) document.querySelector(`.pill[data-category="${cat}"]`)?.click();
                }, 420);
            });
        });
    }

    /* ─────────────────── HORIZONTAL SCROLL ─────────────────── */
    _hscroll() {
        const track = document.getElementById('hscroll-track');
        const prev  = document.getElementById('hs-prev');
        const next  = document.getElementById('hs-next');
        if (!track) return;
        const scrollBy = 300;
        prev?.addEventListener('click', () => { track.scrollLeft -= scrollBy; });
        next?.addEventListener('click', () => { track.scrollLeft += scrollBy; });
        // Drag scroll
        let isDown = false, startX = 0, scrollLeft = 0;
        track.addEventListener('mousedown', e => { isDown=true; startX=e.pageX-track.offsetLeft; scrollLeft=track.scrollLeft; track.style.userSelect='none'; });
        track.addEventListener('mouseleave',() => { isDown=false; track.style.userSelect=''; });
        track.addEventListener('mouseup',   () => { isDown=false; track.style.userSelect=''; });
        track.addEventListener('mousemove', e => { if(!isDown) return; e.preventDefault(); const x=e.pageX-track.offsetLeft; track.scrollLeft=scrollLeft-(x-startX)*1.2; });
    }

    /* ─────────────────── MAGNETIC BUTTONS ─────────────────── */
    _magneticButtons() {
        if (window.innerWidth < 1024) return;
        document.querySelectorAll('.magnetic').forEach(btn => {
            let pending = false;
            btn.addEventListener('mousemove', e => {
                if (pending) return;
                pending = true;
                requestAnimationFrame(() => {
                    const r = btn.getBoundingClientRect();
                    const x = e.clientX - r.left - r.width  / 2;
                    const y = e.clientY - r.top  - r.height / 2;
                    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
                    pending = false;
                });
            }, {passive:true});
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    /* ─────────────────── 3D CARD TILT ─────────────────── */
    _cardTilt() {
        if (window.innerWidth < 1024) return;
        document.querySelectorAll('.item-card').forEach(card => {
            let tiltPending = false;
            card.addEventListener('mousemove', e => {
                if (tiltPending) return;
                tiltPending = true;
                requestAnimationFrame(() => {
                    const r = card.getBoundingClientRect();
                    const x = (e.clientX - r.left) / r.width  - 0.5;
                    const y = (e.clientY - r.top)  / r.height - 0.5;
                    card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(4px)`;
                    tiltPending = false;
                });
            }, {passive:true});
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ─────────────────── PREMIUM HERO SLIDESHOW ─────────────────── */
    _heroSlideshow() {
        const slides   = document.querySelectorAll('.hero-slide');
        const dots     = document.querySelectorAll('.hero-dot');
        const counter  = document.querySelector('.hero-counter');
        const progress = document.getElementById('hero-progress');
        if (!slides.length) return;

        const INTERVAL  = 5500; // ms per slide
        const LABELS    = ['01 / 04', '02 / 04', '03 / 04', '04 / 04'];
        let current     = 0;
        let timer       = null;
        let progTimer   = null;

        const goTo = (idx, restart = true) => {
            // Mark leaving
            slides[current].classList.remove('active');
            slides[current].classList.add('leaving');
            setTimeout(() => slides[current < slides.length ? current : 0]?.classList.remove('leaving'), 1600);

            dots[current]?.classList.remove('active');
            current = (idx + slides.length) % slides.length;

            slides[current].classList.add('active');
            dots[current]?.classList.add('active');
            if (counter) counter.textContent = LABELS[current];

            // Progress bar reset + animate
            if (progress) {
                progress.style.transition = 'none';
                progress.style.width = '0%';
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    progress.style.transition = `width ${INTERVAL}ms linear`;
                    progress.style.width = '100%';
                }));
            }

            if (restart) {
                clearTimeout(timer);
                timer = setTimeout(() => goTo(current + 1), INTERVAL);
            }
        };

        // Dot click navigation
        dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

        // Keyboard arrow navigation
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft')  goTo(current - 1);
            if (e.key === 'ArrowRight') goTo(current + 1);
        });

        // Pause on hover
        const stage = document.getElementById('hero');
        stage?.addEventListener('mouseenter', () => clearTimeout(timer));
        stage?.addEventListener('mouseleave', () => { timer = setTimeout(() => goTo(current + 1), INTERVAL); });

        // Start
        goTo(0);
    }

    /* ─────────────────── SCROLL FX ─────────────────── */
    _scrollFX() {
        const header = document.getElementById('main-header');
        const bar    = document.getElementById('scroll-bar');
        let ticking  = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                header?.classList.toggle('scrolled', window.scrollY > 60);
                if (bar) {
                    const max = document.body.scrollHeight - window.innerHeight;
                    bar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
                }
                ticking = false;
            });
        }, {passive:true});
    }

    /* ─────────────────── REVEAL CARDS ─────────────────── */
    _revealCards() {
        const io = new IntersectionObserver(entries => {
            entries.forEach((entry, i) => {
                if (!entry.isIntersecting) return;
                setTimeout(() => entry.target.classList.add('revealed'), i * 60);
                io.unobserve(entry.target);
            });
        }, {threshold: 0.06});
        document.querySelectorAll('.item-card').forEach(c => io.observe(c));
    }

    /* ─────────────────── STATS COUNTER ─────────────────── */
    _statsCounter() {
        const easeOut = t => 1 - Math.pow(1 - t, 3);
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                io.unobserve(entry.target);
                const el = entry.target, target = parseInt(el.dataset.target);
                const dur = 1800, start = performance.now();
                const tick = now => {
                    const p = Math.min((now - start) / dur, 1);
                    el.textContent = Math.round(easeOut(p) * target).toLocaleString();
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            });
        }, {threshold: 0.3});
        document.querySelectorAll('.stat-num[data-target]').forEach(el => io.observe(el));
    }

    /* ─────────────────── PREMIUM CHARTS ─────────────────── */
    _buildCharts() {
        const section = document.getElementById('promo-chart-section');
        if (!section) return;

        const rings = [
            {label:'Customer Satisfaction', value:98, color:'#c9a84c', icon:'fa-star',        delta:'+2.1%', up:true},
            {label:'On-Time Delivery',       value:96, color:'#c8102e', icon:'fa-truck-fast',  delta:'+0.8%', up:true},
            {label:'Repeat Purchase Rate',   value:74, color:'#c9a84c', icon:'fa-rotate-left', delta:'+5.4%', up:true},
            {label:'Sustainable Materials',  value:82, color:'#22c55e', icon:'fa-leaf',         delta:'+12%',  up:true},
        ];

        const bars = [
            {label:'Dresses',   count:'4,218 sold', val:34},
            {label:'Bottoms',   count:'2,730 sold', val:22},
            {label:'Outerwear', count:'2,234 sold', val:18},
            {label:'Tops',      count:'1,862 sold', val:15},
            {label:'Sets',      count:'1,366 sold', val:11},
        ];

        const timeline = [
            {year:'2020', title:'Nova Atelier Founded', desc:'Born from a single vision: fashion that respects both craft and customer. First 200 pieces sold out in 48 hours.', stat:'200 units · 48h sellout'},
            {year:'2022', title:'Black Label Launched', desc:'Premium tier collection introduced. Atelier-level construction, limited runs, zero compromise on material sourcing.', stat:'12 pieces · $280K revenue'},
            {year:'2024', title:'Global Expansion', desc:'Shipping to 48 countries. Partnership with sustainable textile mills in Portugal and Japan.', stat:'48 countries · 8,400+ orders'},
            {year:'2026', title:'SS 2026 Collection', desc:'The New Uniform. Our largest collection to date — 18 pieces, zero filler. Currently live.', stat:'18 pieces · Live now'},
        ];

        const circ = 2 * Math.PI * 52;

        section.innerHTML = `
        <div class="pc-header">
            <div class="pc-header-line">
                <span class="pc-eyebrow">By The Numbers</span>
            </div>
            <h2 class="pc-title">The Nova <em>Standard</em></h2>
            <p class="pc-sub">Verified metrics from 12,400+ orders across 48 countries.</p>
        </div>

        <div class="pc-tabs">
            <button class="pc-tab active" data-tab="metrics">Metrics</button>
            <button class="pc-tab" data-tab="sales">Sales</button>
            <button class="pc-tab" data-tab="story">Story</button>
        </div>

        <div class="pc-panel active" id="pc-metrics">
            <div class="pc-rings">
                ${rings.map((r,i) => `
                <div class="pc-ring-card" style="animation-delay:${i*0.1}s">
                    <span class="pc-ring-card-num">0${i+1}</span>
                    <div class="pc-ring-svg-wrap">
                        <svg viewBox="0 0 120 120" class="pc-ring-svg" data-value="${r.value}">
                            <circle class="pc-arc-bg" cx="60" cy="60" r="52"/>
                            <circle class="pc-arc" cx="60" cy="60" r="52"
                                stroke="${r.color}"
                                stroke-dasharray="${circ}"
                                stroke-dashoffset="${circ}"/>
                        </svg>
                        <div class="pc-ring-center">
                            <i class="fa-solid ${r.icon} pc-ring-icon" style="color:${r.color}"></i>
                            <span class="pc-ring-pct" data-target="${r.value}">0</span>
                            <span class="pc-ring-pct-sym">%</span>
                        </div>
                    </div>
                    <p class="pc-ring-label">${r.label}</p>
                    <span class="pc-ring-delta ${r.up?'up':'down'}">
                        <i class="fa-solid fa-arrow-${r.up?'up':'down'}"></i>${r.delta} YoY
                    </span>
                </div>`).join('')}
            </div>
        </div>

        <div class="pc-panel" id="pc-sales">
            <div class="pc-bar-section">
                <div class="pc-bar-header">
                    <h3 class="pc-bar-heading">Sales by<br><em>Category</em></h3>
                    <div class="pc-bar-legend">
                        <div class="pc-legend-item"><span class="pc-legend-dot" style="background:var(--gold)"></span>2026 Performance</div>
                        <div class="pc-legend-item"><span class="pc-legend-dot" style="background:rgba(255,255,255,.1)"></span>Remaining share</div>
                    </div>
                </div>
                <div class="pc-bars-list">
                    ${bars.map((b,i) => `
                    <div class="pc-bar-row-premium">
                        <div class="pc-bar-cat">
                            <span class="pc-bar-cat-name">${b.label}</span>
                            <span class="pc-bar-cat-count">${b.count}</span>
                        </div>
                        <div class="pc-bar-track-wrap">
                            <div class="pc-bar-track">
                                <div class="pc-bar-fill" data-width="${b.val}" style="width:0%"></div>
                            </div>
                            <div class="pc-bar-sublabel">
                                <span>0%</span><span>100%</span>
                            </div>
                        </div>
                        <span class="pc-bar-pct-premium" data-target="${b.val}">0%</span>
                    </div>`).join('')}
                </div>
            </div>
        </div>

        <div class="pc-panel" id="pc-story">
            <div class="pc-timeline">
                ${timeline.map((t,i) => `
                <div class="pc-tl-item" style="animation-delay:${i*0.15}s">
                    <div class="pc-tl-dot"><div class="pc-tl-dot-inner" ${i<timeline.length-1?'style="animation:none;opacity:.4"':''}></div></div>
                    <span class="pc-tl-year">${t.year}</span>
                    <div class="pc-tl-content">
                        <p class="pc-tl-title">${t.title}</p>
                        <p class="pc-tl-desc">${t.desc}</p>
                        <span class="pc-tl-stat">${t.stat}</span>
                    </div>
                </div>`).join('')}
            </div>
        </div>`;

        // Tab switching
        section.querySelectorAll('.pc-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                section.querySelectorAll('.pc-tab').forEach(t => t.classList.remove('active'));
                section.querySelectorAll('.pc-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                section.querySelector(`#pc-${tab.dataset.tab}`)?.classList.add('active');
                // Re-animate when switching tabs
                if (tab.dataset.tab === 'metrics') this._animateRings(section);
                if (tab.dataset.tab === 'sales')   this._animateBars(section);
            });
        });

        // Animate on scroll
        let animated = false;
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting || animated) return;
                animated = true;
                this._animateRings(section);
            });
        }, {threshold: 0.15});
        io.observe(section);

        // Also trigger bento video play attempt
        this._bentVideoFallback();
    }

    _animateRings(section) {
        const easeOut = t => 1 - Math.pow(1 - t, 3);
        const circ = 2 * Math.PI * 52;
        const dur  = 1700;
        section.querySelectorAll('#pc-metrics .pc-arc').forEach((arc, i) => {
            const target = parseFloat(arc.closest('svg').dataset.value) / 100;
            const delay  = i * 120;
            setTimeout(() => {
                const start = performance.now();
                const tick  = now => {
                    const p = Math.min((now - start) / dur, 1);
                    arc.style.strokeDashoffset = circ * (1 - easeOut(p) * target);
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }, delay);
        });
        section.querySelectorAll('#pc-metrics .pc-ring-pct[data-target]').forEach((el, i) => {
            const target = parseInt(el.dataset.target);
            setTimeout(() => {
                const start = performance.now();
                const tick  = now => {
                    const p = Math.min((now - start) / dur, 1);
                    el.textContent = Math.round(easeOut(p) * target);
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }, i * 120);
        });
    }

    _animateBars(section) {
        section.querySelectorAll('#pc-sales .pc-bar-fill[data-width]').forEach((bar, i) => {
            setTimeout(() => {
                bar.style.transition = 'width 1.4s cubic-bezier(.16,1,.3,1)';
                bar.style.width = bar.dataset.width + '%';
            }, i * 140);
        });
        const easeOut = t => 1 - Math.pow(1 - t, 3);
        section.querySelectorAll('#pc-sales .pc-bar-pct-premium[data-target]').forEach((el, i) => {
            const target = parseInt(el.dataset.target);
            setTimeout(() => {
                const dur = 1400, start = performance.now();
                const tick = now => {
                    const p = Math.min((now - start) / dur, 1);
                    el.textContent = Math.round(easeOut(p) * target) + '%';
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }, i * 140);
        });
    }

    _animateCharts(section) {
        // Legacy shim — delegates to new methods
        this._animateRings(section);
    }

    _ringHTML() { return ''; } // Legacy shim

    _bentVideoFallback() {
        document.querySelectorAll('.bento-video').forEach(video => {
            video.addEventListener('canplay', () => video.classList.add('playing'), {once: true});
            // If video fails, img fallback is already visible underneath
            video.load();
        });
    }

    /* ─────────────────── CURSOR ─────────────────── */
    _cursor() {
        const outer = document.getElementById('cursor-outer');
        const inner = document.getElementById('cursor-inner');
        const text  = document.getElementById('cursor-text');
        if (!outer || !inner) return;
        if ('ontouchstart' in window) return; // no cursor on mobile
        let mx=0, my=0, rx=0, ry=0, pending=false;
        window.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            if (!pending) {
                pending = true;
                requestAnimationFrame(() => {
                    inner.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
                    if (text) text.style.transform = `translate(${mx+20}px,${my+20}px)`;
                    pending = false;
                });
            }
        }, {passive:true});
        let raf;
        const lerp = () => {
            rx += (mx-rx) * 0.12; ry += (my-ry) * 0.12;
            outer.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
            raf = requestAnimationFrame(lerp);
        };
        lerp();
        let hoverPending = false;
        document.addEventListener('mouseover', e => {
            if (hoverPending) return;
            hoverPending = true;
            requestAnimationFrame(() => {
                const t = e.target;
                const isHover = t.tagName==='BUTTON' || t.tagName==='A' ||
                    ['pill','quick-add-bar','size-option','bento-cell','item-card','swatch','bento-cta','hscroll-item']
                        .some(c => t.classList.contains(c)) || t.closest('button') || t.closest('a');
                const isView = t.classList.contains('img-host') || t.closest('.img-host');
                document.body.classList.toggle('cursor-hover', !!isHover && !isView);
                document.body.classList.toggle('cursor-view',  !!isView);
                if (text) text.style.opacity = isView ? '1' : '0';
                hoverPending = false;
            });
        });
        document.addEventListener('mouseout', () => {
            document.body.classList.remove('cursor-hover','cursor-view');
            if (text) text.style.opacity = '0';
        });
        document.querySelectorAll('.stats-strip,.lookbook-strip,.promo-chart-section,.newsletter-section,.site-footer,.mobile-nav')
            .forEach(s => {
                s.addEventListener('mouseenter', () => outer.classList.add('on-dark'));
                s.addEventListener('mouseleave', () => outer.classList.remove('on-dark'));
            });
        document.querySelectorAll('input,textarea,select').forEach(el => {
            el.addEventListener('focus', () => document.body.classList.add('cursor-text'));
            el.addEventListener('blur',  () => document.body.classList.remove('cursor-text'));
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(raf); else lerp();
        });
    }

    /* ─────────────────── NEWSLETTER ─────────────────── */
    goToCheckout() {
        if (!this.cart.length) return;

        // If Gumroad is configured, open the first cart item's Gumroad link
        // For multi-item carts, open checkout.html which handles the order summary
        const firstId = this.cart[0].id;
        const gumroadLink = NOVA_CONFIG.products[firstId];
        const configured  = gumroadLink && !gumroadLink.includes('PRODUCT_');

        if (configured && this.cart.length === 1) {
            // Single item — go straight to Gumroad
            window.open(gumroadLink, '_blank');
        } else {
            // Multi-item or not configured — go to checkout.html
            window.location.href = 'checkout.html';
        }
    }

    handleNewsletter(e) {
        e.preventDefault();
        const btn   = e.target.querySelector('button');
        const input = e.target.querySelector('input');
        const email = input?.value?.trim();
        const orig  = btn.innerHTML;

        // Send to Mailchimp if configured
        if (email && NOVA_CONFIG.mailchimpUrl && !NOVA_CONFIG.mailchimpUrl.includes('YOUR_ACCOUNT')) {
            const url = `${NOVA_CONFIG.mailchimpUrl}&EMAIL=${encodeURIComponent(email)}&FNAME=&subscribe=Subscribe`;
            fetch(url, { method:'POST', mode:'no-cors' }).catch(() => {});
        }

        btn.innerHTML = '<span>✓ Subscribed!</span>';
        btn.style.background = '#22c55e';
        input.value = '';
        this.toast('<i class="fa-solid fa-circle-check"></i> Welcome to the Atelier', 'success');
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 3200);
    }
}

/* ── INIT ── */
const novaApp = new NovaStore();
window.novaApp = novaApp;

/* ══════════════════════════════════════════════════════════════
   MONETIZATION MODULE — Flash Sale · VIP · Exit-Intent · Upsell · Gift Cards · Affiliate
══════════════════════════════════════════════════════════════ */

class NovaMonetize {

    constructor(store) {
        this.store = store;
        this._flashEnd  = this._getOrSetFlashEnd();
        this._vipShown  = sessionStorage.getItem('nova_vip_shown');
        this._exitShown = sessionStorage.getItem('nova_exit_shown');
        this._init();
    }

    _init() {
        this._flashBar();
        this._vipModal();
        this._exitIntent();
        this._giftCards();
        this._affiliateBanner();
        this._cartUpsell();
        // Show VIP modal after 9s on first visit
        if (!this._vipShown) {
            setTimeout(() => this._openVip(), 9000);
        }
    }

    /* ─────────── FLASH SALE COUNTDOWN ─────────── */
    _getOrSetFlashEnd() {
        let end = localStorage.getItem('nova_flash_end');
        if (!end || Date.now() > parseInt(end)) {
            // New 6-hour flash sale window
            end = Date.now() + 6 * 60 * 60 * 1000;
            localStorage.setItem('nova_flash_end', end);
        }
        return parseInt(end);
    }

    _flashBar() {
        const bar   = document.getElementById('flash-bar');
        const closeBtn = document.getElementById('flash-close');
        if (!bar) return;

        // Check if user dismissed it this session
        if (sessionStorage.getItem('nova_flash_dismissed')) {
            bar.classList.add('hidden');
        } else {
            document.body.classList.add('flash-active');
        }

        closeBtn?.addEventListener('click', () => {
            bar.classList.add('hidden');
            document.body.classList.remove('flash-active');
            sessionStorage.setItem('nova_flash_dismissed', '1');
        });

        const tick = () => {
            const diff = this._flashEnd - Date.now();
            if (diff <= 0) {
                // Reset for next sale
                this._flashEnd = Date.now() + 6 * 60 * 60 * 1000;
                localStorage.setItem('nova_flash_end', this._flashEnd);
            }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            const pad = n => String(Math.max(0,n)).padStart(2,'0');
            const hEl = document.getElementById('fc-h');
            const mEl = document.getElementById('fc-m');
            const sEl = document.getElementById('fc-s');
            if (hEl) hEl.textContent = pad(h);
            if (mEl) mEl.textContent = pad(m);
            if (sEl) sEl.textContent = pad(s);
        };
        tick();
        // Use 500ms interval, pause when tab hidden
        let flashIv = setInterval(tick, 500);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { clearInterval(flashIv); }
            else { flashIv = setInterval(tick, 500); }
        });
    }

    /* ─────────── VIP MEMBERSHIP MODAL ─────────── */
    _openVip() {
        const modal = document.getElementById('vip-modal');
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        sessionStorage.setItem('nova_vip_shown', '1');
    }

    _closeVip() {
        const modal = document.getElementById('vip-modal');
        modal?.classList.remove('active');
        document.body.style.overflow = '';
    }

    _vipModal() {
        const trigger = document.getElementById('vip-trigger');
        const closeBtn = document.getElementById('vip-close');
        const joinBtn  = document.getElementById('vip-join-btn');
        const modal    = document.getElementById('vip-modal');

        trigger?.addEventListener('click', () => this._openVip());
        closeBtn?.addEventListener('click', () => this._closeVip());
        modal?.addEventListener('click', e => {
            if (e.target === modal) this._closeVip();
        });

        joinBtn?.addEventListener('click', () => {
            // Check which plan is visually selected (featured = annual)
            const isAnnual = true; // default to annual (best value)
            const stripeLink = isAnnual ? NOVA_CONFIG.vipAnnual : NOVA_CONFIG.vipMonthly;
            const configured = stripeLink && !stripeLink.includes('VIP_');

            if (configured) {
                // Real Stripe link — open payment page
                window.open(stripeLink, '_blank');
                this._closeVip();
                return;
            }

            // Demo mode — show animation
            const orig = joinBtn.innerHTML;
            joinBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Processing...</span>';
            joinBtn.disabled = true;
            setTimeout(() => {
                joinBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Welcome to VIP!</span>';
                joinBtn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
                this.store.toast('<i class="fa-solid fa-crown" style="color:var(--gold)"></i> You are now a Black Label VIP member!', 'success');
                setTimeout(() => {
                    this._closeVip();
                    joinBtn.innerHTML = orig;
                    joinBtn.style.background = '';
                    joinBtn.disabled = false;
                }, 2000);
            }, 1400);
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') this._closeVip();
        });
    }

    /* ─────────── EXIT-INTENT POPUP ─────────── */
    _exitIntent() {
        if (this._exitShown) return;
        const modal   = document.getElementById('exit-modal');
        const closeBtn = document.getElementById('exit-close');
        const noThanks = document.getElementById('exit-no-thanks');
        const form    = document.getElementById('exit-form');
        const reveal  = document.getElementById('exit-code-reveal');
        if (!modal) return;

        const open = () => {
            if (sessionStorage.getItem('nova_exit_shown')) return;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            sessionStorage.setItem('nova_exit_shown', '1');
        };

        const close = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        // Trigger on mouse leaving viewport top
        let triggered = false;
        document.addEventListener('mouseleave', e => {
            if (e.clientY < 5 && !triggered) {
                triggered = true;
                setTimeout(open, 200);
            }
        });

        // Mobile: trigger after 45s of engagement
        if ('ontouchstart' in window) {
            setTimeout(open, 45000);
        }

        closeBtn?.addEventListener('click', close);
        noThanks?.addEventListener('click', close);
        modal?.addEventListener('click', e => { if (e.target === modal) close(); });

        form?.addEventListener('submit', e => {
            e.preventDefault();
            const emailVal = form.querySelector('input[type=email]')?.value?.trim();
            const code = 'NOVA15';

            // Send to Mailchimp if configured
            if (emailVal && NOVA_CONFIG.mailchimpUrl && !NOVA_CONFIG.mailchimpUrl.includes('YOUR_ACCOUNT')) {
                fetch(`${NOVA_CONFIG.mailchimpUrl}&EMAIL=${encodeURIComponent(emailVal)}&FNAME=&subscribe=Subscribe`,
                    { method:'POST', mode:'no-cors' }).catch(() => {});
            }

            navigator.clipboard?.writeText(code).catch(() => {});
            form.classList.add('hidden');
            if (reveal) reveal.classList.remove('hidden');
            const codeEl = document.getElementById('exit-code-val');
            if (codeEl) codeEl.textContent = code;
            this.store.toast('<i class="fa-solid fa-percent"></i> Code NOVA15 copied — 15% off your order!', 'success');
            setTimeout(close, 4000);
        });
    }

    /* ─────────── CART UPSELL (Complete the Look) ─────────── */
    _cartUpsell() {
        // Patch the store's renderCart to also render upsell
        const origRender = this.store.renderCart.bind(this.store);
        this.store.renderCart = () => {
            origRender();
            this._renderUpsell();
        };
    }

    _renderUpsell() {
        const upsellSection = document.getElementById('cart-upsell');
        const track = document.getElementById('cart-upsell-track');
        if (!upsellSection || !track) return;

        const cartIds = this.store.cart.map(i => i.id);
        if (!cartIds.length) { upsellSection.style.display = 'none'; return; }

        // Pick up to 4 products NOT in cart
        const suggestions = this.store.products
            .filter(p => !cartIds.includes(p.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);

        if (!suggestions.length) { upsellSection.style.display = 'none'; return; }

        upsellSection.style.display = 'block';
        track.innerHTML = suggestions.map(p => `
            <div class="upsell-card">
                <div class="upsell-card-img" onclick="novaApp.openQuickview(${p.id})">
                    <img src="${p.img1}" alt="${p.name}" loading="lazy" onerror="this.style.opacity='.2'">
                </div>
                <p class="upsell-card-name">${p.name}</p>
                <p class="upsell-card-price">$${p.price.toFixed(2)}</p>
                <button class="upsell-card-add" onclick="novaApp.openSize(${p.id},this)">+ ADD</button>
            </div>`).join('');
    }

    /* ─────────── GIFT CARDS ─────────── */
    _giftCards() {
        const buyBtn    = document.getElementById('gc-buy-btn');
        const display   = document.getElementById('gc-card-display');
        const amounts   = document.querySelectorAll('.gc-amount');
        let selectedAmt = 25;

        amounts.forEach(btn => {
            btn.addEventListener('click', () => {
                amounts.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedAmt = parseInt(btn.dataset.amount);
                if (display) display.textContent = `$${selectedAmt}`;
                if (buyBtn) buyBtn.querySelector('span').textContent = `Buy Gift Card — $${selectedAmt}`;
            });
        });

        buyBtn?.addEventListener('click', () => {
            const stripeLink = NOVA_CONFIG.giftCard[selectedAmt];
            const configured = stripeLink && !stripeLink.includes('GIFT_');

            if (configured) {
                window.open(stripeLink, '_blank');
                return;
            }

            // Demo mode
            const orig = buyBtn.innerHTML;
            buyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Processing…</span>';
            buyBtn.disabled = true;
            setTimeout(() => {
                buyBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Gift Card Sent!</span>';
                buyBtn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
                this.store.toast(`<i class="fa-solid fa-gift" style="color:var(--gold)"></i> $${selectedAmt} Gift Card added — check your email!`, 'success');
                setTimeout(() => {
                    buyBtn.innerHTML = orig;
                    buyBtn.style.background = '';
                    buyBtn.disabled = false;
                }, 3000);
            }, 1400);
        });
    }

    /* ─────────── AFFILIATE BANNER ─────────── */
    _affiliateBanner() {
        const btn = document.getElementById('aff-cta-btn');
        btn?.addEventListener('click', () => {
            const orig = btn.innerHTML;
            btn.innerHTML = '<span>Application Sent!</span> <i class="fa-solid fa-check"></i>';
            btn.style.background = '#22c55e';
            btn.style.color = '#fff';
            this.store.toast('<i class="fa-solid fa-link" style="color:var(--gold)"></i> Affiliate application received — we\'ll be in touch!', 'success');
            setTimeout(() => {
                btn.innerHTML = orig;
                btn.style.background = '';
                btn.style.color = '';
            }, 4000);
        });
    }
}

/* ── BOOT MONETIZE after store is ready ── */
document.addEventListener('DOMContentLoaded', () => {
    // Wait a tick for novaApp to finish init
    setTimeout(() => {
        if (window.novaApp) {
            window.novaMoney = new NovaMonetize(window.novaApp);
        }
    }, 200);
});

/* ══════════════════════════════════════════════════════════════
   NEW MONETIZATION — Social Proof · Spin Wheel · Sticky Bar · Bundle · Referral
══════════════════════════════════════════════════════════════ */

class NovaConvert {

    constructor(store) {
        this.store = store;
        this._init();
    }

    _init() {
        this._socialProof();
        this._spinWheel();
        this._stickyBar();
        this._bundleDeal();
        this._referral();
    }

    /* ─── SOCIAL PROOF TICKER ─── */
    _socialProof() {
        const ticker = document.getElementById('proof-ticker');
        const msg    = document.getElementById('proof-msg');
        const closeBtn = document.getElementById('proof-close');
        if (!ticker || !msg) return;

        const proofs = [
            { city: 'Dubai',        product: 'Midnight Satin Slip Dress' },
            { city: 'London',       product: 'Linen Oversized Blazer' },
            { city: 'New York',     product: 'Sculpting Active Set' },
            { city: 'Paris',        product: 'Asymmetric Cutout Dress' },
            { city: 'Tokyo',        product: 'Archival Denim Jacket' },
            { city: 'Sydney',       product: 'Cropped Matte Puffer' },
            { city: 'Toronto',      product: 'Floral Chiffon Gown' },
            { city: 'Milan',        product: 'Silk Wrap Front Blouse' },
            { city: 'Los Angeles',  product: 'High Rise Sculpt Cargo' },
            { city: 'Seoul',        product: 'Sequin Party Mini Dress' },
            { city: 'Berlin',       product: 'Wide Leg Ribbed Set' },
            { city: 'Amsterdam',    product: 'Gold Link Chain Belt' },
        ];

        let idx = 0;

        const show = () => {
            const p = proofs[idx % proofs.length];
            msg.innerHTML = `Someone in <strong>${p.city}</strong> just bought <strong>${p.product}</strong>`;
            ticker.classList.add('show');
            idx++;
            setTimeout(() => ticker.classList.remove('show'), 4500);
        };

        closeBtn?.addEventListener('click', () => {
            ticker.classList.remove('show');
            clearInterval(this._proofIv);
        });

        // First show after 4s, then every 12s
        setTimeout(() => {
            show();
            this._proofIv = setInterval(show, 12000);
        }, 4000);
    }

    /* ─── SPIN TO WIN WHEEL ─── */
    _spinWheel() {
        const modal     = document.getElementById('spin-modal');
        const closeBtn  = document.getElementById('spin-close');
        const form      = document.getElementById('spin-form');
        const result    = document.getElementById('spin-result');
        const prizeEl   = document.getElementById('spin-result-prize');
        const codeEl    = document.getElementById('spin-code');
        const shopBtn   = document.getElementById('spin-result-btn');
        const nlTrigger = document.getElementById('nl-spin-trigger');
        const canvas    = document.getElementById('spin-canvas');
        if (!modal || !canvas) return;

        const prizes = [
            { label: '10% OFF',  code: 'NOVA10',  color: '#c9a84c' },
            { label: 'FREE SHIP', code: 'NOVASHIP', color: '#1a1a1a' },
            { label: '15% OFF',  code: 'NOVA15',  color: '#8B6914' },
            { label: '$5 OFF',   code: 'NOVA5',   color: '#1a1a1a' },
            { label: '20% OFF',  code: 'NOVA20',  color: '#c9a84c' },
            { label: 'TRY AGAIN',code: '',        color: '#111' },
            { label: '25% OFF',  code: 'NOVA25',  color: '#8B6914' },
            { label: '$10 OFF',  code: 'NOVA10D', color: '#1a1a1a' },
        ];

        // Draw wheel
        const ctx = canvas.getContext('2d');
        const cx = 150, cy = 150, r = 140;
        const arc = (2 * Math.PI) / prizes.length;
        let rotation = 0;

        const drawWheel = (rot) => {
            ctx.clearRect(0, 0, 300, 300);
            prizes.forEach((p, i) => {
                const start = rot + i * arc;
                const end   = start + arc;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, r, start, end);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(201,168,76,.3)';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Text
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(start + arc / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 11px DM Sans, sans-serif';
                ctx.fillText(p.label, r - 10, 4);
                ctx.restore();
            });
            // Center circle
            ctx.beginPath();
            ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
            ctx.fillStyle = '#080808';
            ctx.fill();
            ctx.strokeStyle = 'rgba(201,168,76,.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#c9a84c';
            ctx.font = 'bold 9px DM Sans';
            ctx.textAlign = 'center';
            ctx.fillText('NOVA', cx, cy + 3);
        };

        drawWheel(rotation);

        const open = () => {
            if (sessionStorage.getItem('nova_spin_shown')) return;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        const close = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        nlTrigger?.addEventListener('click', open);
        closeBtn?.addEventListener('click', close);
        modal?.addEventListener('click', e => { if (e.target === modal) close(); });
        shopBtn?.addEventListener('click', () => { close(); document.getElementById('shop')?.scrollIntoView({behavior:'smooth'}); });

        form?.addEventListener('submit', e => {
            e.preventDefault();
            const emailVal = form.querySelector('input[type=email]')?.value?.trim();
            sessionStorage.setItem('nova_spin_shown', '1');

            // Send to Mailchimp
            if (emailVal && NOVA_CONFIG.mailchimpUrl && !NOVA_CONFIG.mailchimpUrl.includes('YOUR_ACCOUNT')) {
                fetch(`${NOVA_CONFIG.mailchimpUrl}&EMAIL=${encodeURIComponent(emailVal)}&FNAME=&subscribe=Subscribe`,
                    { method:'POST', mode:'no-cors' }).catch(() => {});
            }

            // Pick a weighted random prize (20% off is rare)
            const weights = [3, 3, 2, 3, 1, 2, 1, 3];
            const total   = weights.reduce((a,b)=>a+b,0);
            let rnd = Math.random() * total, prizeIdx = 0;
            for (let i=0; i<weights.length; i++) { rnd -= weights[i]; if (rnd<=0){prizeIdx=i;break;} }

            // Spin animation
            const spinBtn = form.querySelector('.spin-submit');
            spinBtn.textContent = 'SPINNING…';
            spinBtn.disabled = true;

            const targetAngle = (2 * Math.PI * 5) + (2*Math.PI - prizeIdx * arc - arc/2);
            const duration = 4000;
            const startTime = performance.now();
            const startRot = rotation;

            const easeOut = t => 1 - Math.pow(1-t, 4);
            const animate = (now) => {
                const p = Math.min((now - startTime) / duration, 1);
                rotation = startRot + targetAngle * easeOut(p);
                drawWheel(rotation);
                if (p < 1) { requestAnimationFrame(animate); }
                else {
                    const prize = prizes[prizeIdx];
                    setTimeout(() => {
                        if (result) result.classList.remove('hidden');
                        if (prizeEl) prizeEl.textContent = prize.label;
                        if (codeEl)  codeEl.textContent  = prize.code || 'N/A';
                        navigator.clipboard?.writeText(prize.code).catch(()=>{});
                        if (prize.code) {
                            this.store.toast(`<i class="fa-solid fa-gift" style="color:var(--gold)"></i> You won <strong>${prize.label}</strong>! Code copied.`, 'success');
                        }
                    }, 400);
                }
            };
            requestAnimationFrame(animate);
        });

        // Auto-show after 25s on first visit
        if (!sessionStorage.getItem('nova_spin_shown')) {
            setTimeout(open, 25000);
        }
    }

    /* ─── STICKY ADD TO CART BAR ─── */
    _stickyBar() {
        const bar     = document.getElementById('sticky-bar');
        const imgEl   = document.getElementById('sticky-img');
        const nameEl  = document.getElementById('sticky-name');
        const priceEl = document.getElementById('sticky-price');
        const sizeEl  = document.getElementById('sticky-size');
        const addBtn  = document.getElementById('sticky-add-btn');
        if (!bar) return;

        let currentProduct = null;

        // Watch which product card is in view
        const cards = document.querySelectorAll('.item-card[data-id]');
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = parseInt(entry.target.dataset.id);
                    const p  = this.store.products.find(x => x.id === id);
                    if (!p || p === currentProduct) return;
                    currentProduct = p;
                    if (imgEl)   { imgEl.src = p.img1; imgEl.alt = p.name; }
                    if (nameEl)  nameEl.textContent  = p.name;
                    if (priceEl) priceEl.textContent = `$${p.price.toFixed(2)}`;
                    if (sizeEl) {
                        sizeEl.innerHTML = p.sizes.map(s => `<option>${s}</option>`).join('');
                    }
                }
            });
        }, { threshold: 0.5 });

        cards.forEach(c => io.observe(c));

        // Show bar only when shop section is scrolled past the fold
        const shopSection = document.getElementById('shop');
        const shopIO = new IntersectionObserver(([entry]) => {
            bar.classList.toggle('hidden', entry.isIntersecting || !currentProduct);
        }, { threshold: 0.1 });
        if (shopSection) shopIO.observe(shopSection);

        // Add to cart
        addBtn?.addEventListener('click', () => {
            if (!currentProduct) return;
            const size = sizeEl?.value || currentProduct.sizes[0];
            this.store.addToCart(currentProduct, size);
            addBtn.innerHTML = '<i class="fa-solid fa-check"></i> ADDED!';
            addBtn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
            setTimeout(() => {
                addBtn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> ADD TO BAG';
                addBtn.style.background = '';
            }, 2000);
        });
    }

    /* ─── BUNDLE & SAVE MODAL ─── */
    _bundleDeal() {
        const modal    = document.getElementById('bundle-modal');
        const closeBtn = document.getElementById('bundle-close');
        const container = document.getElementById('bundle-products');
        const saveEl   = document.getElementById('bundle-save-amt');
        const addBtn   = document.getElementById('bundle-add-btn');
        if (!modal) return;

        let selected = new Set();

        const open = (seedProductId) => {
            selected.clear();
            const products = this.store.products;
            const seed     = products.find(p => p.id === seedProductId) || products[0];
            // Show seed + 5 others
            const others = products.filter(p => p.id !== seed.id)
                .sort(() => Math.random() - 0.5).slice(0, 5);
            const shown  = [seed, ...others];

            selected.add(seed.id);

            if (container) {
                container.innerHTML = shown.map(p => `
                    <div class="bundle-product-card ${p.id === seed.id ? 'selected' : ''}" data-id="${p.id}" data-price="${p.price}">
                        <div class="bundle-prod-img">
                            <img src="${p.img1}" alt="${p.name}" loading="lazy" onerror="this.style.opacity='.1'">
                        </div>
                        <p class="bundle-prod-name">${p.name}</p>
                        <p class="bundle-prod-price">$${p.price.toFixed(2)}</p>
                    </div>`).join('');

                container.querySelectorAll('.bundle-product-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const id = parseInt(card.dataset.id);
                        if (selected.has(id)) { selected.delete(id); card.classList.remove('selected'); }
                        else                  { selected.add(id);    card.classList.add('selected'); }
                        updateSavings();
                    });
                });
            }

            updateSavings();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const close = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        const updateSavings = () => {
            if (!container) return;
            let total = 0;
            container.querySelectorAll('.bundle-product-card.selected').forEach(c => {
                total += parseFloat(c.dataset.price);
            });
            const saving = selected.size >= 2 ? total * 0.25 : 0;
            if (saveEl) saveEl.textContent = `$${saving.toFixed(2)}`;
            if (addBtn) addBtn.disabled = selected.size < 2;
        };

        closeBtn?.addEventListener('click', close);
        modal?.addEventListener('click', e => { if (e.target === modal) close(); });

        addBtn?.addEventListener('click', () => {
            if (selected.size < 2) return;
            selected.forEach(id => {
                const p = this.store.products.find(x => x.id === id);
                if (p) this.store.addToCart(p, p.sizes[0]);
            });
            this.store.toast(`<i class="fa-solid fa-bolt" style="color:var(--gold)"></i> Bundle added — <strong>25% saved!</strong>`, 'success');
            close();
        });

        // Expose open so product cards can call it
        window.openBundle = open;
    }

    /* ─── REFERRAL SECTION ─── */
    _referral() {
        const copyBtn = document.getElementById('ref-copy-btn');
        const linkEl  = document.getElementById('ref-link-val');
        if (!copyBtn || !linkEl) return;

        // Set real store URL if configured
        const baseUrl = (NOVA_CONFIG.storeUrl && !NOVA_CONFIG.storeUrl.includes('your-nova'))
            ? NOVA_CONFIG.storeUrl : 'nova-atelier.com';
        const refCode = 'STYLE' + Math.random().toString(36).substring(2,8).toUpperCase();
        const fullLink = `${baseUrl}?ref=${refCode}`;
        linkEl.textContent = fullLink;

        copyBtn.addEventListener('click', () => {
            navigator.clipboard?.writeText(fullLink).catch(() => {});
            const orig = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            copyBtn.style.background = '#22c55e';
            copyBtn.style.color = '#fff';
            this.store.toast('<i class="fa-solid fa-link" style="color:var(--gold)"></i> Referral link copied to clipboard!', 'success');
            setTimeout(() => {
                copyBtn.innerHTML = orig;
                copyBtn.style.background = '';
                copyBtn.style.color = '';
            }, 3000);
        });
    }
}

/* ── BOOT after store is ready ── */
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.novaApp) {
            window.novaConvert = new NovaConvert(window.novaApp);
        }
    }, 300);
});