import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { categoryAttributeService } from "@/services/category-attribute.service";
import type { CategoryAttribute } from "@/types/catalog.types";
import type { ProductAttribute } from "@/types/attribute.types";

/**
 * Hook để lấy danh sách attributes của category
 */
export const useCategoryAttributes = (
  categoryId: number | null | undefined
) => {
  return useQuery<CategoryAttribute[], Error>({
    queryKey: ["admin", "category-attributes", categoryId],
    queryFn: () => {
      if (!categoryId || categoryId <= 0) {
        throw new Error("Category ID is required and must be greater than 0");
      }
      return categoryAttributeService.getCategoryAttributes(categoryId);
    },
    enabled: !!categoryId && categoryId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Không retry nếu lỗi 400 (Bad Request) - có thể category chưa tồn tại
      if (
        error &&
        "response" in error &&
        (error as any).response?.status === 400
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Hook để gán attribute vào category
 * Sử dụng useAppMutation để tự động xử lý Toast & Error
 */
export const useAssignCategoryAttribute = () => {
  return useAppMutation<
    CategoryAttribute,
    Error,
    Omit<CategoryAttribute, "id" | "attributeName" | "attributeKey">
  >({
    mutationFn: (data) => categoryAttributeService.assignAttribute(data),
    queryKey: ["admin", "category-attributes"],
    successMessage: "Gán thuộc tính thành công!",
  });
};

/**
 * Hook để xóa binding attribute khỏi category
 * Sử dụng useAppMutation để tự động xử lý Toast & Error
 */
export const useRemoveCategoryAttribute = () => {
  return useAppMutation<
    void,
    Error,
    { categoryId: number; attributeId: number }
  >({
    mutationFn: ({ categoryId, attributeId }) =>
      categoryAttributeService.removeAttribute(categoryId, attributeId),
    queryKey: ["admin", "category-attributes"],
    successMessage: "Xóa thuộc tính thành công!",
  });
};

/**
 * Hook để cập nhật metadata (required, displayOrder) của attribute đã gán
 * Sử dụng useAppMutation để tự động xử lý Toast & Error
 */
export const useUpdateCategoryAttribute = () => {
  return useAppMutation<
    CategoryAttribute,
    Error,
    {
      categoryId: number;
      attributeId: number;
      required?: boolean;
      displayOrder?: number;
      groupName?: string;
    }
  >({
    mutationFn: ({
      categoryId,
      attributeId,
      required,
      displayOrder,
      groupName,
    }) => {
      return categoryAttributeService.updateAttributeMetadata(
        categoryId,
        attributeId,
        {
          required,
          displayOrder,
          groupName,
        }
      );
    },
    queryKey: ["admin", "category-attributes"],
    successMessage: "Cập nhật thuộc tính thành công!",
  });
};

/**
 * Hook để lấy danh sách attributes cho Product Form
 * - Chỉ trả về Product Attributes (is_variant_specific = false)
 * - Group theo group_name (fallback to domain nếu NULL)
 * - Sort theo display_order trong mỗi group
 * - Include attribute values
 */
export const useCategoryAttributesForProduct = (categoryId: number | null) => {
  return useQuery<Record<string, ProductAttribute[]>, Error>({
    queryKey: ["admin", "category-attributes", "for-product", categoryId],
    queryFn: () => {
      if (!categoryId) {
        throw new Error("Category ID is required");
      }
      return categoryAttributeService.getAttributesForProduct(categoryId);
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook lấy danh sách Variant Attributes (is_variant_specific = true)
 * để render Variant Generator UI trong Product Form.
 */
export const useVariantAttributes = (categoryId: number | null | undefined) => {
  return useQuery<ProductAttribute[], Error>({
    queryKey: ["admin", "category-attributes", "for-variants", categoryId],
    queryFn: () => {
      if (!categoryId || categoryId <= 0) {
        throw new Error("Category ID is required and must be greater than 0");
      }
      return categoryAttributeService.getVariantAttributes(categoryId);
    },
    enabled: !!categoryId && categoryId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
