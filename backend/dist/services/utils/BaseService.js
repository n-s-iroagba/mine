"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const _1 = require(".");
class BaseService {
    constructor(serviceName) {
        this.serviceName = serviceName;
    }
    logInfo(message, meta) {
        _1.logger.info(`[${this.serviceName}] ${message}`, meta);
    }
    logError(message, error) {
        _1.logger.error(`[${this.serviceName}] ${message}`, {
            error: error?.message,
            stack: error?.stack,
            ...error,
        });
    }
    logWarn(message, meta) {
        _1.logger.warn(`[${this.serviceName}] ${message}`, meta);
    }
    handleError(error, customMessage) {
        this.logError(customMessage || 'Service error', error);
        if (error instanceof _1.AppError) {
            throw error;
        }
        // Handle database errors
        if (error.name?.includes('Sequelize')) {
            throw new _1.AppError('Database operation failed', 500);
        }
        throw new _1.AppError(customMessage || 'Internal server error', 500);
    }
    validateRequiredFields(data, requiredFields) {
        const missingFields = requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
            throw new _1.AppError(`Missing required fields: ${missingFields.join(', ')}`, 400);
        }
    }
    sanitizeData(data, allowedFields) {
        const sanitized = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                sanitized[field] = data[field];
            }
        }
        return sanitized;
    }
}
exports.BaseService = BaseService;
