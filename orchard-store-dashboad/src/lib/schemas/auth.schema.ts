import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Email is invalid"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional().default(false),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Email is invalid"),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const sendOtpSchema = z.object({
  email: z.string().min(1, "Email is required").email("Email is invalid"),
});

export type SendOtpSchema = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().min(1, "Email is required").email("Email is invalid"),
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Email is invalid"),
    otp: z
      .string()
      .min(6, "OTP must be 6 digits")
      .max(6, "OTP must be 6 digits")
      .regex(/^\d+$/, "OTP must contain only numbers"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
