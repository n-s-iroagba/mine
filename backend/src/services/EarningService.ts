
import { MiningContract, MiningSubscription } from '../models';
import { EarningAttributes} from '../models/Earning';
import EarningStatus from '../models/EarningStatus';
import { MiningSubscriptionRepository } from '../repositories';
import { EarningRepository } from '../repositories/EarningRepository';
import { AppError, BaseService, logger, NotFoundError } from './utils';

export interface MiningSubscriptionWithMiner extends MiningSubscription{
  miningContract:MiningContract
}


export class EarningService extends BaseService {
  private earningRepository: EarningRepository;
  private subscriptionRepository:MiningSubscriptionRepository

  constructor() {
    super('EarningService');
    this.earningRepository = new EarningRepository();
    this.subscriptionRepository = new MiningSubscriptionRepository()
  }

async processDailyEarnings() {
  // Fetch only subscriptions that should update automatically
  const subscriptions = await this.subscriptionRepository.findAll({
    where: { shouldUpdateAutomatically: true },
    include: [
      {
        model: MiningContract,
        as: 'miningContract'
      }
    ]
  }) as MiningSubscriptionWithMiner[];

  if (!subscriptions.length) {
    logger.info("No subscriptions eligible for daily earnings.");
    return;
  }

  for (const sub of subscriptions) {
    try {
      const contract = sub.miningContract;
      if (!contract) {
        logger.error(`No mining contract found for subscription ${sub.id}`);
        continue;
      }

      const dailyPercentage = this.getDailyPercentage(contract);

      // Daily earning formula
      const dailyEarning = sub.amountDeposited * (dailyPercentage / 100);

      // Save earning
      await this.earningRepository.create({
        miningSubscriptionId: sub.id,
        amount: dailyEarning,
        date: new Date()
       
      });

      

      logger.info(
        `Daily earning created for subscription ${sub.id}: $${dailyEarning}`
      );
    } catch (err) {
      logger.error(`Error processing subscription ${sub.id}`, err);
    }
  }
  const status =await EarningStatus.findOne()
  status.dateOfLastUpdate= new Date()
  await status.save()
}

  async updateEarning(id: number, updateData: any): Promise<EarningAttributes> {
    try {
      this.logInfo('Updating earning', { earningId: id, updateData });

      const earning = await this.earningRepository.findById(id);
      if (!earning) {
        throw new NotFoundError('Earning');
      }

      const updatedEarning = await this.earningRepository.update(id, updateData);
      
      if (!updatedEarning) {
        throw new AppError('Failed to update earning');
      }

      return updatedEarning!.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to update earning');
    }
  }

  async deleteEarning(id: number): Promise<void> {
    try {
      this.logInfo('Deleting earning', { earningId: id });

      const earning = await this.earningRepository.findById(id);
      if (!earning) {
        throw new NotFoundError('Earning');
      }
      

      await this.earningRepository.deleteById(id);

      this.logInfo('Earning deleted successfully', { earningId: id });
    } catch (error) {
      this.handleError(error, 'Failed to delete earning');
    }
  }
private getDailyPercentage(contract: MiningContract): number {
  // periodReturn example: 10 (meaning 10% per period)
  const periodReturn = contract.periodReturn;

  // Convert each period into its number of days
  const daysInPeriod = {
    daily: 1,
    weekly: 7,
    fortnightly: 14,
    monthly: 30
  }[contract.period];

  // DAILY percentage = period return / days
  return periodReturn / daysInPeriod;
}


}