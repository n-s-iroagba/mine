import { Request, Response} from 'express';
import { KYCFeeService } from '../services';
import { BaseController } from './BaseController';
import { validateData } from '../services/utils/helpers/validation';
import { z } from 'zod';

const createKYCFeeSchema = z.object({
  minerId: z.number().int().positive('Miner ID must be positive'),
  amount: z.number().positive('Amount must be positive'),
});

export class KYCFeeController extends BaseController {
  private kycFeeService: KYCFeeService;

  constructor() {
    super();
    this.kycFeeService = new KYCFeeService();
  }

  createKYCFee = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const validatedData =validateData(createKYCFeeSchema, req.body);
      
      const kycFee = await this.kycFeeService.createKYCFee(req.body);
      
      return this.created(res, 'KYC fee created successfully', kycFee);
    } catch (error) {
      return this.handleError(error, res, 'Failed to create KYC fee');
    }
  };

  getAllKYCFees = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const kycFees = await this.kycFeeService.getAllKYCFees();
      
      return this.success(res, 'KYC fees retrieved successfully', kycFees);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve KYC fees');
    }
  };

  getKYCFeeById = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const feeId = parseInt(req.params.id);
      
      const kycFee = await this.kycFeeService.getKYCFeeById(feeId);
      
      return this.success(res, 'KYC fee retrieved successfully', kycFee);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve KYC fee');
    }
  };

  getKYCFeeByMinerId = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const minerId = parseInt(req.params.minerId);
      const currentUserId = this.getUserId(req);
      const currentUserRole = this.getUserRole(req);
      
      // Miners can only view their own KYC fee
      if (currentUserRole === 'miner' && currentUserId !== minerId) {
        return this.error(res, 'Access denied', 403);
      }
      
      const kycFee = await this.kycFeeService.getKYCFeeByMinerId(minerId);
      
      return this.success(res, 'KYC fee retrieved successfully', kycFee);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve KYC fee by miner ID');
    }
  };

  markFeeAsPaid = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const feeId = parseInt(req.params.id);
      
      const kycFee = await this.kycFeeService.markFeeAsPaid(feeId);
      
      return this.success(res, 'KYC fee marked as paid successfully', kycFee);
    } catch (error) {
      return this.handleError(error, res, 'Failed to mark KYC fee as paid');
    }
  };

  getUnpaidFees = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const unpaidFees = await this.kycFeeService.getUnpaidFees();
      
      return this.success(res, 'Unpaid KYC fees retrieved successfully', unpaidFees);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve unpaid KYC fees');
    }
  };

  getPaidFees = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const paidFees = await this.kycFeeService.getPaidFees();
      
      return this.success(res, 'Paid KYC fees retrieved successfully', paidFees);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve paid KYC fees');
    }
  };

  getKYCFeeStats = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const stats = await this.kycFeeService.getKYCFeeStats();
      
      return this.success(res, 'KYC fee statistics retrieved successfully', stats);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve KYC fee statistics');
    }
  };
}