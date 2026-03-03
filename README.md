# 🎓 StudyHub — Full-Stack Academic Productivity App

A comprehensive study management platform built with **React**, **Node.js/Express**, and **MongoDB**.

## ✨ Features

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | JWT-based signup, login, logout with secure password hashing |
| 📚 **Subjects** | Create color-coded subjects with emoji icons; organize notes inside each |
| 📝 **Notes** | Rich text editor (bold/italic/lists/code blocks), file attachments, tags, important flag |
| ✅ **Tasks** | Grouped checklists with priority levels, due dates, completion tracking |
| 🔗 **Links** | Save resources categorized as DSA Problems, YouTube, Articles, etc. with tags |
| 💻 **DSA Tracker** | Track LeetCode problems with status cycling, difficulty badges, topic tags |
| 📅 **Calendar** | Monthly calendar view with exam/assignment/study event management |
| 🔍 **Search** | Global search across all content types with debounced real-time results |
| 🌙 **Dark Mode** | Full light/dark theme toggle persisted to localStorage |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### 1. Clone & install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
# Backend — create .env from example
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

**`backend/.env`**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/studyhub
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**`frontend/.env`**:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start the servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

---

## 📁 Project Structure

```
studyhub/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/           # Business logic
│   │   │   ├── auth.controller.js
│   │   │   ├── subject.controller.js
│   │   │   ├── note.controller.js
│   │   │   ├── task.controller.js
│   │   │   ├── link.controller.js
│   │   │   ├── dsa.controller.js
│   │   │   ├── calendar.controller.js
│   │   │   └── search.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # JWT verification
│   │   │   └── upload.middleware.js # Multer file uploads
│   │   ├── models/                # Mongoose schemas
│   │   │   ├── User.model.js
│   │   │   ├── Subject.model.js
│   │   │   ├── Note.model.js
│   │   │   ├── Task.model.js
│   │   │   ├── Link.model.js
│   │   │   ├── DSAProblem.model.js
│   │   │   └── CalendarEvent.model.js
│   │   ├── routes/                # Express routers
│   │   │   ├── auth.routes.js
│   │   │   ├── subject.routes.js
│   │   │   ├── note.routes.js
│   │   │   ├── task.routes.js
│   │   │   ├── link.routes.js
│   │   │   ├── dsa.routes.js
│   │   │   ├── calendar.routes.js
│   │   │   └── search.routes.js
│   │   ├── utils/
│   │   │   ├── jwt.utils.js       # Token generation
│   │   │   └── response.utils.js  # Standardized responses
│   │   └── server.js              # Entry point
│   ├── uploads/                   # File upload storage
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── Layout.js      # App shell (sidebar + topbar)
    │   │   └── notes/
    │   │       └── NoteEditor.js  # Rich text note editor
    │   ├── context/
    │   │   ├── AuthContext.js     # Authentication state
    │   │   ├── ThemeContext.js    # Dark/light mode
    │   │   └── ToastContext.js    # Toast notifications
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── SubjectsPage.js
    │   │   ├── TasksPage.js
    │   │   ├── LinksPage.js
    │   │   ├── DSAPage.js
    │   │   ├── CalendarPage.js
    │   │   └── SearchPage.js
    │   ├── utils/
    │   │   └── api.js             # Axios instance + all API calls
    │   ├── App.js                 # Router + context providers
    │   ├── globals.css            # Full CSS design system
    │   └── index.js
    └── package.json
```

---

## 🌐 API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in, get JWT |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update name/theme |

### Subjects, Notes, Tasks, Links, DSA, Calendar (all protected)
All follow REST pattern: `GET /api/{resource}`, `POST /api/{resource}`, `PUT /api/{resource}/:id`, `DELETE /api/{resource}/:id`

Special endpoints:
- `POST /api/notes/upload` — multipart file upload
- `PATCH /api/tasks/:id/toggle` — toggle completion
- `GET /api/dsa/stats` — aggregated DSA statistics
- `GET /api/calendar/upcoming?limit=5` — next N events
- `GET /api/search?q=keyword` — global search

---

## 🛡️ Security
- Passwords hashed with **bcrypt** (10 rounds)
- **JWT** tokens with configurable expiry
- All routes protected with auth middleware
- User data scoped: every query filters by `user: req.user._id`
- File uploads validated by type and size (20MB max)

## 📦 Tech Stack
- **Frontend**: React 18, React Router v6, Axios, date-fns, Lucide React
- **Backend**: Node.js, Express.js, Multer
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT + bcryptjs
- **Styling**: Custom CSS design system with CSS variables (no framework dependency)