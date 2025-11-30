"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Mountain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  verifyOtpSchema,
  type VerifyOtpSchema,
} from "@/lib/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/shared/progress-steps";
import { useAuthStore } from "@/stores/auth-store";
import { useI18n } from "@/hooks/use-i18n";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { t } = useI18n();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<VerifyOtpSchema>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: email || "",
      otp: "",
    },
  });

  const otpValue = watch("otp");

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, isInitialized, router]);

  useEffect(() => {
    if (isInitialized && !email && !isAuthenticated) {
      toast.error(t("auth.verifyOtp.emailRequired"));
      router.replace("/forgot-password");
    }
  }, [email, router, isInitialized, isAuthenticated, t]);

  useEffect(() => {
    // Auto-focus first input
    otpInputRefs.current[0]?.focus();
  }, []);

  // Prefetch reset-password page for faster navigation
  useEffect(() => {
    if (email) {
      router.prefetch(`/reset-password?email=${encodeURIComponent(email)}`);
    }
  }, [email, router]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const currentOtp = otpValue || "";
    const newOtp = currentOtp.split("");
    newOtp[index] = value;
    const updatedOtp = newOtp.join("").slice(0, 6);
    setValue("otp", updatedOtp, { shouldValidate: false });

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpValue?.[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      setValue("otp", pastedData, { shouldValidate: false });
      const nextIndex = Math.min(pastedData.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  const onSubmit = async (values: VerifyOtpSchema) => {
    if (!email) {
      setError("root", {
        type: "server",
        message: t("auth.verifyOtp.emailRequired"),
      });
      return;
    }

    try {
      const response = await authService.verifyOtp({
        email: email,
        otp: values.otp,
      });
      setIsVerified(true);
      toast.success(
        response.message || t("auth.verifyOtp.otpVerifiedSuccessfully")
      );

      // Prefetch next page for faster navigation
      router.prefetch(
        `/reset-password?email=${encodeURIComponent(email)}&otp=${values.otp}`
      );

      // Auto-redirect immediately after showing success message
      setIsRedirecting(true);
      setTimeout(() => {
        router.push(
          `/reset-password?email=${encodeURIComponent(email)}&otp=${values.otp}`
        );
      }, 500);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const apiMessage =
        axiosError.response?.data?.message ??
        t("auth.verifyOtp.invalidOtpCode");
      setError("root", { type: "server", message: apiMessage });
      toast.error(apiMessage);
      // Clear OTP inputs on error
      setValue("otp", "");
      otpInputRefs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      const response = await authService.sendOtp({ email });
      toast.success(
        response.message || t("auth.verifyOtp.otpCodeResentSuccessfully")
      );
      setValue("otp", "");
      otpInputRefs.current[0]?.focus();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const apiMessage =
        axiosError.response?.data?.message ??
        t("auth.verifyOtp.failedToResendOtp");
      toast.error(apiMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
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
                  {t("auth.verifyOtp.otpVerified").split(" ")[0]}{" "}
                  <span className="block text-muted-foreground">
                    {t("auth.verifyOtp.otpVerified")
                      .split(" ")
                      .slice(1)
                      .join(" ")}
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  {t("auth.verifyOtp.yourOtpHasBeenVerified")}
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
                    {t("auth.verifyOtp.otpVerified")}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    {t("auth.verifyOtp.yourOtpHasBeenVerified")}
                  </p>
                  {isRedirecting && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        {t("auth.verifyOtp.redirectingToResetPassword")}
                      </span>
                    </div>
                  )}
                </div>
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

  if (!email) {
    return null;
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
                {t("auth.verifyOtp.verifyYourIdentity").split(" ")[0]}{" "}
                <span className="block text-muted-foreground">
                  {t("auth.verifyOtp.verifyYourIdentity")
                    .split(" ")
                    .slice(1)
                    .join(" ")}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                {t("auth.verifyOtp.enterSixDigitCodeToVerify")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Verify OTP Form */}
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
                {t("auth.verifyOtp.verifyOtpCode")}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t("auth.verifyOtp.enterSixDigitCodeSentTo")}{" "}
                <span className="font-semibold text-foreground">{email}</span>
              </p>
            </div>

            <div className="mb-6">
              <ProgressSteps currentStep={2} />
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">
                  {t("auth.verifyOtp.otpCode")}
                </Label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="h-14 w-14 text-center text-2xl font-bold border-success/20 focus:border-success focus:ring-success otp-input text-foreground"
                      style={{
                        color: "#000000",
                        WebkitTextFillColor: "#000000",
                        caretColor: "#000000",
                      }}
                      value={otpValue?.[index] || ""}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="text-sm text-red-600 text-center">
                    {errors.otp.message}
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
                disabled={!otpValue || otpValue.length !== 6}
              >
                {t("auth.verifyOtp.verifyOtp")}
              </Button>

              <div className="text-center space-y-3">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("auth.verifyOtp.resending")}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      {t("auth.verifyOtp.resendOtp")}
                    </>
                  )}
                </button>

                <div>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("auth.verifyOtp.backToLogin")}
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
