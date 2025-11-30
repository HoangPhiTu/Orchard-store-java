"use client";

import { Loader2, Lock, Unlock } from "lucide-react";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { userService } from "@/services/user.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { User } from "@/types/user.types";
import { useI18n } from "@/hooks/use-i18n";

interface ToggleStatusDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function ToggleStatusDialog({
  user,
  isOpen,
  onClose,
}: ToggleStatusDialogProps) {
  const { t } = useI18n();
  const isLocking = user.status === "ACTIVE";

  const toggleStatusMutation = useAppMutation({
    mutationFn: () => userService.toggleUserStatus(user.id),
    queryKey: ["admin", "users"], // Invalidate users list after toggle
    onClose: onClose, // Close dialog on success
    successMessage: isLocking
      ? t("admin.common.success")
      : t("admin.common.success"),
    showErrorToast: true, // Show toast for errors
  });

  const handleConfirm = async () => {
    await toggleStatusMutation.mutateAsync();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                isLocking ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
              }`}
            >
              {isLocking ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-card-foreground">
              {isLocking ? t("admin.dialogs.lockAccount") : t("admin.dialogs.unlockAccount")}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4 text-muted-foreground">
            {isLocking ? t("admin.dialogs.lockAccountConfirm") : t("admin.dialogs.unlockAccountConfirm")}{" "}
            <span className="font-semibold text-card-foreground">
              {user.fullName}
            </span>?
            {isLocking && (
              <span className="mt-2 block text-sm text-warning">
                ⚠️ {t("admin.dialogs.accountLockedWarning")}
              </span>
            )}
            {!isLocking && (
              <span className="mt-2 block text-sm text-success">
                ✓ {t("admin.dialogs.accountUnlockedInfo")}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            disabled={toggleStatusMutation.isPending}
            className="rounded-lg border-border bg-card text-card-foreground font-semibold transition hover:bg-muted/40 hover:text-foreground focus:ring-1 focus:ring-primary/30"
          >
            {t("admin.dialogs.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={toggleStatusMutation.isPending}
            className={`rounded-lg text-white ${
              isLocking
                ? "bg-warning hover:bg-warning/90 focus:ring-2 focus:ring-warning/30"
                : "bg-success hover:bg-success/90 focus:ring-2 focus:ring-success/30"
            }`}
          >
            {toggleStatusMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("admin.common.loading")}
              </>
            ) : (
              <>
                {isLocking ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    {t("admin.dialogs.lockAccount")}
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    {t("admin.dialogs.unlockAccount")}
                  </>
                )}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
