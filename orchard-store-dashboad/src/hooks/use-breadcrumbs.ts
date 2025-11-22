import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ADMIN_MENU } from "@/config/menu";

export interface BreadcrumbItem {
  label: string;
  href: string;
  isLast?: boolean;
}

/**
 * Route label mapping for breadcrumbs
 * Maps route segments to human-readable labels
 */
const ROUTE_LABELS: Record<string, string> = {
  admin: "Home",
  dashboard: "Dashboard",
  create: "Create",
  edit: "Edit",
  categories: "Categories",
  brands: "Brands",
};

/**
 * Checks if a string looks like a UUID or numeric ID
 */
const isId = (segment: string): boolean => {
  // UUID pattern: 8-4-4-4-12 hex characters
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  // Numeric ID pattern
  const numericPattern = /^\d+$/;
  // Long alphanumeric string (likely an ID)
  const longAlphanumeric = /^[a-z0-9]{20,}$/i;

  return (
    uuidPattern.test(segment) ||
    numericPattern.test(segment) ||
    longAlphanumeric.test(segment)
  );
};

/**
 * Shortens an ID for display
 */
const shortenId = (id: string): string => {
  if (id.length <= 8) return id;
  return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
};

/**
 * Gets label for a route segment
 */
const getRouteLabel = (
  segment: string,
  index: number,
  segments: string[]
): string => {
  // Check if it's an ID
  if (isId(segment)) {
    // If previous segment exists, use context
    const prevSegment = index > 0 ? segments[index - 1] : "";
    if (prevSegment === "brands" || prevSegment === "categories") {
      return "Details";
    }
    return shortenId(segment);
  }

  // Check menu items first
  const menuItem = ADMIN_MENU.find((item) => item.href.includes(segment));
  if (menuItem) {
    return menuItem.label;
  }

  // Check route labels mapping
  if (ROUTE_LABELS[segment]) {
    return ROUTE_LABELS[segment];
  }

  // Capitalize first letter as fallback
  return segment.charAt(0).toUpperCase() + segment.slice(1);
};

/**
 * Hook to generate breadcrumbs from current pathname
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    // Remove leading/trailing slashes and split
    const segments = pathname.split("/").filter(Boolean);

    // If we're at root or admin root, return just Home
    if (
      segments.length === 0 ||
      (segments.length === 1 && segments[0] === "admin")
    ) {
      return [{ label: "Home", href: "/admin/dashboard", isLast: true }];
    }

    // If we're at /admin/dashboard, return just Home
    if (
      segments.length === 2 &&
      segments[0] === "admin" &&
      segments[1] === "dashboard"
    ) {
      return [{ label: "Home", href: "/admin/dashboard", isLast: true }];
    }

    // Build breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Home
    breadcrumbs.push({
      label: "Home",
      href: "/admin/dashboard",
    });

    // Build path incrementally
    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Skip "admin" segment as it's implicit
      if (segment === "admin") {
        return;
      }

      // Skip "dashboard" if it's the only segment after "admin" (already handled by Home)
      if (segment === "dashboard" && currentPath === "/admin/dashboard") {
        return;
      }

      const label = getRouteLabel(segment, index, segments);

      breadcrumbs.push({
        label,
        href: currentPath,
        isLast,
      });
    });

    return breadcrumbs;
  }, [pathname]);
}
