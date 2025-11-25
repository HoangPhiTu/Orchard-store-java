import { ReactNode, createElement } from "react";

export interface FilterOption {
  label: string;
  value: string;
  icon?: ReactNode;
}

const renderDot = (className: string): ReactNode =>
  createElement("span", {
    className: `mr-2 inline-block h-2 w-2 rounded-full ${className}`,
  });

export const STATUS_OPTIONS: FilterOption[] = [
  {
    label: "Active",
    value: "ACTIVE",
    icon: renderDot("bg-emerald-500"),
  },
  {
    label: "Inactive",
    value: "INACTIVE",
    icon: renderDot("bg-slate-400"),
  },
  {
    label: "Banned",
    value: "BANNED",
    icon: renderDot("bg-red-500"),
  },
];
