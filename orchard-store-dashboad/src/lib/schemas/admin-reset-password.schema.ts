import { z } from "zod";

/**
 * Schema cho Admin Reset Password
 * - newPassword: Required, min 6 ký tự, max 100 ký tự
 */
export const adminResetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu mới")
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu mới không được vượt quá 100 ký tự"),
});

export type AdminResetPasswordSchema = z.infer<typeof adminResetPasswordSchema>;
