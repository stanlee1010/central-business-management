/**
 * Kigala Hotel Ltd - Central Business Management System (CBMS)
 * Application Controller & Gateway
 * Manages:
 * - Public Customer Front View (strictly Hotel & Restaurant)
 * - Password-Protected Staff Login Modal with credential verification
 * - Dynamic Feature Gating (hides all unauthorized modules based on authenticated role)
 * - Navigation and session management
 */

class CentralApp {
    constructor() {
        this.currentMode = 'public'; // 'public' | 'portal'
        this.activeModule = 'director';
        this.publicContainer = null;
        this.moduleContainer = null;
        this.toastContainer = null;
    }

    init() {
        this.publicContainer = document.getElementById('publicWebsiteView');
        this.moduleContainer = document.getElementById('moduleContainer');
        this.toastContainer = document.getElementById('toastContainer');

        this.initRoleSwitcher();
        this.initNavigation();
        this.initLiveTopbar();
        this.bindPortalReturnButtons();

        // Default view: Customer-Facing Website (Hotel & Restaurant only)
        this.showPublicView();
    }

    // Toggle to Public Customer Website
    showPublicView() {
        this.currentMode = 'public';
        document.getElementById('publicWebsiteView').style.display = 'block';
        document.getElementById('managementAppView').style.display = 'none';

        if (window.cbmsPublicModule) {
            window.cbmsPublicModule.render(this.publicContainer);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Toggle to Internal Staff Management Portal
    showManagementPortal(targetModule = null) {
        this.currentMode = 'portal';
        document.getElementById('publicWebsiteView').style.display = 'none';
        document.getElementById('managementAppView').style.display = 'block';

        const currentUser = window.cbmsStore.getCurrentUser();
        const role = currentUser ? currentUser.role : 'director';
        const perms = window.cbmsRbac.getRoleDetails(role);

        // Select suitable module for this user's role
        if (!targetModule || !perms.allowedModules.includes(targetModule)) {
            this.activeModule = perms.allowedModules[0];
        } else {
            this.activeModule = targetModule;
        }

        // Sync topbar select & badge
        const select = document.getElementById('topbarRoleSelect');
        if (select && currentUser) {
            select.value = currentUser.id;
            this.updateUserBadge(currentUser);
        }

        // Dynamically show only the features permitted by this member's credentials!
        this.updateNavigationLocks();
        this.switchModule(this.activeModule);
    }

    // Password-Protected Staff Login Modal
    openStaffLoginModal() {
        const users = window.cbmsStore.data.users;

        const modalHtml = `
            <div class="modal-backdrop fade-in" id="staffLoginModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Kigala Hotel Ltd — Staff Portal Login</h3>
                            <p class="modal-subtitle">Enter your company credentials to access your authorized modules (PDF §8)</p>
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('staffLoginModal').remove()">&times;</button>
                    </div>
                    <form id="staffLoginForm">
                        <div class="modal-body">
                            <!-- Quick Demo Autofill Helper -->
                            <div class="demo-autofill-box mb-3">
                                <label class="text-xs font-bold text-muted d-block mb-1">
                                    <i data-lucide="key"></i> Quick Autofill Credentials for Testing:
                                </label>
                                <div class="autofill-chips-wrap">
                                    ${users.map(u => `
                                        <button type="button" class="btn-chip-autofill" 
                                            data-email="${u.email}" 
                                            data-pass="${u.password}" 
                                            data-role="${u.role}"
                                            title="Autofill as ${u.name} (${u.title})">
                                            ${u.name.split(' ')[0]} (${u.role.replace('_', ' ')})
                                        </button>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label font-bold">Work Email Address</label>
                                <div class="input-with-icon">
                                    <i data-lucide="mail"></i>
                                    <input type="email" class="form-control" id="staffLoginEmail" placeholder="e.g. director@kigala-hotel.com" value="director@kigala-hotel.com" required />
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label font-bold">Password</label>
                                <div class="input-with-icon">
                                    <i data-lucide="lock"></i>
                                    <input type="password" class="form-control" id="staffLoginPassword" placeholder="Enter your password" value="director123" required />
                                    <button type="button" class="btn-toggle-pwd" id="btnTogglePwd" title="Show/Hide Password">
                                        <i data-lucide="eye"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="alert alert-info mt-3">
                                <i data-lucide="shield-alert"></i>
                                <div>
                                    <strong>Role-Gated Security:</strong> Your password unlocks <em>only</em> the operational features specified for your departmental role (e.g. Petrol Station, Shop, Hotel, Restaurant, or Director Rollup).
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('staffLoginModal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="btnSubmitLogin">
                                <i data-lucide="log-in"></i> Sign In to System
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const existing = document.getElementById('staffLoginModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) window.lucide.createIcons();

        // Bind quick autofill chips
        document.querySelectorAll('.btn-chip-autofill').forEach(chip => {
            chip.addEventListener('click', () => {
                document.getElementById('staffLoginEmail').value = chip.dataset.email;
                document.getElementById('staffLoginPassword').value = chip.dataset.pass;
                this.showToast(`Autofilled credentials for ${chip.dataset.role.replace('_', ' ').toUpperCase()}`, 'info');
            });
        });

        // Toggle password visibility
        const toggleBtn = document.getElementById('btnTogglePwd');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const pwdInput = document.getElementById('staffLoginPassword');
                if (pwdInput.type === 'password') {
                    pwdInput.type = 'text';
                    toggleBtn.innerHTML = '<i data-lucide="eye-off"></i>';
                } else {
                    pwdInput.type = 'password';
                    toggleBtn.innerHTML = '<i data-lucide="eye"></i>';
                }
                if (window.lucide) window.lucide.createIcons();
            });
        }

        // Form Submit Handler
        document.getElementById('staffLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('staffLoginEmail').value;
            const password = document.getElementById('staffLoginPassword').value;

            try {
                const user = window.cbmsStore.authenticateUser(email, password);
                document.getElementById('staffLoginModal').remove();
                const perms = window.cbmsRbac.getRoleDetails(user.role);
                this.showToast(`Authentication Successful! Welcome, ${user.name} (${perms.name}).`, 'success');
                this.showManagementPortal();
            } catch (err) {
                this.showToast(err.message, 'error');
                const pwdInput = document.getElementById('staffLoginPassword');
                if (pwdInput) {
                    pwdInput.classList.add('input-error');
                    pwdInput.focus();
                }
            }
        });
    }

