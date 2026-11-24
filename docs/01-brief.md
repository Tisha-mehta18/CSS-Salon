# CSS — Cascading Style Salon: Project Brief

## 1. Project Overview & Problem Statement

### 1.1 Project Overview
**CSS — Cascading Style Salon** is a modern, web-based digital queue and floor management application built for walk-in hair salons and barbershops. Playing on the beloved acronym **CSS** (*Cascading Style Sheets*), the salon infuses hair styling with witty developer culture ("We fix your bad hair styles, cascaded properly").

The application provides a synchronized, real-time queueing experience across customer personal devices, an in-salon waiting area TV display board, dedicated barber chair station interfaces, and a receptionist command center.

### 1.2 Problem Statement
Traditional walk-in salons and barbershops face daily operational friction:
- **Chaotic Waiting Areas:** Paper sign-in sheets and clipboards result in illegible names, disputed turn orders, and physical overcrowding.
- **Wait-Time Uncertainty:** Customers have no reliable estimate of how long their wait will be, leading to frustration, walk-outs, and negative reviews.
- **Barber Inefficiency:** Stylists waste time calling out names across crowded rooms, searching for customers who stepped out, or not knowing who is up next.
- **Routing Confusion:** Balancing customers who want *any available barber* versus those waiting for a *specific stylist* is error-prone when handled manually.
- **Lack of Floor Transparency:** Salon owners and front-desk staff lack live visibility into station occupancy, queue bottlenecks, and daily volume.

CSS eliminates this friction through a transparent, automated, and responsive queue engine that keeps customers informed, barbers focused, and the front desk in total control.

---

## 2. Target Users

| User Persona | Context & Environment | Primary Goals & Motivations |
| :--- | :--- | :--- |
| **Walk-in Customer** | Smartphone or self-service kiosk at salon entrance | Quick self check-in, transparent wait-time estimate, freedom to step out nearby without losing their spot, clear call alerts. |
| **Barber / Stylist** | Tablet or mobile device mounted at chair station | Distraction-free interface showing current client and next in line, 1-click status updates ("Call", "Start", "Complete"), break toggle. |
| **Receptionist / Front Desk** | Desktop or tablet at the salon front counter | Full queue control, fast manual walk-in entry, ability to reassign barbers, resolve no-shows, bump urgent entries, monitor floor flow. |
| **Salon Owner / Manager** | Laptop, tablet, or mobile phone | Configure barber rosters, define service catalogs and standard durations, monitor live floor health, reset daily queue operations. |

---

## 3. Core Must-Have Features

1. **Self-Service Queue Registration (Walk-In Kiosk & Mobile Web)**
   - Frictionless check-in collecting customer name, normalized phone number, desired service, and stylist preference.
   - Immediate issuance of a formatted queue token (e.g., `CSS-014`).
   - Automated queue closing: self-service registration automatically closes **30 minutes before salon closing time** so all waiting clients can be completed before closing.

2. **Smart Barber Routing ("Any Barber" vs. "Specific Barber")**
   - Customers can pick their favorite barber or opt for "Any Barber" (next available).
   - The queue engine prioritizes fair distribution and minimal wait times while strictly respecting specific barber preferences.

3. **Live Customer Ticket Tracker**
   - Responsive mobile web view accessible via QR code or direct link.
   - Displays real-time queue position ("2 ahead of you"), live status badge (`Waiting`, `Called`, `In Chair`, `Done`), assigned barber, and dynamic countdown timer.

4. **Waiting Area TV Display Board**
   - High-contrast, large-format screen designed for wall-mounted 1080p/4K TV monitors in the waiting lounge.
   - Prominently showcases "Now Serving" / "Now Calling" with visual pulse and sound chime alerts, alongside a paginated "Up Next" queue list.

5. **Dedicated Barber Chair Station View**
   - Streamlined, high-touch interface for stylists at their station.
   - One-touch progression: *Call Next Customer* &rarr; *Customer Seated* &rarr; *Complete Service*, with options to flag *No-Show* (after a strict 10-minute grace window) or pause for *Break*.

6. **Receptionist Command Dashboard**
   - Centralized operational desk displaying all waiting, called, and active customers across every station.
   - Complete management actions: manual customer entry, manual token calling, barber reassignment, priority bumping, and cancellation.

