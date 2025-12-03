"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useDebounce } from "@/hooks/use-debounce";
import { useDataTable } from "@/hooks/use-data-table";
import { useAttributes } from "@/hooks/use-attributes";
import { usePrefetchNextPage } from "@/hooks/use-realtime-updates";
import { useQueryClient } from "@tanstack/react-query";
import { useCancelQueriesOnUnmount } from "@/hooks/use-request-cancellation";
import { attributeService } from "@/services/attribute.service";
import type {
  ProductAttribute,
  AttributeStatus,
  AttributeDomain,
} from "@/types/attribute.types";
import { STATUS_OPTIONS } from "@/config/options";
import { AttributeTable } from "@/components/features/catalog/attribute-table";
import { DeleteAttributeDialog } from "@/components/features/catalog/delete-attribute-dialog";
import dynamic from "next/dynamic";

// Lazy load form component để giảm initial bundle size
const AttributeFormSheet = dynamic(
  () =>
    import("@/components/features/catalog/attribute-form-sheet").then(
      (mod) => mod.AttributeFormSheet
    ),
  {
    ssr: false,
    loading: () => null, // Form sẽ tự quản lý loading state
  }
);
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { AttributeTableToolbar } from "@/components/features/catalog/attribute-table-toolbar";
import { useI18n } from "@/hooks/use-i18n";

export default function AttributeManagementPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const { page, pageSize, onPaginationChange } = useDataTable();
  const zeroBasedPage = Math.max(page - 1, 0);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<ProductAttribute | null>(null);
  const [deleteAttribute, setDeleteAttribute] = useState<ProductAttribute | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const rawStatus = searchParams.get("status");
  const statusFilter: AttributeStatus | "ALL" =
    rawStatus && ["ACTIVE", "INACTIVE"].includes(rawStatus)
      ? (rawStatus as AttributeStatus)
      : "ALL";
  const statusOptions = STATUS_OPTIONS.filter((option) =>
    ["ACTIVE", "INACTIVE"].includes(option.value)
  );

  const rawDomain = searchParams.get("domain");
  const domainFilter: AttributeDomain | "ALL" =
    rawDomain && ["PERFUME", "COSMETICS", "COMMON"].includes(rawDomain)
      ? (rawDomain as AttributeDomain)
      : "ALL";
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
      domain: domainFilter !== "ALL" ? domainFilter : undefined,
      page: zeroBasedPage,
      size: pageSize,
      sortBy: "displayOrder",
      direction: "ASC" as const,
    }),
    [debouncedSearch, statusFilter, domainFilter, zeroBasedPage, pageSize]
  );

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useAttributes(filters);
  const attributePage = data as
    | {
        content: ProductAttribute[];
        totalElements: number;
        totalPages: number;
      }
    | undefined;
  const attributes = attributePage?.content ?? [];
  const totalElements = attributePage?.totalElements ?? 0;
  const totalPages = attributePage?.totalPages ?? 0;

  // Cancel queries when component unmounts to prevent memory leaks
  useCancelQueriesOnUnmount(queryClient, ["admin", "attributes"]);

  // Prefetch next page để tải nhanh hơn
  usePrefetchNextPage(
    ["admin", "attributes", "list"],
    (filters) => attributeService.getAttributes(filters as typeof filters),
    filters,
    zeroBasedPage + 1,
    totalPages
  );

  const handleEdit = (attribute: ProductAttribute) => {
    setSelectedAttribute(attribute);
    setFormOpen(true);
  };

  const handleDelete = (attribute: ProductAttribute) => {
    setDeleteAttribute(attribute);
    setIsDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedAttribute(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedAttribute(null);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setDeleteAttribute(null);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Error loading attributes</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">
          {t("admin.attributes.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.attributes.description")}
        </p>
      </div>

      <AttributeTableToolbar
        search={search}
        onSearchChange={setSearch}
        statusOptions={statusOptions}
        onAddAttribute={handleAdd}
        pageSize={pageSize}
        onPageSizeChange={(size) => onPaginationChange(1, size)}
      />

      <AttributeTable
        attributes={attributes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {totalPages > 0 && (
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalElements={totalElements}
          totalPages={totalPages}
          onPaginationChange={onPaginationChange}
        />
      )}

      <AttributeFormSheet
        open={isFormOpen}
        onOpenChange={handleFormClose}
        attribute={selectedAttribute}
      />

      <DeleteAttributeDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogClose}
        attribute={deleteAttribute}
      />
    </div>
  );
}

