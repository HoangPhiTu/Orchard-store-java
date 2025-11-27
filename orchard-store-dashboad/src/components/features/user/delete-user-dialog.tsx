"use client";

import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

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
import { userService } from "@/services/user.service";

interface DeleteUserDialogProps {
  userId: number;
  userName?: string;
  userEmail?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteUserDialog({
  userId,
  userName,
  userEmail,
  isOpen,
  onClose,
  onSuccess,
}: DeleteUserDialogProps) {
  // ✅ Sử dụng useAppMutation - Tự động xử lý error, success
  const deleteUserMutation = useAppMutation({
    mutationFn: () => userService.deleteUser(userId),
    queryKey: ["admin", "users"], // ✅ Tự động refresh danh sách users
    onClose: () => {
      onClose();
      onSuccess?.(); // Gọi callback sau khi đóng
    },
    successMessage: "Xóa người dùng thành công", // ✅ Tự động hiển thị toast success
    showErrorToast: true, // ✅ Hiển thị toast error nếu có lỗi
  });

  // ✅ Hàm xóa cực kỳ ngắn gọn - không cần try-catch
  const handleDelete = async () => {
    // ✅ Dùng mutateAsync để có thể await
    // ✅ Không cần try-catch: Hook tự động xử lý lỗi
    // ✅ Nếu thành công: Hook tự động gọi onClose() trong onSuccess
    // ✅ Nếu lỗi: Hook tự động hiển thị toast error, không gọi onClose()
    await deleteUserMutation.mutateAsync();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <div className="relative">
          {/* Loading Overlay */}
          <LoadingOverlay isLoading={deleteUserMutation.isPending} />

          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-card-foreground">
                Xóa người dùng
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4 text-muted-foreground">
              Bạn có chắc chắn muốn xóa người dùng này không? Hành động này
              không thể hoàn tác.
              {userName && (
                <div className="mt-3 rounded-lg bg-muted/40 p-3">
                  <p className="text-sm font-medium text-card-foreground">
                    {userName}
                  </p>
                  {userEmail && (
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteUserMutation.isPending}
              className="rounded-lg border-border bg-card text-card-foreground font-semibold transition hover:bg-muted/40 hover:text-foreground focus:ring-1 focus:ring-primary/30"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteUserMutation.isPending}
              className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-2 focus:ring-destructive/30"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
