# StudyHub — Supabase Edition

A full-featured student productivity app powered by **React + Vite + Supabase**.

## Features
- 📚 **Subjects** — organise notes by subject with colour & icon
- 📝 **Notes** — markdown notes with tags and important flag
- ✅ **Tasks** — persistent tasks with priority, due date & groups
- 📋 **Daily Tasks** — resets every day (stored in localStorage)
- 💻 **DSA Tracker** — LeetCode-style problem tracker
- 📅 **Calendar** — schedule exams, assignments, study sessions
- 🔗 **Links** — save important resources with categories & tags
- 🔍 **Search** — search across everything

---

## Quick Setup

### 1. Clone / download the project

```bash
cd studyhub
npm install
```

### 2. Set up Supabase

1. Go to [https://supabase.com](https://supabase.com) → New project
2. Open **SQL Editor** → New Query
3. Paste the contents of `supabase_schema.sql` and click **Run**
4. Go to **Settings → API** and copy:
   - `Project URL`  
   - `anon / public` key

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
src/
├── lib/
│   └── supabase.js          # Supabase client + all DB API helpers
├── components/
│   ├── layout/
│   │   ├── Layout.jsx        # Sidebar + topbar layout
│   │   └── Layout.module.css
│   └── ui/
│       └── index.jsx         # Shared UI: Button, Card, Modal, Input…
├── pages/
│   ├── Dashboard.jsx
│   ├── Subjects.jsx          # Subject list + SubjectDetail inline
│   ├── Tasks.jsx
│   ├── DailyTasks.jsx        # localStorage — resets daily
│   ├── DSATracker.jsx
│   ├── CalendarPage.jsx
│   ├── Links.jsx
│   └── Search.jsx
├── App.jsx                   # Routes
├── main.jsx                  # Entry point
└── index.css                 # Global CSS variables + base styles
```

---

## Database Tables (Supabase)

| Table             | Key fields                                       |
|-------------------|--------------------------------------------------|
| `subjects`        | name, description, color, icon                  |
| `notes`           | subject_id, title, content, is_important, tags  |
| `tasks`           | title, checklist_name, completed, due_date, priority |
| `dsa_problems`    | title, url, status, difficulty, topic, notes     |
| `calendar_events` | title, date, time, type, description             |
| `links`           | title, url, description, category, tags          |

**Daily Tasks** are stored in `localStorage` only (key: `studyhub_daily_tasks_v1`) and auto-reset each day.

---

## Build for production

```bash
npm run build
npm run preview
```

The `dist/` folder can be deployed to Vercel, Netlify, or any static host.

---

## Notes

- Row Level Security (RLS) is enabled with a public-access policy — suitable for personal use.  
- To add authentication, uncomment the auth-based policies in `supabase_schema.sql` and integrate Supabase Auth.
