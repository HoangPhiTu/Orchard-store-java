"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { AxiosError } from "axios";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { SheetBody } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useCreateUser, useUpdateUser } from "@/hooks/use-users";
import { useRoles } from "@/hooks/use-roles";
import type { User, UserStatus } from "@/types/user.types";
import { userFormSchema } from "@/types/user.types";
import type { z } from "zod";

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

const DEFAULT_VALUES: UserFormData = {
  fullName: "",
  email: "",
  password: "",
  phone: null,
  roleIds: [],
  status: "ACTIVE",
};

export function UserFormSheet({
  open,
  onOpenChange,
  user,
}: UserFormSheetProps) {
  const isEditing = Boolean(user);
  const { data: roles = [], isLoading: rolesLoading } = useRoles();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  /**
   * Xử lý lỗi 409 (Conflict) - hiển thị inline error cho field tương ứng
   */
  const handleConflictError = (error: AxiosError) => {
    const errorMessage =
      (error.response?.data as { message?: string })?.message || "";
    const messageLower = errorMessage.toLowerCase();

    // Kiểm tra message chứa từ khóa 'email'
    if (messageLower.includes("email")) {
      form.setError("email", {
        type: "manual",
        message: "Email này đã được sử dụng",
      });
    }

    // Kiểm tra message chứa từ khóa 'phone' hoặc 'số điện thoại'
    if (
      messageLower.includes("phone") ||
      messageLower.includes("số điện thoại") ||
      messageLower.includes("điện thoại")
    ) {
      form.setError("phone", {
        type: "manual",
        message: "Số điện thoại đã tồn tại",
      });
    }

    // Nếu không match với email hoặc phone, hiển thị toast chung
    if (
      !messageLower.includes("email") &&
      !messageLower.includes("phone") &&
      !messageLower.includes("số điện thoại") &&
      !messageLower.includes("điện thoại")
    ) {
      toast.error(errorMessage || "Dữ liệu đã tồn tại");
    }
  };

  const createUser = useCreateUser({
    onSuccess: () => {
      toast.success("Tạo người dùng thành công");
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
    },
    onError: (error) => {
      // Kiểm tra nếu là lỗi 409 (Conflict)
      if (
        error instanceof Error &&
        "response" in error &&
        (error as AxiosError).response?.status === 409
      ) {
        handleConflictError(error as AxiosError);
        // Không throw error để tránh Next.js error overlay
        // Error đã được xử lý inline trong form
        return;
      }

      // Các lỗi khác để interceptor xử lý (toast)
      // Không cần toast ở đây vì interceptor đã xử lý
    },
    // Không throw error cho lỗi 409 để tránh Next.js error overlay
    throwOnError: (error) => {
      // Chỉ throw error nếu không phải lỗi 409
      if (
        error instanceof Error &&
        "response" in error &&
        (error as AxiosError).response?.status === 409
      ) {
        return false; // Không throw, đã xử lý inline
      }
      return true; // Throw các lỗi khác
    },
  });

  const updateUser = useUpdateUser({
    onSuccess: () => {
      toast.success("Cập nhật người dùng thành công");
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
    },
    onError: (error) => {
      // Kiểm tra nếu là lỗi 409 (Conflict)
      if (
        error instanceof Error &&
        "response" in error &&
        (error as AxiosError).response?.status === 409
      ) {
        handleConflictError(error as AxiosError);
        // Không throw error để tránh Next.js error overlay
        // Error đã được xử lý inline trong form
        return;
      }

      // Các lỗi khác để interceptor xử lý (toast)
      // Không cần toast ở đây vì interceptor đã xử lý
    },
    // Không throw error cho lỗi 409 để tránh Next.js error overlay
    throwOnError: (error) => {
      // Chỉ throw error nếu không phải lỗi 409
      if (
        error instanceof Error &&
        "response" in error &&
        (error as AxiosError).response?.status === 409
      ) {
        return false; // Không throw, đã xử lý inline
      }
      return true; // Throw các lỗi khác
    },
  });

  // Map user roles (role codes) to role IDs for form
  const userRoleIds = useMemo(() => {
    if (!user || !roles.length) return [];
    return roles
      .filter((role) => user.roles.includes(role.roleCode))
      .map((role) => role.id);
  }, [user, roles]);

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
        email: user.email,
        password: "", // Don't pre-fill password
        phone: user.phone || null,
        roleIds: userRoleIds,
        status: user.status,
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userRoleIds]); // Removed 'form' from deps to prevent infinite loop

  const watchedRoleIds = form.watch("roleIds");
  const watchedStatus = form.watch("status");

  const handleRoleToggle = useCallback(
    (roleId: number) => {
      const currentRoleIds = form.getValues("roleIds") || [];
      const isSelected = currentRoleIds.includes(roleId);

      if (isSelected) {
        form.setValue(
          "roleIds",
          currentRoleIds.filter((id) => id !== roleId),
          { shouldValidate: true, shouldDirty: true }
        );
      } else {
        form.setValue("roleIds", [...currentRoleIds, roleId], {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [form]
  );

  const handleStatusToggle = (checked: boolean) => {
    form.setValue("status", checked ? "ACTIVE" : "INACTIVE", {
      shouldValidate: true,
    });
  };

  const onSubmit = (data: UserFormData) => {
    if (isEditing) {
      // Update user - only send fields that can be updated
      // Note: Email and password cannot be updated via this endpoint
      if (!data.roleIds || data.roleIds.length === 0) {
        form.setError("roleIds", {
          type: "manual",
          message: "Phải chọn ít nhất một quyền",
        });
        return;
      }

      const updateData: {
        fullName?: string;
        phone?: string | null;
        roleIds: number[];
        status?: UserStatus;
      } = {
        roleIds: data.roleIds,
      };

      if (data.fullName) updateData.fullName = data.fullName;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.status) updateData.status = data.status as UserStatus;

      updateUser.mutate({ id: user!.id, data: updateData });
    } else {
      // Create user - all fields required
      if (
        !data.email ||
        !data.password ||
        !data.roleIds ||
        data.roleIds.length === 0
      ) {
        if (!data.email)
          form.setError("email", {
            type: "manual",
            message: "Email không được để trống",
          });
        if (!data.password)
          form.setError("password", {
            type: "manual",
            message: "Mật khẩu phải có ít nhất 6 ký tự",
          });
        if (!data.roleIds || data.roleIds.length === 0) {
          form.setError("roleIds", {
            type: "manual",
            message: "Phải chọn ít nhất một quyền",
          });
        }
        return;
      }

      createUser.mutate({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone || null,
        roleIds: data.roleIds,
        status: data.status || "ACTIVE",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col"
        >
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle>
                  {isEditing ? "Edit User" : "Add New User"}
                </SheetTitle>
                <SheetDescription>
                  {isEditing
                    ? "Update user information and roles."
                    : "Create a new user account with roles and permissions."}
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mt-1 -mr-2"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <SheetBody>
            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...form.register("fullName")}
                  placeholder="Enter full name"
                  className={
                    form.formState.errors.fullName ? "border-red-500" : ""
                  }
                />
                {form.formState.errors.fullName && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="Enter email address"
                  disabled={isEditing} // Email cannot be changed when editing
                  className={
                    form.formState.errors.email ? "border-red-500" : ""
                  }
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
                {isEditing && (
                  <p className="text-xs text-slate-500">
                    Email cannot be changed
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password{" "}
                  {!isEditing && <span className="text-red-500">*</span>}
                  {isEditing && (
                    <span className="text-slate-500 text-xs font-normal">
                      {" "}
                      (Leave blank to keep current password)
                    </span>
                  )}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder={
                    isEditing
                      ? "Enter new password (optional)"
                      : "Enter password"
                  }
                  className={
                    form.formState.errors.password ? "border-red-500" : ""
                  }
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...form.register("phone")}
                  placeholder="Enter phone number"
                  className={
                    form.formState.errors.phone ? "border-red-500" : ""
                  }
                />
                {form.formState.errors.phone && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              {/* Roles - Selectable Cards */}
              <div className="space-y-2">
                <Label>
                  Roles <span className="text-red-500">*</span>
                </Label>
                {rolesLoading ? (
                  <p className="text-sm text-slate-500">Loading roles...</p>
                ) : roles.length === 0 ? (
                  <p className="text-sm text-slate-500">No roles available</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {roles.map((role) => {
                      const isSelected =
                        watchedRoleIds?.includes(role.id) || false;
                      return (
                        <div
                          key={role.id}
                          onClick={() => handleRoleToggle(role.id)}
                          className={cn(
                            "relative flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all",
                            isSelected
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"
                          )}
                        >
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5"
                          >
                            <Checkbox
                              id={`role-${role.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                // Only update if the checked state is different
                                if (checked !== isSelected) {
                                  handleRoleToggle(role.id);
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Label
                              htmlFor={`role-${role.id}`}
                              className="cursor-pointer font-medium text-slate-900"
                            >
                              {role.roleName}
                            </Label>
                            {role.description && (
                              <p className="mt-1 text-xs text-slate-500">
                                {role.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {form.formState.errors.roleIds && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.roleIds.message}
                  </p>
                )}
              </div>

              {/* Status - Switch */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="flex items-center space-x-3">
                  <Switch
                    id="status"
                    checked={watchedStatus === "ACTIVE"}
                    onCheckedChange={handleStatusToggle}
                  />
                  <Label
                    htmlFor="status"
                    className="cursor-pointer font-normal"
                  >
                    {watchedStatus === "ACTIVE" ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div>
            </div>
          </SheetBody>

          <SheetFooter>
            <div className="flex w-full gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={createUser.isPending || updateUser.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createUser.isPending || updateUser.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {createUser.isPending || updateUser.isPending
                  ? "Saving..."
                  : isEditing
                  ? "Update User"
                  : "Create User"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
