"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const utils_1 = require("../services/utils");
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal server error';
    let details = null;
    if (error instanceof utils_1.AppError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
        details = error.message;
    }
    else if (error.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        message = 'Resource already exists';
    }
    else if (error.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 400;
        message = 'Invalid reference';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    // Log error
    if (statusCode >= 500) {
        utils_1.logger.error('Server error:', {
            error: error,
            stack: error.stack,
            url: req.url,
            method: req.method,
            ip: req.ip,
        });
    }
    else {
        utils_1.logger.warn('Client error:', {
            error: error,
            statusCode,
            url: req.url,
            method: req.method,
        });
    }
    const response = {
        success: false,
        message,
        ...(details && { details }),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    };
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
