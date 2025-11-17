// routes/earningRoutes.ts
import { Router } from 'express';
import { EarningController } from '../controllers/EarningController';

const router = Router();
const earningController = new EarningController();



// GET /api/earnings/subscription/:subscriptionId - Get earnings by subscription ID
router.get('/process-daily', earningController.processDailyEarnings);

// POST /api/earnings - Create new earning (admin only)
router.post('/', earningController.createEarnings);

// PATCH /api/earnings/:id - Update earning (admin only)
router.patch('/:id', earningController.updateEarning);

// DELETE /api/earnings/:id - Delete earning (admin only)
router.delete('/:id', earningController.deleteEarning);

export default router;