/**
 * Express Application Setup
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const markRoutes = require('./routes/markRoutes');
const reportRoutes = require('./routes/reportRoutes');
const algorithmRoutes = require('./routes/algorithmRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets from client/ directory
app.use(express.static(path.join(__dirname, '../client')));

// Mount API routes (Both /api/* and direct /* paths for requirement compliance)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/students', studentRoutes);
app.use('/students', studentRoutes);

app.use('/api/attendance', attendanceRoutes);
app.use('/attendance', attendanceRoutes);

app.use('/api/marks', markRoutes);
app.use('/marks', markRoutes);

app.use('/api/reports', reportRoutes);
app.use('/reports', reportRoutes);

app.use('/api/algorithms', algorithmRoutes);
app.use('/algorithms', algorithmRoutes);

// System Health Check
app.get('/api/health', (req, res) => {
    const { getIsUsingMySQL } = require('./config/db');
    res.status(200).json({
        status: 'online',
        timestamp: new Date().toISOString(),
        databaseMode: getIsUsingMySQL() ? 'MySQL 8.0 Server' : 'In-Memory Fallback Engine'
    });
});

// Fallback to index.html for SPA client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Unhandled Server Error]', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;