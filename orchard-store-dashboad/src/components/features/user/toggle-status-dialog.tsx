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
  const isLocking = user.status === "ACTIVE";
  const actionText = isLocking ? "khóa" : "mở khóa";
  const actionTextCapitalized = isLocking ? "Khóa" : "Mở khóa";

  const toggleStatusMutation = useAppMutation({
    mutationFn: () => userService.toggleUserStatus(user.id),
    queryKey: ["admin", "users"], // Invalidate users list after toggle
    onClose: onClose, // Close dialog on success
    successMessage: isLocking
      ? `Đã khóa tài khoản "${user.fullName}" thành công`
      : `Đã mở khóa tài khoản "${user.fullName}" thành công`,
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
                isLocking ? "bg-orange-100" : "bg-green-100"
              }`}
            >
              {isLocking ? (
                <Lock className="h-5 w-5 text-orange-600" />
              ) : (
                <Unlock className="h-5 w-5 text-green-600" />
              )}
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-slate-900">
              {actionTextCapitalized} tài khoản
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4 text-slate-600">
            Bạn có chắc chắn muốn {actionText} tài khoản{" "}
            <span className="font-semibold text-slate-900">
              {user.fullName}
            </span>{" "}
            không?
            {isLocking && (
              <span className="block mt-2 text-sm text-orange-600">
                ⚠️ Tài khoản bị khóa sẽ không thể đăng nhập vào hệ thống.
              </span>
            )}
            {!isLocking && (
              <span className="block mt-2 text-sm text-green-600">
                ✓ Tài khoản sẽ được kích hoạt lại và có thể đăng nhập.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            disabled={toggleStatusMutation.isPending}
            className="rounded-lg border-slate-400 bg-white text-slate-900 font-semibold transition hover:bg-slate-100 hover:text-slate-950 focus:ring-2 focus:ring-slate-400"
          >
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={toggleStatusMutation.isPending}
            className={`rounded-lg ${
              isLocking
                ? "bg-orange-600 hover:bg-orange-700 text-white focus:ring-2 focus:ring-orange-300"
                : "bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-300"
            }`}
          >
            {toggleStatusMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                {isLocking ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Khóa tài khoản
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Mở khóa tài khoản
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
