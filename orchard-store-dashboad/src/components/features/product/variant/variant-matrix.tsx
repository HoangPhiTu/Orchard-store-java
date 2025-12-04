"use client";

import { useMemo } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/features/product/image-upload";
import { generateVariantCombinations, generateSku } from "@/lib/utils/variant-generator";

export interface SelectedAttribute {
  key: string;
  label: string;
  values: string[];
  type?: "DEFAULT" | "COLOR" | "OTHER";
}

export interface VariantMatrixFormValues {
  variants: {
    isEnabled: boolean;
    sku: string;
    price: number;
    stock: number;
    imageUrl?: string;
    attributes: Record<string, string>;
  }[];
}

interface VariantMatrixProps {
  form: UseFormReturn<VariantMatrixFormValues>;
  selectedAttributes: SelectedAttribute[];
  productSlug: string;
  defaultPrice: number;
}

export function VariantMatrix({
  form,
  selectedAttributes,
  productSlug,
  defaultPrice,
}: VariantMatrixProps) {
  const {
    fields: variantFields,
    replace,
    update,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const hasColorAttribute = useMemo(
    () => selectedAttributes.some((a) => a.key === "mau_sac" || a.type === "COLOR"),
    [selectedAttributes]
  );

  const handleGenerate = () => {
    const attrMap: Record<string, string[]> = {};
    selectedAttributes.forEach((attr) => {
      if (attr.values && attr.values.length > 0) {
        attrMap[attr.key] = attr.values;
      }
    });

    const combos = generateVariantCombinations(attrMap);
    if (combos.length === 0) {
      alert("Vui lòng chọn ít nhất 1 giá trị thuộc tính trước khi sinh biến thể.");
      return;
    }

    const nextVariants = combos.map((combo) => {
      const attrTokens = Object.keys(combo)
        .sort()
        .map((k) => combo[k]);

      return {
        isEnabled: true,
        sku: generateSku(productSlug, attrTokens),
        price: defaultPrice,
        stock: 0,
        imageUrl: "",
        attributes: combo,
      };
    });

    replace(nextVariants);
  };

  const applyPriceToAll = () => {
    const value = Number(
      prompt("Nhập giá áp dụng cho tất cả biến thể (đơn vị: VND)", String(defaultPrice))
    );
    if (Number.isNaN(value) || value <= 0) return;

    variantFields.forEach((field, index) => {
      update(index, {
        ...(field as any),
        price: value,
      });
    });
  };

  const applyStockToAll = () => {
    const value = Number(
      prompt("Nhập tồn kho áp dụng cho tất cả biến thể", "0")
    );
    if (Number.isNaN(value) || value < 0) return;

    variantFields.forEach((field, index) => {
      update(index, {
        ...(field as any),
        stock: value,
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Ma trận biến thể</p>
          <p className="text-xs text-muted-foreground">
            Chọn thuộc tính (VD: Dung tích, Loại hàng, Màu sắc) rồi bấm &quot;Sinh danh sách biến thể&quot;.
          </p>
        </div>
        <Button type="button" size="sm" onClick={handleGenerate}>
          Sinh danh sách biến thể
        </Button>
      </div>

      {variantFields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center text-sm text-muted-foreground">
          Chưa có biến thể nào. Vui lòng chọn giá trị thuộc tính và bấm &quot;Sinh danh sách biến thể&quot;.
        </div>
      ) : (
        <div className="space-y-2 overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Bật</TableHead>
                <TableHead className="min-w-[180px]">Tên biến thể</TableHead>
                <TableHead className="min-w-[200px]">SKU</TableHead>
                <TableHead className="min-w-[120px]">
                  <div className="flex items-center justify-between gap-2">
                    <span>Giá bán</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={applyPriceToAll}
                    >
                      Áp dụng tất cả
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <div className="flex items-center justify-between gap-2">
                    <span>Tồn kho</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={applyStockToAll}
                    >
                      Áp dụng tất cả
                    </Button>
                  </div>
                </TableHead>
                {hasColorAttribute && (
                  <TableHead className="min-w-[140px]">Hình ảnh</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {variantFields.map((field, index) => {
                const combo = field.attributes as Record<string, string>;

                const variantName =
                  combo && Object.keys(combo).length > 0
                    ? Object.entries(combo)
                        .map(([key, value]) => value || key)
                        .join(" - ")
                    : `Biến thể #${index + 1}`;

                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Checkbox
                        checked={form.watch(`variants.${index}.isEnabled` as const)}
                        onCheckedChange={(checked) =>
                          form.setValue(
                            `variants.${index}.isEnabled` as const,
                            Boolean(checked)
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {variantName}
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 text-xs"
                        {...form.register(`variants.${index}.sku` as const)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8 text-xs"
                        {...form.register(`variants.${index}.price` as const, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        {...form.register(`variants.${index}.stock` as const, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    {hasColorAttribute && (
                      <TableCell>
                        <ImageUpload
                          value={form.watch(`variants.${index}.imageUrl` as const) || ""}
                          onChange={(val) =>
                            form.setValue(
                              `variants.${index}.imageUrl` as const,
                              val
                            )
                          }
                          className="w-[120px]"
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}


