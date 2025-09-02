import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Types for API responses
interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    // Get base URL from environment variable, fallback to localhost
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Log outgoing requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        }
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError): void {
    const endpoint = error.config?.url || 'Unknown endpoint';
    const method = error.config?.method?.toUpperCase() || 'Unknown method';
    
    console.error(`❌ API Request Failed: ${method} ${endpoint}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        params: error.config?.params,
      },
      fullError: error,
    });
  }

  // Generic request method
  private async request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.request<ApiResponse<T>>(config);
      // Handle both wrapped and unwrapped responses
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data.data as T;
      }
      return response.data as T;
    } catch (error) {
      throw this.transformError(error as AxiosError);
    }
  }

  private transformError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as Record<string, unknown>;
      return {
        message: (responseData?.message as string) || error.message,
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - no response received',
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unknown error occurred',
      };
    }
  }

  // HTTP Methods
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // File upload method
  async uploadFile<T = unknown>(
    url: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, unknown>,
    onUploadProgress?: (progressEvent: unknown) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    // Add additional data to form data
    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        const value = additionalData[key];
        if (typeof value === 'string' || value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      });
    }

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }

  // Method to set auth token
  setAuthToken(token: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Method to remove auth token
  removeAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  // Method to set custom headers
  setHeaders(headers: Record<string, string>): void {
    Object.keys(headers).forEach((key) => {
      this.axiosInstance.defaults.headers.common[key] = headers[key];
    });
  }

  // Method to get current base URL
  getBaseURL(): string {
    return this.axiosInstance.defaults.baseURL || '';
  }

  // Method to update base URL
  setBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
  }
}

// Create and export a singleton instance
const api = new ApiService();

export default api;
export { ApiService, type ApiResponse, type ApiError };
