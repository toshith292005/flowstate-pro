require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());

// 1. UPDATE: Increase the limit to 50mb to prevent "PayloadTooLargeError"
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- ROUTES ---
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');

app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});