/**
 * CBMS - Shop Module
 * Implements PDF §5:
 * - Tracks products purchased and sold, purchase price, selling price, suppliers, stock levels, sales & expenses
 * - Automatically calculates Cost of Goods Sold (COGS), Gross Profit, and Net Profit
 * - Interactive POS terminal with live shopping cart and stock decrement
 */

class ShopModule {
    constructor() {
        this.cart = [];
    }

    render(container) {
        const products = window.cbmsStore.data.shop.products;
        const suppliers = window.cbmsStore.data.shop.suppliers;
        const fin = window.cbmsStore.getFinancialsByBusiness().shop;

        const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
        const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

        container.innerHTML = `
            <div class="module-header fade-in">
                <div>
                    <h1 class="page-title">Retail Shop & Inventory</h1>
                    <p class="page-subtitle">Point of Sale (POS), Product Catalog, Suppliers & Automated COGS Analytics (PDF §5)</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-outline" id="btnOpenAddProduct">
                        <i data-lucide="plus-circle"></i> Add Product
                    </button>
                    <button class="btn btn-primary" id="btnOpenSuppliers">
                        <i data-lucide="truck"></i> Manage Suppliers
                    </button>
                </div>
            </div>

            <!-- Shop Financial & Stock KPIs -->
            <div class="kpi-grid fade-in">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Shop Revenue</span>
                        <div class="kpi-icon-wrap icon-blue"><i data-lucide="shopping-cart"></i></div>
                    </div>
                    <div class="kpi-value">€${fin.sales.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
                    <div class="kpi-meta"><span class="badge-success">PDF Benchmark €8,500</span></div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Shop Expenses & COGS</span>
                        <div class="kpi-icon-wrap icon-amber"><i data-lucide="layers"></i></div>
                    </div>
                    <div class="kpi-value">€${fin.expenses.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
                    <div class="kpi-meta"><span class="badge-neutral">Wholesale cost + POS fees</span></div>
                </div>

                <div class="kpi-card highlight-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Shop Net Profit</span>
                        <div class="kpi-icon-wrap icon-emerald"><i data-lucide="wallet"></i></div>
                    </div>
                    <div class="kpi-value text-emerald">€${fin.netProfit.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
                    <div class="kpi-meta"><span class="badge-success">${fin.margin}% Margin</span></div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Total Inventory Units</span>
                        <div class="kpi-icon-wrap icon-purple"><i data-lucide="box"></i></div>
                    </div>
                    <div class="kpi-value">${totalStockUnits} Units</div>
                    <div class="kpi-meta">
                        ${lowStockCount > 0 ? `<span class="badge-danger">${lowStockCount} items low</span>` : '<span class="badge-success">Healthy stock</span>'}
                    </div>
                </div>
            </div>

            <!-- POS & Product Catalog Layout -->
            <div class="shop-pos-layout mt-4 fade-in">
                <!-- Left: Interactive POS Product Grid -->
                <div class="pos-catalog-column">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title-group">
                                <h3 class="card-title">Point of Sale (POS) Terminal</h3>
                                <span class="card-hint">Click items to add to the checkout basket</span>
                            </div>
                            <input type="text" id="posSearchInput" class="form-control form-control-sm" placeholder="Search product..." style="width: 200px;" />
                        </div>

                        <div class="pos-products-grid" id="posProductsGrid">
                            ${products.map(p => {
                                const isLow = p.stock <= p.minStock;
                                return `
                                    <div class="pos-item-card" data-product-id="${p.id}">
                                        <div class="pos-item-top">
                                            <span class="badge badge-neutral text-xs">${p.category}</span>
                                            <span class="pos-item-stock ${isLow ? 'text-danger font-bold' : 'text-muted'}">${p.stock} in stock</span>
                                        </div>
                                        <div class="pos-item-name">${p.name}</div>
                                        <div class="pos-item-bottom">
                                            <span class="pos-item-price">€${p.sellingPrice.toFixed(2)}</span>
                                            <button class="btn btn-xs btn-primary btn-add-to-cart" data-product-id="${p.id}">
                                                <i data-lucide="plus"></i> Add
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Right: Active Cart & Register -->
                <div class="pos-cart-column">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i data-lucide="shopping-bag"></i> Checkout Basket</h3>
                            <button class="btn btn-xs btn-outline" id="btnClearCart">Clear</button>
                        </div>

                        <div class="pos-cart-items" id="posCartItemsList">
                            ${this.renderCartItems()}
                        </div>

                        <div class="pos-cart-footer">
                            <div class="pos-cart-totals">
                                <div class="cart-total-row">
                                    <span>Subtotal:</span>
                                    <span id="cartSubtotal">€${this.getCartTotal().toFixed(2)}</span>
                                </div>
                                <div class="cart-total-row">
                                    <span>VAT (included 19%):</span>
                                    <span id="cartTax">€${(this.getCartTotal() * 0.19 / 1.19).toFixed(2)}</span>
                                </div>
                                <hr />
                                <div class="cart-total-row font-bold text-lg">
                                    <span>Grand Total:</span>
                                    <span class="text-emerald" id="cartGrandTotal">€${this.getCartTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <div class="pos-checkout-actions mt-3">
                                <button class="btn btn-primary btn-block btn-lg" id="btnCheckoutCash">
                                    <i data-lucide="banknote"></i> Pay Cash & Complete
                                </button>
                                <button class="btn btn-outline btn-block mt-2" id="btnCheckoutCard">
                                    <i data-lucide="credit-card"></i> Pay Credit Card
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detailed Stock & COGS Analytics Table -->
            <div class="card mt-4 fade-in">
                <div class="card-header">
                    <div class="card-title-group">
                        <h3 class="card-title">Inventory, Purchase Cost & Profit Margin Analysis</h3>
                        <span class="card-hint">Calculates Cost of Goods Sold (COGS) vs Retail Margin (PDF §5)</span>
                    </div>
                    <span class="badge badge-success">Live Profit Matrix</span>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Barcode</th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Supplier</th>
                                <th>Cost (COGS)</th>
                                <th>Retail Price</th>
                                <th>Gross Margin</th>
                                <th>Stock Level</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(p => {
                                const marginPct = (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(1);
                                const isLow = p.stock <= p.minStock;
                                return `
                                    <tr>
                                        <td><span class="badge-code">${p.barcode}</span></td>
                                        <td><strong>${p.name}</strong></td>
                                        <td><span class="badge badge-neutral">${p.category}</span></td>
                                        <td class="text-xs text-muted">${p.supplier}</td>
                                        <td class="font-mono text-muted">€${p.purchasePrice.toFixed(2)}</td>
                                        <td class="font-mono font-medium">€${p.sellingPrice.toFixed(2)}</td>
                                        <td><span class="badge-success">+${marginPct}%</span></td>
                                        <td class="font-bold">${p.stock}</td>
                                        <td>
                                            ${isLow ? '<span class="badge badge-danger">Low Stock Alert</span>' : '<span class="badge badge-success">In Stock</span>'}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.bindEvents(container);
        if (window.lucide) window.lucide.createIcons();
    }

    renderCartItems() {
        if (this.cart.length === 0) {
            return `
                <div class="cart-empty text-center text-muted p-4">
                    <i data-lucide="shopping-cart" style="width: 36px; height: 36px; margin: 0 auto 8px; opacity: 0.4;"></i>
                    <p class="text-xs">No items in checkout basket.<br/>Click products on the left to add.</p>
                </div>
            `;
        }

        return this.cart.map(item => `
            <div class="cart-item-row">
                <div class="cart-item-desc">
                    <strong>${item.name}</strong>
                    <div class="text-xs text-muted">€${item.sellingPrice.toFixed(2)} each</div>
                </div>
                <div class="cart-item-stepper">
                    <button class="stepper-btn btn-cart-dec" data-id="${item.id}">-</button>
                    <span class="cart-qty">${item.quantity}</span>
                    <button class="stepper-btn btn-cart-inc" data-id="${item.id}">+</button>
                </div>
                <div class="cart-item-total font-mono font-bold">
                    €${(item.sellingPrice * item.quantity).toFixed(2)}
                </div>
            </div>
        `).join('');
    }

    getCartTotal() {
        return this.cart.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
    }

    bindEvents(container) {
        // Add to cart buttons
        container.querySelectorAll('.btn-add-to-cart, .pos-item-card').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.btn-add-to-cart') || el.classList.contains('pos-item-card')) {
                    const id = el.dataset.productId || el.querySelector('.btn-add-to-cart')?.dataset.productId;
                    this.addToCart(id);
                }
            });
        });

        // Cart stepper buttons
        container.querySelectorAll('.btn-cart-inc').forEach(btn => {
            btn.addEventListener('click', () => {
                this.updateCartQty(btn.dataset.id, 1);
            });
        });

        container.querySelectorAll('.btn-cart-dec').forEach(btn => {
            btn.addEventListener('click', () => {
                this.updateCartQty(btn.dataset.id, -1);
            });
        });

        // Clear cart
        container.querySelector('#btnClearCart')?.addEventListener('click', () => {
            this.cart = [];
            this.render(container);
        });

        // Search in POS catalog
        const search = container.querySelector('#posSearchInput');
        if (search) {
            search.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase();
                container.querySelectorAll('.pos-item-card').forEach(card => {
                    const text = card.textContent.toLowerCase();
                    card.style.display = text.includes(q) ? '' : 'none';
                });
            });
        }

        // Checkout actions
        container.querySelector('#btnCheckoutCash')?.addEventListener('click', () => this.checkout('Cash'));
        container.querySelector('#btnCheckoutCard')?.addEventListener('click', () => this.checkout('Credit Card'));

        // Add Product button
        container.querySelector('#btnOpenAddProduct')?.addEventListener('click', () => {
            window.cbmsApp.showToast('Product catalog editor opened.', 'info');
        });

        // Suppliers button
        container.querySelector('#btnOpenSuppliers')?.addEventListener('click', () => {
            this.showSuppliersModal();
        });
    }

    addToCart(productId) {
        const product = window.cbmsStore.data.shop.products.find(p => p.id === productId);
        if (!product) return;

        if (product.stock <= 0) {
            window.cbmsApp.showToast(`Product ${product.name} is currently out of stock!`, 'error');
            return;
        }

        const existing = this.cart.find(i => i.id === productId);
        if (existing) {
            if (existing.quantity >= product.stock) {
                window.cbmsApp.showToast(`Cannot add more than available stock (${product.stock})`, 'warning');
                return;
            }
            existing.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        this.render(document.getElementById('moduleContainer'));
    }

    updateCartQty(productId, delta) {
        const item = this.cart.find(i => i.id === productId);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            this.cart = this.cart.filter(i => i.id !== productId);
        }
        this.render(document.getElementById('moduleContainer'));
    }

    checkout(method) {
        if (this.cart.length === 0) {
            window.cbmsApp.showToast('Basket is empty. Select products first.', 'warning');
            return;
        }

        try {
            const res = window.cbmsStore.processShopSale(this.cart, method);
            const total = res.totalRevenue;
            this.cart = [];
            window.cbmsApp.showToast(`Completed sale of €${total.toFixed(2)} via ${method}! Profit: €${res.grossProfit.toFixed(2)}`, 'success');
            this.render(document.getElementById('moduleContainer'));
        } catch (err) {
            window.cbmsApp.showToast(err.message, 'error');
        }
    }

    showSuppliersModal() {
        const suppliers = window.cbmsStore.data.shop.suppliers;

        const modalHtml = `
            <div class="modal-backdrop fade-in" id="suppliersModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Retail Suppliers Directory</h3>
                            <p class="modal-subtitle">Authorized wholesale distribution partners</p>
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('suppliersModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Supplier Name</th>
                                        <th>Contact Email</th>
                                        <th>Delivery Lead Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${suppliers.map(s => `
                                        <tr>
                                            <td><span class="badge-code">${s.id}</span></td>
                                            <td><strong>${s.name}</strong></td>
                                            <td class="text-xs">${s.contact}</td>
                                            <td><span class="badge badge-info">${s.leadDays} business days</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('suppliersModal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('suppliersModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

window.cbmsShopModule = new ShopModule();
