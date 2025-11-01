"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
const miningContractController = new controllers_1.MiningContractController();
// Public routes (read-only)
router.get('/', miningContractController.getAllContracts);
router.get('/server/:serverId', miningContractController.getContractsByServerId);
router.get('/period/:period', miningContractController.getContractsByPeriod);
router.get('/:id', miningContractController.getContractById);
// Admin only routes
router.post('/', miningContractController.createContract);
router.patch('/:id', miningContractController.updateContract);
router.delete('/:id', miningContractController.deleteContract);
exports.default = router;
