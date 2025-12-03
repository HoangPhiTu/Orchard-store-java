"use client";

import React from "react";
import { Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableRow, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ProductAttribute } from "@/types/attribute.types";
import { useI18n } from "@/hooks/use-i18n";

interface AttributeRowProps {
  attribute: ProductAttribute;
  onEdit?: (attribute: ProductAttribute) => void;
  onDelete?: (attribute: ProductAttribute) => void;
}

export const AttributeRow = React.memo<AttributeRowProps>(
  ({ attribute, onEdit, onDelete }) => {
    const { t } = useI18n();
    const displayName = attribute.attributeName?.trim() || attribute.attributeKey || "Unknown";
    const displayKey = attribute.attributeKey || "no-key";
    const displayType = attribute.attributeType || "SELECT";
    const valuesCount = attribute.values?.length || 0;

    return (
      <TableRow className="hover:bg-muted/40">
        <TableCell>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-foreground">{displayName}</p>
            <span className="text-xs font-mono text-muted-foreground">
              {displayKey}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm text-foreground">{displayType}</span>
        </TableCell>
        <TableCell>
          <span className="text-sm text-foreground">{valuesCount} giá trị</span>
        </TableCell>
        <TableCell>
          <StatusBadge status={attribute.status || "INACTIVE"} />
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 text-muted-foreground data-[state=open]:bg-muted/40"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>{t("admin.common.actions")}</DropdownMenuLabel>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(attribute)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  {t("admin.common.edit")}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(attribute)}
                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("admin.common.delete")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) =>
    prev.attribute.id === next.attribute.id &&
    prev.attribute.attributeName === next.attribute.attributeName &&
    prev.attribute.status === next.attribute.status &&
    prev.attribute.values?.length === next.attribute.values?.length
);

AttributeRow.displayName = "AttributeRow";

