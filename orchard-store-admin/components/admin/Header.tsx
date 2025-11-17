'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  User,
  LogOut,
  Calendar,
  Filter,
  PlusCircle,
  PanelLeftOpen,
  PanelLeft,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

type HeaderProps = {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function Header({ isSidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur border-b border-slate-200 px-8 py-4 sticky top-0 z-20">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <Button
            variant="outline"
            size="icon"
            className="rounded-2xl border-slate-200 text-slate-600"
            onClick={onToggleSidebar}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Tìm sản phẩm, đơn hàng, khách hàng..."
              className="pl-11 h-11 rounded-2xl bg-slate-50 border-slate-100 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-2xl border-slate-200 text-slate-600"
          >
            <Calendar className="h-4 w-4 mr-2" />
            7 ngày qua
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-2xl border-slate-200 text-slate-600"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="rounded-2xl bg-emerald-500 hover:bg-emerald-500/90"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
          <Button variant="ghost" size="icon" className="relative rounded-2xl">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 hover:bg-slate-100 rounded-2xl px-3 py-2 transition-colors"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.fullName || 'Admin'}
                </p>
                <p className="text-xs text-slate-500">{user?.email || 'admin'}</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <User className="h-5 w-5 text-emerald-500" />
              </div>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 z-20">
                  <div className="p-4 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                    <p className="text-xs text-emerald-500 mt-1 font-medium">
                      Role: {user?.role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-2xl transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

