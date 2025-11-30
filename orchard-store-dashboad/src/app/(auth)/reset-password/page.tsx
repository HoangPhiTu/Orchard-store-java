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
  Mountain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useI18n } from "@/hooks/use-i18n";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const email = searchParams.get("email");
  const otp = searchParams.get("otp");
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { t } = useI18n();

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

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Validate OTP/reset token when page loads
  useEffect(() => {
    if (!isInitialized || isAuthenticated) return;

    const validateToken = async () => {
      if (!email || !otp) {
        toast.error(t("auth.resetPassword.invalidOrMissingEmailOtp"));
        router.replace("/forgot-password");
        return;
      }

      setIsValidating(true);
      try {
        await authService.verifyOtp({ email, otp });
        setIsTokenValid(true);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const apiMessage =
          axiosError.response?.data?.message ??
          t("auth.resetPassword.yourOtpExpiredOrInvalid");
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
        message: t("auth.resetPassword.invalidOrMissingEmailOtp"),
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
      toast.success(
        response.message || t("auth.resetPassword.passwordResetSuccessfully")
      );

      // Prefetch login page for faster navigation
      router.prefetch("/login");

      // Auto-redirect immediately after showing success message
      setIsRedirecting(true);
      setTimeout(() => {
        router.push("/login");
      }, 800);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const apiMessage =
        axiosError.response?.data?.message ??
        t("auth.resetPassword.failedToResetPassword");

      if (
        apiMessage.toLowerCase().includes("expired") ||
        apiMessage.toLowerCase().includes("invalid") ||
        apiMessage.toLowerCase().includes("otp")
      ) {
        toast.error(apiMessage);
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(email || "")}`);
        }, 1000);
      } else {
        setError("root", { type: "server", message: apiMessage });
        toast.error(apiMessage);
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen bg-background">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:bg-gradient-to-br from-accent/50 to-muted/50 lg:p-12 xl:p-16 border-r border-border">
          <div className="flex flex-col h-full justify-center">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  <Mountain className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  Orchard Admin
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                  {
                    t("auth.resetPassword.passwordResetSuccessfully").split(
                      " "
                    )[0]
                  }{" "}
                  <span className="block text-muted-foreground">
                    {t("auth.resetPassword.passwordResetSuccessfully")
                      .split(" ")
                      .slice(1)
                      .join(" ")}
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  {t("auth.resetPassword.passwordResetSuccessfully")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Success Message */}
        <div className="flex-1 flex items-center justify-center bg-background p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <Mountain className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Orchard Admin
              </span>
            </div>

            <div className="space-y-6">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    Password reset successful
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Your password has been reset successfully. Redirecting to
                    login...
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/login" className="block w-full">
                  <Button
                    variant="default"
                    className="h-11 w-full rounded-lg shadow-sm"
                  >
                    Go to login
                  </Button>
                </Link>
                <p className="text-center text-sm text-muted-foreground">
                  Redirecting to login page in 2 seconds...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!email || !otp) {
    return null;
  }

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Show error state if token is invalid
  if (!isTokenValid) {
    return (
      <div className="flex min-h-screen bg-background">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:bg-gradient-to-br from-accent/50 to-muted/50 lg:p-12 xl:p-16 border-r border-border">
          <div className="flex flex-col h-full justify-center">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  <Mountain className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  Orchard Admin
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                  {t("auth.resetPassword.otpExpired").split(" ")[0]}{" "}
                  <span className="block text-muted-foreground">
                    {t("auth.resetPassword.otpExpired")
                      .split(" ")
                      .slice(1)
                      .join(" ")}
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  {t("auth.resetPassword.yourOtpExpiredOrInvalid")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Error Message */}
        <div className="flex-1 flex items-center justify-center bg-background p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <Mountain className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Orchard Admin
              </span>
            </div>

            <div className="space-y-6">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <Lock className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {t("auth.resetPassword.otpExpired")}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    {t("auth.resetPassword.yourOtpExpiredOrInvalid")}
                  </p>
                </div>
              </div>

              {errors.root?.message && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                  <p className="text-sm font-medium text-destructive">
                    {errors.root.message}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  variant="default"
                  className="h-11 w-full rounded-lg shadow-sm"
                  onClick={() => {
                    router.push(
                      `/verify-otp?email=${encodeURIComponent(email)}`
                    );
                  }}
                >
                  {t("auth.resetPassword.requestNewOtp")}
                </Button>
                <Link href="/forgot-password" className="block w-full">
                  <Button variant="outline" className="h-11 w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("auth.forgotPassword.backToLogin")}
                  </Button>
                </Link>
                <Link href="/login" className="block w-full">
                  <Button variant="ghost" className="h-11 w-full">
                    {t("auth.verifyOtp.backToLogin")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:bg-gradient-to-br from-accent/50 to-muted/50 lg:p-12 xl:p-16 border-r border-border">
        <div className="flex flex-col h-full justify-center">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <Mountain className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Orchard Admin
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                {t("auth.resetPassword.createYourNewPassword").split(" ")[0]}{" "}
                {t("auth.resetPassword.createYourNewPassword").split(" ")[1]}{" "}
                <span className="block text-muted-foreground">
                  {t("auth.resetPassword.createYourNewPassword")
                    .split(" ")
                    .slice(2)
                    .join(" ")}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                {t("auth.resetPassword.enterNewPasswordBelow")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <Mountain className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Orchard Admin
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                {t("auth.resetPassword.createYourNewPassword")}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t("auth.resetPassword.enterNewPasswordAtLeast")}
              </p>
            </div>

            <div className="mb-6">
              <ProgressSteps currentStep={3} />
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-foreground"
                >
                  {t("auth.resetPassword.newPassword")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="h-11 pl-10 pr-10 border-border focus:border-primary focus:ring-primary"
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  {t("auth.resetPassword.confirmPassword")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="h-11 pl-10 pr-10 border-border focus:border-primary focus:ring-primary"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {errors.root?.message && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                  <p className="text-sm font-medium text-destructive">
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
                {t("auth.resetPassword.resetPassword")}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("auth.verifyOtp.backToLogin")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
