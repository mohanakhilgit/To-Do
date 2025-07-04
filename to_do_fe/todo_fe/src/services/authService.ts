import apiClient from './api';
import type { ApiResponse } from '../types/todo';
import type { LoginResponseData, User } from '../types/auth';

// Define the type for the registration payload
export interface RegistrationData extends Omit<User, 'id'> {
  password: string;
  password2: string;
}

/**
 * Logs in a user.
 */
export const loginUser = async (username: string, password: string): Promise<LoginResponseData> => {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>('/token/', {
    username,
    password,
  });
  return response.data.data;
};

/**
 * Registers a new user and returns their data and tokens.
 */
export const registerUser = async (data: RegistrationData): Promise<LoginResponseData> => {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>('/register/', data);
  return response.data.data;
};

/**
 * Logs out a user.
 */
export const logoutUser = async (refreshToken: string): Promise<void> => {
  await apiClient.post('/logout/', { refresh: refreshToken });
};
