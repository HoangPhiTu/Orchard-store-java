import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { productService } from "@/services/product.service";
import { useAppMutation } from "@/hooks/use-app-mutation";
import type {
  ProductDTO,
  ProductFilter,
  ProductFormData,
} from "@/types/product.types";
import type { Page } from "@/types/user.types";

const PRODUCTS_QUERY_KEY = ["admin", "products"] as const;

/**
 * Normalize product filters to ensure consistent query keys
 */
const normalizeProductFilters = (
  filters?: ProductFilter
): ProductFilter | undefined => {
  if (!filters) return undefined;

  const normalized: ProductFilter = {};

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

  // Include brandId and categoryId if defined
  if (filters.brandId) {
    normalized.brandId = filters.brandId;
  }
  if (filters.categoryId) {
    normalized.categoryId = filters.categoryId;
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
 * Hook để lấy danh sách products với pagination và filters
 * Sử dụng keepPreviousData để tránh nháy khi phân trang
 */
export const useProducts = (filters?: ProductFilter) => {
  const normalizedFilters = useMemo(
    () => normalizeProductFilters(filters),
    [filters]
  );

  return useQuery<Page<ProductDTO>, Error>({
    queryKey: [...PRODUCTS_QUERY_KEY, "list", normalizedFilters] as const,
    queryFn: async () => {
      const result = await productService.getProducts(normalizedFilters);
      return result as Page<ProductDTO>;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * Hook để lấy chi tiết một product theo ID
 */
export const useProduct = (id: number | null) => {
  return useQuery<ProductDTO, Error>({
    queryKey: [...PRODUCTS_QUERY_KEY, "detail", id] as const,
    queryFn: () => {
      if (!id) {
        throw new Error("Product ID is required");
      }
      return productService.getProduct(id);
    },
    enabled: !!id,
    staleTime: 0, // Luôn coi dữ liệu là cũ để fetch lại
    gcTime: 5 * 60 * 1000, // 5 phút
    refetchOnMount: true, // Luôn fetch lại khi mở Form
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook để tạo product mới
 * Sử dụng useAppMutation để tự động xử lý error, success, invalidate queries
 *
 * @param form - Form instance từ React Hook Form (optional) để tự động hiển thị lỗi validation
 * @param onFirstErrorField - Callback được gọi khi có lỗi validation đầu tiên để scroll/focus vào field
 */
export const useCreateProduct = (
  form?: any,
  onFirstErrorField?: (fieldName: string) => void
) => {
  return useAppMutation<ProductDTO, Error, ProductFormData>({
    mutationFn: (data) => productService.createProduct(data),
    queryKey: PRODUCTS_QUERY_KEY,
    successMessage: "Tạo sản phẩm thành công!",
    form: form, // Truyền form để tự động hiển thị lỗi validation
    onFirstErrorField: onFirstErrorField, // Callback để scroll/focus vào field có lỗi
  });
};

/**
 * Hook để cập nhật product
 * Sử dụng useAppMutation để tự động xử lý error, success, invalidate queries
 *
 * @param form - Form instance từ React Hook Form (optional) để tự động hiển thị lỗi validation
 * @param onFirstErrorField - Callback được gọi khi có lỗi validation đầu tiên để scroll/focus vào field
 */
export const useUpdateProduct = (
  form?: any,
  onFirstErrorField?: (fieldName: string) => void
) => {
  const queryClient = useQueryClient();

  return useAppMutation<
    ProductDTO,
    Error,
    { id: number; data: Partial<ProductFormData> }
  >({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    queryKey: PRODUCTS_QUERY_KEY,
    successMessage: "Cập nhật sản phẩm thành công!",
    form: form, // Truyền form để tự động hiển thị lỗi validation
    onFirstErrorField: onFirstErrorField, // Callback để scroll/focus vào field có lỗi
    onSuccess: (updatedProduct, variables) => {
      // Invalidate detail query
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: [...PRODUCTS_QUERY_KEY, "detail", variables.id],
        });
        // Cập nhật cache trực tiếp với data mới
        queryClient.setQueryData(
          [...PRODUCTS_QUERY_KEY, "detail", variables.id],
          updatedProduct
        );
      }
    },
  });
};

/**
 * Hook để xóa product
 * Sử dụng useAppMutation để tự động xử lý error, success, invalidate queries
 */
export const useDeleteProduct = () => {
  return useAppMutation<void, Error, number>({
    mutationFn: (id) => productService.deleteProduct(id),
    queryKey: PRODUCTS_QUERY_KEY,
    successMessage: "Xóa sản phẩm thành công!",
  });
};
