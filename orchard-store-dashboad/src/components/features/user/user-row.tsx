"use client";

import React from "react";
import {
  Pencil,
  Lock,
  Unlock,
  Key,
  Trash2,
  MoreHorizontal,
  Copy,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import type { User } from "@/types/user.types";
import { TableRow, TableCell } from "@/components/ui/table";

interface UserRowProps {
  user: User;
  canToggle: boolean;
  onEdit?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onDelete?: (user: User) => void;
}

const getInitials = (fullName?: string | null): string => {
  if (!fullName || typeof fullName !== "string") {
    return "U";
  }

  const trimmed = fullName.trim();
  if (!trimmed) {
    return "U";
  }

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

export const UserRow = React.memo<UserRowProps>(
  ({ user, canToggle, onEdit, onToggleStatus, onResetPassword, onDelete }) => {
    const displayName = user.fullName?.trim() || user.email || "Unknown User";
    const displayEmail = user.email || "No email";
    const displayPhone = user.phone?.trim();
    const avatarUrl = user.avatarUrl?.trim();

    return (
      <TableRow>
        <TableCell>
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
              <span className="text-xs font-medium text-muted-foreground !opacity-100">
                {displayEmail}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm font-medium text-foreground !opacity-100">
            {displayPhone || (
              <span className="text-muted-foreground !opacity-100">—</span>
            )}
          </span>
        </TableCell>
        <TableCell>
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
              <span className="text-xs font-medium text-muted-foreground !opacity-100">
                No roles
              </span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <StatusBadge status={user.status || "INACTIVE"} />
        </TableCell>
        <TableCell className="text-right">
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
                  disabled={!canToggle}
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
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) =>
    prev.user.id === next.user.id &&
    prev.user.status === next.user.status &&
    prev.user.fullName === next.user.fullName &&
    prev.user.email === next.user.email &&
    prev.user.avatarUrl === next.user.avatarUrl &&
    prev.canToggle === next.canToggle
);

UserRow.displayName = "UserRow";
