import { Router } from 'express';

import { authenticate} from '../middlewares/auth';
import { KYCFeeController } from '../controllers/KYCFeeController';

const router = Router();
const kycFeeController = new KYCFeeController();

// Public routes (with restrictions)
router.get('/miner/:minerId',  kycFeeController.getKYCFeeByMinerId);
router.get('/:id', kycFeeController.getKYCFeeById);

// Admin only routes
router.get('/',   kycFeeController.getAllKYCFees);
router.get('/unpaid',   kycFeeController.getUnpaidFees);
router.get('/paid',   kycFeeController.getPaidFees);
router.get('/stats/overview',   kycFeeController.getKYCFeeStats);
router.post('/',   kycFeeController.createKYCFee);
router.patch('/:id/mark-paid',   kycFeeController.markFeeAsPaid);

export default router;