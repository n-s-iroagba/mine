"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
const emailController = new controllers_1.EmailController();
// Admin only routes
router.post('/send', emailController.sendEmail);
router.post('/send-bulk', emailController.sendBulkEmail);
router.post('/send-to-miners', emailController.sendEmailToAllMiners);
router.post('/send-to-admins', emailController.sendEmailToAllAdmins);
exports.default = router;
