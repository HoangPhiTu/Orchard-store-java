import apiClient from './axios';
import { AuthRequestDTO, AuthResponseDTO, UserDTO, ChangePasswordDTO, ForgotPasswordDTO, ResetPasswordDTO } from '@/types/auth';

export const authApi = {
  login: async (credentials: AuthRequestDTO): Promise<AuthResponseDTO> => {
    const response = await apiClient.post<AuthResponseDTO>('/admin/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<UserDTO> => {
    const response = await apiClient.get<UserDTO>('/admin/auth/me');
    return response.data;
  },

  changePassword: async (data: ChangePasswordDTO): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>('/admin/auth/change-password', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordDTO): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/admin/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordDTO): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/admin/auth/reset-password', data);
    return response.data;
  },

  validateResetToken: async (token: string): Promise<{ valid: boolean; message?: string }> => {
    const response = await apiClient.get<{ valid: boolean; message?: string }>('/admin/auth/validate-reset-token', {
      params: { token },
    });
    return response.data;
  },

  logout: () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

