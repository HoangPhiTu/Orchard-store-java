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
import type { Brand } from "@/types/catalog.types";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { BrandRow } from "@/components/features/catalog/brand-row";
import { useI18n } from "@/hooks/use-i18n";

interface BrandTableProps {
  brands: Brand[];
  onEdit?: (brand: Brand) => void;
  onDelete?: (brand: Brand) => void;
  isLoading?: boolean;
}

export function BrandTable({
  brands,
  onEdit,
  onDelete,
  isLoading,
}: BrandTableProps) {
  const { t } = useI18n();
  const safeBrands = useMemo(() => brands ?? [], [brands]);

  const buildKey = (brand: Brand, index: number) =>
    String(
      brand.id ?? brand.slug ?? brand.name ?? brand.logoUrl ?? `brand-${index}`
    );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  {t("admin.brands.brandName")}
                </TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Country</TableHead>
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
                  {t("admin.brands.loadingBrands")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      );
    }

    if (safeBrands.length === 0) {
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  {t("admin.brands.brandName")}
                </TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Country</TableHead>
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
                  {t("admin.brands.noBrandsFound")}
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
              <TableHead className="w-[300px]">
                {t("admin.brands.brandName")}
              </TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>{t("admin.users.status")}</TableHead>
              <TableHead className="text-right">
                {t("admin.users.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeBrands.map((brand, index) => {
              const rowKey = buildKey(brand, index);
              return (
                <BrandRow
                  key={rowKey}
                  brand={brand}
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
          Không thể tải danh sách thương hiệu. Vui lòng thử lại.
        </div>
      }
    >
      {renderContent()}
    </ErrorBoundary>
  );
}
