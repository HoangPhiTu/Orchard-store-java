"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
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
import { sendOtpSchema, type SendOtpSchema } from "@/lib/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/shared/progress-steps";
import { useAuthStore } from "@/stores/auth-store";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const { isAuthenticated, isInitialized } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SendOtpSchema>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      email: "",
    },
  });

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, isInitialized, router]);

  const onSubmit = async (values: SendOtpSchema) => {
    try {
      const response = await authService.sendOtp(values);
      setIsSubmitted(true);
      setSubmittedEmail(values.email);
      toast.success(response.message || "OTP code sent to your email");

      // Auto-redirect to verify OTP after 2 seconds
      // Use replace to prevent back navigation to forgot-password page
      setTimeout(() => {
        router.replace(`/verify-otp?email=${encodeURIComponent(values.email)}`);
      }, 2000);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const apiMessage =
        axiosError.response?.data?.message ??
        "Failed to send OTP. Please try again.";
      setError("root", { type: "server", message: apiMessage });
      toast.error(apiMessage);
    }
  };

  const handleContinueToVerify = () => {
    router.replace(`/verify-otp?email=${encodeURIComponent(submittedEmail)}`);
  };

  if (isSubmitted) {
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
              <div className="space-y-2 text-center pt-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                  <CheckCircle2 className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-2xl">Check your email</CardTitle>
                <CardDescription>
                  We&apos;ve sent a 6-digit OTP code to
                  <br />
                  <span className="font-semibold text-indigo-600">
                    {submittedEmail}
                  </span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">
                <p className="mb-2 font-semibold">What&apos;s next?</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Check your inbox for the OTP code</li>
                  <li>Enter the 6-digit code to verify your identity</li>
                  <li>The OTP code will expire in 5 minutes</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleContinueToVerify}
                >
                  Continue to verify OTP
                </Button>
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  onClick={() => {
                    setIsSubmitted(false);
                    setSubmittedEmail("");
                  }}
                >
                  Send to a different email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
      <div className="relative min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-12">
        <Card className="w-full border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-4 pb-6">
            <ProgressSteps currentStep={1} />
            <div className="space-y-1 pt-4">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Forgot your password?
              </CardTitle>
              <CardDescription>
                Enter your email address and we&apos;ll send you a 6-digit OTP
                code to reset your password.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@orchard.com"
                    autoComplete="email"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
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
                    Sending...
                  </>
                ) : (
                  "Send OTP code"
                )}
              </Button>

              <div className="text-center">
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
