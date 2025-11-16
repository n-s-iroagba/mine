import { Request, Response } from 'express';
import { MiningSubscriptionService } from '../services';
import { BaseController } from './BaseController';
import { validateData } from '../services/utils/helpers/validation';
import { z } from 'zod';
import { MiningSubscription } from '../models';



const updateEarningsSchema = z.object({
  earnings: z.number().min(0, 'Earnings cannot be negative'),
});

export class MiningSubscriptionController extends BaseController {
  private miningSubscriptionService: MiningSubscriptionService;

  constructor() {
    super();
    this.miningSubscriptionService = new MiningSubscriptionService();
  }

  createSubscription = async (req: Request, res: Response): Promise<Response | void> => {
    const {minerId} = req.params
    try {
   
      

      
      const subscription = await this.miningSubscriptionService.createSubscription({...req.body,minerId});
      
      return this.created(res, 'Mining subscription created successfully', subscription);
    } catch (error) {
      return this.handleError(error, res, 'Failed to create mining subscription');
    }
  };

  getAllSubscriptions = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const subscriptions = await this.miningSubscriptionService.getAllSubscriptions();
      
      return this.success(res, 'Mining subscriptions retrieved successfully', subscriptions);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve mining subscriptions');
    }
  };

  getSubscriptionById = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const subscriptionId = parseInt(req.params.id);
      
      const subscription = await this.miningSubscriptionService.getSubscriptionById(subscriptionId);
      
      return this.success(res, 'Mining subscription retrieved successfully', subscription);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve mining subscription');
    }
  };

  getSubscriptionsByMinerId = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const minerId = parseInt(req.params.minerId);
    
      const subscriptions = await this.miningSubscriptionService.getSubscriptionsByMinerId(minerId);
      
      return this.success(res, 'Subscriptions retrieved successfully', subscriptions);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve subscriptions by miner ID');
    }
  };

  updateEarnings = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const subscriptionId = parseInt(req.params.id);
      const validatedData =validateData(updateEarningsSchema, req.body);
      
      const subscription = await this.miningSubscriptionService.updateEarnings(subscriptionId, req.body);
      
      return this.success(res, 'Earnings updated successfully', subscription);
    } catch (error) {
      return this.handleError(error, res, 'Failed to update earnings');
    }
  };

  updateSubscription = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   console.log(req.body)
      
      const id = parseInt(req.params.id);
     
      
      const subscription = await MiningSubscription.update( { ...req.body },
  { where: { id }, returning: true })
      
      return this.success(res, 'Earnings updated successfully', subscription);
    } catch (error) {
      return this.handleError(error, res, 'Failed to update earnings');
    }
  };

  calculateEarnings = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const subscriptionId = parseInt(req.params.id);
      const days = parseInt(req.query.days as string) || 1;
      
      const earnings = await this.miningSubscriptionService.calculateEarnings(subscriptionId, days);
      
      return this.success(res, 'Earnings calculated successfully', { earnings });
    } catch (error) {
      return this.handleError(error, res, 'Failed to calculate earnings');
    }
  };

  getMinerDashboard = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const minerId = parseInt(req.params.minerId);
  
      
      const dashboard = await this.miningSubscriptionService.getMinerDashboard(minerId);
      
      return this.success(res, 'Miner dashboard retrieved successfully', dashboard);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve miner dashboard');
    }
  };

  deactivateSubscription = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const subscriptionId = parseInt(req.params.id);
      
      await this.miningSubscriptionService.deactivateSubscription(subscriptionId);
      
      return this.success(res, 'Subscription deactivated successfully');
    } catch (error) {
      return this.handleError(error, res, 'Failed to deactivate subscription');
    }
  };

  processDailyEarnings = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      await this.miningSubscriptionService.processDailyEarnings();
      
      return this.success(res, 'Daily earnings processed successfully');
    } catch (error) {
      return this.handleError(error, res, 'Failed to process daily earnings');
    }
  };
}