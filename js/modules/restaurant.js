/**
 * CBMS - Restaurant Module
 * Implements PDF §6:
 * - Manages menu items, tables, orders, food & drink sales
 * - Room-service orders linked directly to Hotel guest folios
 * - Restaurant inventory and expenses rolling up into Hotel & Central Financials
 */

class RestaurantModule {
    constructor() {}

    render(container) {
        const tables = window.cbmsStore.data.restaurant.tables;
        const menu = window.cbmsStore.data.restaurant.menu;
        const fin = window.cbmsStore.getFinancialsByBusiness().restaurant;

        const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'bill_requested').length;
        const totalCovers = tables.reduce((acc, t) => acc + (t.status === 'occupied' ? t.guests : 0), 0);

        container.innerHTML = `
            <div class="module-header fade-in">
                <div>
                    <h1 class="page-title">Restaurant & Bar Operations</h1>
                    <p class="page-subtitle">Floor Management, Table Orders, Kitchen Tickets & Hotel Room Service (PDF §6)</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-primary" id="btnNewRestaurantOrder">
                        <i data-lucide="plus-circle"></i> New Table / Room Order
                    </button>
                    <button class="btn btn-outline" id="btnManageMenu">
                        <i data-lucide="book-open"></i> Menu Management
                    </button>
                </div>
            </div>

            <!-- Restaurant Financial & Service KPIs -->
            <div class="kpi-grid fade-in">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Restaurant Revenue</span>
                        <div class="kpi-icon-wrap icon-blue"><i data-lucide="utensils"></i></div>
                    </div>
                    <div class="kpi-value">€${fin.sales.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
                    <div class="kpi-meta"><span class="badge-success">PDF Benchmark €5,000</span></div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Kitchen & Bar Expenses</span>
                        <div class="kpi-icon-wrap icon-amber"><i data-lucide="receipt"></i></div>
                    </div>
                    <div class="kpi-value">€${fin.expenses.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
                    <div class="kpi-meta"><span class="badge-neutral">PDF Benchmark €1,000</span></div>
                </div>

                <div class="kpi-card highlight-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Restaurant Net Profit</span>
                        <div class="kpi-icon-wrap icon-emerald"><i data-lucide="wallet"></i></div>
                    </div>
                    <div class="kpi-value text-emerald">€${fin.netProfit.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
                    <div class="kpi-meta"><span class="badge-success">${fin.margin}% Margin</span></div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Current Covers Seated</span>
                        <div class="kpi-icon-wrap icon-purple"><i data-lucide="users"></i></div>
                    </div>
                    <div class="kpi-value">${totalCovers} Diners</div>
                    <div class="kpi-meta"><span class="badge-info">${occupiedTables} of ${tables.length} tables active</span></div>
                </div>
            </div>

            <!-- Interactive Dining Floor Plan -->
            <div class="card mt-4 fade-in">
                <div class="card-header">
                    <div class="card-title-group">
                        <h2 class="card-title">Dining Room Floor Plan & Table Status</h2>
                        <span class="card-hint">Click any table to view or add orders, charge to a Hotel room, or close bill</span>
                    </div>
                    <span class="badge badge-primary">Service Active</span>
                </div>

                <div class="restaurant-floor-grid">
                    ${tables.map(table => {
                        let statusClass = 'table-avail';
                        let statusText = 'Available';
                        if (table.status === 'occupied') {
                            statusClass = 'table-occ';
                            statusText = `Occupied (${table.guests}p)`;
                        } else if (table.status === 'bill_requested') {
                            statusClass = 'table-bill';
                            statusText = 'Bill Requested';
                        } else if (table.status === 'reserved') {
                            statusClass = 'table-res';
                            statusText = 'Reserved';
                        }

                        return `
                            <div class="floor-table-card ${statusClass}" data-table-id="${table.id}">
                                <div class="floor-table-top">
                                    <span class="table-num">Table ${table.number}</span>
                                    <span class="table-cap text-xs text-muted">${table.capacity} seats</span>
                                </div>
                                <div class="table-status-badge">${statusText}</div>

