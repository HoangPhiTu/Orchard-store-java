import { LayoutDashboard, Tag, Layers3, Users } from "lucide-react";

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
  { label: "Users", href: "/admin/users", icon: Users, key: "users" },
];
