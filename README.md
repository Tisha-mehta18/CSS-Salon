[🌐 Click here to open CSS Salon](https://cascading-style-salon.netlify.app/)
**CSS - CASCADING STYLE SALON**
> *"We fix your bad hair styles, cascaded properly."*

A modern, real-time salon queue and floor management web application built for walk-in hair salons and barbershops. Playing on the beloved acronym **CSS** (*Cascading Style Sheets*), the application fuses high-end editorial salon aesthetics with witty developer culture and strict queue business rules.

---

## 1. Project Overview & Architecture

CSS Salon provides a synchronized, responsive experience across 7 distinct operational screens catering to 4 personas: **Walk-in Customers**, **Barbers / Stylists**, **Front Desk Receptionists**, and **Waiting Lounge Guests**.

### Design System: Botanical Editorial
- **Forest Green (`#173D32`):** Primary structural surface and atmosphere.
- **Warm Cream (`#FFF9F0`):** Soft, high-contrast typography and backgrounds.
- **Barber Coral (`#FF7659`):** Interactive highlights, primary call-to-actions, and live calling pulses.
- **Acid Lime (`#D9E56A`):** Status indicators, token badges, and completed state highlights.

---

## 2. All 7 Core Screens

| # | Screen Name | Route / Hash | Key Capabilities |
| :-: | :--- | :--- | :--- |
| **1** | **Home Screen** | `/` or `#home` | Salon open/closed status badge, live wait-time snapshot, oversized CSS branding, Join Queue button, and direct portals to all stations. |
| **2** | **Join Queue Screen** | `#join` | Walk-in kiosk registration: customer name, 10-digit phone, service selection (max 3), barber preference, live duration & price summary, and instant token issuance (`CSS-###`). |
| **3** | **My Status Screen** | `#status` | Real-time personal ticket tracker: search by Token ID or phone number, dynamic wait countdown, live status badge (`Waiting`, `Called`, `In Chair`, `Done`), and self-cancellation option. |
| **4** | **Reception Dashboard** | `#reception` | Central operational control desk: 3 Barber station cards showing occupancy, Call Next button, live waiting list with search, No-show & Cancel actions, and expedited Walk-In entry form. |
| **5** | **Barber View Screen** | `#barber` | Tablet interface for stylists: switch station tabs (Dave, Elena, Marco), Take 15-min Break / Resume toggle, Call Next, Client Seated (Start Cut), Finish Cut (Free Chair), and Station queue list. |
| **6** | **Waiting Area TV Display** | `#tv` | High-visibility 1080p wallboard: "Now Calling & Now Serving" per chair with pulse alerts, "Up Next In Line" ranked tokens, Web Audio API 2-tone synthesized chime, and scrolling news ticker. |
| **7** | **Owner Settings Screen** | `#settings` | Operational management: salon open/closed switch, queue registration lock, daily closing time with 30-min cutoff rule, today's analytics (check-ins, served, revenue), barber roster availability, and service catalog management. |

---

## 3. Queue Business Rules & Edge Cases Implemented

1. **First-Come, First-Served (FCFS) Ordering:** Queue ordering is strictly chronological by ticket creation timestamp (`createdAt`). Earlier arrivals are called first.
2. **Barber Choice (Specific vs. Any Barber):** Customers can choose their favorite stylist (Dave Miller, Elena Rostova, Marco Silva) or select "Any Available Stylist" for fastest service. Calling checks the barber's queue first, then pulls from the general pool.
3. **Single Active Customer Per Station Constraint:** A barber chair can only have at most one active customer (`Called` or `In Chair`) at a time. The "Call Next" button is automatically disabled while a chair is occupied.
4. **Strict State Machine Lifecycle:**
   $$\text{Waiting} \longrightarrow \text{Called} \longrightarrow \text{In Chair} \longrightarrow \text{Done}$$
   Terminal states: `Done`, `Cancelled`, and `No-show`.
5. **10-Minute No-Show Grace Period & Rejoining Rule:** When a customer is called, a 10-minute grace period applies. If they fail to arrive, they are marked `No-show`. Returning no-show clients must rejoin at the **end of the line with a brand-new token**.
6. **Duplicate Active Phone Prevention:** Phone numbers are normalized to 10 digits. The system rejects duplicate check-ins if the phone number already has an active ticket in line (`Waiting`, `Called`, `In Chair`).
7. **Service Selection Limit:** Customers can select a maximum of **3 services** per visit to prevent unrealistic queue blockages.
8. **Online Queue Auto-Close 30 Minutes Before Salon Closing:** Public self-registration automatically locks **30 minutes prior to salon closing time**, ensuring all queued clients can be completed before the salon shuts.
9. **Barber Break Management:** Stylists can toggle `ON_BREAK` from their tablet or reception. Break mode pauses "Any Barber" routing to that station and updates estimated wait times.
10. **Web Audio API Sound Chime:** Synthesizes a pleasant 2-tone alert chime (`D5` 587.33 Hz &rarr; `A5` 880 Hz) without any heavy external audio files.
11. **Cross-Tab Synchronization:** All screens synchronize instantly in real-time across multiple open browser tabs using reactive `localStorage` events and periodic state heartbeats.

---

## 4. Bilingual Support (English & Gujarati)

CSS Salon features complete, seamless **1-click language toggling** between **English** and **Gujarati** (`en` / `gu`) across all 7 screens without page refreshes:
- Navigation bars, button actions, and hero headers.
- Service names, descriptions, and currency formatting (`$` and `₹`).
- Barber station names, specialties, and duty statuses.
- Validation warnings, error alerts, and live ticker bulletins.

---

## 5. Technology Stack

- **Framework:** React 18
- **Language:** TypeScript (Strict types for Queue, Barbers, Services, Settings)
- **Bundler & Dev Server:** Vite
- **Styling:** Pure Modern CSS (CSS Custom Properties / Variables, CSS Grid, Flexbox, Keyframe Animations)
- **Audio:** Web Audio API (Synthesized 2-tone frequency chime)
- **Persistence:** LocalStorage + Reactive Event Dispatcher for multi-screen simulation
- **Dependencies:** Zero external UI libraries (No Tailwind, no Bootstrap, no heavy state libraries)

---

## 6. How to Run Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Setup & Launch
```bash
# 1. Clone or open the repository folder
cd CSS_Salon

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser to: `http://localhost:5173`

### Production Build & Preview
```bash
# Type check and build optimized bundle into dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 7. 3-Minute Demo Video Walkthrough Script

| Time | Screen & Action | Narration & Key Points |
| :--- | :--- | :--- |
| **0:00 - 0:45** | **Home & Join Queue (`#join`)** | *"Welcome to CSS Salon. We start on the editorial Home screen showing live waiting counts and opening hours. We click 'Join Queue', select 2 services (Haircut + Beard Sculpt), choose 'Dave Miller', and enter a 10-digit phone number. Notice live price and duration calculate instantly. Submitting issues token `CSS-842`."* |
| **0:45 - 1:15** | **My Status Screen (`#status`)** | *"The customer can track their ticket on mobile via My Status. Entering `CSS-842` shows their live status as 'Waiting', assigned barber Dave, and an estimated wait of ~15 minutes. We show the 1-click Gujarati toggle translating the entire ticket."* |
| **1:15 - 2:00** | **Reception Dashboard (`#reception`)** | *"At the front desk, `CSS-842` appears in the Waiting Lounge. Dave Miller's station card shows 'Available'. We click 'Call Next Guest'. The synthesized chime rings, Dave's chair becomes 'In Chair', and the single-customer constraint disables calling another customer."* |
| **2:00 - 2:30** | **Barber View (`#barber`) & TV (`#tv`)** | *"Switching to Dave's tablet in Barber View, he sees `CSS-842` in his chair. He clicks 'Finish Cut & Free Chair'. The ticket marks as Done. On the Waiting Area TV screen, the board automatically updates to show Dave is now ready for the next guest."* |
| **2:30 - 3:00** | **Owner Settings (`#settings`) & Edge Cases** | *"In Owner Settings, today's analytics reflect the completed cut and revenue. We demonstrate toggling a barber on break, which pauses routing. Finally, we demonstrate duplicate phone blocking and the 30-minute auto-close rule."* |

---

## 8. Deployment Guide

The project is built as a Single Page Application (SPA) with zero backend server dependencies. The production build output is in `dist/`.

### Deployment to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Accept default build settings (`npm run build`, output directory `dist`).

### Deployment to Netlify
1. Drag and drop the `dist/` folder into Netlify Drop ([app.netlify.com/drop](https://app.netlify.com/drop)), or:
2. Connect your Git repository with build command `npm run build` and publish directory `dist`.

---

## 9. Engineering Reflection (Vibe Coding Lab)

### What Went Well
- **Deterministic Queue Engine:** Modeling the salon queue as a strict finite-state machine (`Waiting` &rarr; `Called` &rarr; `In Chair` &rarr; `Done`) prevented invalid state transitions and duplicate bookings.
- **Pure CSS & Visual Identity:** Using modern CSS custom properties and CSS Grid allowed us to craft a botanical editorial aesthetic that stands out from generic template dashboards while keeping bundle size under 35 kB.
- **Synthesized Audio Alert:** Implementing the chime via the Web Audio API eliminated the need for external MP3 assets, preventing audio load failures and network latency.
- **Zero-Dependency i18n:** Storing English and Gujarati dictionaries in TypeScript ensured strict type safety for translation keys without bringing in bulky internationalization libraries.

### Key Challenges & Solutions
- **Multi-Screen Synchronous State:** In a student lab environment without WebSocket infrastructure, keeping the customer's phone, barber tablet, TV wallboard, and reception synchronized required a hybrid approach. We paired `localStorage` persistence with custom browser events and interval heartbeats to achieve sub-second floor synchronization.
- **Edge Case Rigor:** Handling situations like no-show timeouts (10-minute grace window), customer rejoining at the end of the line, and the 30-minute closing threshold required careful validation logic in the store layer before any ticket state could mutate.

### Conclusion
CSS Salon proves that modern web standards (React 18, TypeScript, vanilla CSS, Web Audio API) can deliver a full-featured, accessible, and delightful floor management platform suitable for real-world salon operations.
