/**
 * CBMS - Hotel Module
 * Implements PDF §3:
 * - Reception: reservations, guest registration, check-in/check-out, room status, payments & invoices
 * - Hotel Manager overview: hotel operations, room occupancy, guest folios & room service charges
 */

class HotelModule {
    constructor() {
        this.roomFilter = 'all';
        this.floorFilter = 'all';
        this.viewDate = null; // null = today (live view)
    }

    getTodayStr() {
        return new Date().toISOString().split('T')[0];
    }

    // Projects what a room's status/guest would be on a given date, checking
    // both its current live stay and any future advance reservations for
    // that room number. Returns isLive:true only when the date is today,
    // since only "today" reflects the actual editable/live data.
    getRoomStatusForDate(room, dateStr) {
        const today = this.getTodayStr();

        if (dateStr === today) {
            return { status: room.status, guest: room.guest, checkIn: room.checkIn, checkOut: room.checkOut, isLive: true };
        }

        if (room.status === 'maintenance') {
            return { status: 'maintenance', guest: null, checkIn: null, checkOut: null, isLive: false };
        }

        // Does the room's CURRENT stay cover this date?
        if (room.checkIn && room.checkOut && dateStr >= room.checkIn && dateStr < room.checkOut) {
            return { status: 'occupied', guest: room.guest, checkIn: room.checkIn, checkOut: room.checkOut, isLive: false };
        }

        // Does any advance RESERVATION for this room number cover this date?
        const reservations = window.cbmsStore.data.hotel.reservations || [];
        const match = reservations.find(r => r.room === room.number && dateStr >= r.checkIn && dateStr < r.checkOut);
        if (match) {
            return { status: 'reserved', guest: match.guest, checkIn: match.checkIn, checkOut: match.checkOut, isLive: false };
        }

        return { status: 'available', guest: null, checkIn: null, checkOut: null, isLive: false };
    }

