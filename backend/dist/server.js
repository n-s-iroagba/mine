"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const logger_1 = __importDefault(require("./services/utils/logger/logger"));
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // Test database connection
        await database_1.default.authenticate();
        logger_1.default.info('Database connection established successfully');
        // Sync database (in development)
        if (process.env.NODE_ENV === 'development') {
            await database_1.default.sync({ alter: true });
            logger_1.default.info('Database synced successfully');
        }
        // Start server
        app_1.default.listen(PORT, () => {
            logger_1.default.info(`Server running on port ${PORT}`);
            logger_1.default.info(`Environment: ${process.env.NODE_ENV}`);
            logger_1.default.info(`API URL: http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received, shutting down gracefully');
    database_1.default.close();
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT received, shutting down gracefully');
    database_1.default.close();
    process.exit(0);
});
// Start the server
startServer();
