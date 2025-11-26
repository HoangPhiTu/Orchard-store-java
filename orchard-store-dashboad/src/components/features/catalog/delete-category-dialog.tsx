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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-slate-900">
                Xóa danh mục
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4 text-slate-600">
              Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không
              thể hoàn tác. Hình ảnh và tất cả thông tin liên quan sẽ bị xóa
              vĩnh viễn.
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm font-medium text-amber-900">
                  ⚠️ Lưu ý: Không thể xóa danh mục nếu đang có danh mục con hoặc
                  sản phẩm thuộc về nó.
                </p>
              </div>
              {categoryName && (
                <div className="mt-3 rounded-lg bg-slate-100 p-3">
                  <p className="text-sm font-medium text-slate-900">
                    {categoryName}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteCategoryMutation.isPending}
              className="rounded-lg border-slate-400 bg-white text-slate-900 font-semibold transition hover:bg-slate-100 hover:text-slate-950 focus:ring-2 focus:ring-slate-400"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCategoryMutation.isPending}
              className="rounded-lg bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-300"
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
