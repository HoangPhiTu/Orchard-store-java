"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Key, Loader2 } from "lucide-react";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { FormField } from "@/components/ui/form-field";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  adminResetPasswordSchema,
  type AdminResetPasswordSchema,
} from "@/lib/schemas/admin-reset-password.schema";
import { userService } from "@/services/user.service";
import { cn } from "@/lib/utils";

interface ResetPasswordDialogProps {
  userId: number;
  userName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ResetPasswordDialog({
  userId,
  userName,
  isOpen,
  onClose,
  onSuccess,
}: ResetPasswordDialogProps) {
  const form = useForm<AdminResetPasswordSchema>({
    resolver: zodResolver(adminResetPasswordSchema),
    defaultValues: {
      newPassword: "",
    },
    shouldFocusError: true, // ✅ Tự động focus vào field lỗi đầu tiên
  });

  // ✅ Sử dụng useAppMutation - Tự động xử lý error, success
  const resetPasswordMutation = useAppMutation({
    mutationFn: (data: AdminResetPasswordSchema) =>
      userService.resetPassword(userId, data.newPassword),
    queryKey: ["admin", "users"], // Tự động refresh danh sách users
    form: form, // ✅ Tự động map lỗi vào form fields
    onClose: () => {
      form.reset();
      onClose();
      onSuccess?.(); // Gọi callback sau khi đóng
    },
    successMessage: "Đặt lại mật khẩu thành công", // ✅ Tự động hiển thị toast success
    resetOnSuccess: true, // ✅ Tự động reset form sau khi thành công
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // ✅ Hàm submit cực kỳ ngắn gọn - không cần try-catch
  const onSubmit = async (data: AdminResetPasswordSchema) => {
    // ✅ Dùng mutateAsync để có thể await
    // ✅ Không cần try-catch: Hook tự động xử lý lỗi và gán vào form
    // ✅ Nếu thành công: Hook tự động gọi onClose() trong onSuccess
    // ✅ Nếu lỗi: Hook tự động gán lỗi vào form, không gọi onClose()
    await resetPasswordMutation.mutateAsync(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogClose />
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Key className="h-5 w-5" />
            <DialogTitle className="text-foreground">
              Đặt lại mật khẩu
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {userName
              ? `Nhập mật khẩu mới cho user: ${userName}`
              : "Nhập mật khẩu mới cho user này"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative space-y-4 px-6"
        >
          {/* Loading Overlay */}
          <LoadingOverlay isLoading={resetPasswordMutation.isPending} />

          <FormField
            label="Mật khẩu mới"
            htmlFor="newPassword"
            required
            error={form.formState.errors.newPassword}
          >
            <Input
              id="newPassword"
              type="password"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              {...form.register("newPassword")}
              className={cn(
                form.formState.errors.newPassword &&
                  "border-destructive focus:border-destructive focus:ring-destructive/60"
              )}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={resetPasswordMutation.isPending}
              className="rounded-lg border-border bg-card text-card-foreground font-semibold hover:bg-muted/40 hover:text-foreground focus:ring-1 focus:ring-primary/30"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="rounded-lg"
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
