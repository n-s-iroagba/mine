"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
const cookieOption_1 = require("../config/cookieOption");
class AuthController {
    constructor() {
        this.signupMiner = async (req, res, next) => {
            try {
                const result = await this.authService.signupMiner(req.body);
                res.status(201).json({
                    success: true,
                    data: result,
                    message: 'Miner registered successfully. Please check your email for verification.'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.signupAdmin = async (req, res, next) => {
            try {
                const result = await this.authService.signUpAdmin(req.body);
                res.status(201).json({
                    success: true,
                    data: result,
                    message: 'Admin registered successfully.'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const loginData = req.body;
                const result = await this.authService.login(loginData);
                const verified = result;
                const cookieOptions = (0, cookieOption_1.getCookieOptions)();
                console.log('Setting refresh token cookie with options:', cookieOptions);
                res.cookie('refreshToken', verified.refreshToken, cookieOptions);
                res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Login successful'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyEmail = async (req, res, next) => {
            try {
                const verifyData = req.body;
                const result = await this.authService.verifyEmail(verifyData);
                const verified = result;
                const cookieOptions = (0, cookieOption_1.getCookieOptions)();
                console.log('Setting refresh token cookie with options:', cookieOptions);
                res.cookie('refreshToken', verified.refreshToken, cookieOptions);
                res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Email verified successfully'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.resendVerificationCode = async (req, res, next) => {
            try {
                const { token } = req.body;
                const result = await this.authService.generateNewCode(token);
                res.status(200).json({
                    success: true,
                    data: { message: result },
                    message: 'Verification code sent successfully'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.forgotPassword = async (req, res, next) => {
            try {
                const { email } = req.body;
                await this.authService.forgotPassword(email);
                res.status(200).json({
                    success: true,
                    message: 'Password reset email sent successfully'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.resetPassword = async (req, res, next) => {
            try {
                const resetData = req.body;
                const result = await this.authService.resetPassword(resetData);
                res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Password reset successfully'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.refreshToken = async (req, res, next) => {
            try {
                console.log('All cookies received:', req.cookies);
                console.log('Headers:', req.headers.cookie);
                const cookieHeader = req.headers.cookie;
                console.log('Raw cookie header:', cookieHeader);
                if (!cookieHeader) {
                    res.status(401).json({ message: 'No cookies provided' });
                    return;
                }
                // Extract the refreshToken value from the cookie string
                const refreshToken = cookieHeader
                    .split(';')
                    .find(cookie => cookie.trim().startsWith('refreshToken='))
                    ?.split('=')[1];
                console.log('Extracted refresh token:', refreshToken ? 'Present' : 'Missing');
                console.log('Token preview:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'None');
                if (!refreshToken) {
                    res.status(401).json({
                        success: false,
                        message: 'Refresh token not found in cookies'
                    });
                    return;
                }
                const result = await this.authService.refreshToken(refreshToken);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMe = async (req, res, next) => {
            try {
                // Assuming user ID is attached to req.user by authentication middleware
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                    return;
                }
                const user = await this.authService.getMe(userId);
                res.status(200).json({
                    success: true,
                    data: user,
                    message: 'User data retrieved successfully'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.logout = async (_, res, next) => {
            try {
                // In a real implementation, you might want to blacklist the token
                // or remove the refresh token from the database
                res.status(200).json({
                    success: true,
                    message: 'Logged out successfully'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.authService = new AuthService_1.AuthService();
    }
}
exports.AuthController = AuthController;
