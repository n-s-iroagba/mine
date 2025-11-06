import express from 'express';
import cors from 'cors';

import morgan from 'morgan';
import cookieParser from 'cookie-parser'

import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import sequelize from './config/database';
import { requestLogger } from './middlewares/requestLogger';


const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://satoshivertex.com',
    'https://www.satoshivertex.com',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Accept'],
};

app.use(cors(corsOptions));

// Remove the explicit OPTIONS handler or modify it
app.options('*', cors(corsOptions));
app.use(cookieParser())


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}
app.use(requestLogger);
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=30');
  next();
});
// API routes
app.use('/api', routes);
 
// Root route
app.get('/', (_, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Satoshi Vertex API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});
// Add this before your 404 handler
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handler
app.use(errorHandler);

// 404 handler for non-API routes
app.use('*', (_, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Database sync and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Sync database
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models with database
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync(); // Use { force: true } to drop and recreate tables
      console.log('✅ Database synced successfully.');
    } else {
      await sequelize.sync(); // Safe sync for production
      console.log('✅ Database synced successfully.');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;