
import { KYCFee } from '../models';
import { BaseRepository } from './BaseRepository';

export interface IKYCFeeRepository {
  findByMinerId(minerId: number): Promise<KYCFee | null>;
  findByPaidStatus(isPaid: boolean): Promise<KYCFee[]>;
  markAsPaid(id: number): Promise<KYCFee|null>;
  findAllWithMiner(): Promise<KYCFee[]>;
}

export class KYCFeeRepository extends BaseRepository<KYCFee> implements IKYCFeeRepository {
  constructor() {
    super(KYCFee);
  }

  async findByMinerId(minerId: number): Promise<KYCFee | null> {
    try {
      return await this.findOne( {minerId },
       { include: [
          {
            association: 'miner',
            attributes: ['id', 'email', 'firstName', 'lastName'],
          },
        ],
      });
    } catch (error) {
      throw new Error(`Error finding KYC fee by miner ID ${minerId}: ${error}`);
    }
  }

  async findByPaidStatus(isPaid: boolean): Promise<KYCFee[]> {
    try {
      return await this.findAll({
        where: { isPaid },
        include: [
          {
            association: 'miner',
            attributes: ['id', 'email', 'firstName', 'lastName'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      throw new Error(`Error finding KYC fees by paid status ${isPaid}: ${error}`);
    }
  }

  async markAsPaid(id: number): Promise<KYCFee|null> {
    try {
      return await this.update(id, {
        isPaid: true,
        paidAt: new Date(),
      });
    } catch (error) {
      throw new Error(`Error marking KYC fee as paid for ID ${id}: ${error}`);
    }
  }

  async findAllWithMiner(): Promise<KYCFee[]> {
    try {
      return await this.findAll({
        include: [
          {
            association: 'miner',
            attributes: ['id', 'email', 'firstName', 'lastName'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      throw new Error(`Error finding all KYC fees with miner: ${error}`);
    }
  }
}