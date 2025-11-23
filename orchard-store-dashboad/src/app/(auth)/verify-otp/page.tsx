"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
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
  verifyOtpSchema,
  type VerifyOtpSchema,
} from "@/lib/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/shared/progress-steps";
import { useAuthStore } from "@/stores/auth-store";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { isAuthenticated, isInitialized } = useAuthStore();

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
      toast.error("Email is required");
      router.replace("/forgot-password");
    }
  }, [email, router, isInitialized, isAuthenticated]);

  useEffect(() => {
    // Auto-focus first input
    otpInputRefs.current[0]?.focus();
  }, []);

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
      setError("root", { type: "server", message: "Email is required" });
      return;
    }

    try {
      const response = await authService.verifyOtp({
        email: email,
        otp: values.otp,
      });
      setIsVerified(true);
      toast.success(response.message || "OTP verified successfully");

      // Auto-redirect to reset password page with email and OTP
      // Use replace to prevent back navigation to verify-otp page
      setTimeout(() => {
        router.replace(
          `/reset-password?email=${encodeURIComponent(email)}&otp=${values.otp}`
        );
      }, 1000);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const apiMessage =
        axiosError.response?.data?.message ??
        "Invalid OTP code. Please try again.";
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
      toast.success(response.message || "OTP code resent successfully");
      setValue("otp", "");
      otpInputRefs.current[0]?.focus();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const apiMessage =
        axiosError.response?.data?.message ??
        "Failed to resend OTP. Please try again.";
      toast.error(apiMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
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
                <CardTitle className="text-2xl">OTP Verified</CardTitle>
                <CardDescription>
                  Your OTP has been verified successfully. Redirecting to reset
                  password...
                </CardDescription>
              </div>
            </CardHeader>
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

  if (!email) {
    return null;
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
            <ProgressSteps currentStep={2} />
            <div className="space-y-1 pt-4">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Verify OTP Code
              </CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to
                <br />
                <span className="font-semibold text-indigo-600">{email}</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700">
                  OTP Code
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
                      className="h-14 w-14 text-center text-2xl font-bold border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
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
                disabled={!otpValue || otpValue.length !== 6}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <div className="text-center space-y-3">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Resend OTP
                    </>
                  )}
                </button>

                <div>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
