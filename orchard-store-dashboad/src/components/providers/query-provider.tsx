"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import { useAuthStore } from "@/stores/auth-store";

function AuthBootstrapper() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          // Query errors đã được xử lý trong Axios Interceptor
          // Không cần toast lại ở đây để tránh duplicate
          onError: (error) => {
            // Silent handling - errors are already shown via axios interceptor
            console.error("Query error:", error);
          },
        }),
        mutationCache: new MutationCache({
          // Mutation errors cũng đã được xử lý trong Axios Interceptor
          // Chỉ log để debug, không toast lại
          onError: (error) => {
            // Silent handling - errors are already shown via axios interceptor
            console.error("Mutation error:", error);
          },
        }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            // Queries sẽ không throw error để UI có thể handle gracefully
            throwOnError: false,
          },
          mutations: {
            // Mutations sẽ throw error để component có thể handle nếu cần
            // Nhưng toast đã được xử lý trong axios interceptor
            throwOnError: true,
          },
        },
      })
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#4f46e5", // indigo-600
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AntdApp>
          <AuthBootstrapper />
          {children}
        </AntdApp>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ConfigProvider>
  );
}
