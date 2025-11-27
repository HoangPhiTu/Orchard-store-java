"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Laptop,
  Smartphone,
  Tablet,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserLoginHistory } from "@/hooks/use-user-history";
import type { LoginHistory, Page } from "@/types/user.types";
import { Tooltip } from "@/components/ui/tooltip";

const LOCALHOST_IPS = new Set(["127.0.0.1", "::1", "0:0:0:0:0:0:0:1"]);

interface UserHistoryTableProps {
  userId: number;
  pageSize?: number;
}

const formatDateTime = (value: string): string => {
  try {
    return format(new Date(value), "dd/MM/yyyy HH:mm");
  } catch {
    return value;
  }
};

const getDeviceIcon = (deviceType?: string | null) => {
  const type = (deviceType || "").toUpperCase();
  if (type === "MOBILE") {
    return <Smartphone className="h-4 w-4 text-primary" />;
  }
  if (type === "TABLET") {
    return <Tablet className="h-4 w-4 text-primary" />;
  }
  return <Laptop className="h-4 w-4 text-primary" />;
};

const getStatusBadgeVariant = (
  status: string
): "default" | "success" | "secondary" | "warning" | "danger" => {
  switch (status.toUpperCase()) {
    case "SUCCESS":
      return "success";
    case "LOCKED":
      return "warning";
    case "FAILED":
    default:
      return "danger";
  }
};

export function UserHistoryTable({
  userId,
  pageSize = 10,
}: UserHistoryTableProps) {
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useUserLoginHistory(userId, {
    page,
    size: pageSize,
  });

  const historyPage = data as unknown as Page<LoginHistory> | undefined;
  const history = historyPage?.content ?? [];
  const totalPages = historyPage?.totalPages ?? 0;

  const handlePrev = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (totalPages === 0 || page >= totalPages - 1) return;
    setPage((prev) => prev + 1);
  };

  if (!userId) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Chưa chọn người dùng.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Thời gian</TableHead>
              <TableHead className="w-[260px]">Thiết bị</TableHead>
              <TableHead className="w-[160px]">IP Address</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Đang tải lịch sử đăng nhập...
                  </div>
                </TableCell>
              </TableRow>
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Chưa có dữ liệu lịch sử
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              history.map((item: LoginHistory) => {
                const isLocalhost = item.ipAddress
                  ? LOCALHOST_IPS.has(item.ipAddress)
                  : false;
                const ipLabel = isLocalhost
                  ? "Localhost"
                  : item.ipAddress || "—";
                const deviceLabel = [
                  item.browser,
                  item.os ? `trên ${item.os}` : undefined,
                ]
                  .filter(Boolean)
                  .join(" ");
                const badge = (
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {item.status === "SUCCESS"
                      ? "Thành công"
                      : item.status === "LOCKED"
                      ? "Bị khóa"
                      : "Không thành công"}
                  </Badge>
                );

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-foreground">
                      {formatDateTime(item.loginTime)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          {getDeviceIcon(item.deviceType)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {deviceLabel || "Không rõ thiết bị"}
                          </p>
                          <p className="text-xs uppercase text-muted-foreground">
                            {item.deviceType || "UNKNOWN"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ipLabel}
                    </TableCell>
                    <TableCell>
                      {item.status === "FAILED" && item.failureReason ? (
                        <Tooltip content={item.failureReason}>
                          <span>{badge}</span>
                        </Tooltip>
                      ) : (
                        badge
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Trang {totalPages === 0 ? 0 : page + 1}/{totalPages || 1}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={isFetching || page === 0}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Trước
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={isFetching || page >= (totalPages || 1) - 1}
          >
            Sau
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