    bindPortalReturnButtons() {
        const returnPublic = () => {
            const user = window.cbmsStore.getCurrentUser();
            window.cbmsStore.logAudit(user.name, user.role, 'AUTH_SIGN_OUT', 'Security', 'User signed out from management portal to public view.');
            this.showToast('Signed out from management portal.', 'info');
            this.showPublicView();
        };

        document.getElementById('btnBackToPublic')?.addEventListener('click', returnPublic);
        document.getElementById('btnSignOutPortal')?.addEventListener('click', returnPublic);
    }

    initRoleSwitcher() {
        const select = document.getElementById('topbarRoleSelect');
        if (!select) return;

        const user = window.cbmsStore.getCurrentUser();
        if (user) {
            select.value = user.id;
            this.updateUserBadge(user);
        }

        select.addEventListener('change', (e) => {
            const userId = e.target.value;
            const updatedUser = window.cbmsStore.setCurrentUser(userId);
            if (updatedUser) {
                this.updateUserBadge(updatedUser);
                this.updateNavigationLocks();

                const perms = window.cbmsRbac.getRoleDetails(updatedUser.role);
                if (!perms.allowedModules.includes(this.activeModule)) {
                    this.switchModule(perms.allowedModules[0]);
                } else {
                    this.refreshActiveModule();
                }

                this.showToast(`Active profile switched to ${updatedUser.name} (${perms.name})`, 'info');
            }
        });

        this.updateNavigationLocks();
    }

