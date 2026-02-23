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

connectDB();

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/reimbursements', reimbursementRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Employee Leave Management API is running', timestamp: new Date() });
});

// 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
});
