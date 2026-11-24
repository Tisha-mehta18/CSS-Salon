# AGENTS.md: Developer & AI Agent Guidelines

> **CRITICAL DIRECTIVE FOR ALL AGENTS & DEVELOPERS:**
> **DO NOT WRITE APPLICATION CODE OR INSTALL PACKAGES WITHOUT USER APPROVAL.**
> Always read and adhere strictly to the documentation files in `/docs` before planning or executing any implementation steps.

---

## 1. Project Overview

**CSS — Cascading Style Salon** is a real-time salon queue and floor management application designed for walk-in hair salons and barbershops. Playing on the acronym **CSS** (*Cascading Style Sheets*), the application pairs hair grooming with developer culture aesthetics ("We fix your bad hair styles, cascaded properly").

The system orchestrates a synchronized queue across four primary personas:
1. **Walk-in Customers** (Self-service kiosk check-in and personal smartphone live ticket tracker).
2. **Barbers / Stylists** (Focused, tablet-friendly station view to call, seat, and complete cuts).
3. **Receptionist / Front Desk** (Central command dashboard for queue triage, manual walk-in entry, and reassignments).
4. **Waiting Area Guests** (Large-format TV wallboard with chime notifications and live queue status).

---

## 2. Tech Stack Planned

| Layer | Technology | Purpose & Rationale |
| :--- | :--- | :--- |
| **Framework** | **React (v18+)** | Component-driven UI architecture, declarative state handling, and performant virtual DOM rendering. |
| **Language** | **TypeScript** | Strict type safety for domain models (Tickets, Barbers, Services, Stations) and state transitions. |
| **Build Tool & Bundler** | **Vite** | Ultra-fast Hot Module Replacement (HMR), lightweight build configurations, and instant dev server. |
| **Styling** | **Modern CSS (Custom Properties / CSS Modules)** | True to the project's namesake (*CSS*), the design relies on clean, high-performance vanilla CSS, CSS Grid, Flexbox, custom properties (variables), and subtle CSS keyframe animations. |
| **Sound / Audio** | **Web Audio API** | Synthesized 2-tone pleasant salon chime for TV call alerts without external heavy audio assets. |
| **Localization (i18n)** | **Lightweight Context + TS Dictionaries** | Zero-dependency, student-lab-friendly bilingual support for **English** and **Gujarati** (`en` / `gu`). |
| **State / Persistence** | **React Context + LocalStorage / Mock Service Layer** | Zero-latency reactive local state persistence for multi-screen simulation, mock multi-station sync, and offline resilience. |

---

## 3. Planned Project Structure

```
CSS_Salon/
├── docs/
│   ├── 01-brief.md            # Vision, target users, core features, non-goals, design direction
│   ├── 02-screens.md          # Layout, purpose, controls, responsive behavior for all 7 screens
│   └── 03-flows-rules.md      # State machine, FCFS rules, wait-time formulas, 12 test cases
├── src/
│   ├── assets/                # Icons, logos, and ambient media
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Buttons, Badges, Modals, Inputs, Header, Navigation, LanguageToggle
│   │   ├── queue/             # TicketCard, QueueList, StationCard, WaitTimer
│   │   └── tv/                # NowCallingBanner, TVStationGrid, TickerTape
│   ├── context/               # SalonContext, QueueContext, LanguageContext providers
│   ├── hooks/                 # useQueue, useBarbers, useWaitTime, useAudioChime, useLanguage
│   ├── i18n/                  # Bilingual localization dictionaries
│   │   ├── translations.ts    # Translation helper & types
│   │   ├── en.ts              # English locale dictionary
│   │   └── gu.ts              # Gujarati locale dictionary
│   ├── screens/               # 7 Core Screen Views
│   │   ├── HomeScreen.tsx
│   │   ├── JoinQueueScreen.tsx
│   │   ├── CustomerStatusScreen.tsx
│   │   ├── ReceptionDashboardScreen.tsx
│   │   ├── BarberViewScreen.tsx
│   │   ├── TVDisplayScreen.tsx
│   │   └── OwnerSettingsScreen.tsx
│   ├── services/              # Queue business logic, persistence, and storage adapter
│   ├── styles/                # CSS design system (tokens, layout, components, themes)
│   │   ├── variables.css      # Palette, spacing, typography tokens
│   │   ├── global.css         # Reset and base styles
│   │   └── animations.css     # Pulse, transitions, and status keyframes
│   ├── types/                 # TypeScript interfaces and enum definitions
│   │   ├── queue.ts           # Ticket, Status, Service, Barber, Station interfaces
│   │   └── events.ts          # Action payloads and state event types
│   ├── utils/                 # Wait-time calculations, phone normalizer, token formatter
│   ├── App.tsx                # Main router / screen switcher
│   ├── main.tsx               # Application bootstrap
│   └── index.css              # Entry stylesheet
├── AGENTS.md                  # This file
├── index.html                 # Single Page Application entry HTML
├── package.json               # (To be initialized upon approval)
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite bundler configuration
```

