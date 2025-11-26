"use client";

import { Search, Plus, ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterOption } from "@/config/options";
import { DataTableFilter } from "@/components/shared/data-table-filter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BrandTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusOptions: FilterOption[];
  onAddBrand: () => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [15, 30, 50, 100];

export function BrandTableToolbar({
  search,
  onSearchChange,
  statusOptions,
  onAddBrand,
  pageSize,
  onPageSizeChange,
}: BrandTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or slug..."
          className="h-10 w-full rounded-lg border-slate-200 pl-9"
        />
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
        <DataTableFilter
          title="Status"
          options={statusOptions}
          paramName="status"
          className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          iconClassName="text-slate-400"
        />
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 min-w-[160px] justify-between rounded-lg border-slate-200 text-sm text-slate-600"
            >
              Hiển thị: {pageSize}
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => onPageSizeChange(size)}
                data-active={size === pageSize}
                className="cursor-pointer text-sm text-slate-600 data-[active=true]:font-semibold"
              >
                {size} dòng / trang
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={onAddBrand}
          className="h-10 rounded-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>
    </div>
  );
}
