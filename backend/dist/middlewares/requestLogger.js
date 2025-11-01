"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const utils_1 = require("../services/utils");
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
        };
        if (res.statusCode >= 400) {
            utils_1.logger.warn('HTTP Request', logData);
        }
        else {
            utils_1.logger.info('HTTP Request', logData);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
