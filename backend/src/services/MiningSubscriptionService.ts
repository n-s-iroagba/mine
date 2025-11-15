import { MiningSubscriptionRepository, MiningContractRepository, UserRepository } from '../repositories';
import { AppError, BaseService, CalculationHelper, NotFoundError, ValidationError, } from './utils';

import { MiningSubscriptionAttributes, MiningSubscriptionCreationAttributes } from '../models/MiningSubscription';
import { FullSubscriptionDetails } from '../repositories/MiningSubscriptionRepository';
import Miner from '../models/Miner';
import { Op } from 'sequelize';
import { EarningRepository } from '../repositories/EarningRepository';

export interface CreateMiningSubscriptionData {
  miningContractId: number;
  amountDeposited: number;
  minerId: number;
  shouldUpdateAutomatically?: boolean;
}

export interface UpdateEarningsData {
  earnings: number;  
}

export class MiningSubscriptionService extends BaseService {
  private miningSubscriptionRepository: MiningSubscriptionRepository;
  private miningContractRepository: MiningContractRepository;
  private userRepository: UserRepository;
  private earningRepository:EarningRepository
  

  constructor() {
    super('MiningSubscriptionService');
    this.miningSubscriptionRepository = new MiningSubscriptionRepository();
    this.miningContractRepository = new MiningContractRepository();
    this.userRepository = new UserRepository();
    this.earningRepository = new EarningRepository()
  }

  async createSubscription(subscriptionData: MiningSubscriptionCreationAttributes): Promise<MiningSubscriptionAttributes> {
    try {
      this.logInfo('Creating mining subscription', { 
        minerId: subscriptionData.minerId,
        contractId: subscriptionData.miningContractId 
      });

  

      // Validate mining contract exists
      const miningContract = await this.miningContractRepository.findById(subscriptionData.miningContractId);
      if (!miningContract) {
        throw new NotFoundError('Mining contract');
      }

      // Validate miner exists and is a miner
      const miner = await Miner.findOne({where:{userId:subscriptionData.minerId}});
      if (!miner) {
        console.log(await Miner.findAll(),subscriptionData.minerId)
        throw new NotFoundError('Miner');
      }

  

     
      const subscription = await this.miningSubscriptionRepository.create({
        ...subscriptionData,
        shouldUpdateAutomatically: subscriptionData.shouldUpdateAutomatically ?? true,
        totalEarnings: 0,
        amountDeposited:0,
        currency:subscriptionData.currency

      });

      this.logInfo('Mining subscription created successfully', { subscriptionId: subscription.id });

      return subscription.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to create mining subscription');
    }
  }

  async getAllSubscriptions(): Promise<FullSubscriptionDetails[]> {
    try {
      this.logInfo('Fetching all mining subscriptions');
      const subscriptions = await this.miningSubscriptionRepository.findAllWithDetails();
      return subscriptions
    } catch (error) {
      this.handleError(error, 'Failed to fetch mining subscriptions');
    }
  }

  async getSubscriptionById(id: number): Promise<MiningSubscriptionAttributes> {
    try {
      this.logInfo('Fetching mining subscription by ID', { subscriptionId: id });
      const subscription = await this.miningSubscriptionRepository.findByIdWithDetails(id);

      if (!subscription) {
        throw new NotFoundError('Mining subscription');
      }

      return subscription.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to fetch mining subscription');
    }
  }

  async getSubscriptionsByMinerId(minerId: number): Promise<FullSubscriptionDetails[]> {
    try {
      this.logInfo('Fetching subscriptions by miner ID', { minerId });

      // Validate miner exists
      const miner = await this.userRepository.findById(minerId);
      if (!miner) {
        throw new NotFoundError('Miner');
      }

      const subscriptions = await this.miningSubscriptionRepository.findByMinerIdWithDetails(minerId);
      return subscriptions
    } catch (error) {
      this.handleError(error, 'Failed to fetch subscriptions by miner ID');
    }
  }

  async updateEarnings(id: number, earningsData:any): Promise<MiningSubscriptionAttributes> {
    try {
      this.logInfo('Updating subscription earnings', { subscriptionId: id, earnings: earningsData.earnings });
     
      const subscription = await this.miningSubscriptionRepository.findById(id);
      if (!subscription) {
        throw new NotFoundError('Mining subscription');
      }

      if (earningsData.earnings < 0) {
        throw new ValidationError('Earnings cannot be negative');
      }

      const updatedSubscription= await this.miningSubscriptionRepository.updateEarnings(id, earningsData.earnings);
      this.earningRepository.create({amount:earningsData.earnings,miningSubscriptionId:earningsData,date:new Date()})
      
      if (!updatedSubscription) {
        throw new AppError('Failed to update subscription earnings');
      }

     
      return updatedSubscription!.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to update subscription earnings');
    }
  }

