// controllers/EarningController.ts
import { Request, Response } from 'express';
import { AppError, ValidationError } from '../services/utils';
import { EarningService } from '../services/EarningService';
import { MiningSubscriptionService } from '../services/MiningSubscriptionService';
import { Earning } from '../models';


export class EarningController {
  private earningService: EarningService;
  private miningSubscriptionService: MiningSubscriptionService;

  constructor() {
    this.earningService = new EarningService();
    this.miningSubscriptionService = new MiningSubscriptionService();
  }


createEarnings = async (req: Request, res: Response) => {
  try {
    console.log("Incoming Body:", req.body);

    const {
      miningSubscriptionId,
      amount,
      date,
      shouldSendEmail
    } = req.body;

    const newEarning = await Earning.create({
      miningSubscriptionId,
      amount,
      date
    });

    if (shouldSendEmail) {
      // send email logic here
    }

    return this.success(res, 'Earning created successfully', newEarning);
  } catch (error) {
    return this.handleError(error, res, 'Failed to create earning');
  }
};

  processDailyEarnings = async  (req: Request, res: Response) => {

    try{
      await this.earningService.processDailyEarnings()
            return this.success(res, 'Earnings success fully updated');

    }catch(error){
       return this.handleError(error, res, 'Failed process daily earings');
  }
  }

  updateEarning = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {updateData, shouldSendEmail} = req.body;

      if (!id) throw new ValidationError('Earning ID is required');

      const earningId = parseInt(id, 10);
      if (isNaN(earningId)) throw new ValidationError('Invalid earning ID');

      const updatedEarning = await this.earningService.updateEarning(
        earningId,
        updateData
      );
      if (shouldSendEmail){

      }

      res.status(200).json({
        success: true,
        data: updatedEarning,
        message: 'Earning updated successfully'
      });
    } catch (error) {
      this.handleError(error, res, 'Failed to update earning');
    }
  };

  deleteEarning = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) throw new ValidationError('Earning ID is required');

      const earningId = parseInt(id, 10);
      if (isNaN(earningId)) throw new ValidationError('Invalid earning ID');

      await this.earningService.deleteEarning(earningId);

      res.status(200).json({
        success: true,
        message: 'Earning deleted successfully'
      });
    } catch (error) {
      this.handleError(error, res, 'Failed to delete earning');
    }
  };

  private success(res: Response, message: string, data: any = null) {
    return res.status(200).json({ success: true, message, data });
  }

  private handleError(error: any, res: Response, defaultMessage: string) {
    if (error instanceof AppError) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message
      });
    }

    console.error('EarningController error:', error);
    return res.status(500).json({
      success: false,
      message: defaultMessage
    });
  }
}
