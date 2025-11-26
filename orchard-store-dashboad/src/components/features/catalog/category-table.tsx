"use client";

import {
  Pencil,
  Trash2,
  ImageIcon,
  CornerDownRight,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/types/catalog.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategoryTableProps {
  categories: Category[];
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  isLoading?: boolean;
}

/**
 * Sort categories so children appear right after their parent
 * Uses path field if available, otherwise falls back to level + parentId
 */
const sortCategoriesByHierarchy = (categories: Category[]): Category[] => {
  return [...categories].sort((a, b) => {
    // If both have path, sort by path (e.g., "1" < "1/5" < "1/5/10")
    if (a.path && b.path) {
      return a.path.localeCompare(b.path, undefined, { numeric: true });
    }

    // If only one has path, prioritize it
    if (a.path && !b.path) return -1;
    if (!a.path && b.path) return 1;

    // Fallback: sort by level, then by parentId, then by displayOrder, then by name
    const levelCompare = (a.level ?? 0) - (b.level ?? 0);
    if (levelCompare !== 0) return levelCompare;

    const parentCompare = (a.parentId ?? 0) - (b.parentId ?? 0);
    if (parentCompare !== 0) return parentCompare;

    const orderCompare = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    if (orderCompare !== 0) return orderCompare;

    return a.name.localeCompare(b.name);
  });
};

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  isLoading,
}: CategoryTableProps) {
  // Sort categories so children appear right after their parent
  const sortedCategories = sortCategoriesByHierarchy(categories);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-slate-500"
              >
                Đang tải dữ liệu...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  if (sortedCategories.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-slate-500"
              >
                Không có danh mục nào
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
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCategories.map((category) => {
            const level = category.level ?? 0;
            const isChild = level > 0;
            // Calculate padding: 16px per level (pl-4 = 16px)
            const paddingLeft = level * 16;

            return (
              <TableRow key={category.id} className="hover:bg-slate-50/50">
                {/* Name with indentation */}
                <TableCell>
                  <div
                    className="flex items-center gap-2"
                    style={{ paddingLeft: `${paddingLeft}px` }}
                  >
                    {isChild && (
                      <CornerDownRight className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                    <span className="font-semibold text-slate-900">
                      {category.name}
                    </span>
                  </div>
                </TableCell>

                {/* Slug */}
                <TableCell>
                  <span className="font-mono text-sm text-slate-500">
                    {category.slug || "—"}
                  </span>
                </TableCell>

                {/* Image */}
                <TableCell>
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white">
                    {category.imageUrl && category.imageUrl.trim() !== "" ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        className="object-contain p-1"
                        sizes="40px"
                        unoptimized
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (
                            parent &&
                            !parent.querySelector(".image-placeholder")
                          ) {
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
                </TableCell>

                {/* Parent */}
                <TableCell>
                  {category.parentName ? (
                    <Badge
                      variant="secondary"
                      className="border-slate-200 bg-slate-50 text-slate-600"
                    >
                      {category.parentName}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="border border-dashed border-slate-200 bg-transparent text-slate-400"
                    >
                      Root
                    </Badge>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={category.status} />
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 text-slate-500 data-[state=open]:bg-slate-100"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(category)}
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
          })}
        </TableBody>
      </Table>
    </div>
  );
}
