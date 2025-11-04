import { KYCRepository, UserRepository, KYCFeeRepository } from '../repositories';
import { AppError, BaseService,  ConflictError,  EmailHelper, NotFoundError, ValidationError } from './utils';

import { KYCAttributes } from '../models/KYC';
import Miner from '../models/Miner';
import User from '../models/User';

export interface CreateKYCData {
  minerId: number;
  idCard: string;
}

export interface UpdateKYCStatusData {
  status: 'pending' | 'successful' | 'failed';
  reviewedBy?: number;
  rejectionReason?: string;
}

export class KYCService extends BaseService {
  private kycRepository: KYCRepository;
  private userRepository: UserRepository;
  private kycFeeRepository: KYCFeeRepository;

  constructor() {
    super('KYCService');
    this.kycRepository = new KYCRepository();
    this.userRepository = new UserRepository();
    this.kycFeeRepository = new KYCFeeRepository();
  }

  async createKYCRequest(kycData: CreateKYCData): Promise<KYCAttributes> {
    try {
      this.logInfo('Creating KYC request', { minerId: kycData.minerId });

      this.validateRequiredFields(kycData, ['minerId', 'idCard']);

      // Validate miner exists and is a miner
      const miner = await this.userRepository.findById(kycData.minerId);
      if (!miner) {
        throw new NotFoundError('Miner');
      }

      if (miner.role !== 'miner') {
        throw new ValidationError('User is not a miner');
      }

      // Check if KYC already exists for this miner
      const existingKYC = await this.kycRepository.findByMinerId(kycData.minerId);
      if (existingKYC) {
        throw new ConflictError('KYC request already exists for this miner');
      }

      const kyc = await this.kycRepository.create({
        ...kycData,
        status: 'pending',
      });

      // Create KYC fee record
      await this.kycFeeRepository.create({
        minerId: kycData.minerId,
        amount: 10.00, // Fixed KYC fee
        isPaid: false,
      });

      this.logInfo('KYC request created successfully', { kycId: kyc.id, minerId: kycData.minerId });

      return kyc.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to create KYC request');
    }
  }

  async getAllKYCRequests(): Promise<KYCAttributes[]> {
    try {
      this.logInfo('Fetching all KYC requests');
      const kycRequests = await this.kycRepository.findAllWithMiner();
      return kycRequests.map(kyc => kyc.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch KYC requests');
    }
  }

  async getKYCRequestById(id: number): Promise<KYCAttributes> {
    try {
      this.logInfo('Fetching KYC request by ID', { kycId: id });
      const kyc = await this.kycRepository.findById(id);

      if (!kyc) {
        throw new NotFoundError('KYC request');
      }

      return kyc.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to fetch KYC request');
    }
  }

  async getKYCByMinerId(minerId: number): Promise<KYCAttributes | null> {
    try {
      this.logInfo('Fetching KYC by miner ID', { minerId });

      const miner = await this.userRepository.findById(minerId);
      if (!miner) {
        throw new NotFoundError('Miner');
      }

      const kyc = await this.kycRepository.findByMinerId(minerId);
      return kyc ? kyc.get({ plain: true }) : null;
    } catch (error) {
      this.handleError(error, 'Failed to fetch KYC by miner ID');
    }
  }

  async updateKYCStatus(id: number, statusData: UpdateKYCStatusData): Promise<KYCAttributes> {
    try {
      this.logInfo('Updating KYC status', { kycId: id, status: statusData.status });

      const kyc = await this.kycRepository.findById(id);
      if (!kyc) {
        throw new NotFoundError('KYC request');
      }

     

      const updatedKYC = await this.kycRepository.updateStatus(
        id,
        statusData.status,
        statusData.reviewedBy,
        statusData.rejectionReason
      );
      
      if (!updatedKYC) {
        throw new AppError('Failed to update KYC status');
      }

      // Send email notification for approved KYC
      if (statusData.status === 'successful') {
        const miner = await Miner.findByPk(kyc.minerId);
        const user = await User.findByPk(miner.userId)
        if (miner) {
          await EmailHelper.sendEmail({
            to: user.email,
            subject: 'KYC Verification Approved',
            html: EmailHelper.generateKYCApprovedEmail(`${miner.firstname} ${miner.lastname}`),
          });
        }
      }

      return updatedKYC!.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to update KYC status');
    }
  }

  async getKYCByStatus(status: string): Promise<KYCAttributes[]> {
    try {
      this.logInfo('Fetching KYC requests by status', { status });


      const kycRequests = await this.kycRepository.findByStatus(status as "failed" | "pending" | "successful");
      return kycRequests.map(kyc => kyc.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch KYC requests by status');
    }
  }

  async getKYCStats(): Promise<any> {
    try {
      this.logInfo('Fetching KYC statistics');

      const pendingKYC = await this.kycRepository.findByStatus('pending');
      const successfulKYC = await this.kycRepository.findByStatus('successful');
      const failedKYC = await this.kycRepository.findByStatus('failed');

      return {
        totalKYC: pendingKYC.length + successfulKYC.length + failedKYC.length,
        pendingKYC: pendingKYC.length,
        successfulKYC: successfulKYC.length,
        failedKYC: failedKYC.length,
        approvalRate: (successfulKYC.length / (successfulKYC.length + failedKYC.length)) * 100 || 0,
      };
    } catch (error) {
      this.handleError(error, 'Failed to fetch KYC statistics');
    }
  }
}