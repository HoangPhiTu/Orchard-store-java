"use client";

import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { useForm, Controller, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { X, Loader2, AlertCircle, PenLine } from "lucide-react";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { FormField } from "@/components/ui/form-field";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { toast } from "sonner";

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
import { UserHistoryTable } from "@/components/features/users/user-history-table";
import { useRoles } from "@/hooks/use-roles";
import { userService } from "@/services/user.service";
import { ImageUpload } from "@/components/shared/image-upload";
import { ChangeEmailDialog } from "@/components/features/user/change-email-dialog";
import { useImageManagement } from "@/hooks/use-image-management";
import type { User } from "@/types/user.types";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserSchema,
  type UpdateUserSchema,
} from "@/lib/schemas/user.schema";
import { useAuthStore } from "@/stores/auth-store";
import { logger } from "@/lib/logger";
import { useI18n } from "@/hooks/use-i18n";

// Union type cho form data (có thể là create hoặc update)
// avatarUrl có thể là File (ảnh mới) hoặc string (URL ảnh cũ)
type UserFormData = (CreateUserSchema | UpdateUserSchema) & {
  avatarUrl?: File | string | null;
};

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
  const { t } = useI18n();
  const isEditing = Boolean(user);
  const [activeTab, setActiveTab] = useState("profile");
  const { data: roles = [], isLoading: rolesLoading } = useRoles();

  // Fetch login history only when editing and History tab is active

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
    mutationFn: (
      data: Omit<CreateUserSchema, "avatarUrl"> & { avatarUrl?: string | null }
    ) => userService.createUser(data),
    queryKey: ["admin", "users"], // Tự động refresh danh sách users
    form: form, // Tự động setError và reset form
    onClose: () => onOpenChange(false), // Tự động đóng sheet khi thành công
    successMessage: t("admin.forms.user.createUserSuccess"), // Tự động hiển thị toast success
    resetOnSuccess: true, // Tự động reset form sau khi thành công
  });

  const updateUserMutation = useAppMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Omit<UpdateUserSchema, "avatarUrl"> & { avatarUrl?: string | null };
    }) => userService.updateUser(id, data),
    queryKey: ["admin", "users"], // Tự động refresh danh sách users
    form: form, // ✅ Tự động map lỗi vào form fields
    onClose: () => onOpenChange(false), // ✅ Tự động đóng sheet khi thành công (chỉ khi không có lỗi)
    successMessage: t("admin.forms.user.updateUserSuccess"), // ✅ Tự động hiển thị toast success
    resetOnSuccess: false, // ✅ Không reset form khi update (giữ dữ liệu)
  });

  // Combined loading state (create hoặc update đang pending)
  const isPending =
    createUserMutation.isPending || updateUserMutation.isPending;

  // Refs để trigger shake animation khi có lỗi
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);
  const [isChangeEmailDialogOpen, setChangeEmailDialogOpen] = useState(false);
  const [latestAvatarUrl, setLatestAvatarUrl] = useState<string | null | undefined>(undefined);

  // Image management hook (reusable for all entities)
  const imageManagement = useImageManagement("users");

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

  const isSuperAdmin = useMemo(() => {
    if (!authUser?.roles?.length) return false;
    return authUser.roles.some((role) =>
      role?.toUpperCase().includes("SUPER_ADMIN")
    );
  }, [authUser]);
  const canEditEmail = Boolean(user) && isEditing && isSuperAdmin;

  // Memoize userRoleIds string to prevent infinite loop
  const userRoleIdsString = useMemo(() => userRoleIds.join(","), [userRoleIds]);

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
      // ✅ Clear latestAvatarUrl khi user data được load
      setLatestAvatarUrl(undefined);
    } else {
      form.reset(DEFAULT_VALUES);
      setLatestAvatarUrl(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, userRoleIdsString]);

  const watchedRoleIds = form.watch("roleIds");
  const watchedStatus = form.watch("status");
  const watchedEmail = form.watch("email");

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

  // ✅ Hàm submit với logic upload ảnh trước khi submit
  // ✅ Sử dụng useImageManagement hook (reusable, implements best practices)
  // ✅ Soft delete strategy - mark for deletion instead of hard delete
  const onSubmit = async (data: UserFormData) => {
    logger.debug("onSubmit called with data:", {
      ...data,
      avatarUrl:
        data.avatarUrl instanceof File
          ? `File: ${data.avatarUrl.name}`
          : data.avatarUrl,
    });

    const previousAvatarUrl = isEditing ? user?.avatarUrl || null : null;
    let uploadedAvatarUrl: string | null = null;

    try {
      // Xử lý upload ảnh và mark old image for deletion (soft delete)
      let finalAvatarUrl: string | null = null;

      if (data.avatarUrl instanceof File) {
        // Có ảnh mới được chọn -> Upload trước
        logger.debug("Uploading image:", data.avatarUrl.name);
        try {
          finalAvatarUrl = await imageManagement.uploadImage(data.avatarUrl);
          uploadedAvatarUrl = finalAvatarUrl;
          logger.debug("Image uploaded successfully:", finalAvatarUrl);
        } catch (error) {
          // Nếu upload thất bại, set error vào form
          logger.error("Image upload failed:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : t("admin.forms.user.cannotUploadImage");
          form.setError("avatarUrl", {
            type: "manual",
            message: errorMessage,
          });
          toast.error(errorMessage);
          return; // Dừng submit
        }
      } else if (typeof data.avatarUrl === "string") {
        // URL ảnh cũ (không thay đổi)
        logger.debug("Using existing avatar URL:", data.avatarUrl);
        finalAvatarUrl = data.avatarUrl;
      } else {
        // null hoặc undefined - user removed image
        logger.debug("No avatar URL");
        finalAvatarUrl = null;
      }

      // Tạo data cuối cùng với URL ảnh đã được xử lý (chỉ string | null, không có File)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { avatarUrl: _avatarUrl, ...restData } = data;
      const finalData = {
        ...restData,
        avatarUrl: finalAvatarUrl, // finalAvatarUrl đã là string | null
      } as Omit<CreateUserSchema, "avatarUrl"> & {
        avatarUrl?: string | null;
      } & Omit<UpdateUserSchema, "avatarUrl"> & { avatarUrl?: string | null };

      logger.debug("Final data to submit:", {
        ...finalData,
        avatarUrl: finalAvatarUrl,
      });

      if (isEditing) {
        // Update user
        logger.debug("Updating user:", user!.id);
        const updateData = finalData as Omit<UpdateUserSchema, "avatarUrl"> & {
          avatarUrl?: string | null;
        };
        const updatedUser = (await updateUserMutation.mutateAsync({
          id: user!.id,
          data: updateData,
        })) as User;

        // ✅ Cập nhật latestAvatarUrl để hiển thị ngay lập tức
        setLatestAvatarUrl(updatedUser.avatarUrl ?? undefined);

        // ✅ Reset form với dữ liệu mới để cập nhật avatarUrl
        form.reset({
          ...form.getValues(),
          avatarUrl: updatedUser.avatarUrl || null,
        });

        // Update auth store if current user
        if (updatedUser && authUser && updatedUser.id === authUser.id) {
          useAuthStore.setState({ user: updatedUser });
          queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        }

        // Mark old image for deletion (soft delete) AFTER DB update success
        // This ensures data consistency - if DB update fails, old image is not deleted
        if (previousAvatarUrl && finalAvatarUrl !== previousAvatarUrl) {
          await imageManagement.markImageForDeletion(previousAvatarUrl, {
            entityId: user!.id,
            reason: "replaced",
          });
        }

        // Mark for deletion if image removed
        if (previousAvatarUrl && !finalAvatarUrl) {
          await imageManagement.markImageForDeletion(previousAvatarUrl, {
            entityId: user!.id,
            reason: "removed",
          });
        }
      } else {
        // Create user
        logger.debug("Creating new user");
        const createData = finalData as Omit<CreateUserSchema, "avatarUrl"> & {
          avatarUrl?: string | null;
        };
        const createdUser = (await createUserMutation.mutateAsync(createData)) as User;
        
        // ✅ Cập nhật latestAvatarUrl để hiển thị ngay lập tức (nếu form vẫn mở)
        if (createdUser) {
          setLatestAvatarUrl(createdUser.avatarUrl ?? undefined);
        }
      }
    } catch (error) {
      // Cleanup uploaded image if operation fails
      if (uploadedAvatarUrl) {
        await imageManagement.cleanupImage(uploadedAvatarUrl);
        }

      // useAppMutation sẽ tự động xử lý lỗi và gán vào form
      // Nhưng vẫn log để debug
      logger.error("Error in onSubmit:", error);
      // Hiển thị toast error nếu có
      if (error instanceof Error) {
        toast.error(error.message || t("admin.forms.user.errorOccurred"));
      }
    }
  };

  const handleChangeEmailSuccess = (updatedEmail: string) => {
    if (!updatedEmail) return;
    form.setValue("email", updatedEmail, { shouldDirty: false });
    // ✅ Chỉ invalidate, không refetch - mutation hook đã refetch rồi
    queryClient.invalidateQueries({
      queryKey: ["admin", "users"],
      refetchType: "none", // ✅ Không tự động refetch
    });
    if (user && authUser && user.id === authUser.id) {
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, email: updatedEmail } : state.user,
      }));
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
        refetchType: "none", // ✅ Không tự động refetch
      });
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
                <SheetTitle className="text-xl font-semibold text-card-foreground">
                  {isEditing
                    ? t("admin.forms.user.editUser")
                    : t("admin.forms.user.addNewUser")}
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  {isEditing
                    ? t("admin.forms.user.updateUserInfo")
                    : t("admin.forms.user.createNewUser")}
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
                  <TabsTrigger value="profile">
                    {t("admin.forms.user.profile")}
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    {t("admin.forms.user.history")}
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Profile - Form nhập liệu */}
                <TabsContent value="profile" className="mt-4">
                  <div className="space-y-6">
                    {/* Avatar Upload - Căn giữa */}
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <Controller
                          name="avatarUrl"
                          control={form.control}
                          render={({ field }) => {
                            // Debug: Log form values (only in development)
                            logger.debug("UserForm - Edit mode:", {
                              fieldValue: field.value,
                              userAvatarUrl: user?.avatarUrl,
                              formAvatarUrl: form.watch("avatarUrl"),
                            });
                            // ✅ Ưu tiên latestAvatarUrl để hiển thị ngay sau khi update
                            const effectiveValue = (() => {
                              if (field.value !== undefined) {
                                return field.value; // File hoặc null
                              }
                              if (latestAvatarUrl !== undefined) {
                                return typeof latestAvatarUrl === "string" ? latestAvatarUrl : null;
                              }
                              return field.value;
                            })();

                            return (
                              <ImageUpload
                                key={(() => {
                                  // ✅ Key thay đổi khi avatar URL thay đổi để force re-render
                                  const currentValue = (() => {
                                    if (field.value !== undefined) {
                                      return field.value instanceof File 
                                        ? `file-${field.value.name}-${field.value.size}` 
                                        : field.value === null ? "null" : String(field.value);
                                    }
                                    if (latestAvatarUrl !== undefined) {
                                      return typeof latestAvatarUrl === "string" ? latestAvatarUrl : "null";
                                    }
                                    return user?.avatarUrl || "no-avatar";
                                  })();
                                  return `user-avatar-${user?.id || "new"}-${currentValue}`;
                                })()}
                                value={effectiveValue}
                                previewUrl={
                                  // Chỉ dùng previewUrl khi field.value là undefined và không có latestAvatarUrl
                                  // Nếu field.value === null (user đã xóa), không dùng previewUrl
                                  field.value === undefined && 
                                  latestAvatarUrl === undefined && 
                                  user?.avatarUrl
                                    ? user.avatarUrl
                                    : null
                                }
                                onChange={(file) => {
                                  field.onChange(file || null);
                                  form.trigger("avatarUrl"); // Trigger validation
                                }}
                                size="lg"
                                disabled={isPending}
                              />
                            );
                          }}
                        />
                      </div>
                      {/* Error message cho avatarUrl */}
                      {form.formState.errors.avatarUrl && (
                        <div className="flex items-start justify-center gap-1.5 text-xs text-red-600">
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{form.formState.errors.avatarUrl.message}</span>
                        </div>
                      )}
                    </div>

                    {/* Full Name */}
                    <FormField
                      label={t("admin.forms.user.fullName")}
                      htmlFor="fullName"
                      required
                      error={form.formState.errors.fullName}
                    >
                      <Input
                        id="fullName"
                        {...form.register("fullName")}
                        placeholder={t("admin.forms.user.enterFullName")}
                        className={cn(
                          form.formState.errors.fullName &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                    </FormField>

                    {/* Email */}
                    <FormField
                      label={t("admin.forms.user.email")}
                      htmlFor="email"
                      required
                      error={
                        (form.formState.errors as Record<string, FieldError>)
                          .email
                      }
                      description={
                        isEditing
                          ? t("admin.forms.user.emailCannotChange")
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          id="email"
                          type="email"
                          {...form.register("email" as keyof UserFormData)}
                          placeholder={t("admin.forms.user.enterEmail")}
                          disabled={isEditing}
                          className={cn(
                            "flex-1",
                            (
                              form.formState.errors as Record<
                                string,
                                { message?: string }
                              >
                            ).email &&
                              "border-red-500 focus:border-red-500 focus:ring-red-500",
                            isEditing && "bg-muted/40 cursor-not-allowed"
                          )}
                        />
                        {canEditEmail && (
                          <Button
                            type="button"
                            size="icon"
                            className="shrink-0"
                            onClick={() => setChangeEmailDialogOpen(true)}
                            disabled={isPending}
                            title={t("admin.forms.user.changeUserEmail")}
                          >
                            <PenLine className="h-4 w-4" />
                            <span className="sr-only">
                              {t("admin.forms.user.changeEmail")}
                            </span>
                          </Button>
                        )}
                      </div>
                    </FormField>

                    {/* Password */}
                    <FormField
                      label={t("admin.forms.user.password")}
                      htmlFor="password"
                      error={form.formState.errors.password}
                      description={
                        isEditing
                          ? t("admin.forms.user.leaveEmptyToKeepPassword")
                          : undefined
                      }
                    >
                      <Input
                        id="password"
                        type="password"
                        {...form.register("password")}
                        placeholder={t("admin.forms.user.enterNewPassword")}
                        className={cn(
                          form.formState.errors.password &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                    </FormField>

                    {/* Phone */}
                    <FormField
                      label={t("admin.forms.user.phoneNumber")}
                      htmlFor="phone"
                      error={form.formState.errors.phone}
                    >
                      <Input
                        id="phone"
                        type="tel"
                        {...form.register("phone")}
                        placeholder={t("admin.forms.user.enterPhoneNumber")}
                        className={cn(
                          form.formState.errors.phone &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                    </FormField>

                    {/* Roles - Selectable Cards */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">
                        {t("admin.forms.user.roles")}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      {rolesLoading ? (
                        <p className="text-sm text-muted-foreground">
                          {t("admin.forms.user.loadingRoles")}
                        </p>
                      ) : roles.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {t("admin.forms.user.noRolesAvailable")}
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
                                    : "border-border bg-card hover:border-indigo-200 hover:bg-muted/40"
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
                                    className="cursor-pointer font-semibold text-card-foreground"
                                  >
                                    {role.roleName}
                                  </Label>
                                  {role.description && (
                                    <p className="mt-1 text-xs text-muted-foreground">
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
                        className="text-sm font-medium text-foreground"
                      >
                        {t("admin.forms.user.status")}
                      </Label>
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="status"
                          checked={watchedStatus === "ACTIVE"}
                          onCheckedChange={handleStatusToggle}
                          disabled={
                            isEditing &&
                            authUser &&
                            user &&
                            authUser.id === user.id
                          }
                        />
                        <Label
                          htmlFor="status"
                          className={cn(
                            "font-normal",
                            isEditing &&
                              authUser &&
                              user &&
                              authUser.id === user.id
                              ? "cursor-not-allowed text-muted-foreground"
                              : "cursor-pointer"
                          )}
                        >
                          {watchedStatus === "ACTIVE"
                            ? t("admin.forms.user.active")
                            : t("admin.forms.user.inactive")}
                          {isEditing &&
                            authUser &&
                            user &&
                            authUser.id === user.id && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (Bạn không thể tự thay đổi trạng thái của chính mình)
                              </span>
                            )}
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: History - Lịch sử đăng nhập */}
                <TabsContent value="history" className="mt-4">
                  {user ? (
                    <UserHistoryTable userId={user.id} />
                  ) : (
                    <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                      Không tìm thấy thông tin người dùng
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              /* Create mode: Chỉ hiển thị form, không có Tabs */
              <div className="space-y-6">
                {/* Avatar Upload - Căn giữa */}
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <Controller
                      name="avatarUrl"
                      control={form.control}
                        render={({ field }) => {
                          // ✅ Ưu tiên latestAvatarUrl để hiển thị ngay sau khi create
                          const effectiveValue = (() => {
                            if (field.value !== undefined) {
                              return field.value; // File hoặc null
                            }
                            if (latestAvatarUrl !== undefined) {
                              return typeof latestAvatarUrl === "string" ? latestAvatarUrl : null;
                            }
                            return field.value;
                          })();

                          return (
                        <ImageUpload
                              key={(() => {
                                // ✅ Key thay đổi khi avatar URL thay đổi để force re-render
                                const currentValue = (() => {
                                  if (field.value !== undefined) {
                                    return field.value instanceof File 
                                      ? `file-${field.value.name}-${field.value.size}` 
                                      : field.value === null ? "null" : String(field.value);
                                  }
                                  if (latestAvatarUrl !== undefined) {
                                    return typeof latestAvatarUrl === "string" ? latestAvatarUrl : "null";
                                  }
                                  return "no-avatar";
                                })();
                                return `user-avatar-new-${currentValue}`;
                              })()}
                              value={effectiveValue}
                          previewUrl={null}
                          onChange={(file) => {
                            field.onChange(file || null);
                            form.trigger("avatarUrl"); // Trigger validation
                          }}
                          size="lg"
                          disabled={isPending}
                        />
                          );
                        }}
                    />
                  </div>
                  {/* Error message cho avatarUrl */}
                  {form.formState.errors.avatarUrl && (
                    <div className="flex items-start justify-center gap-1.5 text-xs text-red-600">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{form.formState.errors.avatarUrl.message}</span>
                    </div>
                  )}
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
                  label={t("admin.forms.user.email")}
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
                    placeholder={t("admin.forms.user.enterEmail")}
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
                  label={t("admin.forms.user.password")}
                  htmlFor="password"
                  required
                  error={form.formState.errors.password}
                >
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    placeholder={t("admin.forms.user.enterNewPassword")}
                    className={cn(
                      form.formState.errors.password &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                </FormField>

                {/* Phone */}
                <FormField
                  label={t("admin.forms.user.phoneNumber")}
                  htmlFor="phone"
                  error={form.formState.errors.phone}
                >
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                    placeholder={t("admin.forms.user.enterPhoneNumber")}
                    className={cn(
                      form.formState.errors.phone &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                </FormField>

                {/* Roles - Selectable Cards */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    {t("admin.forms.user.roles")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  {rolesLoading ? (
                    <p className="text-sm text-muted-foreground">
                      {t("admin.forms.user.loadingRoles")}
                    </p>
                  ) : roles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("admin.forms.user.noRolesAvailable")}
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
                                : "border-border bg-card hover:border-indigo-200 hover:bg-muted/40"
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
                                className="cursor-pointer font-semibold text-card-foreground"
                              >
                                {role.roleName}
                              </Label>
                              {role.description && (
                                <p className="mt-1 text-xs text-muted-foreground">
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
                className="flex-1 rounded-lg border-border bg-card text-card-foreground font-semibold transition hover:bg-muted/40 hover:text-foreground focus:ring-1 focus:ring-primary/30"
                disabled={isPending}
              >
                {t("admin.forms.common.cancel")}
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
                    {t("admin.forms.common.loading")}
                  </>
                ) : isEditing ? (
                  t("admin.common.save")
                ) : (
                  t("admin.common.addNew")
                )}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
      {canEditEmail && user && (
        <ChangeEmailDialog
          userId={user.id}
          userName={user.fullName}
          currentEmail={watchedEmail || user.email}
          isOpen={isChangeEmailDialogOpen}
          onClose={() => setChangeEmailDialogOpen(false)}
          onSuccess={(updatedEmail) => handleChangeEmailSuccess(updatedEmail)}
        />
      )}
    </Sheet>
  );
}
