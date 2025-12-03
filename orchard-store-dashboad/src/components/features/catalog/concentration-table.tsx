"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Concentration } from "@/types/concentration.types";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ConcentrationRow } from "@/components/features/catalog/concentration-row";
import { useI18n } from "@/hooks/use-i18n";

interface ConcentrationTableProps {
  concentrations: Concentration[];
  onEdit?: (concentration: Concentration) => void;
  onDelete?: (concentration: Concentration) => void;
  isLoading?: boolean;
}

export function ConcentrationTable({
  concentrations,
  onEdit,
  onDelete,
  isLoading,
}: ConcentrationTableProps) {
  const { t } = useI18n();
  const safeConcentrations = useMemo(
    () => concentrations ?? [],
    [concentrations]
  );

  const buildKey = (concentration: Concentration, index: number) =>
    String(
      concentration.id ??
        concentration.slug ??
        concentration.name ??
        `concentration-${index}`
    );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Tên nồng độ</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Mức độ</TableHead>
                <TableHead>{t("admin.users.status")}</TableHead>
                <TableHead className="text-right">
                  {t("admin.users.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      );
    }

    if (safeConcentrations.length === 0) {
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Tên nồng độ</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Mức độ</TableHead>
                <TableHead>{t("admin.users.status")}</TableHead>
                <TableHead className="text-right">
                  {t("admin.users.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Không tìm thấy nồng độ nào
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[300px]">Tên nồng độ</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Mức độ</TableHead>
              <TableHead>{t("admin.users.status")}</TableHead>
              <TableHead className="text-right">
                {t("admin.users.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeConcentrations.map((concentration, index) => {
              const rowKey = buildKey(concentration, index);
              return (
                <ConcentrationRow
                  key={rowKey}
                  concentration={concentration}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Không thể tải danh sách nồng độ. Vui lòng thử lại.
        </div>
      }
    >
      {renderContent()}
    </ErrorBoundary>
  );
}
