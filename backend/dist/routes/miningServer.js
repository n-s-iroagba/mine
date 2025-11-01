"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
const miningServerController = new controllers_1.MiningServerController();
// Public routes (read-only)
router.get('/', miningServerController.getAllServers);
router.get('/with-contracts', miningServerController.getAllServersWithContracts);
router.get('/:id', miningServerController.getServerById);
// Admin only routes
router.post('/', miningServerController.createServer);
router.patch('/:id', miningServerController.updateServer);
router.delete('/:id', miningServerController.deleteServer);
exports.default = router;
