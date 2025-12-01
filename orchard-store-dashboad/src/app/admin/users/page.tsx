"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, ChevronDown } from "lucide-react";

import { useDebounce } from "@/hooks/use-debounce";
import { useDataTable } from "@/hooks/use-data-table";
import { useUsers } from "@/hooks/use-users";
import { usePrefetchNextPage } from "@/hooks/use-realtime-updates";
import { useQueryClient } from "@tanstack/react-query";
import { useCancelQueriesOnUnmount } from "@/hooks/use-request-cancellation";
import { userService } from "@/services/user.service";
import type { Page, User, UserStatus, UserFilters } from "@/types/user.types";
import { STATUS_OPTIONS } from "@/config/options";
import { UserTable } from "@/components/features/user/user-table";
import { VirtualUserTable } from "@/components/features/user/virtual-user-table";
import dynamic from "next/dynamic";
import { ResetPasswordDialog } from "@/components/features/user/reset-password-dialog";
import { DeleteUserDialog } from "@/components/features/user/delete-user-dialog";
import { ToggleStatusDialog } from "@/components/features/user/toggle-status-dialog";

// Lazy load form component để giảm initial bundle size
const UserFormSheet = dynamic(
  () =>
    import("@/components/features/user/user-form-sheet").then(
      (mod) => mod.UserFormSheet
    ),
  {
    ssr: false,
    loading: () => null, // Form sẽ tự quản lý loading state
  }
);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import DataTableFilter from "@/components/shared/data-table-filter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/hooks/use-i18n";

export default function Page() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const { page, pageSize, onPaginationChange } = useDataTable();
  const zeroBasedPage = Math.max(page - 1, 0);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [toggleStatusUser, setToggleStatusUser] = useState<User | null>(null);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] =
    useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const rawStatus = searchParams.get("status");
  const statusFilter: UserStatus | "ALL" =
    rawStatus && ["ACTIVE", "INACTIVE", "BANNED"].includes(rawStatus)
      ? (rawStatus as UserStatus)
      : "ALL";

  const prevStatusRef = useRef(statusFilter);
  useEffect(() => {
    if (prevStatusRef.current !== statusFilter) {
      prevStatusRef.current = statusFilter;
      onPaginationChange(1, pageSize);
    }
  }, [statusFilter, onPaginationChange, pageSize]);

  const prevSearchRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearchRef.current !== debouncedSearch) {
      prevSearchRef.current = debouncedSearch;
      onPaginationChange(1, pageSize);
    }
  }, [debouncedSearch, onPaginationChange, pageSize]);

  const filters = useMemo(
    () => ({
      keyword: debouncedSearch || undefined,
      status: statusFilter,
      page: zeroBasedPage,
      size: pageSize,
    }),
    [debouncedSearch, statusFilter, zeroBasedPage, pageSize]
  );

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useUsers(filters);
  const userPage = data as Page<User> | undefined;

  // Cancel queries when component unmounts to prevent memory leaks
  useCancelQueriesOnUnmount(queryClient, ["admin", "users"]);

  // Prefetch next page để tải nhanh hơn khi user navigate
  usePrefetchNextPage(
    ["admin", "users"],
    (filters) => userService.getUsers(filters as UserFilters),
    filters,
    zeroBasedPage + 1,
    userPage?.totalPages ?? 0
  );
  const users = userPage?.content ?? [];
  const totalElements = userPage?.totalElements ?? 0;
  const totalPages = userPage?.totalPages ?? 0;
  const preferredView = searchParams.get("view");
  const shouldUseVirtualTable =
    preferredView === "virtual" ||
    (preferredView !== "table" && users.length > 40);

  // Reset to first page handled via effect watching debouncedSearch
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    setToggleStatusUser(user);
    setIsToggleStatusDialogOpen(true);
  };

  const handleResetPassword = (user: User) => {
    setResetPasswordUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const handleResetPasswordSuccess = () => {
    // Optionally refetch users or show success message
    // The toast is already shown in ResetPasswordDialog
  };

  const handleDelete = (user: User) => {
    setDeleteUser(user);
    setIsDeleteUserDialogOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-card-foreground">
              {t("admin.users.userManagement")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("admin.users.manageAllStaffMembers")}
            </p>
          </div>

          {/* Toolbar: Search + Status Filter + Add Button - Đồng bộ với Brand và Category */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/90 p-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("admin.users.searchByNameEmailPhone")}
                className="h-10 w-full rounded-lg border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
              <DataTableFilter
                title={t("admin.users.status")}
                options={STATUS_OPTIONS}
                paramName="status"
                className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                iconClassName="text-muted-foreground"
              />
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 min-w-[160px] justify-between rounded-lg border-border text-sm text-muted-foreground"
                  >
                    {t("admin.users.display")}: {pageSize}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 bg-card text-card-foreground">
                  {[15, 30, 50, 100].map((size) => (
                    <DropdownMenuItem
                      key={size}
                      onClick={() => onPaginationChange(1, size)}
                      data-active={size === pageSize}
                      className="cursor-pointer text-sm text-muted-foreground data-[active=true]:font-semibold data-[active=true]:text-foreground"
                    >
                      {size} {t("admin.users.rowsPerPage")}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleAddUser} className="h-10 rounded-lg">
                <Plus className="mr-2 h-4 w-4" />
                {t("admin.users.addUser")}
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card p-2">
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-red-600">
                Error loading users: {error.message}
              </div>
            </div>
          ) : (
            <>
              {shouldUseVirtualTable ? (
                <VirtualUserTable
                  users={users}
                  onEdit={handleEdit}
                  onResetPassword={handleResetPassword}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  isLoading={isLoading}
                />
              ) : (
                <UserTable
                  users={users}
                  onEdit={handleEdit}
                  onResetPassword={handleResetPassword}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  isLoading={isLoading}
                />
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {data && (
          <DataTablePagination
            totalElements={totalElements}
            totalPages={totalPages}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={(nextPage) => onPaginationChange(nextPage, pageSize)}
          />
        )}
      </div>

      {/* User Form Sheet */}
      <UserFormSheet
        open={isFormOpen}
        onOpenChange={setFormOpen}
        user={selectedUser}
      />

      {/* Reset Password Dialog */}
      {resetPasswordUser && (
        <ResetPasswordDialog
          userId={resetPasswordUser.id}
          userName={resetPasswordUser.fullName}
          isOpen={isResetPasswordDialogOpen}
          onClose={() => {
            setIsResetPasswordDialogOpen(false);
            setResetPasswordUser(null);
          }}
          onSuccess={handleResetPasswordSuccess}
        />
      )}

      {/* Delete User Dialog */}
      {deleteUser && (
        <DeleteUserDialog
          userId={deleteUser.id}
          userName={deleteUser.fullName}
          userEmail={deleteUser.email}
          isOpen={isDeleteUserDialogOpen}
          onClose={() => {
            setIsDeleteUserDialogOpen(false);
            setDeleteUser(null);
          }}
        />
      )}

      {/* Toggle Status Dialog */}
      {toggleStatusUser && (
        <ToggleStatusDialog
          user={toggleStatusUser}
          isOpen={isToggleStatusDialogOpen}
          onClose={() => {
            setIsToggleStatusDialogOpen(false);
            setToggleStatusUser(null);
          }}
        />
      )}
    </div>
  );
}
