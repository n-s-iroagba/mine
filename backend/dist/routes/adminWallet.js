"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminWalletController_1 = require("../controllers/AdminWalletController");
const router = (0, express_1.Router)();
const adminWalletController = new AdminWalletController_1.AdminWalletController();
// Public routes (read-only)
router.get('/', adminWalletController.getAllWallets);
router.get('/active', adminWalletController.getActiveWallets);
router.get('/:id', adminWalletController.getWalletById);
// Admin only routes
router.post('/', adminWalletController.createWallet);
router.patch('/:id', adminWalletController.updateWallet);
router.delete('/:id', adminWalletController.deleteWallet);
exports.default = router;
