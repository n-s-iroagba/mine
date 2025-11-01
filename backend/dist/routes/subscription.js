"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
const miningSubscriptionController = new controllers_1.MiningSubscriptionController();
// Public routes (read-only with restrictions)
router.get('/miner/:minerId', miningSubscriptionController.getSubscriptionsByMinerId);
router.get('/miner/:minerId/dashboard', miningSubscriptionController.getMinerDashboard);
router.get('/:id', miningSubscriptionController.getSubscriptionById);
router.get('/:id/calculate-earnings', miningSubscriptionController.calculateEarnings);
// Admin only routes
router.get('/', miningSubscriptionController.getAllSubscriptions);
router.post('/:minerId', miningSubscriptionController.createSubscription);
router.patch('/:id/earnings', miningSubscriptionController.updateEarnings);
router.patch('/:id/deactivate', miningSubscriptionController.deactivateSubscription);
router.post('/process-daily-earnings', miningSubscriptionController.processDailyEarnings);
exports.default = router;
