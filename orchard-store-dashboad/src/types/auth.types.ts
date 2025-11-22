export interface User {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  authorities?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  message: string;
  expiresIn?: number; // seconds
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  resetToken: string; // Token để dùng cho reset password
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

// Role types for RBAC
export interface Role {
  id: number;
  roleCode: string; // e.g., "ADMIN", "MANAGER", "STAFF"
  roleName: string; // e.g., "Administrator", "Manager", "Staff"
  description?: string | null;
  hierarchyLevel?: number; // Higher = more permissions (1-10)
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}
