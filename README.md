# Covenant Learning — Course System

A production-grade React application for delivering Christ-centred marriage courses:
**Covenant Marriage Foundation**, **Marriage Crisis Survival Guide**, and **Pre-Marital Masterclass**.

## Tech Stack

- **Frontend:** React 18 + Vite + React Router v6 + Tailwind CSS
- **State:** Zustand (persisted auth/progress/UI state)
- **Data fetching:** TanStack Query
- **Backend (optional):** Supabase (Postgres + Auth + RLS)
- **Forms:** React Hook Form + Zod validation
- **Certificates:** jsPDF + html2canvas
- **Testing:** Vitest + React Testing Library

## Features

- 🔐 Auth (signup/login) with role-based routing (student / facilitator / admin)
- 📚 3 fully-loaded courses (28 modules total) rendered from structured JSON
- ✅ Sequential module unlocking + progress tracking (persisted locally, syncs to Supabase if connected)
- 📝 Dynamic worksheet forms generated from course JSON, auto-saved
- 🎓 Downloadable PDF certificates of completion
- 🛠 Admin panel for course/system oversight
- 🧩 Works fully **offline/demo mode** with zero backend — course data ships locally in `src/data/`
- 🌐 Ready to connect to Supabase for real multi-user persistence, SSO, and multi-tenancy

## Getting Started

### 1. Install dependencies
```bash
cd course-system
npm install
```

### 2. Configure environment (optional — for backend mode)
```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```
Without these, the app runs entirely in **offline/demo mode** using local JSON data and browser-persisted Zustand state — great for local development or a static demo deployment.

### 3. Run locally
```bash
npm run dev
```
App runs at `http://localhost:5173`.

### 4. Run tests
```bash
npm test
```

### 5. Build for production
```bash
npm run build
npm run preview
```

## Connecting a Real Backend (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the Supabase SQL editor — this creates `profiles`, `courses`, `enrollments`, `user_progress`, `certificates` tables with Row Level Security policies and an auto-profile-creation trigger.
3. Insert your 3 courses into the `courses` table (copy the JSON from `src/data/*.json` into the `modules` jsonb column, or write a seed script).
4. Add your Supabase URL + anon key to `.env`.
5. Restart the dev server — the app automatically detects the backend and switches from local JSON to live Supabase queries (see `src/services/courseService.js`).

## Folder Structure

```
course-system/
├── src/
│   ├── app/              → App shell, router config
│   ├── features/          → auth, courses, worksheets, certificates, dashboard
│   ├── components/ui/     → design system primitives (Button, Card, Modal...)
│   ├── pages/             → route-level pages
│   ├── services/          → data access layer (Supabase or local fallback)
│   ├── store/             → Zustand state (auth, progress, UI)
│   ├── lib/                → supabase client, analytics, error monitoring
│   ├── data/               → local course JSON (offline mode source of truth)
│   ├── styles/              → Tailwind globals
│   └── test/                → Vitest test suite
├── supabase/
│   └── schema.sql           → full Postgres schema + RLS policies
├── public/
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Roadmap / Next Enhancements

- [ ] Stripe integration for paid course enrollment
- [ ] Email notifications (weekly action step reminders)
- [ ] Facilitator cohort dashboard (view all couples' progress in a group)
- [ ] SCORM/xAPI export for licensing to external LMS platforms
- [ ] Dark mode toggle (uiStore already scaffolded for this)
- [ ] i18n / multi-language support
- [ ] Sentry error monitoring (stub already in `src/lib/sentry.js`)
- [ ] PostHog/Mixpanel analytics (stub already in `src/lib/analytics.js`)

## License

Proprietary — Covenant Learning. All course content rights reserved.
