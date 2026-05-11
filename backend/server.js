const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const loanRoutes = require('./routes/loanRoutes');

dotenv.config();

const app = express();


// =========================
// Middleware
// =========================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/api/loans', loanRoutes);
 
// =========================
// Rate Limiter
// =========================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many requests, please try again later.'
});


// =========================
// Routes
// =========================

// Health Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK'
  });
});


// Example Auth Route
app.use('/api/auth', authLimiter, (req, res) => {
  res.json({
    message: 'Auth route working'
  });
});


// =========================
// 404 Handler
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


// =========================
// Error Handler
// =========================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});


// =========================
// Server Start
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});