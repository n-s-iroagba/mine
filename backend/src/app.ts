import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser'

import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import sequelize from './config/database';
import { requestLogger } from './middlewares/requestLogger';
import { MiningSubscription } from './models';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV==='production'?'https://www.satoshivertex.com' : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(cookieParser())


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}
app.use(requestLogger);

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