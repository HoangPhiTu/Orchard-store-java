import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import type {
  Category,
  CategoryFormData,
  CategoryQueryParams,
} from "@/types/catalog.types";

const CATEGORIES_QUERY_KEY = ["catalog", "categories"] as const;

export const useCategories = (params?: CategoryQueryParams) =>
  useQuery<Category[], Error>({
    queryKey: [...CATEGORIES_QUERY_KEY, params] as const,
    queryFn: () => categoryService.getAll(params),
  });

export const useCategory = (id?: number) =>
  useQuery<Category, Error>({
    queryKey: [...CATEGORIES_QUERY_KEY, "detail", id] as const,
    queryFn: () => categoryService.getById(id!),
    enabled: Boolean(id),
  });

export const useCreateCategory = (
  options?: UseMutationOptions<Category, Error, CategoryFormData, unknown>
) => {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, CategoryFormData>({
    mutationFn: (payload) => categoryService.create(payload),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useUpdateCategory = (
  options?: UseMutationOptions<
    Category,
    Error,
    { id: number; data: CategoryFormData },
    unknown
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, { id: number; data: CategoryFormData }>({
    mutationFn: ({ id, data }) => categoryService.update(id, data),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...CATEGORIES_QUERY_KEY, "detail", variables.id],
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useDeleteCategory = (
  options?: UseMutationOptions<unknown, Error, number, unknown>
) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, number>({
    mutationFn: (id) => categoryService.delete(id),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...CATEGORIES_QUERY_KEY, "detail", variables],
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
