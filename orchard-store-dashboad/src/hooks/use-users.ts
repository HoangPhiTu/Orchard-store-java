import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  keepPreviousData,
} from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import type {
  User,
  UserFilters,
  UserCreateRequestDTO,
  UserUpdateRequestDTO,
  Page,
} from "@/types/user.types";
import { toast } from "sonner";

const USERS_QUERY_KEY = ["admin", "users"] as const;

/**
 * Hook để lấy danh sách users với tìm kiếm và phân trang
 * Sử dụng keepPreviousData để tránh nháy khi phân trang
 */
/**
 * Normalize user filters to ensure consistent query keys
 */
const normalizeUserFilters = (
  filters?: UserFilters
): UserFilters | undefined => {
  if (!filters) return undefined;

  const normalized: UserFilters = {};

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

  // Include status if defined and not "ALL"
  if (filters.status && filters.status !== "ALL") {
    normalized.status = filters.status;
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

export const useUsers = (filters?: UserFilters) => {
  const requestFilters = useMemo(
    () => normalizeUserFilters(filters),
    [filters]
  );

  return useQuery<Page<User>, Error>({
    queryKey: [...USERS_QUERY_KEY, requestFilters] as const,
    queryFn: () => userService.getUsers(requestFilters),
    placeholderData: keepPreviousData,
    // Users có thể thay đổi thường xuyên hơn, nhưng vẫn cache để tối ưu
    staleTime: 5 * 60 * 1000, // 5 minutes - increased for better performance
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * Hook để lấy chi tiết một user theo ID
 * Có caching để tránh refetch không cần thiết
 */
export const useUser = (id: number | null) => {
  return useQuery<User, Error>({
    queryKey: [...USERS_QUERY_KEY, "detail", id] as const,
    queryFn: () => {
      if (!id) {
        throw new Error("User ID is required");
      }
      return userService.getUser(id);
    },
    enabled: !!id, // Chỉ query khi có ID
    staleTime: 5 * 60 * 1000, // 5 minutes - user data ít thay đổi
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    refetchOnMount: false, // Không refetch khi component mount lại
    refetchOnWindowFocus: false, // Không refetch khi window focus
  });
};

/**
 * Hook để tạo user mới
 */
export const useCreateUser = (
  options?: UseMutationOptions<User, Error, UserCreateRequestDTO, unknown>
) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, UserCreateRequestDTO>({
    mutationFn: (data) => userService.createUser(data),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      // ✅ Invalidate queries (mark as stale)
      await queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      // ✅ Chỉ refetch những queries đang active (đang được sử dụng trong component)
      // Điều này tránh refetch tất cả queries và cải thiện hiệu năng
      await queryClient.refetchQueries({
        queryKey: USERS_QUERY_KEY,
        type: "active", // ✅ Chỉ refetch active queries
      });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};

/**
 * Hook để cập nhật user
 */
export const useUpdateUser = (
  options?: UseMutationOptions<
    User,
    Error,
    { id: number; data: UserUpdateRequestDTO },
    unknown
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: number; data: UserUpdateRequestDTO }>({
    mutationFn: ({ id, data }) => userService.updateUser(id, data),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      // ✅ Invalidate queries (mark as stale)
      await queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      // ✅ Refetch queries ngay lập tức để tải lại dữ liệu mới
      await queryClient.refetchQueries({ queryKey: USERS_QUERY_KEY });
      // Cập nhật cache cho user detail nếu đang được query
      queryClient.setQueryData(
        [...USERS_QUERY_KEY, "detail", variables.id],
        data
      );
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};

/**
 * Hook để khóa/mở khóa user (toggle status)
 */
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<
    User,
    Error,
    number,
    { previousUsers?: Page<User> | undefined }
  >({
    mutationFn: (id) => userService.toggleUserStatus(id),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY });
      const previousUsers = queryClient.getQueryData<Page<User>>([
        ...USERS_QUERY_KEY,
      ]);

      queryClient.setQueryData<Page<User> | undefined>(
        [...USERS_QUERY_KEY],
        (old) => {
          if (!old || !Array.isArray(old.content)) {
            return old;
          }

          return {
            ...old,
            content: old.content.map((user) =>
              user.id === userId
                ? {
                    ...user,
                    status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                  }
                : user
            ),
          };
        }
      );

      return { previousUsers };
    },
    onError: (error, _userId, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData([...USERS_QUERY_KEY], context.previousUsers);
      }
      toast.error(`Failed to update user status: ${error.message}`);
    },
    onSettled: (_data, _error, userId) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      if (userId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: [...USERS_QUERY_KEY, "detail", userId],
        });
      }
    },
  });
};

/**
 * Hook để khởi tạo đổi email (gửi OTP)
 */
export const useChangeEmailInit = (
  options?: UseMutationOptions<void, Error, { id: number; newEmail: string }>
) => {
  return useMutation<void, Error, { id: number; newEmail: string }>({
    mutationFn: ({ id, newEmail }) =>
      userService.initiateChangeEmail(id, newEmail),
    ...options,
  });
};

/**
 * Hook để xác thực đổi email bằng OTP
 */
export const useChangeEmailVerify = (
  options?: UseMutationOptions<
    void,
    Error,
    { id: number; newEmail: string; otp: string }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: number; newEmail: string; otp: string }
  >({
    mutationFn: ({ id, newEmail, otp }) =>
      userService.verifyChangeEmail(id, newEmail, otp),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      // ✅ Invalidate queries (mark as stale)
      await queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      // ✅ Chỉ refetch những queries đang active (đang được sử dụng trong component)
      // Điều này tránh refetch tất cả queries và cải thiện hiệu năng
      await queryClient.refetchQueries({
        queryKey: USERS_QUERY_KEY,
        type: "active", // ✅ Chỉ refetch active queries
      });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
