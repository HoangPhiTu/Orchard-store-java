"use client";

import { Controller } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import type { ProductAttribute } from "@/types/attribute.types";

interface TextAttributeFieldProps {
  attribute: ProductAttribute;
  form: UseFormReturn<FieldValues>;
  fieldName: string;
}

export function TextAttributeField({
  attribute,
  form,
  fieldName,
}: TextAttributeFieldProps) {
  const error = form.formState.errors.attributes?.[attribute.attributeKey] as
    | { message?: string }
    | undefined;

  // Parse validationRules for minLength/maxLength
  let minLength: number | undefined;
  let maxLength: number | undefined;

  if (attribute.validationRules) {
    try {
      const rules = JSON.parse(attribute.validationRules);
      minLength =
        typeof rules.minLength === "number" ? rules.minLength : undefined;
      maxLength =
        typeof rules.maxLength === "number" ? rules.maxLength : undefined;
    } catch (e) {
      // Invalid JSON, ignore
    }
  }

  // Determine if should use textarea (for longer text)
  const useTextarea = maxLength && maxLength > 100;

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
        render={({ field }) =>
          useTextarea ? (
            <textarea
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={`Nhập ${attribute.attributeName}...`}
              minLength={minLength}
              maxLength={maxLength}
              className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 focus:text-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:border-border"
            />
          ) : (
            <Input
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={`Nhập ${attribute.attributeName}...`}
              minLength={minLength}
              maxLength={maxLength}
            />
          )
        }
      />
    </FormField>
  );
}

