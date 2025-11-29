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
                <TableHead className="w-[300px]">Brand Info</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Đang tải dữ liệu...
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
                <TableHead className="w-[300px]">Brand Info</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Không có thương hiệu nào
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
              <TableHead className="w-[300px]">Brand Info</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
