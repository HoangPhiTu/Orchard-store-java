"use client";

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
import { useDeleteConcentration } from "@/hooks/use-concentrations";
import { Loader2 } from "lucide-react";

interface DeleteConcentrationDialogProps {
  concentrationId: number;
  concentrationName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteConcentrationDialog({
  concentrationId,
  concentrationName,
  isOpen,
  onClose,
}: DeleteConcentrationDialogProps) {
  const deleteMutation = useDeleteConcentration();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(concentrationId);
      onClose();
    } catch (error) {
      // Error đã được xử lý bởi useAppMutation
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa nồng độ</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa nồng độ{" "}
            <strong>{concentrationName}</strong>? Hành động này không thể hoàn
            tác.
            {deleteMutation.isError && (
              <div className="mt-2 text-sm text-destructive">
                Không thể xóa nồng độ này vì đã có sản phẩm đang sử dụng.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
