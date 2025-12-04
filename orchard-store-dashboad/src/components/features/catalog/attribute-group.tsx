"use client";

import { DynamicAttributeRenderer } from "./dynamic-attribute-renderer";
import { ScentPyramidGroup } from "./scent-pyramid-group";
import type { UseFormReturn } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import type { ProductAttribute } from "@/types/attribute.types";

interface AttributeGroupProps {
  groupName: string;
  attributes: ProductAttribute[];
  form: UseFormReturn<FieldValues>;
}

const SCENT_GROUP_KEYWORDS = ["tầng hương", "scent pyramid", "pyramid"];

export function AttributeGroup({
  groupName,
  attributes,
  form,
}: AttributeGroupProps) {
  const normalizedGroupName = groupName?.toLowerCase() ?? "";
  const isScentGroup = SCENT_GROUP_KEYWORDS.some((keyword) =>
    normalizedGroupName.includes(keyword)
  );

  if (isScentGroup) {
    return (
      <ScentPyramidGroup groupName={groupName} attributes={attributes} form={form} />
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        {groupName}
      </h3>
      <div className="space-y-4">
        {attributes.map((attr) => (
          <DynamicAttributeRenderer
            key={attr.id}
            attribute={attr}
            form={form}
          />
        ))}
      </div>
    </div>
  );
}

