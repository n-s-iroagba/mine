import { apiService } from './api';
import { API_ROUTES } from './apiRoutes';
import { KYC, CreateKYCData, UpdateKYCStatusData, KYCStats, ApiResponse } from '../types/api';

export const kycService = {
  // Get all KYC requests (admin only)
  async getAllKYCRequests(): Promise<KYC[]> {
    const response = await apiService.get<ApiResponse<KYC[]>>(API_ROUTES.kyc.getAll);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get KYC by status (admin only)
  async getKYCByStatus(status: string): Promise<KYC[]> {
    const response = await apiService.get<ApiResponse<KYC[]>>(
      API_ROUTES.kyc.getByStatus(status)
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get KYC stats (admin only)
  async getKYCStats(): Promise<KYCStats> {
    const response = await apiService.get<ApiResponse<KYCStats>>(API_ROUTES.kyc.getStats);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get KYC by miner ID
  async getKYCByMinerId(minerId: number): Promise<KYC | null> {
    const response = await apiService.get<ApiResponse<KYC | null>>(
      API_ROUTES.kyc.getByMinerId(minerId)
    );
    if (response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get KYC by ID
  async getKYCById(id: number): Promise<KYC> {
    const response = await apiService.get<ApiResponse<KYC>>(API_ROUTES.kyc.getById(id));
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Create KYC request (admin only)
  async createKYCRequest(data: CreateKYCData): Promise<KYC> {
    const response = await apiService.post<ApiResponse<KYC>>(
      API_ROUTES.kyc.create,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Update KYC status (admin only)
  async updateKYCStatus(id: number, data: UpdateKYCStatusData): Promise<KYC> {
    const response = await apiService.patch<ApiResponse<KYC>>(
      API_ROUTES.kyc.updateStatus(id),
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },
};