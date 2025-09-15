import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored user data on app start
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await AuthService.login(email, password);
      
      if (response.success) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        
        // Store token if available
        if (response.token) {
          await AsyncStorage.setItem('authToken', response.token);
        }
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
        return { success: true };
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed' });
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await AuthService.register(userData);
      
      if (response.success) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        
        // Store local account flag if applicable
        if (response.isLocalAccount) {
          await AsyncStorage.setItem('isLocalAccount', 'true');
        }
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
        return { 
          success: true, 
          isLocalAccount: response.isLocalAccount || false 
        };
      } else {
        const errorMessage = 'Registration failed';
        dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUser = async (userData) => {
    try {
      if (state.user?.id) {
        dispatch({ type: 'SET_LOADING', payload: true });
        const updatedUser = await AuthService.updateUserProfile(state.user.id, userData);
        
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating user:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};