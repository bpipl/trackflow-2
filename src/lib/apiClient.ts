import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for handling common errors
apiClient.interceptors.response.use((response) => {
  return response;
}, (error: AxiosError) => {
  // Handle 401 Unauthorized errors by redirecting to login
  if (error.response?.status === 401) {
    // Clear token from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  
  return Promise.reject(error);
});

// Generic API request function with types
export const apiRequest = async <T>(
  method: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    let response: AxiosResponse;
    
    switch (method.toLowerCase()) {
      case 'get':
        response = await apiClient.get(url, config);
        break;
      case 'post':
        response = await apiClient.post(url, data, config);
        break;
      case 'put':
        response = await apiClient.put(url, data, config);
        break;
      case 'patch':
        response = await apiClient.patch(url, data, config);
        break;
      case 'delete':
        response = await apiClient.delete(url, config);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Extract and throw the error message from the API if available
      const errorMessage = error.response?.data?.error || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

// API function helpers for specific endpoints

// Auth endpoints
export const authAPI = {
  login: (username: string, password: string) => 
    apiRequest('post', '/auth/login', { username, password }),
  
  getCurrentUser: () => 
    apiRequest('get', '/auth/me')
};

// Couriers endpoints
export const couriersAPI = {
  getAll: () => 
    apiRequest('get', '/couriers'),
  
  getById: (id: string) => 
    apiRequest('get', `/couriers/${id}`),
  
  create: (data: any) => 
    apiRequest('post', '/couriers', data),
  
  update: (id: string, data: any) => 
    apiRequest('patch', `/couriers/${id}`, data),
  
  delete: (id: string) => 
    apiRequest('delete', `/couriers/${id}`),
  
  incrementTrackingNumber: (id: string, isExpressMode: boolean = false) => 
    apiRequest('post', `/couriers/${id}/increment-tracking-number`, { isExpressMode })
};

// Customers endpoints
export const customersAPI = {
  getAll: () => 
    apiRequest('get', '/customers'),
  
  getById: (id: string) => 
    apiRequest('get', `/customers/${id}`),
  
  create: (data: any) => 
    apiRequest('post', '/customers', data),
  
  update: (id: string, data: any) => 
    apiRequest('patch', `/customers/${id}`, data),
  
  delete: (id: string) => 
    apiRequest('delete', `/customers/${id}`)
};

// Sender addresses endpoints
export const senderAddressesAPI = {
  getAll: () => 
    apiRequest('get', '/sender-addresses'),
  
  getById: (id: string) => 
    apiRequest('get', `/sender-addresses/${id}`),
  
  create: (data: any) => 
    apiRequest('post', '/sender-addresses', data),
  
  update: (id: string, data: any) => 
    apiRequest('patch', `/sender-addresses/${id}`, data),
  
  delete: (id: string) => 
    apiRequest('delete', `/sender-addresses/${id}`)
};

// Slips endpoints
export const slipsAPI = {
  getAll: () => 
    apiRequest('get', '/slips'),
  
  getById: (id: string) => 
    apiRequest('get', `/slips/${id}`),
  
  create: (data: any) => 
    apiRequest('post', '/slips', data),
  
  update: (id: string, data: any) => 
    apiRequest('patch', `/slips/${id}`, data),
  
  markAsPacked: (id: string, username: string) => 
    apiRequest('patch', `/slips/${id}/packed`, { username }),
  
  updateBoxWeights: (id: string, data: any) => 
    apiRequest('patch', `/slips/${id}/box-weights`, data)
};

// Audit logs endpoints
export const auditLogsAPI = {
  getAll: () => 
    apiRequest('get', '/audit-logs'),
  
  getById: (id: string) => 
    apiRequest('get', `/audit-logs/${id}`),
  
  create: (data: any) => 
    apiRequest('post', '/audit-logs', data),
  
  getByDateRange: (startDate: string, endDate: string) => 
    apiRequest('get', `/audit-logs/filter/date-range?startDate=${startDate}&endDate=${endDate}`),
  
  getByAction: (action: string) => 
    apiRequest('get', `/audit-logs/filter/action/${action}`)
};

export default apiClient;
