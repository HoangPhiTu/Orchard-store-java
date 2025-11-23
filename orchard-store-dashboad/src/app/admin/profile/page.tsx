"use client";

import { Loader2, User, Mail, Shield } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { User as UserType } from "@/types/auth.types";

/**
 * Get initials from full name (first 2 letters)
 */
const getInitials = (fullName: string): string => {
  const words = fullName.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
};

/**
 * Get badge variant for role
 */
const getRoleBadgeVariant = (
  role: string
): "default" | "secondary" | "success" | "warning" => {
  const roleUpper = role.toUpperCase();
  if (roleUpper.includes("ADMIN") || roleUpper.includes("SUPER")) {
    return "warning"; // Orange/Red for Admin
  }
  if (roleUpper.includes("MANAGER")) {
    return "default"; // Dark for Manager
  }
  return "success"; // Green/Blue for Staff/Viewer
};

export default function ProfilePage() {
  const { data: user, isLoading, error } = useCurrentUser();
  const { user: storeUser } = useAuthStore();

  // Fallback to store user if query fails
  const displayUser: UserType | null = (user as UserType) || storeUser;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !displayUser) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Lỗi</CardTitle>
            <CardDescription>
              Không thể tải thông tin người dùng. Vui lòng thử lại sau.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Thông tin cá nhân
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Xem và quản lý thông tin tài khoản của bạn
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white">
                {displayUser ? getInitials(displayUser.fullName) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">
                {displayUser?.fullName || "User"}
              </CardTitle>
              <CardDescription className="mt-1">
                {displayUser?.email || ""}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />

          {/* User ID */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <User className="h-5 w-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">ID</p>
              <p className="text-sm text-slate-500 mt-0.5">
                #{displayUser?.id || "N/A"}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Mail className="h-5 w-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Email</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {displayUser?.email || "N/A"}
              </p>
            </div>
          </div>

          {/* Roles */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Shield className="h-5 w-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 mb-2">Vai trò</p>
              <div className="flex flex-wrap gap-1.5">
                {displayUser?.roles && displayUser.roles.length > 0 ? (
                  displayUser.roles.map((role: string, index: number) => {
                    // Remove "ROLE_" prefix if present
                    const roleName = role.replace(/^ROLE_/, "");
                    return (
                      <Badge
                        key={index}
                        variant={getRoleBadgeVariant(roleName)}
                      >
                        {roleName}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-400">
                    Không có vai trò
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Permissions (if available) */}
          {displayUser?.authorities && displayUser.authorities.length > 0 && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Shield className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Quyền hạn
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {displayUser.authorities.map(
                      (permission: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {permission}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
