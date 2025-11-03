
import { KYC } from '../models';
import { BaseRepository } from './BaseRepository';

export interface IKYCRepository {
  findByMinerId(minerId: number): Promise<KYC | null>;
  findByStatus(status: string): Promise<KYC[]>;
  updateStatus(id: number, status: string, reviewedBy?: number, rejectionReason?: string): Promise<KYC|null>;
  findAllWithMiner(): Promise<KYC[]>;
}

export class KYCRepository extends BaseRepository<KYC> implements IKYCRepository {
  constructor() {
    super(KYC);
  }

  async findByMinerId(minerId: number): Promise<KYC | null> {
    try {
      return await this.findOne(
     { minerId },
        {include: [
          {
            association: 'miner',
            attributes: ['id', 'email', 'firstname', 'lastname', 'phone'],
          },
        ],
      });
    } catch (error) {
      throw new Error(`Error finding KYC by miner ID ${minerId}: ${error}`);
    }
  }

  async findByStatus(status: "pending" | "successful" | "failed"): Promise<KYC[]> {
    try {
      return await this.findAll({
        where: { status },
        include: [
          {
            association: 'miner',

          },
          {
            association: 'reviewer',
       
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      throw new Error(`Error finding KYC by status ${status}: ${error}`);
    }
  }

  async updateStatus(
    id: number,
    status: string,
    reviewedBy?: number,
    rejectionReason?: string
  ): Promise<KYC|null> {
    try {
      const updateData: any = { status };
      
      if (status === 'successful' || status === 'failed') {
        updateData.reviewedAt = new Date();
        if (reviewedBy) {
          updateData.reviewedBy = reviewedBy;
        }
      }
      
      if (status === 'failed' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      return await this.update(id, updateData);
    } catch (error) {
      throw new Error(`Error updating KYC status for ID ${id}: ${error}`);
    }
  }

  async findAllWithMiner(): Promise<KYC[]> {
    try {
      return await this.findAll({
        include: [
          {
            association: 'miner',
            attributes: ['id', 'email', 'firstname', 'lastname', 'phone'],
          },
          {
            association: 'reviewer',
            attributes: ['id', 'email', 'firstname', 'lastname'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      throw new Error(`Error finding all KYC with miner: ${error}`);
    }
  }
}