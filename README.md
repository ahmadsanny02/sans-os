# SansOS Workspace — Technical Project Documentation 🚀

A personalized, modular, all-in-one life operating system and engineering workspace. Built to eliminate the rigid cell-and-formula constraints of legacy spreadsheets, **SansOS** provides a unified, mobile-first, pixel-perfect environment incorporating habit check-in matrices, foreign language logs with auto-translation and verb conjugation, dynamic timetable schedules, project/task tracking, reading journals, and pomodoro focus sessions.

---

## 1. Project Overview

### Purpose & Vision
SansOS serves as a single-user personal operating system designed for productivity, habit reinforcement, language acquisition, and career project management. It brings together modular Bento UI widgets with real-time optimistic state updates, glassmorphism design tokens, and local timezone synchronization.

### Key Capabilities
* **Dashboard Bento Grid:** Centralized metrics, pomodoro timer bar, timeline snapshot, top priorities, and active memory box highlights.
* **Daily Flow & Timetable:** Timeline blocks with custom start/end hour boundaries, daily gratitude logs, emoji mood tracking, and automatic midnight priority rollover.
* **Habit Check-In Matrix:** Optimistic weekly/monthly habit tracking grid backed by PostgreSQL aggregation and Recharts visualization.
* **Language Hub:** Smart dictionary search powered by Datamuse & Free Dictionary APIs, automated Google Translate fallbacks, English irregular verb conjugations (V1 ➔ V-Ing), manual vs. auto-translation synchronization, and grammar sentence drills (Writing & Dialogue practices).
* **Project & Task Board:** Multi-tier tracking (Projects ➔ Tasks ➔ Sub-tasks) sorted by deadlines, status, and priority badges (`Low`, `Medium`, `High`).
* **Learning Hub:** Full-page detail views (`/learning/[id]`), dual progress bars (reference materials vs. tasks done), and standardized status badges (`Planned`, `Learning`, `Completed`).
* **Pomodoro Timer Engine:** Document Picture-in-Picture (PiP) floating window portal, Web Audio API audio synthesis, and visibility period time calibration.
* **Vision Board & Bucket List:** Drag-and-drop wallpaper canvas saving absolute coordinates, and interactive life bucket list gallery.

---

## 2. Tech Stack & Prerequisites

### Technology Stack
* **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
* **Language:** [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
* **Styling & UI:** [Tailwind CSS v3](https://tailwindcss.com/), Custom HSL tokens, Glassmorphism backdrop-blur, [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/), [SweetAlert2](https://sweetalert2.github.io/)
* **Database & ORM:** PostgreSQL via [Supabase](https://supabase.com/), [Drizzle ORM](https://orm.drizzle.team/) & `drizzle-kit`
* **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) (Timezone states, active dates, midnight rollover checks)
* **Data Fetching & Caching:** [TanStack React Query v5](https://tanstack.com/query) + Supabase SSR Client (`@supabase/ssr`)
* **Authentication:** Supabase Auth (Email & Password)
* **Analytics & Charts:** [Recharts](https://recharts.org/)

### Prerequisites
* **Node.js:** `>= 18.17.0`
* **Package Manager:** `npm` (or `pnpm` / `yarn`)
* **Database:** Supabase PostgreSQL instance

---

## 3. Directory & Folder Structure

```text
sans-os/
├── src/
│   ├── app/                         # Next.js App Router (Pages, layouts, and REST API routes)
│   ├── components/                  # Feature-driven UI Modules (Daily, Habits, Language, Projects, etc.)
│   ├── hooks/                       # Custom React Query Hooks for data queries & mutations
│   ├── lib/                         # Core utilities (Drizzle ORM, Supabase configs, translation/verb engines)
│   ├── store/                       # Global Zustand stores (active date, timezone, Pomodoro states)
│   ├── types/                       # Drizzle database schemas and TypeScript interfaces
│   └── proxy.ts                     # Authentication & routing guard logic
├── public/                          # Static assets
├── drizzle.config.ts                # Drizzle migration settings
├── package.json                     # Dependency manifests & scripts
└── tailwind.config.ts               # Tailwind CSS theme tokens & glassmorphism config
```

---

## 4. Setup & Local Development Installation

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/ahmadsanny02/sans-os.git
cd sans-os
npm install
```

### Step 2: Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 3: Database Schema Migration
Push Drizzle ORM table definitions (`src/types/schema.ts`) to your Supabase PostgreSQL database:
```bash
npm run db:push
```
To open the Drizzle Studio database GUI:
```bash
npm run db:studio
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Build & Production Verification
```bash
# Execute ESLint checks
npm run lint

# Build production bundle
npm run build

# Start production server locally
npm run start
```

---

## 5. Core Architecture & API Endpoints

### Key Architectural Patterns
1. **No `src/middleware.ts`:** Route guards and authentication checks reside exclusively in [proxy.ts](file:///home/ahmadsanny02/Workspace/02_coding/web/fullstack/projects/sans-os/src/proxy.ts) to prevent crash loops.
2. **React Query State Isolation:** UI components do not use `useEffect` for data fetching. Data queries, invalidations, and optimistic state mutations route strictly through custom hooks in `src/hooks/`.
3. **Glassmorphic Token Standardization:** Card containers use `bg-card/45 dark:bg-card/15 border border-border/60 shadow-sm rounded-2xl backdrop-blur-md`.
4. **Automatic Auto-Translation Sync:** When a user marks a vocabulary word as memorized (`memorized: true`), if the manual translation differs from the AI auto-translation, the system synchronizes `translation` to `autoTranslation` in PostgreSQL and updates UI state optimistically.
5. **Verb Conjugation Engine:** [verbs.ts](file:///home/ahmadsanny02/Workspace/02_coding/web/fullstack/projects/sans-os/src/lib/verbs.ts) implements syllable stress boundary checks (`shouldDoubleConsonant`) to bypass invalid doubling (e.g. `visit` ➔ `visited`/`visiting`, `listen` ➔ `listened`/`listening`).

### Primary REST API Routes

| HTTP Method | Route Endpoint | Description |
| :--- | :--- | :--- |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/language` | Vocabulary log CRUD & auto-translation sync |
| `GET` / `POST` / `DELETE` | `/api/language/writing` | Writing practice sentence exercises |
| `GET` / `POST` / `DELETE` | `/api/language/dialogue` | Dialogue practice Q&A logs |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/habits` | Habit metadata & ordering |
| `GET` / `POST` / `DELETE` | `/api/habits/logs` | Habit check-in grid logs |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/daily/priorities` | Top 5 priorities & midnight rollover status |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/daily/timetable` | Dynamic schedule timeline blocks |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/projects` | Project workspaces & deadline metrics |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/projects/tasks` | Two-tiered task & sub-task items |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/reading` | Reading journal entries & rating/reviews |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/vision` | Drag-and-drop canvas item coordinates |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/learning` | Subject modules, reference links & task checklists |

---

## 📄 License & Attribution
Designed and built exclusively for **Ahmad Sani Jabarulloh** as a personalized life operating system (**SansOS**). All rights reserved.
