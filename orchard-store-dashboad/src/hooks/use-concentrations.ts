import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { concentrationService } from "@/services/concentration.service";
import { useAppMutation } from "@/hooks/use-app-mutation";
import type {
  Concentration,
  ConcentrationFormData,
  ConcentrationFilter,
} from "@/types/concentration.types";
import type { Page } from "@/types/user.types";

const CONCENTRATIONS_QUERY_KEY = ["admin", "concentrations"] as const;

/**
 * Normalize concentration filters to ensure consistent query keys
 */
const normalizeConcentrationFilters = (
  filters?: ConcentrationFilter
): ConcentrationFilter | undefined => {
  if (!filters) return undefined;

  const normalized: ConcentrationFilter = {};

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
 * Hook để lấy danh sách concentrations với pagination và filters
 * Sử dụng keepPreviousData để tránh nháy khi phân trang
 */
export const useConcentrations = (filters?: ConcentrationFilter) => {
  const normalizedFilters = useMemo(
    () => normalizeConcentrationFilters(filters),
    [filters]
  );

  return useQuery<Page<Concentration>, Error>({
    queryKey: [...CONCENTRATIONS_QUERY_KEY, "list", normalizedFilters] as const,
    queryFn: async () => {
      const result = await concentrationService.getConcentrations(normalizedFilters);
      return result as Page<Concentration>;
    },
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * Hook để lấy tất cả concentrations (không phân trang - dành cho dropdown)
 */
export const useAllConcentrations = (activeOnly?: boolean) => {
  return useQuery<Concentration[], Error>({
    queryKey: [...CONCENTRATIONS_QUERY_KEY, "all", { activeOnly }] as const,
    queryFn: () => concentrationService.getAllConcentrations({ activeOnly }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook để lấy chi tiết một concentration theo ID
 */
export const useConcentration = (id: number | null) => {
  return useQuery<Concentration, Error>({
    queryKey: [...CONCENTRATIONS_QUERY_KEY, "detail", id] as const,
    queryFn: () => {
      if (!id) {
        throw new Error("Concentration ID is required");
      }
      return concentrationService.getConcentration(id);
    },
    enabled: !!id,
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook để tạo concentration mới
 */
export const useCreateConcentration = () => {
  return useAppMutation<Concentration, Error, ConcentrationFormData>({
    mutationFn: (data) => concentrationService.createConcentration(data),
    queryKey: CONCENTRATIONS_QUERY_KEY,
    successMessage: "Tạo nồng độ thành công!",
  });
};

/**
 * Hook để cập nhật concentration
 */
export const useUpdateConcentration = () => {
  const queryClient = useQueryClient();

  return useAppMutation<
    Concentration,
    Error,
    { id: number; data: Partial<ConcentrationFormData> }
  >({
    mutationFn: ({ id, data }) => concentrationService.updateConcentration(id, data),
    queryKey: CONCENTRATIONS_QUERY_KEY,
    successMessage: "Cập nhật nồng độ thành công!",
    onSuccess: (updatedConcentration, variables) => {
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: [...CONCENTRATIONS_QUERY_KEY, "detail", variables.id],
        });
        queryClient.setQueryData(
          [...CONCENTRATIONS_QUERY_KEY, "detail", variables.id],
          updatedConcentration
        );
      }
    },
  });
};

/**
 * Hook để xóa concentration
 */
export const useDeleteConcentration = () => {
  return useAppMutation<void, Error, number>({
    mutationFn: (id) => concentrationService.deleteConcentration(id),
    queryKey: CONCENTRATIONS_QUERY_KEY,
    successMessage: "Xóa nồng độ thành công!",
  });
};

