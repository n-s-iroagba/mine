// routes/withdrawalRoutes.ts
import { Router } from 'express';
import WithdrawalController from '../controllers/WithdrawalController';
import { authenticate } from '../middlewares/auth';


const router = Router();
const withdrawalController = new WithdrawalController();

// Miner routes
router.post('/',  withdrawalController.createWithdrawal);
router.get('/miner/my-withdrawals',  withdrawalController.getMinerWithdrawals);
router.get('/:id',  withdrawalController.getWithdrawalById);
router.post('/:id/cancel',  withdrawalController.cancelWithdrawal);

// Admin routes
router.get('/admin/all',  withdrawalController.getAllWithdrawals);
router.patch('/admin/:id/status',  withdrawalController.updateWithdrawalStatus);
router.get('/admin/stats',  withdrawalController.getWithdrawalStats);

export default router;