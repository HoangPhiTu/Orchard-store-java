"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useDataTable } from "@/hooks/use-data-table";
import { useProducts } from "@/hooks/use-products";
import { usePrefetchNextPage } from "@/hooks/use-realtime-updates";
import { useQueryClient } from "@tanstack/react-query";
import { useCancelQueriesOnUnmount } from "@/hooks/use-request-cancellation";
import { productService } from "@/services/product.service";
import { ProductTable } from "@/components/features/product/product-table";
import { ProductTableToolbar } from "@/components/features/product/product-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { STATUS_OPTIONS } from "@/config/options";
import { useI18n } from "@/hooks/use-i18n";
import type { ProductDTO } from "@/types/product.types";
import type { CatalogStatus } from "@/types/catalog.types";
import dynamic from "next/dynamic";

// Lazy load form component
const ProductFormSheetLazy = dynamic(
  () =>
    import("@/components/features/product/product-form-sheet").then(
      (mod) => mod.ProductFormSheet
    ),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function ProductsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const { page, pageSize, onPaginationChange } = useDataTable();
  const zeroBasedPage = Math.max(page - 1, 0);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(
    null
  );

  const debouncedSearch = useDebounce(search, 500);

  const rawStatus = searchParams.get("status");
  const statusFilter: CatalogStatus | "ALL" =
    rawStatus && ["ACTIVE", "INACTIVE"].includes(rawStatus)
      ? (rawStatus as CatalogStatus)
      : "ALL";
  const statusOptions = STATUS_OPTIONS.filter((option) =>
    ["ACTIVE", "INACTIVE"].includes(option.value)
  );
  const prevStatusRef = useRef(statusFilter);
  useEffect(() => {
    if (prevStatusRef.current !== statusFilter) {
      prevStatusRef.current = statusFilter;
      onPaginationChange(1, pageSize);
    }
  }, [statusFilter, onPaginationChange, pageSize]);

  // Build filters for API
  const filters = useMemo(
    () => ({
      keyword: debouncedSearch || undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      page: zeroBasedPage,
      size: pageSize,
      sortBy: "name",
      direction: "ASC" as const,
    }),
    [debouncedSearch, statusFilter, zeroBasedPage, pageSize]
  );

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useProducts(filters);
  const productPage = data as
    | {
        content: ProductDTO[];
        totalElements: number;
        totalPages: number;
      }
    | undefined;
  const products = productPage?.content ?? [];
  const totalElements = productPage?.totalElements ?? 0;
  const totalPages = productPage?.totalPages ?? 0;

  // Cancel queries when component unmounts to prevent memory leaks
  useCancelQueriesOnUnmount(queryClient, ["admin", "products"]);

  // Prefetch next page để tải nhanh hơn
  usePrefetchNextPage(
    ["admin", "products", "list"],
    (filters) => productService.getProducts(filters as typeof filters),
    filters,
    zeroBasedPage + 1,
    totalPages
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onPaginationChange(1, pageSize);
  };

  const handleEdit = (product: ProductDTO) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };

  const handleDelete = (product: ProductDTO) => {
    // TODO: Implement delete dialog
    console.log("Delete product:", product);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-card-foreground">
              {t("admin.products.productManagement")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("admin.products.manageProducts")}
            </p>
          </div>
          <ProductTableToolbar
            search={search}
            onSearchChange={handleSearchChange}
            statusOptions={statusOptions}
            onAddProduct={handleAddProduct}
            pageSize={pageSize}
            onPageSizeChange={(size) => onPaginationChange(1, size)}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-muted/40 p-2">
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-red-600">
                Error loading products: {error.message}
              </div>
            </div>
          ) : (
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Pagination */}
        {productPage && (
          <DataTablePagination
            totalElements={totalElements}
            totalPages={totalPages}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={(nextPage) => onPaginationChange(nextPage, pageSize)}
          />
        )}
      </div>

      {/* Product Form Sheet */}
      <ProductFormSheetLazy
        open={isFormOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setSelectedProduct(null);
          }
        }}
        product={selectedProduct}
      />
    </div>
  );
}
