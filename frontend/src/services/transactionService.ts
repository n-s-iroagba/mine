import { apiService } from './api';
import { API_ROUTES } from './apiRoutes';
import { Transaction, CreateTransactionData,  TransactionStats, ApiResponse } from '../types/api';
export interface UpdateTransactionStatusData {
  status: 'pending' | 'successful' | 'failed';
  amountInUSD: number;
}
export const transactionService = {
  // Get all transactions (admin only)
  async getAllTransactions(): Promise<Transaction[]> {
    const response = await apiService.get<ApiResponse<Transaction[]>>(API_ROUTES.transactions.getAll);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },
  async getAllTransactionsBySubId(subId:string): Promise<Transaction[]> {
    const response = await apiService.get<ApiResponse<Transaction[]>>(
      API_ROUTES.transactions.getBySubId(subId)
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },



  // Get transactions by miner ID
  async getTransactionsByMinerId(minerId: number): Promise<Transaction[]> {
    const response = await apiService.get<ApiResponse<Transaction[]>>(
      API_ROUTES.transactions.getByMinerId(minerId)
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get transactions by status (admin only)
  async getTransactionsByStatus(status: string): Promise<Transaction[]> {
    const response = await apiService.get<ApiResponse<Transaction[]>>(
      API_ROUTES.transactions.getByStatus(status)
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get transaction stats (admin only)
  async getTransactionStats(): Promise<TransactionStats> {
    const response = await apiService.get<ApiResponse<TransactionStats>>(API_ROUTES.transactions.getStats);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get transaction by ID
  async getTransactionById(id: number): Promise<Transaction> {
    const response = await apiService.get<ApiResponse<Transaction>>(API_ROUTES.transactions.getById(id));
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Create transaction (admin only)
  async createTransaction(data: CreateTransactionData): Promise<Transaction> {

    const response = await apiService.post<ApiResponse<Transaction>>(
      API_ROUTES.transactions.create,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Update transaction status (admin only)
  async updateTransactionStatus(id: number, data: UpdateTransactionStatusData): Promise<Transaction> {
    const response = await apiService.patch<ApiResponse<Transaction>>(
      API_ROUTES.transactions.updateStatus(id),
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },
};