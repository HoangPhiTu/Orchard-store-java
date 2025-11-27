"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Mail, Shield, Edit, Phone } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/shared/image-upload";
import { uploadService } from "@/services/upload.service";
import { userService } from "@/services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User as UserType } from "@/types/auth.types";

// Schema cho profile edit (fullName, phone, và avatarUrl)
const profileEditSchema = z.object({
  fullName: z
    .string()
    .min(1, "Vui lòng nhập họ tên")
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(50, "Họ tên không được vượt quá 50 ký tự")
    .regex(
      /^[a-zA-ZÀ-ỹĂăÂâĐđÊêÔôƠơƯư\s]+$/,
      "Họ tên chỉ được chứa chữ cái và khoảng trắng"
    ),
  phone: z
    .union([
      z
        .string()
        .regex(
          /^(0|\+84|84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$/,
          "Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)"
        ),
      z.null(),
    ])
    .optional()
    .nullable(),
  avatarUrl: z
    .union([z.string().url(), z.instanceof(File), z.null()])
    .optional()
    .nullable(),
});

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

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

export default function ProfilePage() {
  const { data: user, isLoading, error } = useCurrentUser();
  const { user: storeUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Fallback to store user if query fails
  const displayUser: UserType | null = (user as UserType) || storeUser;

  // State for edit profile sheet
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Form cho edit profile
  const editForm = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      fullName: "",
      phone: null,
      avatarUrl: null,
    },
  });

  // State cho avatar trong form
  const [formAvatarFile, setFormAvatarFile] = useState<File | null>(null);

  // Reset form khi user data thay đổi hoặc mở sheet
  useEffect(() => {
    if (displayUser && isEditSheetOpen) {
      editForm.reset({
        fullName: displayUser.fullName || "",
        phone: displayUser.phone || null,
        avatarUrl: displayUser.avatarUrl || null,
      });
    }
  }, [displayUser, isEditSheetOpen, editForm]);

  const handleEditSheetOpenChange = (open: boolean) => {
    setIsEditSheetOpen(open);
    setFormAvatarFile(null);
  };

  // Mutation để update profile info
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileEditFormData) => {
      if (!displayUser?.id) {
        throw new Error("User ID không tồn tại");
      }

      const previousAvatarUrl = displayUser.avatarUrl || null;
      let avatarUrl = data.avatarUrl;
      let uploadedAvatarUrl: string | null = null;
      const isRemovingAvatar =
        !formAvatarFile &&
        (data.avatarUrl === null || data.avatarUrl === undefined) &&
        !!previousAvatarUrl;

      // Nếu có file avatar mới, upload trước
      if (formAvatarFile) {
        try {
          uploadedAvatarUrl = await uploadService.uploadImage(
            formAvatarFile,
            "users"
          );
          avatarUrl = uploadedAvatarUrl;
        } catch (error) {
          throw new Error(
            error instanceof Error
              ? error.message
              : "Upload ảnh thất bại. Vui lòng thử lại."
          );
        }
      }

      const normalizedAvatarUrl =
        avatarUrl && typeof avatarUrl === "string" ? avatarUrl : null;

      // Update user với thông tin mới
      try {
        const response = await userService.updateUser(displayUser.id, {
          fullName: data.fullName,
          phone: data.phone,
          avatarUrl: normalizedAvatarUrl,
        });

        const hasNewAvatar =
          !!uploadedAvatarUrl &&
          typeof normalizedAvatarUrl === "string" &&
          normalizedAvatarUrl !== previousAvatarUrl;

        if ((hasNewAvatar || isRemovingAvatar) && previousAvatarUrl) {
          try {
            await uploadService.deleteImage(previousAvatarUrl);
          } catch (deleteError) {
            console.warn("⚠️ Không thể xóa ảnh cũ:", deleteError);
          }
        }

        return response;
      } catch (error) {
        // Nếu update thất bại, xóa ảnh mới đã upload để tránh rác
        if (uploadedAvatarUrl) {
          try {
            await uploadService.deleteImage(uploadedAvatarUrl);
          } catch (cleanupError) {
            console.warn("⚠️ Không thể xóa ảnh mới sau khi lỗi:", cleanupError);
          }
        }
        throw error;
      }
    },
    onSuccess: (updatedUser) => {
      // Invalidate và refetch current user data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      if (updatedUser) {
        useAuthStore.setState({ user: updatedUser as UserType });
      }
      toast.success("Cập nhật thông tin thành công");
      setIsEditSheetOpen(false);
      setFormAvatarFile(null); // Reset avatar file sau khi thành công
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật thông tin thất bại");
    },
  });

  // Helper function để lấy initials từ fullName
  const getInitials = (fullName: string): string => {
    const words = fullName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  // Debug: Log avatarUrl
  console.log("👤 Profile Page - displayUser:", {
    id: displayUser?.id,
    email: displayUser?.email,
    avatarUrl: displayUser?.avatarUrl,
    hasAvatarUrl: Boolean(displayUser?.avatarUrl),
    fullUser: displayUser, // Log toàn bộ user object để debug
  });

  if (isLoading) {
    return (
        <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !displayUser) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Lỗi</CardTitle>
            <CardDescription>
              Không thể tải thông tin người dùng. Vui lòng thử lại sau.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Thông tin cá nhân
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xem và quản lý thông tin tài khoản của bạn
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {/* Avatar chỉ để hiển thị */}
            <Avatar className="h-20 w-20">
              {displayUser?.avatarUrl ? (
                <AvatarImage
                  src={displayUser.avatarUrl}
                  alt={displayUser.fullName || "Avatar"}
                  onError={(
                    e: React.SyntheticEvent<HTMLImageElement, Event>
                  ) => {
                    console.error("❌ Error loading profile avatar:", {
                      url: displayUser.avatarUrl,
                      error: e,
                    });
                  }}
                  onLoad={() => {
                    console.log(
                      "✅ Profile avatar loaded:",
                      displayUser.avatarUrl
                    );
                  }}
                />
              ) : null}
              <AvatarFallback className="bg-linear-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white">
                {displayUser ? getInitials(displayUser.fullName) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl text-foreground">
                {displayUser?.fullName || "User"}
              </CardTitle>
              <CardDescription className="mt-1">
                {displayUser?.email || ""}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />

          {/* User ID */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">ID</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                #{displayUser?.id || "N/A"}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {displayUser?.email || "N/A"}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Phone className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Số điện thoại
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {displayUser?.phone || "Chưa cập nhật"}
              </p>
            </div>
          </div>

          {/* Roles */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium text-foreground">Vai trò</p>
              <div className="flex flex-wrap gap-1.5">
                {displayUser?.roles && displayUser.roles.length > 0 ? (
                  displayUser.roles.map((role: string, index: number) => {
                    // Remove "ROLE_" prefix if present
                    const roleName = role.replace(/^ROLE_/, "");
                    return (
                      <Badge
                        key={index}
                        variant={getRoleBadgeVariant(roleName)}
                      >
                        {roleName}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Không có vai trò
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Permissions (if available) */}
          {displayUser?.authorities && displayUser.authorities.length > 0 && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="mb-2 text-sm font-medium text-foreground">
                    Quyền hạn
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {displayUser.authorities.map(
                      (permission: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {permission}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <div className="px-6 pb-6">
          <Button
            onClick={() => handleEditSheetOpenChange(true)}
            className="w-full"
            variant="outline"
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa thông tin cá nhân
          </Button>
        </div>
      </Card>

      {/* Edit Profile Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={handleEditSheetOpenChange}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Chỉnh sửa thông tin cá nhân</SheetTitle>
            <SheetDescription>
              Cập nhật thông tin cá nhân của bạn. Email và vai trò không thể
              thay đổi.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={editForm.handleSubmit((data) => {
              // Gán avatarFile vào data trước khi submit
              const formData = {
                ...data,
                avatarUrl: formAvatarFile || data.avatarUrl,
              };
              updateProfileMutation.mutate(formData);
            })}
            className="space-y-6 mt-6"
          >
            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label>Ảnh đại diện</Label>
              <div className="flex justify-center">
                <ImageUpload
                  value={formAvatarFile}
                  previewUrl={displayUser?.avatarUrl || null}
                  onChange={(file) => {
                    setFormAvatarFile(file);
                    editForm.setValue("avatarUrl", file || null);
                  }}
                  disabled={updateProfileMutation.isPending}
                  size="md"
                />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Nhấn vào avatar để chọn ảnh mới
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Họ tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                {...editForm.register("fullName")}
                placeholder="Nhập họ tên"
                disabled={updateProfileMutation.isPending}
              />
              {editForm.formState.errors.fullName && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                {...editForm.register("phone")}
                placeholder="Nhập số điện thoại (VD: 0912345678)"
                disabled={updateProfileMutation.isPending}
              />
              {editForm.formState.errors.phone && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={displayUser?.email || ""}
                disabled
                className="bg-muted/40 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
            </div>

            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleEditSheetOpenChange(false)}
                disabled={updateProfileMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
