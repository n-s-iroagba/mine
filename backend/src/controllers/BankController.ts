import { Request, Response, } from 'express';
import { BankService } from '../services';
import { BaseController } from './BaseController';


export class BankController extends BaseController {
  private bankService: BankService;

  constructor() {
    super();
    this.bankService = new BankService();
  }

  createBank = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
     
      
      const bank = await this.bankService.createBank(req.body);
      
      return this.created(res, 'Bank created successfully', bank);
    } catch (error) {
      return this.handleError(error, res, 'Failed to create bank');
    }
  };

  getAllBanks = async (_: Request, res: Response): Promise<Response | void> => {
    try {
      const banks = await this.bankService.getAllBanks();
      
      return this.success(res, 'Banks retrieved successfully', banks);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve banks');
    }
  };

  getBankById = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const bankId = parseInt(req.params.id);
      
      const bank = await this.bankService.getBankById(bankId);
      
      return this.success(res, 'Bank retrieved successfully', bank);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve bank');
    }
  };

  updateBank = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const bankId = parseInt(req.params.id);
    
      
      const bank = await this.bankService.updateBank(bankId, req.body);
      
      return this.success(res, 'Bank updated successfully', bank);
    } catch (error) {
      return this.handleError(error, res, 'Failed to update bank');
    }
  };

  deleteBank = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const bankId = parseInt(req.params.id);
      
      await this.bankService.deleteBank(bankId);
      
      return this.success(res, 'Bank deleted successfully');
    } catch (error) {
      return this.handleError(error, res, 'Failed to delete bank');
    }
  };

  getActiveBanks = async (_: Request, res: Response): Promise<Response | void> => {
    try {
      const banks = await this.bankService.getActiveBanks();
      
      return this.success(res, 'Active banks retrieved successfully', banks);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve active banks');
    }
  };
}