require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const uploadRoutes = require('./routes/upload');
const analyzeRoutes = require('./routes/analyze');
const rewriteRoutes = require('./routes/rewrite');
const generateRoutes = require('./routes/generate');
const builderRoutes = require('./routes/builder');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/rewrite', rewriteRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/builder', builderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    openai: !!process.env.OPENAI_API_KEY
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 ResumeAI Backend running at http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '⚠️  Not configured (demo mode)'}\n`);
});

module.exports = app;
