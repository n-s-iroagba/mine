// routes/minerRoutes.ts
import { Router } from 'express';
import { MinerController } from '../controllers/MinerController';


const router = Router();
const minerController = new MinerController();


// Public routes (authenticated users)
router.get('/', minerController.getAllMiners);
router.get('/:id', minerController.getMinerById);

// Admin only routes
router.put('/:id',  minerController.updateMiner);
router.delete('/:id',  minerController.deleteMiner);

export default router;