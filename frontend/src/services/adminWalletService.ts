import { apiService } from './api';
import { API_ROUTES } from './apiRoutes';
import { AdminWallet, CreateAdminWalletData, UpdateAdminWalletData, ApiResponse } from '../types/api';

export const adminWalletService = {
  // Get all wallets


  // Get active wallets
  async getActiveWallets(): Promise<AdminWallet[]> {
    const response = await apiService.get<ApiResponse<AdminWallet[]>>(API_ROUTES.adminWallets.getActive);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get wallet by ID
  async getWalletById(id: number): Promise<AdminWallet> {
    const response = await apiService.get<ApiResponse<AdminWallet>>(API_ROUTES.adminWallets.getById(id));
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Create wallet (admin only)
  async createWallet(data: CreateAdminWalletData): Promise<AdminWallet> {
    const response = await apiService.post<ApiResponse<AdminWallet>>(
      API_ROUTES.adminWallets.create,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Update wallet (admin only)
  async updateWallet(id: number, data: UpdateAdminWalletData): Promise<AdminWallet> {
    const response = await apiService.patch<ApiResponse<AdminWallet>>(
      API_ROUTES.adminWallets.update(id),
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Delete wallet (admin only)
  async deleteWallet(id: number): Promise<void> {
    const response = await apiService.delete<ApiResponse>(API_ROUTES.adminWallets.delete(id));
    if (!response.success) {
      throw new Error(response.message);
    }
  },
};