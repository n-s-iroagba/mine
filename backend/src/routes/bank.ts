import { Router } from 'express';
import { BankController } from '../controllers';


const router = Router();
const bankController = new BankController();

// Public routes (read-only)
router.get('/', bankController.getAllBanks);
router.get('/active', bankController.getActiveBanks);
router.get('/:id', bankController.getBankById);

// Admin only routes
router.post('/',  bankController.createBank);
router.patch('/:id',  bankController.updateBank);
router.delete('/:id',  bankController.deleteBank);

export default router;