"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
const kycController = new controllers_1.KYCController();
// Public routes (with restrictions)
router.get('/miner/:minerId', kycController.getKYCByMinerId);
router.get('/:id', kycController.getKYCRequestById);
// Admin only routes
router.get('/', kycController.getAllKYCRequests);
router.get('/status/:status', kycController.getKYCByStatus);
router.get('/stats/overview', kycController.getKYCStats);
router.post('/', kycController.createKYCRequest);
router.patch('/:id/status', kycController.updateKYCStatus);
exports.default = router;
