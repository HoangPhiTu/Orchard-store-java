"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterOption } from "@/config/options";

interface DataTableFilterProps {
  title: string;
  options: FilterOption[];
  paramName: string;
  className?: string;
  iconClassName?: string;
}

export function DataTableFilter({
  title,
  options,
  paramName,
  className,
  iconClassName,
}: DataTableFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const activeValue = searchParams.get(paramName);
  const activeOption = options.find((option) => option.value === activeValue);

  const hasValue = Boolean(activeOption);

  const buttonClasses = hasValue
    ? "border border-slate-300 text-slate-900"
    : "border border-dashed border-slate-200 text-slate-500";

  const handleSelect = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(url, { scroll: false });
    setOpen(false);
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`h-10 min-w-[160px] items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-300 ${buttonClasses} ${
            className ?? ""
          }`}
        >
          <span className="truncate text-left">
            {activeOption ? `${title} ${activeOption.label}` : `${title} All`}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 ${iconClassName ?? "text-slate-400"}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-1" align="start">
        {activeValue && (
          <>
            <DropdownMenuItem
              onClick={() => handleSelect(null)}
              className="px-3 py-2 text-sm text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
            >
              Clear filters
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() =>
              handleSelect(option.value === activeValue ? null : option.value)
            }
            data-active={option.value === activeValue}
            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-600 transition data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600"
          >
            {option.icon}
            <span className="flex-1">{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
