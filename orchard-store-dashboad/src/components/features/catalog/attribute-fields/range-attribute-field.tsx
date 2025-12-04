"use client";

import { Controller } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import type { ProductAttribute } from "@/types/attribute.types";

interface RangeAttributeFieldProps {
  attribute: ProductAttribute;
  form: UseFormReturn<FieldValues>;
  fieldName: string;
}

export function RangeAttributeField({
  attribute,
  form,
  fieldName,
}: RangeAttributeFieldProps) {
  const error = form.formState.errors.attributes?.[attribute.attributeKey] as
    | { message?: string }
    | undefined;

  // Parse validationRules for min/max
  let min: number | undefined;
  let max: number | undefined;
  let step: number | undefined;

  if (attribute.validationRules) {
    try {
      const rules = JSON.parse(attribute.validationRules);
      min = typeof rules.min === "number" ? rules.min : undefined;
      max = typeof rules.max === "number" ? rules.max : undefined;
      step = typeof rules.step === "number" ? rules.step : undefined;
    } catch (e) {
      // Invalid JSON, ignore
    }
  }

  const inputType = attribute.dataType === "DECIMAL" ? "number" : "number";
  const stepValue = step ?? (attribute.dataType === "DECIMAL" ? 0.01 : 1);

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
            <Input
              type={inputType}
              value={field.value ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  field.onChange(undefined);
                } else {
                  const numValue =
                    attribute.dataType === "DECIMAL"
                      ? parseFloat(value)
                      : parseInt(value, 10);
                  if (!isNaN(numValue)) {
                    field.onChange(numValue);
                  }
                }
              }}
              min={min}
              max={max}
              step={stepValue}
              placeholder={`Nhập ${attribute.attributeName}...`}
              className="w-full"
            />
            {attribute.unit && (
              <span className="text-sm text-muted-foreground">
                {attribute.unit}
              </span>
            )}
          </div>
        )}
      />
    </FormField>
  );
}

