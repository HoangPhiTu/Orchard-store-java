import { z } from "zod";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED" | "SUSPENDED";

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  status: UserStatus;
  roles: string[]; // Array of role codes (e.g., ["ADMIN", "MANAGER"])
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

// Zod Schema for User Form Validation
export const userFormSchema = z.object({
  fullName: z
    .string()
    .min(1, "Họ tên không được để trống")
    .max(255, "Họ tên không được vượt quá 255 ký tự"),
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ")
    .max(255, "Email không được vượt quá 255 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").optional(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, "Số điện thoại không hợp lệ")
    .max(20, "Số điện thoại không được vượt quá 20 ký tự")
    .optional()
    .nullable(),
  roleIds: z
    .array(z.number().positive())
    .min(1, "Phải chọn ít nhất một quyền")
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "BANNED", "SUSPENDED"]).optional(),
});

// Schema for Create User (password required)
export const createUserFormSchema = userFormSchema.extend({
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  roleIds: z.array(z.number().positive()).min(1, "Phải chọn ít nhất một quyền"),
});

// Schema for Update User (NO email, NO password - only fullName, phone, roleIds, status)
export const updateUserFormSchema = z.object({
  fullName: z
    .string()
    .min(1, "Họ tên không được để trống")
    .max(255, "Họ tên không được vượt quá 255 ký tự")
    .optional(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, "Số điện thoại không hợp lệ")
    .max(20, "Số điện thoại không được vượt quá 20 ký tự")
    .optional()
    .nullable(),
  roleIds: z
    .array(z.number().positive())
    .min(1, "Phải chọn ít nhất một quyền")
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "BANNED", "SUSPENDED"]).optional(),
});

// Form data types matching backend DTOs
export type UserFormData = z.infer<typeof userFormSchema>;
export type CreateUserFormData = z.infer<typeof createUserFormSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserFormSchema>;

// Request DTOs matching backend exactly
export interface UserCreateRequestDTO {
  fullName: string;
  email: string;
  password: string;
  phone?: string | null;
  roleIds: number[]; // Array of role IDs
  status?: UserStatus;
}

export interface UserUpdateRequestDTO {
  fullName?: string;
  phone?: string | null;
  roleIds?: number[]; // Array of role IDs
  status?: UserStatus;
  // Note: email and password cannot be updated via this endpoint
}
