/**
 * Kigala Hotel Ltd - Public Customer Front View Module
 * Renders the customer-facing website strictly showcasing:
 * - Hotel Rooms in 4 Categories:
 *   1. Standard Room: 50,000/= TSh ($20)
 *   2. Superior Standard Room: 60,000/= TSh ($25)
 *   3. Deluxe Room: 70,000/= TSh ($30)
 *   4. Twins Room: 90,000/= TSh ($35) - Booked via Contact/Calls/WhatsApp
 * - Contact Email: kigalahotel@gmail.com
 * - Contact Calls & WhatsApp: +255 763 240 076
 * - Gourmet Restaurant & Bar
 */

/**
 * EmailJS Configuration
 * Replace these 4 placeholder values with the real ones from your EmailJS
 * account (see EmailJS_Setup_Instructions.txt for step-by-step help):
 *   1. EMAILJS_PUBLIC_KEY        -> Account > General > Public Key
 *   2. EMAILJS_SERVICE_ID        -> Email Services > your connected service
 *   3. EMAILJS_HOTEL_TEMPLATE_ID -> the "Hotel Notification" template
 *   4. EMAILJS_CUSTOMER_TEMPLATE_ID -> the "Customer Confirmation" template
 */
const EMAILJS_PUBLIC_KEY = 'SoC7OGnI3h1g0aJW6';
const EMAILJS_SERVICE_ID = 'service_ey66w5k';
const EMAILJS_HOTEL_TEMPLATE_ID = 'template_y194opv';
const EMAILJS_CUSTOMER_TEMPLATE_ID = 'template_03vk1gs';

if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

class PublicWebsiteModule {
    constructor() {}

