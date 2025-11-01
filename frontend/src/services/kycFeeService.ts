import { apiService } from './api';
import { API_ROUTES } from './apiRoutes';
import { KYCFee, CreateKYCFeeData, KYCFeeStats, ApiResponse } from '../types/api';

export const kycFeeService = {
  // Get all KYC fees (admin only)
  async getAllKYCFees(): Promise<KYCFee[]> {
    const response = await apiService.get<ApiResponse<KYCFee[]>>(API_ROUTES.kycFees.getAll);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get unpaid fees (admin only)
  async getUnpaidFees(): Promise<KYCFee[]> {
    const response = await apiService.get<ApiResponse<KYCFee[]>>(API_ROUTES.kycFees.getUnpaid);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get paid fees (admin only)
  async getPaidFees(): Promise<KYCFee[]> {
    const response = await apiService.get<ApiResponse<KYCFee[]>>(API_ROUTES.kycFees.getPaid);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get KYC fee stats (admin only)
  async getKYCFeeStats(): Promise<KYCFeeStats> {
    const response = await apiService.get<ApiResponse<KYCFeeStats>>(API_ROUTES.kycFees.getStats);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get KYC fee by miner ID
  async getKYCFeeByMinerId(minerId: number): Promise<KYCFee | null> {
    const response = await apiService.get<ApiResponse<KYCFee | null>>(
      API_ROUTES.kycFees.getByMinerId(minerId)
    );
    if (response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Get KYC fee by ID
  async getKYCFeeById(id: number): Promise<KYCFee> {
    const response = await apiService.get<ApiResponse<KYCFee>>(API_ROUTES.kycFees.getById(id));
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Create KYC fee (admin only)
  async createKYCFee(data: CreateKYCFeeData): Promise<KYCFee> {
    const response = await apiService.post<ApiResponse<KYCFee>>(
      API_ROUTES.kycFees.create,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Mark fee as paid (admin only)
  async markFeeAsPaid(id: number): Promise<KYCFee> {
    const response = await apiService.patch<ApiResponse<KYCFee>>(
      API_ROUTES.kycFees.markAsPaid(id)
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // ✅ Submit payment proof (for miner)
  async submitPaymentProof(
    minerId: number,
    paymentMethod: 'bank' | 'crypto',
    paymentDetails: string,
    paymentProof: string
  ): Promise<KYCFee> {
    const formData = new FormData();
 

    const response = await apiService.post<ApiResponse<KYCFee>>(
      API_ROUTES.kycFees.submitPaymentProof(minerId),
      {minerId,paymentMethod,paymentDetails, paymentProof}
    );

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },
};
