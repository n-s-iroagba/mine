import { Request, Response } from 'express';
import { MiningServerService } from '../services';
import { BaseController } from './BaseController';
import { validateData} from '../services/utils/helpers/validation';
import { z } from 'zod';

const createMiningServerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  hashRate: z.string().min(1, 'Hash rate is required'),
  powerConsumptionInKwH: z.string().min(1, 'Power consumption is required'),
});


export class MiningServerController extends BaseController {
  private miningServerService: MiningServerService;

  constructor() {
    super();
    this.miningServerService = new MiningServerService();
  }

  createServer = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const validatedData = validateData(createMiningServerSchema, req.body);
      
      const server = await this.miningServerService.createServer(validatedData);
      
      return this.created(res, 'Mining server created successfully', server);
    } catch (error) {
      return this.handleError(error, res, 'Failed to create mining server');
    }
  };

  getAllServers = async (_: Request, res: Response): Promise<Response | void> => {
    try {
      const servers = await this.miningServerService.getAllServers();
      
      return this.success(res, 'Mining servers retrieved successfully', servers);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve mining servers');
    }
  };

  getServerById = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const serverId = parseInt(req.params.id);
      
      const server = await this.miningServerService.getServerById(serverId);
      
      return this.success(res, 'Mining server retrieved successfully', server);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve mining server');
    }
  };

  updateServer = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const serverId = parseInt(req.params.id);
      
      
      const server = await this.miningServerService.updateServer(serverId, req.body);
      
      return this.success(res, 'Mining server updated successfully', server);
    } catch (error) {
      return this.handleError(error, res, 'Failed to update mining server');
    }
  };

  deleteServer = async (req: Request, res: Response): Promise<Response | void> => {
    try {
   
      
      const serverId = parseInt(req.params.id);
      
      await this.miningServerService.deleteServer(serverId);
      
      return this.success(res, 'Mining server deleted successfully');
    } catch (error) {
      return this.handleError(error, res, 'Failed to delete mining server');
    }
  };

  getAllServersWithContracts = async (_: Request, res: Response): Promise<Response | void> => {
    try {
      const servers = await this.miningServerService.getAllServersWithContracts();
      
      return this.success(res, 'Mining servers with contracts retrieved successfully', servers);
    } catch (error) {
      return this.handleError(error, res, 'Failed to retrieve mining servers with contracts');
    }
  };
}