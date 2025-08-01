// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// API Error interface
export interface ApiError {
  message: string;
  error?: string;
  status?: number;
  timestamp?: string;
}

// Request interceptor types - Fixed for newer axios versions
interface AuthenticatedRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // 🔧 Backend URL düzeltmesi
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    // Backend'de API routes /api prefix'li, health endpoint root'ta
    this.baseURL = isLocalhost 
      ? 'http://localhost:3001/api'
      : 'https://aware-enjoyment-production.up.railway.app/api';
    
    console.log('🌐 API Base URL (Fixed):', this.baseURL);
    console.log('🔍 Is Localhost:', isLocalhost);
    console.log('🔍 Hostname:', window.location.hostname);
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle auth errors
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        
        return response;
      },
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as AuthenticatedRequestConfig;
        
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, error.response?.data);
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh token
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshAuthToken(refreshToken);
              
              if (response.success && response.data?.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                
                // Retry original request
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                }
                
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
          
          // If refresh fails, redirect to login
          this.handleAuthFailure();
        }

        // Handle other errors
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          error: error.response?.data?.error || error.code,
          status: error.response?.status,
          timestamp: error.response?.data?.timestamp,
        };

        return Promise.reject(apiError);
      }
    );
  }

  private async refreshAuthToken(refreshToken: string): Promise<ApiResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  private handleAuthFailure() {
  // Clear tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // 🔧 Debug için redirect'i kapatıyoruz
  console.log('🚨 Auth failure detected - tokens cleared');
  console.log('Would redirect to login, but disabled for debug');
  
  // Redirect to login
  // window.location.href = '/login'; // ← Bu satırı comment edin
}

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // File upload with progress
  async uploadFile<T>(
    url: string, 
    file: File, 
    additionalData?: Record<string, any>,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional form data
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    };

    const response = await this.api.post<ApiResponse<T>>(url, formData, config);
    return response.data;
  }

  // Download file
  async downloadFile(url: string, filename?: string): Promise<void> {
    try {
      const response = await this.api.get(url, {
        responseType: 'blob',
      });

      // Create blob URL
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('File download failed:', error);
      throw error;
    }
  }

  // Get API instance for custom requests
  getAxiosInstance(): AxiosInstance {
    return this.api;
  }

  // 🔧 Health check - Root endpoint kullan
  async healthCheck(): Promise<boolean> {
    try {
      // Health check root level'da (/health), /api altında değil
      const healthUrl = this.baseURL.replace('/api', '') + '/health';
      console.log('🔍 Health check URL:', healthUrl);
      
      const response = await axios.get(healthUrl);
      return response.status === 200;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export default
export default apiService;