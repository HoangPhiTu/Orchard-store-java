"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Plus, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ADMIN_MENU } from "@/lib/constants";

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onLogout: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const activeKey = useMemo(() => {
    return (
      ADMIN_MENU.find((item) => pathname.startsWith(item.href))?.href ??
      "/admin/dashboard"
    );
  }, [pathname]);

  const renderNav = () => (
    <>
      <div className="mb-8 flex items-center gap-3 pl-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-[#1F9E6d] to-[#34D399] text-white font-bold shadow-lg shadow-emerald-900/30">
          O
        </div>
        {!collapsed && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60">
              Orchard
            </p>
            <p className="text-lg font-semibold text-white">Admin Console</p>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70">Conversion rate</p>
              <p className="text-2xl font-semibold">4.82%</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <Sparkles size={18} />
            </div>
          </div>
          <p className="mt-2 text-xs text-white/50">
            +12% vs last week · best performers: skincare, body care
          </p>
        </div>
      )}

      <nav className="space-y-1">
        {ADMIN_MENU.map((item) => {
          const Icon = item.icon;
          const isActive = activeKey === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isMobileOpen) onMobileClose();
              }}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all",
                "hover:bg-white/10 hover:text-white",
                isActive
                  ? "bg-white text-slate-900 shadow-lg shadow-slate-900/20"
                  : "text-white/60"
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "transition-colors",
                  isActive ? "text-slate-900" : "text-white/40"
                )}
              />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#1F9E6d] to-[#34D399] p-5 text-white shadow-xl shadow-emerald-900/30">
          <p className="text-sm text-white/80">Quick action</p>
          <p className="mt-2 text-lg font-semibold">Add new product</p>
          <p className="text-xs text-white/70">Boost catalog freshness today</p>
          <Button
            className="mt-4 h-10 w-full rounded-2xl border-0 bg-white text-emerald-600 hover:bg-white/90"
            onClick={() => router.push("/admin/products/new")}
          >
            <Plus size={16} className="mr-2" />
            New Product
          </Button>
        </div>
      )}

      <div className="mt-auto">
        <Button
          variant="outline"
          className="h-11 w-full justify-center rounded-xl border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-500"
          onClick={onLogout}
        >
          <LogOut size={16} className="mr-2" />
          {!collapsed && "Logout"}
        </Button>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="mt-3 w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-50"
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:bg-[#0F172A] lg:text-white lg:shadow-2xl lg:shadow-slate-900/40",
          "transition-all duration-300",
          collapsed ? "lg:w-24" : "lg:w-72"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto px-4 py-6">
          {renderNav()}
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-all lg:hidden",
          isMobileOpen ? "visible opacity-100" : "invisible opacity-0"
        )}
        onClick={onMobileClose}
      >
        <aside
          className="h-full w-72 bg-[#0F172A] px-4 py-6 text-white shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          {renderNav()}
        </aside>
      </div>
    </>
  );
}
