"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/authRoutes.ts
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
// Public routes
router.post('/signup/miner', authController.signupMiner);
router.post('/signup/admin', authController.signupAdmin);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification-code', authController.resendVerificationCode);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);
// Protected routes
router.get('/me', auth_1.authenticate, authController.getMe);
router.post('/logout', authController.logout);
exports.default = router;
