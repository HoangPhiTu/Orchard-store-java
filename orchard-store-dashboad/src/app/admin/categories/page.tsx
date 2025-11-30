"use client";

import { useMemo, useState } from "react";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { useDataTable } from "@/hooks/use-data-table";
import { useCategories } from "@/hooks/use-categories";
import { usePrefetchNextPage } from "@/hooks/use-realtime-updates";
import { useCancelQueriesOnUnmount } from "@/hooks/use-request-cancellation";
import { categoryService } from "@/services/category.service";
import type {
  Category,
  CatalogStatus,
  CategoryFilter,
} from "@/types/catalog.types";
import type { Page } from "@/types/user.types";
import { STATUS_OPTIONS } from "@/config/options";
import { CategoryTable } from "@/components/features/catalog/category-table";
import { DeleteCategoryDialog } from "@/components/features/catalog/delete-category-dialog";
import dynamic from "next/dynamic";

// Lazy load form component để giảm initial bundle size
const CategoryFormSheet = dynamic(
  () =>
    import("@/components/features/catalog/category-form-sheet").then(
      (mod) => mod.CategoryFormSheet
    ),
  {
    ssr: false,
    loading: () => null, // Form sẽ tự quản lý loading state
  }
);
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { useI18n } from "@/hooks/use-i18n";

export default function CategoryManagementPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CatalogStatus | "ALL">(
    "ALL"
  );
  const { page, pageSize, onPaginationChange, pageSizeOptions } =
    useDataTable();
  const zeroBasedPage = Math.max(page - 1, 0);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [formKey, setFormKey] = useState(0);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const statusOptions = useMemo(
    () =>
      STATUS_OPTIONS.filter((option) =>
        ["ACTIVE", "INACTIVE"].includes(option.value)
      ),
    []
  );

  // Build filters for API
  const filters = useMemo(
    () => ({
      keyword: debouncedSearch || undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      page: zeroBasedPage,
      size: pageSize,
      sortBy: "level",
      direction: "ASC" as const,
    }),
    [debouncedSearch, statusFilter, zeroBasedPage, pageSize]
  );

  const { data, isLoading, error } = useCategories(filters);
  const categoryPage = data as Page<Category> | undefined;
  const categories = categoryPage?.content ?? [];
  const totalElements = categoryPage?.totalElements ?? 0;
  const totalPages = categoryPage?.totalPages ?? 0;

  const queryClient = useQueryClient();

  // Cancel queries when component unmounts to prevent memory leaks
  useCancelQueriesOnUnmount(queryClient, ["admin", "categories"]);

  // Prefetch next page để tải nhanh hơn khi user navigate
  usePrefetchNextPage(
    ["admin", "categories", "list"],
    (filters) => categoryService.getCategories(filters as CategoryFilter),
    filters,
    zeroBasedPage + 1,
    totalPages
  );

  // Prefetch categories tree cho form sheet (khi page load)
  // Sử dụng tree thay vì fetch all vì đã có cache ở backend và nhanh hơn
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["admin", "categories", "tree"],
      queryFn: () => categoryService.getCategoriesTree(),
      staleTime: 15 * 60 * 1000, // 15 minutes - match useCategoriesTree hook
    });
  }, [queryClient]);

  // Reset to first page when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    onPaginationChange(1, pageSize);
  };

  const handleStatusChange = (value: string | null) => {
    const nextStatus = value
      ? (value as CatalogStatus)
      : ("ALL" as CatalogStatus | "ALL");
    setStatusFilter(nextStatus);
    onPaginationChange(1, pageSize);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormKey((prev) => prev + 1);
    setFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeleteCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setFormKey((prev) => prev + 1);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-card-foreground">
              {t("admin.categories.categoryManagement")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("admin.categories.manageCategories")}
            </p>
          </div>
          <TableToolbar
            searchValue={search}
            searchPlaceholder={t("admin.categories.searchCategories")}
            onSearchChange={handleSearchChange}
            filterTitle={t("admin.users.status")}
            filterValue={statusFilter !== "ALL" ? statusFilter : null}
            filterOptions={statusOptions}
            onFilterChange={handleStatusChange}
            addLabel={t("admin.categories.addCategory")}
            onAdd={handleAddCategory}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={(size) => onPaginationChange(1, size)}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-muted/40 p-2">
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-red-600">
                Error loading categories: {error.message}
              </div>
            </div>
          ) : (
            <CategoryTable
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Pagination */}
        {categoryPage && (
          <DataTablePagination
            totalElements={totalElements}
            totalPages={totalPages}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={(nextPage) => onPaginationChange(nextPage, pageSize)}
          />
        )}
      </div>

      {/* Category Form Sheet */}
      <CategoryFormSheet
        key={formKey}
        open={isFormOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setSelectedCategory(null);
          }
        }}
        category={selectedCategory}
      />

      {/* Delete Category Dialog */}
      {deleteCategory && (
        <DeleteCategoryDialog
          categoryId={deleteCategory.id}
          categoryName={deleteCategory.name}
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteCategory(null);
          }}
        />
      )}
    </div>
  );
}
