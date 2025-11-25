"use client";

import { Pencil, Lock, Unlock, Key, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/user.types";

interface UserTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onDelete?: (user: User) => void;
  isLoading?: boolean;
}

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

/**
 * Get badge variant for status
 */
const getStatusBadgeVariant = (
  status: string
): "default" | "secondary" | "success" | "warning" | "danger" => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "success"; // Green
    case "INACTIVE":
      return "secondary"; // Gray
    case "BANNED":
      return "danger"; // Red
    default:
      return "secondary";
  }
};

export function UserTable({
  users,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
  isLoading,
}: UserTableProps) {
  const { user: currentUser } = useAuthStore();

  /**
   * Kiểm tra xem có thể toggle status của user này không
   * - Không thể toggle chính mình
   * - Phải có quyền ADMIN (có role ADMIN hoặc SUPER_ADMIN)
   */
  const canToggleStatus = (user: User): boolean => {
    // Không thể toggle chính mình
    if (currentUser && currentUser.email === user.email) {
      return false;
    }

    // Phải có quyền ADMIN
    if (!currentUser || !currentUser.roles) {
      return false;
    }

    const hasAdminRole = currentUser.roles.some(
      (role) =>
        role.includes("ADMIN") ||
        role.includes("SUPER_ADMIN") ||
        role === "ROLE_ADMIN" ||
        role === "ROLE_SUPER_ADMIN"
    );

    return hasAdminRole;
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-500">Loading users...</div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-500">No users found</div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Roles</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            {/* User Column: Avatar + Name + Email */}
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  {user.avatarUrl ? (
                    <AvatarImage
                      src={user.avatarUrl}
                      alt={user.fullName}
                      onError={(e) => {
                        console.error("❌ Error loading user avatar:", {
                          url: user.avatarUrl,
                          userId: user.id,
                          error: e,
                        });
                      }}
                      onLoad={() => {
                        console.log("✅ User avatar loaded:", user.avatarUrl);
                      }}
                    />
                  ) : null}
                  <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">
                    {user.fullName}
                  </span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
              </div>
            </TableCell>

            {/* Phone Column */}
            <TableCell>
              <span className="text-sm text-slate-700">
                {user.phone || <span className="text-slate-400">—</span>}
              </span>
            </TableCell>

            {/* Roles Column: Badges */}
            <TableCell>
              <div className="flex flex-wrap gap-1.5">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role, index) => (
                    <Badge key={index} variant={getRoleBadgeVariant(role)}>
                      {role}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No roles</span>
                )}
              </div>
            </TableCell>

            {/* Status Column: Badge */}
            <TableCell>
              <Badge variant={getStatusBadgeVariant(user.status)}>
                {user.status}
              </Badge>
            </TableCell>

            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                    onClick={() => onEdit(user)}
                    title="Edit user"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onResetPassword && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => onResetPassword(user)}
                    title="Reset password"
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                )}
                {onToggleStatus && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${
                      canToggleStatus(user)
                        ? "text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                        : "text-slate-300 cursor-not-allowed"
                    }`}
                    onClick={() => onToggleStatus(user)}
                    disabled={!canToggleStatus(user)}
                    title={
                      user.status === "ACTIVE" ? "Lock user" : "Unlock user"
                    }
                  >
                    {user.status === "ACTIVE" ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
                    onClick={() => onDelete(user)}
                    title="Delete user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
