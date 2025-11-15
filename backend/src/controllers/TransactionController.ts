import { Request, Response} from 'express';
import { TransactionService } from '../services';
import { BaseController } from './BaseController';
import { validateData } from '../services/utils/helpers/validation';
import { z } from 'zod';

const createTransactionSchema = z.object({
  amountInUSD: z.number().positive('Amount must be positive'),
  entityId: z.number().int().positive('Entity ID must be positive'),
  entity: z.enum(['subscription', 'kyc']),
  minerId: z.number().int().positive('Miner ID must be positive'),
});

const updateTransactionStatusSchema = z.object({
  status: z.enum(['initialized', 'pending', 'successful', 'failed']),
});

export class TransactionController extends BaseController {
  private transactionService: TransactionService;

  constructor() {
    super();
    this.transactionService = new TransactionService();
  }

  createTransaction = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const validatedData =validateData(createTransactionSchema, req.body);
      
      const transaction = await this.transactionService.createTransaction(req.body);
      
      return this.created(res, 'Transaction created successfully', transaction);
    } catch (error) {
      return this.handleError(error, res, 'Failed to create transaction');
    }
  };

  getAllTransactions = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const transactions = await this.transactionService.getAllTransactions();
      
      return this.success(res, 'Transactions retrieved successfully', transactions);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve transactions');
    }
  };

  getTransactionById = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const transactionId = parseInt(req.params.id);
      
      const transaction = await this.transactionService.getTransactionById(transactionId);
      
      return this.success(res, 'Transaction retrieved successfully', transaction);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve transaction');
    }
  };

  getTransactionsByMinerId = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const minerId = parseInt(req.params.minerId);
      const currentUserId = this.getUserId(req);
      const currentUserRole = this.getUserRole(req);
      
      // Miners can only view their own transactions
      if (currentUserRole === 'miner' && currentUserId !== minerId) {
        return this.error(res, 'Access denied', 403);
      }
      
      const transactions = await this.transactionService.getTransactionsByMinerId(minerId);
      
      return this.success(res, 'Transactions retrieved successfully', transactions);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve transactions by miner ID');
    }
  };

  updateTransactionStatus = async (req: Request, res: Response): Promise<Response | void> => {
    console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')
    try {
   
      
      const transactionId = parseInt(req.params.id);
      const validatedData =validateData(updateTransactionStatusSchema, req.body);
      
      const transaction = await this.transactionService.updateTransactionStatus(transactionId, req.body);
      
      return this.success(res, 'Transaction status updated successfully', transaction);
    } catch (error) {
      return this.handleError(error, res, 'Failed to update transaction status');
    }
  };

  getTransactionsByStatus = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const status = req.params.status;
      
      const transactions = await this.transactionService.getTransactionsByStatus(status);
      
      return this.success(res, 'Transactions retrieved successfully', transactions);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve transactions by status');
    }
  };

  getTransactionStats = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const stats = await this.transactionService.getTransactionStats();
      
      return this.success(res, 'Transaction statistics retrieved successfully', stats);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve transaction statistics');
    }
  };
}