import { Request, Response} from 'express';
import { KYCService } from '../services';
import { BaseController } from './BaseController';
import { validateData} from '../services/utils/helpers/validation';
import { z } from 'zod';

const createKYCSchema = z.object({
  minerId: z.number().int().positive('Miner ID must be positive'),
  idCard: z.string().min(1, 'ID card is required'),
});



export class KYCController extends BaseController {
  private kycService: KYCService;

  constructor() {
    super();
    this.kycService = new KYCService();
  }

  createKYCRequest = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const validatedData = validateData(createKYCSchema, req.body);
      
      const kyc = await this.kycService.createKYCRequest(validatedData);
      
      return this.created(res, 'KYC request created successfully', kyc);
    } catch (error) {
      return this.handleError(error, res, 'Failed to create KYC request');
    }
  };

  getAllKYCRequests = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const kycRequests = await this.kycService.getAllKYCRequests();
      
      return this.success(res, 'KYC requests retrieved successfully', kycRequests);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve KYC requests');
    }
  };

  getKYCRequestById = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const kycId = parseInt(req.params.id);
      
      const kyc = await this.kycService.getKYCRequestById(kycId);
      
      return this.success(res, 'KYC request retrieved successfully', kyc);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve KYC request');
    }
  };

  getKYCByMinerId = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const minerId = parseInt(req.params.minerId);
      const currentUserId = this.getUserId(req);
      const currentUserRole = this.getUserRole(req);
      
      // Miners can only view their own KYC
      if (currentUserRole === 'miner' && currentUserId !== minerId) {
        return this.error(res, 'Access denied', 403);
      }
      
      const kyc = await this.kycService.getKYCByMinerId(minerId);
      
      return this.success(res, 'KYC retrieved successfully', kyc);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve KYC by miner ID');
    }
  };

  updateKYCStatus = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const kycId = parseInt(req.params.id);
      const validatedData =  {
        ...req.body,
        reviewedBy: this.getUserId(req), // Automatically set the reviewer to the current admin
      };
      
      const kyc = await this.kycService.updateKYCStatus(kycId, validatedData);
      
      return this.success(res, 'KYC status updated successfully', kyc);
    } catch (error) {
      return this.handleError(error, res, 'Failed to update KYC status');
    }
  };

  getKYCByStatus = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const status = req.params.status;
      
      const kycRequests = await this.kycService.getKYCByStatus(status);
      
      return this.success(res, 'KYC requests retrieved successfully', kycRequests);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve KYC requests by status');
    }
  };

  getKYCStats = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const stats = await this.kycService.getKYCStats();
      
      return this.success(res, 'KYC statistics retrieved successfully', stats);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve KYC statistics');
    }
  };
}