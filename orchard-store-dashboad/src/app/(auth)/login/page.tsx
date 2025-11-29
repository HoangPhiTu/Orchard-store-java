"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import dynamic from "next/dynamic";
import {
  Clock,
  Loader2,
  LogIn,
  Trash2,
  X,
  DollarSign,
  Users,
  TrendingUp,
  Mountain,
  // DISABLED: ShieldAlert, // Lock mechanism disabled
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/stores/auth-store";
import { loginSchema, type LoginSchema } from "@/lib/schemas/auth.schema";
import { toast } from "sonner";
import {
  incrementFailedAttempts,
  resetFailedAttempts,
  // DISABLED: Lock mechanism after 5 failed attempts
  // isLocked,
  // getLockRemainingTime,
  // formatLockTime,
} from "@/lib/security/rate-limit";
import { hashPassword } from "@/lib/security/password-hash";
import { logger } from "@/lib/logger";

type LoginApiError = {
  message?: string;
};

type StoredAccount = {
  email: string;
  password: string; // base64 encoded
  lastUsed: number;
};

const RECENT_ACCOUNTS_KEY = "orchard_recent_logins";
const MAX_SAVED_ACCOUNTS = 3;

// Lazy load Turnstile to reduce initial bundle size and avoid lag
const Turnstile = dynamic(
  () => import("react-turnstile").then((mod) => mod.default),
  {
    ssr: false, // Turnstile only works on client-side
    loading: () => (
      <div className="h-[65px] w-[300px] flex items-center justify-center border border-border rounded-lg bg-muted">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

const getStoredAccounts = (): StoredAccount[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_ACCOUNTS_KEY);
    return stored ? (JSON.parse(stored) as StoredAccount[]) : [];
  } catch (error) {
    logger.warn("Failed to parse saved accounts", error);
    return [];
  }
};

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [recentAccounts, setRecentAccounts] =
    useState<StoredAccount[]>(getStoredAccounts);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement | null>(null);
  const [isSubmittingDebounced, setIsSubmittingDebounced] = useState(false);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Security: Turnstile & Rate Limiting
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showTurnstile, setShowTurnstile] = useState(false);
  // DISABLED: Lock mechanism after 5 failed attempts
  // const [isLockedState, setIsLockedState] = useState(false);
  // const [lockRemaining, setLockRemaining] = useState(0);
  const turnstileKeyRef = useRef<number>(0); // Use key to force re-render instead of ref
  // const lockCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Password hashing (optional - chỉ bật nếu Backend hỗ trợ)
  const ENABLE_PASSWORD_HASHING =
    process.env.NEXT_PUBLIC_ENABLE_PASSWORD_HASHING === "true";

  // Check if Turnstile is configured
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const isTurnstileConfigured = Boolean(
    TURNSTILE_SITE_KEY && TURNSTILE_SITE_KEY.trim() !== ""
  );

  // Show Turnstile if configured (works in both dev and production)
  // In development, SSL errors will be handled gracefully
  useEffect(() => {
    if (isTurnstileConfigured) {
      setShowTurnstile(true);
    }
  }, [isTurnstileConfigured]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const [emailValue, passwordValue] = useWatch({
    control,
    name: ["email", "password"],
  });

  // Check if current form values match a saved account
  const hasSavedAccount = recentAccounts.some(
    (acc) =>
      acc.email.toLowerCase() === emailValue?.toLowerCase() &&
      passwordValue &&
      passwordValue.length > 0
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Security: Check rate limiting on mount and email change
  // DISABLED: Lock mechanism after 5 failed attempts
  // useEffect(() => {
  //   const checkSecurity = () => {
  //     const locked = isLocked();

  //     setIsLockedState(locked);
  //     // Turnstile is always shown from start, no need to check requiresCaptcha

  //     if (locked) {
  //       const remaining = getLockRemainingTime();
  //       setLockRemaining(remaining);

  //       // Update lock timer every second
  //       lockCheckIntervalRef.current = setInterval(() => {
  //         const newRemaining = getLockRemainingTime();
  //         setLockRemaining(newRemaining);
  //         if (newRemaining === 0) {
  //           setIsLockedState(false);
  //           if (lockCheckIntervalRef.current) {
  //             clearInterval(lockCheckIntervalRef.current);
  //           }
  //         }
  //       }, 1000);
  //     } else {
  //       if (lockCheckIntervalRef.current) {
  //         clearInterval(lockCheckIntervalRef.current);
  //       }
  //     }
  //   };

  //   checkSecurity();

  //   return () => {
  //     if (lockCheckIntervalRef.current) {
  //       clearInterval(lockCheckIntervalRef.current);
  //     }
  //   };
  // }, [emailValue]);

  const persistRecentAccount = (email: string, password: string) => {
    if (typeof window === "undefined" || !email || !password) {
      return;
    }

    try {
      const encoded = window.btoa(password);
      const filtered = recentAccounts.filter(
        (acc) => acc.email.toLowerCase() !== email.toLowerCase()
      );
      const timestamp = new Date().getTime();
      const nextList: StoredAccount[] = [
        { email, password: encoded, lastUsed: timestamp },
        ...filtered,
      ].slice(0, MAX_SAVED_ACCOUNTS);
      setRecentAccounts(nextList);
      localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(nextList));
    } catch (error) {
      logger.warn("Failed to store login snapshot", error);
    }
  };

  const handleSelectAccount = (account: StoredAccount) => {
    try {
      const decoded = window.atob(account.password);
      setValue("email", account.email, { shouldValidate: false });
      setValue("password", decoded, { shouldValidate: false });
      setShowSuggestions(false);
      toast.success("Login credentials filled", {
        duration: 2000,
      });
    } catch (error) {
      logger.warn("Failed to decode account", error);
      toast.error("Failed to load saved credentials");
    }
  };

  const handleRemoveAccount = (email: string) => {
    const next = recentAccounts.filter(
      (acc) => acc.email.toLowerCase() !== email.toLowerCase()
    );
    setRecentAccounts(next);
    localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(next));
  };

  const onSubmit = async (values: LoginSchema) => {
    // Prevent double submission
    if (isSubmittingDebounced) {
      return;
    }

    // Security: Check if locked
    // DISABLED: Lock mechanism after 5 failed attempts
    // if (isLocked()) {
    //   const remaining = formatLockTime(getLockRemainingTime());
    //   toast.error(
    //     `Tài khoản tạm thời bị khóa. Vui lòng thử lại sau ${remaining}.`
    //   );
    //   return;
    // }

    // Security: Verify Turnstile token if configured
    // DISABLED in development to allow login without Turnstile issues
    if (
      showTurnstile &&
      isTurnstileConfigured &&
      process.env.NODE_ENV === "production"
    ) {
      // Check if token exists (only in production)
      if (!turnstileToken) {
        toast.error("Vui lòng hoàn thành xác minh bảo mật");
        return;
      }

      // Verify token with Cloudflare (only in production)
      try {
        const verifyResponse = await fetch("/api/auth/verify-turnstile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: turnstileToken }),
        });

        if (!verifyResponse.ok) {
          throw new Error("Verification request failed");
        }

        const verifyData = await verifyResponse.json();
        if (!verifyData.success) {
          toast.error("Xác minh bảo mật thất bại. Vui lòng thử lại.");
          setTurnstileToken(null);
          // Reset Turnstile widget by changing key
          turnstileKeyRef.current += 1;
          return; // Block login in production
        }
      } catch (error) {
        logger.error("Turnstile verification error:", error);
        toast.error("Không thể xác minh bảo mật. Vui lòng thử lại.");
        setTurnstileToken(null);
        turnstileKeyRef.current += 1;
        return; // Block login in production
      }
    } else if (
      showTurnstile &&
      isTurnstileConfigured &&
      process.env.NODE_ENV === "development"
    ) {
      // In development, skip Turnstile verification completely
      logger.debug("Development mode: Skipping Turnstile verification");
    }

    setIsSubmittingDebounced(true);
    logger.debug("After Turnstile check, proceeding to login...");

    try {
      // Security: Hash password if enabled (optional)
      let passwordToSend = values.password;
      if (ENABLE_PASSWORD_HASHING) {
        passwordToSend = await hashPassword(values.password);
      }

      logger.debug("Calling login API...");
      // Login với password đã hash (nếu bật)
      await login({
        ...values,
        password: passwordToSend,
      });
      logger.debug("Login API success!");

      // Security: Reset failed attempts on success
      resetFailedAttempts();
      // Keep Turnstile visible (always shown), just reset token
      setTurnstileToken(null);
      // Reset Turnstile widget for next login by changing key
      turnstileKeyRef.current += 1;

      persistRecentAccount(values.email, values.password);
      toast.success("Signed in successfully");

      // Redirect về trang đã định trước hoặc dashboard mặc định
      const searchParams = new URLSearchParams(window.location.search);
      const nextUrl = searchParams.get("next") || "/admin/dashboard";
      router.replace(nextUrl);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<LoginApiError>;

      // Security: Increment failed attempts
      incrementFailedAttempts(values.email);

      // Turnstile is always shown, just reset it on error
      setTurnstileToken(null);
      // Reset Turnstile widget by changing key
      turnstileKeyRef.current += 1;

      // Handle timeout specifically
      if (
        axiosError.code === "ECONNABORTED" ||
        axiosError.message?.includes("timeout")
      ) {
        const timeoutMessage = "Kết nối quá hạn, vui lòng kiểm tra mạng";
        setError("root", { type: "server", message: timeoutMessage });
        toast.error(timeoutMessage);
      } else {
        const apiMessage =
          axiosError.response?.data?.message ??
          "Email hoặc mật khẩu không đúng";
        setError("root", { type: "server", message: apiMessage });
        toast.error(apiMessage);

        // Check if locked after this attempt
        // DISABLED: Lock mechanism after 5 failed attempts
        // if (isLocked()) {
        //   const remaining = formatLockTime(getLockRemainingTime());
        //   toast.error(
        //     `Đăng nhập sai quá nhiều lần. Tài khoản bị khóa trong ${remaining}.`
        //   );
        //   setIsLockedState(true);
        // }
      }
    } finally {
      // BẮT BUỘC reset state trong finally để tránh stuck loading
      // Clear any pending timeout
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }

      // Reset debounce state after a short delay to prevent rapid clicks
      submitTimeoutRef.current = setTimeout(() => {
        setIsSubmittingDebounced(false);
      }, 500);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const renderSavedAccounts = () => {
    if (recentAccounts.length === 0) {
      return (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No saved accounts yet. Your recent logins will appear here.
          </p>
        </div>
      );
    }

    return recentAccounts.map((account) => (
      <div
        key={account.email}
        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
      >
        <button
          type="button"
          className="flex flex-1 items-center gap-3 text-left"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => handleSelectAccount(account)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
            {account.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-card-foreground truncate">
              {account.email}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Clock size={12} />
              Last login:{" "}
              {new Date(account.lastUsed).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </button>
        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => handleRemoveAccount(account.email)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    ));
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Branding & Stats (Hidden on mobile, shown on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:bg-gradient-to-br from-accent/50 to-muted/50 lg:p-12 xl:p-16 border-r border-border">
        <div className="flex flex-col h-full justify-between">
          {/* Logo and Heading */}
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
                Manage your store with
                <span className="block text-muted-foreground">precision</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Real-time analytics, inventory management, and customer insights
                all in one place.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {/* Total Sales Card */}
            <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-muted p-2">
                  <DollarSign className="h-5 w-5 text-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-card-foreground mb-1">$128,420</p>
              <div className="flex items-center gap-1 text-sm text-primary">
                <TrendingUp className="h-4 w-4" />
                <span>+12.5% this month</span>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-muted p-2">
                  <Users className="h-5 w-5 text-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Active Users</p>
              <p className="text-2xl font-bold text-card-foreground mb-1">24.5k</p>
              <div className="flex items-center gap-1 text-sm text-primary">
                <TrendingUp className="h-4 w-4" />
                <span>+5.2% this week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
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
                Welcome back
              </h2>
              <p className="mt-2 text-muted-foreground">
                Please enter your details to sign in.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="relative space-y-5" ref={suggestionRef}>
                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@orchard.com"
                    autoComplete="email"
                    className="h-11 border-border focus:border-primary focus:ring-primary"
                    {...register("email")}
                    onFocus={() => {
                      if (recentAccounts.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-foreground"
                    >
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-11 border-border pr-20 focus:border-primary focus:ring-primary"
                      {...register("password")}
                      onFocus={() => {
                        if (recentAccounts.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                    />
                    {hasSavedAccount && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary border border-primary/20">
                        Saved
                      </span>
                    )}
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Saved Logins Popover */}
                {showSuggestions && recentAccounts.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-xl border border-border bg-card shadow-lg">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <LogIn size={14} />
                        Quick login
                      </div>
                      <button
                        type="button"
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="divide-y divide-border max-h-64 overflow-y-auto">
                      {renderSavedAccounts()}
                    </div>
                  </div>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <Controller
                  control={control}
                  name="remember"
                  render={({ field }) => (
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className="text-sm text-foreground">
                        Remember me for 7 days
                      </span>
                    </label>
                  )}
                />
              </div>

              {/* Error Message */}
              {errors.root?.message && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                  <p className="text-sm font-medium text-destructive">
                    {errors.root.message}
                  </p>
                </div>
              )}

              {/* Security: Lock Message */}
              {/* DISABLED: Lock mechanism after 5 failed attempts */}
              {/* {isLockedState && (
                <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-orange-600" />
                    <p className="text-sm font-medium text-orange-800">
                      Tài khoản tạm thời bị khóa do đăng nhập sai quá nhiều lần.
                      {lockRemaining > 0 && (
                        <span className="block mt-1 text-xs">
                          Vui lòng thử lại sau: {formatLockTime(lockRemaining)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )} */}

              {/* Security: Turnstile Widget - Show if configured */}
              {showTurnstile && isTurnstileConfigured && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Xác minh bảo mật
                    {process.env.NODE_ENV === "development" && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (Development Mode)
                      </span>
                    )}
                  </Label>
                  <div className="flex justify-center">
                    <Turnstile
                      key={turnstileKeyRef.current}
                      sitekey={TURNSTILE_SITE_KEY || ""}
                      theme="light"
                      onSuccess={(token: string) => {
                        setTurnstileToken(token);
                        logger.debug("Turnstile verified successfully");
                      }}
                      onError={(error: unknown) => {
                        setTurnstileToken(null);
                        // Ignore SSL errors in development (ERR_SSL_PROTOCOL_ERROR)
                        // This is a known issue when Turnstile tries to connect to localhost with HTTPS
                        const errorMessage =
                          error instanceof Error
                            ? error.message
                            : String(error || "");
                        if (
                          process.env.NODE_ENV === "development" &&
                          (errorMessage.includes("SSL") ||
                            errorMessage.includes("ERR_SSL_PROTOCOL_ERROR"))
                        ) {
                          logger.warn(
                            "Turnstile SSL error in development (ignored). This is normal when using HTTP localhost."
                          );
                          return;
                        }
                        // Only show error in production
                        if (process.env.NODE_ENV === "production") {
                          toast.error(
                            "Xác minh bảo mật thất bại. Vui lòng thử lại."
                          );
                        }
                      }}
                      onExpire={() => {
                        setTurnstileToken(null);
                        logger.debug("Turnstile token expired");
                        if (process.env.NODE_ENV === "production") {
                          toast.warning(
                            "Phiên xác minh đã hết hạn. Vui lòng xác minh lại."
                          );
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {process.env.NODE_ENV === "development"
                      ? "Xác minh bảo mật (không bắt buộc trong development)"
                      : "Vui lòng hoàn thành xác minh bảo mật để đăng nhập"}
                  </p>
                </div>
              )}

              {/* Sign In Button */}
              <Button
                type="submit"
                variant="default"
                className="h-11 w-full rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isSubmitting ||
                  isSubmittingDebounced ||
                  // DISABLED: isLockedState || // Lock mechanism disabled
                  // Require Turnstile token in production, optional in development
                  (showTurnstile &&
                    isTurnstileConfigured &&
                    !turnstileToken &&
                    process.env.NODE_ENV === "production")
                }
                isLoading={isSubmitting || isSubmittingDebounced}
              >
                {isSubmitting || isSubmittingDebounced ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
                {/* DISABLED: Lock mechanism */}
                {/* ) : isLockedState ? (
                  <>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Tài khoản bị khóa
                  </>
                ) : (
                  "Sign in"
                )} */}
              </Button>
            </form>

            {/* Footer Link */}
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="#"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Contact Admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
