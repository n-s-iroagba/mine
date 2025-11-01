"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
const transactionController = new controllers_1.TransactionController();
// Public routes (with restrictions)
router.get('/miner/:minerId', transactionController.getTransactionsByMinerId);
router.get('/:id', transactionController.getTransactionById);
// Admin only routes
router.get('/', transactionController.getAllTransactions);
router.get('/status/:status', transactionController.getTransactionsByStatus);
router.get('/stats/overview', transactionController.getTransactionStats);
router.post('/', transactionController.createTransaction);
router.patch('/:id/status', transactionController.updateTransactionStatus);
exports.default = router;
