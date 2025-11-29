"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PAGE_SIZE_OPTIONS = [15, 30, 50, 100] as const;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

const normalizePage = (value: number | null) => {
  if (!value || Number.isNaN(value) || value < 1) {
    return DEFAULT_PAGE;
  }
  return value;
};

const normalizePageSize = (
  value: number | null
): (typeof PAGE_SIZE_OPTIONS)[number] => {
  if (!value || Number.isNaN(value)) {
    return DEFAULT_PAGE_SIZE;
  }
  // Type-safe check if value is in PAGE_SIZE_OPTIONS
  if (PAGE_SIZE_OPTIONS.includes(value as (typeof PAGE_SIZE_OPTIONS)[number])) {
    return value as (typeof PAGE_SIZE_OPTIONS)[number];
  }
  return DEFAULT_PAGE_SIZE;
};

export const useDataTable = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = useMemo(() => {
    const value = searchParams.get("page");
    return normalizePage(value ? parseInt(value, 10) : null);
  }, [searchParams]);

  const pageSize = useMemo(() => {
    const value = searchParams.get("size");
    return normalizePageSize(value ? parseInt(value, 10) : null);
  }, [searchParams]);

  const onPaginationChange = useCallback(
    (nextPage: number, nextPageSize?: number) => {
      const normalizedPage = normalizePage(nextPage);
      const normalizedSize = normalizePageSize(
        nextPageSize ?? pageSize ?? DEFAULT_PAGE_SIZE
      );

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(normalizedPage));
      params.set("size", String(normalizedSize));

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pageSize, pathname, router, searchParams]
  );

  return {
    page,
    pageSize,
    onPaginationChange,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
  };
};


