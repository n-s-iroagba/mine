import { apiService } from './api';
import { API_ROUTES } from './apiRoutes';
import { MiningContract, CreateMiningContractData, UpdateMiningContractData, ApiResponse, MiningServer } from '../types/api';
interface MiningContractWithServer extends MiningContract{
  miningS:MiningServer
}
export const miningContractService = {
  // Get all contracts
  async getAllContracts(): Promise<MiningContractWithServer[]> {
    const response = await apiService.get<ApiResponse<MiningContractWithServer[]>>(API_ROUTES.miningContracts.getAll);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get contracts by server ID
  async getContractsByServerId(serverId: number): Promise<MiningContract[]> {
    const response = await apiService.get<ApiResponse<MiningContract[]>>(
      API_ROUTES.miningContracts.getByServerId(serverId)
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get contracts by period
  async getContractsByPeriod(period: string): Promise<MiningContract[]> {
    const response = await apiService.get<ApiResponse<MiningContract[]>>(
      API_ROUTES.miningContracts.getByPeriod(period)
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get contract by ID
  async getContractById(id: number): Promise<MiningContract> {
    const response = await apiService.get<ApiResponse<MiningContract>>(API_ROUTES.miningContracts.getById(id));
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Create contract (admin only)
  async createContract(data: CreateMiningContractData): Promise<MiningContract> {
    const response = await apiService.post<ApiResponse<MiningContract>>(
      API_ROUTES.miningContracts.create,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Update contract (admin only)
  async updateContract(id: number, data: Partial<MiningContract>): Promise<MiningContract> {
    const response = await apiService.patch<ApiResponse<MiningContract>>(
      API_ROUTES.miningContracts.update(id),
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Delete contract (admin only)
  async deleteContract(id: number): Promise<void> {
    const response = await apiService.delete<ApiResponse>(API_ROUTES.miningContracts.delete(id));
    if (!response.success) {
      throw new Error(response.message);
    }
  },
};