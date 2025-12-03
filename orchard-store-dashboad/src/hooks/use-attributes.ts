import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { attributeService } from "@/services/attribute.service";
import { useAppMutation } from "@/hooks/use-app-mutation";
import type {
  ProductAttribute,
  AttributeValue,
  AttributeFormData,
  AttributeFilter,
} from "@/types/attribute.types";
import type { Page } from "@/types/user.types";

const ATTRIBUTES_QUERY_KEY = ["admin", "attributes"] as const;

/**
 * Normalize attribute filters to ensure consistent query keys
 */
const normalizeAttributeFilters = (
  filters?: AttributeFilter
): AttributeFilter | undefined => {
  if (!filters) return undefined;

  const normalized: AttributeFilter = {};

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

  // Include domain if defined
  if (filters.domain) {
    normalized.domain = filters.domain;
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
 * Hook để lấy danh sách attributes với pagination và filters
 */
export const useAttributes = (filters?: AttributeFilter) => {
  const normalizedFilters = useMemo(
    () => normalizeAttributeFilters(filters),
    [filters]
  );

  return useQuery<Page<ProductAttribute>, Error>({
    queryKey: [...ATTRIBUTES_QUERY_KEY, "list", normalizedFilters] as const,
    queryFn: async () => {
      const result = await attributeService.getAttributes(normalizedFilters);
      return result as Page<ProductAttribute>;
    },
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * Hook để lấy tất cả attributes (không phân trang - dành cho dropdown)
 */
export const useAllAttributes = () => {
  return useQuery<ProductAttribute[], Error>({
    queryKey: [...ATTRIBUTES_QUERY_KEY, "all"] as const,
    queryFn: () => attributeService.getAllAttributes(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook để lấy chi tiết một attribute theo ID
 */
export const useAttribute = (id: number | null) => {
  return useQuery<ProductAttribute, Error>({
    queryKey: [...ATTRIBUTES_QUERY_KEY, "detail", id] as const,
    queryFn: () => {
      if (!id) {
        throw new Error("Attribute ID is required");
      }
      return attributeService.getAttribute(id);
    },
    enabled: !!id,
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook để lấy danh sách values của attribute
 */
export const useAttributeValues = (attributeId: number | null) => {
  return useQuery<AttributeValue[], Error>({
    queryKey: [...ATTRIBUTES_QUERY_KEY, "values", attributeId] as const,
    queryFn: () => {
      if (!attributeId) {
        throw new Error("Attribute ID is required");
      }
      return attributeService.getAttributeValues(attributeId);
    },
    enabled: !!attributeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook để tạo attribute mới
 */
export const useCreateAttribute = () => {
  return useAppMutation<ProductAttribute, Error, AttributeFormData>({
    mutationFn: (data) => attributeService.createAttribute(data),
    queryKey: ATTRIBUTES_QUERY_KEY,
    successMessage: "Tạo thuộc tính thành công!",
  });
};

/**
 * Hook để cập nhật attribute
 */
export const useUpdateAttribute = () => {
  const queryClient = useQueryClient();

  return useAppMutation<
    ProductAttribute,
    Error,
    { id: number; data: AttributeFormData }
  >({
    mutationFn: ({ id, data }) => attributeService.updateAttribute(id, data),
    queryKey: ATTRIBUTES_QUERY_KEY,
    successMessage: "Cập nhật thuộc tính thành công!",
    onSuccess: (updatedAttribute, variables) => {
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: [...ATTRIBUTES_QUERY_KEY, "detail", variables.id],
        });
        queryClient.invalidateQueries({
          queryKey: [...ATTRIBUTES_QUERY_KEY, "values", variables.id],
        });
        queryClient.setQueryData(
          [...ATTRIBUTES_QUERY_KEY, "detail", variables.id],
          updatedAttribute
        );
      }
    },
  });
};

/**
 * Hook để xóa attribute
 */
export const useDeleteAttribute = () => {
  return useAppMutation<void, Error, number>({
    mutationFn: (id) => attributeService.deleteAttribute(id),
    queryKey: ATTRIBUTES_QUERY_KEY,
    successMessage: "Xóa thuộc tính thành công!",
  });
};

/**
 * Hook để tạo attribute value mới
 */
export const useCreateAttributeValue = () => {
  const queryClient = useQueryClient();

  return useAppMutation<
    AttributeValue,
    Error,
    { attributeId: number; data: AttributeValue }
  >({
    mutationFn: ({ attributeId, data }) =>
      attributeService.createAttributeValue(attributeId, data),
    queryKey: ATTRIBUTES_QUERY_KEY,
    successMessage: "Tạo giá trị thuộc tính thành công!",
    onSuccess: (_, variables) => {
      // Invalidate attribute detail và values list
      queryClient.invalidateQueries({
        queryKey: [...ATTRIBUTES_QUERY_KEY, "detail", variables.attributeId],
      });
      queryClient.invalidateQueries({
        queryKey: [...ATTRIBUTES_QUERY_KEY, "values", variables.attributeId],
      });
    },
  });
};

/**
 * Hook để cập nhật attribute value
 */
export const useUpdateAttributeValue = () => {
  const queryClient = useQueryClient();

  return useAppMutation<
    AttributeValue,
    Error,
    { attributeId: number; valueId: number; data: AttributeValue }
  >({
    mutationFn: ({ attributeId, valueId, data }) =>
      attributeService.updateAttributeValue(attributeId, valueId, data),
    queryKey: ATTRIBUTES_QUERY_KEY,
    successMessage: "Cập nhật giá trị thuộc tính thành công!",
    onSuccess: (_, variables) => {
      // Invalidate attribute detail và values list
      queryClient.invalidateQueries({
        queryKey: [...ATTRIBUTES_QUERY_KEY, "detail", variables.attributeId],
      });
      queryClient.invalidateQueries({
        queryKey: [...ATTRIBUTES_QUERY_KEY, "values", variables.attributeId],
      });
    },
  });
};

/**
 * Hook để xóa attribute value
 */
export const useDeleteAttributeValue = () => {
  const queryClient = useQueryClient();

  return useAppMutation<
    void,
    Error,
    { attributeId: number; valueId: number }
  >({
    mutationFn: ({ attributeId, valueId }) =>
      attributeService.deleteAttributeValue(attributeId, valueId),
    queryKey: ATTRIBUTES_QUERY_KEY,
    successMessage: "Xóa giá trị thuộc tính thành công!",
    onSuccess: (_, variables) => {
      // Invalidate attribute detail và values list
      queryClient.invalidateQueries({
        queryKey: [...ATTRIBUTES_QUERY_KEY, "detail", variables.attributeId],
      });
      queryClient.invalidateQueries({
        queryKey: [...ATTRIBUTES_QUERY_KEY, "values", variables.attributeId],
      });
    },
  });
};

