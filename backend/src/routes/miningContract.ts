import { Router } from 'express';
import { MiningContractController } from '../controllers';
import {  requireAdmin } from '../middlewares/auth';

const router = Router();
const miningContractController = new MiningContractController();

// Public routes (read-only)
router.get('/', miningContractController.getAllContracts);
router.get('/server/:serverId', miningContractController.getContractsByServerId);
router.get('/period/:period', miningContractController.getContractsByPeriod);
router.get('/:id', miningContractController.getContractById);

// Admin only routes
router.post('/',   miningContractController.createContract);
router.patch('/:id',   miningContractController.updateContract);
router.delete('/:id',   miningContractController.deleteContract);

export default router;