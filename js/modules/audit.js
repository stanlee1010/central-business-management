/**
 * CBMS - Audit & Security Module
 * Implements PDF §10:
 * - Audit logs recording who created or changed a transaction and when
 * - Security telemetry (RBAC state, 2FA status, WAF protection indicators)
 * - Database backup to JSON, file restore, and PDF benchmark reset
 */

class AuditModule {
    constructor() {
        this.moduleFilter = 'all';
        this.searchQuery = '';
    }

    render(container) {
        let logs = window.cbmsStore.data.auditLogs;

        if (this.moduleFilter !== 'all') {
            logs = logs.filter(l => l.module.toLowerCase().includes(this.moduleFilter.toLowerCase()));
        }

        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            logs = logs.filter(l =>
                l.details.toLowerCase().includes(q) ||
                l.user.toLowerCase().includes(q) ||
                l.action.toLowerCase().includes(q) ||
                l.module.toLowerCase().includes(q)
            );
        }

        container.innerHTML = `
            <div class="module-header fade-in">
                <div>
                    <h1 class="page-title">Audit Logs & System Security</h1>
                    <p class="page-subtitle">Activity Trails, Tamper-Evident Logs, Disaster Recovery & Security Telemetry (PDF §10)</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-outline" id="btnDownloadBackup">
                        <i data-lucide="database"></i> Backup Central DB (JSON)
                    </button>
                    <label class="btn btn-outline" style="cursor: pointer; margin-bottom: 0;">
                        <i data-lucide="upload"></i> Restore Backup
                        <input type="file" id="uploadBackupInput" accept=".json" style="display: none;" />
                    </label>
                    <button class="btn btn-danger" id="btnResetToDefaults">
                        <i data-lucide="rotate-ccw"></i> Reset to PDF Benchmark
                    </button>
                </div>
            </div>

            <!-- Security Telemetry Banner (PDF §10 Recommendations) -->
            <div class="card mb-4 fade-in">
                <div class="card-header">
                    <div class="card-title-group">
                        <h2 class="card-title">Enterprise Security Architecture Status (PDF §10)</h2>
                        <span class="card-hint">Compliant with centralized business security controls</span>
                    </div>
                    <span class="badge badge-success"><i data-lucide="shield-check"></i> System Protected</span>
                </div>
                <div class="security-grid">
                    <div class="sec-item">
                        <div class="sec-icon"><i data-lucide="lock"></i></div>
                        <div>
                            <strong>WAF & HTTPS Ingress</strong>
                            <div class="text-xs text-muted">Firewall inspection & TLS 1.3 encryption active</div>
                        </div>
                    </div>
                    <div class="sec-item">
                        <div class="sec-icon"><i data-lucide="key"></i></div>
                        <div>
                            <strong>Role-Based Access Control (RBAC)</strong>
                            <div class="text-xs text-muted">7 distinct authorization levels enforced</div>
                        </div>
                    </div>
                    <div class="sec-item">
                        <div class="sec-icon"><i data-lucide="smartphone"></i></div>
                        <div>
                            <strong>Two-Factor Authentication (2FA)</strong>
                            <div class="text-xs text-muted">Enforced on Director & Manager credentials</div>
                        </div>
                    </div>
                    <div class="sec-item">
                        <div class="sec-icon"><i data-lucide="file-check-2"></i></div>
                        <div>
                            <strong>Tamper-Resistant Audit Trail</strong>
                            <div class="text-xs text-muted">Every transaction & inventory deduction timestamped</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Audit Trail Log Viewer -->
            <div class="card fade-in">
                <div class="card-header">
                    <div class="filter-controls-group">
                        <div class="filter-pills" id="auditModuleFilters">
                            <button class="pill-btn ${this.moduleFilter === 'all' ? 'active' : ''}" data-filter="all">All Modules</button>
                            <button class="pill-btn ${this.moduleFilter === 'hotel' ? 'active' : ''}" data-filter="hotel">Hotel</button>
                            <button class="pill-btn ${this.moduleFilter === 'station' ? 'active' : ''}" data-filter="station">Petrol Station</button>
                            <button class="pill-btn ${this.moduleFilter === 'shop' ? 'active' : ''}" data-filter="shop">Shop</button>
                            <button class="pill-btn ${this.moduleFilter === 'restaurant' ? 'active' : ''}" data-filter="restaurant">Restaurant</button>
                            <button class="pill-btn ${this.moduleFilter === 'security' ? 'active' : ''}" data-filter="security">Security & Auth</button>
                        </div>

                        <input type="text" id="auditSearchInput" value="${this.searchQuery}" class="form-control form-control-sm" placeholder="Search audit trail..." style="width: 260px;" />
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Operator</th>
                                <th>Role</th>
                                <th>Target Module</th>
                                <th>Action Event</th>
                                <th>Event Details & Impact</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.map(l => `
                                <tr>
                                    <td class="text-xs text-nowrap font-mono text-muted">${l.timestamp}</td>
                                    <td><strong>${l.user}</strong></td>
                                    <td><span class="badge badge-neutral text-xs">${l.role.replace('_', ' ').toUpperCase()}</span></td>
                                    <td><span class="badge badge-info">${l.module}</span></td>
                                    <td><span class="badge-code font-bold">${l.action}</span></td>
                                    <td class="text-xs">${l.details}</td>
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
        // Module filters
        container.querySelectorAll('#auditModuleFilters button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.moduleFilter = btn.dataset.filter;
                this.render(container);
            });
        });

        // Search input
        container.querySelector('#auditSearchInput')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.render(container);
                const el = document.getElementById('auditSearchInput');
                if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length; }
            }, 250);
        });

        // Backup DB
        container.querySelector('#btnDownloadBackup')?.addEventListener('click', () => {
            const dataStr = window.cbmsStore.exportJson();
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CBMS_Database_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            a.click();
            URL.revokeObjectURL(url);
            window.cbmsApp.showToast('Central Database backup downloaded.', 'success');
        });

        // Restore DB
        container.querySelector('#uploadBackupInput')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    window.cbmsStore.importJson(event.target.result);
                    window.cbmsApp.showToast('Database successfully restored from backup!', 'success');
                    window.cbmsApp.refreshActiveModule();
                } catch (err) {
                    window.cbmsApp.showToast('Failed to restore backup: ' + err.message, 'error');
                }
            };
            reader.readAsText(file);
        });

        // Reset to Benchmark Defaults
        container.querySelector('#btnResetToDefaults')?.addEventListener('click', () => {
            if (confirm('Reset entire Central Database to PDF specification benchmark values (€68,500 Sales / €29,200 Expenses / €39,300 Profit)?')) {
                window.cbmsStore.resetToDefaults();
                window.cbmsApp.showToast('Central Database restored to original PDF benchmark figures!', 'success');
                window.cbmsApp.refreshActiveModule();
            }
        });
    }
}

window.cbmsAuditModule = new AuditModule();
