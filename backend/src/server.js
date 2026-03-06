// ============================================================
// StudyHub - Main Server Entry Point
// ============================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const subjectRoutes = require('./routes/subject.routes');
const noteRoutes = require('./routes/note.routes');
const taskRoutes = require('./routes/task.routes');
const linkRoutes = require('./routes/link.routes');
const dsaRoutes = require('./routes/dsa.routes');
const calendarRoutes = require('./routes/calendar.routes');
const searchRoutes = require('./routes/search.routes');
const habitRoutes = require('./routes/habit.routes');

const app = express();

// Connect to MongoDB
connectDB();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/habits', habitRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

const errorHandler = require('./middleware/errorHandler');

// ... (existing routes)

// ── 404 & Error Handler ─────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 StudyHub API running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
