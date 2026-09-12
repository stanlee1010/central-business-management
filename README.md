# Central Business Management System (CBMS)

An enterprise multi-module management web platform based directly on the **Central Business Management System** architectural specification.

The platform provides a centralized database and financial ledger unifying four core business operations: **Hotel**, **Petrol Station**, **Shop**, and **Restaurant**, coupled with an **Employee & Salary Module**, **Role-Based Access Control (RBAC)**, an immutable **Audit Log**, and an executive **Director Portal**.

---

## 📋 PDF Requirement Implementation Matrix

| PDF Section | Requirement in Document | System Implementation |
| :--- | :--- | :--- |
| **1. Overall Concept** | Centralized business management platform unifying Hotel, Petrol Station, Shop, and Restaurant under a shared database & Director Portal. | Central reactive state engine (`js/store.js`) backed by `localStorage` connecting all 4 business modules with immediate bidirectional synchronization. |
| **2. Director Portal** | Highest level access. Shows Total Sales, Total Expenses, Net Profit, and business breakdown. Filters by today, week, month, year, custom range, and transaction drill-down. | **Director Dashboard (`js/modules/director.js`)**: Pre-seeded with exact PDF benchmark numbers (€68,500 Sales, €29,200 Expenses, €39,300 Profit), time filters, Chart.js visualizations, and interactive drill-down into individual line-item transactions. |
| **3. Hotel Module** | Reception: reservations, guest registration, check-in/check-out, room status, payments & invoices. Restaurant room service charges. Hotel manager operations. | **Hotel Operations (`js/modules/hotel.js`)**: Visual 10-room status grid (Available, Occupied, Reserved, Maintenance), interactive guest check-in/out wizard, automated folio invoicing, reservations desk, and cross-billing from Restaurant orders. |
| **4. Petrol Station Module** | Petrol and diesel sales, liters sold, oil/lubricant purchases, oil sales, oil inventory, and station expenses. **Internal oil usage feature** (e.g. 10L for company vehicle -> decreases inventory, records expense, visible in Director audit history). | **Petrol Station Operations (`js/modules/station.js`)**: Euro 95 and Diesel tank level gauges, pump dispense simulator, lubricant catalog with stock valuation, and **Internal Oil Usage Modal** which decrements inventory, posts an OpEx to the station, and records a high-priority audit entry. |
| **5. Shop Module** | Products purchased & sold, purchase price, selling price, suppliers, stock levels, sales & expenses. Automated COGS, gross & net profit calculation. | **Retail Shop & Inventory (`js/modules/shop.js`)**: Full Point of Sale (POS) terminal with interactive cart, product search, supplier lead-time directory, and automated COGS & profit margin analysis table. |
| **6. Restaurant Module** | Menu items, tables, orders, food & drink sales, room-service orders, inventory, expenses. Rolls up to hotel financial reports. | **Restaurant & Bar (`js/modules/restaurant.js`)**: Interactive 8-table dining room floor plan (Available, Occupied, Bill Requested, Reserved), kitchen ticket builder, and **"Charge to Hotel Room"** feature linking diners directly to active guest folios. |
| **7. Employee & Salary Module** | Individual accounts, clock-in/out, days worked, hours, overtime, leave, absences, salary, allowances, deductions, payslips. **Privacy rule**: Employee views only their own salary/work data. | **Employee & Salary (`js/modules/employee.js`)**: Live punch clock with real-time shift timer, overtime calculator, allowances & tax deductions, printable PDF-ready payslips (`@media print`), and strict role filtering hiding other staff when logged in as Employee. |
| **8. Access Control (RBAC)** | Role permissions: Director, Hotel Manager, Station Manager, Shop Manager, Receptionist, Restaurant Staff, Employee. | **RBAC Engine (`js/rbac.js`)**: Fast one-click Role Switcher in the top navigation bar. Dynamically locks unauthorized modules, restricts sensitive actions, and customizes user interfaces according to PDF Section 8. |
| **9. Financial & Inventory System** | Formula: `Revenue − Cost of Goods − Operating Expenses = Net Profit`. Tracks purchases, sales, internal usage, adjustments. Date, amount, business, category, employee, description. | **Central Financial Ledger (`js/modules/ledger.js`)**: Master transaction ledger, standardized fields, multi-criteria filters, CSV export, and manual journal entry form. |
| **10. Audit & Security** | HTTPS/WAF security telemetry, role permissions, 2FA status, database backups, audit logs recording who created/changed transactions and when. | **Audit & Security (`js/modules/audit.js`)**: Chronological audit log with search and filtering, JSON full-state export (backup), JSON restore, and one-click reset to PDF benchmark state. |

