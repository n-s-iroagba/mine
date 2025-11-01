import { apiService } from './api';
import { API_ROUTES } from './apiRoutes';
import { Bank, CreateBankData, UpdateBankData, ApiResponse } from '../types/api';

export const bankService = {
  // Get all banks
  async getAllBanks(): Promise<Bank[]> {
    const response = await apiService.get<ApiResponse<Bank[]>>(API_ROUTES.banks.getAll);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get active banks
  async getActiveBanks(): Promise<Bank[]> {
    const response = await apiService.get<ApiResponse<Bank[]>>(API_ROUTES.banks.getAll);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get bank by ID
  async getBankById(id: number): Promise<Bank> {
    const response = await apiService.get<ApiResponse<Bank>>(API_ROUTES.banks.getById(id));
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Create bank (admin only)
  async createBank(data: CreateBankData): Promise<Bank> {
    const response = await apiService.post<ApiResponse<Bank>>(
      API_ROUTES.banks.create,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Update bank (admin only)
  async updateBank(id: number, data: UpdateBankData): Promise<Bank> {
    const response = await apiService.patch<ApiResponse<Bank>>(
      API_ROUTES.banks.update(id),
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Delete bank (admin only)
  async deleteBank(id: number): Promise<void> {
    const response = await apiService.delete<ApiResponse>(API_ROUTES.banks.delete(id));
    if (!response.success) {
      throw new Error(response.message);
    }
  },
};