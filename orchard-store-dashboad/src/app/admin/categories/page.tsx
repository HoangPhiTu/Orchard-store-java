"use client";

import { useMemo, useState } from "react";

import { useDebounce } from "@/hooks/use-debounce";
import { useDataTable } from "@/hooks/use-data-table";
import { useCategories } from "@/hooks/use-categories";
import type { Category, CatalogStatus, Page } from "@/types/catalog.types";
import { STATUS_OPTIONS } from "@/config/options";
import { CategoryTable } from "@/components/features/catalog/category-table";
import { DeleteCategoryDialog } from "@/components/features/catalog/delete-category-dialog";
import { CategoryFormSheet } from "@/components/features/catalog/category-form-sheet";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { TableToolbar } from "@/components/shared/table-toolbar";

export default function CategoryManagementPage() {
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
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Category Management
            </h1>
            <p className="text-sm text-slate-500">
              Manage all product categories with hierarchical structure.
            </p>
          </div>
          <TableToolbar
            searchValue={search}
            searchPlaceholder="Tìm kiếm danh mục..."
            onSearchChange={handleSearchChange}
            filterTitle="Status"
            filterValue={statusFilter !== "ALL" ? statusFilter : null}
            filterOptions={statusOptions}
            onFilterChange={handleStatusChange}
            addLabel="Add Category"
            onAdd={handleAddCategory}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={(size) => onPaginationChange(1, size)}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-2">
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
