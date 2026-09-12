/**
 * CBMS - Central Financial & Transaction Ledger Module
 * Implements PDF §9:
 * - Records transactions by business
 * - Simplified formula: Revenue - Cost of Goods - Operating Expenses = Net Profit
 * - Transaction details: Date, Amount, Business, Category, Employee, Description
 * - Live filtering by business, transaction type, and keyword search
 * - Add manual transaction modal with auto-audit logging
 */

class LedgerModule {
    constructor() {
        this.businessFilter = 'all';
        this.typeFilter = 'all';
        this.searchQuery = '';
    }

    render(container) {
        let transactions = window.cbmsStore.data.transactions;

        if (this.businessFilter !== 'all') {
            transactions = transactions.filter(t => t.business === this.businessFilter);
        }
        if (this.typeFilter !== 'all') {
            transactions = transactions.filter(t => t.type === this.typeFilter);
        }
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            transactions = transactions.filter(t =>
                t.description.toLowerCase().includes(q) ||
                t.category.toLowerCase().includes(q) ||
                t.employee.toLowerCase().includes(q) ||
                t.id.toLowerCase().includes(q)
            );
        }

        const canAddTx = window.cbmsRbac.canPerform('canApproveExpenses');
        const finTotals = window.cbmsStore.getFinancialTotals(this.businessFilter);