    render(container) {
        container.innerHTML = `
            <!-- Top Emergency & Contact Ticker -->
            <div class="top-contact-bar">
                <div class="public-container top-contact-content">
                    <div class="contact-ticker-item">
                        <i data-lucide="mail"></i> 
                        <a href="mailto:kigalahotel@gmail.com">kigalahotel@gmail.com</a>
                    </div>
                    <div class="contact-ticker-item">
                        <i data-lucide="phone"></i> 
                        <a href="tel:+255763240076">Calls: +255 763 240 076</a>
                    </div>
                    <div class="contact-ticker-item whatsapp-pill">
                        <i data-lucide="message-circle"></i> 
                        <a href="https://wa.me/255763240076?text=Hello%20Kigala%20Hotel,%20I%20would%20like%20to%20inquire%20about%20a%20room%20reservation" target="_blank">
                            WhatsApp: +255 763 240 076
                        </a>
                    </div>
                </div>
            </div>

            <!-- Public Navigation Bar -->
            <header class="public-navbar">
                <div class="public-nav-container">
                    <div class="public-brand">
                        <div class="public-brand-icon">
                            <i data-lucide="shield"></i>
                        </div>
                        <div>
                            <span class="public-brand-title">Kigala Hotel Ltd</span>
                            <span class="public-brand-sub">Luxury Hotel & Restaurant</span>
                        </div>
                    </div>

                    <nav class="public-nav-links">
                        <a href="#rooms" class="pub-nav-link">Rooms & Rates</a>
                        <a href="#dining" class="pub-nav-link">Restaurant & Bar</a>
                        <a href="#amenities" class="pub-nav-link">Hotel Amenities</a>
                        <a href="#contact" class="pub-nav-link">Contact Us</a>
                    </nav>

                    <div class="public-nav-actions">
                        <a href="https://wa.me/255763240076" target="_blank" class="btn btn-whatsapp-header" title="Chat on WhatsApp">
                            <i data-lucide="message-circle"></i> WhatsApp Us
                        </a>
                        <!-- Top-Right Staff Portal Login Button -->
                        <button class="btn btn-staff-login" id="btnTopRightStaffLogin" title="Access internal management system based on your staff credentials">
                            <i data-lucide="lock"></i> Staff Portal Login
                        </button>
                    </div>
                </div>
            </header>

            <!-- Hero Banner -->
            <section class="public-hero" style="background-image: linear-gradient(135deg, rgba(11,17,32,0.88) 0%, rgba(15,23,42,0.82) 45%, rgba(30,41,59,0.85) 100%), url('images/hotel-building.jpg'); background-size: cover; background-position: center;">
                <div class="public-hero-content">
                    <div class="public-badge-pill">
                        <i data-lucide="sparkles"></i> Welcome to Kigala Hotel Ltd
                    </div>
                    <img src="images/kigala-logo.png" alt="Kigala Hotel Ltd" class="hero-logo" />
                    <p class="public-hero-desc">
                        Experience bespoke luxury and warm Tanzanian hospitality. Choose from our well-appointed rooms across 5 floors with seamless room-service dining and personalized guest care.
                    </p>
                    <div class="public-hero-buttons">
                        <a href="#rooms" class="btn btn-primary btn-lg">
                            <i data-lucide="calendar"></i> View Rooms & Rates
                        </a>
                        <a href="https://wa.me/255763240076?text=Hello%20Kigala%20Hotel,%20I%20would%20like%20to%20book%20a%20room" target="_blank" class="btn btn-outline-white btn-lg">
                            <i data-lucide="message-circle"></i> Book on WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            <!-- 4 Room Categories Section -->
            <section class="public-section" id="rooms">
                <div class="public-container">
                    <div class="section-header text-center">
                        <span class="section-kicker">Accommodations & Suites</span>
                        <h2 class="section-heading">A curated collection of distinctive rooms across four categories</h2>
                        <p class="section-subtext">Transparent dual-currency pricing in Tanzanian Shillings (TSh) and US Dollars ($). Room allocation across 5 floors.</p>
                    </div>

                    <div class="public-rooms-grid">
                        <!-- Category 1: Standard Room (50,000/= TSh or $20) -->
                        <div class="pub-room-card">
                            <div class="pub-room-media bg-room-single">
                                <span class="pub-room-tag">Standard Room</span>
                                <span class="pub-room-price">
                                    50,000/= <span class="text-xs font-normal">TSh</span>
                                    <span class="price-usd-badge">or $20 / night</span>
                                </span>
                            </div>
                            <div class="pub-room-content">
                                <h3>Standard Room</h3>
                                <div class="room-inventory-note mb-2">
                                    <span class="badge badge-info">15 Rooms Available</span>
                                </div>
                                <p class="text-muted text-sm mb-3">Cozy and comfortable with en-suite shower, high-speed Wi-Fi, writing desk, flat-screen satellite TV, and breakfast included.</p>
                                <ul class="pub-room-perks">
                                    <li><i data-lucide="check"></i> Comfortable Queen Bed</li>
                                    <li><i data-lucide="check"></i> En-suite Bathroom & Hot Shower</li>
                                    <li><i data-lucide="check"></i> High-Speed Wi-Fi & Work Desk</li>
                                </ul>
                                <button class="btn btn-primary btn-block btn-book-room" data-room-type="Standard Room" data-rate-tsh="50,000/=" data-rate-usd="20">
                                    Book Standard Room
                                </button>
                            </div>
                        </div>

                        <!-- Category 2: Superior Standard Room (60,000/= TSh or $25) -->
                        <div class="pub-room-card">
                            <div class="pub-room-media bg-room-double">
                                <span class="pub-room-tag">Superior Standard Room</span>
                                <span class="pub-room-price">
                                    60,000/= <span class="text-xs font-normal">TSh</span>
                                    <span class="price-usd-badge">or $25 / night</span>
                                </span>
                            </div>
                            <div class="pub-room-content">
                                <h3>Superior Standard Room</h3>
                                <div class="room-inventory-note mb-2">
                                    <span class="badge badge-warning">4 Executive Rooms (5th Floor)</span>
                                </div>
                                <p class="text-muted text-sm mb-3">Located on the top floor with premium views, upgraded bedding, silent climate control, mini-bar, and tea/coffee station.</p>
                                <ul class="pub-room-perks">
                                    <li><i data-lucide="check"></i> 5th Floor Panoramic City View</li>
                                    <li><i data-lucide="check"></i> Silent AC & Climate Control</li>
                                    <li><i data-lucide="check"></i> Coffee/Tea Facility & Mini-Fridge</li>
                                </ul>
                                <button class="btn btn-primary btn-block btn-book-room" data-room-type="Superior Standard Room" data-rate-tsh="60,000/=" data-rate-usd="25">
                                    Book Superior Standard
                                </button>
                            </div>
                        </div>

                        <!-- Category 3: Deluxe Room (70,000/= TSh or $30) -->
                        <div class="pub-room-card featured">
                            <div class="pub-room-badge">Guest Favorite</div>
                            <div class="pub-room-media bg-room-deluxe">
                                <span class="pub-room-tag">Deluxe Room</span>
                                <span class="pub-room-price">
                                    70,000/= <span class="text-xs font-normal">TSh</span>
                                    <span class="price-usd-badge">or $30 / night</span>
                                </span>
                            </div>
                            <div class="pub-room-content">
                                <h3>Deluxe Room</h3>
                                <div class="room-inventory-note mb-2">
                                    <span class="badge badge-success">17 Luxury Rooms</span>
                                </div>
                                <p class="text-muted text-sm mb-3">Spacious retreat with private seating area, plush king bed, private balcony, luxury toiletries, and 24/7 room service dining.</p>
                                <ul class="pub-room-perks">
                                    <li><i data-lucide="check"></i> Plush King Size Mattress</li>
                                    <li><i data-lucide="check"></i> Private Balcony with Seating</li>
                                    <li><i data-lucide="check"></i> 24-Hour Room Service Included</li>
                                </ul>
                                <button class="btn btn-primary btn-block btn-book-room" data-room-type="Deluxe Room" data-rate-tsh="70,000/=" data-rate-usd="30">
                                    Book Deluxe Room
                                </button>
                            </div>
                        </div>

                        <!-- Category 4: Twins Room (90,000/= TSh or $35) - Book via Contact / Calls -->
                        <div class="pub-room-card special-card">
                            <div class="pub-room-badge-gold">Contact / Call Booking</div>
                            <div class="pub-room-media bg-room-twins">
                                <span class="pub-room-tag">Twins Room</span>
                                <span class="pub-room-price">
                                    90,000/= <span class="text-xs font-normal">TSh</span>
                                    <span class="price-usd-badge">or $35 / night</span>
                                </span>
                            </div>
                            <div class="pub-room-content">
                                <h3>Twins Room</h3>
                                <div class="room-inventory-note mb-2">
                                    <span class="badge badge-danger">4 Executive Twin Suites</span>
                                </div>
                                <p class="text-muted text-sm mb-3">Two separate luxury beds for colleagues or family travelers with premium floor space.</p>
                                <ul class="pub-room-perks">
                                    <li><i data-lucide="check"></i> Two Separate Deluxe Beds</li>
                                    <li><i data-lucide="check"></i> Top Floor Executive Location</li>
                                </ul>
                                <div class="twins-actions-wrap">
                                    <a href="https://wa.me/255763240076?text=Hello%20Kigala%20Hotel,%20I%20would%20like%20to%20reserve%20a%20Twins%20Room%20(90,000/=%20TSh%20/%20$35)" target="_blank" class="btn btn-whatsapp btn-block mb-2">
                                        <i data-lucide="message-circle"></i> WhatsApp to Book (90,000/=)
                                    </a>
                                    <a href="tel:+255763240076" class="btn btn-outline btn-block btn-sm">
                                        <i data-lucide="phone"></i> Call +255 763 240 076
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Dining & Lounge Section -->
            <section class="public-section bg-white" id="dining">
                <div class="public-container">
                    <div class="section-split">
                        <div class="section-split-text">
                            <span class="section-kicker">Hotel Restaurant</span>
                            <h2 class="section-heading">Restaurant & Wine</h2>
                            <p class="text-muted mb-3">
                                Indulge in exquisite culinary dining. From fresh local grills and traditional Tanzanian flavors to international prime cuts, our kitchen delivers breakfast, business luncheons, and intimate dinners.
                            </p>
                            <div class="dining-contact-callout mb-4">
                                <div><i data-lucide="mail"></i> <strong>Email:</strong> kigalahotel@gmail.com</div>
                                <div><i data-lucide="phone"></i> <strong>Table Bookings:</strong> +255 763 240 076</div>
                            </div>
                            <button class="btn btn-outline mt-2" id="btnCheckMenu">
                                <i data-lucide="book-open"></i> Check the Restaurant Menu
                            </button>
                            <button class="btn btn-primary mt-4" id="btnReserveTable">
                                <i data-lucide="calendar"></i> Reserve a Dining Table
                            </button>
                        </div>
                        <div class="section-split-media bg-dining-banner">
                            <div class="dining-slideshow" id="diningSlideshow">
                                <div class="dining-slide active" style="background-image: url('images/gallery/exterior.jpg');"></div>
                                <div class="dining-slide" style="background-image: url('images/gallery/dining-table.jpg');"></div>
                                <div class="dining-slide" style="background-image: url('images/gallery/deluxe-room.jpg');"></div>
                                <div class="dining-slide" style="background-image: url('images/gallery/twin-room.jpg');"></div>
                            </div>
                            <div class="glass-overlay-card">
                                <h4>Open Daily: 06:30 – 23:30</h4>
                                <p class="text-xs text-muted">A La Carte Dining & 24/7 Room Service for Hotel Guests</p>
                                <div class="mt-2 text-xs font-bold text-emerald">● Contact: +255 763 240 076</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Hotel Amenities Section -->
            <section class="public-section" id="amenities">
                <div class="public-container">
                    <div class="section-header text-center">
                        <span class="section-kicker">Guest Privileges</span>
                        <h2 class="section-heading">Curated Hotel Amenities</h2>
                        <p class="section-subtext">Every detail tailored to elevate your stay from arrival to departure.</p>
                    </div>

                    <div class="amenities-grid">
                        <div class="amenity-item">
                            <div class="amenity-icon"><i data-lucide="wifi"></i></div>
                            <h4>Gigabit Fiber Wi-Fi</h4>
                            <p class="text-xs text-muted">High-speed connectivity in all rooms and dining areas.</p>
                        </div>
                        <div class="amenity-item">
                            <div class="amenity-icon"><i data-lucide="clock"></i></div>
                            <h4>24/7 Front Desk</h4>
                            <p class="text-xs text-muted">Constant concierge presence and fast guest check-in/out.</p>
                        </div>
                        <div class="amenity-item">
                            <div class="amenity-icon"><i data-lucide="car"></i></div>
                            <h4>Secure Parking</h4>
                            <p class="text-xs text-muted">Protected private parking for all hotel visitors and guests.</p>
                        </div>
                        <div class="amenity-item">
                            <div class="amenity-icon"><i data-lucide="coffee"></i></div>
                            <h4>Artisan Breakfast</h4>
                            <p class="text-xs text-muted">Nutritious daily breakfast included with your stay.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Location & What's Nearby Section -->
            <section class="public-section bg-white" id="location">
                <div class="public-container">
                    <div class="section-header text-center">
                        <span class="section-kicker">Find Us</span>
                        <h2 class="section-heading">Our Location</h2>
                        <p class="section-subtext">Conveniently situated in Ilala, Dar es Salaam, close to major landmarks.</p>
                    </div>

                    <div class="section-split">
                        <div class="dining-contact-callout mb-4">
                            <div class="mb-2"><i data-lucide="map-pin"></i> <strong>Address:</strong> Uhuru Road, Malapa, Dar es Salaam, Dar es Salaam, 12101</div>
                            <div class="mb-2"><i data-lucide="mail-open"></i> <strong>P.O. Box:</strong> 62478, Dar es Salaam</div>
                            <div class="mb-2"><i data-lucide="phone"></i> <strong>Reception No:</strong> +255 763 240 076</div>
                            <div class="mb-3"><i data-lucide="user"></i> <strong>Manager No:</strong> +255 693 680 705</div>
                            <a href="https://www.google.com/maps/search/?api=1&query=Uhuru+Road%2C+Malapa%2C+Dar+es+Salaam%2C+12101" target="_blank" class="btn btn-primary btn-sm">
                                <i data-lucide="map"></i> View in a Map
                            </a>
                        </div>

                        <div class="dining-highlights">
                            <h4 class="mb-3">What's Nearby</h4>
                            <div class="dining-item">
                                <strong>Ilala Market</strong>
                                <span>18 min walk</span>
                            </div>
                            <div class="dining-item">
                                <strong>Kariakoo Market</strong>
                                <span>4 min drive</span>
                            </div>
                            <div class="dining-item">
                                <strong>Port of Dar es Salaam</strong>
                                <span>7 min drive</span>
                            </div>
                            <div class="dining-item">
                                <strong>Mlimani City</strong>
                                <span>13 min drive</span>
                            </div>
                            <div class="dining-item">
                                <strong>Mbezi Beach</strong>
                                <span>20 min drive</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Public Footer (Hotel & Restaurant Only with Contact Info) -->
            <footer class="public-footer" id="contact">
                <div class="public-container">
                    <div class="footer-grid-dual">
                        <div class="footer-col">
                            <div class="public-brand mb-3">
                                <div class="public-brand-icon"><i data-lucide="shield"></i></div>
                                <div>
                                    <span class="public-brand-title text-white">Kigala Hotel Ltd</span>
                                    <span class="public-brand-sub">Luxury Hotel & Restaurant</span>
                                </div>
                            </div>
                            <p class="text-xs text-muted mb-3">
                                Kigala Hotel Ltd offers premium rooms and suites across 4 categories, alongside an exquisite dining restaurant.
                            </p>
                            <div class="footer-contact-pills text-xs">
                                <div class="mb-1"><i data-lucide="mail"></i> <strong>Email:</strong> kigalahotel@gmail.com</div>
                                <div><i data-lucide="phone"></i> <strong>Call/WhatsApp:</strong> +255 763 240 076</div>
                            </div>
                        </div>

                        <div class="footer-col">
                            <h4 class="footer-col-title">Room Categories</h4>
                            <ul class="footer-links">
                                <li><a href="#rooms">Standard Room &mdash; 50,000/= TSh ($20)</a></li>
                                <li><a href="#rooms">Superior Standard &mdash; 60,000/= TSh ($25)</a></li>
                                <li><a href="#rooms">Deluxe Room &mdash; 70,000/= TSh ($30)</a></li>
                                <li><a href="#rooms">Twins Room &mdash; 90,000/= TSh ($35)</a></li>
                            </ul>
                        </div>

                        <div class="footer-col">
                            <h4 class="footer-col-title">Direct Inquiries</h4>
                            <p class="text-xs text-muted mb-2">Grand Central Avenue, Kigala Hotel Complex</p>
                            <p class="text-xs text-muted mb-1"><strong>Email:</strong> kigalahotel@gmail.com</p>
                            <p class="text-xs text-muted mb-3"><strong>WhatsApp / Calls:</strong> +255 763 240 076</p>
                            <a href="https://wa.me/255763240076" target="_blank" class="btn btn-whatsapp btn-sm">
                                <i data-lucide="message-circle"></i> Chat on WhatsApp
                            </a>
                        </div>
                    </div>

                    <div class="footer-bottom">
                        <div class="text-xs text-muted">&copy; 2026 Kigala Hotel Ltd. All rights reserved. Registered Hotel & Restaurant.</div>
                        <div class="text-xs text-muted">Email: kigalahotel@gmail.com | Phone: +255 763 240 076</div>
                    </div>
                </div>
            </footer>
        `;

        this.bindEvents(container);
        if (window.lucide) window.lucide.createIcons();
    }

