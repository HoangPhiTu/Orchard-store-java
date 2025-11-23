"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/lib/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/shared/progress-steps";
import { useAuthStore } from "@/stores/auth-store";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const email = searchParams.get("email");
  const otp = searchParams.get("otp");
  const { isAuthenticated, isInitialized } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email || "",
      otp: otp || "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Redirect if user is already authenticated (unless they're in the middle of reset flow)
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      // If user is already authenticated, they shouldn't be on reset password page
      // Redirect immediately to dashboard (use replace to prevent back navigation)
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Validate OTP/reset token when page loads
  useEffect(() => {
    // Don't validate if user is already authenticated
    if (!isInitialized || isAuthenticated) return;

    const validateToken = async () => {
      if (!email || !otp) {
        toast.error("Invalid or missing email/OTP");
        router.replace("/forgot-password");
        return;
      }

      setIsValidating(true);
      try {
        // Verify OTP to check if it's still valid
        await authService.verifyOtp({ email, otp });
        setIsTokenValid(true);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const apiMessage =
          axiosError.response?.data?.message ??
          "OTP code is invalid or expired. Please request a new one.";
        setIsTokenValid(false);
        setError("root", { type: "server", message: apiMessage });
        toast.error(apiMessage);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [email, otp, router, setError, isInitialized, isAuthenticated]);

  const onSubmit = async (values: ResetPasswordSchema) => {
    if (!email || !otp) {
      setError("root", {
        type: "server",
        message: "Invalid or missing email/OTP",
      });
      return;
    }

    try {
      const response = await authService.resetPassword({
        email: email,
        otp: otp,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      setIsSuccess(true);
      toast.success(response.message || "Password reset successfully");

      // Auto-redirect to login after 2 seconds
      // Use replace to prevent back navigation to this page
      setTimeout(() => {
        router.replace("/login");
        // Clear browser history to prevent back navigation to reset-password
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", "/login");
        }
      }, 2000);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const apiMessage =
        axiosError.response?.data?.message ??
        "Failed to reset password. Please try again.";

      // If OTP expired, redirect to verify OTP page
      if (
        apiMessage.toLowerCase().includes("expired") ||
        apiMessage.toLowerCase().includes("invalid") ||
        apiMessage.toLowerCase().includes("otp")
      ) {
        toast.error(apiMessage);
        setTimeout(() => {
          router.replace(
            `/verify-otp?email=${encodeURIComponent(email || "")}`
          );
        }, 2000);
      } else {
        setError("root", { type: "server", message: apiMessage });
        toast.error(apiMessage);
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="relative min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-slate-200/30 blur-3xl" />
          <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-slate-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-12">
          <Card className="w-full border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="space-y-4 pb-6">
              <ProgressSteps currentStep={3} />
              <div className="space-y-2 pt-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                  <CheckCircle2 className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-2xl">
                  Password reset successful
                </CardTitle>
                <CardDescription>
                  Your password has been reset successfully. Redirecting to
                  login...
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/login" className="block w-full">
                <Button variant="default" className="w-full">
                  Go to login
                </Button>
              </Link>
              <p className="text-center text-sm text-slate-500">
                Redirecting to login page in 2 seconds...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <div className="relative min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-slate-200/30 blur-3xl" />
          <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-slate-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-12">
          <Card className="w-full border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-4 text-sm text-slate-600">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!email || !otp) {
    return null; // Will redirect in useEffect
  }

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div className="relative min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-slate-200/30 blur-3xl" />
          <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-slate-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-12">
          <Card className="w-full border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-4 text-sm text-slate-600">Validating OTP...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state if token is invalid
  if (!isTokenValid) {
    return (
      <div className="relative min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-slate-200/30 blur-3xl" />
          <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-slate-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-12">
          <Card className="w-full border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="space-y-4 pb-6">
              <ProgressSteps currentStep={2} />
              <div className="space-y-2 pt-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <Lock className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl">OTP Expired</CardTitle>
                <CardDescription>
                  Your OTP code has expired or is invalid. Please request a new
                  one to continue.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.root?.message && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm font-medium text-red-800">
                    {errors.root.message}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    router.push(
                      `/verify-otp?email=${encodeURIComponent(email)}`
                    );
                  }}
                >
                  Request New OTP
                </Button>
                <Link href="/forgot-password" className="w-full">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to forgot password
                  </Button>
                </Link>
                <Link href="/login" className="w-full">
                  <Button variant="ghost" className="w-full">
                    Back to login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-12">
        <Card className="w-full border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-4 pb-6">
            <ProgressSteps currentStep={3} />
            <div className="space-y-1 pt-4">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Create new password
              </CardTitle>
              <CardDescription>
                Enter your new password below. Make sure it&apos;s at least 6
                characters long.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="pl-10 pr-10"
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-500">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="pl-10 pr-10"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {errors.root?.message && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm font-medium text-red-800">
                    {errors.root.message}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="default"
                className="h-11 w-full rounded-lg shadow-sm"
                isLoading={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>

              <div className="text-center space-y-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
