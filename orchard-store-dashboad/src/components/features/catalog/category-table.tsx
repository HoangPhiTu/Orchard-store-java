"use client";

import { useMemo, useState, useEffect } from "react";
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
import { getImageUrlWithTimestamp } from "@/lib/utils";
import type { Category } from "@/types/catalog.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useI18n } from "@/hooks/use-i18n";

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

/**
 * Category Row Component
 * Tách riêng để có thể sử dụng useEffect và tối ưu re-render
 */
interface CategoryRowProps {
  category: Category;
  rowKey: string;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

function CategoryRow({ category, rowKey, onEdit, onDelete }: CategoryRowProps) {
  const { t } = useI18n();
  const [imageError, setImageError] = useState(false);
  const level = category.level ?? 0;
  const isChild = level > 0;
  const paddingLeft = level * 16;
  const displayName =
    category.name?.trim() || category.slug || "Unknown Category";
  const slug = category.slug || "no-slug";
  const parentName = category.parentName || "Root";
  const imageUrl = category.imageUrl?.trim();
  const shouldShowImage = Boolean(imageUrl) && !imageError;

  // ✅ Reset image error khi imageUrl thay đổi (giống brand-row)
  useEffect(() => {
    if (imageUrl) {
      setImageError(false);
    }
  }, [imageUrl]);

  return (
    <TableRow className="hover:bg-muted/40">
      <TableCell>
        <div
          className="flex items-center gap-2"
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {isChild && (
            <CornerDownRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="font-semibold text-foreground">{displayName}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="font-mono text-sm text-muted-foreground">{slug}</span>
      </TableCell>
      <TableCell>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-card">
          {shouldShowImage ? (
            <Image
              key={`category-image-${category.id}-${imageUrl}-${category.updatedAt || ""}`}
              src={
                getImageUrlWithTimestamp(
                  imageUrl!,
                  category.updatedAt
                    ? new Date(category.updatedAt).getTime()
                    : undefined
                ) || imageUrl!
              }
              alt={displayName}
              fill
              className="object-cover"
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
      </TableCell>
      <TableCell>
        {category.parentName ? (
          <Badge variant="secondary" className="text-muted-foreground">
            {parentName}
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="border border-dashed border-border/60 bg-transparent text-muted-foreground"
          >
            Root
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <StatusBadge status={category.status || "INACTIVE"} />
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
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  isLoading,
}: CategoryTableProps) {
  const { t } = useI18n();
  const sortedCategories = useMemo(
    () => sortCategoriesByHierarchy(categories ?? []),
    [categories]
  );

  const buildKey = (category: Category, index: number) =>
    String(
      category.id ??
        category.slug ??
        category.name ??
        category.path ??
        `category-${index}`
    );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  {t("admin.categories.categoryName")}
                </TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>{t("admin.categories.parentCategory")}</TableHead>
                <TableHead>{t("admin.users.status")}</TableHead>
                <TableHead className="text-right">
                  {t("admin.users.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  {t("admin.categories.loadingCategories")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      );
    }

    if (sortedCategories.length === 0) {
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  {t("admin.categories.categoryName")}
                </TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>{t("admin.categories.parentCategory")}</TableHead>
                <TableHead>{t("admin.users.status")}</TableHead>
                <TableHead className="text-right">
                  {t("admin.users.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  {t("admin.categories.noCategoriesFound")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[300px]">
                {t("admin.categories.categoryName")}
              </TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>{t("admin.categories.parentCategory")}</TableHead>
              <TableHead>{t("admin.users.status")}</TableHead>
              <TableHead className="text-right">
                {t("admin.users.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCategories.map((category, index) => {
              const rowKey = buildKey(category, index);
              return (
                <CategoryRow
                  key={rowKey}
                  category={category}
                  rowKey={rowKey}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Không thể tải danh sách danh mục. Vui lòng thử lại.
        </div>
      }
    >
      {renderContent()}
    </ErrorBoundary>
  );
}
