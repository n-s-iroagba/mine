"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidKYCStatus = exports.isValidTransactionStatus = exports.isValidPeriod = exports.isValidCurrency = exports.isValidPassword = exports.isValidEmail = exports.validatePartialData = exports.validateData = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../errors/AppError");
/**
 * Validate complete data against a Zod schema.
 */
const validateData = (schema, data) => {
    try {
        return schema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errorMessages = error.errors
                .map(err => `${err.path.join('.')}: ${err.message}`)
                .join(', ');
            throw new AppError_1.ValidationError(`Validation failed: ${errorMessages}`);
        }
        throw error;
    }
};
exports.validateData = validateData;
/**
 * Validate partial (update) data — only works for Zod object schemas.
 */
const validatePartialData = (schema, data) => {
    try {
        return schema.partial().parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errorMessages = error.errors
                .map(err => `${err.path.join('.')}: ${err.message}`)
                .join(', ');
            throw new AppError_1.ValidationError(`Validation failed: ${errorMessages}`);
        }
        throw error;
    }
};
exports.validatePartialData = validatePartialData;
/**
 * Utility validators
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidPassword = (password) => {
    return password.length >= 6;
};
exports.isValidPassword = isValidPassword;
const isValidCurrency = (currency) => {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'BTC', 'ETH', 'USDT', 'USDC'];
    return validCurrencies.includes(currency.toUpperCase());
};
exports.isValidCurrency = isValidCurrency;
const isValidPeriod = (period) => {
    const validPeriods = ['daily', 'weekly', 'fortnightly', 'monthly'];
    return validPeriods.includes(period.toLowerCase());
};
exports.isValidPeriod = isValidPeriod;
const isValidTransactionStatus = (status) => {
    const validStatuses = ['initialized', 'pending', 'successful', 'failed'];
    return validStatuses.includes(status.toLowerCase());
};
exports.isValidTransactionStatus = isValidTransactionStatus;
const isValidKYCStatus = (status) => {
    const validStatuses = ['pending', 'successful', 'failed'];
    return validStatuses.includes(status.toLowerCase());
};
exports.isValidKYCStatus = isValidKYCStatus;
