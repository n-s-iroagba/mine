
import { AdminWallet } from '../models';
import { BaseRepository } from './BaseRepository';

export interface IAdminWalletRepository {
  findByCurrency(currency: string): Promise<AdminWallet | null>;
  findByAddress(address: string): Promise<AdminWallet | null>;
  findAllActive(): Promise<AdminWallet[]>;
}

export class AdminWalletRepository extends BaseRepository<AdminWallet> implements IAdminWalletRepository {
  constructor() {
    super(AdminWallet);
  }

  async findByCurrency(currency: string): Promise<AdminWallet | null> {
    try {
      return await this.findOne({
         currency ,
      });
    } catch (error) {
      throw new Error(`Error finding wallet by currency ${currency}: ${error}`);
    }
  }

  async findByAddress(address: string): Promise<AdminWallet | null> {
    try {
      return await this.findOne(
     { address },
      );
    } catch (error) {
      throw new Error(`Error finding wallet by address ${address}: ${error}`);
    }
  }

  async findAllActive(): Promise<AdminWallet[]> {
    try {
      return await this.findAll({
        where: { isActive: true },
        order: [['currency', 'ASC']],
      });
    } catch (error) {
      throw new Error(`Error finding active wallets: ${error}`);
    }
  }
}