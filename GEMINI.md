---

# BAGIAN 2: GEMINI.md (Panduan AI / Google Antigravity)

```markdown
# GEMINI.md | SansOS Workspace

## Project Overview
Name: sans-os-workspace [cite: 27, 30]
Description: A personalized all-in-one life operating system and career workspace incorporating habit tracking, language learning logs, and dynamic project management.
Goal: Eliminate rigid cell-and-formula constraints of legacy spreadsheets, providing a unified, mobile-responsive, and modular environment for personal growth and engineering projects. [cite: 32, 37]
Target Users: Single-user exclusive (Ahmad Sani Jabarulloh). [cite: 33]
Version: v1.0.0 [cite: 34]
Status: Active Development [cite: 35]

## Tech Stack [cite: 39, 42]
Language: TypeScript [cite: 43]
Framework: Next.js (App Router) [cite: 45]
Styling: Tailwind CSS [cite: 46, 183]
UI Library: shadcn/ui + Framer Motion (for smooth layout animations) [cite: 47]
Database: PostgreSQL via Supabase [cite: 48]
ORM: Drizzle ORM or Prisma [cite: 49]
State Management: Zustand (for time states like activeDate and userConfig) [cite: 52]
Data Fetching: React Query (TanStack Query) + Supabase Client [cite: 51]
Auth: Supabase Auth (Email & Password) [cite: 52]
Deployment: Vercel (Frontend) & Supabase (Database) [cite: 52]

## Commands [cite: 54, 57]
# Development [cite: 58]
npm run dev          # Start local development server [cite: 59]
npm run build        # Build application for production [cite: 60]
npm run start        # Run production build locally [cite: 62]
npm run lint         # Execute linter checks [cite: 63]
# Database [cite: 71]
npm run db:push      # Push schema alterations to Supabase
npm run db:studio    # Open ORM database GUI studio

## Project Structure [cite: 78, 81]
Architecture: Feature-driven / Modular [cite: 82]
[root]/ [cite: 83]
├── src/ [cite: 84]
│   ├── app/                 # Next.js App Router (Pages & Layouts)
│   ├── components/ [cite: 93]
│   │   ├── dashboard/       # Setup home config & quick navigation metrics [cite: 86]
│   │   ├── habits/          # Habit tracker interactive grids & recap charts [cite: 86]
│   │   ├── daily/           # Dynamic timetable, Top 5 priorities, & daily journals [cite: 86]
│   │   ├── language/        # Vocabulary logs, sentence practices, & review state [cite: 86]
│   │   ├── projects/        # Project workspace, task boards, & metrics [cite: 86]
│   │   └── ui/              # Reusable shadcn/ui base elements [cite: 93]
│   ├── hooks/               # Custom hooks for fetching and caching via React Query
│   ├── store/               # Global Zustand stores (active date, timezone states)
│   ├── lib/                 # Core utilities & Supabase client initialization [cite: 100]
│   └── types/               # Strict TypeScript interfaces & database schemas [cite: 94]
└── public/                  # Public static assets [cite: 90]

## Naming Conventions [cite: 106, 109]
# Files & Folders [cite: 110]
- UI Components: PascalCase (e.g., HabitGrid.tsx, VocabularyCard.tsx) [cite: 111]
- Non-components / Hooks: camelCase (e.g., useHabitLogs.ts, formatTime.ts) [cite: 112]
- Routing Folders: kebab-case (e.g., project-tracker/, language-logs/) [cite: 113, 116]
# Code Conventions [cite: 119]
- Variables & Functions: camelCase (e.g., activeDate, calculateStreak) [cite: 120]
- Constants: UPPER_SNAKE (e.g., MAX_PRIORITIES = 5, BASE_URL) [cite: 120]
- Types & Interfaces: PascalCase (e.g., VocabType, ProjectTask) [cite: 120]

## Code Conventions [cite: 130, 133]
- Apply DRY and SOLID principles strictly to prevent duplicate utility logic. [cite: 135, 136]
- TypeScript: Strict mode enabled. Absolute prohibition of the 'any' type. [cite: 139, 140]
- Explicitly declare function return types in all business logic blocks. [cite: 141]
- Error Handling: Secure async/await blocks with comprehensive try-catch wrappers. [cite: 153, 154]
- Export Pattern: Named exports for components/functions; default exports only for routing pages. [cite: 151, 152]

## Component Rules [cite: 157, 160]
- Default to Next.js Server Components for server-side optimization. [cite: 171]
- Declare 'use client' ONLY when utilizing React state hooks or client event handlers (e.g., drag-and-drop canvas). [cite: 172, 173]
- Keep presentational components clean and atomic. [cite: 174, 175]

## Styling Rules [cite: 178, 181]
- Write responsive utility classes directly inside JSX using Tailwind CSS. [cite: 185]
- Enforce Mobile-First break-point configuration for all core dashboard panels. [cite: 189]
- Dark Mode: Ready from inception. Test layout contrast utilizing `dark:` prefixes. [cite: 191, 192]

## API & Data Fetching Rules [cite: 197, 200]
- Isolate API and database interactions into dedicated custom hooks. Do not fetch in UI modules. [cite: 215]
- Never use `useEffect` for data fetching; rely entirely on React Query cache layers. [cite: 207]

## Core Feature Logic & Database Schemas
- **Habit Tracker:** Matrix-based check-in grid. Aggregates weekly/monthly logs directly via PostgreSQL SQL statements.
- **Reading Journal:** The rating and review fields are conditionally rendered based on the item state (`status === 'Completed'`).
- **Vision Board:** Interactive drag-and-drop workspace panel. Dynamic coordinates are saved as styling offsets.
- **Daily Timetable:** Time blocks handle flexible starting/ending bounds instead of fixed, pre-computed static hour cells.
- **Top 5 Priorities:** Implements an automated midnight script or client validation to push incomplete list items to the next calendar row (`auto-rollover`).
- **Language Workspace:** Supports dynamic data logging fields for tracking words, vocabulary translation strings, and sentence construction history.
- **Project Modules:** Two-tiered relation tracking (Projects 1:N Tasks) sorted by deadlines and low/medium/high priority tags.
- **Emojis:** Leverages device native emoji pickers to track daily mood indicators. No storage of custom emoji graphic sets.

## Do Not [cite: 331, 335]
- **CRITICAL:** If instructions or prompt criteria are ambiguous, ASK the user first before writing code. [cite: 337]
- Do not create new root or directory folders without explicit user confirmation. [cite: 339]
- Do not use inline styles unless assigning dynamic drag-and-drop coordinate objects. [cite: 183, 352]
- Do not commit `.env` or configuration instances containing database secret credentials. [cite: 284, 346]
- Do not change, refactor, or delete existing operational features without precise instructions. [cite: 348]