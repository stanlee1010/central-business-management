/**
 * Central Business Management System (CBMS) - RBAC & Permissions Engine
 * Defines exact permissions according to PDF Section 8:
 * - Director: All businesses, all financial reports, assets, users, system overview
 * - Hotel Manager: Hotel operations, hotel/restaurant data, authorized staff
 * - Station Manager: Fuel, oil, station sales, inventory, station expenses
 * - Shop Manager: Products, stock, sales, shop expenses
 * - Receptionist: Reservations, guests, rooms, authorized payments
 * - Restaurant Staff: Orders, tables, authorized restaurant functions
 * - Employee: Own attendance, salary, permitted personal information
 */

const CBMS_ROLE_PERMISSIONS = {
    director: {
        name: 'Managing Director',
        badgeClass: 'badge-director',
        description: 'Complete system access, financial drilldown, all business units, audit logs & system controls',
        allowedModules: ['director', 'hotel', 'station', 'shop', 'restaurant', 'employee', 'ledger', 'audit'],
        canDrillDownFinancials: true,
        canViewAllSalaries: true,
        canApproveExpenses: true,
        canExportData: true,
        canResetDatabase: true
    },
    hotel_manager: {
        name: 'Hotel Manager',
        badgeClass: 'badge-hotel',
        description: 'Hotel operations, room inventory, guest folios, restaurant rollup & hotel staff',
        allowedModules: ['hotel', 'restaurant', 'employee', 'ledger'],
        canDrillDownFinancials: false,
        canViewAllSalaries: false,
        canApproveExpenses: true,
        canExportData: false,
        canResetDatabase: false
    },
    station_manager: {
        name: 'Station Manager',
        badgeClass: 'badge-station',
        description: 'Fuel dispensers, lubricant stock, internal vehicle oil usage & station expenses',
        allowedModules: ['station', 'employee', 'ledger'],
        canDrillDownFinancials: false,
        canViewAllSalaries: false,
        canApproveExpenses: true,
        canExportData: false,
        canResetDatabase: false
    },
    shop_manager: {
        name: 'Shop Manager',
        badgeClass: 'badge-shop',
        description: 'Retail POS, stock catalog, purchase/selling prices, suppliers & COGS analytics',
        allowedModules: ['shop', 'employee', 'ledger'],
        canDrillDownFinancials: false,
        canViewAllSalaries: false,
        canApproveExpenses: true,
        canExportData: false,
        canResetDatabase: false
    },
    receptionist: {
        name: 'Hotel Receptionist',
        badgeClass: 'badge-reception',
        description: 'Guest check-in/out, reservations desk, room availability & folio payments',
        allowedModules: ['hotel', 'employee'],
        canDrillDownFinancials: false,
        canViewAllSalaries: false,
        canApproveExpenses: false,
        canExportData: false,
        canResetDatabase: false
    },
    restaurant_staff: {
        name: 'Restaurant Staff',
        badgeClass: 'badge-restaurant',
        description: 'Floor tables, customer orders, kitchen tickets & room-service billing',
        allowedModules: ['restaurant', 'employee'],
        canDrillDownFinancials: false,
        canViewAllSalaries: false,
        canApproveExpenses: false,
        canExportData: false,
        canResetDatabase: false
    },
    employee: {
        name: 'Standard Employee',
        badgeClass: 'badge-employee',
        description: 'Personal shift clock-in/out, hours worked, and own monthly salary payslip',
        allowedModules: ['employee'],
        canDrillDownFinancials: false,
        canViewAllSalaries: false,
        canApproveExpenses: false,
        canExportData: false,
        canResetDatabase: false
    }
};

class RbacEngine {
    constructor() {
        this.roles = CBMS_ROLE_PERMISSIONS;
    }

    getCurrentRole() {
        const user = window.cbmsStore.getCurrentUser();
        return user ? user.role : 'director';
    }

    hasAccess(moduleKey) {
        const role = this.getCurrentRole();
        const perms = this.roles[role];
        if (!perms) return false;
        return perms.allowedModules.includes(moduleKey);
    }

    canPerform(action) {
        const role = this.getCurrentRole();
        const perms = this.roles[role];
        if (!perms) return false;
        return !!perms[action];
    }

    getRoleDetails(roleKey) {
        return this.roles[roleKey] || this.roles.employee;
    }
}

window.cbmsRbac = new RbacEngine();
