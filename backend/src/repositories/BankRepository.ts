
import { Bank } from '../models';
import { BaseRepository } from './BaseRepository';

export interface IBankRepository {
  findByAccountNumber(accountNumber: string): Promise<Bank | null>;
  findByName(name: string): Promise<Bank | null>;
  findAllActive(): Promise<Bank[]>;
}

export class BankRepository extends BaseRepository<Bank> implements IBankRepository {
  constructor() {
    super(Bank);
  }

  async findByAccountNumber(accountNumber: string): Promise<Bank | null> {
    try {
      return await this.findOne({
       accountNumber 
      });
    } catch (error) {
      throw new Error(`Error finding bank by account number ${accountNumber}: ${error}`);
    }
  }

  async findByName(name: string): Promise<Bank | null> {
    try {
      return await this.findOne({
       name 
      });
    } catch (error) {
      throw new Error(`Error finding bank by name ${name}: ${error}`);
    }
  }

  async findAllActive(): Promise<Bank[]> {
    try {
      return await this.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']],
      });
    } catch (error) {
      throw new Error(`Error finding active banks: ${error}`);
    }
  }
}