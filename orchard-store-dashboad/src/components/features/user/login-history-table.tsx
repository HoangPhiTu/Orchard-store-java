"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LoginHistory } from "@/types/user.types";

interface LoginHistoryTableProps {
  history: LoginHistory[];
  isLoading?: boolean;
}

/**
 * Get badge variant for login status
 */
const getStatusBadgeVariant = (
  status: string
): "default" | "secondary" | "success" | "warning" | "danger" => {
  switch (status.toUpperCase()) {
    case "SUCCESS":
      return "success"; // Green
    case "FAILED":
      return "danger"; // Red
    case "LOCKED":
      return "warning"; // Orange/Yellow
    default:
      return "secondary";
  }
};

/**
 * Format date to DD/MM/YYYY HH:mm
 */
const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm");
  } catch {
    return dateString;
  }
};

export function LoginHistoryTable({
  history,
  isLoading,
}: LoginHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">
          Đang tải lịch sử đăng nhập...
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Chưa có lịch sử đăng nhập</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Thời gian</TableHead>
            <TableHead className="w-[150px]">IP Address</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium text-card-foreground">
                {formatDateTime(item.loginTime)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {item.ipAddress || "—"}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(item.status)}>
                  {item.status === "SUCCESS"
                    ? "Thành công"
                    : item.status === "FAILED"
                    ? "Thất bại"
                    : "Đã khóa"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
