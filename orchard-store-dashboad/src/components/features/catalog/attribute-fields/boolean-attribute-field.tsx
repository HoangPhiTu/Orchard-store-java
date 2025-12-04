"use client";

import { Controller } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import { Switch } from "@/components/ui/switch";
import type { UseFormReturn } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import type { ProductAttribute } from "@/types/attribute.types";

interface BooleanAttributeFieldProps {
  attribute: ProductAttribute;
  form: UseFormReturn<FieldValues>;
  fieldName: string;
}

export function BooleanAttributeField({
  attribute,
  form,
  fieldName,
}: BooleanAttributeFieldProps) {
  const error = form.formState.errors.attributes?.[attribute.attributeKey] as
    | { message?: string }
    | undefined;

  return (
    <FormField
      label={attribute.attributeName}
      htmlFor={fieldName}
      required={attribute.required ?? false}
      error={error}
      description={attribute.helpText ?? undefined}
    >
      <Controller
        name={fieldName}
        control={form.control}
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
            />
            <span className="text-sm text-muted-foreground">
              {field.value ? "Có" : "Không"}
            </span>
          </div>
        )}
      />
    </FormField>
  );
}

