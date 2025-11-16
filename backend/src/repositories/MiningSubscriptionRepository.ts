import { MiningContract, MiningSubscription, Transaction } from '../models';
import Miner from '../models/Miner';
import { BaseRepository } from './BaseRepository';

export interface FullSubscriptionDetails extends MiningSubscription {
  miningContract: MiningContract;
  transactions: Transaction[];
  miner: Miner
}

export interface IMiningSubscriptionRepository {
  findByMinerId(minerId: number): Promise<MiningSubscription[]>;
  findByIdWithDetails(id: number): Promise<MiningSubscription | null>;
  findAllWithDetails(): Promise<MiningSubscription[]>;
  findByMinerIdWithDetails(minerId: number): Promise<MiningSubscription[]>;
  updateEarnings(id: number, earnings: number): Promise<MiningSubscription | null>;
}

export class MiningSubscriptionRepository extends BaseRepository<MiningSubscription> implements IMiningSubscriptionRepository {
  constructor() {
    super(MiningSubscription);
  }

  async findByMinerId(minerId: number): Promise<MiningSubscription[]> {
    try {
      return await this.findAll({
        where: { minerId },
      });
    } catch (error) {
      throw new Error(`Error finding subscriptions by miner ID ${minerId}: ${error}`);
    }
  }

  async findByIdWithDetails(id: number): Promise<FullSubscriptionDetails | null> {
    try {
      return await this.findOne({ id }, {
        include: [
          {
            association: 'miningContract',
            include: ['miningServer'],
          },
          {
            model: Transaction,
            as: 'transactions',
            where: {
              entity: 'subscription',

            },
            required: false,
          },
        ],
      }) as FullSubscriptionDetails;
    } catch (error) {
      throw new Error(`Error finding subscription by ID ${id} with details: ${error}`);
    }
  }

  async findAllWithDetails(): Promise<FullSubscriptionDetails[]> {
    try {
      return await this.findAll({
        include: [
          {
            association: 'miningContract',
            include: ['miningServer'],
          },
          {
            model: Transaction,
            as: 'transactions',
            where: {
              entity: 'subscription',

            },
            required: false,
          }, {
            association: 'miner',
        
         
          }
        ],
        order: [['createdAt', 'DESC']],
      }) as FullSubscriptionDetails[];
    } catch (error) {
      throw new Error(`Error finding all subscriptions with details: ${error}`);
    }
  }

  async findByMinerIdWithDetails(minerId: number): Promise<FullSubscriptionDetails[]> {
    try {
      return await this.findAll({
        where: { minerId },
        include: [
          {
            association: 'miningContract',
            include: ['miningServer'],
          },
          {
            model: Transaction,
            as: 'transactions',
            where: {
              entity: 'subscription',
              minerId: minerId
            },
            required: false,
          },
          {
            model: Miner,
            as: 'miner',
            where: {
              id: minerId
            }
          }
        ],
        order: [['createdAt', 'DESC']],
      }) as FullSubscriptionDetails[];
    } catch (error) {
      throw new Error(`Error finding subscriptions by miner ID ${minerId} with details: ${error}`);
    }
  }

  async updateEarnings(id: number, earnings: number): Promise<MiningSubscription | null> {

    try {
      const subscription = await this.findById(id)
      subscription.totalEarnings += earnings
      await subscription.save()
      return subscription
    } catch (error) {
      throw new Error(`Error updating earnings for subscription ${id}: ${error}`);
    }
  }
}