"use client";

import { useState } from "react";
import {
  Menu,
  Bell,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";

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
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-white/80 px-4 backdrop-blur-md shadow-[0_15px_40px_rgba(15,23,42,0.08)] lg:px-8">
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

        <div className="hidden lg:flex lg:items-center">
          <p className="text-lg font-semibold text-slate-900">Dashboard</p>
        </div>
      </div>

      <div className="flex flex-1 items-center gap-4 px-4">
        <div className="flex w-full max-w-lg items-center gap-3 rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-sm text-slate-500 shadow-inner focus-within:border-emerald-400 focus-within:text-slate-900">
          <Search size={16} className="text-slate-400" />
          <Input
            className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            placeholder="Search products, orders, customers..."
          />
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
            ⌘K
          </span>
        </div>
        <div className="hidden rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-left text-xs text-slate-500 shadow-sm lg:block">
          <p className="font-semibold text-slate-900">Today</p>
          <p>1,204 orders · $48K revenue</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-2xl border border-slate-200/70 bg-white p-3 text-slate-600 shadow-sm hover:bg-emerald-50 hover:text-emerald-600"
        >
          <Bell size={18} />
        </button>
        <div className="hidden items-center gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm lg:flex">
          <Star size={16} className="text-amber-400" />
          <div>
            <p className="text-xs uppercase text-slate-400">Insights</p>
            <p className="text-sm font-semibold text-slate-900">
              +18% weekly growth
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-3 rounded-full border border-slate-200/70 bg-white px-3 py-1.5 text-left shadow-sm"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white font-semibold">
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
    </header>
  );
}
