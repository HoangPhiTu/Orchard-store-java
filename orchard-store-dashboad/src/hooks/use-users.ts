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

const USERS_QUERY_KEY = ["admin", "users"] as const;

/**
 * Hook để lấy danh sách users với tìm kiếm và phân trang
 * Sử dụng keepPreviousData để tránh nháy khi phân trang
 */
export const useUsers = (filters?: UserFilters) => {
  return useQuery<Page<User>, Error>({
    queryKey: [...USERS_QUERY_KEY, "list", filters] as const,
    queryFn: () => userService.getUsers(filters),
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook để lấy chi tiết một user theo ID
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
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate users list và detail queries
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
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
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate users list và detail queries
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
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
export const useToggleUserStatus = (
  options?: UseMutationOptions<User, Error, number, unknown>
) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, number>({
    mutationFn: (id) => userService.toggleUserStatus(id),
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate users list và detail queries
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      // Cập nhật cache cho user detail nếu đang được query
      queryClient.setQueryData([...USERS_QUERY_KEY, "detail", variables], data);
      options?.onSuccess?.(data, variables, context, mutation);
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
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
