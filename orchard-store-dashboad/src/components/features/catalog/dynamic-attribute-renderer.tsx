"use client";

import { SelectAttributeField } from "./attribute-fields/select-attribute-field";
import { MultiSelectAttributeField } from "./attribute-fields/multi-select-attribute-field";
import { RangeAttributeField } from "./attribute-fields/range-attribute-field";
import { BooleanAttributeField } from "./attribute-fields/boolean-attribute-field";
import { TextAttributeField } from "./attribute-fields/text-attribute-field";
import type { UseFormReturn } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import type { ProductAttribute } from "@/types/attribute.types";

interface DynamicAttributeRendererProps {
  attribute: ProductAttribute;
  form: UseFormReturn<FieldValues>;
}

export function DynamicAttributeRenderer({
  attribute,
  form,
}: DynamicAttributeRendererProps) {
  const fieldName = `attributes.${attribute.attributeKey}`;

  switch (attribute.attributeType) {
    case "SELECT":
      return (
        <SelectAttributeField
          attribute={attribute}
          form={form}
          fieldName={fieldName}
        />
      );
    case "MULTISELECT":
      return (
        <MultiSelectAttributeField
          attribute={attribute}
          form={form}
          fieldName={fieldName}
        />
      );
    case "RANGE":
      return (
        <RangeAttributeField
          attribute={attribute}
          form={form}
          fieldName={fieldName}
        />
      );
    case "BOOLEAN":
      return (
        <BooleanAttributeField
          attribute={attribute}
          form={form}
          fieldName={fieldName}
        />
      );
    case "TEXT":
      return (
        <TextAttributeField
          attribute={attribute}
          form={form}
          fieldName={fieldName}
        />
      );
    default:
      console.warn(`Unknown attribute type: ${attribute.attributeType}`);
      return null;
  }
}

