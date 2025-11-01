import { MiningServerRepository } from '../repositories';
import { AppError, BaseService, ConflictError, NotFoundError } from './utils';
import { MiningServerAttributes } from '../models/MiningServer';

export interface CreateMiningServerData {
  name: string;
  hashRate: string;
  powerConsumptionInKwH: string;
}

export interface UpdateMiningServerData {
  name?: string;
  hashRate?: string;
  powerConsumptionInKwH?: string;
  isActive?: boolean;
}

export class MiningServerService extends BaseService {
  private miningServerRepository: MiningServerRepository;

  constructor() {
    super('MiningServerService');
    this.miningServerRepository = new MiningServerRepository();
  }

  async createServer(serverData: CreateMiningServerData): Promise<MiningServerAttributes> {
    try {
      this.logInfo('Creating mining server', { name: serverData.name });

      this.validateRequiredFields(serverData, ['name', 'hashRate', 'powerConsumptionInKwH']);

      // Check if server name already exists
      const existingServer = await this.miningServerRepository.findByName(serverData.name);
      if (existingServer) {
        throw new ConflictError('Mining server with this name already exists');
      }

      const server = await this.miningServerRepository.create(serverData);

      this.logInfo('Mining server created successfully', { serverId: server.id });

      return server.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to create mining server');
    }
  }

  async getAllServers(): Promise<MiningServerAttributes[]> {
    try {
      this.logInfo('Fetching all mining servers');
      const servers = await this.miningServerRepository.findAll({
        order: [['name', 'ASC']],
      });
      return servers.map(server => server.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch mining servers');
    }
  }

  async getServerById(id: number): Promise<MiningServerAttributes> {
    try {
      this.logInfo('Fetching mining server by ID', { serverId: id });
      const server = await this.miningServerRepository.findById(id);

      if (!server) {
        throw new NotFoundError('Mining server');
      }

      return server.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to fetch mining server');
    }
  }

  async updateServer(id: number, updateData: UpdateMiningServerData): Promise<MiningServerAttributes> {
    try {
      this.logInfo('Updating mining server', { serverId: id, updateData });

      const server = await this.miningServerRepository.findById(id);
      if (!server) {
        throw new NotFoundError('Mining server');
      }

      const allowedFields = ['name', 'hashRate', 'powerConsumptionInKwH', 'isActive'];
      const sanitizedData = this.sanitizeData<UpdateMiningServerData>(updateData, allowedFields);

      // Check if new name already exists
      if (sanitizedData.name && sanitizedData.name !== server.name) {
        const existingServer = await this.miningServerRepository.findByName(sanitizedData.name);
        if (existingServer) {
          throw new ConflictError('Mining server with this name already exists');
        }
      }

      const updatedServer = await this.miningServerRepository.update(id, sanitizedData);
      
      if (!updatedServer) {
        throw new AppError('Failed to update mining server');
      }

      return updatedServer!.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to update mining server');
    }
  }

  async deleteServer(id: number): Promise<void> {
    try {
      this.logInfo('Deleting mining server', { serverId: id });

      const server = await this.miningServerRepository.findById(id);
      if (!server) {
        throw new NotFoundError('Mining server');
      }

      await this.miningServerRepository.deleteById(id);

      this.logInfo('Mining server deleted successfully', { serverId: id });
    } catch (error) {
      this.handleError(error, 'Failed to delete mining server');
    }
  }

  async getAllServersWithContracts(): Promise<MiningServerAttributes[]> {
    try {
      this.logInfo('Fetching all mining servers with contracts');
      const servers = await this.miningServerRepository.findAllWithContracts();
      return servers.map(server => server.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch mining servers with contracts');
    }
  }
}