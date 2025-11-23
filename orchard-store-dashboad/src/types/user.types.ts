import {
  createUserSchema,
  updateUserSchema,
  type CreateUserSchema,
  type UpdateUserSchema,
} from "@/lib/schemas/user.schema";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED" | "SUSPENDED";

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  status: UserStatus;
  roles: string[]; // Array of role codes (e.g., ["ADMIN", "MANAGER"])
  avatarUrl?: string | null; // URL ảnh avatar
  createdAt: string; // ISO date string
  lastLogin?: string | null; // ISO date string (optional)
}

export interface UserFilters {
  keyword?: string;
  page?: number;
  size?: number;
  status?: UserStatus; // Filter by status
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Re-export schemas from user.schema.ts for backward compatibility
// userFormSchema: Dùng cho form cần tất cả fields (có thể dùng createUserSchema)
export const userFormSchema = createUserSchema;
export const createUserFormSchema = createUserSchema;
export const updateUserFormSchema = updateUserSchema;

// Form data types matching backend DTOs
export type UserFormData = CreateUserSchema; // Use CreateUserSchema as base
export type CreateUserFormData = CreateUserSchema;
export type UpdateUserFormData = UpdateUserSchema;

// Request DTOs matching backend exactly
export interface UserCreateRequestDTO {
  fullName: string;
  email: string;
  password: string;
  phone?: string | null;
  roleIds: number[]; // Array of role IDs
  status?: UserStatus;
  avatarUrl?: string | null; // URL ảnh avatar
}

export interface UserUpdateRequestDTO {
  fullName?: string;
  phone?: string | null;
  roleIds?: number[]; // Array of role IDs
  status?: UserStatus;
  avatarUrl?: string | null; // URL ảnh avatar
  // Note: email and password cannot be updated via this endpoint
}
