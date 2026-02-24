require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const swapRoutes = require('./routes/swapRoutes');
const reimbursementRoutes = require('./routes/reimbursementRoutes');

const app = express();

app.use(cors({
    origin: '*',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (no DB required)
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Employee Leave Management API is running', timestamp: new Date() });
});

// Ensure DB is connected before handling any API request (critical for Vercel serverless)
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('❌ Failed to connect to database:', error.message);
        res.status(503).json({
            success: false,
            message: 'Database connection failed. Please try again.'
        });
    }
});

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/reimbursements', reimbursementRoutes);

// 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`);
    console.error(err.stack);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        // In production/Vercel, we normally hide details, but we need them now to debug
        error: process.env.NODE_ENV === 'production' ? err.message : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