        container.innerHTML = `
            <div class="module-header fade-in">
                <div>
                    <h1 class="page-title">Central Financial Ledger</h1>
                    <p class="page-subtitle">Standardized Transaction Accounting: Revenue − COGS − Operating Expenses = Net Profit (PDF §9)</p>
                </div>
                <div class="header-actions">
                    ${canAddTx ? `
                        <button class="btn btn-primary" id="btnOpenNewTransaction">
                            <i data-lucide="plus-circle"></i> Post New Transaction
                        </button>
                    ` : ''}
                    <button class="btn btn-outline" id="btnExportLedgerCsv">
                        <i data-lucide="download"></i> Export CSV
                    </button>
                </div>
            </div>

            <!-- Filtered Financial Overview -->
            <div class="kpi-grid fade-in">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Ledger Filtered Revenue</span>
                        <div class="kpi-icon-wrap icon-blue"><i data-lucide="arrow-down-left"></i></div>
                    </div>
                    <div class="kpi-value">€${finTotals.sales.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
                    <div class="kpi-meta"><span class="badge-success">Income streams</span></div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Ledger Filtered Expenses</span>
                        <div class="kpi-icon-wrap icon-amber"><i data-lucide="arrow-up-right"></i></div>
                    </div>
                    <div class="kpi-value">€${finTotals.expenses.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
                    <div class="kpi-meta"><span class="badge-neutral">OpEx & COGS</span></div>
                </div>

                <div class="kpi-card highlight-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Net Ledger Margin</span>
                        <div class="kpi-icon-wrap icon-emerald"><i data-lucide="check-circle-2"></i></div>
                    </div>
                    <div class="kpi-value text-emerald">€${finTotals.netProfit.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
                    <div class="kpi-meta"><span class="badge-success">${finTotals.profitMargin}% Net Margin</span></div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Entries Count</span>
                        <div class="kpi-icon-wrap icon-purple"><i data-lucide="file-spreadsheet"></i></div>
                    </div>
                    <div class="kpi-value">${transactions.length} Records</div>
                    <div class="kpi-meta"><span class="badge-info">Immutable Audit Trail</span></div>
                </div>
            </div>

            <!-- Ledger Filter Bar & Table -->
            <div class="card mt-4 fade-in">
                <div class="card-header">
                    <div class="filter-controls-group">
                        <div class="filter-pills" id="ledgerBizFilters">
                            <button class="pill-btn ${this.businessFilter === 'all' ? 'active' : ''}" data-filter="all">All Units</button>
                            <button class="pill-btn ${this.businessFilter === 'hotel' ? 'active' : ''}" data-filter="hotel">Hotel</button>
                            <button class="pill-btn ${this.businessFilter === 'station' ? 'active' : ''}" data-filter="station">Petrol Station</button>
                            <button class="pill-btn ${this.businessFilter === 'shop' ? 'active' : ''}" data-filter="shop">Shop</button>
                            <button class="pill-btn ${this.businessFilter === 'restaurant' ? 'active' : ''}" data-filter="restaurant">Restaurant</button>
                        </div>

                        <select class="form-control form-control-sm" id="ledgerTypeFilter" style="width: 150px;">
                            <option value="all" ${this.typeFilter === 'all' ? 'selected' : ''}>All Types</option>
                            <option value="revenue" ${this.typeFilter === 'revenue' ? 'selected' : ''}>Revenue Only</option>
                            <option value="expense" ${this.typeFilter === 'expense' ? 'selected' : ''}>Expenses Only</option>
                        </select>

                        <input type="text" id="ledgerSearchInput" value="${this.searchQuery}" class="form-control form-control-sm" placeholder="Search description, ID, operator..." style="width: 240px;" />
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Transaction Ref</th>
                                <th>Date</th>
                                <th>Business Unit</th>
                                <th>Type</th>
                                <th>Accounting Category</th>
                                <th>Description / Memo</th>
                                <th>Operator</th>
                                <th class="text-right">Amount (€)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transactions.map(tx => {
                                const isRev = tx.type === 'revenue';
                                return `
                                    <tr>
                                        <td><span class="badge-code">${tx.id}</span></td>
                                        <td class="text-xs text-nowrap">${tx.date}</td>
                                        <td>
                                            <span class="badge badge-biz badge-${tx.business}">
                                                ${tx.business === 'hotel' ? '🏨 Hotel' : (tx.business === 'station' ? '⛽ Petrol Station' : (tx.business === 'shop' ? '🛒 Shop' : '🍽️ Restaurant'))}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge ${isRev ? 'badge-success' : 'badge-danger'}">
                                                ${isRev ? 'Revenue' : 'Expense'}
                                            </span>
                                        </td>
                                        <td class="font-medium">${tx.category}</td>
                                        <td class="text-xs">${tx.description}</td>
                                        <td class="text-xs text-muted">${tx.employee}</td>
                                        <td class="text-right font-mono font-bold ${isRev ? 'text-emerald' : 'text-danger'}">
                                            ${isRev ? '+' : '-'}€${tx.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
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

    bindEvents(container) {
        // Business unit filter pills
        container.querySelectorAll('#ledgerBizFilters button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.businessFilter = btn.dataset.filter;
                this.render(container);
            });
        });

        // Type filter dropdown
        container.querySelector('#ledgerTypeFilter')?.addEventListener('change', (e) => {
            this.typeFilter = e.target.value;
            this.render(container);
        });

        // Search input
        container.querySelector('#ledgerSearchInput')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            // Debounce-free quick re-render or table filter
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.render(container);
                const el = document.getElementById('ledgerSearchInput');
                if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length; }
            }, 250);
        });

        // New transaction button
        container.querySelector('#btnOpenNewTransaction')?.addEventListener('click', () => {
            this.showNewTransactionModal();
        });

        // Export CSV
        container.querySelector('#btnExportLedgerCsv')?.addEventListener('click', () => {
            this.exportCsv();
        });
    }

    showNewTransactionModal() {
        const modalHtml = `
            <div class="modal-backdrop fade-in" id="newTxModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Post New Ledger Entry (PDF §9)</h3>
                            <p class="modal-subtitle">Direct manual journal entry into the Central Financial Database</p>
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('newTxModal').remove()">&times;</button>
                    </div>
                    <form id="newTxForm">
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group col-6">
                                    <label class="form-label">Business Unit</label>
                                    <select class="form-control" id="newTxBusiness" required>
                                        <option value="hotel">Hotel</option>
                                        <option value="station">Petrol Station</option>
                                        <option value="shop">Shop</option>
                                        <option value="restaurant">Restaurant</option>
                                    </select>
                                </div>
                                <div class="form-group col-6">
                                    <label class="form-label">Transaction Type</label>
                                    <select class="form-control" id="newTxType" required>
                                        <option value="revenue">Revenue (Sales / Income)</option>
                                        <option value="expense">Operating Expense / COGS</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group col-6">
                                    <label class="form-label">Amount (€)</label>
                                    <input type="number" class="form-control" id="newTxAmount" min="0.01" step="0.01" placeholder="e.g. 450.00" required />
                                </div>
                                <div class="form-group col-6">
                                    <label class="form-label">Accounting Category</label>
                                    <input type="text" class="form-control" id="newTxCategory" placeholder="e.g. Facility Maintenance, Wholesale Delivery" required />
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Detailed Description / Memo</label>
                                <textarea class="form-control" id="newTxDescription" rows="2" placeholder="Full explanation of the transaction" required></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('newTxModal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary"><i data-lucide="check"></i> Commit to Central Ledger</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const existing = document.getElementById('newTxModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('newTxForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const business = document.getElementById('newTxBusiness').value;
            const type = document.getElementById('newTxType').value;
            const amount = parseFloat(document.getElementById('newTxAmount').value);
            const category = document.getElementById('newTxCategory').value.trim();
            const description = document.getElementById('newTxDescription').value.trim();

            try {
                window.cbmsStore.addTransaction({ business, type, amount, category, description });
                document.getElementById('newTxModal').remove();
                window.cbmsApp.showToast(`Transaction of €${amount.toFixed(2)} recorded successfully!`, 'success');
                this.render(document.getElementById('moduleContainer'));
            } catch (err) {
                window.cbmsApp.showToast(err.message, 'error');
            }
        });
    }

    exportCsv() {
        const txs = window.cbmsStore.data.transactions;
        let csv = 'ID,Date,Business,Type,Category,Description,Employee,Amount\n';
        txs.forEach(t => {
            csv += `"${t.id}","${t.date}","${t.business}","${t.type}","${t.category}","${t.description.replace(/"/g, '""')}","${t.employee}",${t.amount}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CBMS_Central_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        window.cbmsApp.showToast('Financial CSV exported successfully.', 'success');
    }
}

window.cbmsLedgerModule = new LedgerModule();
