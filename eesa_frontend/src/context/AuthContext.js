import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (token exists in localStorage)
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Set the user state from localStorage
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Authentication error:', err);
        // Clear potentially corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/api/users/login/', credentials);
      
      // Store token and user data in localStorage
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (userData) => {
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/api/users/register/', userData);
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    // Remove token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update state
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.user_type === role;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      register, 
      isAuthenticated,
      hasRole,
      isAdmin: () => hasRole('admin'),
      isFaculty: () => hasRole('faculty'),
      isStudent: () => hasRole('student')
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);