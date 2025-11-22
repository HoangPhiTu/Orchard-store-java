"use client";

import { MoreHorizontal, Edit, Lock, Unlock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/types/user.types";

interface UserTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
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
const getRoleBadgeVariant = (role: string): "default" | "secondary" | "success" | "warning" => {
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

export function UserTable({ users, onEdit, onToggleStatus, isLoading }: UserTableProps) {
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
                  <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">{user.fullName}</span>
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
              <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
            </TableCell>

            {/* Actions Column: DropdownMenu */}
            <TableCell className="text-right">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onToggleStatus && (
                    <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                      {user.status === "ACTIVE" ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Lock
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Unlock
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

