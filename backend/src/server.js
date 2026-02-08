const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const WebSocketHandler = require('./websocket/handler');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const shareLinksRoutes = require('./routes/shareLinks');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.endsWith('.netlify.app');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize WebSocket handler
const wsHandler = new WebSocketHandler(io);

// Make io accessible to routes
app.set('io', io);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://zaidtask.netlify.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||  // Allow any local port
      origin.endsWith('.netlify.app');           // Allow Netlify deploy previews

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/share', shareLinksRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
📡 Environment: ${process.env.NODE_ENV || 'development'}
🔌 WebSocket enabled
⚡ Ready to accept connections

API Endpoints:
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/me
  
  GET    /api/notes
  POST   /api/notes
  GET    /api/notes/:id
  PATCH  /api/notes/:id
  DELETE /api/notes/:id
  
  GET    /api/share/public/:token
  POST   /api/share/:id/share
  
  GET    /health
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = { app, server, io };
