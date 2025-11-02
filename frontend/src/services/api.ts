import { API_ROUTES } from '@/services/apiRoutes';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig, AxiosRequestHeaders, RawAxiosRequestHeaders } from 'axios';


// Types for token management
interface TokenStorage {
  getAccessToken(): string | null;
  setAccessToken(token: string): void;
  clearTokens(): void;
}

// Extended InternalAxiosRequestConfig for interceptors with proper headers typing
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Refresh token response type
interface RefreshTokenResponse {
  accessToken: string;
}

// Health check response type
interface HealthCheckResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// Helper functions
const isFormData = (data: any): data is FormData => {
  return data instanceof FormData;
};

const containsFiles = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  if (data instanceof File || data instanceof FileList) return true;
  
  if (Array.isArray(data)) {
    return data.some((item: any) => item instanceof File);
  }
  
  if (typeof data === 'object') {
    return Object.values(data).some((value: any) => 
      value instanceof File || 
      value instanceof FileList ||
      (Array.isArray(value) && value.some((item: any) => item instanceof File))
    );
  }
  
  return false;
};

class ApiService {
  private client: AxiosInstance;
  private refreshClient: AxiosInstance;
  private tokenStorage: TokenStorage;

  constructor(tokenStorage?: TokenStorage) {
    // Default token storage implementation
    this.tokenStorage = tokenStorage || {
      getAccessToken: (): string | null => {
        if (typeof window !== 'undefined') {
          return localStorage.getItem('auth_token');
        }
        return null;
      },
      setAccessToken: (token: string): void => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
        }
      },
      clearTokens: (): void => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
      }
    };

    // Main API client
    this.client = axios.create({
      baseURL: process.env.NODE_ENV==='production' ?'https://mining-f8mz.onrender.com/api': 'http://localhost:5000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials:true
    });

    // Refresh token client
    this.refreshClient = axios.create({
      baseURL: process.env.NODE_ENV === 'production' 
        ? 'https://mining-f8mz.onrender.com/api' 
        : 'http://localhost:5000/api',
      timeout: 10000,
      withCredentials: true
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for main client
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        console.log('Request details:', {
          url: config.url,
          method: config.method,
          withCredentials: config.withCredentials,
          baseURL: config.baseURL
        });

        const token = this.tokenStorage.getAccessToken();
        console.log('access token is', token);
        
        if (token) {
          // Safe header assignment with proper typing
          config.headers = config.headers || {} as AxiosRequestHeaders;
          (config.headers as RawAxiosRequestHeaders).Authorization = `Bearer ${token}`;
        }

        // Set Content-Type based on payload for POST, PATCH, PUT
        if (config.method && ['post', 'patch', 'put'].includes(config.method.toLowerCase())) {
          if (config.data) {
            if (isFormData(config.data)) {
              // Let browser set Content-Type with boundary for FormData
              if (config.headers) {
                delete (config.headers as RawAxiosRequestHeaders)['Content-Type'];
              }
            } else if (containsFiles(config.data)) {
              // Convert to FormData and let browser set Content-Type
              const formData = new FormData();
              Object.entries(config.data).forEach(([key, value]) => {
                if (value instanceof File) {
                  formData.append(key, value);
                } else if (value instanceof FileList) {
                  Array.from(value).forEach((file, index) => {
                    formData.append(`${key}[${index}]`, file);
                  });
                } else if (Array.isArray(value) && value.some((item: any) => item instanceof File)) {
                  value.forEach((file: File, index: number) => {
                    formData.append(`${key}[${index}]`, file);
                  });
                } else if (value !== null && value !== undefined) {
                  formData.append(
                    key, 
                    typeof value === 'object' ? JSON.stringify(value) : String(value)
                  );
                }
              });
              config.data = formData;
              if (config.headers) {
                delete (config.headers as RawAxiosRequestHeaders)['Content-Type'];
              }
            } else {
              // Regular JSON payload
              config.headers = config.headers || {} as AxiosRequestHeaders;
              (config.headers as RawAxiosRequestHeaders)['Content-Type'] = 'application/json';
            }
          }
        }

        return config;
      },
      (error: AxiosError): Promise<never> => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for main client
    this.client.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => {
        console.log('Response interceptor - Success:', response.status, response.config.url);
        return response;
      },
      async (error: AxiosError): Promise<AxiosResponse> => {
        console.log('Response interceptor - Error triggered');

        const originalRequest = error.config as CustomInternalAxiosRequestConfig;

        // Check if this is a 401 error and we haven't already tried to refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          console.log('Attempting token refresh for 401 error');
          originalRequest._retry = true;

          try {
            console.log('Making refresh token request...');
            console.log('Refresh API config:', {
              baseURL: this.refreshClient.defaults.baseURL,
              withCredentials: this.refreshClient.defaults.withCredentials,
              url: API_ROUTES.AUTH.REFRESH_ACCESS_TOKEN
            });

            const refreshResponse = await this.refreshClient.post<RefreshTokenResponse>(
              API_ROUTES.AUTH.REFRESH_ACCESS_TOKEN, 
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );

            console.log('Refresh token response:', {
              status: refreshResponse.status,
              headers: refreshResponse.headers,
              data: refreshResponse.data
            });

            const { data } = refreshResponse;

            if (data.accessToken) {
              console.log('New access token received, retrying original request');
              // Use the async setAccessToken which will trigger user fetch
              this.tokenStorage.setAccessToken(data.accessToken);
              
              // Safe header assignment
              originalRequest.headers = originalRequest.headers || {} as AxiosRequestHeaders;
              (originalRequest.headers as RawAxiosRequestHeaders).Authorization = `Bearer ${data.accessToken}`;
              
              return this.client(originalRequest);
            } else {
              console.warn('No access token in refresh response');
              throw new Error('No access token received from refresh endpoint');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            this.tokenStorage.clearTokens();

            // Optionally redirect to login
            // if (typeof window !== 'undefined') {
            //   console.log('Redirecting to login page');
            //   window.location.href = '/auth/login';
            // }

            return Promise.reject(refreshError as AxiosError);
          }
        }

        // For all other errors or if token refresh failed
        console.log('Rejecting error:', error.response?.status);
        return Promise.reject(error);
      }
    );

    // Additional error handling interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => response,
      (error: AxiosError): Promise<never> => {
        if (error.response?.status === 401) {
          this.tokenStorage.clearTokens();
          // Redirect to login page if not already there
          // if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
          //   window.location.href = '/auth/login';
          // }
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management methods
  setAuthToken(token: string): void {
    this.tokenStorage.setAccessToken(token);
  }

  clearAuthToken(): void {
    this.tokenStorage.clearTokens();
  }

  getAuthToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  // Generic HTTP methods with proper typing
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // File upload method
  async upload<T = any>(
    url: string, 
    formData: FormData, 
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.get<HealthCheckResponse>(API_ROUTES.health);
  }

  // Method to update base URL (useful for testing)
  setBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
    this.refreshClient.defaults.baseURL = baseURL;
  }

  // Method to update timeout
  setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
    this.refreshClient.defaults.timeout = timeout;
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Also export the class for testing or custom instances
export { ApiService };