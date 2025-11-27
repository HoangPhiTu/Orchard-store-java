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

export default function DataTableFilter({
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
    ? "border border-border text-foreground"
    : "border border-dashed border-border/60 text-muted-foreground";

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
          className={`h-10 min-w-[160px] items-center gap-2 rounded-lg bg-card px-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:border-primary/50 ${buttonClasses} ${
            className ?? ""
          }`}
        >
          <span className="truncate text-left">
            {activeOption ? `${title} ${activeOption.label}` : `${title} All`}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 ${
              iconClassName ?? "text-muted-foreground"
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-card p-1 text-card-foreground"
        align="start"
      >
        {activeValue && (
          <>
            <DropdownMenuItem
              onClick={() => handleSelect(null)}
              className="px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
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
            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-accent hover:text-accent-foreground"
          >
            {option.icon}
            <span className="flex-1">{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
