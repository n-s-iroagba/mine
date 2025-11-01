"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const KYCFeeController_1 = require("../controllers/KYCFeeController");
const router = (0, express_1.Router)();
const kycFeeController = new KYCFeeController_1.KYCFeeController();
// Public routes (with restrictions)
router.get('/miner/:minerId', kycFeeController.getKYCFeeByMinerId);
router.get('/:id', kycFeeController.getKYCFeeById);
// Admin only routes
router.get('/', kycFeeController.getAllKYCFees);
router.get('/unpaid', kycFeeController.getUnpaidFees);
router.get('/paid', kycFeeController.getPaidFees);
router.get('/stats/overview', kycFeeController.getKYCFeeStats);
router.post('/', kycFeeController.createKYCFee);
router.patch('/:id/mark-paid', kycFeeController.markFeeAsPaid);
exports.default = router;
