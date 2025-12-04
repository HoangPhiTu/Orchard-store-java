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
import type { ProductDTO } from "@/types/product.types";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ProductRow } from "@/components/features/product/product-row";
import { useI18n } from "@/hooks/use-i18n";

interface ProductTableProps {
  products: ProductDTO[];
  onEdit?: (product: ProductDTO) => void;
  onDelete?: (product: ProductDTO) => void;
  isLoading?: boolean;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  isLoading,
}: ProductTableProps) {
  const { t } = useI18n();
  const safeProducts = useMemo(() => products ?? [], [products]);

  const buildKey = (product: ProductDTO, index: number) =>
    String(
      product.id ??
        product.slug ??
        product.name ??
        product.primaryImageUrl ??
        `product-${index}`
    );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  {t("admin.products.productName")}
                </TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>{t("admin.products.brand")}</TableHead>
                <TableHead>{t("admin.products.category")}</TableHead>
                <TableHead>{t("admin.products.price")}</TableHead>
                <TableHead>{t("admin.users.status")}</TableHead>
                <TableHead className="text-right">
                  {t("admin.users.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  {t("admin.products.loadingProducts")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      );
    }

    if (safeProducts.length === 0) {
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  {t("admin.products.productName")}
                </TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>{t("admin.products.brand")}</TableHead>
                <TableHead>{t("admin.products.category")}</TableHead>
                <TableHead>{t("admin.products.price")}</TableHead>
                <TableHead>{t("admin.users.status")}</TableHead>
                <TableHead className="text-right">
                  {t("admin.users.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  {t("admin.products.noProductsFound")}
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
                {t("admin.products.productName")}
              </TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>{t("admin.products.brand")}</TableHead>
              <TableHead>{t("admin.products.category")}</TableHead>
              <TableHead>{t("admin.products.price")}</TableHead>
              <TableHead>{t("admin.users.status")}</TableHead>
              <TableHead className="text-right">
                {t("admin.users.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeProducts.map((product, index) => {
              const rowKey = buildKey(product, index);
              return (
                <ProductRow
                  key={rowKey}
                  product={product}
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
          Không thể tải danh sách sản phẩm. Vui lòng thử lại.
        </div>
      }
    >
      {renderContent()}
    </ErrorBoundary>
  );
}
