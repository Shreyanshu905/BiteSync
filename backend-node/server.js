const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

// Attach io to express app for access in controllers
app.set('io', io);

// Socket.IO Room Management & Events
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('leave_room', (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'BiteSync Smart Canteen Pre-Ordering System',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/kitchen', require('./routes/kitchenRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/meal-plans', require('./routes/mealPlanRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/group-orders', require('./routes/groupOrderRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on BiteSync Server`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Connect to DB and start server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 BiteSync Backend API running on port ${PORT}`);
    console.log(`📡 Socket.IO Real-time service initialized`);
    console.log(`🍱 http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };

