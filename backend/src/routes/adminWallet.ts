import { Router } from 'express';
import { AdminWalletController } from '../controllers/AdminWalletController';
import { authenticate } from '../middlewares/auth';


const router = Router();
const adminWalletController = new AdminWalletController();

// Public routes (read-only)
router.get('/', adminWalletController.getAllWallets);
router.get('/active', adminWalletController.getActiveWallets);
router.get('/:id', adminWalletController.getWalletById);

// Admin only routes
router.post('/', adminWalletController.createWallet);
router.patch('/:id', adminWalletController.updateWallet);
router.delete('/:id', adminWalletController.deleteWallet);

export default router;