  async calculateEarnings(id: number, days: number = 1): Promise<number> {
    try {
      this.logInfo('Calculating earnings for subscription', { subscriptionId: id, days });

      const subscription = await this.miningSubscriptionRepository.findByIdWithDetails(id);
      if (!subscription) {
        throw new NotFoundError('Mining subscription');
      }

      const miningContract = subscription.miningContract;
      if (!miningContract) {
        throw new AppError('Mining contract not found for subscription');
      }

      const earnings = CalculationHelper.calculateEarnings(
        subscription.amountDeposited,
        miningContract.periodReturn,
        miningContract.period,
        days
      );

      this.logInfo('Earnings calculated', { subscriptionId: id, earnings });

      return earnings;
    } catch (error) {
      this.handleError(error, 'Failed to calculate earnings');
    }
  }

  async processDailyEarnings(): Promise<void> {
    try {
      this.logInfo('Processing daily earnings for all active subscriptions');

      const activeSubscriptions = await this.miningSubscriptionRepository.findAll({
        where: { amountDeposited:{ [Op.gt]:0}, shouldUpdateAutomatically: true },
        include: ['miningContract'],
      }) as FullSubscriptionDetails[];

      let processedCount = 0;

      for (const subscription of activeSubscriptions) {
        try {
          const miningContract = subscription.miningContract;
          if (!miningContract) continue;

          const dailyEarnings = CalculationHelper.calculateEarnings(
            subscription.amountDeposited,
            miningContract.periodReturn,
            miningContract.period,
            1
          );
          await this.earningRepository.create({
            amount:dailyEarnings,
            miningSubscriptionId:subscription.id,
            date:new Date()

          })
          const newEarnings = subscription.totalEarnings + dailyEarnings;

          await this.miningSubscriptionRepository.updateEarnings(subscription.id, newEarnings);
          processedCount++;

        } catch (error) {
          this.logError(`Failed to process earnings for subscription ${subscription.id}`, error);
        }
      }

      this.logInfo('Daily earnings processing completed', { processedCount, total: activeSubscriptions.length });
    } catch (error) {
      this.handleError(error, 'Failed to process daily earnings');
    }
  }

  async getMinerDashboard(minerId: number): Promise<any> {
    try {
      this.logInfo('Generating miner dashboard', { minerId });

      const subscriptions = await this.miningSubscriptionRepository.findByMinerIdWithDetails(minerId);
      
      const totalDeposits = CalculationHelper.calculateTotalDeposits(subscriptions);
      const totalEarnings = CalculationHelper.calculateTotalEarnings(subscriptions);
      const netProfit = CalculationHelper.calculateNetProfit(totalEarnings, totalDeposits);
      const overallROI = CalculationHelper.calculateROI(totalEarnings, totalDeposits);

      const activeSubscriptions = subscriptions.length
      const inactiveSubscriptions =0

      return {
        summary: {
          totalSubscriptions: subscriptions.length,
          activeSubscriptions: activeSubscriptions,
          inactiveSubscriptions: inactiveSubscriptions,
          totalDeposits,
          totalEarnings,
          netProfit,
          overallROI,
        },
        subscriptions: subscriptions.map(sub => ({
          id: sub.id,
          amountDeposited: sub.amountDeposited,
          earnings: sub.totalEarnings,
     
          createdAt: sub.createdAt,
          miningContract: sub.miningContract,
        })),
      };
    } catch (error) {
      this.handleError(error, 'Failed to generate miner dashboard');
    }
  }

  async deactivateSubscription(id: number): Promise<void> {
    try {
      this.logInfo('Deactivating mining subscription', { subscriptionId: id });

      const subscription = await this.miningSubscriptionRepository.deleteById(id);
      if (!subscription) {
        throw new NotFoundError('Mining subscription');
      }



      this.logInfo('Mining subscription deactivated successfully', { subscriptionId: id });
    } catch (error) {
      this.handleError(error, 'Failed to deactivate mining subscription');
    }
  }
}