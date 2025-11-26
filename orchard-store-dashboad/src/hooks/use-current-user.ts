import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/auth.types";

export function useCurrentUser() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const data = await authService.getCurrentUser();
      useAuthStore.setState({
        user: data,
        isAuthenticated: true,
        isInitialized: true,
      });
      return data;
    },
    enabled: !user,
    initialData: user ?? undefined,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    refetchOnReconnect: false,
  });

  return {
    ...query,
    data: user ?? query.data,
    isAuthenticated,
  };
}
