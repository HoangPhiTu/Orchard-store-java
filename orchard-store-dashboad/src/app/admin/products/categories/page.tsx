"use client";

import { useMemo, useState } from "react";
import { Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { useCategories, useDeleteCategory } from "@/hooks/use-categories";
import { useDebounce } from "@/hooks/use-debounce";
import type { Category } from "@/types/catalog.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryForm } from "@/components/features/product/category-form";

const PAGE_SIZE = 8;

const flattenCategories = (
  items: Category[],
  depth = 0
): (Category & { depth: number })[] => {
  return items.flatMap((item) => [
    { ...item, depth },
    ...flattenCategories(item.children ?? [], depth + 1),
  ]);
};

export default function CategoryManagementPage() {
  const { data: categories = [], isLoading } = useCategories();
  const [search, setSearch] = useState("");
  const [parentFilter, setParentFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const deleteCategory = useDeleteCategory({
    onSuccess: () => toast.success("Category deleted"),
    onError: () => toast.error("Failed to delete category"),
  });

  const flat = useMemo(() => flattenCategories(categories), [categories]);

  const parentFilterOptions = useMemo(() => {
    const parents = new Map<number, string>();
    categories.forEach((category) => {
      if (category.children && category.children.length > 0) {
        parents.set(category.id, category.name);
      }
    });
    return Array.from(parents.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        depth: 0,
      }))
      .flatMap((category) => flattenCategories([category]));
  }, [categories]);

  const searchFiltered = useMemo(() => {
    return filteredCategories.filter((category) => {
      const matchesSearch = debouncedSearch
        ? category.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          category.slug.toLowerCase().includes(debouncedSearch.toLowerCase())
        : true;

      const matchesParent =
        parentFilter === "all"
          ? true
          : parentFilter === "root"
          ? !category.parentId
          : category.parentId === Number(parentFilter);

      return matchesSearch && matchesParent;
    });
  }, [filteredCategories, debouncedSearch, parentFilter]);

  const totalPages = Math.max(1, Math.ceil(searchFiltered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedCategories = searchFiltered.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const handleOpenForm = (category?: Category) => {
    setSelectedCategory(category ?? null);
    setFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the category "${category.name}"?`
    );
    if (confirmed) {
      deleteCategory.mutate(category.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
            <p className="text-sm text-slate-500">
              Structure the storefront with categories and sub-categories.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search category..."
                className="pl-9"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-slate-400 focus:outline-none"
                value={parentFilter}
                onChange={(event) => {
                  setParentFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All parents</option>
                <option value="root">Root categories</option>
                {parentFilterOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-2">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-1/3">Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading categories...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && paginatedCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
              {paginatedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900">
                      <span className="text-slate-300">
                        {"— ".repeat(category.depth)}
                      </span>
                      {category.name}
                    </div>
                    <p className="text-xs text-slate-500">
                      Order: {category.displayOrder ?? 0}
                    </p>
                  </TableCell>
                  <TableCell className="text-slate-500">{category.slug}</TableCell>
                  <TableCell>
                    {category.parentName ?? (
                      <span className="text-xs text-slate-400">Root</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        category.status === "ACTIVE" ? "success" : "secondary"
                      }
                    >
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <CategoryActionMenu
                      onEdit={() => handleOpenForm(category)}
                      onDelete={() => handleDelete(category)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Showing {searchFiltered.length === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + PAGE_SIZE, searchFiltered.length)} of{" "}
            {searchFiltered.length} categories
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() =>
                setPage((prev) => Math.min(totalPages, prev + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <CategoryForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelectedCategory(null);
        }}
        categories={flat}
        initialData={selectedCategory ?? undefined}
      />
    </div>
  );
}

function CategoryActionMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen((prev) => !prev)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-11 z-10 w-40 rounded-xl border border-slate-200 bg-white shadow-lg">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