---

## 📊 Pre-Loaded Benchmark Data (PDF Section 2)

| Business Unit | Sales (€) | Expenses (€) | Net Profit (€) | Net Margin |
| :--- | :---: | :---: | :---: | :---: |
| **Hotel** | €25,000.00 | €10,000.00 | €15,000.00 | 60.0% |
| **Petrol Station** | €30,000.00 | €15,000.00 | €15,000.00 | 50.0% |
| **Shop** | €8,500.00 | €3,200.00 | €5,300.00 | 62.4% |
| **Restaurant** | €5,000.00 | €1,000.00 | €4,000.00 | 80.0% |
| **TOTAL CONSOLIDATED** | **€68,500.00** | **€29,200.00** | **€39,300.00** | **57.4%** |

---

## 🚀 How to Launch and Use the Application

### Option A: Open directly in your Web Browser (Zero Setup)
Simply double click or open `index.html` in any web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Option B: PowerShell Quick Launch
```powershell
Start-Process "C:\Users\HP\.gemini\antigravity\scratch\central-business-management\index.html"
```

---

## 🛠️ Testing Key Scenarios

### 1. Test Internal Oil Usage (PDF Section 4)
1. In the top bar, ensure the role is set to **Station Manager** or **Director**.
2. Click **Petrol Station** in the sidebar.
3. Click **"Record Internal Oil Usage (Company Vehicle)"**.
4. Select `Synthetic 5W-30 Engine Oil`, enter `10` Liters, and submit.
5. Notice:
   - Oil stock drops by 10 Liters (e.g. from 240L to 230L).
   - An operating expense of €150.00 is posted under Petrol Station.
   - Go to **Audit & Security** or **Director Portal** -> inspect the newly logged event with vehicle plate and timestamp!

### 2. Test Cross-Module Room Service Billing (PDF Sections 3 & 6)
1. Switch to **Restaurant Staff** or **Hotel Manager**.
2. Navigate to **Restaurant & Bar**.
3. Click on **Table 3** or **New Table / Room Order**.
4. Add items (e.g. `Truffle Tagliatelle`, `House Pinot Noir`).
5. Under **Billing Option**, choose `Charge to Hotel Room 102 (Sophie Laurent)`.
6. Dispatch the order.
7. Navigate to **Hotel Operations** -> click **Folio** on Room 102.
8. Notice that Sophie Laurent's hotel folio has been charged with the restaurant order!

### 3. Test Employee Privacy Restrictions (PDF Section 7 & 8)
1. Use the **Active Role** dropdown in the top bar to select `David Miller — Employee (Restricted)`.
2. Notice:
   - Unauthorized modules (Director Portal, Central Ledger, Petrol Station, Shop, Audit) are disabled and locked in the sidebar.
   - Only the **Employee & Salary** module is accessible.
   - In the Staff Roster table, David Miller can see **only his own** attendance and compensation records.
   - Click **"View My Payslip"** to see a full breakdown of Base Salary, Overtime pay, Housing allowance, Tax deductions, Social Security, and Net Pay.

### 4. Test Director Financial Drill-Down (PDF Section 2)
1. Switch role to `Arthur Vance — Director`.
2. Open **Director Portal**.
3. Click **Drill Down** on the **Hotel** row.
4. A granular modal opens displaying the individual line-item transactions (room bookings, laundry expenses, HVAC maintenance) that sum to the exact €25,000 sales and €10,000 expenses.

---

## 📁 Project File Architecture

```
central-business-management/
├── index.html                  # Main application shell with navbar & dynamic viewport
├── css/
│   └── styles.css              # Modern executive ERP design system & printable styles
├── js/
│   ├── store.js                # Centralized state manager, localStorage & PDF seed data
│   ├── rbac.js                 # Role-based access control engine & permissions map
│   ├── app.js                  # Application controller, routing & toast notifications
│   └── modules/
│       ├── director.js         # Director Portal: Rollup KPIs, charts & drilldown
│       ├── hotel.js            # Hotel: Room grid, check-in/out, folios & reservations
│       ├── station.js          # Petrol Station: Fuel pumps, oil stock & internal usage
│       ├── shop.js             # Shop: POS checkout, product catalog & COGS analytics
│       ├── restaurant.js       # Restaurant: Dining floor plan & hotel room billing
│       ├── employee.js         # Employee & Salary: Punch clock, shifts & payslips
│       ├── ledger.js           # Central Financial Ledger: Transaction accounting
│       └── audit.js            # Audit Logs: Activity trail, backup & restore
└── README.md                   # Comprehensive documentation
```
