// services/withdrawalService.ts

import { API_ROUTES } from './apiRoutes';
import { ApiResponse } from '../types/api';
import { apiService } from '.';

export interface CreateWithdrawalRequest {
  minerId: number;
  subscriptionId: number;
  type: 'deposit' | 'earnings';
  amount: number;
  currency: string;
}

export interface Withdrawal {
  id: number;
  minerId: number;
  subscriptionId: number;
  type: 'deposit' | 'earnings';
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  rejectionReason?: string;
  miner?: {
    id: number;
    firstname: string;
    lastname: string;
    country: string;
    user?: {
      id: number;
      username: string;
      email: string;
    };
  };
  subscription?: {
    id: number;
    miningContractId: number;
    amountDeposited: number;
    earnings: number;
    isActive: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export const withdrawalService = {
  // Create withdrawal request (miner)
  async createWithdrawalRequest(data: CreateWithdrawalRequest): Promise<Withdrawal> {
    const response = await apiService.post<ApiResponse<Withdrawal>>(
      API_ROUTES.withdrawals.create,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get miner withdrawals
  async getMinerWithdrawals(minerId: number): Promise<Withdrawal[]> {
    const response = await apiService.get<ApiResponse<Withdrawal[]>>(
      API_ROUTES.withdrawals.getMinerWithdrawals(minerId)
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get all withdrawals (admin)
  async getAllWithdrawals(status?: string): Promise<Withdrawal[]> {
    const url = status 
      ? API_ROUTES.withdrawals.getAllWithStatus(status)
      : API_ROUTES.withdrawals.getAll;
    
    const response = await apiService.get<ApiResponse<Withdrawal[]>>(url);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Update withdrawal status (admin)
  async updateWithdrawalStatus(
    id: number, 
    status: string, 
    rejectionReason?: string
  ): Promise<Withdrawal> {
    const response = await apiService.patch<ApiResponse<Withdrawal>>(
      API_ROUTES.withdrawals.updateStatus(id),
      { status, rejectionReason }
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get withdrawal by ID
  async getWithdrawalById(id: number): Promise<Withdrawal> {
    const response = await apiService.get<ApiResponse<Withdrawal>>(
      API_ROUTES.withdrawals.getById(id)
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Cancel withdrawal (miner)
  async cancelWithdrawal(id: number): Promise<Withdrawal> {
    const response = await apiService.post<ApiResponse<Withdrawal>>(
      API_ROUTES.withdrawals.cancel(id)
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get withdrawal stats (admin)
  async getWithdrawalStats(): Promise<any> {
    const response = await apiService.get<ApiResponse<any>>(
      API_ROUTES.withdrawals.stats
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },
};