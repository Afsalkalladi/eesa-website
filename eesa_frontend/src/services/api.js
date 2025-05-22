import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create an axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add authorization header to requests if token exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Create a simplified API interface
const api = {
  // Get data from the API
  get: async (endpoint) => {
    try {
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  },
  
  // Post data to the API
  post: async (endpoint, data) => {
    try {
      const response = await axiosInstance.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      throw error;
    }
  },
  
  // Update data via PUT
  put: async (endpoint, data) => {
    try {
      const response = await axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating ${endpoint}:`, error);
      throw error;
    }
  },
  
  // Delete data
  delete: async (endpoint) => {
    try {
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error deleting from ${endpoint}:`, error);
      throw error;
    }
  }
};

export default api;