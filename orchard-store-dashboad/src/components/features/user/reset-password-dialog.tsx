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
import { useRateLimit } from "@/lib/security/rate-limit-utils";
import { toast } from "sonner";
import { useI18n } from "@/hooks/use-i18n";

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
  const { t } = useI18n();
  // Rate limiting: Max 5 attempts per 15 minutes
  const { checkRateLimit, getRemainingTime, resetRateLimit } = useRateLimit({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    key: `reset_password_${userId}`,
  });

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

  // ✅ Hàm submit với rate limiting
  const onSubmit = async (data: AdminResetPasswordSchema) => {
    // Check rate limit before submitting
    if (!checkRateLimit()) {
      const remaining = getRemainingTime();
      const remainingStr =
        remaining > 0
          ? `${Math.floor(remaining / 60000)} phút ${Math.floor(
              (remaining % 60000) / 1000
            )} giây`
          : "một chút";
      toast.error(
        `Quá nhiều lần thử. Vui lòng đợi ${remainingStr} trước khi thử lại.`
      );
      return;
    }

    try {
      // ✅ Dùng mutateAsync để có thể await
      // ✅ Không cần try-catch: Hook tự động xử lý lỗi và gán vào form
      // ✅ Nếu thành công: Hook tự động gọi onClose() trong onSuccess
      // ✅ Nếu lỗi: Hook tự động gán lỗi vào form, không gọi onClose()
      await resetPasswordMutation.mutateAsync(data);

      // Reset rate limit on success
      resetRateLimit();
    } catch (error) {
      // Error is already handled by useAppMutation
      // Rate limit is already incremented by checkRateLimit()
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogClose />
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Key className="h-5 w-5" />
            <DialogTitle className="text-foreground">
              {t("admin.dialogs.resetPassword")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {userName
              ? `${t("admin.dialogs.resetPasswordForUser")}: ${userName}`
              : t("admin.dialogs.resetPasswordForUser")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative space-y-4 px-6"
        >
          {/* Loading Overlay */}
          <LoadingOverlay isLoading={resetPasswordMutation.isPending} />

          <FormField
            label={t("admin.dialogs.newPassword")}
            htmlFor="newPassword"
            required
            error={form.formState.errors.newPassword}
          >
            <Input
              id="newPassword"
              type="password"
              placeholder={t("admin.dialogs.enterNewPassword")}
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
              {t("admin.dialogs.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="rounded-lg"
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("admin.common.loading")}
                </>
              ) : (
                t("admin.dialogs.confirm")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
