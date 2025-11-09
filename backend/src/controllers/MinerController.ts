// controllers/MinerController.ts
import { Request, Response } from 'express';
import { MinerService } from '../services/MinerService';
import { AppError } from '../services/utils';

export class MinerController {
  private minerService: MinerService;

  constructor() {
    this.minerService = new MinerService();
  }

  getAllMiners = async (req: Request, res: Response): Promise<void> => {
    try {
      const miners = await this.minerService.getAllMiners();
      res.json({
        success: true,
        data: miners,
        message: 'Miners fetched successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode || 500).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  getMinerById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const miner = await this.minerService.getMinerById(parseInt(id));
      res.json({
        success: true,
        data: miner,
        message: 'Miner fetched successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode || 500).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  updateMiner = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const miner = await this.minerService.updateMiner(parseInt(id), req.body);
      res.json({
        success: true,
        data: miner,
        message: 'Miner updated successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode || 500).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  deleteMiner = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.minerService.deleteMiner(parseInt(id));
      res.json({
        success: true,
        message: 'Miner deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode || 500).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };
}