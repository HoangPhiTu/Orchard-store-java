import { z } from "zod";

export type AttributeStatus = "ACTIVE" | "INACTIVE";
export type AttributeDomain = "PERFUME" | "COSMETICS" | "COMMON";

export type AttributeType =
  | "SELECT"
  | "MULTISELECT"
  | "RANGE"
  | "BOOLEAN"
  | "TEXT";
export type AttributeDataType =
  | "STRING"
  | "NUMBER"
  | "DECIMAL"
  | "DATE"
  | "BOOLEAN";

export interface AttributeValue {
  id?: number | null;
  attributeId?: number | null;
  value: string;
  displayValue: string;
  displayValueEn?: string | null;
  colorCode?: string | null;
  imageUrl?: string | null;
  hexColor?: string | null;
  description?: string | null;
  displayOrder?: number | null;
  isDefault?: boolean | null;
  searchKeywords?: string | null;
}

export interface ProductAttribute {
  id: number;
  attributeKey: string;
  attributeName: string;
  attributeNameEn?: string | null;
  attributeType: AttributeType;
  dataType: AttributeDataType;
  domain?: AttributeDomain | null;
  filterable?: boolean | null;
  searchable?: boolean | null;
  required?: boolean | null;
  variantSpecific?: boolean | null;
  displayOrder?: number | null;
  iconClass?: string | null;
  colorCode?: string | null;
  validationRules?: string | null;
  description?: string | null;
  helpText?: string | null;
  unit?: string | null;
  status: AttributeStatus;
  values?: AttributeValue[] | null;
  createdAt?: string | null; // ISO date string
  updatedAt?: string | null; // ISO date string
}

export interface AttributeFilter {
  keyword?: string;
  status?: AttributeStatus;
  domain?: AttributeDomain | "ALL";
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    schema.optional()
  );

const attributeValueSchema = z.object({
  id: z.number().optional().nullable(),
  value: z.string().min(1, "Giá trị không được để trống"),
  displayValue: z.string().min(1, "Tên hiển thị không được để trống"),
  displayValueEn: emptyToUndefined(z.string()),
  colorCode: emptyToUndefined(z.string().max(7)),
  imageUrl: emptyToUndefined(z.string().url("URL ảnh không hợp lệ").max(500)),
  hexColor: emptyToUndefined(
    z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Màu HEX không hợp lệ")
  ),
  description: emptyToUndefined(z.string().max(1000)),
  displayOrder: emptyToUndefined(
    z.preprocess(
      (value) => (value === undefined ? undefined : Number(value)),
      z.number().int().min(0)
    )
  ),
  isDefault: z.boolean().optional().nullable(),
  searchKeywords: emptyToUndefined(z.string()),
});

export const attributeFormSchema = z.object({
  attributeKey: z
    .string()
    .min(1, "Vui lòng nhập mã thuộc tính")
    .min(2, "Mã thuộc tính phải có ít nhất 2 ký tự")
    .max(100, "Mã thuộc tính không được vượt quá 100 ký tự")
    .regex(/^[a-z0-9_-]+$/, {
      message:
        "Mã thuộc tính chỉ được chứa chữ thường, số, dấu gạch dưới và dấu gạch ngang",
    }),
  attributeName: z
    .string()
    .min(1, "Vui lòng nhập tên thuộc tính")
    .min(2, "Tên thuộc tính phải có ít nhất 2 ký tự")
    .max(255, "Tên thuộc tính không được vượt quá 255 ký tự"),
  attributeNameEn: emptyToUndefined(z.string().max(255)),
  attributeType: z.enum(["SELECT", "MULTISELECT", "RANGE", "BOOLEAN", "TEXT"]),
  dataType: z
    .enum(["STRING", "NUMBER", "DECIMAL", "DATE", "BOOLEAN"])
    .optional(),
  filterable: z.boolean().optional().nullable(),
  searchable: z.boolean().optional().nullable(),
  required: z.boolean().optional().nullable(),
  variantSpecific: z.boolean().optional().nullable(),
  displayOrder: emptyToUndefined(
    z.preprocess(
      (value) => (value === undefined ? undefined : Number(value)),
      z.number().int().min(0)
    )
  ),
  iconClass: emptyToUndefined(z.string().max(100)),
  colorCode: emptyToUndefined(z.string().max(7)),
  validationRules: emptyToUndefined(z.string()),
  description: emptyToUndefined(z.string().max(5000)),
  helpText: emptyToUndefined(z.string().max(5000)),
  unit: emptyToUndefined(z.string().max(50)),
  domain: emptyToUndefined(
    z.enum(["PERFUME", "COSMETICS", "COMMON"]).default("COMMON")
  ),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  values: z.array(attributeValueSchema).optional().nullable(),
});

export type AttributeFormData = z.infer<typeof attributeFormSchema>;
