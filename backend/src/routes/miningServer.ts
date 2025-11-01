import { Router } from 'express';
import { MiningServerController } from '../controllers';
import { authenticate } from '../middlewares/auth';


const router = Router();
const miningServerController = new MiningServerController();

// Public routes (read-only)
router.get('/', miningServerController.getAllServers);
router.get('/with-contracts', miningServerController.getAllServersWithContracts);
router.get('/:id', miningServerController.getServerById);

// Admin only routes
router.post('/',  miningServerController.createServer);
router.patch('/:id',  miningServerController.updateServer);
router.delete('/:id',  miningServerController.deleteServer);

export default router;