    bindEvents(container) {
        const openLogin = () => {
            window.cbmsApp.openStaffLoginModal();
        };

        container.querySelector('#btnTopRightStaffLogin')?.addEventListener('click', openLogin);

        this.startDiningSlideshow(container);

        container.querySelectorAll('.btn-book-room').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.roomType;
                const rateTsh = btn.dataset.rateTsh;
                const rateUsd = btn.dataset.rateUsd;
                this.showBookingInquiryModal(type, rateTsh, rateUsd);
            });
        });

        container.querySelector('#btnReserveTable')?.addEventListener('click', () => {
            this.showTableInquiryModal();
        });

        container.querySelector('#btnCheckMenu')?.addEventListener('click', () => {
            this.showRestaurantMenuModal();
        });
    }

    showRestaurantMenuModal() {
        const pages = [
            'images/menu/cover.jpg',
            'images/menu/page2.jpg',
            'images/menu/page3.jpg',
            'images/menu/page4.jpg',
            'images/menu/page5.jpg',
            'images/menu/page6.jpg',
            'images/menu/page7.jpg',
            'images/menu/page8.jpg'
        ];
        let currentPage = 0;

        const modalHtml = `
            <div class="modal-backdrop fade-in" id="restaurantMenuModal">
                <div class="modal-card modal-lg">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Kigala Hotel Ltd &mdash; Restaurant Menu</h3>
                            <p class="modal-subtitle">Page <span id="menuPageIndicator">1</span> of ${pages.length}</p>
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('restaurantMenuModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body text-center">
                        <img id="menuPageImage" src="${pages[0]}" alt="Restaurant Menu" style="max-width:100%; border-radius: var(--radius-md); border: 1px solid var(--border-color);" />
                    </div>
                    <div class="modal-footer" style="justify-content: space-between;">
                        <button type="button" class="btn btn-outline" id="btnMenuPrev">
                            <i data-lucide="chevron-left"></i> Previous
                        </button>
                        <a href="https://wa.me/255763240076?text=Hello%20Kigala%20Hotel,%20I%20have%20a%20question%20about%20the%20restaurant%20menu" target="_blank" class="btn btn-whatsapp">
                            <i data-lucide="message-circle"></i> Ask on WhatsApp
                        </a>
                        <button type="button" class="btn btn-primary" id="btnMenuNext">
                            Next <i data-lucide="chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('restaurantMenuModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) window.lucide.createIcons();

        const imageEl = document.getElementById('menuPageImage');
        const indicatorEl = document.getElementById('menuPageIndicator');

        const updatePage = () => {
            imageEl.src = pages[currentPage];
            indicatorEl.textContent = currentPage + 1;
        };

        document.getElementById('btnMenuPrev')?.addEventListener('click', () => {
            currentPage = (currentPage - 1 + pages.length) % pages.length;
            updatePage();
        });

        document.getElementById('btnMenuNext')?.addEventListener('click', () => {
            currentPage = (currentPage + 1) % pages.length;
            updatePage();
        });
    }

    startDiningSlideshow(container) {
        const slideshow = container.querySelector('#diningSlideshow');
        if (!slideshow) return;

        const slides = slideshow.querySelectorAll('.dining-slide');
        if (slides.length <= 1) return;

        let current = 0;
        setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, 4000);
    }

    showBookingInquiryModal(roomType, rateTsh, rateUsd) {
        // Parse numeric values out of the rate strings (e.g. "50,000/=" -> 50000)
        const rateTshNum = parseInt(rateTsh.replace(/[^0-9]/g, ''), 10) || 0;
        const rateUsdNum = parseInt(rateUsd.replace(/[^0-9]/g, ''), 10) || 0;

        const formatTsh = (n) => `${n.toLocaleString()}/=`;

        const modalHtml = `
            <div class="modal-backdrop fade-in" id="publicBookingModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">Book ${roomType}</h3>
                            <p class="modal-subtitle">Kigala Hotel Ltd &mdash; ${rateTsh} TSh or $${rateUsd} / night</p>
                        </div>
                        <button class="modal-close-btn" onclick="document.getElementById('publicBookingModal').remove()">&times;</button>
                    </div>
                    <form id="publicBookingForm">
                        <div class="modal-body">
                            <div class="alert alert-info mb-3">
                                <i data-lucide="info"></i>
                                <div>
                                    <strong>Direct Contact:</strong> Call/WhatsApp <strong>+255 763 240 076</strong> or email <strong>kigalahotel@gmail.com</strong>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Full Guest Name</label>
                                <input type="text" class="form-control" id="pubGuestName" placeholder="e.g. Juma Mwamba" required />
                            </div>
                            <div class="form-row">
                                <div class="form-group col-6">
                                    <label class="form-label">Check-In Date</label>
                                    <input type="date" class="form-control" id="pubCheckIn" value="${new Date().toISOString().split('T')[0]}" required />
                                </div>
                                <div class="form-group col-6">
                                    <label class="form-label">Nights Stay</label>
                                    <input type="number" class="form-control" id="pubNights" value="2" min="1" max="30" required />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Phone Number / WhatsApp</label>
                                <input type="text" class="form-control" id="pubGuestContact" placeholder="+255 7XX XXX XXX" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email Address (optional)</label>
                                <input type="email" class="form-control" id="pubGuestEmail" placeholder="e.g. juma@example.com" />
                            </div>
                            <p class="text-xs text-muted mb-3">Please provide at least a phone number or an email address so we can confirm your booking.</p>
                            <div class="alert alert-success">
                                <i data-lucide="shield-check"></i>
                                <div>
                                    Rate: <strong>${rateTsh} TSh ($${rateUsd})</strong> per night with guaranteed room key assignment upon arrival.
                                    <br />
                                    Total for <strong><span id="pubNightsEcho">2</span> night(s)</strong>: <strong id="pubTotalDisplay">${formatTsh(rateTshNum * 2)} ($${rateUsdNum * 2})</strong>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('publicBookingModal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary"><i data-lucide="check"></i> Confirm Room Booking</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const existing = document.getElementById('publicBookingModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (window.lucide) window.lucide.createIcons();

        const nightsInput = document.getElementById('pubNights');
        const totalDisplay = document.getElementById('pubTotalDisplay');
        const nightsEcho = document.getElementById('pubNightsEcho');

        const updateTotal = () => {
            const n = parseInt(nightsInput.value, 10) || 0;
            nightsEcho.textContent = n;
            totalDisplay.textContent = `${formatTsh(rateTshNum * n)} ($${rateUsdNum * n})`;
        };
        nightsInput.addEventListener('input', updateTotal);

        document.getElementById('publicBookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const guestName = document.getElementById('pubGuestName').value.trim();
            const nights = parseInt(document.getElementById('pubNights').value, 10);
            const checkIn = document.getElementById('pubCheckIn').value;
            const guestPhone = document.getElementById('pubGuestContact').value.trim();
            const guestEmail = document.getElementById('pubGuestEmail').value.trim();

            if (!guestPhone && !guestEmail) {
                window.cbmsApp.showToast('Please provide a phone number or an email address so we can reach you.', 'error');
                return;
            }

            // Find available room in requested category
            const targetRoom = window.cbmsStore.data.hotel.rooms.find(r => r.type === roomType && r.status === 'available')
                            || window.cbmsStore.data.hotel.rooms.find(r => r.status === 'available');

            const totalTsh = formatTsh(rateTshNum * nights);
            const totalUsd = rateUsdNum * nights;

            const emailParams = {
                guest_name: guestName,
                guest_phone: guestPhone || 'Not provided',
                guest_email: guestEmail || 'Not provided',
                room_type: roomType,
                rate: `${rateTsh} TSh ($${rateUsd}) per night`,
                total_amount: `${totalTsh} TSh ($${totalUsd})`,
                checkin_date: checkIn,
                nights: nights,
                status: targetRoom ? 'Confirmed' : 'Waitlisted (category full)'
            };

            this.sendBookingEmails(emailParams, guestEmail);

            if (targetRoom) {
                window.cbmsStore.checkInHotelGuest(targetRoom.id, guestName, nights);
                document.getElementById('publicBookingModal').remove();
                window.cbmsApp.showToast(`Booking Confirmed! You have been assigned a ${targetRoom.type} for ${guestName}. Total for ${nights} night(s): ${totalTsh} TSh ($${totalUsd}). Our front desk will share your exact room number at check-in.`, 'success');
            } else {
                document.getElementById('publicBookingModal').remove();
                window.cbmsApp.showToast(`Thank you, ${guestName}! All rooms in this category are booked. Our team will contact you via WhatsApp (+255 763 240 076).`, 'info');
            }
        });
    }

    // Sends a notification email to the hotel always, and a confirmation email
    // to the customer only if they provided an email address.
    sendBookingEmails(params, guestEmail) {
        if (typeof emailjs === 'undefined') {
            console.warn('EmailJS is not loaded. Booking emails were not sent.');
            return;
        }

        // Email to the hotel (always sent, regardless of what the customer filled in)
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_HOTEL_TEMPLATE_ID, params)
            .then(() => console.log('Hotel notification email sent.'))
            .catch((err) => console.error('Failed to send hotel notification email:', err));

        // Confirmation email to the customer (only if they gave an email)
        if (guestEmail) {
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CUSTOMER_TEMPLATE_ID, params)
                .then(() => console.log('Customer confirmation email sent.'))
                .catch((err) => console.error('Failed to send customer confirmation email:', err));
        }
    }

    showTableInquiryModal() {
        window.cbmsApp.showToast('Dining table reservation transmitted to kigalahotel@gmail.com (+255 763 240 076).', 'success');
    }
}

window.cbmsPublicModule = new PublicWebsiteModule();
