# SansOS Workspace 🚀

A personalized, all-in-one life operating system and career workspace designed to eliminate the rigid cell-and-formula constraints of legacy spreadsheets. It provides a modular, visually premium, and responsive ecosystem for habit tracking, language acquisition, timetable schedules, project tracking, and focus sessions.

---

## 🌟 Key Features & Modules

### 1. Dashboard Hub
*   **Bento Grid Widgets:** Quick metrics at a glance, including a daily timetable timeline, memory box visual highlights, priorities checklist, and todo items.
*   **Pomodoro Focus Bar:** Full-width control panel integrated directly on the main hub with live state progress and toggle triggers.
*   **Timezone & Sync Banner:** Automatically syncs display active dates and user timezone bounds globally.

### 2. Daily Flow & Timetable
*   **Flexible Time Blocks:** Timeline blocks with custom start/end hour boundaries (no pre-computed slots).
*   **Top 5 Priorities:** Real-time automatic rollover pushing incomplete yesterday's priorities to the current date, respecting the top-5 slots limit.
*   **Daily Log:** Gratitude journal logs and a native OS emoji mood tracker with daily pic uploads.

### 3. Habit Tracker
*   **Check-in Matrix:** Check off habits in an optimistic check-in grid.
*   **Performance Recaps:** Interactive Recharts charts detailing weekly progress and monthly completion rates.

### 4. Language Workspace
*   **Smart Dictionary & Vocab Logs:** Searches words using Datamuse and Free Dictionary APIs. Incorporates automatic translation via Google Translate, and automatically conjugates irregular English verbs (V1 to V-Ing) with Indonesian definitions.
*   **Grammar Formula Builder:** Create and manage active sentence formulas.
*   **Writing & Dialogue Practices:** Practice positive, negative, and interrogative sentences linked to grammar structures and vocabulary.

### 5. Project & Task Workspace
*   **Two-Tiered Relations:** Multi-tier tracking mapping Projects ➔ Tasks ➔ Sub-tasks.
*   **Dynamic sorting:** Categorized by deadlines and priority badges (`Low`, `Medium`, `High`).

### 6. Vision Board & Bucket List
*   **Vision Board Canvas:** Drag-and-drop goal wallpaper canvas. Absolute coordinates are automatically clamped and saved to the database.
*   **Bucket List:** Visual image gallery tracking life goals, completion timestamps, and preset templates.

### 7. Pomodoro Timer
*   **Store Engine:** Calibrates remaining time by adjusting for elapsed visibility periods if browser tabs are minimized.
*   **Audio Synthesis:** Generates focus/break transition tones using the Web Audio API.
*   **Document Picture-in-Picture:** Portals a fully reactive timer interface (including mini-circle and expanded control modes) into a separate browser-level floating window using the experimental Document PiP API.

---

## 🛠️ Technology Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + Vanilla CSS (Custom HSL tokens, Glassmorphism, Poppins font)
*   **Database:** PostgreSQL via Supabase
*   **ORM:** Drizzle ORM
*   **State Management:** Zustand
*   **Data Fetching:** TanStack React Query + Supabase Client SDK
*   **Auth:** Supabase Auth (Email & Password)
*   **Libraries:** Recharts, SweetAlert2, Framer Motion, Lucide React

---

## ⚡ Development Commands

First, set up your local `.env` variables containing:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Dev Server
```bash
npm run dev
```
Start the local development server at `http://localhost:3000`.

### Database Schema Updates
```bash
npm run db:push     # Push schema changes (schema.ts) directly to Supabase
npm run db:studio   # Open Drizzle GUI database Studio manager
```

### Production Build
```bash
npm run build       # Build application for production
npm run start       # Run production build locally
```

### Linter
```bash
npm run lint        # Execute ESLint checks
```
