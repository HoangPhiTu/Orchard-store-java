"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";
import type { ProductAttribute } from "@/types/attribute.types";

export interface VariantSelectionDictionary {
  [attributeKey: string]: string[];
}

interface VariantAttributeSelectorProps {
  categoryId: number | null;
  attributes?: ProductAttribute[];
  value: VariantSelectionDictionary;
  onChange: (next: VariantSelectionDictionary) => void;
  isLoading?: boolean;
  error?: Error | null;
}

const ATTRIBUTE_MESSAGES = {
  empty:
    "Danh mục này chưa có thuộc tính biến thể nào. Vui lòng cấu hình 'variantSpecific' trong quản lý thuộc tính.",
  selectCategory:
    "Vui lòng chọn danh mục và lưu lại trước khi cấu hình biến thể.",
};

export function VariantAttributeSelector({
  categoryId,
  attributes,
  value,
  onChange,
  isLoading,
  error,
}: VariantAttributeSelectorProps) {
  const hasCategory = Boolean(categoryId);
  const attributesWithValues = useMemo(
    () =>
      (attributes ?? []).filter(
        (attr) => attr.values && attr.values.length > 0
      ),
    [attributes]
  );

  const handleToggleValue = (attributeKey: string, optionValue: string) => {
    const currentValues = value[attributeKey] ?? [];
    const isSelected = currentValues.includes(optionValue);
    const nextValues = isSelected
      ? currentValues.filter((val) => val !== optionValue)
      : [...currentValues, optionValue];

    const nextState = { ...value };
    if (nextValues.length === 0) {
      delete nextState[attributeKey];
    } else {
      nextState[attributeKey] = nextValues;
    }

    onChange(nextState);
  };

  const handleClearAttribute = (attributeKey: string) => {
    if (!value[attributeKey]) return;
    const nextState = { ...value };
    delete nextState[attributeKey];
    onChange(nextState);
  };

  if (!hasCategory) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-sm text-muted-foreground">
        {ATTRIBUTE_MESSAGES.selectCategory}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-muted/10 p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
        Không thể tải thuộc tính biến thể: {error.message}
      </div>
    );
  }

  if (!attributesWithValues.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-sm text-muted-foreground">
        {ATTRIBUTE_MESSAGES.empty}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">
          Chọn thuộc tính để sinh biến thể
        </p>
        <p className="text-xs text-muted-foreground">
          Những thuộc tính dưới đây đã được đánh dấu &quot;variantSpecific&quot;
          trong danh mục. Chọn các giá trị hợp lệ để hệ thống sinh SKU tương
          ứng.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {attributesWithValues.map((attribute) => {
          const selectedValues = value[attribute.attributeKey] ?? [];
          const popoverLabel =
            selectedValues.length > 0
              ? `${selectedValues.length} giá trị đã chọn`
              : `Chọn ${attribute.attributeName}…`;

          return (
            <FormField
              key={attribute.attributeKey}
              label={attribute.attributeName}
              htmlFor={`variant-${attribute.attributeKey}`}
              description={
                attribute.helpText ??
                "Có thể chọn nhiều giá trị để tạo các tổ hợp cần bán."
              }
              className="space-y-2"
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left text-sm",
                      selectedValues.length === 0 && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate">{popoverLabel}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-60 overflow-auto">
                    {attribute.values?.map((option) => {
                      const isSelected = selectedValues.includes(option.value);
                      return (
                        <button
                          type="button"
                          key={option.id ?? option.value}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                          onClick={() =>
                            handleToggleValue(
                              attribute.attributeKey,
                              option.value
                            )
                          }
                        >
                          <span
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded border",
                              isSelected && "bg-primary text-primary-foreground"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </span>
                          {option.hexColor && (
                            <span
                              className="h-4 w-4 rounded border"
                              style={{ backgroundColor: option.hexColor }}
                            />
                          )}
                          {option.imageUrl && (
                            <Image
                              src={option.imageUrl}
                              alt={option.displayValue}
                              width={16}
                              height={16}
                              className="h-4 w-4 rounded object-cover"
                            />
                          )}
                          <span className="flex-1 truncate">
                            {option.displayValue}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedValues.map((selected) => {
                    const option = attribute.values?.find(
                      (opt) => opt.value === selected
                    );
                    return (
                      <Badge
                        key={selected}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {option?.displayValue ?? selected}
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleValue(attribute.attributeKey, selected)
                          }
                          className="rounded-full hover:bg-destructive/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {selectedValues.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleClearAttribute(attribute.attributeKey)}
                >
                  Xóa lựa chọn
                </Button>
              )}
            </FormField>
          );
        })}
      </div>
    </div>
  );
}
