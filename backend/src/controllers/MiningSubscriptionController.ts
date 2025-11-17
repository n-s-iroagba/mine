import { Request, Response } from 'express';
import { MiningSubscriptionService } from '../services';
import { BaseController } from './BaseController';
import { validateData } from '../services/utils/helpers/validation';
import { z } from 'zod';
import { Earning, MiningSubscription, Transaction } from '../models';
import { BadRequestError } from '../services/utils';



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
    mutateDeposit = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   console.log(req.body)
   const {amount, actionType, shouldSendEmail, shouldCreateTransaction,depositStatus} = req.body
      
      const id = parseInt(req.params.id);
     
      
      const subscription = await MiningSubscription.findByPk(id)
      if(actionType==='credit'){
        subscription.amountDeposited+=amount
      }else if (actionType==='debit'){
        subscription.amountDeposited-=amount
      }else{
        throw new BadRequestError('invalid transaction action type.')
      }
      subscription.depositStatus = depositStatus
      await subscription.save()

      if(shouldCreateTransaction){
        await Transaction.create({amountInUSD:amount,entity:'subscription',entityId: subscription.id,minerId:subscription.minerId})
      }
      if (shouldSendEmail){

      }
 
      
      return this.success(res, 'Earnings updated successfully', subscription);
    } catch (error) {
      return this.handleError(error, res, 'Failed to update earnings');
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


}