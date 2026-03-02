const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const { initSocket } = require('./socket');

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: true, // Allow all origins (essential for React Native LAN testing)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));
app.use('/api/coupons', require('./routes/coupon.routes'));
app.use('/api/blogs', require('./routes/blog.routes'));
app.use('/api/newsletter', require('./routes/newsletter.routes'));
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AMT API is running 🌿', timestamp: new Date() });
});

// ─── Public Config ─────────────────────────────────────────────────────────────
const Settings = require('./models/Settings.model');
app.get('/api/config', async (req, res) => {
  try {
    const settings = await Settings.find();
    const config = {};
    settings.forEach(s => {
      if (['maintenanceMode', 'siteName', 'homepageVideoUrl'].includes(s.key)) {
        config[s.key] = s.value;
      }
    });
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch config' });
  }
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use('/{*path}', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Database Connection & Server Start ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    const dbName = mongoose.connection.name;
    // ── Initialize Socket.io ──────────────────────────────────────────────────
    initSocket(httpServer);
    console.log(`✅ MongoDB connected → database: "${dbName}"`);
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 AMT Server running on http://0.0.0.0:${PORT}`);
      console.log(`📡 API base: http://0.0.0.0:${PORT}/api`);
      console.log(`🔌 Socket.io enabled`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
