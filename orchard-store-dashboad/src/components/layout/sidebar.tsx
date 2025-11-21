"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Headphones,
  LifeBuoy,
  Link2,
  LogOut,
  MenuSquare,
  Package,
  Percent,
  Plus,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { brandService } from "@/services/brand.service";
import { categoryService } from "@/services/category.service";
import type { Brand, Category } from "@/types/catalog.types";

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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isBrandsLoading, setBrandsLoading] = useState(true);
  const [isCategoriesLoading, setCategoriesLoading] = useState(true);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchBrands = async () => {
      setBrandsLoading(true);
      try {
        const data = await brandService.getAll({ status: "ACTIVE", size: 50 });
        if (!ignore) {
          setBrands(data);
          setBrandError(null);
        }
      } catch (error) {
        console.error("Failed to load brands", error);
        if (!ignore) {
          setBrandError("Không thể tải danh sách thương hiệu");
        }
      } finally {
        if (!ignore) {
          setBrandsLoading(false);
        }
      }
    };

    fetchBrands();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const data = await categoryService.getRoots();
        if (!ignore) {
          setCategories(data);
          setCategoryError(null);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
        if (!ignore) {
          setCategoryError("Không thể tải danh mục");
        }
      } finally {
        if (!ignore) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();
    return () => {
      ignore = true;
    };
  }, []);

  const topBrands = brands.slice(0, 5);
  const topCategories = categories.slice(0, 5);

  const handleNavigate = (target: string) => {
    router.push(target);
    if (isMobileOpen) onMobileClose();
  };

  const mainNav = useMemo(
    () => [
      { label: "Overview", href: "/admin/dashboard", icon: MenuSquare },
      {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        badge: "10",
      },
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Categories", href: "/admin/categories", icon: Tag },
      { label: "Brands", href: "/admin/brands", icon: Percent },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Marketing", href: "/admin/marketing", icon: Tag },
      { label: "Discounts", href: "/admin/discounts", icon: Percent },
    ],
    []
  );

  const salesChannels = [
    { label: "Online Store", icon: Store, href: "/admin/channels/online" },
    { label: "Point of Sale", icon: ShoppingBag, href: "/admin/channels/pos" },
  ];

  const resources = [
    { label: "Settings", icon: Settings, href: "/admin/settings" },
    { label: "Integrations", icon: Link2, href: "/admin/integrations" },
    { label: "Support", icon: LifeBuoy, href: "/admin/support" },
  ];

  const footerLinks = [
    { label: "Get Help", icon: Headphones, href: "/admin/help" },
  ];

  const renderNav = () => (
    <>
      <div className="mb-8 flex items-center gap-3 pl-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-800 text-white font-bold shadow-lg shadow-slate-900/20">
          O
        </div>
        {!collapsed && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-500">
              Orchard
            </p>
            <p className="text-lg font-semibold text-slate-900">
              Admin Console
            </p>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div>
          {!collapsed && (
            <p className="mb-3 pl-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Main Menu
            </p>
          )}
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (isMobileOpen) onMobileClose();
                  }}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:bg-slate-200/40 hover:text-slate-900"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl border text-slate-500 transition-all",
                      isActive
                        ? "border-slate-200 bg-slate-50 text-slate-900"
                        : "border-transparent bg-slate-100 group-hover:bg-white"
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  {!collapsed && (
                    <div className="flex w-full items-center justify-between">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          {!collapsed && (
            <p className="mb-3 pl-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Sales Channels
            </p>
          )}
          <nav className="space-y-1">
            {salesChannels.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:bg-slate-200/40 hover:text-slate-900"
                  )}
                >
                  <Icon
                    size={18}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-slate-900" : "text-slate-500"
                    )}
                  />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          {!collapsed && (
            <p className="mb-3 pl-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Resources
            </p>
          )}
          <nav className="space-y-1">
            {resources.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:bg-slate-200/40 hover:text-slate-900"
                  )}
                >
                  <Icon
                    size={18}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-slate-900" : "text-slate-500"
                    )}
                  />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          {!collapsed && (
            <div className="mb-3 flex items-center justify-between pl-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <p>Brands</p>
              <span className="text-[10px] font-semibold text-slate-400">
                {brands.length.toString().padStart(2, "0")}
              </span>
            </div>
          )}
          <div className="space-y-2">
            {isBrandsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`brand-skeleton-${index}`}
                  className="h-11 animate-pulse rounded-2xl bg-slate-200/60"
                />
              ))
            ) : brandError ? (
              <p className="px-3 text-xs text-red-500">{brandError}</p>
            ) : topBrands.length ? (
              topBrands.map((brand) => (
                <button
                  type="button"
                  key={brand.id}
                  onClick={() =>
                    handleNavigate(`/admin/products?brandId=${brand.id}`)
                  }
                  className={cn(
                    "w-full rounded-2xl border border-slate-100 px-3 py-2 text-left transition hover:border-slate-300 hover:bg-white",
                    "text-sm text-slate-600"
                  )}
                >
                  <p className="font-semibold text-slate-900">{brand.name}</p>
                  {!collapsed && (
                    <p className="text-xs text-slate-500">
                      {brand.country || "Global brand"}
                    </p>
                  )}
                </button>
              ))
            ) : (
              <p className="px-3 text-xs text-slate-400">No brands available</p>
            )}
          </div>
        </div>

        <div>
          {!collapsed && (
            <div className="mb-3 flex items-center justify-between pl-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <p>Categories</p>
              <span className="text-[10px] font-semibold text-slate-400">
                {categories.length.toString().padStart(2, "0")}
              </span>
            </div>
          )}
          <div className="space-y-2">
            {isCategoriesLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`category-skeleton-${index}`}
                  className="h-11 animate-pulse rounded-2xl bg-slate-200/60"
                />
              ))
            ) : categoryError ? (
              <p className="px-3 text-xs text-red-500">{categoryError}</p>
            ) : topCategories.length ? (
              topCategories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() =>
                    handleNavigate(`/admin/products?categoryId=${category.id}`)
                  }
                  className={cn(
                    "w-full rounded-2xl border border-slate-100 px-3 py-2 text-left transition hover:border-slate-300 hover:bg-white",
                    "text-sm text-slate-600"
                  )}
                >
                  <p className="font-semibold text-slate-900">
                    {category.name}
                  </p>
                  {!collapsed && (
                    <p className="text-xs text-slate-500">
                      {category.parentName
                        ? `Child of ${category.parentName}`
                        : "Top-level"}
                    </p>
                  )}
                </button>
              ))
            ) : (
              <p className="px-3 text-xs text-slate-400">No categories found</p>
            )}
          </div>
        </div>
      </div>

      {!collapsed && (
        <div className="mt-6 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">Need help?</p>
          <p className="text-xs text-slate-500">
            Visit our knowledge base or chat with support.
          </p>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-slate-700 hover:bg-white"
            onClick={() => router.push("/admin/help")}
          >
            <LifeBuoy size={16} />
            Help Center
          </Button>
          <Button
            className="w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => router.push("/admin/products/new")}
          >
            <Plus size={16} />
            New Product
          </Button>
        </div>
      )}

      <div className="mt-auto space-y-2">
        {!collapsed &&
          footerLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/40 hover:text-slate-900"
              >
                <Icon size={18} className="text-slate-500" />
                {item.label}
              </Link>
            );
          })}
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
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:bg-slate-50 lg:text-slate-900 lg:shadow-2xl lg:shadow-slate-900/5 lg:border-r lg:border-slate-200",
          "transition-all duration-300",
          collapsed ? "lg:w-24" : "lg:w-72"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300">
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
          className="flex h-full w-72 flex-col overflow-y-auto bg-slate-50 px-4 py-6 text-slate-900 shadow-xl border-r border-slate-200 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300"
          onClick={(event) => event.stopPropagation()}
        >
          {renderNav()}
        </aside>
      </div>
    </>
  );
}
