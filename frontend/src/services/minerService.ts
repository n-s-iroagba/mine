// services/minerService.ts
import { apiService } from './api';
import { API_ROUTES } from './apiRoutes';
import { ApiResponse, Miner } from '../types/api';



export const minerService = {
  // Get all miners
  async getAllMiners(): Promise<Miner[]> {
    const response = await apiService.get<ApiResponse<Miner[]>>(API_ROUTES.miners.getAll);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get miner by ID
  async getMinerById(id: number): Promise<Miner> {
    const response = await apiService.get<ApiResponse<Miner>>(API_ROUTES.miners.getById(id));
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Update miner
  async updateMiner(id: number, updateData: Partial<Miner>): Promise<Miner> {
    const response = await apiService.put<ApiResponse<Miner>>(
      API_ROUTES.miners.update(id),
      updateData
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Delete miner
  async deleteMiner(id: number): Promise<void> {
    const response = await apiService.delete<ApiResponse<void>>(API_ROUTES.miners.delete(id));
    if (!response.success) {
      throw new Error(response.message);
    }
  },


};