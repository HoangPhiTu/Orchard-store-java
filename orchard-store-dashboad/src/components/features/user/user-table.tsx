"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/user.types";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { UserRow } from "@/components/features/user/user-row";

interface UserTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onDelete?: (user: User) => void;
  isLoading?: boolean;
}

export function UserTable({
  users,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
  isLoading,
}: UserTableProps) {
  const { user: currentUser } = useAuthStore();
  const safeUsers = Array.isArray(users) ? users : [];

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
  const renderTable = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">Loading users...</div>
        </div>
      );
    }

    if (safeUsers.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">No users found</div>
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
          {safeUsers.map((user, index) => {
            const rowKey = String(
              user.id ?? user.email ?? user.fullName ?? `user-${index}`
            );
            return (
              <UserRow
                key={rowKey}
                user={user}
                canToggle={!!onToggleStatus && canToggleStatus(user)}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                onResetPassword={onResetPassword}
                onDelete={onDelete}
              />
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Không thể tải danh sách người dùng. Vui lòng thử lại.
        </div>
      }
    >
      {renderTable()}
    </ErrorBoundary>
  );
}
