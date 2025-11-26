"use client";

import { Badge, type BadgeProps } from "@/components/ui/badge";

interface StatusBadgeProps extends BadgeProps {
  status?: string | null;
  activeLabel?: string;
  inactiveLabel?: string;
}

const getStatusVariant = (status?: string | null): BadgeProps["variant"] => {
  if (!status) return "secondary";
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "success";
    case "INACTIVE":
      return "secondary";
    case "BANNED":
      return "danger";
    case "SUSPENDED":
      return "warning";
    default:
      return "secondary";
  }
};

export function StatusBadge({
  status,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  ...props
}: StatusBadgeProps) {
  const label =
    status && status.toUpperCase() === "ACTIVE" ? activeLabel : inactiveLabel;

  return (
    <Badge variant={getStatusVariant(status)} {...props}>
      {status ? label : inactiveLabel}
    </Badge>
  );
}
