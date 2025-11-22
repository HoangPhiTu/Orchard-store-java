"use client";

import { useState, useMemo } from "react";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { useDebounce } from "@/hooks/use-debounce";
import { useUsers, useToggleUserStatus } from "@/hooks/use-users";
import type { User, UserStatus } from "@/types/user.types";
import { UserTable } from "@/components/features/user/user-table";
import { UserFormSheet } from "@/components/features/user/user-form-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
  const [page, setPage] = useState(0); // Backend uses 0-based pagination
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Build filters for API
  const filters = useMemo(
    () => ({
      keyword: debouncedSearch || undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      page,
      size: 20, // Items per page
    }),
    [debouncedSearch, statusFilter, page]
  );

  const { data, isLoading, error } = useUsers(filters);
  const toggleStatus = useToggleUserStatus({
    onSuccess: (user) => {
      toast.success(
        user.status === "ACTIVE" ? "User unlocked successfully" : "User locked successfully"
      );
    },
    onError: () => {
      toast.error("Failed to toggle user status");
    },
  });

  // Reset to first page when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as UserStatus | "ALL");
    setPage(0);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${user.status === "ACTIVE" ? "lock" : "unlock"} this user?`
    );
    if (confirmed) {
      toggleStatus.mutate(user.id);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handlePrevPage = () => {
    if (data && !data.first) {
      setPage((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (data && !data.last) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500">
              Manage all staff members and their roles in the system.
            </p>
          </div>
          <Button onClick={handleAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Toolbar: Search + Status Filter */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="pl-9"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="BANNED">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-2">
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-red-600">
                Error loading users: {error.message}
              </div>
            </div>
          ) : (
            <UserTable
              users={data?.content || []}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <div className="text-sm text-slate-600">
              Showing {data.content.length > 0 ? data.page * data.size + 1 : 0} to{" "}
              {Math.min((data.page + 1) * data.size, data.totalElements)} of{" "}
              {data.totalElements} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={data.first || isLoading}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm text-slate-600">
                Page {data.page + 1} of {data.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={data.last || isLoading}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Form Sheet */}
      <UserFormSheet
        open={isFormOpen}
        onOpenChange={setFormOpen}
        user={selectedUser}
      />
    </div>
  );
}

