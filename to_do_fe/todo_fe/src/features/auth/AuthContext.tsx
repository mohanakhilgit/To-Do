import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthState, User } from '../../types/auth';
import type { RegistrationData } from '../../services/authService';
import { loginUser, logoutUser, registerUser } from '../../services/authService';
import apiClient from '../../services/api';

// Add register to the context type
export interface AppAuthContextType extends AuthState {
  register: (data: RegistrationData) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AppAuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        const user: User = JSON.parse(storedUser);
        setAuthState({
          user: user,
          accessToken: token,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      setAuthState((prev) => ({ ...prev, isLoading: false, user: null, accessToken: null }));
    }
  }, []);

  const login = async (username: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user, tokens } = await loginUser(username, password);
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user)); // Store user data
      setAuthState({ user, accessToken: tokens.access, isLoading: false, error: null });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to log in.';
      setAuthState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const register = async (data: RegistrationData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user, tokens } = await registerUser(data);
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({ user, accessToken: tokens.access, isLoading: false, error: null });
    } catch (error: any) {
      const errorData = error.response?.data?.message;
      let errorMessage = 'Failed to register.';
      if (typeof errorData === 'object' && errorData !== null) {
        const firstKey = Object.keys(errorData)[0];
        errorMessage = `${firstKey}: ${errorData[firstKey][0]}`;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      setAuthState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch (error) {
        console.error("Logout API call failed", error);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
    setAuthState({ user: null, accessToken: null, isLoading: false, error: null });
  };

  const value: AppAuthContextType = {
    ...authState,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
