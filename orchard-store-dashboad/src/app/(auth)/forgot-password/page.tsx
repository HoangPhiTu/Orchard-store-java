"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { ArrowLeft, CheckCircle2, Mountain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtpSchema, type SendOtpSchema } from "@/lib/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useI18n } from "@/hooks/use-i18n";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { t } = useI18n();

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

  // Prefetch verify-otp page for faster navigation
  useEffect(() => {
    router.prefetch("/verify-otp");
  }, [router]);

  const onSubmit = async (values: SendOtpSchema) => {
    try {
      const response = await authService.sendOtp(values);
      setIsSubmitted(true);
      setSubmittedEmail(values.email);
      toast.success(response.message || t("auth.forgotPassword.otpCodeSent"));

      // Prefetch next page for faster navigation
      router.prefetch(`/verify-otp?email=${encodeURIComponent(values.email)}`);

      // Auto-redirect immediately after showing success message
      setIsRedirecting(true);
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
      }, 800);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const apiMessage =
        axiosError.response?.data?.message ?? t("auth.common.pleaseTryAgain");
      setError("root", { type: "server", message: apiMessage });
      toast.error(apiMessage);
    }
  };

  const handleContinueToVerify = () => {
    router.push(`/verify-otp?email=${encodeURIComponent(submittedEmail)}`);
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen bg-background">
        {/* Left Panel - Branding (Hidden on mobile, shown on desktop) */}
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
                  {t("auth.forgotPassword.checkYourEmail").split(" ")[0]}{" "}
                  <span className="block text-muted-foreground">
                    {t("auth.forgotPassword.checkYourEmail")
                      .split(" ")
                      .slice(1)
                      .join(" ")}
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  {t("auth.forgotPassword.weSentVerificationCode")}
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
                    {t("auth.forgotPassword.checkYourEmail")}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    {t("auth.forgotPassword.otpCodeSentTo")}
                    <br />
                    <span className="font-semibold text-foreground">
                      {submittedEmail}
                    </span>
                  </p>
                  {isRedirecting && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Redirecting to verification page...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  {t("auth.forgotPassword.whatsNext")}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t("auth.forgotPassword.checkInboxForOtp")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t("auth.forgotPassword.enterSixDigitCode")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      {t("auth.forgotPassword.otpCodeExpiresIn5Minutes")}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  variant="default"
                  className="h-11 w-full rounded-lg shadow-sm"
                  onClick={handleContinueToVerify}
                >
                  {t("auth.forgotPassword.continueToVerifyOtp")}
                </Button>
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="h-11 w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("auth.forgotPassword.backToLogin")}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setIsSubmitted(false);
                    setSubmittedEmail("");
                  }}
                >
                  {t("auth.forgotPassword.sendToDifferentEmail")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Branding (Hidden on mobile, shown on desktop) */}
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
                {t("auth.forgotPassword.resetYourPassword").split(" ")[0]}{" "}
                <span className="block text-muted-foreground">
                  {t("auth.forgotPassword.resetYourPassword")
                    .split(" ")
                    .slice(1)
                    .join(" ")}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                {t("auth.forgotPassword.enterEmailToReset")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo (shown only on mobile) */}
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
                {t("auth.forgotPassword.forgotYourPassword")}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t("auth.forgotPassword.enterEmailAndWeWillSendOtp")}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  {t("auth.forgotPassword.emailAddress")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@orchard.com"
                  autoComplete="email"
                  className="h-11 border-border focus:border-primary focus:ring-primary"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
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
                {t("auth.forgotPassword.sendOtpCode")}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("auth.forgotPassword.backToLogin")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
