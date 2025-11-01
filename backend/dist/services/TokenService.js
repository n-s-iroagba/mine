"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("./utils");
// Extended interfaces for specialized tokens
class TokenService {
    constructor(secret, refreshSecret, resetPasswordSecret, emailVerificationSecret) {
        this.secret = secret;
        this.refreshSecret = refreshSecret;
        this.resetPasswordSecret = resetPasswordSecret;
        this.emailVerificationSecret = emailVerificationSecret;
        this.defaultOptions = {
            issuer: 'your-app-name',
            audience: 'your-app-Users',
        };
        // Token expiration defaults
        this.tokenExpirations = {
            access: '15m',
            refresh: '7d',
            resetPassword: '1h',
            emailVerification: '24h',
        };
        if (!secret) {
            utils_1.logger.error('JWT secret is required for TokenService initialization');
            throw new Error('JWT secret is required');
        }
        utils_1.logger.info('TokenService initialized successfully', {
            hasRefreshSecret: !!refreshSecret,
            hasResetPasswordSecret: !!resetPasswordSecret,
            hasEmailVerificationSecret: !!emailVerificationSecret,
        });
    }
    /**
     * Generate an access token with User authentication info
     */
    generateAccessToken(payload, customExpiresIn) {
        try {
            // Create minimal payload with only essential fields
            const accessTokenPayload = {
                id: payload.id,
                email: payload.email,
                role: payload.role,
                tokenType: 'access',
            };
            const options = {
                expiresIn: customExpiresIn || this.tokenExpirations.access || '10m',
                issuer: this.defaultOptions.issuer ?? '',
                audience: this.defaultOptions.audience ?? '',
                subject: payload.id?.toString(),
            };
            const signOptions = {
                expiresIn: options.expiresIn,
                issuer: options.issuer,
                audience: options.audience,
                subject: options.subject,
                algorithm: 'HS256',
            };
            const token = jsonwebtoken_1.default.sign(accessTokenPayload, this.secret, signOptions);
            utils_1.logger.info('Access token generated successfully', {
                userId: payload.id,
                email: payload.email,
                role: payload.role,
                expiresIn: options.expiresIn,
                tokenLength: token.length,
            });
            return token;
        }
        catch (error) {
            console.error(error);
            utils_1.logger.error('Access token generation failed', {
                error,
                email: payload.email,
                role: payload.role,
            });
            throw new Error('Access token generation failed');
        }
    }
    /**
     * Generate a password reset token
     */
    generateResetPasswordToken(payload, customExpiresIn) {
        try {
            // Create minimal payload with only essential fields
            const resetTokenPayload = {
                id: payload.id,
                email: payload.email,
                tokenType: 'reset_password',
            };
            const secret = this.resetPasswordSecret || this.secret;
            const options = {
                expiresIn: customExpiresIn || this.tokenExpirations.access || '10m',
                issuer: this.defaultOptions.issuer ?? '',
                audience: this.defaultOptions.audience ?? '',
                subject: payload.id?.toString(),
            };
            const signOptions = {
                expiresIn: options.expiresIn,
                issuer: options.issuer,
                audience: options.audience,
                subject: options.subject,
                algorithm: 'HS256',
            };
            const token = jsonwebtoken_1.default.sign(resetTokenPayload, secret, signOptions);
            utils_1.logger.info('Reset password token generated successfully', {
                userId: payload.id || payload.id,
                email: payload.email,
                expiresIn: options.expiresIn,
                requestId: payload.requestId,
                tokenLength: token.length,
            });
            return token;
        }
        catch (error) {
            console.error(error);
            utils_1.logger.error('Reset password token generation failed', {
                error,
                email: payload.email,
            });
            throw new Error('Reset password token generation failed');
        }
    }
    /**
     * Generate an email verification token
     */
    generateEmailVerificationToken(user, customExpiresIn) {
        try {
            // Extract only essential fields from the User model
            const verificationTokenPayload = {
                id: user.id,
                email: user.email,
                tokenType: 'email_verification',
            };
            const secret = this.secret;
            const options = {
                expiresIn: customExpiresIn || this.tokenExpirations.access || '10m',
                issuer: this.defaultOptions.issuer ?? '',
                audience: this.defaultOptions.audience ?? '',
                subject: verificationTokenPayload.id?.toString(),
            };
            const signOptions = {
                expiresIn: options.expiresIn,
                issuer: options.issuer,
                audience: options.audience,
                subject: options.subject,
                algorithm: 'HS256',
            };
            const token = jsonwebtoken_1.default.sign(verificationTokenPayload, secret, signOptions);
            utils_1.logger.info('Email verification token generated successfully', {
                userId: user.id,
                email: user.email,
                expiresIn: options.expiresIn,
                verificationCode: user.verificationCode,
                tokenLength: token.length,
            });
            return token;
        }
        catch (error) {
            console.error(error);
            utils_1.logger.error('Email verification token generation failed', {
                error,
                email: user.email,
            });
            throw new Error('Email verification token generation failed');
        }
    }
    /**
     * Generate refresh token with different secret (if provided)
     */
    generateRefreshToken(payload, expiresIn = '7d') {
        // Create minimal payload with only essential fields
        const refreshPayload = {
            id: payload.id,
            email: payload.email,
            role: payload.role,
            tokenType: 'refresh',
        };
        const secret = this.refreshSecret || this.secret;
        const options = {
            expiresIn,
            issuer: this.defaultOptions.issuer ?? '',
            audience: this.defaultOptions.audience ?? '',
            subject: payload.id?.toString(),
        };
        try {
            const signOptions = {
                expiresIn: options.expiresIn,
                issuer: options.issuer,
                audience: options.audience,
                algorithm: 'HS256',
            };
            const token = jsonwebtoken_1.default.sign(refreshPayload, secret, signOptions);
            utils_1.logger.info('Refresh token generated successfully', {
                userId: payload.id || payload.id,
                tokenLength: token.length,
            });
            return token;
        }
        catch (error) {
            console.error(error);
            utils_1.logger.error('Refresh token generation failed', { error });
            throw new Error('Refresh token generation failed');
        }
    }
    /**
     * Verify token with comprehensive expiration and error handling
     * Now supports different token types with their respective secrets
     * Throws errors to be handled by middleware
     */
    verifyToken(token, tokenType) {
        try {
            let secret = this.secret;
            // Select appropriate secret based on token type
            switch (tokenType) {
                case 'refresh':
                    secret = this.refreshSecret || this.secret;
                    break;
                case 'reset_password':
                    secret = this.resetPasswordSecret || this.secret;
                    break;
                case 'email_verification':
                    secret = this.emailVerificationSecret || this.secret;
                    break;
                default:
                    secret = this.secret;
            }
            const decoded = jsonwebtoken_1.default.verify(token, secret, {
                algorithms: ['HS256'],
            });
            console.log('decoded is', decoded);
            // Validate token type matches expected type
            if (decoded.tokenType && decoded.tokenType !== tokenType) {
                utils_1.logger.warn('Token type mismatch', {
                    expected: tokenType,
                    actual: decoded.tokenType,
                    userId: decoded.id
                });
                utils_1.logger.info('Token verified successfully', {
                    userId: decoded.id,
                    tokenType: decoded.tokenType,
                });
            }
            return { decoded };
        }
        catch (error) {
            console.error(error);
            // Handle JWT library errors
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                utils_1.logger.warn('JWT verification failed', {
                    error: error.message,
                    tokenType,
                });
                if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                    throw new utils_1.UnauthorizedError('Token has expired');
                }
                if (error instanceof jsonwebtoken_1.default.NotBeforeError) {
                    throw new utils_1.UnauthorizedError('Token not active');
                }
                // Generic JWT error (malformed, invalid signature, etc.)
                throw new utils_1.UnauthorizedError('Invalid token');
            }
            // Re-throw our custom errors
            if (error instanceof utils_1.AppError) {
                throw error;
            }
            // Unexpected error
            utils_1.logger.error('Unexpected error during token verification', {
                error: error instanceof Error ? error.message : String(error),
                tokenType,
            });
            throw new utils_1.AppError('Token verification failed');
        }
    }
}
exports.TokenService = TokenService;
