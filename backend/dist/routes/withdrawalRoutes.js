"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/withdrawalRoutes.ts
const express_1 = require("express");
const WithdrawalController_1 = __importDefault(require("../controllers/WithdrawalController"));
const router = (0, express_1.Router)();
const withdrawalController = new WithdrawalController_1.default();
// Miner routes
router.post('/', withdrawalController.createWithdrawal);
router.get('/miner/my-withdrawals', withdrawalController.getMinerWithdrawals);
router.get('/:id', withdrawalController.getWithdrawalById);
router.post('/:id/cancel', withdrawalController.cancelWithdrawal);
// Admin routes
router.get('/admin/all', withdrawalController.getAllWithdrawals);
router.patch('/admin/:id/status', withdrawalController.updateWithdrawalStatus);
router.get('/admin/stats', withdrawalController.getWithdrawalStats);
exports.default = router;
