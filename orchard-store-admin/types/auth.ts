export interface AuthRequestDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponseDTO {
  token: string;
  type: string;
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserDTO {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
}
