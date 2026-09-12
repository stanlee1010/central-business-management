/**
 * Kigala Hotel Ltd - Central Business Management System (CBMS) Store
 * Implements a shared database with localStorage persistence,
 * financial formulas (Revenue - COGS - OpEx = Net Profit),
 * pre-seeded benchmark data matching the PDF specification,
 * inventory movements, and immutable audit logs.
 */

const CBMS_STORAGE_KEY = 'cbms_kigala_database_v4';

// Benchmark data matching PDF Section 2:
// Hotel: €25,000 Sales | €10,000 Expenses | €15,000 Net Profit
// Petrol Station: €30,000 Sales | €15,000 Expenses | €15,000 Net Profit
// Shop: €8,500 Sales | €3,200 Expenses | €5,300 Net Profit
// Restaurant: €5,000 Sales | €1,000 Expenses | €4,000 Net Profit
// TOTAL: €68,500 Sales | €29,200 Expenses | €39,300 Net Profit

const DEFAULT_SEED_DATA = {
    companyName: 'Kigala Hotel Ltd',
    currentUser: {
        id: 'usr_dir_01',
        name: 'Arthur Vance',
        role: 'director',
        department: 'Kigala Executive Board',
        email: 'director@kigala-hotel.com'
    },

    users: [
        { id: 'usr_dir_01', email: 'director@kigala-hotel.com', password: 'director123', name: 'Arthur Vance', role: 'director', department: 'Executive', title: 'Managing Director' },
        { id: 'usr_hm_01', email: 'hotel.manager@kigala-hotel.com', password: 'hotel123', name: 'Elena Rostova', role: 'hotel_manager', department: 'Hotel', title: 'General Hotel Manager' },
        { id: 'usr_sm_01', email: 'station.manager@kigala-hotel.com', password: 'station123', name: 'Marcus Cole', role: 'station_manager', department: 'Petrol Station', title: 'Station Operations Manager' },
        { id: 'usr_shm_01', email: 'shop.manager@kigala-hotel.com', password: 'shop123', name: 'Sarah Jenkins', role: 'shop_manager', department: 'Shop', title: 'Retail Shop Manager' },
        { id: 'usr_rec_01', email: 'reception@kigala-hotel.com', password: 'reception123', name: 'Liam O\'Connor', role: 'receptionist', department: 'Hotel', title: 'Front Desk Lead' },
        { id: 'usr_rst_01', email: 'restaurant@kigala-hotel.com', password: 'dining123', name: 'Chloe Bennett', role: 'restaurant_staff', department: 'Restaurant', title: 'Head Waiter' },
        { id: 'usr_emp_01', email: 'employee@kigala-hotel.com', password: 'staff123', name: 'David Miller', role: 'employee', department: 'Operations', title: 'Senior Service Technician' }
    ],

    transactions: [
        // HOTEL (Sales: €25,000, Expenses: €10,000 => Net: €15,000)
        { id: 'TX-H-001', date: '2026-09-01', business: 'hotel', type: 'revenue', category: 'Room Bookings', amount: 16500, employee: 'Elena Rostova', description: 'Monthly corporate room reservations' },
        { id: 'TX-H-002', date: '2026-09-03', business: 'hotel', type: 'revenue', category: 'Transient Stays', amount: 6200, employee: 'Liam O\'Connor', description: 'Walk-in & weekend leisure bookings' },
        { id: 'TX-H-003', date: '2026-09-05', business: 'hotel', type: 'revenue', category: 'Conference & Events', amount: 2300, employee: 'Elena Rostova', description: 'Banquet hall rental & AV equipment' },
        { id: 'TX-H-004', date: '2026-09-02', business: 'hotel', type: 'expense', category: 'Housekeeping & Linens', amount: 3500, employee: 'Elena Rostova', description: 'Linen laundry service & toiletries restock' },
        { id: 'TX-H-005', date: '2026-09-04', business: 'hotel', type: 'expense', category: 'Utilities & HVAC', amount: 4200, employee: 'Elena Rostova', description: 'Electricity, water & HVAC maintenance' },
        { id: 'TX-H-006', date: '2026-09-06', business: 'hotel', type: 'expense', category: 'OTA Commissions & Software', amount: 2300, employee: 'Elena Rostova', description: 'Channel manager & booking commission fees' },

        // PETROL STATION (Sales: €30,000, Expenses: €15,000 => Net: €15,000)
        { id: 'TX-P-001', date: '2026-09-01', business: 'station', type: 'revenue', category: 'Euro 95 Fuel Sales', amount: 18500, employee: 'Marcus Cole', description: 'Euro 95 Unleaded fuel dispensed (10,571 Liters)' },
        { id: 'TX-P-002', date: '2026-09-02', business: 'station', type: 'revenue', category: 'Diesel Fuel Sales', amount: 8700, employee: 'Marcus Cole', description: 'Ultra Diesel fuel dispensed (5,272 Liters)' },
        { id: 'TX-P-003', date: '2026-09-04', business: 'station', type: 'revenue', category: 'Oil & Lubricant Sales', amount: 2800, employee: 'Marcus Cole', description: 'Over-the-counter engine oil & fluids' },
        { id: 'TX-P-004', date: '2026-09-02', business: 'station', type: 'expense', category: 'Fuel Wholesale Supply', amount: 11200, employee: 'Marcus Cole', description: 'Tanker fuel bulk delivery payment' },
        { id: 'TX-P-005', date: '2026-09-03', business: 'station', type: 'expense', category: 'Pump Maintenance & Power', amount: 2300, employee: 'Marcus Cole', description: 'Calibrated pump meter service & station power' },
        { id: 'TX-P-006', date: '2026-09-05', business: 'station', type: 'expense', category: 'Lubricant Wholesale Batch', amount: 1350, employee: 'Marcus Cole', description: 'Synthetic 5W-30 and 15W-40 pallet restock' },
        { id: 'TX-P-007', date: '2026-09-06', business: 'station', type: 'expense', category: 'Internal Vehicle Maintenance', amount: 150, employee: 'Marcus Cole', description: 'Internal usage: 10L Synthetic 5W-30 for Company Van #2' },

        // SHOP (Sales: €8,500, Expenses: €3,200 => Net: €5,300)
        { id: 'TX-S-001', date: '2026-09-01', business: 'shop', type: 'revenue', category: 'Convenience & Beverages', amount: 4800, employee: 'Sarah Jenkins', description: 'Cold drinks, packaged snacks, confectionery' },
        { id: 'TX-S-002', date: '2026-09-03', business: 'shop', type: 'revenue', category: 'Auto Accessories & Travel', amount: 2600, employee: 'Sarah Jenkins', description: 'Car chargers, wipers, road maps, sunglasses' },
        { id: 'TX-S-003', date: '2026-09-05', business: 'shop', type: 'revenue', category: 'Tobacco & Magazines', amount: 1100, employee: 'Sarah Jenkins', description: 'Periodicals, tobacco, local newsprints' },
        { id: 'TX-S-004', date: '2026-09-02', business: 'shop', type: 'expense', category: 'COGS - Wholesale Inventory', amount: 2400, employee: 'Sarah Jenkins', description: 'Distributor invoice for retail goods' },
        { id: 'TX-S-005', date: '2026-09-04', business: 'shop', type: 'expense', category: 'Shop POS & Refrigeration', amount: 800, employee: 'Sarah Jenkins', description: 'Cooler electricity and barcode scanner renewal' },

        // RESTAURANT (Sales: €5,000, Expenses: €1,000 => Net: €4,000)
        { id: 'TX-R-001', date: '2026-09-01', business: 'restaurant', type: 'revenue', category: 'Dine-in Food Sales', amount: 3200, employee: 'Chloe Bennett', description: 'A la carte dinners and daily chef specials' },
        { id: 'TX-R-002', date: '2026-09-03', business: 'restaurant', type: 'revenue', category: 'Bar & Beverages', amount: 1200, employee: 'Chloe Bennett', description: 'Wines, cocktails, artisan coffees' },
        { id: 'TX-R-003', date: '2026-09-05', business: 'restaurant', type: 'revenue', category: 'Room Service Deliveries', amount: 600, employee: 'Chloe Bennett', description: 'Room service billed to Hotel Guests' },
        { id: 'TX-R-004', date: '2026-09-02', business: 'restaurant', type: 'expense', category: 'Fresh Ingredients & Produce', amount: 750, employee: 'Chloe Bennett', description: 'Local butcher, organic dairy and produce delivery' },
        { id: 'TX-R-005', date: '2026-09-04', business: 'restaurant', type: 'expense', category: 'Kitchen Gas & Disposables', amount: 250, employee: 'Chloe Bennett', description: 'Commercial kitchen gas & eco takeaway containers' }
    ],

    hotel: {
        contact: {
            email: 'kigalahotel@gmail.com',
            phone: '+255 763 240 076',
            whatsapp: '+255 763 240 076'
        },
        rooms: [
            // FLOOR 1 (Rooms 101 - 108)
            { id: 101, number: '101', floor: 1, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 102, number: '102', floor: 1, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'occupied', guest: 'Dr. Alan Vance', checkIn: '2026-09-06', checkOut: '2026-09-09', folioCharges: 60 },
            { id: 103, number: '103', floor: 1, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 104, number: '104', floor: 1, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'reserved', guest: 'Michael Chang', checkIn: '2026-09-08', checkOut: '2026-09-12', folioCharges: 0 },
            { id: 105, number: '105', floor: 1, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 106, number: '106', floor: 1, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 107, number: '107', floor: 1, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'occupied', guest: 'Sophie Laurent', checkIn: '2026-09-07', checkOut: '2026-09-10', folioCharges: 90 },
            { id: 108, number: '108', floor: 1, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },

            // FLOOR 2 (Rooms 201 - 208)
            { id: 201, number: '201', floor: 2, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 202, number: '202', floor: 2, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 203, number: '203', floor: 2, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'maintenance', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 204, number: '204', floor: 2, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'occupied', guest: 'Juma Mwamba', checkIn: '2026-09-06', checkOut: '2026-09-09', folioCharges: 60 },
            { id: 205, number: '205', floor: 2, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 206, number: '206', floor: 2, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 207, number: '207', floor: 2, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'reserved', guest: 'Fatma Bakari', checkIn: '2026-09-08', checkOut: '2026-09-11', folioCharges: 0 },
            { id: 208, number: '208', floor: 2, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },

            // FLOOR 3 (Rooms 301 - 308)
            { id: 301, number: '301', floor: 3, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'occupied', guest: 'Baroness Helena Ward', checkIn: '2026-09-05', checkOut: '2026-09-10', folioCharges: 150 },
            { id: 302, number: '302', floor: 3, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 303, number: '303', floor: 3, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 304, number: '304', floor: 3, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'occupied', guest: 'Emmanuel Shayo', checkIn: '2026-09-07', checkOut: '2026-09-11', folioCharges: 80 },
            { id: 305, number: '305', floor: 3, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 306, number: '306', floor: 3, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 307, number: '307', floor: 3, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 308, number: '308', floor: 3, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },

            // FLOOR 4 (Rooms 401 - 408)
            { id: 401, number: '401', floor: 4, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 402, number: '402', floor: 4, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'occupied', guest: 'Grace Mallya', checkIn: '2026-09-06', checkOut: '2026-09-09', folioCharges: 60 },
            { id: 403, number: '403', floor: 4, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 404, number: '404', floor: 4, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 405, number: '405', floor: 4, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 406, number: '406', floor: 4, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 407, number: '407', floor: 4, type: 'Deluxe Room', rateTsh: 70000, rateUsd: 30, rate: 30, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 408, number: '408', floor: 4, type: 'Standard Room', rateTsh: 50000, rateUsd: 20, rate: 20, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },

            // FLOOR 5 (Superior Standard 502,504,506,508 + Twins Rooms 501,503,505,507 - Book via Contact/Call)
            { id: 501, number: '501', floor: 5, type: 'Twins Room', rateTsh: 90000, rateUsd: 35, rate: 35, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0, bookViaCall: true },
            { id: 502, number: '502', floor: 5, type: 'Superior Standard Room', rateTsh: 60000, rateUsd: 25, rate: 25, status: 'occupied', guest: 'Hamisi Kikwete', checkIn: '2026-09-07', checkOut: '2026-09-11', folioCharges: 100 },
            { id: 503, number: '503', floor: 5, type: 'Twins Room', rateTsh: 90000, rateUsd: 35, rate: 35, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0, bookViaCall: true },
            { id: 504, number: '504', floor: 5, type: 'Superior Standard Room', rateTsh: 60000, rateUsd: 25, rate: 25, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 505, number: '505', floor: 5, type: 'Twins Room', rateTsh: 90000, rateUsd: 35, rate: 35, status: 'reserved', guest: 'Dr. Kassim Majaliwa', checkIn: '2026-09-09', checkOut: '2026-09-13', folioCharges: 0, bookViaCall: true },
            { id: 506, number: '506', floor: 5, type: 'Superior Standard Room', rateTsh: 60000, rateUsd: 25, rate: 25, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 },
            { id: 507, number: '507', floor: 5, type: 'Twins Room', rateTsh: 90000, rateUsd: 35, rate: 35, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0, bookViaCall: true },
            { id: 508, number: '508', floor: 5, type: 'Superior Standard Room', rateTsh: 60000, rateUsd: 25, rate: 25, status: 'available', guest: null, checkIn: null, checkOut: null, folioCharges: 0 }
        ],
        reservations: [
            { id: 'RES-801', guest: 'Michael Chang', room: '104', type: 'Deluxe Room', checkIn: '2026-09-08', checkOut: '2026-09-12', guestsCount: 2, depositPaid: 60, status: 'confirmed' },
            { id: 'RES-802', guest: 'Fatma Bakari', room: '207', type: 'Deluxe Room', checkIn: '2026-09-08', checkOut: '2026-09-11', guestsCount: 2, depositPaid: 60, status: 'confirmed' },
            { id: 'RES-803', guest: 'Dr. Kassim Majaliwa', room: '505', type: 'Twins Room', checkIn: '2026-09-09', checkOut: '2026-09-13', guestsCount: 2, depositPaid: 70, status: 'confirmed' }
        ]
    },

    station: {
        tanks: [
            { id: 'tank_petrol', name: 'Euro 95 Unleaded', capacityLiters: 40000, currentLiters: 28420, pricePerLiter: 1.75, costPerLiter: 1.06, status: 'good' },
            { id: 'tank_diesel', name: 'Ultra Diesel', capacityLiters: 35000, currentLiters: 21850, pricePerLiter: 1.65, costPerLiter: 0.98, status: 'good' }
        ],
        lubricants: [
            { id: 'oil_5w30', name: 'Synthetic 5W-30 Engine Oil', sku: 'LUB-5W30', stockLiters: 240, minThreshold: 50, costPerLiter: 9.50, pricePerLiter: 15.00 },
            { id: 'oil_15w40', name: 'Heavy Duty 15W-40 Diesel Oil', sku: 'LUB-15W40', stockLiters: 380, minThreshold: 80, costPerLiter: 8.00, pricePerLiter: 13.50 },
            { id: 'oil_trans', name: 'Automatic Transmission Fluid (ATF)', sku: 'LUB-ATF', stockLiters: 120, minThreshold: 30, costPerLiter: 11.00, pricePerLiter: 18.00 },
            { id: 'oil_brake', name: 'DOT 4 High Temp Brake Fluid', sku: 'LUB-DOT4', stockLiters: 85, minThreshold: 25, costPerLiter: 7.50, pricePerLiter: 12.00 }
        ],
        recentUsage: [
            { id: 'USE-01', date: '2026-09-06 09:30', oilName: 'Synthetic 5W-30 Engine Oil', liters: 10, costValue: 150, targetVehicle: 'Company Van #2 (Plate: AG-902-BX)', authorizedBy: 'Marcus Cole', status: 'approved' },
            { id: 'USE-02', date: '2026-08-28 14:15', oilName: 'Heavy Duty 15W-40 Diesel Oil', liters: 15, costValue: 202.50, targetVehicle: 'Hotel Courtesy Shuttle #1', authorizedBy: 'Marcus Cole', status: 'approved' }
        ]
    },

    shop: {
        products: [
            { id: 'PRD-01', barcode: '840101', name: 'Sparkling Mineral Water 500ml', category: 'Beverages', purchasePrice: 0.65, sellingPrice: 1.80, stock: 145, minStock: 30, supplier: 'Alpine Spring Beverages' },
            { id: 'PRD-02', barcode: '840102', name: 'Artisan Energy Bar (Peanut Butter)', category: 'Snacks', purchasePrice: 1.10, sellingPrice: 2.75, stock: 82, minStock: 20, supplier: 'BioNutrition GmbH' },
            { id: 'PRD-03', barcode: '840103', name: 'Universal Car Fast Charger 65W', category: 'Accessories', purchasePrice: 8.50, sellingPrice: 22.00, stock: 19, minStock: 10, supplier: 'AutoTech Electronics' },
            { id: 'PRD-04', barcode: '840104', name: 'Windshield Wiper Blades Pair 22"', category: 'Accessories', purchasePrice: 11.00, sellingPrice: 24.50, stock: 14, minStock: 8, supplier: 'Vance Auto Parts' },
            { id: 'PRD-05', barcode: '840105', name: 'Organic Colombian Dark Roast Coffee Can', category: 'Beverages', purchasePrice: 1.20, sellingPrice: 3.20, stock: 68, minStock: 25, supplier: 'FairTrade Coffee Co' },
            { id: 'PRD-06', barcode: '840106', name: 'All-Weather Highway First Aid Kit', category: 'Safety', purchasePrice: 14.00, sellingPrice: 29.90, stock: 9, minStock: 5, supplier: 'MedGuard Safety' },
            { id: 'PRD-07', barcode: '840107', name: 'Swiss Dark Chocolate Bar 100g', category: 'Snacks', purchasePrice: 1.40, sellingPrice: 3.50, stock: 94, minStock: 25, supplier: 'ChocoCraft Global' }
        ],
        suppliers: [
            { id: 'SUP-01', name: 'Alpine Spring Beverages', contact: 'sales@alpinespring.com', leadDays: 2 },
            { id: 'SUP-02', name: 'AutoTech Electronics', contact: 'order@autotech.de', leadDays: 4 },
            { id: 'SUP-03', name: 'BioNutrition GmbH', contact: 'orders@bionutrition.com', leadDays: 3 }
        ]
    },

    restaurant: {
        tables: [
            { id: 1, number: 1, capacity: 2, status: 'occupied', guests: 2, orderTotal: 64.50, orderItems: ['Truffle Tagliatelle', 'House Pinot Noir'], linkedRoom: null },
            { id: 2, number: 2, capacity: 4, status: 'available', guests: 0, orderTotal: 0, orderItems: [], linkedRoom: null },
            { id: 3, number: 3, capacity: 4, status: 'occupied', guests: 3, orderTotal: 128.00, orderItems: ['Dry-Aged Ribeye x2', 'Caesar Salad', 'San Pellegrino x2'], linkedRoom: '102' },
            { id: 4, number: 4, capacity: 6, status: 'reserved', guests: 5, orderTotal: 0, orderItems: [], linkedRoom: null },
            { id: 5, number: 5, capacity: 2, status: 'available', guests: 0, orderTotal: 0, orderItems: [], linkedRoom: null },
            { id: 6, number: 6, capacity: 8, status: 'available', guests: 0, orderTotal: 0, orderItems: [], linkedRoom: null },
            { id: 7, number: 7, capacity: 2, status: 'bill_requested', guests: 2, orderTotal: 86.00, orderItems: ['Mediterranean Sea Bass', 'Warm Chocolate Fondant', 'Espresso x2'], linkedRoom: null },
            { id: 8, number: 8, capacity: 4, status: 'available', guests: 0, orderTotal: 0, orderItems: [], linkedRoom: null }
        ],
        menu: [
            { id: 'MENU-01', name: 'Truffle Tagliatelle', category: 'Mains', price: 24.50, cost: 6.20 },
            { id: 'MENU-02', name: 'Dry-Aged Prime Ribeye 300g', category: 'Mains', price: 38.00, cost: 11.50 },
            { id: 'MENU-03', name: 'Mediterranean Sea Bass Filet', category: 'Mains', price: 29.00, cost: 8.00 },
            { id: 'MENU-04', name: 'Crispy Calamari & Lemon Aioli', category: 'Starters', price: 14.50, cost: 3.80 },
            { id: 'MENU-05', name: 'Burrata Caprese Salad', category: 'Starters', price: 13.50, cost: 3.20 },
            { id: 'MENU-06', name: 'Warm Chocolate Fondant', category: 'Desserts', price: 10.50, cost: 2.10 },
            { id: 'MENU-07', name: 'Tiramisu Tradizionale', category: 'Desserts', price: 9.50, cost: 1.90 },
            { id: 'MENU-08', name: 'House Reserve Pinot Noir (Glass)', category: 'Beverages', price: 9.00, cost: 2.40 },
            { id: 'MENU-09', name: 'Signature Espresso Double', category: 'Beverages', price: 3.50, cost: 0.50 }
        ]
    },

    employees: [
        {
            id: 'usr_dir_01',
            name: 'Arthur Vance',
            role: 'director',
            department: 'Executive',
            baseSalaryMonthly: 8500,
            hourlyRate: 50,
            clockedIn: true,
            clockInTime: '2026-09-07T08:00:00Z',
            daysWorkedMonth: 18,
            hoursWorkedMonth: 144,
            overtimeHours: 6,
            allowances: { housing: 800, transport: 400, performanceBonus: 1200 },
            deductions: { incomeTax: 2150, socialSecurity: 450, healthInsurance: 320 }
        },
        {
            id: 'usr_hm_01',
            name: 'Elena Rostova',
            role: 'hotel_manager',
            department: 'Hotel',
            baseSalaryMonthly: 4200,
            hourlyRate: 26.25,
            clockedIn: true,
            clockInTime: '2026-09-07T08:30:00Z',
            daysWorkedMonth: 17,
            hoursWorkedMonth: 136,
            overtimeHours: 4,
            allowances: { housing: 350, transport: 200, performanceBonus: 400 },
            deductions: { incomeTax: 860, socialSecurity: 260, healthInsurance: 180 }
        },
        {
            id: 'usr_sm_01',
            name: 'Marcus Cole',
            role: 'station_manager',
            department: 'Petrol Station',
            baseSalaryMonthly: 3800,
            hourlyRate: 23.75,
            clockedIn: true,
            clockInTime: '2026-09-07T07:45:00Z',
            daysWorkedMonth: 18,
            hoursWorkedMonth: 144,
            overtimeHours: 8,
            allowances: { housing: 300, transport: 250, performanceBonus: 300 },
            deductions: { incomeTax: 780, socialSecurity: 240, healthInsurance: 170 }
        },
        {
            id: 'usr_shm_01',
            name: 'Sarah Jenkins',
            role: 'shop_manager',
            department: 'Shop',
            baseSalaryMonthly: 3400,
            hourlyRate: 21.25,
            clockedIn: false,
            clockInTime: null,
            daysWorkedMonth: 16,
            hoursWorkedMonth: 128,
            overtimeHours: 2,
            allowances: { housing: 250, transport: 180, performanceBonus: 250 },
            deductions: { incomeTax: 680, socialSecurity: 220, healthInsurance: 160 }
        },
        {
            id: 'usr_rec_01',
            name: 'Liam O\'Connor',
            role: 'receptionist',
            department: 'Hotel',
            baseSalaryMonthly: 2600,
            hourlyRate: 16.25,
            clockedIn: true,
            clockInTime: '2026-09-07T09:00:00Z',
            daysWorkedMonth: 17,
            hoursWorkedMonth: 136,
            overtimeHours: 3,
            allowances: { housing: 150, transport: 150, performanceBonus: 150 },
            deductions: { incomeTax: 450, socialSecurity: 180, healthInsurance: 140 }
        },
        {
            id: 'usr_rst_01',
            name: 'Chloe Bennett',
            role: 'restaurant_staff',
            department: 'Restaurant',
            baseSalaryMonthly: 2400,
            hourlyRate: 15.00,
            clockedIn: true,
            clockInTime: '2026-09-07T11:00:00Z',
            daysWorkedMonth: 15,
            hoursWorkedMonth: 120,
            overtimeHours: 5,
            allowances: { housing: 120, transport: 120, performanceBonus: 180 },
            deductions: { incomeTax: 410, socialSecurity: 170, healthInsurance: 130 }
        },
        {
            id: 'usr_emp_01',
            name: 'David Miller',
            role: 'employee',
            department: 'Operations',
            baseSalaryMonthly: 2750,
            hourlyRate: 17.18,
            clockedIn: true,
            clockInTime: '2026-09-07T08:00:00Z',
            daysWorkedMonth: 17,
            hoursWorkedMonth: 136,
            overtimeHours: 4,
            allowances: { housing: 160, transport: 180, performanceBonus: 200 },
            deductions: { incomeTax: 480, socialSecurity: 190, healthInsurance: 145 }
        }
    ],

    auditLogs: [
        { id: 'LOG-101', timestamp: '2026-09-07 16:45:12', user: 'Marcus Cole', role: 'station_manager', module: 'Petrol Station', action: 'INTERNAL_USAGE', details: 'Deducted 10 Liters of Synthetic 5W-30 for Company Van #2. Station expense recorded: €150.00' },
        { id: 'LOG-102', timestamp: '2026-09-07 15:20:04', user: 'Liam O\'Connor', role: 'receptionist', module: 'Hotel', action: 'CHECK_IN', details: 'Checked in guest Sophie Laurent to Deluxe Double Room 102. Assigned key card #8821' },
        { id: 'LOG-103', timestamp: '2026-09-07 14:10:33', user: 'Chloe Bennett', role: 'restaurant_staff', module: 'Restaurant', action: 'ROOM_CHARGE', details: 'Charged €128.00 restaurant bill (Table 3) to Hotel Room 102 folio' },
        { id: 'LOG-104', timestamp: '2026-09-07 12:05:19', user: 'Sarah Jenkins', role: 'shop_manager', module: 'Shop', action: 'STOCK_RESTOCK', details: 'Received batch delivery of 50 units Universal Fast Chargers from AutoTech Electronics' },
        { id: 'LOG-105', timestamp: '2026-09-07 09:15:00', user: 'Arthur Vance', role: 'director', module: 'Director Portal', action: 'FINANCIAL_EXPORT', details: 'Generated Q3 consolidated financial audit summary for board review' },
        { id: 'LOG-106', timestamp: '2026-09-07 08:00:15', user: 'David Miller', role: 'employee', module: 'Employee Portal', action: 'CLOCK_IN', details: 'David Miller clocked in for Day Shift (Operations)' }
    ]
};

