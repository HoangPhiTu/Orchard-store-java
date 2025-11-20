"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Clock, Loader2, LogIn, Trash2, X } from "lucide-react";
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
      setValue("email", account.email);
      setValue("password", decoded);
      setShowSuggestions(false);
      toast.success("Đã điền thông tin đăng nhập đã lưu", {
        duration: 2000,
      });
    } catch (error) {
      console.warn("Failed to decode account", error);
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
      router.replace("/admin/dashboard");
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
        <div className="px-4 py-8 text-center text-sm text-slate-400">
          Chưa có tài khoản nào được lưu. Đăng nhập thành công lần tới, hệ thống
          sẽ gợi ý tại đây.
        </div>
      );
    }

    return recentAccounts.map((account) => (
      <div
        key={account.email}
        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-emerald-50/60"
      >
        <button
          type="button"
          className="flex flex-1 items-center gap-3 text-left"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => handleSelectAccount(account)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-600">
            {account.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {account.email}
            </p>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Clock size={12} />
              Đăng nhập lần cuối:{" "}
              {new Date(account.lastUsed).toLocaleString("vi-VN")}
            </p>
          </div>
        </button>
        <button
          type="button"
          className="rounded-full border border-transparent p-2 text-slate-400 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => handleRemoveAccount(account.email)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    ));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#EEF5FF] via-[#F9FBFF] to-white px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <div className="hidden rounded-3xl bg-white/70 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600">
              Orchard Admin
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-900">
              Control your entire store from one dashboard.
            </h2>
            <p className="mt-4 text-base text-slate-500">
              Real-time analytics, multi-channel inventory, customer journeys
              and campaign performance—everything designed with the
              Saledash-inspired visual system.
            </p>
          </div>
          <div className="grid gap-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 p-6 text-white">
            <div>
              <p className="text-sm opacity-80">Revenue this month</p>
              <p className="text-3xl font-semibold">$128,420</p>
            </div>
            <div className="flex items-center justify-between text-sm opacity-80">
              <span>Top channel</span>
              <span>Organic search · 42%</span>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase opacity-80">Orders</p>
                <p className="mt-2 text-2xl font-semibold">1,482</p>
                <span className="text-xs text-emerald-100">
                  +6.4% vs last week
                </span>
              </div>
              <div className="flex-1 rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase opacity-80">Customers</p>
                <p className="mt-2 text-2xl font-semibold">865</p>
                <span className="text-xs text-emerald-100">
                  +2.1% vs last week
                </span>
              </div>
            </div>
          </div>
        </div>

        <Card className="w-full border-0 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                  Welcome back
                </p>
                <CardTitle className="text-3xl">Sign in to continue</CardTitle>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                v1.0
              </span>
            </div>
            <CardDescription>
              Access the Saledash-inspired console to manage orders, products
              and campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@orchard.com"
                  autoComplete="email"
                  {...register("email")}
                  onFocus={() => setShowSuggestions(true)}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-500"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative" ref={suggestionRef}>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm hover:bg-emerald-100"
                    onClick={() => setShowSuggestions((prev) => !prev)}
                  >
                    Saved logins
                  </button>

                  {showSuggestions && (
                    <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-30 rounded-2xl border border-slate-200 bg-white shadow-2xl">
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <LogIn size={14} />
                          Đăng nhập nhanh
                        </div>
                        <button
                          type="button"
                          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          onClick={() => setShowSuggestions(false)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {renderSavedAccounts()}
                      </div>
                    </div>
                  )}
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <Controller
                  control={control}
                  name="remember"
                  render={({ field }) => (
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      Remember me
                    </label>
                  )}
                />
                <span className="text-xs text-slate-400">
                  Session extends to 7 days when enabled
                </span>
              </div>

              {errors.root?.message && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {errors.root.message}
                </p>
              )}

              <Button
                type="submit"
                className="h-11 w-full rounded-xl"
                isLoading={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
    </div>
  );
}
