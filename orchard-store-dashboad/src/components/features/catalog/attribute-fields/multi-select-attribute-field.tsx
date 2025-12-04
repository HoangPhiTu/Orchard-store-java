"use client";

import { Controller } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import type { ProductAttribute } from "@/types/attribute.types";

interface MultiSelectAttributeFieldProps {
  attribute: ProductAttribute;
  form: UseFormReturn<FieldValues>;
  fieldName: string;
}

export function MultiSelectAttributeField({
  attribute,
  form,
  fieldName,
}: MultiSelectAttributeFieldProps) {
  const [open, setOpen] = useState(false);
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
        render={({ field }) => {
          const selectedValues = Array.isArray(field.value)
            ? field.value
            : field.value
              ? [field.value]
              : [];

          const toggleValue = (value: string) => {
            const newValues = selectedValues.includes(value)
              ? selectedValues.filter((v) => v !== value)
              : [...selectedValues, value];
            field.onChange(newValues);
          };

          const removeValue = (value: string) => {
            field.onChange(selectedValues.filter((v) => v !== value));
          };

          return (
            <div className="space-y-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      !selectedValues.length && "text-muted-foreground"
                    )}
                  >
                    {selectedValues.length > 0
                      ? `${selectedValues.length} mục đã chọn`
                      : `Chọn ${attribute.attributeName}...`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-60 overflow-auto">
                    {attribute.values?.map((val) => {
                      const isSelected = selectedValues.includes(val.value);
                      return (
                        <div
                          key={val.id ?? val.value}
                          className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-accent"
                          onClick={() => toggleValue(val.value)}
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded border",
                              isSelected && "bg-primary"
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
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
                          <span className="flex-1">{val.displayValue}</span>
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedValues.map((value) => {
                    const val = attribute.values?.find((v) => v.value === value);
                    return (
                      <Badge
                        key={value}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {val?.displayValue ?? value}
                        <button
                          type="button"
                          onClick={() => removeValue(value)}
                          className="ml-1 rounded-full hover:bg-destructive/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }}
      />
    </FormField>
  );
}

