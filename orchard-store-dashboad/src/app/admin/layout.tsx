"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, logout, isAuthenticated, isInitialized, isLoading } =
    useAuthStore((state) => ({
      user: state.user,
      logout: state.logout,
      isAuthenticated: state.isAuthenticated,
      isInitialized: state.isInitialized,
      isLoading: state.isLoading,
    }));

  const { isSidebarCollapsed } = useUIStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const hasRedirectedRef = useRef(false);
  const hasAdminRole =
    user?.roles?.some((role) => role.includes("ADMIN")) ?? false;

  useEffect(() => {
    if (!isInitialized || isLoading) {
      return;
    }

    if (!isAuthenticated) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        router.replace("/login");
      }
      return;
    }

    if (user && !hasAdminRole) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        logout();
        router.replace("/login?error=unauthorized");
      }
      return;
    }

    hasRedirectedRef.current = false;
  }, [
    isInitialized,
    isLoading,
    isAuthenticated,
    hasAdminRole,
    user,
    router,
    logout,
  ]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const renderBlockingState = () => (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <LoadingSpinner />
    </div>
  );

  const isUnauthorized = Boolean(user) && !hasAdminRole;
  const shouldBlock =
    !isInitialized || isLoading || !isAuthenticated || !user || isUnauthorized;

  if (shouldBlock) {
    return renderBlockingState();
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div
        className={cn(
          "relative flex min-h-screen w-full flex-col transition-all duration-300 ease-in-out",
          "ml-0",
          isSidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-64"
        )}
      >
        <Header userName={user?.fullName} userEmail={user?.email} />
        <main className="min-h-[calc(100vh-4rem)] flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
