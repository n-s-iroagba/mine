import { apiService } from './api';
import { API_ROUTES } from './apiRoutes';
import { SendEmailData, SendBulkEmailData, SendGroupEmailData, BulkEmailResult, ApiResponse } from '../types/api';

export const emailService = {
  // Send email (admin only)
  async sendEmail(data: SendEmailData): Promise<boolean> {
    const response = await apiService.post<ApiResponse<{ success: boolean }>>(
      API_ROUTES.email.send,
      data
    );
    if (response.success && response.data) {
      return response.data.success;
    }
    throw new Error(response.message);
  },

  // Send bulk email (admin only)
  async sendBulkEmail(data: SendBulkEmailData): Promise<BulkEmailResult> {
    const response = await apiService.post<ApiResponse<BulkEmailResult>>(
      API_ROUTES.email.sendBulk,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Send email to all miners (admin only)
  async sendEmailToAllMiners(data: SendGroupEmailData): Promise<BulkEmailResult> {
    const response = await apiService.post<ApiResponse<BulkEmailResult>>(
      API_ROUTES.email.sendToMiners,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },

  // Send email to all admins (admin only)
  async sendEmailToAllAdmins(data: SendGroupEmailData): Promise<BulkEmailResult> {
    const response = await apiService.post<ApiResponse<BulkEmailResult>>(
      API_ROUTES.email.sendToAdmins,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message);
  },
};