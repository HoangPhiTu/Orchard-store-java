"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useDebounce } from "@/hooks/use-debounce";
import { useDataTable } from "@/hooks/use-data-table";
import { useConcentrations } from "@/hooks/use-concentrations";
import { usePrefetchNextPage } from "@/hooks/use-realtime-updates";
import { useQueryClient } from "@tanstack/react-query";
import { useCancelQueriesOnUnmount } from "@/hooks/use-request-cancellation";
import { concentrationService } from "@/services/concentration.service";
import type { Concentration, CatalogStatus } from "@/types/concentration.types";
import { STATUS_OPTIONS } from "@/config/options";
import { ConcentrationTable } from "@/components/features/catalog/concentration-table";
import { DeleteConcentrationDialog } from "@/components/features/catalog/delete-concentration-dialog";
import dynamic from "next/dynamic";

// Lazy load form component để giảm initial bundle size
const ConcentrationFormSheet = dynamic(
  () =>
    import("@/components/features/catalog/concentration-form-sheet").then(
      (mod) => mod.ConcentrationFormSheet
    ),
  {
    ssr: false,
    loading: () => null,
  }
);
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { ConcentrationTableToolbar } from "@/components/features/catalog/concentration-table-toolbar";

export default function ConcentrationManagementPage() {
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const { page, pageSize, onPaginationChange } = useDataTable();
  const zeroBasedPage = Math.max(page - 1, 0);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedConcentration, setSelectedConcentration] =
    useState<Concentration | null>(null);
  const [deleteConcentration, setDeleteConcentration] =
    useState<Concentration | null>(null);
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

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useConcentrations(filters);
  const concentrationPage = data as
    | {
        content: Concentration[];
        totalElements: number;
        totalPages: number;
      }
    | undefined;
  const concentrations = concentrationPage?.content ?? [];
  const totalElements = concentrationPage?.totalElements ?? 0;
  const totalPages = concentrationPage?.totalPages ?? 0;

  // Cancel queries when component unmounts to prevent memory leaks
  useCancelQueriesOnUnmount(queryClient, ["admin", "concentrations"]);

  // Prefetch next page để tải nhanh hơn
  usePrefetchNextPage(
    ["admin", "concentrations", "list"],
    (filters) =>
      concentrationService.getConcentrations(filters as typeof filters),
    filters,
    zeroBasedPage + 1,
    totalPages
  );

  // Reset to first page when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    onPaginationChange(1, pageSize);
  };

  const handleEdit = (concentration: Concentration) => {
    setSelectedConcentration(concentration);
    setFormOpen(true);
  };

  const handleDelete = (concentration: Concentration) => {
    setDeleteConcentration(concentration);
    setIsDeleteDialogOpen(true);
  };

  const handleAddConcentration = () => {
    setSelectedConcentration(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-card-foreground">
              Quản lý Nồng độ
            </h1>
            <p className="text-sm text-muted-foreground">
              Quản lý các nồng độ nước hoa (EDT, EDP, Parfum...)
            </p>
          </div>
          <ConcentrationTableToolbar
            search={search}
            onSearchChange={handleSearchChange}
            statusOptions={statusOptions}
            onAddConcentration={handleAddConcentration}
            pageSize={pageSize}
            onPageSizeChange={(size) => onPaginationChange(1, size)}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-muted/40 p-2">
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-red-600">
                Error loading concentrations: {error.message}
              </div>
            </div>
          ) : (
            <ConcentrationTable
              concentrations={concentrations}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Pagination */}
        {concentrationPage && (
          <DataTablePagination
            totalElements={totalElements}
            totalPages={totalPages}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={(nextPage) => onPaginationChange(nextPage, pageSize)}
          />
        )}
      </div>

      {/* Concentration Form Sheet */}
      <ConcentrationFormSheet
        open={isFormOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setSelectedConcentration(null);
          }
        }}
        concentration={selectedConcentration}
      />

      {/* Delete Concentration Dialog */}
      {deleteConcentration && (
        <DeleteConcentrationDialog
          concentrationId={deleteConcentration.id}
          concentrationName={deleteConcentration.name}
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteConcentration(null);
          }}
        />
      )}
    </div>
  );
}
