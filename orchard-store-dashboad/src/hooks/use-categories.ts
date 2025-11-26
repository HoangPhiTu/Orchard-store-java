import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import { useAppMutation } from "@/hooks/use-app-mutation";
import type {
  Category,
  CategoryFormData,
  CategoryFilter,
} from "@/types/catalog.types";
import type { Page } from "@/types/user.types";

const CATEGORIES_QUERY_KEY = ["admin", "categories"] as const;

/**
 * Normalize filters to ensure consistent queryKey
 * This helps avoid unnecessary re-fetches when filters have the same effective values
 */
const normalizeFilters = (
  filters?: CategoryFilter
): CategoryFilter | undefined => {
  if (!filters) return undefined;

  const normalized: CategoryFilter = {};

  // Always include page and size if defined (even if 0)
  if (filters.page !== undefined && filters.page !== null) {
    normalized.page = filters.page;
  }
  if (filters.size !== undefined && filters.size !== null) {
    normalized.size = filters.size;
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

  // Return undefined if no meaningful filters to avoid unnecessary queryKey changes
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const isAllCategoriesRequest = (filters?: CategoryFilter) => {
  if (!filters) return false;
  const keys = Object.keys(filters);
  if (keys.length === 0) return false;

  const sizeOnlyRequest =
    keys.every((key) => key === "size") && (filters.size ?? 0) >= 1000;

  return sizeOnlyRequest;
};

/**
 * Hook để lấy danh sách categories với pagination và filters
 * Sử dụng keepPreviousData để tránh nháy khi phân trang
 */
export const useCategories = (filters?: CategoryFilter) => {
  const normalizedFilters = normalizeFilters(filters);
  const shouldUseAllKey =
    !filters ||
    isAllCategoriesRequest(filters) ||
    isAllCategoriesRequest(normalizedFilters);

  return useQuery<Page<Category>, Error>({
    queryKey: [
      ...CATEGORIES_QUERY_KEY,
      shouldUseAllKey ? "all" : "list",
      shouldUseAllKey ? normalizedFilters?.size ?? null : normalizedFilters,
    ] as const,
    queryFn: () => categoryService.getCategories(normalizedFilters),
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook để lấy cây danh mục (Tree structure)
 */
export const useCategoriesTree = () => {
  return useQuery<Category[], Error>({
    queryKey: [...CATEGORIES_QUERY_KEY, "tree"] as const,
    queryFn: () => categoryService.getCategoriesTree(),
  });
};

/**
 * Hook để lấy chi tiết một category theo ID
 * Chỉ query khi có ID
 */
export const useCategory = (id: number | null) => {
  return useQuery<Category, Error>({
    queryKey: [...CATEGORIES_QUERY_KEY, "detail", id] as const,
    queryFn: () => {
      if (!id) {
        throw new Error("Category ID is required");
      }
      return categoryService.getCategory(id);
    },
    enabled: !!id, // Chỉ query khi có ID
  });
};

/**
 * Hook để tạo category mới
 * Sử dụng useAppMutation để tự động xử lý error, success, invalidate queries
 */
export const useCreateCategory = () => {
  return useAppMutation<Category, Error, CategoryFormData>({
    mutationFn: (data) => categoryService.createCategory(data),
    queryKey: CATEGORIES_QUERY_KEY,
    successMessage: "Tạo danh mục thành công!",
  });
};

/**
 * Hook để cập nhật category
 * Sử dụng useAppMutation để tự động xử lý error, success, invalidate queries
 */
export const useUpdateCategory = () => {
  return useAppMutation<
    Category,
    Error,
    { id: number; data: Partial<CategoryFormData> }
  >({
    mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
    queryKey: CATEGORIES_QUERY_KEY,
    successMessage: "Cập nhật danh mục thành công!",
  });
};

/**
 * Hook để xóa category
 * Sử dụng useAppMutation để tự động xử lý error, success, invalidate queries
 */
export const useDeleteCategory = () => {
  return useAppMutation<void, Error, number>({
    mutationFn: (id) => categoryService.deleteCategory(id),
    queryKey: CATEGORIES_QUERY_KEY,
    successMessage: "Xóa danh mục thành công!",
  });
};
