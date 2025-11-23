import type { Page } from "./user.types";

export interface LoginHistory {
  id: number;
  userId: number;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  location?: string | null;
  loginStatus: "SUCCESS" | "FAILED" | "LOCKED";
  failureReason?: string | null;
  loginAt: string; // ISO date string
}

export interface LoginHistoryFilters {
  page?: number;
  size?: number;
}

export type LoginHistoryPage = Page<LoginHistory>;
