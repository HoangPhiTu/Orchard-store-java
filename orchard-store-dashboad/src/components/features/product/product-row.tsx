"use client";

import React from "react";
import Image from "next/image";
import { Pencil, Trash2, ImageIcon, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableRow, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { getImageUrlWithTimestamp } from "@/lib/utils";
import type { ProductDTO } from "@/types/product.types";

interface ProductRowProps {
  product: ProductDTO;
  onEdit?: (product: ProductDTO) => void;
  onDelete?: (product: ProductDTO) => void;
}

export const ProductRow = React.memo<ProductRowProps>(
  ({ product, onEdit, onDelete }) => {
    const [imageError, setImageError] = React.useState(false);
    const displayName =
      product.name?.trim() || product.slug || "Unknown Product";
    const displaySlug = product.slug || "no-slug";
    const imageUrl = product.primaryImageUrl?.trim();
    const shouldShowImage = Boolean(imageUrl) && !imageError;

    React.useEffect(() => {
      if (imageUrl) {
        setImageError(false);
      }
    }, [imageUrl]);

    const formatPrice = (price?: number) => {
      if (!price) return "N/A";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    };

    return (
      <TableRow className="hover:bg-muted/40">
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-card">
              {shouldShowImage ? (
                <Image
                  src={
                    getImageUrlWithTimestamp(
                      imageUrl!,
                      product.updatedAt ?? Date.now()
                    ) || imageUrl!
                  }
                  alt={displayName}
                  fill
                  className="object-contain p-1"
                  sizes="40px"
                  unoptimized
                  onLoadingComplete={() => setImageError(false)}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">
                {displayName}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm font-mono text-muted-foreground">
            {displaySlug}
          </span>
        </TableCell>
        <TableCell>
          <span className="text-sm text-foreground">
            {product.brandName || "N/A"}
          </span>
        </TableCell>
        <TableCell>
          <span className="text-sm text-foreground">
            {product.categoryName || "N/A"}
          </span>
        </TableCell>
        <TableCell>
          <span className="text-sm font-medium text-foreground">
            {formatPrice(product.price)}
          </span>
        </TableCell>
        <TableCell>
          <StatusBadge status={product.status || "INACTIVE"} />
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 text-muted-foreground data-[state=open]:bg-muted/40"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(product)}
                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) =>
    prev.product.id === next.product.id &&
    prev.product.name === next.product.name &&
    prev.product.status === next.product.status &&
    prev.product.primaryImageUrl === next.product.primaryImageUrl
);

ProductRow.displayName = "ProductRow";
