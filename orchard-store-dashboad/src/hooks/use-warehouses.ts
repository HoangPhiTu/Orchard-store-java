import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { warehouseService } from "@/services/warehouse.service";
import { useAppMutation } from "@/hooks/use-app-mutation";
import type {
  Warehouse,
  WarehouseFormData,
  WarehouseFilter,
} from "@/types/warehouse.types";
import type { Page } from "@/types/user.types";

const WAREHOUSES_QUERY_KEY = ["admin", "warehouses"] as const;

/**
 * Normalize warehouse filters to ensure consistent query keys
 */
const normalizeWarehouseFilters = (
  filters?: WarehouseFilter
): WarehouseFilter | undefined => {
  if (!filters) return undefined;

  const normalized: WarehouseFilter = {};

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
 * Hook để lấy danh sách warehouses với pagination và filters
 */
export const useWarehouses = (filters?: WarehouseFilter) => {
  const normalizedFilters = useMemo(
    () => normalizeWarehouseFilters(filters),
    [filters]
  );

  return useQuery<Page<Warehouse>, Error>({
    queryKey: [...WAREHOUSES_QUERY_KEY, "list", normalizedFilters] as const,
    queryFn: async () => {
      const result = await warehouseService.getWarehouses(normalizedFilters);
      return result as Page<Warehouse>;
    },
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * Hook để lấy tất cả warehouses đang active (không phân trang - dành cho dropdown)
 */
export const useActiveWarehouses = () => {
  return useQuery<Warehouse[], Error>({
    queryKey: [...WAREHOUSES_QUERY_KEY, "active"] as const,
    queryFn: () => warehouseService.getActiveWarehouses(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook để lấy chi tiết một warehouse theo ID
 */
export const useWarehouse = (id: number | null) => {
  return useQuery<Warehouse, Error>({
    queryKey: [...WAREHOUSES_QUERY_KEY, "detail", id] as const,
    queryFn: () => {
      if (!id) {
        throw new Error("Warehouse ID is required");
      }
      return warehouseService.getWarehouse(id);
    },
    enabled: !!id,
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook để tạo warehouse mới
 */
export const useCreateWarehouse = () => {
  return useAppMutation<Warehouse, Error, WarehouseFormData>({
    mutationFn: (data) => warehouseService.createWarehouse(data),
    queryKey: WAREHOUSES_QUERY_KEY,
    successMessage: "Tạo kho hàng thành công!",
  });
};

/**
 * Hook để cập nhật warehouse
 */
export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();

  return useAppMutation<
    Warehouse,
    Error,
    { id: number; data: Partial<WarehouseFormData> }
  >({
    mutationFn: ({ id, data }) => warehouseService.updateWarehouse(id, data),
    queryKey: WAREHOUSES_QUERY_KEY,
    successMessage: "Cập nhật kho hàng thành công!",
    onSuccess: (updatedWarehouse, variables) => {
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: [...WAREHOUSES_QUERY_KEY, "detail", variables.id],
        });
        queryClient.setQueryData(
          [...WAREHOUSES_QUERY_KEY, "detail", variables.id],
          updatedWarehouse
        );
      }
      // Invalidate active list nếu có thay đổi về status hoặc isDefault
      if (variables.data.status !== undefined || variables.data.isDefault !== undefined) {
        queryClient.invalidateQueries({
          queryKey: [...WAREHOUSES_QUERY_KEY, "active"],
        });
      }
    },
  });
};

/**
 * Hook để xóa warehouse
 */
export const useDeleteWarehouse = () => {
  return useAppMutation<void, Error, number>({
    mutationFn: (id) => warehouseService.deleteWarehouse(id),
    queryKey: WAREHOUSES_QUERY_KEY,
    successMessage: "Xóa kho hàng thành công!",
  });
};

/**
 * Hook để đặt warehouse làm mặc định
 */
export const useSetDefaultWarehouse = () => {
  const queryClient = useQueryClient();

  return useAppMutation<Warehouse, Error, number>({
    mutationFn: (id) => warehouseService.setDefaultWarehouse(id),
    queryKey: WAREHOUSES_QUERY_KEY,
    successMessage: "Đặt kho hàng làm mặc định thành công!",
    onSuccess: () => {
      // Invalidate tất cả warehouse queries vì default có thể thay đổi
      queryClient.invalidateQueries({
        queryKey: WAREHOUSES_QUERY_KEY,
      });
    },
  });
};

