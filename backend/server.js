const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Routes
const ordersRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);

// Serve frontend pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));
app.get('/menu', (req, res) => res.sendFile(path.join(__dirname, '../menu.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, '../cart.html')));
app.get('/thankyou', (req, res) => res.sendFile(path.join(__dirname, '../thankyou.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../admin.html')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.warn('⚠️  MongoDB connection failed. Running in demo mode (orders stored in memory).');
    console.warn('   Start MongoDB to enable persistence.');
  });

// In-memory fallback store (when MongoDB is unavailable)
global.memoryOrders = [];

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🍛 Sri Saravana Hotel Server running at http://localhost:${PORT}`);
  console.log(`🔐 Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`   Admin Password: ${process.env.ADMIN_PASSWORD}\n`);
});
