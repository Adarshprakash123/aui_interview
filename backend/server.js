import express from 'express';
import cors from 'cors';
import resumeRoutes from './routes/resume.js';
import interviewRoutes from './routes/interview.js';
import tokenRoutes from './routes/token.js';
import { initDB } from './services/memory.js';

// Only load dotenv in development (not needed in production on Hostinger)
// dotenv is only used for local development - Hostinger uses environment variables directly
// Using dynamic import to avoid top-level await issues
if (process.env.NODE_ENV !== 'production') {
  import('dotenv').then(dotenv => {
    dotenv.default.config();
  }).catch(() => {
    // dotenv is optional - continue without it
    // This is fine in production where env vars are set by Hostinger
  });
}

const app = express();
// Hostinger will set PORT automatically - do not use fallback
const PORT = process.env.PORT;

// Middleware
// CORS configuration - production-safe
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    // In production, require FRONTEND_URL to be set
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.FRONTEND_URL) {
        return callback(new Error('FRONTEND_URL environment variable must be set in production'));
      }
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Development: allow localhost
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increase limit for audio base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize MongoDB connection on startup
initDB().catch(err => {
  console.error('Failed to initialize MongoDB:', err);
  console.error('Server will continue but database operations may fail');
});

// Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/token', tokenRoutes);

// Health check - Hostinger requires this endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
if (!PORT) {
  console.error('ERROR: PORT environment variable is not set');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

