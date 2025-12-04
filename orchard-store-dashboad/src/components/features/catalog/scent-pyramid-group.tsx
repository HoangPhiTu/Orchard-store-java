"use client";

import { DynamicAttributeRenderer } from "./dynamic-attribute-renderer";
import type { UseFormReturn } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import type { ProductAttribute } from "@/types/attribute.types";

interface ScentPyramidGroupProps {
  groupName: string;
  attributes: ProductAttribute[];
  form: UseFormReturn<FieldValues>;
}

const SCENT_SECTIONS = [
  {
    label: "Hương đầu",
    description: "Ấn tượng đầu tiên, thường nhẹ và bay nhanh.",
    keys: ["huong_dau", "top_notes"],
  },
  {
    label: "Hương giữa",
    description: "Trái tim của mùi hương, lưu lại lâu hơn.",
    keys: ["huong_giua", "middle_notes", "heart_notes"],
  },
  {
    label: "Hương cuối",
    description: "Lớp hương bền nhất, tạo dấu ấn khó quên.",
    keys: ["huong_cuoi", "base_notes"],
  },
];

export function ScentPyramidGroup({
  groupName,
  attributes,
  form,
}: ScentPyramidGroupProps) {
  const sectionAttributes = SCENT_SECTIONS.map((section) => {
    const attribute = attributes.find((attr) =>
      section.keys.includes(attr.attributeKey)
    );
    return { section, attribute };
  });

  const usedAttributeIds = new Set(
    sectionAttributes
      .map(({ attribute }) => attribute?.id)
      .filter((id): id is number => Boolean(id))
  );

  const remainingAttributes = attributes.filter(
    (attr) => !usedAttributeIds.has(attr.id)
  );

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{groupName}</h3>
        <p className="text-xs text-muted-foreground">
          Mô tả nốt hương theo dạng Kim Tự Tháp. Vui lòng điền lần lượt Hương
          đầu → Hương giữa → Hương cuối để tạo trải nghiệm chuẩn perfume.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {sectionAttributes.map(({ section, attribute }) => (
          <div
            key={section.label}
            className="rounded-lg border border-border/60 bg-background p-3"
          >
            <p className="text-sm font-semibold text-foreground">
              {section.label}
            </p>
            <p className="text-xs text-muted-foreground">{section.description}</p>

            {attribute ? (
              <div className="mt-3">
                <DynamicAttributeRenderer attribute={attribute} form={form} />
              </div>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground italic">
                Chưa có thuộc tính nào được gán cho mục này.
              </p>
            )}
          </div>
        ))}
      </div>

      {remainingAttributes.length > 0 && (
        <div className="mt-6 space-y-3 rounded-lg border border-border bg-card/80 p-3">
          {remainingAttributes.map((attr) => (
            <DynamicAttributeRenderer key={attr.id} attribute={attr} form={form} />
          ))}
        </div>
      )}
    </div>
  );
}

