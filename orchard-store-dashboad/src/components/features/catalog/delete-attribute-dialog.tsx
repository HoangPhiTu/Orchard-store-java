"use client";

import { Trash2, Loader2, AlertTriangle } from "lucide-react";
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
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { useDeleteAttribute } from "@/hooks/use-attributes";
import type { ProductAttribute } from "@/types/attribute.types";
import { useI18n } from "@/hooks/use-i18n";
import { logger } from "@/lib/logger";

interface DeleteAttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute: ProductAttribute | null;
}

export function DeleteAttributeDialog({
  open,
  onOpenChange,
  attribute,
}: DeleteAttributeDialogProps) {
  const { t } = useI18n();
  const deleteMutation = useDeleteAttribute();

  const handleDelete = async () => {
    if (!attribute?.id) return;

    try {
      await deleteMutation.mutateAsync(attribute.id);
      onOpenChange(false);
    } catch (error) {
      // Error is already handled by useAppMutation
      logger.error("Failed to delete attribute:", error);
    }
  };

  if (!attribute) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <div className="relative">
          {/* Loading Overlay */}
          <LoadingOverlay isLoading={deleteMutation.isPending} />

          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-foreground">
                {t("admin.attributes.deleteConfirmTitle")}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4 text-muted-foreground">
              {t("admin.attributes.deleteConfirmMessage").replace(
                "{name}",
                attribute.attributeName || attribute.attributeKey
              )}
              {attribute.attributeName && (
                <div className="mt-3 rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground">
                    {attribute.attributeName}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="rounded-lg font-semibold"
            >
              {t("admin.dialogs.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-2 focus:ring-destructive/30"
            >
              {deleteMutation.isPending ? (
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
