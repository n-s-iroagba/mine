
import { AppError, BaseService, NotFoundError } from './utils';


import { MinerRepository } from '../repositories/MinerRepository';
import  { MinerAttributes } from '../models/Miner';

export class MinerService extends BaseService {
  private minerRepository: MinerRepository;

  constructor() {
    super('MinerService');
    this.minerRepository = new MinerRepository();
  }


  async getAllMiners(): Promise<MinerAttributes[]> {
    try {
      this.logInfo('Fetching all Miners');
      const miners = await this.minerRepository.findAll({
        order: [['createdAt', 'ASC']],
      });
      return miners.map(Miner => Miner.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch miners');
    }
  }

  async getMinerById(id: number): Promise<MinerAttributes> {
    try {
      this.logInfo('Fetching Miner by ID', { minerId: id });
      const miner = await this.minerRepository.findById(id);

      if (!miner) {
        throw new NotFoundError('Miner');
      }

      return miner.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to fetch miner');
    }
  }

  async updateMiner(id: number, updateData: any): Promise<MinerAttributes> {
    try {
      this.logInfo('Updating Miner', { minerId: id, updateData });

      const miner = await this.minerRepository.findById(id);
      if (!miner) {
        throw new NotFoundError('miner');
      }

 

 
      

      const updatedMiner = await this.minerRepository.update(id, updateData);
      
      if (!updatedMiner) {
        throw new AppError('Failed to update Miner');
      }

      return updatedMiner!.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to update Miner');
    }
  }

  async deleteMiner(id: number): Promise<void> {
    try {
      this.logInfo('Deleting Miner', { minerId: id });

      const miner = await this.minerRepository.findById(id);
      if (!miner) {
        throw new NotFoundError('Miner');
      }

      await this.minerRepository.deleteById(id);

      this.logInfo('Miner deleted successfully', { minerId: id });
    } catch (error) {
      this.handleError(error, 'Failed to delete Miner');
    }
  }


}