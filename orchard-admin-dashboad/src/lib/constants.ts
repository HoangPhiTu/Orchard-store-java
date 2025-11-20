import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  Megaphone,
  Settings,
} from "lucide-react";

export const ADMIN_MENU = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const API_ROUTES = {
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  PRODUCTS: "/api/admin/products",
  ORDERS: "/api/admin/orders",
};
