"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Menu,
} from "lucide-react";

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleMobileSidebar: () => void;
  userName?: string | null;
  userEmail?: string | null;
}

export function Header({
  collapsed,
  onToggleCollapse,
  onToggleMobileSidebar,
  userName,
  userEmail,
}: HeaderProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            onClick={onToggleMobileSidebar}
          >
            <Menu size={18} />
          </button>
          <button
            type="button"
            className="hidden rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:inline-flex"
            onClick={onToggleCollapse}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <span className="hidden lg:block text-lg font-semibold text-slate-900">
            Dashboard
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden sm:flex rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900"
          >
            <HelpCircle size={18} />
          </button>
          <button
            type="button"
            className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900"
          >
            <Bell size={18} />
          </button>
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left shadow-sm"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white font-semibold">
                {userName?.[0] ?? "A"}
              </div>
              <div className="hidden text-sm lg:block">
                <p className="font-semibold text-slate-800">
                  {userName ?? "Admin"}
                </p>
                <p className="text-xs text-slate-500">
                  {userEmail ?? "admin@example.com"}
                </p>
              </div>
              <ChevronDown size={16} className="text-slate-500" />
            </button>
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-100 bg-white/95 p-4 text-sm shadow-2xl shadow-slate-900/10 backdrop-blur-md"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">
                  Account
                </p>
                <p className="font-semibold text-slate-800">
                  {userName ?? "Admin User"}
                </p>
                <p className="text-xs text-slate-500">
                  {userEmail ?? "admin@example.com"}
                </p>
                <div className="mt-4 space-y-2 text-slate-600">
                  <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-50">
                    Profile
                  </button>
                  <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-50">
                    Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
