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
    }

    render(container) {
        const rooms = window.cbmsStore.data.hotel.rooms;
        const reservations = window.cbmsStore.data.hotel.reservations;
        const occupiedCount = rooms.filter(r => r.status === 'occupied').length;
        const availableCount = rooms.filter(r => r.status === 'available').length;
        const reservedCount = rooms.filter(r => r.status === 'reserved').length;
        const maintenanceCount = rooms.filter(r => r.status === 'maintenance').length;
        const occupancyRate = ((occupiedCount / rooms.length) * 100).toFixed(0);

        let filteredRooms = rooms;
        if (this.roomFilter !== 'all') {
            filteredRooms = filteredRooms.filter(r => r.status === this.roomFilter);
        }
        if (this.floorFilter && this.floorFilter !== 'all') {
            filteredRooms = filteredRooms.filter(r => r.floor === Number(this.floorFilter));
        }

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

            <!-- Room Grid, Floor Filters & Status Filter -->
            <div class="card mt-4 fade-in">
                <div class="card-header">
                    <div class="card-title-group">
                        <h2 class="card-title">Live 40-Room Status Grid & Floor Map</h2>
                        <span class="card-hint">Standard (50k TSh/$20) &bull; Superior Standard (60k TSh/$25) &bull; Deluxe (70k TSh/$30) &bull; Twins (90k TSh/$35)</span>
                    </div>
                    
                    <div class="filter-controls-group">
                        <!-- Floor Filter Pills -->
                        <div class="filter-pills mr-2" id="hotelFloorFilters">
                            <button class="pill-btn ${this.floorFilter === 'all' ? 'active' : ''}" data-floor="all">All Floors (40)</button>
                            <button class="pill-btn ${this.floorFilter === '1' ? 'active' : ''}" data-floor="1">Fl 1 (8)</button>
                            <button class="pill-btn ${this.floorFilter === '2' ? 'active' : ''}" data-floor="2">Fl 2 (8)</button>
                            <button class="pill-btn ${this.floorFilter === '3' ? 'active' : ''}" data-floor="3">Fl 3 (8)</button>
                            <button class="pill-btn ${this.floorFilter === '4' ? 'active' : ''}" data-floor="4">Fl 4 (8)</button>
                            <button class="pill-btn ${this.floorFilter === '5' ? 'active' : ''}" data-floor="5">Fl 5 (8)</button>
                        </div>

                        <!-- Status Filter Pills -->
                        <div class="filter-pills" id="hotelRoomFilters">
                            <button class="pill-btn ${this.roomFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
                            <button class="pill-btn ${this.roomFilter === 'available' ? 'active' : ''}" data-filter="available">Avail (${availableCount})</button>
                            <button class="pill-btn ${this.roomFilter === 'occupied' ? 'active' : ''}" data-filter="occupied">Occ (${occupiedCount})</button>
                            <button class="pill-btn ${this.roomFilter === 'reserved' ? 'active' : ''}" data-filter="reserved">Res (${reservedCount})</button>
                        </div>
                    </div>
                </div>

                <div class="room-grid">
                    ${filteredRooms.map(room => {
                        let statusBadge = '';
                        let borderClass = '';
                        if (room.status === 'available') {
                            statusBadge = '<span class="badge badge-success">Available</span>';
                            borderClass = 'border-avail';
                        } else if (room.status === 'occupied') {
                            statusBadge = '<span class="badge badge-primary">Occupied</span>';
                            borderClass = 'border-occ';
                        } else if (room.status === 'reserved') {
                            statusBadge = '<span class="badge badge-warning">Reserved</span>';
                            borderClass = 'border-res';
                        } else {
                            statusBadge = '<span class="badge badge-neutral">Maintenance</span>';
                            borderClass = 'border-maint';
                        }

                        const rateTshFormatted = (room.rateTsh || 50000).toLocaleString();

                        return `
                            <div class="room-card ${borderClass}" data-room-id="${room.id}">
                                <div class="room-card-header">
                                    <span class="room-number">Room ${room.number}</span>
                                    ${statusBadge}
                                </div>
                                <div class="room-type font-bold text-xs">${room.type} (Floor ${room.floor})</div>
                                <div class="room-price font-mono font-bold text-sm">
                                    ${rateTshFormatted}/= TSh <span class="text-xs text-muted">($${room.rateUsd || room.rate})</span>
                                </div>
                                ${room.bookViaCall ? '<span class="badge badge-danger text-xs mt-1">Book via Call / WhatsApp</span>' : ''}

                                <div class="room-body">
                                    ${room.guest ? `
                                        <div class="guest-info">
                                            <div class="guest-name"><i data-lucide="user"></i> ${room.guest}</div>
                                            <div class="guest-dates text-xs text-muted">In: ${room.checkIn} | Out: ${room.checkOut}</div>
                                            <div class="folio-total text-xs font-bold text-emerald">Folio: €${room.folioCharges.toFixed(2)} ($${(room.folioCharges).toFixed(0)})</div>
                                        </div>
                                    ` : `
                                        <div class="guest-empty text-muted text-xs">
                                            ${room.status === 'available' ? 'Ready for guest check-in' : (room.status === 'reserved' ? 'Awaiting guest arrival' : 'Room out of service')}
                                        </div>
                                    `}
                                </div>

                                <div class="room-actions">
                                    ${room.status === 'available' ? `
                                        <button class="btn btn-xs btn-primary btn-room-checkin" data-room-id="${room.id}">Check-In</button>
                                    ` : ''}
                                    ${room.status === 'occupied' ? `
                                        <button class="btn btn-xs btn-outline btn-room-folio" data-room-id="${room.id}">Folio</button>
                                        <button class="btn btn-xs btn-danger btn-room-checkout" data-room-id="${room.id}">Check-Out</button>
                                    ` : ''}
                                    ${room.status === 'reserved' ? `
                                        <button class="btn btn-xs btn-warning btn-room-checkin" data-room-id="${room.id}">Arrived (Check-In)</button>
                                    ` : ''}
                                    ${room.status === 'maintenance' ? `
                                        <button class="btn btn-xs btn-outline btn-mark-available" data-room-id="${room.id}">Mark Ready</button>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
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
        `;

        this.bindEvents(container);
        if (window.lucide) window.lucide.createIcons();
    }

    bindEvents(container) {
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

        // Top Check-in button
        container.querySelector('#btnOpenCheckIn')?.addEventListener('click', () => {
            this.showCheckInModal();
        });

        // Top Reservation button
        container.querySelector('#btnOpenReservation')?.addEventListener('click', () => {
            this.showReservationModal();
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

    showReservationModal() {
        window.cbmsApp.showToast('New reservation slot saved to registry.', 'info');
    }
}

window.cbmsHotelModule = new HotelModule();
