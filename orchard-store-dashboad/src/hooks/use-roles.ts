import { useQuery } from "@tanstack/react-query";
import { roleService } from "@/services/role.service";
import type { Role } from "@/types/auth.types";

const ROLES_QUERY_KEY = ["admin", "roles"] as const;

/**
 * Hook để lấy danh sách tất cả roles
 * Sử dụng để hiển thị trong dropdown khi tạo/cập nhật user
 * 
 * @returns Query result với danh sách roles (chỉ ACTIVE roles)
 */
export const useRoles = () => {
  return useQuery<Role[], Error>({
    queryKey: ROLES_QUERY_KEY,
    queryFn: () => roleService.getAllRoles(),
    staleTime: 5 * 60 * 1000, // Cache 5 phút (roles ít thay đổi)
    gcTime: 10 * 60 * 1000, // Giữ cache 10 phút
  });
};

