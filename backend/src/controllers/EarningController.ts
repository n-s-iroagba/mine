// controllers/EarningController.ts
import { Request, Response } from 'express';

import { AppError, ValidationError } from '../services/utils';
import { EarningService } from '../services/EarningService';

export class EarningController {
  private earningService: EarningService;

  constructor() {
    this.earningService = new EarningService();
  }

  createEarning = async (req: Request, res: Response): Promise<void> => {
    try {
      const earningData = req.body;
      
      // Validate required fields
      if (!earningData.miningSubscriptionId || !earningData.amount || !earningData.date) {
        throw new ValidationError('miningSubscriptionId, amount, and date are required');
      }

      const earning = await this.earningService.createEarning(earningData);
      
      res.status(201).json({
        success: true,
        data: earning,
        message: 'Earning created successfully'
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to create earning');
    }
  };

  getEarningsBySubscriptionId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { subscriptionId } = req.params;
      
      if (!subscriptionId) {
        throw new ValidationError('Subscription ID is required');
      }

      const earnings = await this.earningService.getAllBySubscripitionId(subscriptionId);
      
      res.status(200).json({
        success: true,
        data: earnings,
        message: 'Earnings fetched successfully'
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to fetch earnings');
    }
  };

  updateEarning = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        throw new ValidationError('Earning ID is required');
      }

      const earningId = parseInt(id, 10);
      if (isNaN(earningId)) {
        throw new ValidationError('Invalid earning ID');
      }

      const updatedEarning = await this.earningService.updateEarning(earningId, updateData);
      
      res.status(200).json({
        success: true,
        data: updatedEarning,
        message: 'Earning updated successfully'
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to update earning');
    }
  };

  deleteEarning = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ValidationError('Earning ID is required');
      }

      const earningId = parseInt(id, 10);
      if (isNaN(earningId)) {
        throw new ValidationError('Invalid earning ID');
      }

      await this.earningService.deleteEarning(earningId);
      
      res.status(200).json({
        success: true,
        message: 'Earning deleted successfully'
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to delete earning');
    }
  };

  private handleError(res: Response, error: any, defaultMessage: string): void {
    if (error instanceof AppError) {
      res.status(error.statusCode || 400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('EarningController error:', error);
      res.status(500).json({
        success: false,
        message: defaultMessage
      });
    }
  }
}