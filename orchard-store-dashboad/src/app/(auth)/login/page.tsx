"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/stores/auth-store";
import { loginSchema, type LoginSchema } from "@/lib/schemas/auth.schema";
import { toast } from "sonner";

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

const getStoredAccounts = (): StoredAccount[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_ACCOUNTS_KEY);
    return stored ? (JSON.parse(stored) as StoredAccount[]) : [];
  } catch (error) {
    console.warn("Failed to parse saved accounts", error);
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
      console.warn("Failed to store login snapshot", error);
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
      console.warn("Failed to decode account", error);
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
    try {
      await login(values);
      persistRecentAccount(values.email, values.password);
      toast.success("Signed in successfully");

      // Redirect về trang đã định trước hoặc dashboard mặc định
      const searchParams = new URLSearchParams(window.location.search);
      const nextUrl = searchParams.get("next") || "/admin/dashboard";
      router.replace(nextUrl);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<LoginApiError>;
      const apiMessage =
        axiosError.response?.data?.message ?? "Email hoặc mật khẩu không đúng";
      setError("root", { type: "server", message: apiMessage });
      toast.error(apiMessage);
    }
  };

  const renderSavedAccounts = () => {
    if (recentAccounts.length === 0) {
      return (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-slate-500">
            No saved accounts yet. Your recent logins will appear here.
          </p>
        </div>
      );
    }

    return recentAccounts.map((account) => (
      <div
        key={account.email}
        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-blue-50/50 transition-colors"
      >
        <button
          type="button"
          className="flex flex-1 items-center gap-3 text-left"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => handleSelectAccount(account)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-sm font-semibold text-blue-700">
            {account.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {account.email}
            </p>
            <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
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
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => handleRemoveAccount(account.email)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    ));
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding & Stats (Hidden on mobile, shown on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:bg-linear-to-br from-slate-50 to-slate-100 lg:p-12 xl:p-16 border-r border-slate-200">
        <div className="flex flex-col h-full justify-between">
          {/* Logo and Heading */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200">
                <Mountain className="h-6 w-6 text-slate-700" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                Orchard Admin
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-slate-900 leading-tight">
                Manage your store with
                <span className="block text-slate-600">precision</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-md">
                Real-time analytics, inventory management, and customer insights
                all in one place.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {/* Total Sales Card */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-slate-100 p-2">
                  <DollarSign className="h-5 w-5 text-slate-700" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-slate-900 mb-1">$128,420</p>
              <div className="flex items-center gap-1 text-sm text-indigo-600">
                <TrendingUp className="h-4 w-4" />
                <span>+12.5% this month</span>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-slate-100 p-2">
                  <Users className="h-5 w-5 text-slate-700" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Active Users</p>
              <p className="text-2xl font-bold text-slate-900 mb-1">24.5k</p>
              <div className="flex items-center gap-1 text-sm text-indigo-600">
                <TrendingUp className="h-4 w-4" />
                <span>+5.2% this week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo (shown only on mobile) */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200">
              <Mountain className="h-6 w-6 text-slate-700" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Orchard Admin
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Welcome back
              </h2>
              <p className="mt-2 text-slate-600">
                Please enter your details to sign in.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="relative space-y-5" ref={suggestionRef}>
                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@orchard.com"
                    autoComplete="email"
                    className="h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
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
                      className="text-sm font-medium text-slate-700"
                    >
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-slate-700 hover:text-slate-900"
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
                      className="h-11 border-slate-300 pr-20 focus:border-blue-500 focus:ring-blue-500"
                      {...register("password")}
                      onFocus={() => {
                        if (recentAccounts.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                    />
                    {hasSavedAccount && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 border border-indigo-200">
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
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <LogIn size={14} />
                        Quick login
                      </div>
                      <button
                        type="button"
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
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
                        className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                      />
                      <span className="text-sm text-slate-700">
                        Remember me for 7 days
                      </span>
                    </label>
                  )}
                />
              </div>

              {/* Error Message */}
              {errors.root?.message && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm font-medium text-red-800">
                    {errors.root.message}
                  </p>
                </div>
              )}

              {/* Sign In Button */}
              <Button
                type="submit"
                className="h-11 w-full rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-sm"
                isLoading={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Footer Link */}
            <p className="text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="#"
                className="font-semibold text-slate-900 hover:text-slate-700"
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
