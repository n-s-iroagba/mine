'use client';


import { User } from '@/types/api';
import { apiService } from '.';
import { API_ROUTES } from './apiRoutes';
import { AuthUser } from '@/context/AuthContext';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}


export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface ResendVerificationData {
  email: string;
}

class AuthService {
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';

  // Token management
  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
      apiService.setAuthToken(token);
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.refreshTokenKey, token);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.refreshTokenKey);
    }
    return null;
  }

  // Public methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        API_ROUTES.AUTH.LOGIN, 
        credentials
      );
      
      if (response.accessToken) {
        this.setAccessToken(response.accessToken);
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }


  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        API_ROUTES.AUTH.SIGNUP_ADMIN, 
        data
      );
      
      if (response.accessToken) {
        this.setAccessToken(response.accessToken);
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

    async registerMiner(data: unknown): Promise<{data:{verificationToken:string}}> {
    try {
      const response = await apiService.post<{data:{verificationToken:string}}>(
        API_ROUTES.AUTH.SIGNUP_MINER, 
        data
      );
      

      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  async verifyEmail(data: VerifyEmailData):Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        API_ROUTES.AUTH.VERIFY_EMAIL,
        data
      );
            if (response.accessToken) {
        this.setAccessToken(response.accessToken);
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
      }
      return response;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  async resendVerificationCode(data: ResendVerificationData): Promise<{ message: string }> {
    try {
      const response = await apiService.post<{ message: string }>(
        API_ROUTES.AUTH.RESEND_VERIFICATION_CODE,
        data
      );
      return response;
    } catch (error) {
      console.error('Resend verification code error:', error);
      throw error;
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    try {
      const response = await apiService.post<{ message: string }>(
        API_ROUTES.AUTH.FORGOT_PASSWORD,
        data
      );
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response = await apiService.post<{ message: string }>(
        API_ROUTES.AUTH.RESET_PASSWORD,
        data
      );
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await apiService.get<{data:AuthUser}>(API_ROUTES.AUTH.ME);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      await apiService.post(API_ROUTES.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout API error:', error);
      // Still clear local tokens even if API call fails
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<{ accessToken: string }> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post<{ accessToken: string }>(
        API_ROUTES.AUTH.REFRESH_ACCESS_TOKEN,
        { refreshToken }
      );

      if (response.accessToken) {
        this.setAccessToken(response.accessToken);
      }

      return response;
    } catch (error) {
      console.error('Refresh token error:', error);
      this.clearTokens();
      throw error;
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem(this.tokenKey);
    }
    return false;
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      apiService.clearAuthToken();
    }
  }

  // Check if token is expired (basic implementation)
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Token expiration check error:', error);
      return true;
    }
  }

  // Check if user needs to refresh token
  shouldRefreshToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      
      // Refresh if token expires in less than 5 minutes
      return timeUntilExpiry < 300;
    } catch (error) {
      console.error('Token refresh check error:', error);
      return false;
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export the class for testing or custom instances
export { AuthService };