"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { useDebounce } from "@/hooks/use-debounce";
import { useBrands, useDeleteBrand } from "@/hooks/use-brands";
import type { Brand } from "@/types/catalog.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrandForm } from "@/components/features/product/brand-form";

const PAGE_SIZE = 8;

export default function BrandManagementPage() {
  const { data: brands = [], isLoading } = useBrands();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const deleteBrand = useDeleteBrand({
    onSuccess: () => toast.success("Brand deleted"),
    onError: () => toast.error("Failed to delete brand"),
  });

  const filteredBrands = useMemo(() => {
    if (!debouncedSearch) return brands;
    const term = debouncedSearch.toLowerCase();
    return brands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(term) ||
        brand.slug.toLowerCase().includes(term)
    );
  }, [brands, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredBrands.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedBrands = filteredBrands.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const handleOpenForm = (brand?: Brand) => {
    setSelectedBrand(brand ?? null);
    setFormOpen(true);
  };

  const handleDelete = (brand: Brand) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the brand "${brand.name}"?`
    );
    if (confirmed) {
      deleteBrand.mutate(brand.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Brands</h1>
            <p className="text-sm text-slate-500">
              Manage all vendors and product lines available in the store.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1 md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search brand..."
                className="pl-9"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-2">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-64">Brand</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading brands...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && paginatedBrands.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No brands found.
                  </TableCell>
                </TableRow>
              )}
              {paginatedBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white">
                        {brand.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="h-full w-full rounded-xl object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-slate-500">
                            {brand.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {brand.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Order: {brand.displayOrder ?? 0}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{brand.slug}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        brand.status === "ACTIVE" ? "success" : "secondary"
                      }
                    >
                      {brand.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionMenu
                      onEdit={() => handleOpenForm(brand)}
                      onDelete={() => handleDelete(brand)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Showing {filteredBrands.length === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + PAGE_SIZE, filteredBrands.length)} of{" "}
            {filteredBrands.length} brands
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

      <BrandForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setSelectedBrand(null);
          }
        }}
        initialData={selectedBrand ?? undefined}
      />
    </div>
  );
}

function ActionMenu({
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

