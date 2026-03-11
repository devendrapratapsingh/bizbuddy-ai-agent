import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'';

class ApiService {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error: AxiosError) => {
        console.error('Response error:', error);

        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response;

          if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }

          return Promise.reject({
            message: data.message || data.error || 'Request failed',
            status: status
          });
        } else if (error.request) {
          // Request was made but no response
          return Promise.reject({
            message: 'No response from server',
            status: 0
          });
        } else {
          // Something else happened
          return Promise.reject({
            message: error.message || 'Network error',
            status: -1
          });
        }
      }
    );
  }

  async get(endpoint: string, config?: AxiosRequestConfig) {
    try {
      const response = await this.instance.get(endpoint, config);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    try {
      const response = await this.instance.post(endpoint, data, config);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    try {
      const response = await this.instance.put(endpoint, data, config);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(endpoint: string, config?: AxiosRequestConfig) {
    try {
      const response = await this.instance.delete(endpoint, config);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    try {
      const response = await this.instance.patch(endpoint, data, config);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }

  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    let statusCode = 500;

    if (error.response) {
      const { status, data } = error.response;
      statusCode = status;
      errorMessage = data.message || data.error || `HTTP ${status}`;
    } else if (error.request) {
      errorMessage = 'No response from server';
      statusCode = 0;
    } else {
      errorMessage = error.message || 'Network error';
      statusCode = -1;
    }

    return Promise.reject({
      message: errorMessage,
      status: statusCode,
      originalError: error
    });
  }

  setBaseURL(newBaseURL: string) {
    this.baseURL = newBaseURL;
    this.instance.defaults.baseURL = newBaseURL;
  }

  getBaseURL() {
    return this.baseURL;
  }

  getAxiosInstance() {
    return this.instance;
  }
}

// Singleton instance
export const apiService = new ApiService();

// Export class for custom instances
export { ApiService };