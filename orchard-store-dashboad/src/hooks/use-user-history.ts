"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import type {
  Page,
  LoginHistory,
  PagingParams,
} from "@/types/user.types";

const HISTORY_QUERY_KEY = ["admin", "users", "history"] as const;

export const useUserLoginHistory = (
  userId: number | null,
  params?: PagingParams
) => {
  return useQuery<Page<LoginHistory>, Error>({
    queryKey: [...HISTORY_QUERY_KEY, userId, params] as const,
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      return userService.getLoginHistory(userId, params);
    },
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
  });
};