    render(container) {
        const rooms = window.cbmsStore.data.hotel.rooms;
        const reservations = window.cbmsStore.data.hotel.reservations;
        const occupiedCount = rooms.filter(r => r.status === 'occupied').length;
        const availableCount = rooms.filter(r => r.status === 'available').length;
        const reservedCount = rooms.filter(r => r.status === 'reserved').length;
        const maintenanceCount = rooms.filter(r => r.status === 'maintenance').length;
        const occupancyRate = ((occupiedCount / rooms.length) * 100).toFixed(0);

        const todayStr = this.getTodayStr();
        const viewDateStr = this.viewDate || todayStr;
        const isViewingToday = viewDateStr === todayStr;

        // Attach a projected status/guest to each room for the selected date,
        // without touching the room's actual stored data.
        const roomsWithProjection = rooms.map(room => ({
            room,
            projected: this.getRoomStatusForDate(room, viewDateStr)
        }));

        let filteredRooms = roomsWithProjection;
        if (this.roomFilter !== 'all') {
            filteredRooms = filteredRooms.filter(r => r.projected.status === this.roomFilter);
        }
        if (this.floorFilter && this.floorFilter !== 'all') {
            filteredRooms = filteredRooms.filter(r => r.room.floor === Number(this.floorFilter));
        }

        // Counts shown in the filter pills reflect the SELECTED date, not just today
        const projAvailable = roomsWithProjection.filter(r => r.projected.status === 'available').length;
        const projOccupied = roomsWithProjection.filter(r => r.projected.status === 'occupied').length;
        const projReserved = roomsWithProjection.filter(r => r.projected.status === 'reserved').length;

        container.innerHTML = `
            <div class="module-header fade-in">
                <div>
                    <h1 class="page-title">Kigala Hotel Operations & Front Desk</h1>
                    <p class="page-subtitle">40 Rooms Across 5 Floors | Reception Desk, Invoicing & Reservations</p>
                    <div class="text-xs text-muted mt-1">
                        <i data-lucide="mail"></i> kigalahotel@gmail.com &bull; <i data-lucide="phone"></i> Calls & WhatsApp: +255 763 240 076
                    </div>
                </div>
                <div class="header-actions">
                    <button class="btn btn-primary" id="btnOpenCheckIn">
                        <i data-lucide="user-plus"></i> New Guest Check-In
                    </button>
                    <button class="btn btn-outline" id="btnOpenReservation">
                        <i data-lucide="calendar"></i> New Reservation
                    </button>
                </div>
            </div>

            <!-- Hotel KPI Stats -->
            <div class="kpi-grid fade-in">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Current Occupancy</span>
                        <div class="kpi-icon-wrap icon-blue"><i data-lucide="bed"></i></div>
                    </div>
                    <div class="kpi-value">${occupancyRate}%</div>
                    <div class="kpi-meta">
                        <span class="badge-info">${occupiedCount} / ${rooms.length}</span> total rooms occupied
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Rooms Available</span>
                        <div class="kpi-icon-wrap icon-emerald"><i data-lucide="check-circle-2"></i></div>
                    </div>
                    <div class="kpi-value text-emerald">${availableCount}</div>
                    <div class="kpi-meta">
                        Across 4 room categories
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Reserved & Pending</span>
                        <div class="kpi-icon-wrap icon-amber"><i data-lucide="clock"></i></div>
                    </div>
                    <div class="kpi-value text-amber">${reservedCount}</div>
                    <div class="kpi-meta">
                        ${reservations.length} confirmed advance folios
                    </div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Room Inventory Total</span>
                        <div class="kpi-icon-wrap icon-purple"><i data-lucide="building"></i></div>
                    </div>
                    <div class="kpi-value">40 Rooms</div>
                    <div class="kpi-meta">
                        5 Floors (8 Rooms / Floor)
                    </div>
                </div>
            </div>

            <!-- Room List, Floor Filters & Status Filter -->
            <div class="card mt-4 fade-in">
                <div class="card-header">
                    <div class="card-title-group">
                        <h2 class="card-title">Reception - Room & Payments List</h2>
                        <span class="card-hint">Standard (50k TSh/$20) &bull; Superior Standard (60k TSh/$25) &bull; Deluxe (70k TSh/$30) &bull; Twins (90k TSh/$35)</span>
                    </div>

                    <div class="filter-controls-group">
                        <!-- Date Picker -->
                        <div class="role-switcher-wrap mr-2">
                            <span class="role-switcher-label"><i data-lucide="calendar"></i></span>
                            <input type="date" class="role-select" id="hotelViewDate" value="${viewDateStr}" style="cursor:pointer;" />
                        </div>
                        ${!isViewingToday ? `<button class="btn btn-xs btn-outline mr-2" id="btnResetToToday">Today</button>` : ''}

                        <!-- Floor Filter Pills -->
                        <div class="filter-pills mr-2" id="hotelFloorFilters">
                            <button class="pill-btn ${this.floorFilter === 'all' ? 'active' : ''}" data-floor="all">All Floors (40)</button>
                            <button class="pill-btn ${this.floorFilter === '1' ? 'active' : ''}" data-floor="1">Fl 1 (8)</button>
                            <button class="pill-btn ${this.floorFilter === '2' ? 'active' : ''}" data-floor="2">Fl 2 (8)</button>
                            <button class="pill-btn ${this.floorFilter === '3' ? 'active' : ''}" data-floor="3">Fl 3 (8)</button>
                            <button class="pill-btn ${this.floorFilter === '4' ? 'active' : ''}" data-floor="4">Fl 4 (8)</button>
                            <button class="pill-btn ${this.floorFilter === '5' ? 'active' : ''}" data-floor="5">Fl 5 (8)</button>
                        </div>

                        <!-- Status Filter Pills (reflect the selected date) -->
                        <div class="filter-pills" id="hotelRoomFilters">
                            <button class="pill-btn ${this.roomFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
                            <button class="pill-btn ${this.roomFilter === 'available' ? 'active' : ''}" data-filter="available">Avail (${projAvailable})</button>
                            <button class="pill-btn ${this.roomFilter === 'occupied' ? 'active' : ''}" data-filter="occupied">Occ (${projOccupied})</button>
                            <button class="pill-btn ${this.roomFilter === 'reserved' ? 'active' : ''}" data-filter="reserved">Res (${projReserved})</button>
                        </div>
                    </div>
                </div>

                ${!isViewingToday ? `
                    <div class="alert alert-info mb-3" style="margin: 0 22px 18px;">
                        <i data-lucide="info"></i>
                        <div>Showing projected room status for <strong>${viewDateStr}</strong> based on current stays and advance reservations. Payment entry and check-in/out actions are only available on today's live view &mdash; click "Today" to return.</div>
                    </div>
                ` : ''}

                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Room No.</th>
                                <th>Price</th>
                                <th>Client Name</th>
                                <th>CRDB</th>
                                <th>Online</th>
                                <th>Credit</th>
                                <th>Cash</th>
                                <th class="text-right">Amount</th>
                                <th class="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredRooms.map(({ room, projected }) => {
                                const payment = room.payment || { crdb: 0, online: 0, credit: 0, cash: 0 };
                                const rowAmount = (payment.crdb || 0) + (payment.online || 0) + (payment.credit || 0) + (payment.cash || 0);
                                const rateTshFormatted = (room.rateTsh || 50000).toLocaleString();
                                const hasGuest = !!projected.guest;
                                const canEdit = projected.isLive; // payments/actions only editable on today's live view

                                let statusBadge = '';
                                if (projected.status === 'available') statusBadge = '<span class="badge badge-success">Available</span>';
                                else if (projected.status === 'occupied') statusBadge = '<span class="badge badge-primary">Occupied</span>';
                                else if (projected.status === 'reserved') statusBadge = '<span class="badge badge-warning">Reserved</span>';
                                else statusBadge = '<span class="badge badge-neutral">Maintenance</span>';

                                const paymentInput = (field) => `
                                    <input type="number" class="form-control payment-input"
                                        data-room-id="${room.id}" data-field="${field}"
                                        value="${payment[field] || 0}" min="0" step="1000"
                                        style="width:90px; padding:4px 6px;"
                                        ${(!hasGuest || !canEdit) ? 'disabled' : ''} />
                                `;

                                let actionBtn = '<span class="text-xs text-muted">&mdash;</span>';
                                if (canEdit) {
                                    if (projected.status === 'available') {
                                        actionBtn = `<button class="btn btn-xs btn-primary btn-room-checkin" data-room-id="${room.id}">Check-In</button>`;
                                    } else if (projected.status === 'occupied') {
                                        actionBtn = `
                                            <button class="btn btn-xs btn-outline btn-room-folio" data-room-id="${room.id}">Folio</button>
                                            <button class="btn btn-xs btn-danger btn-room-checkout" data-room-id="${room.id}">Check-Out</button>
                                        `;
                                    } else if (projected.status === 'reserved') {
                                        actionBtn = `<button class="btn btn-xs btn-warning btn-room-checkin" data-room-id="${room.id}">Arrived</button>`;
                                    } else {
                                        actionBtn = `<button class="btn btn-xs btn-outline btn-mark-available" data-room-id="${room.id}">Mark Ready</button>`;
                                    }
                                } else if (projected.status === 'available') {
                                    actionBtn = `<button class="btn btn-xs btn-primary btn-room-reserve" data-room-id="${room.id}">Reserve</button>`;
                                } else if (projected.status !== 'maintenance') {
                                    actionBtn = `<span class="text-xs text-muted">${projected.checkIn} &rarr; ${projected.checkOut}</span>`;
                                }

                                return `
                                    <tr data-room-row="${room.id}">
                                        <td>
                                            <strong>${room.number}</strong>
                                            <div class="text-xs text-muted">${room.type} &bull; Fl ${room.floor}</div>
                                            <div class="mt-1">${statusBadge}</div>
                                        </td>
                                        <td class="font-mono text-sm">
                                            ${rateTshFormatted}/= TSh<br />
                                            <span class="text-xs text-muted">($${room.rateUsd || room.rate})</span>
                                        </td>
                                        <td>${projected.guest || '<span class="text-muted">&mdash;</span>'}</td>
                                        <td>${paymentInput('crdb')}</td>
                                        <td>${paymentInput('online')}</td>
                                        <td>${paymentInput('credit')}</td>
                                        <td>${paymentInput('cash')}</td>
                                        <td class="text-right font-bold row-amount" data-room-amount="${room.id}">${canEdit ? rowAmount.toLocaleString() + '/=' : '<span class="text-muted">&mdash;</span>'}</td>
                                        <td class="text-right">${actionBtn}</td>
                                    </tr>

                                `;
                            }).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="7" class="text-right font-bold">Total Amount${!isViewingToday ? ' (today\'s live payments)' : ''}</td>
                                <td class="text-right font-bold text-emerald" id="hotelPaymentsTotal">
                                    ${filteredRooms.reduce((sum, { room }) => {
                                        const p = room.payment || { crdb: 0, online: 0, credit: 0, cash: 0 };
                                        return sum + (p.crdb || 0) + (p.online || 0) + (p.credit || 0) + (p.cash || 0);
                                    }, 0).toLocaleString()}/=
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- Active Reservations Table -->
            <div class="card mt-4 fade-in">
                <div class="card-header">
                    <h3 class="card-title">Active Guest Reservations</h3>
                    <span class="badge badge-info">Advance Bookings</span>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Booking Ref</th>
                                <th>Guest Name</th>
                                <th>Room Assigned</th>
                                <th>Check-In</th>
                                <th>Check-Out</th>
                                <th>Deposit Paid</th>
                                <th>Status</th>
                                <th class="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reservations.map(res => `
                                <tr>
                                    <td><span class="badge-code">${res.id}</span></td>
                                    <td><strong>${res.guest}</strong> (${res.guestsCount} guests)</td>
                                    <td>Room ${res.room} - ${res.type}</td>
                                    <td>${res.checkIn}</td>
                                    <td>${res.checkOut}</td>
                                    <td class="font-mono">€${res.depositPaid.toFixed(2)}</td>
                                    <td><span class="badge ${res.status === 'confirmed' ? 'badge-success' : 'badge-warning'}">${res.status}</span></td>
                                    <td class="text-right">
                                        <button class="btn btn-xs btn-outline" onclick="window.cbmsHotelModule.quickCheckInFromRes('${res.id}')">
                                            Fast Check-In
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            ${this.renderCreditPaidSection()}
        `;

        this.bindEvents(container);
        if (window.lucide) window.lucide.createIcons();
    }

    renderCreditPaidSection() {
        if (!window.cbmsStore.data.hotel.creditPaid) window.cbmsStore.data.hotel.creditPaid = [];
        const allRows = window.cbmsStore.data.hotel.creditPaid;

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const todayIso = today.toISOString().split('T')[0];
        const yesterdayIso = yesterday.toISOString().split('T')[0];

        const todayRows = allRows.filter(r => r.date === todayIso);
        const yesterdayRows = allRows.filter(r => r.date === yesterdayIso);

        return `
            <div class="card mt-4 fade-in">
                <div class="card-header">
                    <div class="card-title-group">
                        <h2 class="card-title">Credit Paid &mdash; Guest Debt Clearance Ledger</h2>
                        <span class="card-hint">For guests settling an earlier part-paid stay &bull; CRDB = amount paid via bank (CRDB)</span>
                    </div>
                    <span class="badge badge-info">Yesterday &amp; Today</span>
                </div>
                <div class="credit-tables-grid">
                    ${this.renderCreditTable('Yesterday', yesterdayIso, yesterdayRows)}
                    ${this.renderCreditTable('Today', todayIso, todayRows)}
                </div>
            </div>
        `;
    }

    renderCreditTable(label, dateIso, rows) {
        const sums = rows.reduce((acc, r) => {
            const accom = Number(r.accommodation) || 0;
            const food = Number(r.food) || 0;
            const drinks = Number(r.drinks) || 0;
            const laundry = Number(r.laundry) || 0;
            acc.accommodation += accom;
            acc.food += food;
            acc.drinks += drinks;
            acc.laundry += laundry;
            acc.total += accom + food + drinks + laundry;
            acc.crdb += Number(r.crdb) || 0;
            return acc;
        }, { accommodation: 0, food: 0, drinks: 0, laundry: 0, total: 0, crdb: 0 });

        return `
            <div class="credit-table-block">
                <div class="credit-section-title">
                    <h3 class="card-title text-sm">${label} <span class="text-muted font-mono text-xs">(${dateIso})</span></h3>
                    <button class="btn btn-xs btn-outline btn-add-credit-row" data-date="${dateIso}">
                        <i data-lucide="plus"></i> Add Row
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="data-table credit-table">
                        <thead>
                            <tr>
                                <th>Room No.</th>
                                <th>Accommodation</th>
                                <th>Food</th>
                                <th>Drinks</th>
                                <th>Laundry</th>
                                <th>Total</th>
                                <th>CRDB (Bank)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.length === 0 ? `
                                <tr>
                                    <td colspan="8" class="text-center text-muted text-xs">No credit entries recorded for ${label.toLowerCase()}.</td>
                                </tr>
                            ` : rows.map(row => {
                                const total = (Number(row.accommodation) || 0) + (Number(row.food) || 0) + (Number(row.drinks) || 0) + (Number(row.laundry) || 0);
                                return `
                                    <tr>
                                        <td><input type="text" class="credit-cell-input credit-room-input" data-row-id="${row.id}" data-field="room" value="${row.room || ''}" placeholder="e.g. 204" /></td>
                                        <td><input type="number" class="credit-cell-input" data-row-id="${row.id}" data-field="accommodation" value="${row.accommodation || 0}" min="0" step="0.01" /></td>
                                        <td><input type="number" class="credit-cell-input" data-row-id="${row.id}" data-field="food" value="${row.food || 0}" min="0" step="0.01" /></td>
                                        <td><input type="number" class="credit-cell-input" data-row-id="${row.id}" data-field="drinks" value="${row.drinks || 0}" min="0" step="0.01" /></td>
                                        <td><input type="number" class="credit-cell-input" data-row-id="${row.id}" data-field="laundry" value="${row.laundry || 0}" min="0" step="0.01" /></td>
                                        <td class="credit-total-cell font-mono font-bold" data-row-id="${row.id}">${total.toFixed(2)}</td>
                                        <td><input type="number" class="credit-cell-input" data-row-id="${row.id}" data-field="crdb" value="${row.crdb || 0}" min="0" step="0.01" /></td>
                                        <td><button class="btn btn-xs btn-danger btn-delete-credit-row" data-row-id="${row.id}" title="Remove row"><i data-lucide="trash-2"></i></button></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td class="font-bold">Total</td>
                                <td class="font-mono font-bold credit-footer-cell" data-date="${dateIso}" data-col="accommodation">${sums.accommodation.toFixed(2)}</td>
                                <td class="font-mono font-bold credit-footer-cell" data-date="${dateIso}" data-col="food">${sums.food.toFixed(2)}</td>
                                <td class="font-mono font-bold credit-footer-cell" data-date="${dateIso}" data-col="drinks">${sums.drinks.toFixed(2)}</td>
                                <td class="font-mono font-bold credit-footer-cell" data-date="${dateIso}" data-col="laundry">${sums.laundry.toFixed(2)}</td>
                                <td class="font-mono font-bold credit-footer-cell" data-date="${dateIso}" data-col="total">${sums.total.toFixed(2)}</td>
                                <td class="font-mono font-bold credit-footer-cell" data-date="${dateIso}" data-col="crdb">${sums.crdb.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;
    }

    bindEvents(container) {
        // Date picker - view projected room status for any date
        container.querySelector('#hotelViewDate')?.addEventListener('change', (e) => {
            this.viewDate = e.target.value || null;
            this.render(container);
        });

        // Reset to today's live view
        container.querySelector('#btnResetToToday')?.addEventListener('click', () => {
            this.viewDate = null;
            this.render(container);
        });

        // Floor filter pills
        container.querySelectorAll('#hotelFloorFilters button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.floorFilter = btn.dataset.floor;
                this.render(container);
            });
        });

        // Room filter pills
        container.querySelectorAll('#hotelRoomFilters button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.roomFilter = btn.dataset.filter;
                this.render(container);
            });
        });

        // Reserve buttons (available rooms on a future/past date view)
        container.querySelectorAll('.btn-room-reserve').forEach(btn => {
            btn.addEventListener('click', () => {
                const roomId = btn.dataset.roomId;
                this.showNewReservationModal(roomId);
            });
        });

        // Top Check-in button
        container.querySelector('#btnOpenCheckIn')?.addEventListener('click', () => {
            this.showCheckInModal();
        });

        // Top Reservation button
        container.querySelector('#btnOpenReservation')?.addEventListener('click', () => {
            this.showNewReservationModal();
        });

        // Room action buttons
        container.querySelectorAll('.btn-room-checkin').forEach(btn => {
            btn.addEventListener('click', () => {
                const roomId = btn.dataset.roomId;
                this.showCheckInModal(roomId);
            });
        });

        container.querySelectorAll('.btn-room-checkout').forEach(btn => {
            btn.addEventListener('click', () => {
                const roomId = btn.dataset.roomId;
                this.showCheckOutModal(roomId);
            });
        });

        container.querySelectorAll('.btn-room-folio').forEach(btn => {
            btn.addEventListener('click', () => {
                const roomId = btn.dataset.roomId;
                this.showFolioDetailsModal(roomId);
            });
        });

        container.querySelectorAll('.btn-mark-available').forEach(btn => {
            btn.addEventListener('click', () => {
                const roomId = Number(btn.dataset.roomId);
                const room = window.cbmsStore.data.hotel.rooms.find(r => r.id === roomId);
                if (room) {
                    room.status = 'available';
                    window.cbmsStore.saveData();
                    window.cbmsApp.showToast(`Room ${room.number} marked clean & available`, 'success');
                    this.render(container);
                }
            });
        });

        // Payment method inputs (CRDB / Online / Credit / Cash) in the reception list
        container.querySelectorAll('.payment-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const roomId = e.target.dataset.roomId;
                const field = e.target.dataset.field;
                const value = e.target.value;

                try {
                    window.cbmsStore.updateRoomPayment(roomId, field, value);

                    // Recompute this row's Amount cell without a full re-render
                    const room = window.cbmsStore.data.hotel.rooms.find(r => r.id === Number(roomId));
                    const p = room.payment || { crdb: 0, online: 0, credit: 0, cash: 0 };
                    const rowAmount = (p.crdb || 0) + (p.online || 0) + (p.credit || 0) + (p.cash || 0);
                    const rowAmountCell = container.querySelector(`[data-room-amount="${roomId}"]`);
                    if (rowAmountCell) rowAmountCell.textContent = `${rowAmount.toLocaleString()}/=`;

                    // Recompute the grand total footer
                    const rooms = window.cbmsStore.data.hotel.rooms;
                    let filtered = rooms;
                    if (this.roomFilter !== 'all') filtered = filtered.filter(r => r.status === this.roomFilter);
                    if (this.floorFilter && this.floorFilter !== 'all') filtered = filtered.filter(r => r.floor === Number(this.floorFilter));
                    const grandTotal = filtered.reduce((sum, r) => {
                        const rp = r.payment || { crdb: 0, online: 0, credit: 0, cash: 0 };
                        return sum + (rp.crdb || 0) + (rp.online || 0) + (rp.credit || 0) + (rp.cash || 0);
                    }, 0);
                    const totalCell = document.getElementById('hotelPaymentsTotal');
                    if (totalCell) totalCell.textContent = `${grandTotal.toLocaleString()}/=`;

                    window.cbmsApp.showToast(`Payment updated for Room ${room.number}`, 'success');
                } catch (err) {
                    window.cbmsApp.showToast(err.message, 'error');
                }
            });
        });

        // Credit Paid ledger: add row
        container.querySelectorAll('.btn-add-credit-row').forEach(btn => {
            btn.addEventListener('click', () => {
                window.cbmsStore.addHotelCreditRow(btn.dataset.date);
                this.render(container);
            });
        });

        // Credit Paid ledger: delete row
        container.querySelectorAll('.btn-delete-credit-row').forEach(btn => {
            btn.addEventListener('click', () => {
                window.cbmsStore.deleteHotelCreditRow(btn.dataset.rowId);
                this.render(container);
            });
        });

        // Credit Paid ledger: editable cells (live totals, no full re-render)
        container.querySelectorAll('.credit-cell-input').forEach(input => {
            input.addEventListener('input', () => {
                const rowId = input.dataset.rowId;
                const field = input.dataset.field;
                const value = field === 'room' ? input.value : (parseFloat(input.value) || 0);
                window.cbmsStore.updateHotelCreditRow(rowId, field, value);
                if (field !== 'room') {
                    this.updateCreditRowTotals(container, rowId);
                }
            });
        });
    }

    updateCreditRowTotals(container, rowId) {
        const row = (window.cbmsStore.data.hotel.creditPaid || []).find(r => r.id === rowId);
        if (!row) return;

        const total = (Number(row.accommodation) || 0) + (Number(row.food) || 0) + (Number(row.drinks) || 0) + (Number(row.laundry) || 0);
        const totalCell = container.querySelector(`.credit-total-cell[data-row-id="${rowId}"]`);
        if (totalCell) totalCell.textContent = total.toFixed(2);

        this.updateCreditFooter(container, row.date);
    }

    updateCreditFooter(container, dateIso) {
        const rows = (window.cbmsStore.data.hotel.creditPaid || []).filter(r => r.date === dateIso);
        const sums = rows.reduce((acc, r) => {
            const accom = Number(r.accommodation) || 0;
            const food = Number(r.food) || 0;
            const drinks = Number(r.drinks) || 0;
            const laundry = Number(r.laundry) || 0;
            acc.accommodation += accom;
            acc.food += food;
            acc.drinks += drinks;
            acc.laundry += laundry;
            acc.total += accom + food + drinks + laundry;
            acc.crdb += Number(r.crdb) || 0;
            return acc;
        }, { accommodation: 0, food: 0, drinks: 0, laundry: 0, total: 0, crdb: 0 });

        Object.keys(sums).forEach(col => {
            const cell = container.querySelector(`.credit-footer-cell[data-date="${dateIso}"][data-col="${col}"]`);
            if (cell) cell.textContent = sums[col].toFixed(2);
        });
    }

    showCheckInModal(preSelectedRoomId = null) {
        const availableRooms = window.cbmsStore.data.hotel.rooms.filter(r => r.status === 'available' || r.id === Number(preSelectedRoomId));

        if (availableRooms.length === 0) {
            window.cbmsApp.showToast('No rooms available for immediate check-in.', 'error');
            return;
        }

        const modalHtml = `
            <div class="modal-backdrop fade-in" id="checkInModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Hotel Guest Registration & Check-In</h3>
                            <p class="modal-subtitle">Front Desk Reception Terminal (PDF §3)</p>
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('checkInModal').remove()">&times;</button>
                    </div>
                    <form id="checkInForm">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Select Room</label>
                                <select class="form-control" id="checkInRoomSelect" required>
                                    ${availableRooms.map(r => `
                                        <option value="${r.id}" ${r.id === Number(preSelectedRoomId) ? 'selected' : ''}>
                                            Room ${r.number} (Floor ${r.floor}) &mdash; ${r.type} (${(r.rateTsh || 50000).toLocaleString()}/= TSh / $${r.rateUsd || r.rate})
                                        </option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Full Guest Name</label>
                                <input type="text" class="form-control" id="checkInGuestName" placeholder="e.g. Dr. Catherine Bennett" required />
                            </div>

                            <div class="form-row">
                                <div class="form-group col-6">
                                    <label class="form-label">Stay Duration (Nights)</label>
                                    <input type="number" class="form-control" id="checkInNights" value="3" min="1" max="30" required />
                                </div>
                                <div class="form-group col-6">
                                    <label class="form-label">Initial Deposit (€)</label>
                                    <input type="number" class="form-control" id="checkInDeposit" value="100" min="0" />
                                </div>
                            </div>

                            <div class="alert alert-info">
                                <i data-lucide="info"></i> Room billing rate will automatically create a guest folio in the Central Ledger upon settlement.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('checkInModal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary"><i data-lucide="check"></i> Confirm Check-In & Issue Key</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const existing = document.getElementById('checkInModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('checkInForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const roomId = document.getElementById('checkInRoomSelect').value;
            const guestName = document.getElementById('checkInGuestName').value.trim();
            const nights = parseInt(document.getElementById('checkInNights').value, 10);
            const deposit = parseFloat(document.getElementById('checkInDeposit').value || 0);

            try {
                window.cbmsStore.checkInHotelGuest(roomId, guestName, nights, deposit);
                document.getElementById('checkInModal').remove();
                window.cbmsApp.showToast(`Guest ${guestName} checked in to Room!`, 'success');
                this.render(document.getElementById('moduleContainer'));
            } catch (err) {
                window.cbmsApp.showToast(err.message, 'error');
            }
        });
    }

    showCheckOutModal(roomId) {
        const room = window.cbmsStore.data.hotel.rooms.find(r => r.id === Number(roomId));
        if (!room) return;

        const modalHtml = `
            <div class="modal-backdrop fade-in" id="checkOutModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Guest Check-Out & Invoice Settlement</h3>
                            <p class="modal-subtitle">Room ${room.number} - ${room.type}</p>
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('checkOutModal').remove()">&times;</button>
                    </div>
                    <form id="checkOutForm">
                        <div class="modal-body">
                            <div class="invoice-summary-box mb-3">
                                <div class="invoice-row">
                                    <span>Guest:</span>
                                    <strong>${room.guest}</strong>
                                </div>
                                <div class="invoice-row">
                                    <span>Dates:</span>
                                    <span>${room.checkIn} to ${room.checkOut}</span>
                                </div>
                                <div class="invoice-row">
                                    <span>Total Folio (Room + Restaurant):</span>
                                    <span class="invoice-amount font-bold text-emerald">€${room.folioCharges.toFixed(2)}</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Payment Method</label>
                                <select class="form-control" id="checkoutPaymentMethod">
                                    <option value="Credit Card">Credit Card (Visa / Mastercard)</option>
                                    <option value="Corporate Account">Corporate Account Billing</option>
                                    <option value="Cash">Cash Settlement</option>
                                    <option value="Bank Transfer">Wire / SEPA Transfer</option>
                                </select>
                            </div>

                            <div class="alert alert-success">
                                <i data-lucide="check-circle"></i> Revenue of <strong>€${room.folioCharges.toFixed(2)}</strong> will be instantly posted to the Hotel Central Ledger.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('checkOutModal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-danger"><i data-lucide="file-check"></i> Settle & Check Out</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const existing = document.getElementById('checkOutModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('checkOutForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const method = document.getElementById('checkoutPaymentMethod').value;
            try {
                const res = window.cbmsStore.checkOutHotelGuest(roomId, method);
                document.getElementById('checkOutModal').remove();
                window.cbmsApp.showToast(`Checked out ${res.guestName}. Settled €${res.finalFolio.toFixed(2)}!`, 'success');
                this.render(document.getElementById('moduleContainer'));
            } catch (err) {
                window.cbmsApp.showToast(err.message, 'error');
            }
        });
    }

    showFolioDetailsModal(roomId) {
        const room = window.cbmsStore.data.hotel.rooms.find(r => r.id === Number(roomId));
        if (!room) return;

        const modalHtml = `
            <div class="modal-backdrop fade-in" id="folioModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Guest Folio - Room ${room.number}</h3>
                            <p class="modal-subtitle">${room.guest}</p>
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('folioModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="folio-breakdown">
                            <div class="folio-item">
                                <span>Room Accommodation (${room.type} @ €${room.rate}/night)</span>
                                <strong>Included</strong>
                            </div>
                            <div class="folio-item">
                                <span>Restaurant & Room Service Orders Charged</span>
                                <strong>Active</strong>
                            </div>
                            <hr />
                            <div class="folio-total-row">
                                <span>Total Balance Due:</span>
                                <span class="text-emerald font-bold">€${room.folioCharges.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('folioModal').remove()">Close</button>
                        <button class="btn btn-danger" onclick="document.getElementById('folioModal').remove(); window.cbmsHotelModule.showCheckOutModal(${room.id})">Proceed to Settlement</button>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('folioModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    quickCheckInFromRes(resId) {
        const res = window.cbmsStore.data.hotel.reservations.find(r => r.id === resId);
        if (!res) return;
        const room = window.cbmsStore.data.hotel.rooms.find(r => r.number === res.room);
        if (room) {
            this.showCheckInModal(room.id);
            setTimeout(() => {
                const nameInput = document.getElementById('checkInGuestName');
                if (nameInput) nameInput.value = res.guest;
            }, 50);
        }
    }

    showNewReservationModal(preSelectedRoomId = null) {
        const rooms = window.cbmsStore.data.hotel.rooms;
        // Offer every room except ones currently under maintenance; the actual
        // date/overlap check happens on submit via store.createReservation.
        const selectableRooms = rooms.filter(r => r.status !== 'maintenance');

        if (selectableRooms.length === 0) {
            window.cbmsApp.showToast('No rooms available to reserve right now.', 'error');
            return;
        }

        const defaultCheckIn = this.viewDate || this.getTodayStr();

        const modalHtml = `
            <div class="modal-backdrop fade-in" id="newReservationModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">New Advance Reservation</h3>
                            <p class="modal-subtitle">Book a room ahead of time for a future guest arrival</p>
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('newReservationModal').remove()">&times;</button>
                    </div>
                    <form id="newReservationForm">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Select Room</label>
                                <select class="form-control" id="resRoomSelect" required>
                                    ${selectableRooms.map(r => `
                                        <option value="${r.id}" ${r.id === Number(preSelectedRoomId) ? 'selected' : ''}>
                                            Room ${r.number} (Floor ${r.floor}) &mdash; ${r.type} (${(r.rateTsh || 50000).toLocaleString()}/= TSh / $${r.rateUsd || r.rate})
                                        </option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Full Guest Name</label>
                                <input type="text" class="form-control" id="resGuestName" placeholder="e.g. Dr. Catherine Bennett" required />
                            </div>

                            <div class="form-row">
                                <div class="form-group col-6">
                                    <label class="form-label">Check-In Date</label>
                                    <input type="date" class="form-control" id="resCheckIn" value="${defaultCheckIn}" required />
                                </div>
                                <div class="form-group col-6">
                                    <label class="form-label">Nights Stay</label>
                                    <input type="number" class="form-control" id="resNights" value="2" min="1" max="60" required />
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group col-6">
                                    <label class="form-label">Number of Guests</label>
                                    <input type="number" class="form-control" id="resGuestsCount" value="1" min="1" max="10" required />
                                </div>
                                <div class="form-group col-6">
                                    <label class="form-label">Deposit Paid (TSh)</label>
                                    <input type="number" class="form-control" id="resDeposit" value="0" min="0" step="1000" />
                                </div>
                            </div>

                            <div class="alert alert-info">
                                <i data-lucide="info"></i> This reserves the room for the selected dates without checking the guest in yet. Use "Arrived (Check-In)" on the reservation once they arrive.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('newReservationModal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary"><i data-lucide="calendar-check"></i> Create Reservation</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const existing = document.getElementById('newReservationModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('newReservationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const roomId = document.getElementById('resRoomSelect').value;
            const guestName = document.getElementById('resGuestName').value.trim();
            const checkInStr = document.getElementById('resCheckIn').value;
            const nights = parseInt(document.getElementById('resNights').value, 10);
            const guestsCount = parseInt(document.getElementById('resGuestsCount').value, 10);
            const deposit = parseFloat(document.getElementById('resDeposit').value || 0);

            const checkInDate = new Date(checkInStr);
            const checkOutDate = new Date(checkInDate.getTime() + (nights * 24 * 60 * 60 * 1000));
            const checkOutStr = checkOutDate.toISOString().split('T')[0];

            try {
                window.cbmsStore.createReservation(roomId, guestName, checkInStr, checkOutStr, guestsCount, deposit);
                document.getElementById('newReservationModal').remove();
                window.cbmsApp.showToast(`Reservation created for ${guestName}: ${checkInStr} to ${checkOutStr}.`, 'success');
                this.render(document.getElementById('moduleContainer'));
            } catch (err) {
                window.cbmsApp.showToast(err.message, 'error');
            }
        });
    }
}

window.cbmsHotelModule = new HotelModule();
