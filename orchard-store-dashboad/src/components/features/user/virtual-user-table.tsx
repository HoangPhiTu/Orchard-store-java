"use client";

import React, { useCallback, useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { VirtualTable } from "@/components/ui/virtual-table";
import type { User } from "@/types/user.types";
import { useAuthStore } from "@/stores/auth-store";
import {
  Copy,
  Key,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
  Unlock,
} from "lucide-react";

export interface VirtualUserTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onDelete?: (user: User) => void;
  isLoading?: boolean;
}

const getInitials = (fullName?: string | null): string => {
  if (!fullName || typeof fullName !== "string") return "U";
  const trimmed = fullName.trim();
  if (!trimmed) return "U";
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const first = words[0][0] || "";
    const last = words[words.length - 1][0] || "";
    return (first + last).toUpperCase().slice(0, 2);
  }
  return trimmed.slice(0, 2).toUpperCase();
};

const getRoleBadgeVariant = (
  role: string
): "default" | "secondary" | "success" | "warning" => {
  const roleUpper = role.toUpperCase();
  if (roleUpper.includes("ADMIN") || roleUpper.includes("SUPER")) {
    return "warning";
  }
  if (roleUpper.includes("MANAGER")) {
    return "default";
  }
  return "success";
};

export function VirtualUserTable({
  users,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
  isLoading,
}: VirtualUserTableProps) {
  const { user: currentUser } = useAuthStore();
  const safeUsers = Array.isArray(users) ? users : [];

  const canToggleStatus = useCallback(
    (user: User): boolean => {
      if (currentUser && currentUser.email === user.email) {
        return false;
      }

      if (!currentUser || !currentUser.roles) {
        return false;
      }

      return currentUser.roles.some(
        (role) =>
          role.includes("ADMIN") ||
          role.includes("SUPER_ADMIN") ||
          role === "ROLE_ADMIN" ||
          role === "ROLE_SUPER_ADMIN"
      );
    },
    [currentUser]
  );

  const columns = useMemo(
    () => [
      {
        key: "user",
        title: "User",
        width: 320,
        render: (user: User) => {
          const displayName =
            user.fullName?.trim() || user.email || "Unknown User";
          const avatarUrl = user.avatarUrl?.trim();
          const displayEmail = user.email || "No email";

          return (
            <div className="flex items-center gap-3">
              <Avatar>
                {avatarUrl ? (
                  <AvatarImage
                    src={avatarUrl}
                    alt={displayName}
                    onError={(e) => {
                      console.warn("User avatar failed to load", {
                        userId: user.id,
                        url: avatarUrl,
                        error: e,
                      });
                    }}
                  />
                ) : null}
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">
                  {displayName}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {displayEmail}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "phone",
        title: "Phone",
        width: 140,
        render: (user: User) => (
          <span className="text-sm font-medium text-foreground">
            {user.phone?.trim() || (
              <span className="text-muted-foreground">—</span>
            )}
          </span>
        ),
      },
      {
        key: "roles",
        title: "Roles",
        render: (user: User) => (
          <div className="flex flex-wrap gap-1.5">
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((role, index) => (
                <Badge
                  key={`${user.id}-role-${index}`}
                  variant={getRoleBadgeVariant(role)}
                >
                  {role || "UNKNOWN"}
                </Badge>
              ))
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                No roles
              </span>
            )}
          </div>
        ),
      },
      {
        key: "status",
        title: "Status",
        width: 140,
        render: (user: User) => (
          <StatusBadge status={user.status || "INACTIVE"} />
        ),
      },
      {
        key: "actions",
        title: "Actions",
        width: 140,
        render: (user: User) => (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 text-muted-foreground data-[state=open]:bg-muted/40"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[180px] bg-card text-card-foreground"
            >
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onResetPassword && (
                <DropdownMenuItem onClick={() => onResetPassword(user)}>
                  <Key className="mr-2 h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  if (typeof navigator !== "undefined") {
                    navigator.clipboard.writeText(String(user.id ?? ""));
                  }
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onToggleStatus && (
                <DropdownMenuItem
                  onClick={() => onToggleStatus(user)}
                  disabled={!canToggleStatus(user)}
                >
                  {user.status === "ACTIVE" ? (
                    <Lock className="mr-2 h-4 w-4" />
                  ) : (
                    <Unlock className="mr-2 h-4 w-4" />
                  )}
                  {user.status === "ACTIVE" ? "Lock Account" : "Unlock Account"}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(user)}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [canToggleStatus, onDelete, onEdit, onResetPassword, onToggleStatus]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <VirtualTable<User>
      data={safeUsers}
      columns={columns}
      height={520}
      rowHeight={64}
      emptyState={
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No users found
        </div>
      }
    />
  );
}
