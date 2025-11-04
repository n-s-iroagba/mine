"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const database_1 = __importDefault(require("./config/database"));
const requestLogger_1 = require("./middlewares/requestLogger");
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production' ? 'https://satoshivertex.com' : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use((0, cookie_parser_1.default)());
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('combined'));
}
app.use(requestLogger_1.requestLogger);
// API routes
app.use('/api', routes_1.default);
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
app.use(errorHandler_1.errorHandler);
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
        await database_1.default.authenticate();
        console.log('✅ Database connection established successfully.');
        // Sync models with database
        if (process.env.NODE_ENV !== 'production') {
            await database_1.default.sync(); // Use { force: true } to drop and recreate tables
            console.log('✅ Database synced successfully.');
        }
        else {
            await database_1.default.sync(); // Safe sync for production
            console.log('✅ Database synced successfully.');
        }
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API URL: http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
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
exports.default = app;
