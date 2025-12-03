"use client";

import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConcentrationDisplay } from "@/components/shared/concentration-display";
import type { Concentration } from "@/types/concentration.types";
import { useI18n } from "@/hooks/use-i18n";

interface ConcentrationRowProps {
  concentration: Concentration;
  onEdit?: (concentration: Concentration) => void;
  onDelete?: (concentration: Concentration) => void;
}

export function ConcentrationRow({
  concentration,
  onEdit,
  onDelete,
}: ConcentrationRowProps) {
  const { t } = useI18n();

  return (
    <TableRow className="hover:bg-muted/40">
      <TableCell>
        <ConcentrationDisplay concentration={concentration} variant="full" />
      </TableCell>
      <TableCell className="text-muted-foreground">
        {concentration.slug}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="text-sm">{concentration.intensityLevel ?? "-"}</span>
          {concentration.minOilPercentage !== null &&
            concentration.maxOilPercentage !== null && (
              <span className="text-xs text-muted-foreground">
                {concentration.minOilPercentage}% -{" "}
                {concentration.maxOilPercentage}%
              </span>
            )}
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={concentration.status} />
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
              <DropdownMenuItem onClick={() => onEdit(concentration)}>
                <Edit2 className="mr-2 h-4 w-4" />
                {t("admin.common.edit")}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(concentration)}
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
}
