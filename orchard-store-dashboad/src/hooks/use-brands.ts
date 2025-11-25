import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { brandService } from "@/services/brand.service";
import { useAppMutation } from "@/hooks/use-app-mutation";
import type { Brand, BrandFormData, BrandFilter } from "@/types/catalog.types";
import type { Page } from "@/types/user.types";

const BRANDS_QUERY_KEY = ["admin", "brands"] as const;

/**
 * Hook để lấy danh sách brands với pagination và filters
 * Sử dụng keepPreviousData để tránh nháy khi phân trang
 */
export const useBrands = (filters?: BrandFilter) => {
  return useQuery<Page<Brand>, Error>({
    queryKey: [...BRANDS_QUERY_KEY, "list", filters] as const,
    queryFn: () => brandService.getBrands(filters),
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook để lấy chi tiết một brand theo ID
 * Chỉ query khi có ID
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
