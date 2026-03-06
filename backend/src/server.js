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

// Health check & Root
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));
app.get('/', (req, res) => res.send('StudyHub API is Running... 🚀'));

const errorHandler = require('./middleware/errorHandler');

// ── 404 & Error Handler ─────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start the HTTP server FIRST so Render detects the open port immediately,
// then connect to MongoDB asynchronously.
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 StudyHub API running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

// Connect to MongoDB after server is already listening
connectDB();

// ── Graceful Shutdown ───────────────────────────────────────
// Render (and other PaaS platforms) send SIGTERM when deploying a new version.
// We handle it gracefully so in-flight requests complete before the process exits.
const shutdown = (signal) => {
  console.log(`\n⚡ Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force-kill after 10 seconds if requests are still hanging
  setTimeout(() => {
    console.error('⏱️ Graceful shutdown timed out. Force-exiting.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
