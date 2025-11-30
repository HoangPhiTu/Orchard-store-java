"use client";

import { Search, ChevronDown, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FilterOption } from "@/config/options";

interface TableToolbarProps {
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  filterTitle: string;
  filterValue?: string | null;
  filterOptions: FilterOption[];
  onFilterChange: (value: string | null) => void;
  addLabel: string;
  onAdd: () => void;
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageSizeChange: (size: number) => void;
}

export function TableToolbar({
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  filterTitle,
  filterValue,
  filterOptions,
  onFilterChange,
  addLabel,
  onAdd,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
}: TableToolbarProps) {
  const { t } = useI18n();
  const hasFilter = Boolean(filterValue);
  const filterButtonBorder = hasFilter
    ? "border border-border"
    : "border border-dashed border-border/60";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-card-foreground md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-lg border-border pl-9"
        />
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`h-10 min-w-[160px] items-center justify-between rounded-lg bg-card px-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:border-primary/60 ${filterButtonBorder}`}
            >
              <span className="truncate text-left">
                {filterValue
                  ? `${filterTitle}: ${
                      filterOptions.find((o) => o.value === filterValue)
                        ?.label ?? filterValue
                    }`
                  : `${filterTitle}: All`}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 p-1" align="start">
            <DropdownMenuItem
              onClick={() => onFilterChange(null)}
              className="cursor-pointer px-3 py-2 text-sm text-muted-foreground"
            >
              {filterTitle} All
            </DropdownMenuItem>
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onFilterChange(option.value)}
                data-active={option.value === filterValue}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-muted-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                {option.icon}
                <span className="flex-1">{option.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 min-w-[160px] items-center gap-2 rounded-lg bg-card px-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:border-primary/60"
            >
              <span className="truncate text-left">
                {t("admin.users.display")}: {pageSize}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 p-1" align="end">
            {pageSizeOptions.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => onPageSizeChange(size)}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
              >
                <span className="flex-1">
                  {size} {t("admin.users.rowsPerPage")}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={onAdd} className="h-10 rounded-lg">
          <Plus className="mr-2 h-4 w-4" />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
