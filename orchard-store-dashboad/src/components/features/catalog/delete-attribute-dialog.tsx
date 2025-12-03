"use client";

import { useState } from "react";
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
import { useDeleteAttribute } from "@/hooks/use-attributes";
import type { ProductAttribute } from "@/types/attribute.types";
import { useI18n } from "@/hooks/use-i18n";

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!attribute?.id) return;

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(attribute.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting attribute:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!attribute) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("admin.attributes.deleteConfirmTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("admin.attributes.deleteConfirmMessage")
              .replace("{name}", attribute.attributeName || attribute.attributeKey)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? t("common.deleting") : t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

