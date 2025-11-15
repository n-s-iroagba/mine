// services/earningService.ts

import { Earning, EarningCreationAttributes, ApiResponse } from '../types/api';
import { apiService } from './api';
import { API_ROUTES } from './apiRoutes';

export const earningService = {
  // Get earnings by subscription ID
  async getEarningsBySubscriptionId(subscriptionId: string | number): Promise<Earning[]> {
    const response = await apiService.get<ApiResponse<Earning[]>>(
      API_ROUTES.earnings.getBySubscriptionId(subscriptionId)
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch earnings');
  },

  // Create earning (admin only)
  async createEarning(data: EarningCreationAttributes): Promise<Earning> {
    const response = await apiService.post<ApiResponse<Earning>>(
      API_ROUTES.earnings.create,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create earning');
  },

  // Update earning (admin only)
  async updateEarning(id: number, data: Partial<EarningCreationAttributes>): Promise<Earning> {
    const response = await apiService.patch<ApiResponse<Earning>>(
      API_ROUTES.earnings.update(id),
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update earning');
  },

  // Delete earning (admin only)
  async deleteEarning(id: number): Promise<void> {
    const response = await apiService.delete<ApiResponse>(
      API_ROUTES.earnings.delete(id)
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete earning');
    }
  },
};