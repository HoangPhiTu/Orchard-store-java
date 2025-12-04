"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_MENU } from "@/config/menu";
import { Tooltip } from "@/components/ui/tooltip";
import { useUIStore } from "@/stores/ui-store";
import { useI18n } from "@/hooks/use-i18n";

export interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onLogout: () => void;
}

export function Sidebar({
  isMobileOpen,
  onMobileClose,
  onLogout: _onLogout, // eslint-disable-line @typescript-eslint/no-unused-vars
}: SidebarProps) {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const mainNav = useMemo(() => {
    return ADMIN_MENU.map((item) => ({
      ...item,
      label:
        t(
          `admin.menu.${item.key}` as
            | "admin.menu.dashboard"
            | "admin.menu.brands"
            | "admin.menu.categories"
            | "admin.menu.concentrations"
            | "admin.menu.attributes"
            | "admin.menu.products"
            | "admin.menu.warehouses"
            | "admin.menu.users"
        ) || item.label,
    }));
  }, [t, locale]);
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  const renderNav = () => (
    <>
      {/* Logo & Branding Header - h-16 to match Header */}
      <div
        className={cn(
          "flex h-16 items-center justify-center border-b border-border transition-all duration-300",
          isSidebarCollapsed ? "px-0" : "gap-3 px-6"
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white font-bold">
          O
        </div>
        {!isSidebarCollapsed && (
          <div className="flex flex-col">
            <p className="text-xs font-bold uppercase tracking-wide text-foreground">
              ORCHARD
            </p>
            <p className="text-xs text-muted-foreground">
              {t("admin.layout.storeAdmin")}
            </p>
          </div>
        )}
      </div>

      {/* Main Menu Navigation */}
      <nav
        className={cn(
          "flex-1 py-4 transition-all duration-300",
          isSidebarCollapsed ? "px-3" : "px-0"
        )}
      >
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          const menuItem = (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isMobileOpen) onMobileClose();
              }}
              className={cn(
                "mx-4 my-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isSidebarCollapsed && "justify-center mx-2 px-3",
                isActive
                  ? "bg-primary/15 text-primary border-l-4 border-primary shadow-md shadow-primary/20 font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 min-w-[20px] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );

          // Wrap with Tooltip when collapsed
          if (isSidebarCollapsed) {
            return (
              <Tooltip key={item.href} content={item.label} side="right">
                {menuItem}
              </Tooltip>
            );
          }

          return menuItem;
        })}
      </nav>
    </>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:flex lg:flex-col",
          "bg-card text-foreground border-r border-border lg:border-dashed",
          "transition-all duration-300 ease-in-out",
          "z-40 h-screen",
          isSidebarCollapsed ? "lg:w-[84px]" : "lg:w-64"
        )}
      >
        {/* ✅ Tối ưu scroll: Hiển thị scrollbar mỏng và smooth scroll */}
        <div className="flex h-full flex-col overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/30">
          {renderNav()}
        </div>

        {/* Floating Toggle Button - Outside overflow container */}
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            "absolute -right-3 top-1/2 z-50 flex h-7 w-7 -translate-y-1/2 items-center justify-center",
            "rounded-full border border-border bg-card shadow-sm",
            "text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground",
            "focus:outline-none focus:ring-1 focus:ring-primary/30 focus:ring-offset-1"
          )}
          aria-label={
            isSidebarCollapsed
              ? t("admin.layout.expandSidebar")
              : t("admin.layout.collapseSidebar")
          }
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </button>
      </aside>
    </>
  );
}
