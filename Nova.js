class NovaStore {
    constructor() {
        this.products  = [];
        this.wishlist  = JSON.parse(localStorage.getItem('nova_wishlist')) || [];
        this.cart      = JSON.parse(localStorage.getItem('nova_cart'))     || [];
        this.totalValue = 0;

        // Pending size selection
        this._pendingProductId  = null;
        this._pendingBtnElement = null;
        this._selectedSize      = null;

        this._boot();
    }

    /* â”€â”€â”€ BOOT SEQUENCE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    _boot() {
        this._setupPageLoader();
        this._setupCursor();
        this._setupScrollEffects();
        this._setupCartToggle();
        this._setupSearch();
        this._setupSizeModal();
        this._setupMobileNav();
        this._setupContinueShopping();
        this.renderSavedCart();
        this.init();
    }

 _handleCursorThemes() {
    const darkSections = document.querySelectorAll('.editorial-break, footer, .black-bg');
    const cursor = document.getElementById('cursor-ring');

    if (!cursor) return; // Safety check

    darkSections.forEach(section => {
        section.addEventListener('mouseenter', () => cursor.classList.add('on-dark'));
        section.addEventListener('mouseleave', () => cursor.classList.remove('on-dark'));
    });
}

    /* â”€â”€â”€ PAGE LOADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    _setupPageLoader() {
        const loader = document.getElementById('page-loader');
        if (!loader) return;
        // Hide loader after animation + small grace period
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.style.overflow = '';
        }, 2000);
        document.body.style.overflow = 'hidden';
    }

    /* â”€â”€â”€ DATA INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    async init() {
        const grid = document.getElementById('product-grid');
        if (grid) {
            // 8 skeleton cards while fetching
            grid.innerHTML = Array(8).fill(
                '<div class="skeleton-card"></div>'
            ).join('');
        }

        try {
            const res = await fetch('Nova.json');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            this.products = data.products || data;

            await new Promise(r => setTimeout(r, 600)); // feel real
            this.render(this.products);
            this.setupFilters();
            this._startStatsCounter();
        } catch (err) {
            if (grid) {
                grid.innerHTML = `
                    <div style="grid-column:1/-1; text-align:center; padding:80px 20px; color:var(--fn-gray);">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size:32px; margin-bottom:16px; display:block;"></i>
                        <p style="font-size:14px;">Collection temporarily unavailable. Please refresh.</p>
                    </div>`;
            }
            console.error('[Nova] Fetch error:', err);
        }
    }

    /* â”€â”€â”€ RENDER ENGINE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    render(items) {
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        const countEl = document.getElementById('product-count');
        if (countEl) countEl.textContent = `${items.length} items`;

        if (items.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:80px 20px; color:var(--fn-gray);">
                    <i class="fa-regular fa-face-meh" style="font-size:32px; margin-bottom:16px; display:block;"></i>
                    <p style="font-size:14px;">No items found in this category.</p>
                </div>`;
            return;
        }

        grid.innerHTML = items.map(p => this._cardHTML(p)).join('');
        this._startRevealObserver();
    }

    _cardHTML(p) {
        const isWished   = this.wishlist.includes(p.id);
        const lowStock   = p.stockLevel > 0 && p.stockLevel < 5
            ? `<p class="stock-warning">ONLY ${p.stockLevel} LEFT</p>`
            : '';
        const oldPrice   = p.oldPrice
            ? `<span class="price-old">$${p.oldPrice.toFixed(2)}</span>`
            : '';
        const swatches   = (p.colors || []).map(c =>
            `<div class="swatch" style="background:${c}" title="${c}"></div>`
        ).join('');

        return `
        <div class="item-card" data-id="${p.id}">
            <div class="img-host">
                ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
                <button class="wish-btn${isWished ? ' wished' : ''}"
                        onclick="novaApp.toggleWishlist(${p.id}, this)"
                        title="${isWished ? 'Remove from wishlist' : 'Add to wishlist'}">
                    <i class="fa-${isWished ? 'solid' : 'regular'} fa-heart"></i>
                </button>
                <img src="${p.img1}" class="main-img" alt="${p.name}" loading="lazy">
                <img src="${p.img2}" class="hover-img" alt="${p.name}" loading="lazy">
                <button class="mobile-add-btn"
                        onclick="novaApp.openSizeModal(${p.id}, this)">
                    <i class="fa-solid fa-plus"></i>
                </button>
                <div class="quick-add-bar"
                     onclick="novaApp.openSizeModal(${p.id}, this)">
                    SELECT SIZE
                </div>
            </div>
            <div class="item-meta">
                <div class="meta-top">
                    <span class="brand-tag">${p.brand || 'NOVA'}</span>
                    <span class="price-now">$${p.price.toFixed(2)}</span>
                </div>
                <span class="item-name">${p.name}</span>
                <div class="price-row">${oldPrice}</div>
                ${lowStock}
                <div class="swatch-group">${swatches}</div>
            </div>
        </div>`;
    }

    /* â”€â”€â”€ FILTERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    setupFilters() {
        document.querySelectorAll('.pill[data-category]').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.pill[data-category]').forEach(p =>
                    p.classList.remove('active')
                );
                pill.classList.add('active');
                const cat = pill.dataset.category;
                const list = cat === 'all'
                    ? this.products
                    : this.products.filter(p => p.category === cat);
                this.render(list);
            });
        });
    }

    /* â”€â”€â”€ SIZE MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    _setupSizeModal() {
        const modal  = document.getElementById('size-modal');
        const close  = document.getElementById('size-modal-close');
        const confirm = document.getElementById('size-confirm');

        if (!modal) return;

        close.addEventListener('click', () => this._closeSizeModal());
        modal.addEventListener('click', e => {
            if (e.target === modal) this._closeSizeModal();
        });
        confirm.addEventListener('click', () => this._confirmSize());
    }

    openSizeModal(id, btnEl) {
        const product = this.products.find(p => p.id == id);
        if (!product) return;

        this._pendingProductId  = id;
        this._pendingBtnElement = btnEl;
        this._selectedSize      = null;

        const modal     = document.getElementById('size-modal');
        const nameEl    = document.getElementById('modal-name');
        const brandEl   = document.getElementById('modal-brand');
        const sizeGrid  = document.getElementById('size-grid');
        const confirmBtn = document.getElementById('size-confirm');

        nameEl.textContent  = product.name;
        brandEl.textContent = product.brand || 'NOVA';
        confirmBtn.textContent = 'SELECT A SIZE';
        confirmBtn.disabled = true;

        const sizes = product.sizes || ['XS', 'S', 'M', 'L', 'XL'];
        sizeGrid.innerHTML = sizes.map(s => `
            <button class="size-option${s === 'SOLD OUT' ? ' sold-out' : ''}"
                    data-size="${s}"
                    ${s === 'SOLD OUT' ? 'disabled' : ''}
                    onclick="novaApp._selectSize('${s}', this)">
                ${s}
            </button>
        `).join('');

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    _selectSize(size, el) {
        document.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
        el.classList.add('selected');
        this._selectedSize = size;
        const confirmBtn = document.getElementById('size-confirm');
        confirmBtn.textContent = 'ADD TO BAG';
        confirmBtn.disabled = false;
    }

    _confirmSize() {
        if (!this._selectedSize) return;
        // Capture values BEFORE closing modal (which nulls them out)
        const id   = this._pendingProductId;
        const btn  = this._pendingBtnElement;
        const size = this._selectedSize;
        this._closeSizeModal();
        this.addToCart(id, btn, size);
    }

    _closeSizeModal() {
        const modal = document.getElementById('size-modal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
        this._pendingProductId  = null;
        this._pendingBtnElement = null;
        this._selectedSize      = null;
    }

    /* â”€â”€â”€ CART LOGIC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    addToCart(id, btnEl, size = 'M') {
        const product = this.products.find(p => p.id == id);
        if (!product) return;

        const doAdd = () => {
            const cartKey = `${id}-${size}`;
            const existing = this.cart.find(i => i.cartKey === cartKey);
            if (existing) {
                existing.quantity += 1;
            } else {
                this.cart.push({ ...product, quantity: 1, size, cartKey });
            }
            this._saveCart();
            this.renderSavedCart();
            this.showToast(
                `<i class="fa-solid fa-bag-shopping"></i> "${product.name}" added to bag`,
                'cart'
            );
            setTimeout(() => this.openCart(), 300);
        };

        // Animate button if a real DOM element was passed
        if (btnEl && btnEl.classList) {
            const original = btnEl.innerHTML;
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
                    btnEl.innerHTML = original;
                    if (btnEl.tagName === 'BUTTON') btnEl.disabled = false;
                }, 1200);
            }, 500);
        } else {
            // No button reference (called from size modal confirm) — add immediately
            doAdd();
        }
    }

    updateQuantity(cartKey, change) {
        const item = this.cart.find(i => i.cartKey === cartKey);
        if (!item) return;
        item.quantity += change;
        if (item.quantity <= 0) {
            this.cart = this.cart.filter(i => i.cartKey !== cartKey);
        }
        this._saveCart();
        this.renderSavedCart();
    }

    removeFromCart(cartKey) {
        this.cart = this.cart.filter(i => i.cartKey !== cartKey);
        this._saveCart();
        this.renderSavedCart();
    }

    _saveCart() {
        localStorage.setItem('nova_cart', JSON.stringify(this.cart));
    }

    renderSavedCart() {
        const container  = document.getElementById('cart-items-container');
        const drawerCount = document.getElementById('cart-count-drawer');
        if (!container) return;

        const totalItems = this.cart.reduce((s, i) => s + i.quantity, 0);
        if (drawerCount) drawerCount.textContent = totalItems;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <i class="fa-regular fa-bag-shopping"></i>
                    <p>Your bag is empty.<br><span style="font-size:12px;opacity:0.6">Add something beautiful.</span></p>
                </div>`;
        } else {
            container.innerHTML = this.cart.map(item => `
                <div class="cart-item-row">
                    <img src="${item.img1}" class="cart-item-img" alt="${item.name}" loading="lazy">
                    <div class="cart-item-info">
                        <p class="cart-item-name">${item.name}</p>
                        <p class="cart-item-size">SIZE: ${item.size || 'M'}</p>
                        <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="novaApp.updateQuantity('${item.cartKey}', -1)">âˆ’</button>
                            <span class="qty-number">${item.quantity}</span>
                            <button class="qty-btn" onclick="novaApp.updateQuantity('${item.cartKey}', 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" onclick="novaApp.removeFromCart('${item.cartKey}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `).join('');
        }

        this._refreshCartTotals();
    }

    _refreshCartTotals() {
        this.totalValue = this.cart.reduce((s, i) => s + i.price * i.quantity, 0);
        const totalItems = this.cart.reduce((s, i) => s + i.quantity, 0);

        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = totalItems;
            el.classList.toggle('visible', totalItems > 0);
        });

        const totalEl = document.getElementById('cart-total-val');
        if (totalEl) totalEl.textContent = `$${this.totalValue.toFixed(2)}`;
    }

    openCart() {
        const drawer  = document.getElementById('cart-drawer');
        const overlay = document.getElementById('cart-overlay');
        drawer?.classList.add('open');
        overlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        const drawer  = document.getElementById('cart-drawer');
        const overlay = document.getElementById('cart-overlay');
        drawer?.classList.remove('open');
        overlay?.classList.remove('open');
        document.body.style.overflow = '';
    }

    setupCartToggle() {
        // Handled in _setupCartToggle
    }

    _setupCartToggle() {
        document.getElementById('cart-bag')?.addEventListener('click', () => this.openCart());
        document.getElementById('cart-close')?.addEventListener('click', () => this.closeCart());
        document.getElementById('cart-overlay')?.addEventListener('click', () => this.closeCart());
    }

    _setupContinueShopping() {
        document.getElementById('continue-shopping')?.addEventListener('click', () => {
            this.closeCart();
        });
    }

    /* â”€â”€â”€ WISHLIST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    toggleWishlist(id, btn) {
        const idx = this.wishlist.indexOf(id);
        const product = this.products.find(p => p.id == id);
        if (idx === -1) {
            this.wishlist.push(id);
            btn.classList.add('wished');
            btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
            this.showToast(
                `<i class="fa-solid fa-heart" style="color:#ec4899"></i> Saved to wishlist`,
                'wish'
            );
        } else {
            this.wishlist.splice(idx, 1);
            btn.classList.remove('wished');
            btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
            this.showToast(
                `<i class="fa-regular fa-heart"></i> Removed from wishlist`,
                'default'
            );
        }
        localStorage.setItem('nova_wishlist', JSON.stringify(this.wishlist));
    }

    /* â”€â”€â”€ TOAST SYSTEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    showToast(html, type = 'default') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast${type === 'success' ? ' toast-success' : type === 'wish' ? ' toast-wish' : ''}`;
        toast.innerHTML = html;
        container.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('show'));
        });

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, 3200);
    }

    /* â”€â”€â”€ SEARCH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    _setupSearch() {
        const overlay  = document.getElementById('search-overlay');
        const input    = document.getElementById('search-input');
        const close    = document.getElementById('search-close');
        const trigger  = document.getElementById('search-trigger');
        const results  = document.getElementById('search-results');

        if (!overlay) return;

        const open = () => {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => input?.focus(), 300);
        };

        const closeSearch = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            if (input) input.value = '';
            if (results) results.innerHTML = '';
        };

        trigger?.addEventListener('click', open);
        close?.addEventListener('click', closeSearch);

        overlay?.addEventListener('click', e => {
            if (e.target === overlay) closeSearch();
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeSearch();
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                open();
            }
        });

        let debounceTimer;
        input?.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => this._runSearch(input.value, results), 200);
        });
    }

    _runSearch(query, resultsEl) {
        if (!resultsEl) return;
        const q = query.trim().toLowerCase();

        if (q.length < 2) {
            resultsEl.innerHTML = '';
            return;
        }

        const matches = this.products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.brand  || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q)
        ).slice(0, 6);

        if (matches.length === 0) {
            resultsEl.innerHTML = `
                <div class="search-no-results">
                    No results for "<strong>${query}</strong>"
                </div>`;
            return;
        }

        resultsEl.innerHTML = matches.map(p => `
            <div class="search-result-item" onclick="novaApp._onSearchClick(${p.id})">
                <img src="${p.img1}" alt="${p.name}" loading="lazy">
                <div class="search-result-info">
                    <p>${p.name}</p>
                    <span>$${p.price.toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    }

    _onSearchClick(id) {
        // Close search, scroll to shop, open size modal
        const overlay = document.getElementById('search-overlay');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('search-input').value = '';
        document.getElementById('search-results').innerHTML = '';

        setTimeout(() => {
            const el = document.querySelector(`[data-id="${id}"]`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.style.outline = '2px solid var(--fn-red)';
                setTimeout(() => { el.style.outline = ''; }, 1800);
            }
        }, 400);
    }

    /* â”€â”€â”€ MOBILE NAV â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    _setupMobileNav() {
        const toggle  = document.getElementById('menu-toggle');
        const nav     = document.getElementById('mobile-nav');
        const overlay = document.getElementById('mobile-nav-overlay');
        const close   = document.getElementById('mobile-nav-close');

        const openNav = () => {
            nav?.classList.add('open');
            overlay?.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeNav = () => {
            nav?.classList.remove('open');
            overlay?.classList.remove('active');
            document.body.style.overflow = '';
        };

        toggle?.addEventListener('click', openNav);
        close?.addEventListener('click',  closeNav);
        overlay?.addEventListener('click', closeNav);

        // Mobile nav links filter + scroll to shop
        document.querySelectorAll('.mobile-nav-links a').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const cat = link.dataset.cat;
                closeNav();
                setTimeout(() => {
                    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                    if (cat) {
                        const pill = document.querySelector(`.pill[data-category="${cat}"]`);
                        pill?.click();
                    }
                }, 400);
            });
        });
    }

    /* â”€â”€â”€ SCROLL EFFECTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    _setupScrollEffects() {
        const header   = document.getElementById('main-header');
        const scrollBar = document.getElementById('scroll-bar');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 60) {
                header?.classList.add('scrolled');
            } else {
                header?.classList.remove('scrolled');
            }

            if (scrollBar) {
                const max = document.body.scrollHeight - window.innerHeight;
                scrollBar.style.width = `${(window.scrollY / max) * 100}%`;
            }
        }, { passive: true });
    }

    /* â”€â”€â”€ REVEAL ON SCROLL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    _startRevealObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Stagger each card
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, i * 60);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        document.querySelectorAll('.item-card').forEach(card => observer.observe(card));
    }

    /* â”€â”€â”€ ANIMATED STATS COUNTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    _startStatsCounter() {
        const nums = document.querySelectorAll('.stat-num[data-target]');
        if (!nums.length) return;

        const ease = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                const el     = entry.target;
                const target = parseInt(el.dataset.target);
                const dur    = 1800;
                const start  = performance.now();

                const tick = (now) => {
                    const p = Math.min((now - start) / dur, 1);
                    const v = Math.round(ease(p) * target);
                    el.textContent = v.toLocaleString();
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            });
        }, { threshold: 0.3 });

        nums.forEach(el => observer.observe(el));
    }

    /* â”€â”€â”€ CUSTOM CURSOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    _setupCursor() {
        const ring = document.getElementById('cursor-ring');
        const dot  = document.getElementById('cursor-dot');
        if (!ring || !dot) return;

        let mx = 0, my = 0, rx = 0, ry = 0;
        let raf;

        window.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
        }, { passive: true });

        const animate = () => {
            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
            raf = requestAnimationFrame(animate);
        };
        animate();

        document.addEventListener('mouseover', e => {
            const t = e.target;
            if (t.tagName === 'BUTTON' || t.tagName === 'A' ||
                t.classList.contains('pill') || t.classList.contains('quick-add-bar') ||
                t.classList.contains('size-option') || t.classList.contains('camp-box') ||
                t.closest('button') || t.closest('a')) {
                document.body.classList.add('cursor-hover');
            }
        });

        document.addEventListener('mouseout', () => {
            document.body.classList.remove('cursor-hover');
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(raf);
            else animate();
        });
    }

    /* â”€â”€â”€ NEWSLETTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

    handleNewsletter(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const input = e.target.querySelector('input');
        const original = btn.textContent;
        btn.textContent = 'âœ“ Subscribed';
        btn.style.background = '#22c55e';
        btn.style.borderColor = '#22c55e';
        input.value = '';
        this.showToast(
            '<i class="fa-solid fa-circle-check"></i> Welcome to the Atelier',
            'success'
        );
        setTimeout(() => {
            btn.textContent = original;
            btn.style.background = '';
            btn.style.borderColor = '';
        }, 3000);
    }
}

/* â”€â”€â”€ GLOBAL INSTANCE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const novaApp = new NovaStore();
window.novaApp = novaApp;