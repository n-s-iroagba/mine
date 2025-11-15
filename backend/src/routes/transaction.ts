import { Router } from 'express';
import { TransactionController } from '../controllers';
import {  authenticate, requireAdmin } from '../middlewares/auth';

const router = Router();
const transactionController = new TransactionController();

// Public routes (with restrictions)
router.get('/miner/:minerId', authenticate, transactionController.getTransactionsByMinerId);
router.get('/:id', transactionController.getTransactionById);

// Admin only routes
router.get('/',   transactionController.getAllTransactions);
router.get('/status/:status',   transactionController.getTransactionsByStatus);
router.get('/stats/overview',   transactionController.getTransactionStats);
router.post('/',   transactionController.createTransaction);
router.patch('/:id/status',   transactionController.updateTransactionStatus);

export default router;