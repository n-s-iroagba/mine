
import { MiningContract, MiningSubscription } from '../models';
import { BaseRepository } from './BaseRepository';
export interface FullSubscriptionDetails extends MiningSubscription{
  miningContract:MiningContract
}
export interface IMiningSubscriptionRepository {
  findByMinerId(minerId: number): Promise<MiningSubscription[]>;
  findByIdWithDetails(id: number): Promise<MiningSubscription | null>;
  findAllWithDetails(): Promise<MiningSubscription[]>;
  findByMinerIdWithDetails(minerId: number): Promise<MiningSubscription[]>;
  updateEarnings(id: number, earnings: number): Promise<MiningSubscription|null>;
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

  async findByIdWithDetails(id: number): Promise< FullSubscriptionDetails | null> {
    try {
      return await this.findOne( { id },
        {include: [
          {
            association: 'miner',
            attributes: ['id', 'email', 'firstname', 'lastname'],
          },
          {
            association: 'miningContract',
            include: ['miningServer'],
          },
        ],
      }) as  FullSubscriptionDetails;
    } catch (error) {
      throw new Error(`Error finding subscription by ID ${id} with details: ${error}`);
    }
  }

  async findAllWithDetails(): Promise<MiningSubscription[]> {
    try {
      return await this.findAll({
        include: [
          {
            association: 'miner',
            attributes: ['id', 'email', 'firstname', 'lastname'],
          },
          {
            association: 'miningContract',
            include: ['miningServer'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
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
        ],
        order: [['createdAt', 'DESC']],
      }) as FullSubscriptionDetails [];
    } catch (error) {
      throw new Error(`Error finding subscriptions by miner ID ${minerId} with details: ${error}`);
    }
  }

  async updateEarnings(id: number, earnings: number): Promise<MiningSubscription|null> {
    try {
      return await this.update(id, { earnings });
    } catch (error) {
      throw new Error(`Error updating earnings for subscription ${id}: ${error}`);
    }
  }
}