import { Router } from 'express';
import { KYCController } from '../controllers';
import {  requireAdmin } from '../middlewares/auth';

const router = Router();
const kycController = new KYCController();

// Public routes (with restrictions)
router.get('/miner/:minerId',  kycController.getKYCByMinerId);
router.get('/:id', kycController.getKYCRequestById);

// Admin only routes
router.get('/',   kycController.getAllKYCRequests);
router.get('/status/:status',   kycController.getKYCByStatus);
router.get('/stats/overview',   kycController.getKYCStats);
router.post('/',   kycController.createKYCRequest);
router.patch('/:id/status',   kycController.updateKYCStatus);

export default router;