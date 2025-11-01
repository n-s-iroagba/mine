import { Request, Response, NextFunction } from 'express';
import { AdminWalletService } from '../services';
import { BaseController } from './BaseController';
import { validateData, validatePartialData } from '../services/utils/helpers/validation';
import { z } from 'zod';

const createAdminWalletSchema = z.object({
  currencyAbbreviation: z.string().min(1, 'Currency abbreviation is required'),
  logo: z.string().min(1, 'Logo is required'),
  address: z.string().min(1, 'Address is required'),
  currency: z.string().min(1, 'Currency is required'),
});

const updateAdminWalletSchema = z.object({
  currencyAbbreviation: z.string().min(1, 'Currency abbreviation is required').optional(),
  logo: z.string().min(1, 'Logo is required').optional(),
  address: z.string().min(1, 'Address is required').optional(),
  currency: z.string().min(1, 'Currency is required').optional(),
  isActive: z.boolean().optional(),
});

export class AdminWalletController extends BaseController {
  private adminWalletService: AdminWalletService;

  constructor() {
    super();
    this.adminWalletService = new AdminWalletService();
  }

  createWallet = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
   
      
  
      
      const wallet = await this.adminWalletService.createWallet(req.body);
      
      return this.created(res, 'Admin wallet created successfully', wallet);
    } catch (error) {
      return this.handleError(error, res, 'Failed to create admin wallet');
    }
  };

  getAllWallets = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const wallets = await this.adminWalletService.getAllWallets();
      
      return this.success(res, 'Admin wallets retrieved successfully', wallets);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve admin wallets');
    }
  };

  getWalletById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const walletId = parseInt(req.params.id);
      
      const wallet = await this.adminWalletService.getWalletById(walletId);
      
      return this.success(res, 'Admin wallet retrieved successfully', wallet);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve admin wallet');
    }
  };

  updateWallet = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
   
      
      const walletId = parseInt(req.params.id);
      const validatedData =validatePartialData(updateAdminWalletSchema, req.body);
      
      const wallet = await this.adminWalletService.updateWallet(walletId, req.body);
      
      return this.success(res, 'Admin wallet updated successfully', wallet);
    } catch (error) {
      return this.handleError(error, res, 'Failed to update admin wallet');
    }
  };

  deleteWallet = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
   
      
      const walletId = parseInt(req.params.id);
      
      await this.adminWalletService.deleteWallet(walletId);
      
      return this.success(res, 'Admin wallet deleted successfully');
    } catch (error) {
      return this.handleError(error, res, 'Failed to delete admin wallet');
    }
  };

  getActiveWallets = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const wallets = await this.adminWalletService.getActiveWallets();
      
      return this.success(res, 'Active admin wallets retrieved successfully', wallets);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve active admin wallets');
    }
  };
}