---

## 4. Development Rules & Architectural Principles

When writing or modifying code in this repository, all AI agents and developers must adhere to the following rules:

### Rule 1: Read Documentation Before Coding
- **Never guess or assume business rules.** Always inspect:
  - `docs/01-brief.md` for feature boundaries and out-of-scope constraints.
  - `docs/02-screens.md` for UI component hierarchy, buttons, behaviors, and responsive breakpoints.
  - `docs/03-flows-rules.md` for the state machine transitions, wait-time formulas, duplicate prevention, and test cases.

### Rule 2: Strict State Machine Compliance
- Ticket statuses must follow the strict lifecycle:
  `WAITING` &rarr; `CALLED` &rarr; `IN_CHAIR` &rarr; `DONE`.
  Terminal states are `DONE`, `CANCELLED`, and `NO_SHOW`.
- Never transition directly from `WAITING` to `DONE` or skip `CALLED` unless explicitly bypassed by an administrative override in `ReceptionDashboard`.

### Rule 3: Single Active Customer Per Station Constraint
- A barber can have **at most one active customer** in their chair (`IN_CHAIR`) or in `CALLED` status at any time.
- The UI must disable call actions while a customer occupies the station.

### Rule 4: Phone Number Normalization & Duplicate Prevention
- Always sanitize customer phone numbers to digits only before running equality checks.
- Prevent duplicate active tickets for the same phone number across `WAITING`, `CALLED`, or `IN_CHAIR`.

### Rule 5: 10-Minute No-Show Grace Period & Rejoining at End with New Token
- When a customer is `CALLED`, a 10-minute timer countdown begins.
- If the customer does not arrive within 10 minutes, the ticket is transitioned to `NO_SHOW`.
- **Rejoining Rule:** A customer marked `NO_SHOW` or cancelled cannot reclaim their old position or receive an unfair bump. If they return, they must register anew and rejoin at the **end of the line with a brand-new token**.

### Rule 6: Online Queue Auto-Close 30 Minutes Before Salon Closing
- The self-service online queue registration locks automatically **30 minutes prior to salon closing time**.
- Public forms disable new submissions with a friendly banner while allowing currently queued customers to finish their cuts.

### Rule 7: Barber Break Management & Routing Pause
- When a barber triggers a break, their status shifts to `ON_BREAK`, removing them from the active shared pool.
- "Any Barber" routing bypasses stations on break, and wait times for their specific queue reflect the break duration.

### Rule 8: Bilingual Support (English & Gujarati)
- The application must support seamless 1-click toggling between **English** and **Gujarati** (`en` / `gu`) across all 7 screens without page refreshes.
- All user-facing labels, status pills, instructions, and error messages must be backed by lightweight dictionary keys in `src/i18n/`.

### Rule 9: Pure CSS & Semantic Design
- Avoid external CSS utility libraries (Tailwind, Bootstrap) unless explicitly instructed.
- Adhere to the project's CSS salon theme: leverage CSS Custom Properties (`--color-amber-500`, `--color-bg-dark`), CSS Grid, Flexbox, and fluid typography.

### Rule 10: Student Lab Scope Hygiene & No Premature Bloat
- Keep the architecture clean, modular, and manageable for a student lab.
- Do NOT implement online calendar booking, Stripe payments, customer passwords, or retail inventory tracking. Follow the "Features We Will Not Build" list in `docs/01-brief.md`.

### Rule 11: Zero Unsolicited Files or Installations
- Do not run `npm install` or generate source code files until the documentation is explicitly reviewed and approved by the user.

---

## 5. Screen Quick Reference

| # | Screen Name | Route / View | Key Role |
| :-: | :--- | :--- | :--- |
| **1** | **Home** | `/` | Salon status, wait snapshot, portal entry points. |
| **2** | **Join Queue** | `/join` | Self check-in kiosk / mobile walk-in form. |
| **3** | **Customer Status** | `/status/:id` | Live personal ticket tracker with countdown and call chime. |
| **4** | **Reception Dashboard** | `/reception` | Full operational control, triage, manual entry, reassignments. |
| **5** | **Barber View** | `/barber` | Station tablet interface: call next, seat, finish cut, take break. |
| **6** | **Waiting Area TV Display** | `/tv` | Large-format 1080p wallboard with audio alerts and queue list. |
| **7** | **Owner Settings** | `/settings` | Barber roster, service catalog, wait-time buffers, queue reset. |
