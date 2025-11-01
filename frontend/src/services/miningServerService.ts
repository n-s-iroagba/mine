import { apiService } from './api';
import { API_ROUTES } from './apiRoutes';
import { MiningServer, CreateMiningServerData, UpdateMiningServerData, ApiResponse } from '../types/api';

export const miningServerService = {
  // Get all servers
  async getAllServers(): Promise<MiningServer[]> {
    const response = await apiService.get<ApiResponse<MiningServer[]>>(API_ROUTES.miningServers.getAll);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get servers with contracts
  async getServersWithContracts(): Promise<MiningServer[]> {
    const response = await apiService.get<ApiResponse<MiningServer[]>>(
      API_ROUTES.miningServers.getWithContracts
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get server by ID
  async getServerById(id: number): Promise<MiningServer> {
    const response = await apiService.get<ApiResponse<MiningServer>>(API_ROUTES.miningServers.getById(id));
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Create server (admin only)
  async createServer(data: CreateMiningServerData): Promise<MiningServer> {
    const response = await apiService.post<ApiResponse<MiningServer>>(
      API_ROUTES.miningServers.create,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Update server (admin only)
  async updateServer(id: number, data: UpdateMiningServerData): Promise<MiningServer> {
    const response = await apiService.patch<ApiResponse<MiningServer>>(
      API_ROUTES.miningServers.update(id),
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Delete server (admin only)
  async deleteServer(id: number): Promise<void> {
    const response = await apiService.delete<ApiResponse>(API_ROUTES.miningServers.delete(id));
    if (!response.success) {
      throw new Error(response.message);
    }
  },
};