    updateUserBadge(user) {
        const nameEl = document.getElementById('currentUserName');
        const roleEl = document.getElementById('currentUserRole');
        const avatarEl = document.getElementById('currentUserAvatar');
        const perms = window.cbmsRbac.getRoleDetails(user.role);

        if (nameEl) nameEl.textContent = user.name;
        if (roleEl) roleEl.textContent = perms.name;
        if (avatarEl) avatarEl.textContent = user.name.split(' ').map(n => n[0]).join('');
    }

    // Strictly hide unauthorized features based on authenticated member's permissions!
    updateNavigationLocks() {
        const role = window.cbmsRbac.getCurrentRole();
        const perms = window.cbmsRbac.getRoleDetails(role);

        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            const mod = item.dataset.module;
            const hasAccess = perms.allowedModules.includes(mod);
            // Hide unauthorized modules completely!
            item.style.display = hasAccess ? 'flex' : 'none';
        });

        // Hide section titles if all child links in that section are hidden
        document.querySelectorAll('.sidebar-nav').forEach(nav => {
            let currentTitle = null;
            let hasVisibleLink = false;

            Array.from(nav.children).forEach(child => {
                if (child.classList.contains('nav-section-title')) {
                    if (currentTitle && !hasVisibleLink) {
                        currentTitle.style.display = 'none';
                    }
                    currentTitle = child;
                    currentTitle.style.display = 'block';
                    hasVisibleLink = false;
                } else if (child.classList.contains('nav-item')) {
                    if (child.style.display !== 'none') {
                        hasVisibleLink = true;
                    }
                }
            });

            if (currentTitle && !hasVisibleLink) {
                currentTitle.style.display = 'none';
            }
        });
    }

    initNavigation() {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetMod = item.dataset.module;
                if (!window.cbmsRbac.hasAccess(targetMod)) {
                    const currentRole = window.cbmsRbac.getCurrentRole();
                    this.showToast(`Access Denied: Your password credentials do not permit access to '${targetMod.toUpperCase()}'.`, 'error');
                    return;
                }
                this.switchModule(targetMod);
            });
        });
    }

    switchModule(moduleKey) {
        if (!window.cbmsRbac.hasAccess(moduleKey)) {
            this.showToast('Module not permitted for your current access level.', 'error');
            return;
        }

        this.activeModule = moduleKey;

        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.module === moduleKey);
        });

        switch (moduleKey) {
            case 'director':
                window.cbmsDirectorModule.render(this.moduleContainer);
                break;
            case 'hotel':
                window.cbmsHotelModule.render(this.moduleContainer);
                break;
            case 'station':
                window.cbmsStationModule.render(this.moduleContainer);
                break;
            case 'shop':
                window.cbmsShopModule.render(this.moduleContainer);
                break;
            case 'restaurant':
                window.cbmsRestaurantModule.render(this.moduleContainer);
                break;
            case 'employee':
                window.cbmsEmployeeModule.render(this.moduleContainer);
                break;
            case 'ledger':
                window.cbmsLedgerModule.render(this.moduleContainer);
                break;
            case 'audit':
                window.cbmsAuditModule.render(this.moduleContainer);
                break;
            default:
                this.moduleContainer.innerHTML = `<div class="p-4">Module not found.</div>`;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    refreshActiveModule() {
        this.switchModule(this.activeModule);
    }

    showToast(message, type = 'info') {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'error') iconName = 'alert-octagon';
        if (type === 'warning') iconName = 'alert-triangle';

        toast.innerHTML = `
            <i data-lucide="${iconName}"></i>
            <span>${message}</span>
        `;

        this.toastContainer.appendChild(toast);
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.25s ease';
            setTimeout(() => toast.remove(), 250);
        }, 3800);
    }

    initLiveTopbar() {
        const topbarClock = document.getElementById('topbarClock');
        if (topbarClock) {
            const tick = () => {
                const now = new Date();
                topbarClock.textContent = now.toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                }) + ' | ' + now.toLocaleTimeString();
            };
            tick();
            setInterval(tick, 1000);
        }
    }
}

// Global Application Instance
window.cbmsApp = new CentralApp();

document.addEventListener('DOMContentLoaded', () => {
    window.cbmsApp.init();
});
