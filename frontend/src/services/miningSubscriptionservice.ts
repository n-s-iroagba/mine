import { apiService } from './api';
import { API_ROUTES } from './apiRoutes';
import {

  UpdateEarningsData,
  MinerDashboard,
  ApiResponse,



} from '../types/api';
import { MiningSubscription, MiningSubscriptionWithTransactions } from '@/types/subscription';

export const miningSubscriptionService = {
  // ✅ Get all subscriptions (admin only)
  async getAllSubscriptions(): Promise<MiningSubscriptionWithTransactions[]> {
    const response = await apiService.get<ApiResponse<MiningSubscriptionWithTransactions[]>>(
      API_ROUTES.subscriptions.getAll
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message);
  },

  // ✅ Get subscriptions by miner ID
  async getSubscriptionsByMinerId(minerId: number): Promise<MiningSubscriptionWithTransactions[]> {
    const response = await apiService.get<ApiResponse<MiningSubscriptionWithTransactions[]>>(
      API_ROUTES.subscriptions.getByMinerId(minerId)
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message);
  },

  // ✅ Get miner dashboard
  async getMinerDashboard(minerId: number): Promise<MinerDashboard> {
    const response = await apiService.get<ApiResponse<MinerDashboard>>(
      API_ROUTES.subscriptions.getMinerDashboard(minerId)
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message);
  },

  // ✅ Get subscription by ID
  async getSubscriptionById(id: number): Promise<MiningSubscriptionWithTransactions> {
    const response = await apiService.get<ApiResponse<MiningSubscriptionWithTransactions>>(
      API_ROUTES.subscriptions.getById(id)
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message);
  },

  // ✅ Create new subscription (admin only)
  async createSubscription(data:any): Promise<MiningSubscriptionWithTransactions> {
    const response = await apiService.post<ApiResponse<MiningSubscriptionWithTransactions>>(
      API_ROUTES.subscriptions.create(1),
      data
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message);
  },

  // ✅ Update earnings (admin only)
  async updateEarnings(id: number, data: UpdateEarningsData): Promise<MiningSubscriptionWithTransactions> {
    const response = await apiService.patch<ApiResponse<MiningSubscriptionWithTransactions>>(
      API_ROUTES.subscriptions.updateEarnings(id),
      data
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message);
  },

  // ✅ Update subscription (toggle active or auto-update)
  async updateSubscription(id: number, data: Partial<MiningSubscription>): Promise<MiningSubscriptionWithTransactions> {
    const response = await apiService.patch<ApiResponse<MiningSubscriptionWithTransactions>>(
      API_ROUTES.subscriptions.update(id),
      data
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message);
  },


  // ✅ Delete subscription (admin only)
  async deleteSubscription(id: number): Promise<void> {
    const response = await apiService.delete<ApiResponse>(API_ROUTES.subscriptions.delete(id));
    if (!response.success) throw new Error(response.message);
  },

  // ✅ Deactivate subscription (admin only)
  async deactivateSubscription(id: number): Promise<void> {
    const response = await apiService.patch<ApiResponse>(API_ROUTES.subscriptions.deactivate(id));
    if (!response.success) throw new Error(response.message);
  },

  // ✅ Calculate earnings
  async calculateEarnings(id: number, days = 1): Promise<number> {
    const response = await apiService.get<ApiResponse<{ earnings: number }>>(
      `${API_ROUTES.subscriptions.calculateEarnings(id)}?days=${days}`
    );
    if (response.success && response.data) return response.data.earnings;
    throw new Error(response.message);
  },

  // ✅ Process daily earnings (admin only)
  async processDailyEarnings(): Promise<void> {
    const response = await apiService.post<ApiResponse>(
      API_ROUTES.subscriptions.processDailyEarnings
    );
    if (!response.success) throw new Error(response.message);
  },
};
