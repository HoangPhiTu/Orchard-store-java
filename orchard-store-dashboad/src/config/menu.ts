import { LayoutDashboard, Tag, Layers3, Users, Droplets, Settings, Warehouse } from "lucide-react";

// Base menu structure - labels will be translated in components using i18n
export const ADMIN_MENU = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    key: "dashboard",
  },
  { label: "Brands", href: "/admin/brands", icon: Tag, key: "brands" },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Layers3,
    key: "categories",
  },
  {
    label: "Concentrations",
    href: "/admin/concentrations",
    icon: Droplets,
    key: "concentrations",
  },
  {
    label: "Attributes",
    href: "/admin/attributes",
    icon: Settings,
    key: "attributes",
  },
  {
    label: "Warehouses",
    href: "/admin/warehouses",
    icon: Warehouse,
    key: "warehouses",
  },
  { label: "Users", href: "/admin/users", icon: Users, key: "users" },
];
