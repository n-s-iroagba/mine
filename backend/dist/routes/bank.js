"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
const bankController = new controllers_1.BankController();
// Public routes (read-only)
router.get('/', bankController.getAllBanks);
router.get('/active', bankController.getActiveBanks);
router.get('/:id', bankController.getBankById);
// Admin only routes
router.post('/', bankController.createBank);
router.patch('/:id', bankController.updateBank);
router.delete('/:id', bankController.deleteBank);
exports.default = router;
