'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tag,
  FolderTree,
  ShoppingCart,
  Users,
  Settings,
  LineChart,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Sản Phẩm', icon: Package },
  { href: '/brands', label: 'Thương Hiệu', icon: Tag },
  { href: '/categories', label: 'Danh Mục', icon: FolderTree },
  { href: '/orders', label: 'Đơn Hàng', icon: ShoppingCart },
  { href: '/customers', label: 'Khách Hàng', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: LineChart },
  { href: '/settings', label: 'Cài Đặt', icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'bg-white/90 backdrop-blur border-r border-slate-200 flex flex-col transition-all duration-300',
        collapsed ? 'w-24' : 'w-72'
      )}
    >
      <div
        className={cn(
          'border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-white transition-all duration-300',
          collapsed ? 'p-4' : 'p-6'
        )}
      >
        {collapsed ? (
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Orchard Admin</h1>
                <p className="text-xs text-slate-500">Perfume &amp; Beauty</p>
              </div>
            </div>
          </>
        )}
      </div>

      <nav
        className={cn(
          'flex-1 overflow-y-auto space-y-2 transition-all duration-300',
          collapsed ? 'px-2 py-4' : 'px-4 py-6'
        )}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-600 hover:bg-slate-100/80',
                collapsed && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn('border-t border-slate-200 p-4', collapsed && 'p-3')}>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && 'Đăng xuất'}
        </button>
      </div>
    </aside>
  );
}

