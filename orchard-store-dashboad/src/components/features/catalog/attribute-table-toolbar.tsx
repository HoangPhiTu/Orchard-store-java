"use client";

import { Search, Plus, ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterOption } from "@/config/options";
import DataTableFilter from "@/components/shared/data-table-filter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/hooks/use-i18n";

interface AttributeTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusOptions: FilterOption[];
  onAddAttribute: () => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [15, 30, 50, 100];

export function AttributeTableToolbar({
  search,
  onSearchChange,
  statusOptions,
  onAddAttribute,
  pageSize,
  onPageSizeChange,
}: AttributeTableToolbarProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/90 p-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("admin.attributes.searchAttributes")}
          className="h-10 w-full rounded-lg border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
        <DataTableFilter
          title={t("admin.users.status")}
          options={statusOptions}
          paramName="status"
          className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          iconClassName="text-muted-foreground"
        />
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 min-w-[160px] justify-between rounded-lg text-sm text-muted-foreground"
            >
              {t("admin.users.display")}: {pageSize}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 bg-card text-card-foreground"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => onPageSizeChange(size)}
                data-active={size === pageSize}
                className="cursor-pointer text-sm text-muted-foreground data-[active=true]:font-semibold data-[active=true]:text-foreground"
              >
                {size} {t("admin.users.rowsPerPage")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={onAddAttribute} className="h-10 rounded-lg">
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.attributes.addAttribute")}
        </Button>
      </div>
    </div>
  );
}

