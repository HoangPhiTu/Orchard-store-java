"use client";

import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useDeleteCategory } from "@/hooks/use-categories";
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

interface DeleteCategoryDialogProps {
  categoryId: number;
  categoryName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  isOpen,
  onClose,
  onSuccess,
}: DeleteCategoryDialogProps) {
  const deleteCategoryMutation = useDeleteCategory();

  const handleDelete = async () => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
      onClose();
      onSuccess?.();
    } catch (error) {
      // Error is already handled by useAppMutation
      console.error("Failed to delete category:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <div className="relative">
          {/* Loading Overlay */}
          <LoadingOverlay isLoading={deleteCategoryMutation.isPending} />

          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-foreground">
                Xóa danh mục
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4 text-muted-foreground">
              Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không
              thể hoàn tác. Hình ảnh và tất cả thông tin liên quan sẽ bị xóa
              vĩnh viễn.
              <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 p-3">
                <p className="text-sm font-medium text-warning">
                  ⚠️ Lưu ý: Không thể xóa danh mục nếu đang có danh mục con hoặc
                  sản phẩm thuộc về nó.
                </p>
              </div>
              {categoryName && (
                <div className="mt-3 rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground">
                    {categoryName}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

            <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteCategoryMutation.isPending}
              className="rounded-lg font-semibold"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCategoryMutation.isPending}
              className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-2 focus:ring-destructive/30"
            >
              {deleteCategoryMutation.isPending ? (
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
