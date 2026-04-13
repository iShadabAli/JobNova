require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'JobNova API is running',
        timestamp: new Date().toISOString()
    });
});

// Test Supabase connection route
app.get('/api/test-db', async (req, res) => {
    const isConnected = await testConnection();
    if (isConnected) {
        res.json({ status: 'ok', message: 'Database connection successful' });
    } else {
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
});

// Start server
const startServer = async () => {
    // Test database connection on startup
    console.log('🔄 Testing Supabase connection...');
    await testConnection();

    app.listen(PORT, () => {
        console.log(`🚀 JobNova Server running on port ${PORT}`);
        console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
};

startServer();
