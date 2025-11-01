import { AdminWalletRepository } from '../repositories';
import { AppError, BaseService, ConflictError, CryptoHelper, NotFoundError, ValidationError} from './utils';

import { AdminWalletAttributes } from '../models/AdminWallet';

export interface CreateAdminWalletData {
  currencyAbbreviation: string;
  logo: string;
  address: string;
  currency: string;
}

export interface UpdateAdminWalletData {
  currencyAbbreviation?: string;
  logo?: string;
  address?: string;
  currency?: string;
  isActive?: boolean;
}

export class AdminWalletService extends BaseService {
  private adminWalletRepository: AdminWalletRepository;

  constructor() {
    super('AdminWalletService');
    this.adminWalletRepository = new AdminWalletRepository();
  }

  async createWallet(walletData: CreateAdminWalletData): Promise<AdminWalletAttributes> {
    try {
      this.logInfo('Creating admin wallet', { currency: walletData.currency });

      this.validateRequiredFields(walletData, ['currencyAbbreviation', 'logo', 'address', 'currency']);

   
      // Validate crypto address
      if (!CryptoHelper.validateCryptoAddress(walletData.address, walletData.currency)) {
        throw new ValidationError('Invalid cryptocurrency address');
      }

      // Check if address already exists
      const existingWallet = await this.adminWalletRepository.findByAddress(walletData.address);
      if (existingWallet) {
        throw new ConflictError('Wallet address already exists');
      }

      const wallet = await this.adminWalletRepository.create(walletData);

      this.logInfo('Admin wallet created successfully', { walletId: wallet.id });

      return wallet.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to create admin wallet');
    }
  }

  async getAllWallets(): Promise<AdminWalletAttributes[]> {
    try {
      this.logInfo('Fetching all admin wallets');
      const wallets = await this.adminWalletRepository.findAll({
        order: [['currency', 'ASC']],
      });
      return wallets.map(wallet => wallet.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch admin wallets');
    }
  }

  async getWalletById(id: number): Promise<AdminWalletAttributes> {
    try {
      this.logInfo('Fetching admin wallet by ID', { walletId: id });
      const wallet = await this.adminWalletRepository.findById(id);

      if (!wallet) {
        throw new NotFoundError('Admin wallet');
      }

      return wallet.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to fetch admin wallet');
    }
  }

  async updateWallet(id: number, updateData: UpdateAdminWalletData): Promise<AdminWalletAttributes> {
    try {
      this.logInfo('Updating admin wallet', { walletId: id, updateData });

      const wallet = await this.adminWalletRepository.findById(id);
      if (!wallet) {
        throw new NotFoundError('Admin wallet');
      }

      const allowedFields = ['currencyAbbreviation', 'logo', 'address', 'currency', 'isActive'];
      const sanitizedData = this.sanitizeData<UpdateAdminWalletData>(updateData, allowedFields);

     

      // Validate crypto address if provided
      if (sanitizedData.address) {
        const currency = sanitizedData.currency || wallet.currency;
        if (!CryptoHelper.validateCryptoAddress(sanitizedData.address, currency)) {
          throw new ValidationError('Invalid cryptocurrency address');
        }

        // Check if new address already exists
        const existingWallet = await this.adminWalletRepository.findByAddress(sanitizedData.address);
        if (existingWallet && existingWallet.id !== id) {
          throw new ConflictError('Wallet address already exists');
        }
      }

      const updatedWallet = await this.adminWalletRepository.update(id, sanitizedData);
      
      if (!updatedWallet) {
        throw new AppError('Failed to update admin wallet');
      }

    
      return updatedWallet!.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to update admin wallet');
    }
  }

  async deleteWallet(id: number): Promise<void> {
    try {
      this.logInfo('Deleting admin wallet', { walletId: id });

      const wallet = await this.adminWalletRepository.findById(id);
      if (!wallet) {
        throw new NotFoundError('Admin wallet');
      }

      await this.adminWalletRepository.deleteById(id);

      this.logInfo('Admin wallet deleted successfully', { walletId: id });
    } catch (error) {
      this.handleError(error, 'Failed to delete admin wallet');
    }
  }

  async getActiveWallets(): Promise<AdminWalletAttributes[]> {
    try {
      this.logInfo('Fetching active admin wallets');
      const wallets = await this.adminWalletRepository.findAllActive();
      return wallets.map(wallet => wallet.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch active admin wallets');
    }
  }

  async getWalletByCurrency(currency: string): Promise<AdminWalletAttributes | null> {
    try {
      this.logInfo('Fetching admin wallet by currency', { currency });
      const wallet = await this.adminWalletRepository.findByCurrency(currency);
      return wallet ? wallet.get({ plain: true }) : null;
    } catch (error) {
      this.handleError(error, 'Failed to fetch admin wallet by currency');
    }
  }
}