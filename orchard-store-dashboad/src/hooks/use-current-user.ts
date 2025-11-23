import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { User } from "@/types/auth.types";

/**
 * Hook để lấy thông tin user hiện tại
 * Sử dụng TanStack Query để cache và tự động refetch
 */
export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes - thông tin user không thay đổi thường xuyên
    retry: 1, // Chỉ retry 1 lần nếu lỗi
  });
}
