

import { Transaction } from '../models';
import { BaseRepository } from './BaseRepository';

export interface ITransactionRepository {
  findByMinerId(minerId: number): Promise<Transaction[]>;

  findByStatus(status: string): Promise<Transaction[]>;
  updateStatus(id: number, status: string): Promise< Transaction|null>;
  findAllWithMiner(): Promise<Transaction[]>;
}

export class TransactionRepository extends BaseRepository<Transaction> implements ITransactionRepository {
  constructor() {
    super(Transaction);
  }

  async findByMinerId(minerId: number): Promise<Transaction[]> {
    try {
      return await this.findAll({
        where: { minerId },
        include: [
          {
            association: 'miner',
            attributes: ['id', 'email', 'firstname', 'lastname'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      throw new Error(`Error finding transactions by miner ID ${minerId}: ${error}`);
    }
  }


  async findByStatus(status: string): Promise<Transaction[]> {
    try {
      return await this.findAll({
        where: { status },
        include: [
          {
            association: 'miner',
            attributes: ['id', 'email', 'firstname', 'lastname'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      throw new Error(`Error finding transactions by status ${status}: ${error}`);
    }
  }

  async updateStatus(id: number, status:"initialized" | "pending" | "successful"|'failed'): Promise< Transaction|null> {
    try {
      return await this.update(id, { status });
    } catch (error) {
      throw new Error(`Error updating status for transaction ${id}: ${error}`);
    }
  }

  async findAllWithMiner(): Promise<Transaction[]> {
    try {
      return await this.findAll({
        include: [
          {
            association: 'miner',
            attributes: ['id', 'email', 'firstname', 'lastname'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      throw new Error(`Error finding all transactions with miner: ${error}`);
    }
  }
}