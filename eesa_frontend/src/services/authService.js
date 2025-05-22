import api from './api';
import jwtDecode from 'jwt-decode';

export const login = async (credentials) => {
  try {
    const response = await api.post('/users/login/', credentials);
    
    // Store token and user data
    const { token, ...userData } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  } catch (error) {
    throw error.response?.data?.error || 'Login failed';
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/users/register/', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Registration failed';
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Check if token is expired
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      // Token expired
      logout();
      return false;
    }
    
    return true;
  } catch (error) {
    // Invalid token
    logout();
    return false;
  }
};

export const checkPermission = (requiredRole) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Check if user has the required role
  if (requiredRole === 'admin') {
    return user.user_type === 'admin';
  } else if (requiredRole === 'faculty') {
    return user.user_type === 'admin' || user.user_type === 'faculty';
  } else if (requiredRole === 'student') {
    return user.user_type === 'student';
  }
  
  return false;
};