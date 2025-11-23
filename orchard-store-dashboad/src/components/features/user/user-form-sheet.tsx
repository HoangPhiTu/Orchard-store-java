"use client";

import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { useForm, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { FormField } from "@/components/ui/form-field";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useUserHistory } from "@/hooks/use-users";
import { useRoles } from "@/hooks/use-roles";
import { userService } from "@/services/user.service";
import { LoginHistoryTable } from "@/components/features/user/login-history-table";
import { ImageUpload } from "@/components/shared/image-upload";
import type { User } from "@/types/user.types";
import type { LoginHistoryPage } from "@/types/login-history.types";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserSchema,
  type UpdateUserSchema,
} from "@/lib/schemas/user.schema";

// Union type cho form data (có thể là create hoặc update)
type UserFormData = CreateUserSchema | UpdateUserSchema;

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
  avatarUrl: null,
};

export function UserFormSheet({
  open,
  onOpenChange,
  user,
}: UserFormSheetProps) {
  const isEditing = Boolean(user);
  const [activeTab, setActiveTab] = useState("profile");
  const { data: roles = [], isLoading: rolesLoading } = useRoles();

  // Fetch login history only when editing and History tab is active
  const { data: historyData, isLoading: historyLoading } = useUserHistory(
    user?.id ?? null,
    { page: 0, size: 20 }
  );

  // Sử dụng schema phù hợp với mode (create/edit)
  const formSchema = isEditing ? updateUserSchema : createUserSchema;

  const form = useForm<UserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
    shouldFocusError: true, // ✅ Tự động focus vào field lỗi đầu tiên
  });

  // ✅ Sử dụng useAppMutation - Tự động xử lý error, success, invalidate queries
  // ✅ Tự động đóng sheet khi thành công, giữ mở khi có lỗi
  const createUserMutation = useAppMutation({
    mutationFn: (data: CreateUserSchema) => userService.createUser(data),
    queryKey: ["admin", "users"], // Tự động refresh danh sách users
    form: form, // Tự động setError và reset form
    onClose: () => onOpenChange(false), // Tự động đóng sheet khi thành công
    successMessage: "Tạo người dùng thành công", // Tự động hiển thị toast success
    resetOnSuccess: true, // Tự động reset form sau khi thành công
  });

  const updateUserMutation = useAppMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserSchema }) =>
      userService.updateUser(id, data),
    queryKey: ["admin", "users"], // Tự động refresh danh sách users
    form: form, // ✅ Tự động map lỗi vào form fields
    onClose: () => onOpenChange(false), // ✅ Tự động đóng sheet khi thành công (chỉ khi không có lỗi)
    successMessage: "Cập nhật người dùng thành công", // ✅ Tự động hiển thị toast success
    resetOnSuccess: false, // ✅ Không reset form khi update (giữ dữ liệu)
  });

  // Combined loading state (create hoặc update đang pending)
  const isPending =
    createUserMutation.isPending || updateUserMutation.isPending;

  // Refs để trigger shake animation khi có lỗi
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // ✅ Shake animation khi có lỗi validation
  const handleSubmitError = () => {
    // Trigger shake animation trên form
    if (formRef.current) {
      formRef.current.classList.add("animate-shake");
      setTimeout(() => {
        formRef.current?.classList.remove("animate-shake");
      }, 500);
    }

    // Trigger shake animation trên submit button
    if (submitButtonRef.current) {
      submitButtonRef.current.classList.add("animate-shake-button");
      setTimeout(() => {
        submitButtonRef.current?.classList.remove("animate-shake-button");
      }, 400);
    }
  };

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
        avatarUrl: user.avatarUrl || null,
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

  // ✅ Hàm submit cực kỳ ngắn gọn - không cần try-catch, không cần validation thủ công
  // ✅ Không cần gọi onClose() hay toast - Hook tự động xử lý!
  // ✅ Schema validation + useAppMutation tự động xử lý tất cả!
  // ✅ Nếu thành công: Hook tự động gọi onClose() để đóng Sheet
  // ✅ Nếu lỗi: Hook tự động gán lỗi vào form, giữ Sheet mở để user sửa
  const onSubmit = async (data: UserFormData) => {
    if (isEditing) {
      // Update user
      const updateData = data as UpdateUserSchema;
      // ✅ Dùng mutateAsync để có thể await
      // ✅ Không cần try-catch: Hook tự động xử lý lỗi và gán vào form
      // ✅ Nếu thành công: Hook tự động gọi onClose() trong onSuccess
      // ✅ Nếu lỗi: Hook tự động gán lỗi vào form, không gọi onClose()
      await updateUserMutation.mutateAsync({ id: user!.id, data: updateData });
    } else {
      // Create user
      const createData = data as CreateUserSchema;
      // ✅ Dùng mutateAsync để có thể await
      // ✅ Không cần try-catch: Hook tự động xử lý lỗi và gán vào form
      // ✅ Nếu thành công: Hook tự động gọi onClose() trong onSuccess
      // ✅ Nếu lỗi: Hook tự động gán lỗi vào form, không gọi onClose()
      await createUserMutation.mutateAsync(createData);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit, handleSubmitError)}
          className="relative flex h-full flex-col"
        >
          {/* Loading Overlay */}
          <LoadingOverlay isLoading={isPending} />
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-xl font-semibold text-slate-900">
                  {isEditing ? "Edit User" : "Add New User"}
                </SheetTitle>
                <SheetDescription className="text-sm text-slate-500">
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
            {/* Tabs chỉ hiển thị khi Edit mode */}
            {isEditing ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">Thông tin</TabsTrigger>
                  <TabsTrigger value="history">Lịch sử</TabsTrigger>
                </TabsList>

                {/* Tab 1: Profile - Form nhập liệu */}
                <TabsContent value="profile" className="mt-4">
                  <div className="space-y-6">
                    {/* Avatar Upload - Căn giữa */}
                    <div className="flex justify-center">
                      <ImageUpload
                        value={form.watch("avatarUrl")}
                        onChange={(url) =>
                          form.setValue("avatarUrl", url || null, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        folder="users"
                        size="lg"
                        disabled={isPending}
                      />
                    </div>

                    {/* Full Name */}
                    <FormField
                      label="Full Name"
                      htmlFor="fullName"
                      required
                      error={form.formState.errors.fullName}
                    >
                      <Input
                        id="fullName"
                        {...form.register("fullName")}
                        placeholder="Enter full name"
                        className={cn(
                          form.formState.errors.fullName &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                    </FormField>

                    {/* Email */}
                    <FormField
                      label="Email"
                      htmlFor="email"
                      required
                      error={
                        (form.formState.errors as Record<string, FieldError>)
                          .email
                      }
                      description={
                        isEditing ? "Email không thể thay đổi" : undefined
                      }
                    >
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email" as keyof UserFormData)}
                        placeholder="Enter email address"
                        disabled={isEditing}
                        value={user?.email || ""}
                        className={cn(
                          (
                            form.formState.errors as Record<
                              string,
                              { message?: string }
                            >
                          ).email &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500",
                          isEditing && "bg-slate-100 cursor-not-allowed"
                        )}
                      />
                    </FormField>

                    {/* Password */}
                    <FormField
                      label="Password"
                      htmlFor="password"
                      error={form.formState.errors.password}
                      description={
                        isEditing
                          ? "Để trống nếu bạn không muốn thay đổi mật khẩu"
                          : undefined
                      }
                    >
                      <Input
                        id="password"
                        type="password"
                        {...form.register("password")}
                        placeholder="Nhập mật khẩu mới (tùy chọn)"
                        className={cn(
                          form.formState.errors.password &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                    </FormField>

                    {/* Phone */}
                    <FormField
                      label="Phone Number"
                      htmlFor="phone"
                      error={form.formState.errors.phone}
                    >
                      <Input
                        id="phone"
                        type="tel"
                        {...form.register("phone")}
                        placeholder="Enter phone number"
                        className={cn(
                          form.formState.errors.phone &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                    </FormField>

                    {/* Roles - Selectable Cards */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Roles <span className="text-red-500">*</span>
                      </Label>
                      {rolesLoading ? (
                        <p className="text-sm text-slate-500">
                          Loading roles...
                        </p>
                      ) : roles.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          No roles available
                        </p>
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
                                  "relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all",
                                  isSelected
                                    ? "border-indigo-600 bg-indigo-50/50"
                                    : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
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
                                      if (checked !== isSelected) {
                                        handleRoleToggle(role.id);
                                      }
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`role-${role.id}`}
                                    className="cursor-pointer font-semibold text-slate-900"
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
                      <Label
                        htmlFor="status"
                        className="text-sm font-medium text-slate-700"
                      >
                        Status
                      </Label>
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
                </TabsContent>

                {/* Tab 2: History - Lịch sử đăng nhập */}
                <TabsContent value="history" className="mt-4">
                  <LoginHistoryTable
                    history={
                      (historyData as LoginHistoryPage | undefined)?.content ||
                      []
                    }
                    isLoading={historyLoading}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              /* Create mode: Chỉ hiển thị form, không có Tabs */
              <div className="space-y-6">
                {/* Avatar Upload - Căn giữa */}
                <div className="flex justify-center">
                  <ImageUpload
                    value={form.watch("avatarUrl")}
                    onChange={(url) =>
                      form.setValue("avatarUrl", url || null, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    folder="users"
                    size="lg"
                    disabled={isPending}
                  />
                </div>

                {/* Full Name */}
                <FormField
                  label="Full Name"
                  htmlFor="fullName"
                  required
                  error={form.formState.errors.fullName}
                >
                  <Input
                    id="fullName"
                    {...form.register("fullName")}
                    placeholder="Enter full name"
                    className={cn(
                      form.formState.errors.fullName &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                </FormField>

                {/* Email */}
                <FormField
                  label="Email"
                  htmlFor="email"
                  required
                  error={
                    (form.formState.errors as Record<string, FieldError>).email
                  }
                >
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email" as keyof UserFormData)}
                    placeholder="Enter email address"
                    className={cn(
                      (
                        form.formState.errors as Record<
                          string,
                          { message?: string }
                        >
                      ).email &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                </FormField>

                {/* Password */}
                <FormField
                  label="Password"
                  htmlFor="password"
                  required
                  error={form.formState.errors.password}
                >
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    placeholder="Nhập mật khẩu"
                    className={cn(
                      form.formState.errors.password &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                </FormField>

                {/* Phone */}
                <FormField
                  label="Phone Number"
                  htmlFor="phone"
                  error={form.formState.errors.phone}
                >
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                    placeholder="Enter phone number"
                    className={cn(
                      form.formState.errors.phone &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                </FormField>

                {/* Roles - Selectable Cards */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
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
                              "relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all",
                              isSelected
                                ? "border-indigo-600 bg-indigo-50/50"
                                : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
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
                                  if (checked !== isSelected) {
                                    handleRoleToggle(role.id);
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Label
                                htmlFor={`role-${role.id}`}
                                className="cursor-pointer font-semibold text-slate-900"
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
              </div>
            )}
          </SheetBody>

          <SheetFooter>
            <div className="flex w-full gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-lg"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                ref={submitButtonRef}
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-lg"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : isEditing ? (
                  "Cập nhật"
                ) : (
                  "Tạo mới"
                )}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
