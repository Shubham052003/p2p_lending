require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express();

// ── Security headers
app.use(helmet());

// ── CORS — allow only your React dev server
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── HTTP request logger (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── Global rate limiter (100 requests per 15 min per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Try again later.' }
});
app.use('/api', globalLimiter);

// ── Stricter limiter for auth routes (5 per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many auth attempts. Try again later.' }
});

// ── Routes
app.use('/api/auth',        authLimiter, require('./routes/authRoutes'));
app.use('/api/loans',       require('./routes/loanRoutes'));
app.use('/api/marketplace', require('./routes/marketplaceRoutes'));

// ── Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Global error handler (must be last, 4 params)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV})`));