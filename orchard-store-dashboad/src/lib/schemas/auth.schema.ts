import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  remember: z.boolean().optional().default(false),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const sendOtpSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

export type SendOtpSchema = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  otp: z
    .string()
    .min(1, "Vui lòng nhập mã OTP")
    .min(6, "Mã OTP phải có 6 chữ số")
    .max(6, "Mã OTP phải có 6 chữ số")
    .regex(/^\d+$/, "Mã OTP chỉ được chứa số"),
});

export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    otp: z
      .string()
      .min(1, "Vui lòng nhập mã OTP")
      .min(6, "Mã OTP phải có 6 chữ số")
      .max(6, "Mã OTP phải có 6 chữ số")
      .regex(/^\d+$/, "Mã OTP chỉ được chứa số"),
    newPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .max(100, "Mật khẩu không được vượt quá 100 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
