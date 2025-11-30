import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useMemo } from "react";
import { brandService } from "@/services/brand.service";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { normalizeQueryKey } from "@/lib/query-key-utils";
import type {
  Brand,
  BrandFormData,
  BrandFilter,
  CatalogStatus,
} from "@/types/catalog.types";
import type { Page } from "@/types/user.types";

const BRANDS_QUERY_KEY = ["admin", "brands"] as const;

/**
 * Normalize brand filters to ensure consistent query keys
 */
const normalizeBrandFilters = (
  filters?: BrandFilter
): BrandFilter | undefined => {
  if (!filters) return undefined;

  const normalized: BrandFilter = {};

  // Always include page and size if defined
  if (filters.page !== undefined && filters.page !== null) {
    normalized.page = Math.max(0, filters.page);
  }
  if (filters.size !== undefined && filters.size !== null) {
    normalized.size = Math.max(1, filters.size);
  }

  // Normalize keyword: trim and only include if not empty
  if (filters.keyword && filters.keyword.trim() !== "") {
    normalized.keyword = filters.keyword.trim();
  }

  // Include status if defined
  if (filters.status) {
    normalized.status = filters.status;
  }

  // Include sortBy and direction if defined
  if (filters.sortBy) {
    normalized.sortBy = filters.sortBy;
  }
  if (filters.direction) {
    normalized.direction = filters.direction;
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

/**
 * Hook để lấy danh sách brands với pagination và filters
 * Sử dụng keepPreviousData để tránh nháy khi phân trang
 */
export const useBrands = (filters?: BrandFilter) => {
  const normalizedFilters = useMemo(
    () => normalizeBrandFilters(filters),
    [filters]
  );

  return useQuery<Page<Brand>, Error>({
    queryKey: [...BRANDS_QUERY_KEY, "list", normalizedFilters] as const,
    queryFn: async () => {
      const result = await brandService.getBrands(normalizedFilters);
      return result as Page<Brand>;
    },
    placeholderData: keepPreviousData,
    // Tối ưu: Brands ít thay đổi, cache lâu hơn
    staleTime: 10 * 60 * 1000, // 10 minutes - increased for better performance
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    // Prefetch next page khi gần cuối trang
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * Hook để lấy chi tiết một brand theo ID
 * Có caching để tránh refetch không cần thiết
 */
export const useBrand = (id: number | null) => {
  return useQuery<Brand, Error>({
    queryKey: [...BRANDS_QUERY_KEY, "detail", id] as const,
    queryFn: () => {
      if (!id) {
        throw new Error("Brand ID is required");
      }
      return brandService.getBrand(id);
    },
    enabled: !!id, // Chỉ query khi có ID
    staleTime: 10 * 60 * 1000, // 10 minutes - brand data ít thay đổi
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    refetchOnMount: false, // Không refetch khi component mount lại
    refetchOnWindowFocus: false, // Không refetch khi window focus
  });
};

/**
 * Hook để tạo brand mới
 * Sử dụng useAppMutation để tự động xử lý error, success, invalidate queries
 */
export const useCreateBrand = () => {
  return useAppMutation<Brand, Error, BrandFormData>({
    mutationFn: (data) => brandService.createBrand(data),
    queryKey: BRANDS_QUERY_KEY,
    successMessage: "Tạo thương hiệu thành công!",
  });
};

/**
 * Hook để cập nhật brand
 * Sử dụng useAppMutation để tự động xử lý error, success, invalidate queries
 */
export const useUpdateBrand = () => {
  return useAppMutation<
    Brand,
    Error,
    { id: number; data: Partial<BrandFormData> }
  >({
    mutationFn: ({ id, data }) => brandService.updateBrand(id, data),
    queryKey: BRANDS_QUERY_KEY,
    successMessage: "Cập nhật thương hiệu thành công!",
  });
};

/**
 * Hook để xóa brand
 * Sử dụng useAppMutation để tự động xử lý error, success, invalidate queries
 */
export const useDeleteBrand = () => {
  return useAppMutation<void, Error, number>({
    mutationFn: (id) => brandService.deleteBrand(id),
    queryKey: BRANDS_QUERY_KEY,
    successMessage: "Xóa thương hiệu thành công!",
  });
};
