"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookieOptions = void 0;
const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: (isProduction ? 'none' : 'lax'),
        domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
        // domain:'http://localhost:5000',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/', // Explicitly set path
    };
    // Debug logging
    console.log('Cookie options:', {
        ...options,
        environment: process.env.NODE_ENV,
        cookieDomain: process.env.COOKIE_DOMAIN,
    });
    return options;
};
exports.getCookieOptions = getCookieOptions;
