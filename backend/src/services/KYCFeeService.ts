import { KYCFeeRepository, UserRepository } from '../repositories';
import { AppError, BaseService, NotFoundError, ValidationError } from './utils';

import { KYCFeeAttributes } from '../models/KYCFee';

export interface CreateKYCFeeData {
  minerId: number;
  amount: number;
}

export class KYCFeeService extends BaseService {
  private kycFeeRepository: KYCFeeRepository;
  private userRepository: UserRepository;

  constructor() {
    super('KYCFeeService');
    this.kycFeeRepository = new KYCFeeRepository();
    this.userRepository = new UserRepository();
  }

  async createKYCFee(feeData: CreateKYCFeeData): Promise<KYCFeeAttributes> {
    try {
      this.logInfo('Creating KYC fee', { minerId: feeData.minerId, amount: feeData.amount });

      this.validateRequiredFields(feeData, ['minerId', 'amount']);

      // Validate miner exists and is a miner
      const miner = await this.userRepository.findById(feeData.minerId);
      if (!miner) {
        throw new NotFoundError('Miner');
      }

      if (miner.role !== 'miner') {
        throw new ValidationError('User is not a miner');
      }

      // Validate amount is positive
      if (feeData.amount <= 0) {
        throw new ValidationError('Amount must be positive');
      }

      // Check if KYC fee already exists for this miner
      const existingFee = await this.kycFeeRepository.findByMinerId(feeData.minerId);
      if (existingFee) {
        throw new ValidationError('KYC fee already exists for this miner');
      }

      const kycFee = await this.kycFeeRepository.create({
        ...feeData,
        isPaid: false,
      });

      this.logInfo('KYC fee created successfully', { feeId: kycFee.id, minerId: feeData.minerId });

      return kycFee.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to create KYC fee');
    }
  }

  async getAllKYCFees(): Promise<KYCFeeAttributes[]> {
    try {
      this.logInfo('Fetching all KYC fees');
      const kycFees = await this.kycFeeRepository.findAllWithMiner();
      return kycFees.map(fee => fee.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch KYC fees');
    }
  }

  async getKYCFeeById(id: number): Promise<KYCFeeAttributes> {
    try {
      this.logInfo('Fetching KYC fee by ID', { feeId: id });
      const kycFee = await this.kycFeeRepository.findById(id);

      if (!kycFee) {
        throw new NotFoundError('KYC fee');
      }

      return kycFee.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to fetch KYC fee');
    }
  }

  async getKYCFeeByMinerId(minerId: number): Promise<KYCFeeAttributes | null> {
    try {
      this.logInfo('Fetching KYC fee by miner ID', { minerId });

      const miner = await this.userRepository.findById(minerId);
      if (!miner) {
        throw new NotFoundError('Miner');
      }

      const kycFee = await this.kycFeeRepository.findByMinerId(minerId);
      return kycFee ? kycFee.get({ plain: true }) : null;
    } catch (error) {
      this.handleError(error, 'Failed to fetch KYC fee by miner ID');
    }
  }

  async markFeeAsPaid(id: number): Promise<KYCFeeAttributes> {
    try {
      this.logInfo('Marking KYC fee as paid', { feeId: id });

      const kycFee = await this.kycFeeRepository.findById(id);
      if (!kycFee) {
        throw new NotFoundError('KYC fee');
      }

      if (kycFee.isPaid) {
        throw new ValidationError('KYC fee is already paid');
      }

      const updatedFee = await this.kycFeeRepository.markAsPaid(id);
      
      if (!updatedFee ) {
        throw new AppError('Failed to mark KYC fee as paid');
      }


      return updatedFee!.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to mark KYC fee as paid');
    }
  }

  async getUnpaidFees(): Promise<KYCFeeAttributes[]> {
    try {
      this.logInfo('Fetching unpaid KYC fees');
      const unpaidFees = await this.kycFeeRepository.findByPaidStatus(false);
      return unpaidFees.map(fee => fee.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch unpaid KYC fees');
    }
  }

  async getPaidFees(): Promise<KYCFeeAttributes[]> {
    try {
      this.logInfo('Fetching paid KYC fees');
      const paidFees = await this.kycFeeRepository.findByPaidStatus(true);
      return paidFees.map(fee => fee.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch paid KYC fees');
    }
  }

  async getKYCFeeStats(): Promise<any> {
    try {
      this.logInfo('Fetching KYC fee statistics');

      const unpaidFees = await this.kycFeeRepository.findByPaidStatus(false);
      const paidFees = await this.kycFeeRepository.findByPaidStatus(true);

      const totalRevenue = paidFees.reduce((sum, fee) => sum + fee.amount, 0);
      const pendingRevenue = unpaidFees.reduce((sum, fee) => sum + fee.amount, 0);

      return {
        totalFees: unpaidFees.length + paidFees.length,
        unpaidFees: unpaidFees.length,
        paidFees: paidFees.length,
        totalRevenue,
        pendingRevenue,
        collectionRate: paidFees.length / (unpaidFees.length + paidFees.length) * 100 || 0,
      };
    } catch (error) {
      this.handleError(error, 'Failed to fetch KYC fee statistics');
    }
  }
}