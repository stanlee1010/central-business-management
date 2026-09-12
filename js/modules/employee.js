/**
 * CBMS - Employee & Salary Module
 * Implements PDF §7:
 * - Individual employee accounts & profiles
 * - Clock-in/out attendance recorder, days worked, hours, overtime
 * - Allowances (housing, transport, performance), deductions (tax, social security, health)
 * - Printable PDF-style payslips
 * - Privacy Rule: An employee can view ONLY their own salary and work information unless higher permission is granted.
 */

class EmployeeModule {
    constructor() {
        this.timerInterval = null;
    }

    render(container) {
        const currentUser = window.cbmsStore.getCurrentUser();
        const isStandardEmployee = currentUser.role === 'employee';
        let staffList = window.cbmsStore.data.employees;

        // Privacy enforcement (PDF §7):
        // Standard employee can only view their own attendance and salary
        if (isStandardEmployee) {
            staffList = staffList.filter(e => e.id === currentUser.id);
        }

        // Active employee profile for punch clock
        const myProfile = window.cbmsStore.data.employees.find(e => e.id === currentUser.id) || window.cbmsStore.data.employees[0];

        container.innerHTML = `
            <div class="module-header fade-in">
                <div>
                    <h1 class="page-title">Employee & Salary Management</h1>
                    <p class="page-subtitle">Time & Attendance, Shift Punch Clock, Overtime, Allowances & Payslips (PDF §7)</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-outline" onclick="window.cbmsEmployeeModule.showPayslipModal('${myProfile.id}')">
                        <i data-lucide="file-text"></i> View My Payslip
                    </button>
                    ${!isStandardEmployee ? `
                        <button class="btn btn-primary" id="btnExportPayroll">
                            <i data-lucide="download"></i> Export Payroll Summary
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Interactive Shift Punch Clock Card -->
            <div class="card fade-in">
                <div class="card-header">
                    <div class="card-title-group">
                        <h2 class="card-title">Live Time & Attendance Punch Clock</h2>
                        <span class="card-hint">Record daily shift start/finish, calculate accumulated work hours & overtime</span>
                    </div>
                    <div class="system-time-display font-mono font-bold text-base" id="punchClockLiveTime">
                        --:--:--
                    </div>
                </div>

                <div class="punch-clock-container">
                    <div class="punch-user-info">
                        <div class="avatar-circle">${myProfile.name.split(' ').map(n=>n[0]).join('')}</div>
                        <div>
                            <h3 class="user-punch-name">${myProfile.name}</h3>
                            <span class="badge ${myProfile.clockedIn ? 'badge-success' : 'badge-neutral'}">
                                ${myProfile.clockedIn ? '● Currently Clocked In' : '○ Clocked Out'}
                            </span>
                            <div class="text-xs text-muted mt-1">Department: ${myProfile.department}</div>
                        </div>
                    </div>

                    <div class="punch-stats-row">
                        <div class="mini-stat">
                            <span class="text-xs text-muted">Days Worked</span>
                            <strong class="text-lg">${myProfile.daysWorkedMonth} Days</strong>
                        </div>
                        <div class="mini-stat">
                            <span class="text-xs text-muted">Monthly Hours</span>
                            <strong class="text-lg">${myProfile.hoursWorkedMonth} hrs</strong>
                        </div>
                        <div class="mini-stat">
                            <span class="text-xs text-muted">Overtime Logged</span>
                            <strong class="text-lg text-amber">${myProfile.overtimeHours} hrs</strong>
                        </div>
                    </div>

                    <div class="punch-action-wrap">
                        <button class="btn btn-lg ${myProfile.clockedIn ? 'btn-danger' : 'btn-primary'}" id="btnTogglePunch">
                            <i data-lucide="${myProfile.clockedIn ? 'log-out' : 'log-in'}"></i>
                            ${myProfile.clockedIn ? 'Clock Out from Shift' : 'Clock In for Shift'}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Privacy Notice Banner for Standard Employees -->
            ${isStandardEmployee ? `
                <div class="alert alert-info mt-4 fade-in">
                    <i data-lucide="shield"></i>
                    <strong>Privacy Control Enforced (PDF §7):</strong> You are logged in with the <em>Employee</em> role. Your view is restricted strictly to your own personal attendance, hours, and confidential salary payslip.
                </div>
            ` : ''}

            <!-- Staff Directory & Payroll Table -->
            <div class="card mt-4 fade-in">
                <div class="card-header">
                    <div class="card-title-group">
                        <h3 class="card-title">${isStandardEmployee ? 'My Compensation & Attendance Record' : 'Departmental Staff Roster & Compensation Ledgers'}</h3>
                        <span class="card-hint">Monthly base rates, hourly tiers, overtime calculation, allowances & net pay</span>
                    </div>
                    <span class="badge badge-primary">${staffList.length} ${staffList.length === 1 ? 'Profile' : 'Employees'}</span>
                </div>

                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th class="text-right">Monthly Base</th>
                                <th class="text-right">Hourly Rate</th>
                                <th class="text-center">Days / Hours</th>
                                <th class="text-right">Overtime</th>
                                <th class="text-center">Payslip</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${staffList.map(emp => {
                                return `
                                    <tr>
                                        <td>
                                            <div class="emp-name-cell">
                                                <strong>${emp.name}</strong>
                                                <div class="text-xs text-muted">${emp.role.replace('_', ' ').toUpperCase()}</div>
                                            </div>
                                        </td>
                                        <td><span class="badge badge-neutral">${emp.department}</span></td>
                                        <td>
                                            <span class="badge ${emp.clockedIn ? 'badge-success' : 'badge-neutral'}">
                                                ${emp.clockedIn ? 'Clocked In' : 'Offline'}
                                            </span>
                                        </td>
                                        <td class="text-right font-mono">€${emp.baseSalaryMonthly.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
                                        <td class="text-right font-mono text-muted">€${emp.hourlyRate.toFixed(2)}/hr</td>
                                        <td class="text-center">${emp.daysWorkedMonth}d / ${emp.hoursWorkedMonth}h</td>
                                        <td class="text-right font-bold text-amber">${emp.overtimeHours}h</td>
                                        <td class="text-center">
                                            <button class="btn btn-xs btn-outline btn-gen-payslip" data-emp-id="${emp.id}">
                                                <i data-lucide="printer"></i> View Payslip
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.startLiveClock();
        this.bindEvents(container, myProfile);
        if (window.lucide) window.lucide.createIcons();
    }

    startLiveClock() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        const updateClock = () => {
            const el = document.getElementById('punchClockLiveTime');
            if (el) {
                const d = new Date();
                el.textContent = d.toLocaleTimeString();
            }
        };
        updateClock();
        this.timerInterval = setInterval(updateClock, 1000);
    }

    bindEvents(container, myProfile) {
        // Toggle Punch Clock
        container.querySelector('#btnTogglePunch')?.addEventListener('click', () => {
            try {
                const emp = window.cbmsStore.toggleEmployeeClock(myProfile.id);
                window.cbmsApp.showToast(emp.clockedIn ? 'Successfully clocked in!' : 'Successfully clocked out. Shift recorded.', 'success');
                this.render(container);
            } catch (e) {
                window.cbmsApp.showToast(e.message, 'error');
            }
        });

        // Payslip buttons
        container.querySelectorAll('.btn-gen-payslip').forEach(btn => {
            btn.addEventListener('click', () => {
                const empId = btn.dataset.empId;
                this.showPayslipModal(empId);
            });
        });

        // Export payroll
        container.querySelector('#btnExportPayroll')?.addEventListener('click', () => {
            window.cbmsApp.showToast('Generating official monthly SEPA payroll batch file...', 'success');
        });
    }

    showPayslipModal(empId) {
        let payslip;
        try {
            payslip = window.cbmsStore.calculatePayslip(empId);
        } catch (e) {
            window.cbmsApp.showToast(e.message, 'error');
            return;
        }

        const emp = payslip.employee;

        const modalHtml = `
            <div class="modal-backdrop fade-in" id="payslipModal">
                <div class="modal-card modal-lg">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Official Employee Compensation Payslip</h3>
                            <p class="modal-subtitle">Pay Period: Current Month | Central Business Management System (PDF §7)</p>
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('payslipModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body printable-payslip-content" id="printablePayslip">
                        <div class="payslip-header-box mb-4">
                            <div class="payslip-company-details">
                                <h3 class="font-bold text-lg">Kigala Hotel Ltd</h3>
                                <div class="text-xs text-muted">Luxury Hotel, Petrol Station, Shop & Restaurant Operating Complex</div>
                                <div class="text-xs text-muted">Tax Registry: EU-DE-99482012 | Financial Ledger Ref: KGL-PAY-09</div>
                            </div>
                            <div class="payslip-meta-block text-right">
                                <span class="badge badge-success">Confidential Salary Document</span>
                                <div class="text-xs text-muted mt-1">Date Issued: ${new Date().toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div class="payslip-employee-grid mb-4">
                            <div>
                                <span class="text-xs text-muted">Employee Name:</span>
                                <div><strong>${emp.name}</strong></div>
                            </div>
                            <div>
                                <span class="text-xs text-muted">Role / Title:</span>
                                <div>${emp.role.replace('_', ' ').toUpperCase()}</div>
                            </div>
                            <div>
                                <span class="text-xs text-muted">Department:</span>
                                <div>${emp.department}</div>
                            </div>
                            <div>
                                <span class="text-xs text-muted">Days & Hours:</span>
                                <div>${emp.daysWorkedMonth} Days (${emp.hoursWorkedMonth} Regular Hours)</div>
                            </div>
                        </div>

                        <!-- Earnings Breakdown -->
                        <table class="payslip-table mb-3">
                            <thead>
                                <tr>
                                    <th>Earnings & Allowances</th>
                                    <th class="text-right">Rate / Basis</th>
                                    <th class="text-right">Amount (€)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Base Monthly Salary</td>
                                    <td class="text-right text-muted font-mono">1.0 Month</td>
                                    <td class="text-right font-mono font-bold">€${payslip.baseSalary.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Overtime Pay</td>
                                    <td class="text-right text-muted font-mono">${payslip.overtimeHours} hrs @ €${(emp.hourlyRate * 1.5).toFixed(2)} (150%)</td>
                                    <td class="text-right font-mono font-bold text-emerald">€${payslip.overtimePay.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Housing Allowance</td>
                                    <td class="text-right text-muted font-mono">Standard Benefit</td>
                                    <td class="text-right font-mono">€${(emp.allowances?.housing || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Transport & Commute Allowance</td>
                                    <td class="text-right text-muted font-mono">Fixed Stipend</td>
                                    <td class="text-right font-mono">€${(emp.allowances?.transport || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Executive / Performance Bonus</td>
                                    <td class="text-right text-muted font-mono">Merit Approved</td>
                                    <td class="text-right font-mono">€${(emp.allowances?.performanceBonus || 0).toFixed(2)}</td>
                                </tr>
                                <tr class="subtotal-row">
                                    <td colspan="2"><strong>GROSS EARNINGS</strong></td>
                                    <td class="text-right font-mono font-bold text-base">€${payslip.grossPay.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Deductions Breakdown -->
                        <table class="payslip-table mb-4">
                            <thead>
                                <tr>
                                    <th>Statutory Deductions</th>
                                    <th class="text-right">Policy Reference</th>
                                    <th class="text-right">Deducted (€)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Personal Income Withholding Tax</td>
                                    <td class="text-right text-muted font-mono">Tax Bracket Progressive</td>
                                    <td class="text-right font-mono text-danger">-€${(emp.deductions?.incomeTax || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Social Security & Pension Fund</td>
                                    <td class="text-right text-muted font-mono">Statutory Contribution</td>
                                    <td class="text-right font-mono text-danger">-€${(emp.deductions?.socialSecurity || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Health & Disability Insurance</td>
                                    <td class="text-right text-muted font-mono">Mandatory Coverage</td>
                                    <td class="text-right font-mono text-danger">-€${(emp.deductions?.healthInsurance || 0).toFixed(2)}</td>
                                </tr>
                                <tr class="subtotal-row">
                                    <td colspan="2"><strong>TOTAL DEDUCTIONS</strong></td>
                                    <td class="text-right font-mono font-bold text-danger text-base">-€${payslip.deductionsSum.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Net Pay Highlight Box -->
                        <div class="net-pay-banner">
                            <div class="net-pay-label">NET SALARY DISBURSED TO BANK:</div>
                            <div class="net-pay-value font-mono font-bold">€${payslip.netPay.toFixed(2)}</div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('payslipModal').remove()">Close</button>
                        <button class="btn btn-primary" onclick="window.print()">
                            <i data-lucide="printer"></i> Print Payslip / Save PDF
                        </button>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('payslipModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) window.lucide.createIcons();
    }
}

window.cbmsEmployeeModule = new EmployeeModule();
