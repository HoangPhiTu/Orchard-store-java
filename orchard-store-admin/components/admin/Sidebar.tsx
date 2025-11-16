'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  FolderTree, 
  ShoppingCart, 
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Sản Phẩm', icon: Package },
  { href: '/brands', label: 'Thương Hiệu', icon: Tag },
  { href: '/categories', label: 'Danh Mục', icon: FolderTree },
  { href: '/orders', label: 'Đơn Hàng', icon: ShoppingCart },
  { href: '/customers', label: 'Khách Hàng', icon: Users },
  { href: '/settings', label: 'Cài Đặt', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Orchard Store</h1>
        <p className="text-sm text-gray-500">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors">
          <LogOut className="h-5 w-5" />
          Đăng Xuất
        </button>
      </div>
    </aside>
  );
}

