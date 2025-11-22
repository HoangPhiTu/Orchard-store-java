"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_MENU } from "@/config/menu";
import { Tooltip } from "@/components/ui/tooltip";
import { useUIStore } from "@/stores/ui-store";

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
  const mainNav = useMemo(() => ADMIN_MENU, []);
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  const renderNav = () => (
    <>
      {/* Logo & Branding Header - h-16 to match Header */}
      <div
        className={cn(
          "flex h-16 items-center justify-center border-b border-slate-200 transition-all duration-300",
          isSidebarCollapsed ? "px-0" : "gap-3 px-6"
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold">
          O
        </div>
        {!isSidebarCollapsed && (
          <div className="flex flex-col">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-900">
              ORCHARD
            </p>
            <p className="text-xs text-slate-500">Store Admin</p>
          </div>
        )}
      </div>

      {/* Main Menu Navigation */}
      <nav
        className={cn(
          "flex-1 py-4 transition-all duration-300",
          isSidebarCollapsed ? "px-2" : "px-0"
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
                isSidebarCollapsed && "justify-center",
                isActive
                  ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 min-w-[20px]",
                  isActive ? "text-indigo-600" : "text-slate-500"
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
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:bg-white lg:text-slate-900",
          "lg:border-r lg:border-slate-200 lg:border-dashed",
          "transition-all duration-300 ease-in-out",
          "relative",
          isSidebarCollapsed ? "lg:w-[70px]" : "lg:w-64"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {renderNav()}
        </div>

        {/* Floating Toggle Button - Outside overflow container */}
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            "absolute -right-3 top-1/2 z-50 flex h-7 w-7 -translate-y-1/2 items-center justify-center",
            "rounded-full border border-slate-200 bg-white shadow-sm",
            "text-slate-400 transition-all hover:bg-slate-50 hover:text-indigo-600",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          )}
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
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
