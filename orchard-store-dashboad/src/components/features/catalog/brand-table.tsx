"use client";

import { Pencil, Trash2, ImageIcon } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Brand } from "@/types/catalog.types";

interface BrandTableProps {
  brands: Brand[];
  onEdit?: (brand: Brand) => void;
  onDelete?: (brand: Brand) => void;
  isLoading?: boolean;
}

/**
 * Get badge variant for status
 */
const getStatusBadgeVariant = (
  status: string
): "default" | "secondary" | "success" | "warning" | "danger" => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "success"; // Green/Indigo
    case "INACTIVE":
      return "secondary"; // Gray
    default:
      return "secondary";
  }
};

export function BrandTable({
  brands,
  onEdit,
  onDelete,
  isLoading,
}: BrandTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Brand Info</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                Đang tải dữ liệu...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Brand Info</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                Không có thương hiệu nào
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-[300px]">Brand Info</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand.id} className="hover:bg-slate-50/50">
              {/* Brand Info: Logo + Name */}
              <TableCell>
                <div className="flex items-center gap-3">
                  {/* Logo */}
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white">
                    {brand.logoUrl && brand.logoUrl.trim() !== "" ? (
                      <Image
                        src={brand.logoUrl}
                        alt={brand.name}
                        fill
                        className="object-contain p-1"
                        sizes="40px"
                        unoptimized
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector(".image-placeholder")) {
                            const placeholder = document.createElement("div");
                            placeholder.className =
                              "image-placeholder flex h-full w-full items-center justify-center bg-slate-100";
                            placeholder.innerHTML = `<svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-50">
                        <ImageIcon className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                  </div>
                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">
                      {brand.name}
                    </p>
                  </div>
                </div>
              </TableCell>

              {/* Slug */}
              <TableCell>
                <span className="text-sm text-slate-500 font-mono">
                  {brand.slug}
                </span>
              </TableCell>

              {/* Country */}
              <TableCell>
                <span className="text-sm text-slate-700">
                  {brand.country || "-"}
                </span>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge variant={getStatusBadgeVariant(brand.status)}>
                  {brand.status === "ACTIVE" ? "Active" : "Inactive"}
                </Badge>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                      onClick={() => onEdit(brand)}
                      title="Chỉnh sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
                      onClick={() => onDelete(brand)}
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

