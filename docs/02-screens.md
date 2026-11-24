# CSS — Cascading Style Salon: Screen Specifications

This document defines the layout, purpose, interactive controls, behavioral flows, mobile responsiveness, and empty/error states for all seven (7) primary screens in the **CSS — Cascading Style Salon** application.

---

## Screen Directory

1. [Universal Elements (Header & Language Switcher)](#universal-elements-header--language-switcher)
2. [Screen 1: Home](#screen-1-home)
3. [Screen 2: Join Queue](#screen-2-join-queue)
4. [Screen 3: Customer Status](#screen-3-customer-status)
5. [Screen 4: Reception Dashboard](#screen-4-reception-dashboard)
6. [Screen 5: Barber View](#screen-5-barber-view)
7. [Screen 6: Waiting Area Display (TV)](#screen-6-waiting-area-display-tv)
8. [Screen 7: Owner Settings](#screen-7-owner-settings)

---

## Universal Elements (Header & Language Switcher)

Every screen features a consistent top utility header:
- **Brand Logo:** `CSS — Cascading Style Salon`
- **Language Switcher (`EN | ગુજરાતી`):** Instant toggle between English and Gujarati without page reload. All labels, buttons, status pills, and system notices render immediately in the active language.
- **Clock & Operating Status:** Live time and salon state (`● OPEN` / `○ CLOSED`).

---

## Screen 1: Home

### 1. Purpose
The public landing page and navigation launchpad for the salon. It provides real-time salon operational status (Open/Closed), current overall wait-time snapshot, quick-action entry points for walk-in clients, and access portals for salon staff in both English and Gujarati.

### 2. Layout
- **Header:** Salon brand logo, language switcher (`EN | ગુજરાતી`), live operational indicator badge (`● OPEN - Queue Active` / `○ CLOSED`), and current clock time.
- **Hero Section:**
  - Catchphrase: *"Clean Cuts, Zero Overflow."* (ગુજરાતી: *"શ્રેષ્ઠ સ્ટાઇલ, ઝીરો લાઇન."*)
  - Quick Glance Metrics Bar:
    - *People Waiting:* Count (e.g., `4 in line` / `૪ લાઇનમાં`)
    - *Active Barbers:* Count (e.g., `3 on floor` / `૩ હાજર`)
    - *Est. Next Wait Time:* Estimated minutes (e.g., `~18 min` / `~૧૮ મિનિટ`)
  - Primary Action Cards:
    - **Card A (Primary):** `Join Queue` / `લાઇનમાં જોડાઓ` (Large highlighted card with warm amber CTA).
    - **Card B (Secondary):** `Already in Line? Track My Spot` / `સ્થિતિ તપાસો` (Direct phone/token lookup modal input).
- **Secondary Footer / Staff Hub:**
  - Quick links to staff portals: `Waiting Area TV Display`, `Barber Station View`, `Reception Desk`, `Owner Settings`.

### 3. Buttons & Controls
- `Join Queue` / `લાઇનમાં જોડાઓ`: Navigates to `/join`.
- `Track My Spot` / `સ્થિતિ તપાસો`: Opens quick modal or inline input for Phone/Token ID to navigate to `/status/:tokenId`.
- `Language Switcher (EN / ગુજરાતી)`: Toggles locale across the application.
- `View Live TV Board`: Opens `/tv` in a clean tab.
- `Staff Portals Dropdown / Links`: Direct links to `/reception`, `/barber`, and `/settings`.

### 4. Behavior
- **Auto-polling status:** Dynamically re-checks salon status every 30 seconds to update the live wait metrics and open/closed state.
- **Direct Lookup:** Entering a valid active phone number or token in "Track My Spot" immediately routes to `Customer Status`.
- **Online Queue Closing 30 Minutes Before Salon Closing:**
  - If the current time is within 30 minutes of salon closing (e.g., 7:30 PM for an 8:00 PM close), the self-service `Join Queue` button is automatically disabled.
  - Informative banner displays: *"Online & kiosk queue is closed for the day (closes 30 minutes before salon closing time). Remaining queued clients will be served."* (ગુજરાતી: *"સલૂન બંધ થવાના ૩૦ મિનિટ પહેલાં કતાર બંધ થઈ ગઈ છે. હાજર ગ્રાહકોની સેવા પૂર્ણ કરવામાં આવશે."*)
- **Closed Salon Behavior:** If salon owner has toggled queue to "Closed", the `Join Queue` button is disabled, and an informative banner appears: *"The queue is currently closed. Walk-ins reopen tomorrow at 09:00 AM."*

### 5. Mobile Responsiveness
- **Desktop (1024px+):** Centered maximum width container (1200px), 2-column hero with metrics beside action cards.
- **Tablet (768px - 1023px):** Stacked hero with 2-grid card layout.
- **Mobile (<768px):** Single-column vertical layout. Action buttons become full-width touch targets with sticky bottom check-in bar for rapid mobile access.

### 6. Empty & Error States
- **Zero Queue (Empty State):** When no one is waiting, the metrics display `0 People Waiting` and the highlight banner reads: *"No wait! Walk right in and get seated immediately."* (ગુજરાતી: *"કોઈ વેઇટિંગ નથી! તરત જ પધારો."*)
- **Queue Paused / Full (Error State):** If maximum queue threshold is reached (e.g., 30 clients), displays banner: *"Queue currently at capacity. Please check back in 15 minutes."*
- **Lookup Not Found:** When an invalid phone/token is entered in "Track My Spot", an inline error appears: *"No active ticket found for this number. Would you like to join the queue?"*

---

## Screen 2: Join Queue

### 1. Purpose
The self-service check-in kiosk and customer mobile registration interface. Allows walk-in customers to register their arrival in under 30 seconds, choose their service and stylist preference, and enter the active queue with full English and Gujarati localization.

### 2. Layout
- **Header:** Back button (`< Back to Home`), Salon branding, Language switcher (`EN | ગુજ`), step progress indicator (`1. Details → 2. Service → 3. Stylist`).
- **Form Container (Single-page streamlined card):**
  - **Section A: Customer Details:**
    - Full Name input (autofocused) / ગ્રાહકનું નામ.
    - Mobile Phone Number input (with country code and auto-formatter) / ફોન નંબર.
  - **Section B: Service Selection / સેવા પસંદ કરો:**
    - Visual selectable service cards with title, duration, and price:
      - *Classic Haircut / હેરકટ - 30 min*
      - *Beard Trim & Shape / દાઢી ટ્રીમ - 15 min*
      - *The Full Stack: Haircut + Beard / હેરકટ + દાઢી - 45 min*
      - *Quick Lineup / ક્વિક લાઇનઅપ - 15 min*
  - **Section C: Stylist Preference / વાળંદ પસંદગી:**
    - Toggle chips: `Any Available Barber (Fastest) / કોઈપણ ઉપલબ્ધ વાળંદ` vs. `Specific Barber / ચોક્કસ વાળંદ`.
    - If `Specific Barber` is chosen: Horizontal scroll or grid of barber avatar cards displaying name, current queue depth, and individual estimated wait (e.g., *Dave - 2 waiting (~35 min)*, *Elena - 0 waiting (~5 min)*).
  - **Section D: Summary & Terms:**
    - Estimated wait time calculated live based on selection.
    - **10-Minute Policy Notice:** *"We hold your spot for 10 minutes after calling your token. If you do not report within 10 minutes, your spot will be cancelled as a no-show, and you will need to rejoin at the end of the line with a new token."* (ગુજરાતી: *"ટોકન બોલાવ્યા પછી ૧૦ મિનિટ સુધી તમારી જગ્યા રાખવામાં આવશે. ૧૦ મિનિટમાં ન આવવા પર નવો ટોકન લઈને છેલ્લે જોડાવું પડશે."*)
- **Footer:** Prominent `Confirm & Join Queue` / `કન્ફર્મ કરો અને લાઇનમાં જોડાઓ` button.

### 3. Buttons & Controls
- `Confirm & Join Queue`: Submits the registration.
- `Service Selection Cards`: Radio-like click targets with checkmark indicator.
- `Stylist Filter Chips`: Toggles between `Any Barber` and specific roster list.
- `Language Switcher`: Switches entire form between English and Gujarati instantly.
- `< Back to Home`: Returns to `/home`.

### 4. Behavior
- **30-Minute Closing Cutoff:** If current time is within 30 minutes of salon closing, form submission is disabled with notice: *"Queue registrations close 30 minutes before salon closing time."*
- **Duplicate Phone Validation:** Immediately checks if the phone number currently has an active ticket (`WAITING`, `CALLED`, or `IN_CHAIR`). If active, rejects registration and offers direct link to view their active ticket.
- **Live Dynamic Estimate:** Changing the service or switching between "Any Barber" and a specific barber instantly recalibrates the displayed wait time preview.
- **Submission:** On successful submission, creates a new queue ticket with an issued Token ID (e.g., `CSS-015`), stores the token in local storage (for persistent browser recall), and redirects directly to `/status/CSS-015`.

### 5. Mobile Responsiveness
- **Desktop/Kiosk:** Centered 640px card with high-contrast inputs designed for touch kiosks.
- **Mobile (<768px):** Full-screen scrollable form. Keypad for phone automatically triggers numeric input (`type="tel"`). Bottom `Confirm & Join Queue` button is fixed/sticky to bottom viewport.

### 6. Empty & Error States
- **Validation Errors:** Highlighting empty name or incomplete 10-digit phone number with inline warning message (`"Please enter a valid 10-digit mobile number"` / `"કૃપા કરીને માન્ય ૧૦ આંકડાનો ફોન નંબર દાખલ કરો"`).
- **Duplicate Active Phone Error:** Modal/Banner: *"Phone number (555) 019-2834 is already in line with Token CSS-009. [Click here to view your ticket]"*.
- **30-Minute Closing Error:** Banner: *"Registration closed for today. Walk-ins reopen tomorrow morning at 09:00 AM."*
- **No Barbers Active Error:** If all barbers are off-duty or on break, disables submit: *"All stylists are currently unavailable. Please speak with reception."*

---

## Screen 3: Customer Status

### 1. Purpose
The personal live ticket tracker that customers monitor on their smartphone while waiting in the salon or browsing nearby shops. It provides live countdowns, position in line, barber updates, and immediate call notifications with full English and Gujarati bilingual support.

### 2. Layout
- **Top Status Banner:** Prominent live state badge with animated status color (bilingual):
  - `WAITING` / પ્રતીક્ષામાં (Amber)
  - `YOU'RE UP! PLEASE PROCEED TO CHAIR` / તમારો વારો આવી ગયો છે! કૃપા કરીને ખુરશી પર જાઓ (Pulsing Cyan)
  - `IN CHAIR - ENJOY YOUR SERVICE` / સેવાનો આનંદ માણો (Emerald Green)
  - `COMPLETED` / સેવા પૂર્ણ (Muted Slate)
  - `NO-SHOW / CANCELLED` / ગેરહાજર / રદ (Rose)
- **Ticket Hero Card (Boarding Pass / Token Design):**
  - **Token Number:** Extra-large bold token (e.g., `CSS-015`).
  - **Customer Name & Selected Service:** e.g., *"Alex Rivera — Classic Haircut (30 min)"* / *"એલેક્સ - હેરકટ (૩૦ મિનિટ)"*.
  - **Assigned Barber & Station:** e.g., *"Barber: Elena Rostova (Station 2)"* or *"Next Available Barber"*.
  - **Queue Position Counter:** Large badge: *"2 ahead of you"* / *"તમારી આગળ ૨ ગ્રાહક છે"*.
  - **Dynamic Countdown Timer:** *"Estimated Wait: ~14 mins"* with progress ring.
- **Live Instruction Box:**
  - Dynamic instructions according to status (e.g., *"Feel free to grab a coffee nearby. We will ping this screen when you are next!"* / *"તમે નજીકમાં જઈ શકો છો. તમારો વારો આવતાં સ્ક્રીન પર નોટિફિકેશન મળશે."*).
- **Customer Action Buttons:**
  - `Cancel My Spot` / `મારી જગ્યા રદ કરો` (Ghost/danger outline button).
  - `Language Switcher (EN | ગુજ)`: Instant bilingual toggle.
  - `Refresh` button (alongside automatic WebSocket/SSE live refresh).

### 3. Buttons & Controls
- `Cancel My Spot`: Opens a confirmation modal: *"Are you sure you want to give up your spot in line? If you cancel, you will need to rejoin at the end with a new token."* with `Keep My Spot` and `Confirm Cancellation`.
- `Refresh Now`: Manually triggers a state sync.
- `Directions / Salon Map`: Shows salon address and quick tap-to-call front desk link.

### 4. Behavior
- **Real-Time Polling / Push:** Synchronizes ticket status every 5 seconds or via event updates.
- **Call Notification Trigger:** When status transitions from `WAITING` &rarr; `CALLED`:
  - Browser triggers device vibration (if supported) and plays an audible two-tone notification chime.
  - The entire screen pulses bright cyan with clear instructions: *"You are being called! Please proceed to Station 2 with Elena."*
  - A strict **10-minute grace-period timer (600 seconds)** countdown begins with circular visual progress.
- **In-Chair Transition:** When barber marks client seated, status changes to `IN_CHAIR`, showing elapsed service time.
- **Completion / Archive:** When marked `DONE`, displays a thank-you screen with visit duration and a button to return Home.

### 5. Mobile Responsiveness
- Specifically engineered for mobile phone viewports ($375\text{px}\text{--}430\text{px}$).
- Compact, high-readability card with zero horizontal scrolling.
- Ticket elements fit within the first viewport height without requiring user scroll on standard mobile devices.

### 6. Empty & Error States
- **Invalid Token / Ticket Not Found:** *"Ticket #CSS-999 could not be found or has expired. [Return to Home to check in]"*.
- **Cancelled State:** If the customer or front desk cancelled the ticket: *"This ticket was cancelled. If you still want a haircut, you must rejoin at the end of the line with a new token. [Join Queue Again]"*.
- **No-Show State:** If customer failed to arrive within the 10-minute window: *"Your ticket expired due to no-show (10-minute grace period ended). To get a haircut, please join the queue again at the end with a new token. [Get New Token]"*.

---

## Screen 4: Reception Dashboard

### 1. Purpose
The comprehensive operational control desk for the front-desk receptionist or salon manager. Provides 360-degree oversight of all active tickets, walk-ins, station occupancy, barber breaks, and manual triage tools.

### 2. Layout
- **Top Bar:** Salon summary stats: `Total Served Today`, `Currently Waiting`, `Avg Wait Time`, `Active Barbers (e.g. 4/5)`, Queue status indicator (including 30-min closing warning), language toggle (`EN | ગુજ`), and quick search bar (`Search by name, phone, or token`).
- **3-Panel Dashboard Layout:**
  - **Left Panel (Fast Walk-In Entry):**
    - Compact, rapid-entry form: Name, Phone, Service dropdown, Stylist dropdown.
    - Large one-click `+ Add Walk-In` button.
  - **Center Panel (Unified Queue Board - Tabbed):**
    - Filter tabs: `All (6)`, `Waiting (4)`, `Called (1)`, `In Chair (3)`, `Completed/Archived`.
    - Interactive Queue Table/Cards:
      - Token ID (`CSS-012`), Customer Name, Phone, Service, Requested Stylist, Wait Duration, Status Badge.
      - Action menu for each row: `Call Now`, `Seat`, `Mark Done`, `Reassign Barber`, `Bump Up / Priority`, `Mark No-Show (Active after 10 min)`, `Cancel`.
  - **Right Panel (Barber Stations Live Matrix):**
    - Grid of active barber station cards (Station 1 through Station N):
      - Barber Name & Photo/Avatar.
      - Status indicator (`Occupied`, `Available`, `On Break (15m)`, `Offline`).
      - Currently seated customer info & elapsed cut time.
      - Station queue count.
      - Station Break Toggle: Quick switch to place barber on break or return them to active duty.

### 3. Buttons & Controls
- `+ Add Walk-In`: Submits new walk-in directly into the queue.
- `Call Customer`: Triggers public TV alert and moves customer to `CALLED`, initiating 10-minute countdown.
- `Seat Customer`: Transitions customer to `IN_CHAIR`.
- `Mark Done`: Completes the ticket and frees the barber.
- `Reassign Barber`: Opens modal to shift customer to a different barber or back to `Any Barber`.
- `Priority Bump`: Moves a waiting customer up one slot in their respective queue.
- `No-Show / Cancel`: Flags ticket as no-show (after 10 minutes) or cancels.
- `Rejoin Customer at End`: Helper button to create a new token for returning no-show clients at the end of the line.
- `Barber Break Toggle`: Places a barber on break or resumes active service.
- `Emergency Pause Queue`: Halts new customer self-registrations.

### 4. Behavior
- **Strict 10-Minute No-Show Tracking:** Displays elapsed time for all called tickets. Shows warning badge once 10 minutes pass: *"No-Show Threshold Reached"*.
- **Rejoining Rule Enforcement:** Receptionists cannot restore a no-show ticket to its original priority. If a no-show customer returns, the system creates a brand-new token placed strictly at the end of the line.
- **Barber Breaks Handling:** Placing a barber on break automatically pauses incoming "Any Barber" assignments to that station and updates the wait-time engine.
- **30-Minute Closing Indicator:** Prominently alerts the receptionist when the 30-minute self-registration closing threshold is reached.
- **Real-Time Synchronous Updates:** State reflects all actions across customer devices and barber stations with zero delay.

### 5. Mobile Responsiveness
- **Desktop (1440px+):** Optimal 3-column split view (Input | Queue Table | Station Grid).
- **Laptop / Tablet Landscape (1024px - 1366px):** 2-column layout (Queue Table + collapsible Station Drawer, Quick Add in top toolbar modal).
- **Tablet Portrait & Mobile (<1024px):** Tab-based navigation switching between `Queue List`, `Station Overview`, and `+ New Walk-In`.

### 6. Empty & Error States
- **Empty Queue State:** Center panel shows clean illustration: *"Queue is clear! All customers have been served."* with instant `Add Walk-In` prompt.
- **No Search Results:** *"No customers match query 'Alex'. [Clear Filter]"*.
- **Offline / Sync Error:** Persistent top warning banner: *"Connection interrupted. Attempting to reconnect to live floor sync..."*

---

## Screen 5: Barber View

### 1. Purpose
A focused, distraction-free tablet/mobile station interface for individual barbers mounted at their cutting station mirror. Empowers stylists to call their next client, manage their chair, track 10-minute call grace periods, and signal breaks without leaving their station.

### 2. Layout
- **Station Header Bar:**
  - Barber Name & Station Number: e.g., *"Dave Miller — Station 1"*.
  - Roster Status Toggle: Segmented control (`Active / Cutting`, `Take 15-min Break`, `Clock Out / Offline`).
  - Language Switcher (`EN | ગુજ`).
- **Main Hero: "Current In Chair" Section:**
  - If occupied:
    - Customer Token (`CSS-010`), Name, Service (*Skin Fade + Beard Trim*).
    - Service Duration Progress Bar & Elapsed Service Timer (e.g., `22m / 30m`).
    - Special Notes (e.g., *"Prefers low taper, no straight razor"*).
    - Primary Action Button: `Finish Cut & Free Chair` (Large emerald green button).
    - Secondary Action Button: `Transfer / Flag Issue`.
  - If currently calling:
    - Customer Token (`CSS-012`), Name, Service.
    - Pulsing banner: *"CALLED — Waiting for client to reach chair"* with **10-minute countdown clock (600s)**.
    - Primary Action Button: `Client Seated (Start Cut)`.
    - Secondary Action Button: `Mark No-Show` (highlights brightly after 10-minute grace period expires).
  - If chair is empty:
    - Empty chair illustration with prompt: *"Chair is ready for your next customer."*
    - Primary Action Button: `Call Next Customer` (Large amber button).
- **Lower Section: "Next In Your Queue" List:**
  - Ordered list of clients queued specifically for this barber, followed by general "Any Barber" pool candidates.
  - Displays token, customer first name, service, and estimated start time.

### 3. Buttons & Controls
- `Call Next Customer`: Pulls the next eligible customer, shifts state to `CALLED`, triggers TV alert and starts 10-minute grace timer.
- `Client Seated (Start Cut)`: Shifts state to `IN_CHAIR`, starts service timer.
- `Finish Cut & Free Chair`: Completes the session (`DONE`), frees chair, ready for next call.
- `Mark No-Show`: Available during `CALLED` state; releases chair and removes ticket after 10 minutes.
- `Take 15-min Break / Resume`: Dedicated toggle that sets barber status to `ON_BREAK`, pausing routing and alerting reception.

### 4. Behavior
- **One Active Customer Constraint:** `Call Next Customer` is disabled while a customer is currently `IN_CHAIR` or actively `CALLED`.
- **10-Minute Grace Window:** The timer counts down from 10:00. If customer arrives before 10:00, barber clicks `Client Seated`. If timer hits 00:00 without arrival, `Mark No-Show` flashes amber/red.
- **Barber Break Rules:** When toggled to `ON_BREAK`:
  - Station card highlights in orange with a 15-minute countdown timer.
  - The station cannot call new clients while on break.
  - "Any Barber" pool routing skips this station until the barber clicks `Resume Duty`.
  - Reception dashboard updates immediately.

### 5. Mobile Responsiveness
- Engineered primarily for 10" to 12.9" tablets (iPad, Galaxy Tab) mounted in landscape orientation.
- Responsive down to smartphone portrait view ($375\text{px}\text{--}430\text{px}$) for barbers who prefer checking queue on personal phones.
- Buttons feature extra-large touch targets ($64\text{px}+$ height) with high contrast for easy operation with styling products or gloves.

### 6. Empty & Error States
- **No Waiting Customers (Empty State):** *"Queue is empty for your station. Great job! Relax or help reception with walk-ins."* / *"તમારા સ્ટેશન માટે કોઈ ગ્રાહક પ્રતીક્ષામાં નથી."*
- **Action Error Prevention:** Attempting to click "Call Next" when another customer is in chair displays a modal: *"Please complete or close the current customer's cut before calling another."*
- **Accidental Click Protection:** "Finish Cut" requires a distinct single tap with undo toast (5-second grace window to undo accidental click).
- **Break Safeguard:** Toggling to `On Break` prevents the system from assigning any new "Any Barber" walk-ins to this station until the barber returns.

---

## Screen 6: Waiting Area Display (TV)

### 1. Purpose
The public lounge wallboard displayed on large television screens (1080p / 4K) in the waiting area. Provides high-visibility queue status, audibly alerts customers when their turn arrives, and minimizes customer anxiety by keeping the entire line transparent with bilingual English and Gujarati displays.

### 2. Layout
Designed for 16:9 landscape aspect ratio with ultra-high contrast dark theme:
- **Top Broadcast Header:**
  - Salon Logo: `CSS — Cascading Style Salon`
  - Live Digital Clock & Date: e.g., `11:42 AM | Tuesday, Nov 24`
  - Floor Summary Badges: `Now Waiting: 5` (`વેઇટિંગ: ૫`) | `Avg Wait: ~15 min` (`સરેરાશ સમય: ~૧૫ મિનિટ`)
  - Language indicator: `EN | ગુજ` (auto-alternates or displays bilingual dual headers).
- **Main Split Screen (2 Primary Columns):**
  - **Left Column (60% Width) — "NOW CALLING & NOW SERVING / હાલમાં સેવા ચાલુ":**
    - Large grid of active station cards (Stations 1 through 6):
      - Station Number & Stylist Name (e.g., `STATION 1 — Dave`).
      - Large Token ID (e.g., `CSS-014`).
      - Customer First Name & Initial (e.g., `Marcus T.`).
      - Status pill:
        - `NOW CALLING / વારો આવ્યો છે` (Bright glowing Cyan with animated pulse border and 10-minute grace timer countdown).
        - `IN CHAIR / સેવામાં છે` (Solid Emerald Green with elapsed cut indicator).
  - **Right Column (40% Width) — "UP NEXT IN LINE / આગામી વારો":**
    - High-legibility vertical scrolling/paginated list of upcoming tokens:
      - Rank / Position (`#1`, `#2`, `#3`, `#4`, `#5`).
      - Token Number (`CSS-015`, `CSS-016`, etc.).
      - Preferred Barber (`Any Barber / કોઈ પણ` or `Elena`).
      - Estimated Wait (`~8 min`, `~15 min`, etc.).
- **Bottom Ticker / Ambient Footer:**
  - Scrolling bilingual news ticker: *"Welcome to CSS Salon • Please proceed to your station when your token is called (10 min grace period) • સલૂનમાં આપનું સ્વાગત છે • ટોકન બોલાવ્યા પછી ૧૦ મિનિટમાં સ્ટેશન પર પહોંચવું."*
  - Discreet sound indicator icon (audio chime active).

### 3. Buttons & Controls
- *Public TV Mode has zero intrusive UI controls.*
- Discreet hover/setup controls (top right, visible on mouse move only):
  - `Fullscreen` toggle button (F11 equivalent).
  - `Mute / Unmute Audio Chime` toggle button.
  - `Theme Contrast Boost` toggle.
  - `Language Display Mode` (Dual Bilingual, English, Gujarati).

### 4. Behavior
- **Audio Chime on Call:** Whenever any barber or receptionist clicks `Call Customer`:
  - Plays a pleasant, audible 2-note salon chime (`C5` &rarr; `G5`) via Web Audio API.
  - The designated station card flashes bright cyan for 10 seconds with a smooth CSS pulsing keyframe animation.
- **Auto-Pagination:** If the "Up Next" queue contains more than 8 people, the right column smoothly scrolls or paginates every 12 seconds.
- **Zero Refresh Flickering:** State is updated via reactive memory/state listeners so cards transition seamlessly without page reloads.

### 5. Mobile Responsiveness
- **Primary Target:** 1920x1080 (Full HD) and 3840x2160 (4K) landscape displays.
- **Adaptive Fallback:** If opened on an iPad or portrait orientation screen (e.g., vertical kiosk TV), layout automatically transforms into a single-column stacked format with "Now Calling" on top and "Up Next" below.

### 6. Empty & Error States
- **Zero Queue State (Idle / Ambient Mode):**
  - If no customers are waiting or in chair, switches to an elegant ambient screensaver:
    - Glowing CSS Salon logo.
    - Large message: *"No wait right now! Walk up to reception to get styled."* / *"કોઈ વેઇટિંગ નથી! તરત જ પધારો."*
    - Salon pricing menu and stylist showcase reel.
- **Connection Lost State:** Small subtle warning dot in bottom right: *"Reconnecting..."* without interrupting the displayed token board.

---

## Screen 7: Owner Settings

### 1. Purpose
The salon owner and operations administration dashboard. Provides master controls over salon operating hours, 30-minute queue closing rule, barber roster, service catalog, baseline cut times, daily queue resets, and salon capacity rules.

### 2. Layout
- **Header:** Administration Title (`Owner Settings`), breadcrumb navigation to Dashboard, language switcher (`EN | ગુજ`), and `Save Changes` master action.
- **Tab Navigation Bar:**
  - `Tab 1: Salon Operations & Hours`
  - `Tab 2: Barber Roster`
  - `Tab 3: Services & Pricing`
  - `Tab 4: Queue Rules & Capacity`
  - `Tab 5: Daily Maintenance`
- **Tab Content Views:**
  - **Tab 1: Salon Operations & Hours:**
    - Salon Open Time (e.g., `09:00 AM`) and Salon Closing Time (e.g., `08:00 PM`).
    - **Online Queue Auto-Close Rule:** Toggle: *"Automatically close online queue 30 minutes before salon closing"* (default: Enabled, closing queue at 07:30 PM).
    - Default Application Language (`English` / `Gujarati`).
  - **Tab 2: Barber Roster:**
    - List of all barbers with station assignment, active status toggle, and delete/edit button.
    - `+ Add New Barber` button (opens form: Name, Station #, Avatar URL, Specialty).
  - **Tab 3: Services & Pricing:**
    - Table of services: Service Name (English & Gujarati), Default Duration (minutes), Price ($ / ₹), Active toggle.
    - `+ Add New Service` button.
  - **Tab 4: Queue Rules & Capacity:**
    - Queue Open/Closed master toggle.
    - Maximum queue capacity limit slider (e.g., 5 to 50 people).
    - **No-Show Auto-Grace Timeout:** Configurable in minutes (**default: 10 minutes**).
    - **Rejoining Policy:** Display rule: *"No-shows must rejoin at the end of the line with a newly issued token"*.
    - Estimated buffer time between haircuts (default 5 minutes cleaning).
  - **Tab 5: Daily Maintenance:**
    - `Reset Daily Queue Token Counter` (resets sequence back to `CSS-001`).
    - `Export Today's Queue Log (JSON/CSV)`.
    - Emergency `Clear All Active Tickets`.

### 3. Buttons & Controls
- `Save Changes`: Persists all configuration updates.
- `+ Add Barber` / `+ Add Service`: Opens creation modals.
- `Toggle Active / Inactive`: Switch controls on barbers and services.
- `Reset Queue Sequence`: Triggers double-confirmation modal (*"Are you sure? This will archive all existing tickets and reset tokens to CSS-001"*).
- `Master Queue Toggle`: Toggles salon state between `OPEN` and `CLOSED`.

### 4. Behavior
- **Immediate Propagation:** Changes to barber rosters, salon closing hours, or service durations immediately affect the wait-time estimation engine and check-in eligibility across all screens.
- **Destructive Action Confirmation:** Dangerous actions (e.g., clearing queue, resetting token counters) require typing "RESET" or confirming via modal to prevent accidental data loss.
- **Validation:** Enforces unique station numbers, valid opening/closing time windows, and positive non-zero service durations (min 5 minutes).

### 5. Mobile Responsiveness
- **Desktop (1024px+):** Sidebar or horizontal tabs with expansive data tables.
- **Mobile (<768px):** Clean vertical accordion cards for each barber and service, with sticky bottom `Save Changes` bar.

### 6. Empty & Error States
- **No Barbers Configured:** Warning banner: *"You currently have no active barbers. The queue cannot accept walk-ins until at least one barber is active."*
- **Validation Error:** Inline red error badges for invalid durations, empty names, or duplicate station numbers.
- **Unsaved Changes Banner:** Floating bottom prompt: *"You have unsaved changes. [Discard] [Save Changes]"*.

### 6. Empty & Error States
- **No Barbers Configured:** Warning banner: *"You currently have no active barbers. The queue cannot accept walk-ins until at least one barber is active."*
- **Validation Error:** Inline red error badges for invalid durations, empty names, or duplicate station numbers.
- **Unsaved Changes Banner:** Floating bottom prompt: *"You have unsaved changes. [Discard] [Save Changes]"*.
