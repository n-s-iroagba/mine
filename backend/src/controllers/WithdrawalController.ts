// controllers/WithdrawalController.ts
import { Request, Response } from 'express';
import WithdrawalService, { CreateWithdrawalData, UpdateWithdrawalStatusData } from '../services/WithdrawalService';

class WithdrawalController {
  private withdrawalService: WithdrawalService;

  constructor() {
    this.withdrawalService = new WithdrawalService();
  }

  createWithdrawal = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateWithdrawalData = {
        ...req.body,
        minerId: (req as any).user.minerId, // From auth middleware
      };

      const withdrawal = await this.withdrawalService.createWithdrawal(data);
      
      res.status(201).json({
        success: true,
        data: withdrawal,
        message: 'Withdrawal request created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  getMinerWithdrawals = async (req: Request, res: Response): Promise<void> => {
    try {
      const minerId = (req as any).user.minerId;
      const withdrawals = await this.withdrawalService.getMinerWithdrawals(minerId);
      
      res.json({
        success: true,
        data: withdrawals,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  getAllWithdrawals = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = req.query;
      const withdrawals = await this.withdrawalService.getAllWithdrawals(filters);
      
      res.json({
        success: true,
        data: withdrawals,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  getWithdrawalById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const withdrawal = await this.withdrawalService.getWithdrawalById(parseInt(id));
      
      if (!withdrawal) {
        res.status(404).json({
          success: false,
          message: 'Withdrawal not found',
        });
        return;
      }
      
      res.json({
        success: true,
        data: withdrawal,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  updateWithdrawalStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateWithdrawalStatusData = {
        ...req.body,
        processedBy: (req as any).user.id, // Admin user ID
      };

      const withdrawal = await this.withdrawalService.updateWithdrawalStatus(parseInt(id), data);
      
      if (!withdrawal) {
        res.status(404).json({
          success: false,
          message: 'Withdrawal not found',
        });
        return;
      }
      
      res.json({
        success: true,
        data: withdrawal,
        message: 'Withdrawal status updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  cancelWithdrawal = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const minerId = (req as any).user.minerId;

      const withdrawal = await this.withdrawalService.cancelWithdrawal(parseInt(id), minerId);
      
      if (!withdrawal) {
        res.status(404).json({
          success: false,
          message: 'Withdrawal not found or cannot be cancelled',
        });
        return;
      }
      
      res.json({
        success: true,
        data: withdrawal,
        message: 'Withdrawal cancelled successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  getWithdrawalStats = async (_: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.withdrawalService.getWithdrawalStats();
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
}

export default WithdrawalController;