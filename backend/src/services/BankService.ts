import { BankRepository } from '../repositories';
import { AppError, BaseService, ConflictError, NotFoundError } from './utils';

import { BankAttributes } from '../models/Bank';

export interface CreateBankData {
  name: string;
  accountNumber: string;
  accountName: string;
  branch?: string;
  swiftCode?: string;
}

export interface UpdateBankData {
  name?: string;
  accountNumber?: string;
  accountName?: string;
  branch?: string;
  swiftCode?: string;
  isActive?: boolean;
}

export class BankService extends BaseService {
  private bankRepository: BankRepository;

  constructor() {
    super('BankService');
    this.bankRepository = new BankRepository();
  }

  async createBank(bankData: CreateBankData): Promise<BankAttributes> {
    try {
      this.logInfo('Creating bank', { name: bankData.name });

      this.validateRequiredFields(bankData, ['name', 'accountNumber', 'accountName']);

      // Check if account number already exists
      const existingBank = await this.bankRepository.findByAccountNumber(bankData.accountNumber);
      if (existingBank) {
        throw new ConflictError('Bank account with this number already exists');
      }

      const bank = await this.bankRepository.create(bankData);

      this.logInfo('Bank created successfully', { bankId: bank.id });

      return bank.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to create bank');
    }
  }

  async getAllBanks(): Promise<BankAttributes[]> {
    try {
      this.logInfo('Fetching all banks');
      const banks = await this.bankRepository.findAll({
        order: [['name', 'ASC']],
      });
      return banks.map(bank => bank.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch banks');
    }
  }

  async getBankById(id: number): Promise<BankAttributes> {
    try {
      this.logInfo('Fetching bank by ID', { bankId: id });
      const bank = await this.bankRepository.findById(id);

      if (!bank) {
        throw new NotFoundError('Bank');
      }

      return bank.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to fetch bank');
    }
  }

  async updateBank(id: number, updateData: UpdateBankData): Promise<BankAttributes> {
    try {
      this.logInfo('Updating bank', { bankId: id, updateData });

      const bank = await this.bankRepository.findById(id);
      if (!bank) {
        throw new NotFoundError('Bank');
      }

      const allowedFields = ['name', 'accountNumber', 'accountName', 'branch', 'swiftCode', 'isActive'];
      const sanitizedData = this.sanitizeData<UpdateBankData>(updateData, allowedFields);

      // Check if new account number already exists
      if (sanitizedData.accountNumber && sanitizedData.accountNumber !== bank.accountNumber) {
        const existingBank = await this.bankRepository.findByAccountNumber(sanitizedData.accountNumber);
        if (existingBank) {
          throw new ConflictError('Bank account with this number already exists');
        }
      }

      const updatedBank = await this.bankRepository.update(id, sanitizedData);
      
      if (!updatedBank) {
        throw new AppError('Failed to update bank');
      }

      return updatedBank!.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to update bank');
    }
  }

  async deleteBank(id: number): Promise<void> {
    try {
      this.logInfo('Deleting bank', { bankId: id });

      const bank = await this.bankRepository.findById(id);
      if (!bank) {
        throw new NotFoundError('Bank');
      }

      await this.bankRepository.deleteById(id);

      this.logInfo('Bank deleted successfully', { bankId: id });
    } catch (error) {
      this.handleError(error, 'Failed to delete bank');
    }
  }

  async getActiveBanks(): Promise<BankAttributes[]> {
    try {
      this.logInfo('Fetching active banks');
      const banks = await this.bankRepository.findAllActive();
      return banks.map(bank => bank.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch active banks');
    }
  }
}