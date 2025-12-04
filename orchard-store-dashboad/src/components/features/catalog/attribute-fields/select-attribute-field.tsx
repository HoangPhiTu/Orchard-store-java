"use client";

import { Controller } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import type { ProductAttribute } from "@/types/attribute.types";

interface SelectAttributeFieldProps {
  attribute: ProductAttribute;
  form: UseFormReturn<FieldValues>;
  fieldName: string;
}

export function SelectAttributeField({
  attribute,
  form,
  fieldName,
}: SelectAttributeFieldProps) {
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
          <Select
            value={field.value?.toString() ?? ""}
            onValueChange={(value) => field.onChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Chọn ${attribute.attributeName}...`} />
            </SelectTrigger>
            <SelectContent>
              {attribute.values?.map((val) => (
                <SelectItem key={val.id ?? val.value} value={val.value}>
                  <div className="flex items-center gap-2">
                    {val.hexColor && (
                      <div
                        className="h-4 w-4 rounded border"
                        style={{ backgroundColor: val.hexColor }}
                      />
                    )}
                    {val.imageUrl && (
                      <img
                        src={val.imageUrl}
                        alt={val.displayValue}
                        className="h-4 w-4 rounded object-cover"
                      />
                    )}
                    <span>
                      {val.displayValue}
                      {attribute.unit && ` (${attribute.unit})`}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}

