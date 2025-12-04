"use client";

import { useDynamicAttributes } from "@/hooks/use-dynamic-attributes";
import { AttributeGroup } from "./attribute-group";
import { Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { FieldValues } from "react-hook-form";

interface DynamicAttributesSectionProps {
  categoryId: number | null;
  form: UseFormReturn<FieldValues>;
}

export function DynamicAttributesSection({
  categoryId,
  form,
}: DynamicAttributesSectionProps) {
  const { attributeGroups, isLoading, hasAttributes, error } =
    useDynamicAttributes(categoryId);

  if (!categoryId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Vui lòng chọn danh mục trước
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-sm text-destructive">
          Có lỗi xảy ra khi tải thuộc tính: {error.message}
        </p>
      </div>
    );
  }

  if (!hasAttributes) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Danh mục này chưa có thuộc tính nào. Vui lòng cấu hình thuộc tính
          trong quản lý danh mục.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {attributeGroups.map((group) => (
        <AttributeGroup
          key={group.groupName}
          groupName={group.groupName}
          attributes={group.attributes}
          form={form}
        />
      ))}
    </div>
  );
}

