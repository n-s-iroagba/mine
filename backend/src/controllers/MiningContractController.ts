import { Request, Response} from 'express';
import { MiningContractService } from '../services';
import { BaseController } from './BaseController';
import { validateData } from '../services/utils/helpers/validation';
import { z } from 'zod';

const createMiningContractSchema = z.object({
  miningServerId: z.number().int().positive('Mining server ID must be positive'),
  periodReturn: z.number().positive('Period return must be positive'),
  period: z.enum(['daily', 'weekly', 'fortnightly', 'monthly']),
});


export class MiningContractController extends BaseController {
  private miningContractService: MiningContractService;

  constructor() {
    super();
    this.miningContractService = new MiningContractService();
  }

  createContract = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const validatedData = validateData(createMiningContractSchema, req.body);
      
      const contract = await this.miningContractService.createContract(validatedData);
      
      return this.created(res, 'Mining contract created successfully', contract);
    } catch (error) {
      return this.handleError(error, res, 'Failed to create mining contract');
    }
  };

  getAllContracts = async (_: Request, res: Response): Promise<Response | void> => {
    try {
      const contracts = await this.miningContractService.getAllContracts();
      
      return this.success(res, 'Mining contracts retrieved successfully', contracts);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve mining contracts');
    }
  };

  getContractById = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const contractId = parseInt(req.params.id);
      
      const contract = await this.miningContractService.getContractById(contractId);
      
      return this.success(res, 'Mining contract retrieved successfully', contract);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve mining contract');
    }
  };

  updateContract = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const contractId = parseInt(req.params.id);
 
      
      const contract = await this.miningContractService.updateContract(contractId, req.body);
      
      return this.success(res, 'Mining contract updated successfully', contract);
    } catch (error) {
      return this.handleError(error, res, 'Failed to update mining contract');
    }
  };

  deleteContract = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const contractId = parseInt(req.params.id);
      
      await this.miningContractService.deleteContract(contractId);
      
      return this.success(res, 'Mining contract deleted successfully');
    } catch (error) {
      return this.handleError(error, res, 'Failed to delete mining contract');
    }
  };

  getContractsByServerId = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const serverId = parseInt(req.params.serverId);
      
      const contracts = await this.miningContractService.getContractsByServerId(serverId);
      
      return this.success(res, 'Contracts retrieved successfully', contracts);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve contracts by server ID');
    }
  };

  getContractsByPeriod = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const period = req.params.period;
      
      const contracts = await this.miningContractService.getContractsByPeriod(period);
      
      return this.success(res, 'Contracts retrieved successfully', contracts);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve contracts by period');
    }
  };
}