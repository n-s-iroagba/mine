"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireMiner = exports.requireAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../services/utils/errors/AppError");
const authenticate = (req, _, next) => {
    try {
        console.log('🔐 Authentication middleware triggered');
        // Get authorization header from different possible locations
        const authHeader = req.headers.authorization ||
            req.headers.Authorization ||
            req.headers['x-access-token'];
        console.log('Raw auth header:', authHeader);
        // Check if header exists
        if (!authHeader) {
            console.log('❌ No authentication header found');
            throw new AppError_1.UnauthorizedError('Authentication token required');
        }
        // Handle different token formats
        let token;
        if (authHeader.startsWith('Bearer ')) {
            // Standard Bearer token format
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
            console.log('📝 Using Bearer token format');
        }
        else if (authHeader.startsWith('Token ')) {
            // Alternative token format
            token = authHeader.substring(6); // Remove 'Token ' prefix
            console.log('📝 Using Token format');
        }
        else {
            // Assume the entire header is the token
            token = authHeader;
            console.log('📝 Using raw token format');
        }
        // Clean and validate the token
        token = token.trim();
        console.log('🔍 Token details:', {
            length: token.length,
            first20Chars: token.substring(0, 20),
            last20Chars: token.substring(Math.max(0, token.length - 20))
        });
        if (!token) {
            console.log('❌ Token is empty after trimming');
            throw new AppError_1.UnauthorizedError('Authentication token required');
        }
        if (token.length < 10) {
            console.log('❌ Token is too short (less than 10 characters)');
            throw new AppError_1.UnauthorizedError('Invalid token format');
        }
        // Check for common token issues
        if (token.includes('\n') || token.includes('\r')) {
            console.log('❌ Token contains newline characters');
            throw new AppError_1.UnauthorizedError('Invalid token format');
        }
        // // Verify JWT secret is available
        // if (!process.env.JWT_SECRET) {
        //   console.log('❌ JWT_SECRET environment variable is not set');
        //   throw new Error('JWT secret not configured');
        // }
        // console.log('✅ JWT secret is configured');
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, 'aba');
        console.log('✅ Token successfully verified:', {
            userId: decoded.id,
            email: decoded.email,
            role: decoded.role,
            issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'N/A',
            expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'
        });
        // Attach user to request
        req.user = {
            userId: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        console.log('✅ Authentication successful');
        next();
    }
    catch (error) {
        console.error('🔒 Authentication failed:', error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            console.log('❌ JWT validation error:', error.message);
            next(new AppError_1.UnauthorizedError('Invalid token: ' + error.message));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            console.log('❌ Token expired at:', new Date(error.expiredAt).toISOString());
            next(new AppError_1.UnauthorizedError('Token expired'));
        }
        else if (error instanceof AppError_1.UnauthorizedError) {
            next(error);
        }
        else {
            console.log('❌ Unexpected authentication error:', error);
            next(new AppError_1.UnauthorizedError('Authentication failed'));
        }
    }
};
exports.authenticate = authenticate;
const requireAdmin = (req, _, next) => {
    try {
        if (!req.user) {
            throw new AppError_1.UnauthorizedError('Authentication required');
        }
        if (req.user.role !== 'admin') {
            throw new AppError_1.UnauthorizedError('Admin access required');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAdmin = requireAdmin;
const requireMiner = (req, _, next) => {
    try {
        if (!req.user) {
            throw new AppError_1.UnauthorizedError('Authentication required');
        }
        if (req.user.role !== 'miner') {
            throw new AppError_1.UnauthorizedError('Miner access required');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireMiner = requireMiner;
const optionalAuth = (req, _, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
            }
            catch (error) {
                // Token is invalid, but we don't throw error for optional auth
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.optionalAuth = optionalAuth;
