import { useEffect, useRef } from "react";
import { QueryClient } from "@tanstack/react-query";

/**
 * Hook để cancel React Query requests khi component unmount
 * Giúp tránh memory leaks và unnecessary network requests
 */
export function useRequestCancellation() {
  const abortControllersRef = useRef<AbortController[]>([]);

  useEffect(() => {
    return () => {
      // Cancel all pending requests when component unmounts
      abortControllersRef.current.forEach((controller) => {
        controller.abort();
      });
      abortControllersRef.current = [];
    };
  }, []);

  const createAbortController = () => {
    const controller = new AbortController();
    abortControllersRef.current.push(controller);
    return controller;
  };

  const removeAbortController = (controller: AbortController) => {
    abortControllersRef.current = abortControllersRef.current.filter(
      (c) => c !== controller
    );
  };

  return { createAbortController, removeAbortController };
}

/**
 * Cancel all queries for a specific query key when component unmounts
 */
export function useCancelQueriesOnUnmount(
  queryClient: QueryClient,
  queryKey: readonly unknown[]
) {
  useEffect(() => {
    return () => {
      // Cancel all queries matching the query key
      queryClient.cancelQueries({ queryKey });
    };
  }, [queryClient, queryKey]);
}