class CentralStore {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        try {
            const raw = localStorage.getItem(CBMS_STORAGE_KEY);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            console.error('Failed to parse CBMS state from localStorage, initializing defaults', e);
        }
        this.saveData(DEFAULT_SEED_DATA);
        return JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    }

    saveData(data = this.data) {
        try {
            localStorage.setItem(CBMS_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save CBMS state', e);
        }
    }

    resetToDefaults() {
        this.data = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
        this.saveData();
        this.logAudit('System Admin', 'director', 'DATABASE_RESET', 'System', 'Database re-seeded to PDF benchmark default state.');
        return this.data;
    }

    authenticateUser(email, password) {
        if (!email || !password) {
            throw new Error('Please provide both email and password.');
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = this.data.users.find(u => u.email && u.email.toLowerCase() === normalizedEmail);

        if (!user || user.password !== password) {
            this.logAudit('Unknown', 'guest', 'AUTH_FAILED', 'Security', `Failed login attempt for email: ${email}`);
            throw new Error('Invalid email or password. Please verify your credentials.');
        }

        this.data.currentUser = JSON.parse(JSON.stringify(user));
        this.saveData();
        this.logAudit(user.name, user.role, 'AUTH_SUCCESS', 'Security', `Successful authentication for ${user.name} (${user.role}).`);
        return this.data.currentUser;
    }

    setCurrentUser(userId) {
        const user = this.data.users.find(u => u.id === userId);
        if (user) {
            this.data.currentUser = JSON.parse(JSON.stringify(user));
            this.saveData();
            this.logAudit(user.name, user.role, 'AUTH_ROLE_SWITCH', 'Security', `Session switched to role ${user.role} (${user.title})`);
            return this.data.currentUser;
        }
        return null;
    }

    getCurrentUser() {
        return this.data.currentUser;
    }

    getFinancialTotals(businessFilter = null) {
        let list = this.data.transactions;
        if (businessFilter && businessFilter !== 'all') {
            list = list.filter(tx => tx.business === businessFilter);
        }

        const sales = list.filter(t => t.type === 'revenue').reduce((acc, t) => acc + Number(t.amount), 0);
        const expenses = list.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
        const netProfit = sales - expenses;
        const profitMargin = sales > 0 ? ((netProfit / sales) * 100).toFixed(1) : 0;

        return { sales, expenses, netProfit, profitMargin, count: list.length };
    }

    getFinancialsByBusiness() {
        const businesses = ['hotel', 'station', 'shop', 'restaurant'];
        const result = {};

        businesses.forEach(b => {
            const list = this.data.transactions.filter(t => t.business === b);
            const sales = list.filter(t => t.type === 'revenue').reduce((acc, t) => acc + Number(t.amount), 0);
            const expenses = list.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
            const netProfit = sales - expenses;
            const margin = sales > 0 ? ((netProfit / sales) * 100).toFixed(1) : 0;

            result[b] = { sales, expenses, netProfit, margin, transactionCount: list.length };
        });

        return result;
    }

    addTransaction(tx) {
        const newTx = {
            id: 'TX-' + Date.now().toString(36).toUpperCase(),
            date: tx.date || new Date().toISOString().split('T')[0],
            business: tx.business,
            type: tx.type,
            category: tx.category,
            amount: parseFloat(tx.amount),
            employee: tx.employee || this.data.currentUser.name,
            description: tx.description || ''
        };
        this.data.transactions.unshift(newTx);
        this.saveData();

        this.logAudit(
            this.data.currentUser.name,
            this.data.currentUser.role,
            'TRANSACTION_CREATED',
            tx.business.toUpperCase(),
            `Recorded ${newTx.type} €${newTx.amount.toFixed(2)} [${newTx.category}]: ${newTx.description}`
        );

        return newTx;
    }

    recordInternalOilUsage(oilId, liters, targetVehicle, notes) {
        const oil = this.data.station.lubricants.find(o => o.id === oilId);
        if (!oil) throw new Error('Lubricant item not found');
        if (oil.stockLiters < liters) throw new Error(`Insufficient inventory: only ${oil.stockLiters}L available`);

        oil.stockLiters -= liters;
        const totalValue = liters * oil.pricePerLiter;

        this.addTransaction({
            business: 'station',
            type: 'expense',
            category: 'Internal Vehicle Maintenance',
            amount: totalValue,
            employee: this.data.currentUser.name,
            description: `Internal usage: ${liters}L of ${oil.name} for ${targetVehicle}. Note: ${notes || 'Standard maintenance'}`
        });

        const usageRecord = {
            id: 'USE-' + Date.now().toString(36).toUpperCase(),
            date: new Date().toLocaleString(),
            oilName: oil.name,
            liters: Number(liters),
            costValue: totalValue,
            targetVehicle: targetVehicle,
            authorizedBy: this.data.currentUser.name,
            status: 'approved'
        };
        this.data.station.recentUsage.unshift(usageRecord);

        this.logAudit(
            this.data.currentUser.name,
            this.data.currentUser.role,
            'INTERNAL_OIL_USAGE',
            'Petrol Station',
            `Dispensed ${liters}L of ${oil.name} for vehicle [${targetVehicle}]. Valuation: €${totalValue.toFixed(2)} booked as station operating expense.`
        );

        this.saveData();
        return { success: true, usageRecord, remainingStock: oil.stockLiters };
    }

    recordFuelSale(tankId, litersDispensed) {
        const tank = this.data.station.tanks.find(t => t.id === tankId);
        if (!tank) throw new Error('Fuel tank not found');
        if (tank.currentLiters < litersDispensed) throw new Error('Tank level insufficient for requested liters');

        tank.currentLiters -= litersDispensed;
        const totalSale = litersDispensed * tank.pricePerLiter;

        this.addTransaction({
            business: 'station',
            type: 'revenue',
            category: `${tank.name} Sales`,
            amount: totalSale,
            employee: this.data.currentUser.name,
            description: `Dispensed ${litersDispensed} L of ${tank.name} @ €${tank.pricePerLiter}/L`
        });

        this.saveData();
        return { success: true, totalSale, remainingTank: tank.currentLiters };
    }

    checkInHotelGuest(roomId, guestName, daysStay) {
        const room = this.data.hotel.rooms.find(r => r.id === Number(roomId));
        if (!room) throw new Error('Room not found');

        const now = new Date();
        const checkInStr = now.toISOString().split('T')[0];
        const checkOutDate = new Date(now.getTime() + (daysStay * 24 * 60 * 60 * 1000));
        const checkOutStr = checkOutDate.toISOString().split('T')[0];
        const roomTotal = room.rate * daysStay;

        room.status = 'occupied';
        room.guest = guestName;
        room.checkIn = checkInStr;
        room.checkOut = checkOutStr;
        room.folioCharges = roomTotal;

        this.logAudit(
            this.data.currentUser.name,
            this.data.currentUser.role,
            'GUEST_CHECK_IN',
            'Hotel',
            `Guest ${guestName} checked in to Room ${room.number} (${room.type}) for ${daysStay} nights. Base folio: €${roomTotal}`
        );

        this.saveData();
        return room;
    }

    checkOutHotelGuest(roomId, paymentMethod = 'Credit Card') {
        const room = this.data.hotel.rooms.find(r => r.id === Number(roomId));
        if (!room || room.status !== 'occupied') throw new Error('Room is not currently occupied');

        const guestName = room.guest;
        const finalFolio = room.folioCharges;

        this.addTransaction({
            business: 'hotel',
            type: 'revenue',
            category: 'Room & Guest Invoicing',
            amount: finalFolio,
            employee: this.data.currentUser.name,
            description: `Checkout settlement for ${guestName} (Room ${room.number}): Paid via ${paymentMethod}`
        });

        this.logAudit(
            this.data.currentUser.name,
            this.data.currentUser.role,
            'GUEST_CHECK_OUT',
            'Hotel',
            `Guest ${guestName} checked out of Room ${room.number}. Settled €${finalFolio.toFixed(2)} via ${paymentMethod}`
        );

        room.status = 'available';
        room.guest = null;
        room.checkIn = null;
        room.checkOut = null;
        room.folioCharges = 0;

        this.saveData();
        return { guestName, finalFolio };
    }

    processRestaurantOrder(tableId, orderItems, chargeToRoom = null) {
        const table = this.data.restaurant.tables.find(t => t.id === Number(tableId));
        if (!table) throw new Error('Table not found');

        let total = 0;
        const itemNames = [];
        orderItems.forEach(item => {
            total += item.price * (item.quantity || 1);
            itemNames.push(`${item.quantity || 1}x ${item.name}`);
        });

        table.orderItems = itemNames;
        table.orderTotal = total;
        table.status = 'occupied';

        if (chargeToRoom) {
            const room = this.data.hotel.rooms.find(r => r.number === String(chargeToRoom));
            if (!room || room.status !== 'occupied') {
                throw new Error(`Room ${chargeToRoom} is not currently occupied or invalid`);
            }
            room.folioCharges += total;
            table.linkedRoom = String(chargeToRoom);

            this.logAudit(
                this.data.currentUser.name,
                this.data.currentUser.role,
                'ROOM_SERVICE_CHARGE',
                'Restaurant -> Hotel',
                `Charged €${total.toFixed(2)} from Table ${table.number} to Hotel Room ${chargeToRoom} (${room.guest})`
            );
        } else {
            this.addTransaction({
                business: 'restaurant',
                type: 'revenue',
                category: 'Dine-in Food & Beverage',
                amount: total,
                employee: this.data.currentUser.name,
                description: `Table ${table.number} order: ${itemNames.join(', ')}`
            });
        }

        this.saveData();
        return { total, itemNames };
    }

    processShopSale(cartItems, paymentMethod = 'Cash') {
        if (!cartItems || cartItems.length === 0) throw new Error('Cart is empty');

        let totalRevenue = 0;
        let totalCOGS = 0;
        const purchasedNames = [];

        cartItems.forEach(item => {
            const product = this.data.shop.products.find(p => p.id === item.id);
            if (product) {
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name} (Only ${product.stock} left)`);
                }
                product.stock -= item.quantity;
                const lineRevenue = product.sellingPrice * item.quantity;
                const lineCOGS = product.purchasePrice * item.quantity;

                totalRevenue += lineRevenue;
                totalCOGS += lineCOGS;
                purchasedNames.push(`${item.quantity}x ${product.name}`);
            }
        });

        this.addTransaction({
            business: 'shop',
            type: 'revenue',
            category: 'Retail POS Sales',
            amount: totalRevenue,
            employee: this.data.currentUser.name,
            description: `POS Sale: ${purchasedNames.join(', ')} (Payment: ${paymentMethod})`
        });

        this.logAudit(
            this.data.currentUser.name,
            this.data.currentUser.role,
            'SHOP_POS_SALE',
            'Shop',
            `Sold items [${purchasedNames.join(', ')}]. Total: €${totalRevenue.toFixed(2)}, COGS: €${totalCOGS.toFixed(2)}`
        );

        this.saveData();
        return { totalRevenue, totalCOGS, grossProfit: totalRevenue - totalCOGS };
    }

    toggleEmployeeClock(empId) {
        const emp = this.data.employees.find(e => e.id === empId);
        if (!emp) throw new Error('Employee not found');

        emp.clockedIn = !emp.clockedIn;
        if (emp.clockedIn) {
            emp.clockInTime = new Date().toISOString();
            this.logAudit(emp.name, emp.role, 'CLOCK_IN', 'Employee Portal', `${emp.name} clocked in.`);
        } else {
            emp.hoursWorkedMonth += 8;
            emp.daysWorkedMonth += 1;
            this.logAudit(emp.name, emp.role, 'CLOCK_OUT', 'Employee Portal', `${emp.name} clocked out. Total monthly hours: ${emp.hoursWorkedMonth}`);
        }

        this.saveData();
        return emp;
    }

    calculatePayslip(empId) {
        const emp = this.data.employees.find(e => e.id === empId);
        if (!emp) throw new Error('Employee not found');

        const base = emp.baseSalaryMonthly;
        const overtimePay = (emp.overtimeHours || 0) * (emp.hourlyRate * 1.5);
        const allowancesSum = Object.values(emp.allowances || {}).reduce((a, b) => a + b, 0);
        const grossPay = base + overtimePay + allowancesSum;

        const deductionsSum = Object.values(emp.deductions || {}).reduce((a, b) => a + b, 0);
        const netPay = grossPay - deductionsSum;

        return {
            employee: emp,
            baseSalary: base,
            overtimeHours: emp.overtimeHours || 0,
            overtimePay,
            allowances: emp.allowances,
            allowancesSum,
            grossPay,
            deductions: emp.deductions,
            deductionsSum,
            netPay
        };
    }

    logAudit(userName, userRole, action, module, details) {
        const log = {
            id: 'LOG-' + Date.now().toString(36).toUpperCase(),
            timestamp: new Date().toLocaleString(),
            user: userName,
            role: userRole,
            module: module,
            action: action,
            details: details
        };
        this.data.auditLogs.unshift(log);
        if (this.data.auditLogs.length > 200) {
            this.data.auditLogs.pop();
        }
        this.saveData();
        return log;
    }

    exportJson() {
        return JSON.stringify(this.data, null, 2);
    }

    importJson(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.transactions || !parsed.users) throw new Error('Invalid CBMS backup schema');
            this.data = parsed;
            this.saveData();
            this.logAudit(this.data.currentUser.name, 'admin', 'BACKUP_RESTORE', 'System', 'Restored system database from external JSON backup.');
            return true;
        } catch (e) {
            console.error('Import failed', e);
            throw e;
        }
    }
}

window.cbmsStore = new CentralStore();
