"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductAttribute } from "@/types/attribute.types";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AttributeRow } from "@/components/features/catalog/attribute-row";
import { useI18n } from "@/hooks/use-i18n";

interface AttributeTableProps {
  attributes: ProductAttribute[];
  onEdit?: (attribute: ProductAttribute) => void;
  onDelete?: (attribute: ProductAttribute) => void;
  isLoading?: boolean;
}

export function AttributeTable({
  attributes,
  onEdit,
  onDelete,
  isLoading,
}: AttributeTableProps) {
  const { t } = useI18n();
  const safeAttributes = useMemo(() => attributes ?? [], [attributes]);

  const buildKey = (attribute: ProductAttribute, index: number) =>
    String(
      attribute.id ?? attribute.attributeKey ?? `attribute-${index}`
    );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  {t("admin.attributes.attributeName")}
                </TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số giá trị</TableHead>
                <TableHead>{t("admin.users.status")}</TableHead>
                <TableHead className="text-right">
                  {t("admin.users.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  {t("admin.attributes.loadingAttributes")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      );
    }

    if (safeAttributes.length === 0) {
      return (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  {t("admin.attributes.attributeName")}
                </TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số giá trị</TableHead>
                <TableHead>{t("admin.users.status")}</TableHead>
                <TableHead className="text-right">
                  {t("admin.users.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  {t("admin.attributes.noAttributes")}
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
            <TableRow>
              <TableHead className="w-[300px]">
                {t("admin.attributes.attributeName")}
              </TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Số giá trị</TableHead>
              <TableHead>{t("admin.users.status")}</TableHead>
              <TableHead className="text-right">
                {t("admin.users.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeAttributes.map((attribute, index) => (
              <ErrorBoundary
                key={buildKey(attribute, index)}
                fallback={
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-red-500">
                      Error rendering attribute
                    </TableCell>
                  </TableRow>
                }
              >
                <AttributeRow
                  attribute={attribute}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </ErrorBoundary>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return <ErrorBoundary fallback={<div>Error loading attributes table</div>}>{renderContent()}</ErrorBoundary>;
}