                                ${table.orderTotal > 0 ? `
                                    <div class="table-bill-info">
                                        <div class="table-amount">€${table.orderTotal.toFixed(2)}</div>
                                        <div class="table-items-count text-xs text-muted">${table.orderItems.length} items ordered</div>
                                        ${table.linkedRoom ? `<span class="badge badge-hotel text-xs">Room ${table.linkedRoom}</span>` : ''}
                                    </div>
                                ` : `
                                    <div class="table-bill-empty text-xs text-muted">Table clean & reset</div>
                                `}

                                <div class="table-actions-strip mt-2">
                                    <button class="btn btn-xs btn-outline btn-open-table" data-table-id="${table.id}">
                                        <i data-lucide="edit-3"></i> Manage
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Menu Catalog & Food Costs -->
            <div class="card mt-4 fade-in">
                <div class="card-header">
                    <div class="card-title-group">
                        <h3 class="card-title">Curated A La Carte & Bar Menu</h3>
                        <span class="card-hint">Menu item pricing, food preparation costs, and contribution margins</span>
                    </div>
                    <span class="badge badge-success">Kitchen Ready</span>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Item Code</th>
                                <th>Dish / Beverage</th>
                                <th>Category</th>
                                <th>Cost of Goods (Ingredients)</th>
                                <th>Menu Price</th>
                                <th>Gross Profit</th>
                                <th>Margin (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${menu.map(item => {
                                const gross = item.price - item.cost;
                                const marginPct = ((gross / item.price) * 100).toFixed(0);
                                return `
                                    <tr>
                                        <td><span class="badge-code">${item.id}</span></td>
                                        <td><strong>${item.name}</strong></td>
                                        <td><span class="badge badge-neutral">${item.category}</span></td>
                                        <td class="font-mono text-muted">€${item.cost.toFixed(2)}</td>
                                        <td class="font-mono font-medium">€${item.price.toFixed(2)}</td>
                                        <td class="font-mono text-emerald">€${gross.toFixed(2)}</td>
                                        <td><span class="badge-success">${marginPct}%</span></td>
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

    bindEvents(container) {
        // Table cards & manage buttons
        container.querySelectorAll('.floor-table-card, .btn-open-table').forEach(el => {
            el.addEventListener('click', (e) => {
                const tableId = el.dataset.tableId || el.closest('.floor-table-card')?.dataset.tableId;
                if (tableId) {
                    this.showTableOrderModal(tableId);
                }
            });
        });

        // Top New Order
        container.querySelector('#btnNewRestaurantOrder')?.addEventListener('click', () => {
            this.showTableOrderModal(1);
        });

        // Menu manage
        container.querySelector('#btnManageMenu')?.addEventListener('click', () => {
            window.cbmsApp.showToast('Kitchen recipe & menu manager loaded.', 'info');
        });
    }

    showTableOrderModal(tableId) {
        const table = window.cbmsStore.data.restaurant.tables.find(t => t.id === Number(tableId));
        if (!table) return;

        const menu = window.cbmsStore.data.restaurant.menu;
        const occupiedRooms = window.cbmsStore.data.hotel.rooms.filter(r => r.status === 'occupied');

        const modalHtml = `
            <div class="modal-backdrop fade-in" id="tableOrderModal">
                <div class="modal-card modal-lg">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Table ${table.number} Order & Billing</h3>
                            <p class="modal-subtitle">Capacity: ${table.capacity} guests | Current Status: ${table.status.toUpperCase()}</p>
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('tableOrderModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <!-- Current Order Summary -->
                        ${table.orderTotal > 0 ? `
                            <div class="active-table-ticket p-3 mb-3">
                                <strong>Active Order on Table:</strong>
                                <ul class="ticket-item-list mt-1">
                                    ${table.orderItems.map(i => `<li>${i}</li>`).join('')}
                                </ul>
                                <div class="ticket-total font-bold mt-2">Current Total: €${table.orderTotal.toFixed(2)}</div>
                                ${table.linkedRoom ? `<div class="badge badge-hotel mt-1">Charged to Hotel Room ${table.linkedRoom}</div>` : ''}
                            </div>
                        ` : ''}

                        <h4 class="text-sm font-bold mb-2">Add Items from Menu:</h4>
                        <div class="menu-selection-grid max-h-200 mb-3">
                            ${menu.map(item => `
                                <div class="menu-choice-row">
                                    <div class="choice-title">
                                        <strong>${item.name}</strong>
                                        <span class="text-xs text-muted">(€${item.price.toFixed(2)})</span>
                                    </div>
                                    <button class="btn btn-xs btn-outline btn-add-dish" data-name="${item.name}" data-price="${item.price}">
                                        + Add to Ticket
                                    </button>
                                </div>
                            `).join('')}
                        </div>

                        <div class="order-draft-box p-3 mb-3" id="orderDraftBox">
                            <strong>New Items to Send to Kitchen:</strong>
                            <div id="draftItemsList" class="text-xs text-muted mt-1">Click "+ Add to Ticket" above to select dishes</div>
                            <div class="draft-subtotal font-bold mt-2" id="draftSubtotal">Draft Subtotal: €0.00</div>
                        </div>

                        <!-- Hotel Cross-Module Room Charge Option (PDF §3 & §6) -->
                        <div class="form-group border-top pt-3">
                            <label class="form-label font-bold"><i data-lucide="hotel"></i> Billing Option / Hotel Cross-Module Link</label>
                            <select class="form-control" id="orderBillingTarget">
                                <option value="">Direct Payment at Table (Restaurant Revenue)</option>
                                ${occupiedRooms.map(r => `
                                    <option value="${r.number}">Charge to Hotel Room ${r.number} (${r.guest}) - Add to Guest Folio</option>
                                `).join('')}
                            </select>
                            <span class="text-xs text-muted">Select a guest room to bill food and drinks straight to their hotel accommodation folio.</span>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" onclick="document.getElementById('tableOrderModal').remove()">Cancel</button>
                        ${table.orderTotal > 0 ? `
                            <button type="button" class="btn btn-danger" id="btnCloseTableBill">
                                <i data-lucide="check"></i> Settle Bill & Free Table
                            </button>
                        ` : ''}
                        <button type="button" class="btn btn-primary" id="btnSubmitTableOrder">
                            <i data-lucide="send"></i> Dispatch Order to Kitchen
                        </button>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('tableOrderModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) window.lucide.createIcons();

        // Draft items local state
        const draftItems = [];

        document.querySelectorAll('.btn-add-dish').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                const price = parseFloat(btn.dataset.price);
                draftItems.push({ name, price, quantity: 1 });

                // Render draft
                const listEl = document.getElementById('draftItemsList');
                listEl.innerHTML = draftItems.map((item, idx) => `
                    <div class="draft-row">
                        <span>${item.name} - €${item.price.toFixed(2)}</span>
                    </div>
                `).join('');

                const sum = draftItems.reduce((acc, i) => acc + i.price, 0);
                document.getElementById('draftSubtotal').textContent = `Draft Subtotal: €${sum.toFixed(2)}`;
            });
        });

        // Submit order
        document.getElementById('btnSubmitTableOrder')?.addEventListener('click', () => {
            if (draftItems.length === 0) {
                window.cbmsApp.showToast('Please add at least one menu item before dispatching.', 'warning');
                return;
            }

            const roomTarget = document.getElementById('orderBillingTarget').value || null;
            try {
                window.cbmsStore.processRestaurantOrder(table.id, draftItems, roomTarget);
                document.getElementById('tableOrderModal').remove();
                if (roomTarget) {
                    window.cbmsApp.showToast(`Order sent to kitchen & billed to Hotel Room ${roomTarget}!`, 'success');
                } else {
                    window.cbmsApp.showToast(`Order dispatched to kitchen for Table ${table.number}!`, 'success');
                }
                this.render(document.getElementById('moduleContainer'));
            } catch (err) {
                window.cbmsApp.showToast(err.message, 'error');
            }
        });

        // Settle & Free Table
        document.getElementById('btnCloseTableBill')?.addEventListener('click', () => {
            table.status = 'available';
            table.orderTotal = 0;
            table.orderItems = [];
            table.linkedRoom = null;
            window.cbmsStore.saveData();
            document.getElementById('tableOrderModal').remove();
            window.cbmsApp.showToast(`Table ${table.number} bill settled and table reset to available.`, 'success');
            this.render(document.getElementById('moduleContainer'));
        });
    }
}

window.cbmsRestaurantModule = new RestaurantModule();
