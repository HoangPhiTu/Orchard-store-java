import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { brandService } from "@/services/brand.service";
import type {
  Brand,
  BrandFormData,
  BrandQueryParams,
} from "@/types/catalog.types";

const BRANDS_QUERY_KEY = ["catalog", "brands"] as const;

export const useBrands = (params?: BrandQueryParams) =>
  useQuery<Brand[], Error>({
    queryKey: [...BRANDS_QUERY_KEY, params] as const,
    queryFn: () => brandService.getAll(params),
  });

export const useBrand = (id?: number) =>
  useQuery<Brand, Error>({
    queryKey: [...BRANDS_QUERY_KEY, "detail", id] as const,
    queryFn: () => brandService.getById(id!),
    enabled: Boolean(id),
  });

export const useCreateBrand = (
  options?: UseMutationOptions<Brand, Error, BrandFormData, unknown>
) => {
  const queryClient = useQueryClient();
  return useMutation<Brand, Error, BrandFormData>({
    mutationFn: (payload) => brandService.create(payload),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useUpdateBrand = (
  options?: UseMutationOptions<
    Brand,
    Error,
    { id: number; data: BrandFormData },
    unknown
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<Brand, Error, { id: number; data: BrandFormData }>({
    mutationFn: ({ id, data }) => brandService.update(id, data),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...BRANDS_QUERY_KEY, "detail", variables.id],
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useDeleteBrand = (
  options?: UseMutationOptions<unknown, Error, number, unknown>
) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, number>({
    mutationFn: (id) => brandService.delete(id),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...BRANDS_QUERY_KEY, "detail", variables],
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
