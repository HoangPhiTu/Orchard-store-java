"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useDebounce } from "@/hooks/use-debounce";
import { useDataTable } from "@/hooks/use-data-table";
import { useBrands } from "@/hooks/use-brands";
import type { Brand, CatalogStatus } from "@/types/catalog.types";
import { STATUS_OPTIONS } from "@/config/options";
import { BrandTable } from "@/components/features/catalog/brand-table";
import { DeleteBrandDialog } from "@/components/features/catalog/delete-brand-dialog";
import { BrandFormSheet } from "@/components/features/catalog/brand-form-sheet";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { BrandTableToolbar } from "@/components/features/catalog/brand-table-toolbar";

export default function BrandManagementPage() {
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const { page, pageSize, onPaginationChange } = useDataTable();
  const zeroBasedPage = Math.max(page - 1, 0);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      sortBy: "displayOrder",
      direction: "ASC" as const,
    }),
    [debouncedSearch, statusFilter, zeroBasedPage, pageSize]
  );

  const { data, isLoading, error } = useBrands(filters);
  const brandPage = data as
    | {
        content: Brand[];
        totalElements: number;
        totalPages: number;
      }
    | undefined;
  const brands = brandPage?.content ?? [];
  const totalElements = brandPage?.totalElements ?? 0;
  const totalPages = brandPage?.totalPages ?? 0;

  // Reset to first page when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    onPaginationChange(1, pageSize);
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormOpen(true);
  };

  const handleDelete = (brand: Brand) => {
    setDeleteBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  const handleAddBrand = () => {
    setSelectedBrand(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-card-foreground">
              Brand Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage all brands and product lines available in the store.
            </p>
          </div>
          <BrandTableToolbar
            search={search}
            onSearchChange={handleSearchChange}
            statusOptions={statusOptions}
            onAddBrand={handleAddBrand}
            pageSize={pageSize}
            onPageSizeChange={(size) => onPaginationChange(1, size)}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-muted/40 p-2">
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-red-600">
                Error loading brands: {error.message}
              </div>
            </div>
          ) : (
            <BrandTable
              brands={brands}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Pagination */}
        {brandPage && (
          <DataTablePagination
            totalElements={totalElements}
            totalPages={totalPages}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={(nextPage) => onPaginationChange(nextPage, pageSize)}
          />
        )}
      </div>

      {/* Brand Form Sheet */}
      <BrandFormSheet
        open={isFormOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setSelectedBrand(null);
          }
        }}
        brand={selectedBrand}
      />

      {/* Delete Brand Dialog */}
      {deleteBrand && (
        <DeleteBrandDialog
          brandId={deleteBrand.id}
          brandName={deleteBrand.name}
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteBrand(null);
          }}
        />
      )}
    </div>
  );
}
