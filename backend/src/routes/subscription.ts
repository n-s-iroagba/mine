import { Router } from 'express';
import { MiningSubscriptionController } from '../controllers';


const router = Router();
const miningSubscriptionController = new MiningSubscriptionController();

// Public routes (read-only with restrictions)
router.get('/miner/:minerId',  miningSubscriptionController.getSubscriptionsByMinerId);
router.get('/miner/:minerId/dashboard',  miningSubscriptionController.getMinerDashboard);
router.get('/:id', miningSubscriptionController.getSubscriptionById);
router.get('/:id/calculate-earnings', miningSubscriptionController.calculateEarnings);

// Admin only routes
router.get('/',   miningSubscriptionController.getAllSubscriptions);
router.post('/:minerId',   miningSubscriptionController.createSubscription);
router.patch('/:id/earnings',   miningSubscriptionController.updateEarnings);
router.patch('/:id/deactivate',   miningSubscriptionController.deactivateSubscription);
router.post('/process-daily-earnings',   miningSubscriptionController.processDailyEarnings);

export default router;