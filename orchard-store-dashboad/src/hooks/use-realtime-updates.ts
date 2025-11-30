"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { logger } from "@/lib/logger";

/**
 * Hook để nhận realtime updates từ WebSocket và tự động invalidate queries
 * Hỗ trợ: Brands, Categories, Users
 */
export function useRealtimeUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe vào WebSocket để nhận updates
    // Note: useWebSocket đã được setup trong header, nhưng chúng ta cần
    // một cách để listen các events cụ thể cho data updates

    // Tạm thời, chúng ta sẽ sử dụng một custom event system
    // hoặc extend useWebSocket để support data updates

    // TODO: Extend WebSocket để support data update events
    // Ví dụ: khi backend gửi event "BRAND_UPDATED", invalidate brands query

    logger.debug("Realtime updates hook initialized");

    // Cleanup
    return () => {
      logger.debug("Realtime updates hook cleaned up");
    };
  }, [queryClient]);
}

/**
 * Hook để prefetch next page data
 * Giúp tải nhanh hơn khi user navigate
 */
export function usePrefetchNextPage<T>(
  baseQueryKey: readonly unknown[],
  queryFn: (filters: unknown) => Promise<{ content: T[]; totalPages: number }>,
  currentFilters: unknown,
  currentPage: number,
  totalPages: number
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch next page nếu chưa ở trang cuối và có data
    if (currentPage < totalPages && totalPages > 0) {
      const nextPageFilters = {
        ...(currentFilters as Record<string, unknown>),
        page: currentPage, // Next page (0-based)
      };

      queryClient.prefetchQuery({
        queryKey: [...baseQueryKey, nextPageFilters] as const,
        queryFn: () => queryFn(nextPageFilters),
        staleTime: 10 * 60 * 1000, // 10 minutes - increased for better performance
      });
    }
  }, [
    currentPage,
    totalPages,
    queryClient,
    baseQueryKey,
    queryFn,
    currentFilters,
  ]);
}
