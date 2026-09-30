import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        error: null 
      };
    case 'AUTH_FAIL':
      return { ...state, loading: false, error: action.payload, user: null, token: null };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false, error: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set axios defaults
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'AUTH_FAIL', payload: 'No token found' });
        return;
      }

      try {
        // Set token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token by making a request (you can create a verify endpoint)
        // For now, we'll just assume the token is valid if it exists
        // In a real app, you'd verify the token with the server
        
        // Parse user info from token (basic implementation)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = { 
          id: payload.userId, 
          userType: payload.userType,
          // You might want to fetch full user details from server
        };
        
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'AUTH_FAIL', payload: 'Invalid token' });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password, userType) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
        userType
      });

      const { token, user } = response.data;
      
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      toast.success('Login successful!');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData, userType) => {
    dispatch({ type: 'AUTH_START' });
    try {
      let config = {};
      if (userData instanceof FormData) {
        // Let browser set Content-Type for FormData
        config.headers = {};
      } else {
        config.headers = { 'Content-Type': 'application/json' };
      }
      const response = await axios.post(`/api/auth/register/${userType}`, userData, config);
      const { token, user } = response.data;
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}