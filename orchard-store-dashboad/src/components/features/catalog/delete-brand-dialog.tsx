"use client";

import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useDeleteBrand } from "@/hooks/use-brands";
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
import { useI18n } from "@/hooks/use-i18n";
import { logger } from "@/lib/logger";

interface DeleteBrandDialogProps {
  brandId: number;
  brandName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteBrandDialog({
  brandId,
  brandName,
  isOpen,
  onClose,
  onSuccess,
}: DeleteBrandDialogProps) {
  const { t } = useI18n();
  const deleteBrandMutation = useDeleteBrand();

  const handleDelete = async () => {
    try {
      await deleteBrandMutation.mutateAsync(brandId);
      onClose();
      onSuccess?.();
    } catch (error) {
      // Error is already handled by useAppMutation
      logger.error("Failed to delete brand:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <div className="relative">
          {/* Loading Overlay */}
          <LoadingOverlay isLoading={deleteBrandMutation.isPending} />

          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-foreground">
                {t("admin.dialogs.deleteBrand")}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4 text-muted-foreground">
              {t("admin.dialogs.deleteBrandConfirm")}{" "}
              {t("admin.dialogs.deleteUserWarning")}
              {brandName && (
                <div className="mt-3 rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground">
                    {brandName}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteBrandMutation.isPending}
              className="rounded-lg font-semibold"
            >
              {t("admin.dialogs.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBrandMutation.isPending}
              className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-2 focus:ring-destructive/30"
            >
              {deleteBrandMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("admin.common.loading")}
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("admin.common.delete")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