7. **Dynamic Wait Time Estimation Engine**
   - Automated real-time calculation based on service baseline duration, active barbers on duty, and individual queue depths.
   - Updates dynamically as haircuts finish early, run over, or as barbers take breaks.

8. **Owner Operations & Roster Settings**
   - Administration console to manage active/inactive barbers, station assignments, service menu options (haircut, fade, beard trim, wash) with baseline minutes, and daily queue reset controls.

9. **Bilingual Localization (English & Gujarati — EN / ગુજ)**
   - First-class support for both **English** and **Gujarati**.
   - Universal 1-click language switcher (`EN | ગુજરાતી`) in header across all screens.
   - Localized status badges, service names, queue instructions, and ticket notifications (e.g., *"તમારો વારો આવી ગયો છે"* for "You're up!").

---

## 4. Features We Will NOT Build (Out of Scope for v1)

To keep the application focused, resilient, and true to walk-in salon reality, the following features are explicitly out of scope for v1:

- **No Advance Appointment Scheduling / Calendar Booking:** The system is exclusively built for same-day walk-in queues. No calendar integrations (Google Calendar, Outlook) or booking slots days/weeks in advance.
- **No Payment Processing or POS Checkout:** No credit card processing, Stripe/PayPal integration, or cash register/receipt printer integrations.
- **No Retail Inventory Management:** No tracking of retail hair care products, pomades, shampoos, or stock levels.
- **No Customer Accounts / Password Authentication:** Customers do not create accounts or manage passwords; authentication for customers is token- and phone-based.
- **No Native Mobile App Store Binaries:** No native Swift/Kotlin/React Native apps published to Apple App Store or Google Play Store. The application is strictly a high-performance responsive web app.
- **No Automated SMS/WhatsApp Gateway Integration (v1):** Notifications are handled via on-screen visual alerts, Web Audio chimes, and customer live web link tracking. Third-party paid SMS gateways (Twilio) are excluded from the initial release.
- **No Multi-Branch / Multi-Tenant Architecture:** Built cleanly for a single salon location with up to 12 active stations.
- **No Customer Loyalty Point Ledgers:** No rewards programs, referral codes, or punch-card tracking.

---

## 5. Design Direction

### 5.1 Theme & Botanical Editorial Aesthetic
The visual identity embodies a bold, high-fashion editorial magazine aesthetic combined with a premium botanical salon identity:
- **Atmosphere:** Deep botanical sanctuary, dramatic natural lighting, oversized typographic scales, and high-fashion hair styling photography.
- **Playful Touches:** Subtle CSS developer puns woven into fashion editorial captions (e.g., `display: grid; /* Natural botanical form, cascaded properly */`, `overflow: hidden; /* Zero wait anxiety */`, `border-radius: 50%; /* Fade clean */`).

### 5.2 Color Palette
- **Primary Deep Forest Green:** `#173D32` (and deep ground `#0E2720`) for rich botanical atmosphere and depth.
- **Warm Editorial Cream:** `#FFF9F0` for high-contrast luxury editorial typography and airy readability.
- **Vibrant Coral Accent:** `#FF7659` for high-energy primary calls to action, badges, and focal points.
- **Acid Lime Highlighting:** `#D9E56A` for live floor indicators, queue counts, and typographic accents.

### 5.3 Typography & Readability
- **Dominant Editorial Headings:** Oversized geometric sans-serif (`Plus Jakarta Sans`, `Inter`, `system-ui`) paired with elegant high-fashion italic serif accents (`Playfair Display`, `Didot`, `Georgia`) and `Noto Sans Gujarati`.
- **Tokens & Countdowns:** High-impact monospace (`JetBrains Mono`, `Roboto Mono`, or tabular numbers) for crystal-clear ticket and wait-time visibility.

### 5.4 Ergonomics & Form Factors
- **Kiosk & Mobile:** Touch targets minimum $48\times 48\text{px}$, large digit phone keypad input, clear progress steps.
- **Waiting Area TV Display:** Extra-large typography ($48\text{px}\text{--}96\text{px}$), ultra-high contrast ratio ($>7:1$), visible from across a 25-foot waiting room.
- **Barber Station View:** High-visibility action buttons operable with single quick taps on an iPad or tablet stand.
