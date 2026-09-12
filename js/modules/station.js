/**
 * CBMS - Petrol Station Module
 * Implements PDF §4:
 * - Tracks petrol and diesel sales, liters sold
 * - Oil & lubricant purchases, oil sales, oil inventory and station expenses
 * - Internal oil usage: manager records internal usage (e.g. 10 liters for company vehicle) ->
 *   decreases oil inventory, records value as petrol-station expense, visible to Director with full audit history.
 */

class StationModule {
    constructor() {}

    render(container) {
        const tanks = window.cbmsStore.data.station.tanks;
        const lubricants = window.cbmsStore.data.station.lubricants;
        const recentUsage = window.cbmsStore.data.station.recentUsage;
        const fin = window.cbmsStore.getFinancialsByBusiness().station;

        container.innerHTML = `
            <div class="module-header fade-in">
                <div>
                    <h1 class="page-title">Petrol Station Operations</h1>
                    <p class="page-subtitle">Fuel Meters, Lubricant Inventory, Internal Consumption & Station Expenses (PDF §4)</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-warning" id="btnRecordInternalUsage">
                        <i data-lucide="droplet"></i> Record Internal Oil Usage (Company Vehicle)
                    </button>
                    <button class="btn btn-primary" id="btnDispenseFuel">
                        <i data-lucide="fuel"></i> Dispense Fuel
                    </button>
                </div>
            </div>

            <!-- Financial Summary Cards -->
            <div class="kpi-grid fade-in">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Station Total Revenue</span>
                        <div class="kpi-icon-wrap icon-blue"><i data-lucide="trending-up"></i></div>
                    </div>
                    <div class="kpi-value">€${fin.sales.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
                    <div class="kpi-meta"><span class="badge-success">Euro 95 + Diesel + Oil</span></div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Station Total Expenses</span>
                        <div class="kpi-icon-wrap icon-amber"><i data-lucide="receipt"></i></div>
                    </div>
                    <div class="kpi-value">€${fin.expenses.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
                    <div class="kpi-meta"><span class="badge-neutral">Fuel wholesale & maintenance</span></div>
                </div>

                <div class="kpi-card highlight-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Station Net Profit</span>
                        <div class="kpi-icon-wrap icon-emerald"><i data-lucide="wallet"></i></div>
                    </div>
                    <div class="kpi-value text-emerald">€${fin.netProfit.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
                    <div class="kpi-meta"><span class="badge-success">${fin.margin}% Margin</span></div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Total Lubricant SKUs</span>
                        <div class="kpi-icon-wrap icon-purple"><i data-lucide="package"></i></div>
                    </div>
                    <div class="kpi-value">${lubricants.length} Formulations</div>
                    <div class="kpi-meta"><span class="badge-info">Automated Reorder Watch</span></div>
                </div>
            </div>

            <!-- Fuel Storage Tanks -->
            <div class="card mt-4 fade-in">
                <div class="card-header">
                    <div class="card-title-group">
                        <h2 class="card-title">Bulk Fuel Storage Tanks & Dispenser Telemetry</h2>
                        <span class="card-hint">Underground tank capacities, realtime levels, and pump prices</span>
                    </div>
                    <span class="badge badge-primary">Pumps Active</span>
                </div>

                <div class="tanks-grid">
                    ${tanks.map(tank => {
                        const pct = ((tank.currentLiters / tank.capacityLiters) * 100).toFixed(1);
                        const isDiesel = tank.id.includes('diesel');
                        return `
                            <div class="tank-card ${isDiesel ? 'tank-diesel' : 'tank-petrol'}">
                                <div class="tank-card-header">
                                    <div class="tank-badge-title">
                                        <i data-lucide="fuel"></i>
                                        <strong>${tank.name}</strong>
                                    </div>
                                    <span class="badge ${pct > 30 ? 'badge-success' : 'badge-danger'}">${pct}% Full</span>
                                </div>

                                <div class="tank-progress-wrap">
                                    <div class="tank-progress-bar" style="width: ${pct}%;"></div>
                                </div>

                                <div class="tank-stats-row">
                                    <div>
                                        <span class="text-xs text-muted">Current Volume</span>
                                        <div class="tank-stat-val font-mono font-bold">${tank.currentLiters.toLocaleString()} L</div>
                                    </div>
                                    <div>
                                        <span class="text-xs text-muted">Capacity</span>
                                        <div class="tank-stat-val font-mono">${tank.capacityLiters.toLocaleString()} L</div>
                                    </div>
                                    <div>
                                        <span class="text-xs text-muted">Pump Price</span>
                                        <div class="tank-stat-val font-bold text-emerald">€${tank.pricePerLiter.toFixed(2)}/L</div>
                                    </div>
                                </div>

                                <div class="tank-actions mt-3">
                                    <button class="btn btn-xs btn-outline btn-quick-pump" data-tank-id="${tank.id}">
                                        <i data-lucide="plus-circle"></i> Quick Dispense (50L)
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Lubricant & Oil Inventory (With PDF Internal Usage integration) -->
            <div class="card mt-4 fade-in">
                <div class="card-header">
                    <div class="card-title-group">
                        <h2 class="card-title">Engine Oils & Lubricant Inventory (PDF §4)</h2>
                        <span class="card-hint">Stock levels, cost valuations, retail pricing, and internal deduction ledger</span>
                    </div>
                    <button class="btn btn-sm btn-outline" id="btnRestockLubricant">
                        <i data-lucide="package-plus"></i> Restock Shipment
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Product SKU</th>
                                <th>Lubricant Name</th>
                                <th>Current Stock</th>
                                <th>Min Threshold</th>
                                <th>Cost / Liter</th>
                                <th>Selling Price</th>
                                <th>Stock Valuation</th>
                                <th class="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lubricants.map(oil => {
                                const isLow = oil.stockLiters <= oil.minThreshold;
                                const val = (oil.stockLiters * oil.costPerLiter).toFixed(2);
                                return `
                                    <tr>
                                        <td><span class="badge-code">${oil.sku}</span></td>
                                        <td><strong>${oil.name}</strong></td>
                                        <td>
                                            <span class="font-bold ${isLow ? 'text-danger' : 'text-emerald'}">${oil.stockLiters} Liters</span>
                                            ${isLow ? '<span class="badge badge-danger ml-1">Low Stock</span>' : ''}
                                        </td>
                                        <td class="text-muted">${oil.minThreshold} L</td>
                                        <td>€${oil.costPerLiter.toFixed(2)}</td>
                                        <td class="font-medium">€${oil.pricePerLiter.toFixed(2)}</td>
                                        <td class="font-mono">€${val}</td>
                                        <td class="text-right">
                                            <button class="btn btn-xs btn-warning btn-use-oil-specific" data-oil-id="${oil.id}">
                                                Internal Use
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Internal Usage History (Explicitly highlighted in PDF §4) -->
            <div class="card mt-4 fade-in">
                <div class="card-header">
                    <div class="card-title-group">
                        <h3 class="card-title">Company Internal Oil Usage Log (Visible to Director)</h3>
                        <span class="card-hint">Decreases oil inventory and automatically logs as station expense (PDF §4)</span>
                    </div>
                    <span class="badge badge-warning">Audit Tracked</span>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Date & Time</th>
                                <th>Lubricant Product</th>
                                <th>Quantity (L)</th>
                                <th>Expense Value</th>
                                <th>Target Vehicle / Equipment</th>
                                <th>Authorized By</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentUsage.map(u => `
                                <tr>
                                    <td><span class="badge-code">${u.id}</span></td>
                                    <td class="text-xs text-nowrap">${u.date}</td>
                                    <td><strong>${u.oilName}</strong></td>
                                    <td class="font-bold">${u.liters} L</td>
                                    <td class="font-bold text-danger font-mono">-€${u.costValue.toFixed(2)}</td>
                                    <td><span class="badge badge-neutral">${u.targetVehicle}</span></td>
                                    <td class="text-xs text-muted">${u.authorizedBy}</td>
                                    <td><span class="badge badge-success">${u.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.bindEvents(container);
        if (window.lucide) window.lucide.createIcons();
    }

    bindEvents(container) {
        // Internal Oil Usage button
        container.querySelector('#btnRecordInternalUsage')?.addEventListener('click', () => {
            this.showInternalUsageModal();
        });

        // Specific table row button
        container.querySelectorAll('.btn-use-oil-specific').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showInternalUsageModal(btn.dataset.oilId);
            });
        });

        // Fuel Dispense modal
        container.querySelector('#btnDispenseFuel')?.addEventListener('click', () => {
            this.showDispenseFuelModal();
        });

        // Quick pump 50L
        container.querySelectorAll('.btn-quick-pump').forEach(btn => {
            btn.addEventListener('click', () => {
                const tankId = btn.dataset.tankId;
                try {
                    const res = window.cbmsStore.recordFuelSale(tankId, 50);
                    window.cbmsApp.showToast(`Dispensed 50 Liters. Recorded €${res.totalSale.toFixed(2)} sales!`, 'success');
                    this.render(container);
                } catch (e) {
                    window.cbmsApp.showToast(e.message, 'error');
                }
            });
        });

        // Restock
        container.querySelector('#btnRestockLubricant')?.addEventListener('click', () => {
            window.cbmsStore.data.station.lubricants.forEach(l => l.stockLiters += 50);
            window.cbmsStore.saveData();
            window.cbmsApp.showToast('Restocked 50L to each lubricant SKU', 'success');
            this.render(container);
        });
    }

    showInternalUsageModal(preSelectedOilId = null) {
        const lubricants = window.cbmsStore.data.station.lubricants;

        const modalHtml = `
            <div class="modal-backdrop fade-in" id="internalUsageModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Record Internal Oil Usage (PDF §4)</h3>
                            <p class="modal-subtitle">Internal company consumption will decrease stock and record as a station expense</p>
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('internalUsageModal').remove()">&times;</button>
                    </div>
                    <form id="internalUsageForm">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Select Oil / Lubricant</label>
                                <select class="form-control" id="internalOilSelect" required>
                                    ${lubricants.map(o => `
                                        <option value="${o.id}" ${o.id === preSelectedOilId ? 'selected' : ''}>
                                            ${o.name} (Stock: ${o.stockLiters}L | €${o.pricePerLiter}/L)
                                        </option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Quantity in Liters (e.g. 10 Liters)</label>
                                <input type="number" class="form-control" id="internalOilLiters" value="10" min="1" max="100" step="0.5" required />
                            </div>

                            <div class="form-group">
                                <label class="form-label">Target Company Vehicle or Asset</label>
                                <input type="text" class="form-control" id="internalOilVehicle" value="Company Van #2 (Plate: AG-902-BX)" placeholder="e.g. Company Van #2, Hotel Shuttle, Generator" required />
                            </div>

                            <div class="form-group">
                                <label class="form-label">Operational Notes / Reason</label>
                                <input type="text" class="form-control" id="internalOilNotes" value="Scheduled 15,000km oil change service" placeholder="Reason for internal use" />
                            </div>

                            <div class="alert alert-warning">
                                <i data-lucide="alert-triangle"></i>
                                <strong>System Effect:</strong> This transaction decreases oil inventory and books the computed value directly as an Operating Expense under Petrol Station. The Director can view the transaction and audit history immediately.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('internalUsageModal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-warning"><i data-lucide="check"></i> Confirm & Book Station Expense</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const existing = document.getElementById('internalUsageModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('internalUsageForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const oilId = document.getElementById('internalOilSelect').value;
            const liters = parseFloat(document.getElementById('internalOilLiters').value);
            const vehicle = document.getElementById('internalOilVehicle').value.trim();
            const notes = document.getElementById('internalOilNotes').value.trim();

            try {
                const res = window.cbmsStore.recordInternalOilUsage(oilId, liters, vehicle, notes);
                document.getElementById('internalUsageModal').remove();
                window.cbmsApp.showToast(`Recorded ${liters}L internal usage for ${vehicle}! Remaining stock: ${res.remainingStock}L`, 'success');
                this.render(document.getElementById('moduleContainer'));
            } catch (err) {
                window.cbmsApp.showToast(err.message, 'error');
            }
        });
    }

    showDispenseFuelModal() {
        const tanks = window.cbmsStore.data.station.tanks;

        const modalHtml = `
            <div class="modal-backdrop fade-in" id="dispenseModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Fuel Dispenser Terminal</h3>
                            <p class="modal-subtitle">Record Customer Fuel Purchase</p>
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('dispenseModal').remove()">&times;</button>
                    </div>
                    <form id="dispenseForm">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Select Pump / Fuel Grade</label>
                                <select class="form-control" id="dispenseTankSelect" required>
                                    ${tanks.map(t => `<option value="${t.id}">${t.name} (€${t.pricePerLiter}/L) - Avail: ${t.currentLiters}L</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Liters Dispensed</label>
                                <input type="number" class="form-control" id="dispenseLiters" value="45" min="1" max="1000" step="0.5" required />
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('dispenseModal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Process Sale & Print Receipt</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const existing = document.getElementById('dispenseModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('dispenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const tankId = document.getElementById('dispenseTankSelect').value;
            const liters = parseFloat(document.getElementById('dispenseLiters').value);
            try {
                const res = window.cbmsStore.recordFuelSale(tankId, liters);
                document.getElementById('dispenseModal').remove();
                window.cbmsApp.showToast(`Dispensed ${liters}L. €${res.totalSale.toFixed(2)} sales recorded!`, 'success');
                this.render(document.getElementById('moduleContainer'));
            } catch (err) {
                window.cbmsApp.showToast(err.message, 'error');
            }
        });
    }
}

window.cbmsStationModule = new StationModule();
