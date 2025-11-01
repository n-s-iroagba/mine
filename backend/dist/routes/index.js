"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const adminWallet_1 = __importDefault(require("./adminWallet"));
const miningServer_1 = __importDefault(require("./miningServer"));
const miningContract_1 = __importDefault(require("./miningContract"));
const bank_1 = __importDefault(require("./bank"));
const subscription_1 = __importDefault(require("./subscription"));
const transaction_1 = __importDefault(require("./transaction"));
const kyc_1 = __importDefault(require("./kyc"));
const kycFee_1 = __importDefault(require("./kycFee"));
const email_1 = __importDefault(require("./email"));
const router = (0, express_1.Router)();
// API routes
router.use('/auth', auth_1.default);
// router.use('/users', userRoutes);
router.use('/admin-wallets', adminWallet_1.default);
router.use('/mining-servers', miningServer_1.default);
router.use('/mining-contracts', miningContract_1.default);
router.use('/banks', bank_1.default);
router.use('/subscriptions', subscription_1.default);
router.use('/transactions', transaction_1.default);
router.use('/kyc', kyc_1.default);
router.use('/kyc-fees', kycFee_1.default);
router.use('/email', email_1.default);
// Health check route
router.get('/health', (_, res) => {
    res.status(200).json({
        success: true,
        message: 'Satoshi Vertex API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});
// 404 handler for API routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API route not found: ${req.originalUrl}`,
    });
});
exports.default = router;
