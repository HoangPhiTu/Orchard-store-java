"use client";

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataTablePaginationProps {
  totalElements: number;
  totalPages: number;
  pageIndex: number; // 1-based index for UI
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  totalElements,
  totalPages,
  pageIndex,
  pageSize,
  onPageChange,
}: DataTablePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const safeTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(Math.max(pageIndex, 1), safeTotalPages);
  const start = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end =
    totalElements === 0 ? 0 : Math.min(currentPage * pageSize, totalElements);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < safeTotalPages;

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-slate-500">
        Showing {start}-{end} of {totalElements} results
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrev}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0"
          onClick={() => onPageChange(totalPages || 1)}
          disabled={!canGoNext}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
