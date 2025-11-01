import { Router } from 'express';
import { EmailController } from '../controllers';
import {  requireAdmin } from '../middlewares/auth';

const router = Router();
const emailController = new EmailController();

// Admin only routes
router.post('/send',   emailController.sendEmail);
router.post('/send-bulk',   emailController.sendBulkEmail);
router.post('/send-to-miners',   emailController.sendEmailToAllMiners);
router.post('/send-to-admins',   emailController.sendEmailToAllAdmins);

export default router;