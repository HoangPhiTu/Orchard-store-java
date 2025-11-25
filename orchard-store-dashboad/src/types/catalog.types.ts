import { z } from "zod";

export type CatalogStatus = "ACTIVE" | "INACTIVE";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  country?: string | null;
  websiteUrl?: string | null; // Backend trả về websiteUrl
  displayOrder?: number | null;
  status: CatalogStatus;
  createdAt?: string | null; // ISO date string
  updatedAt?: string | null; // ISO date string
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: number | null;
  parentName?: string | null;
  status: CatalogStatus;
  displayOrder?: number | null;
  children?: Category[];
}

export interface BrandQueryParams {
  page?: number;
  size?: number;
  search?: string;
  status?: CatalogStatus;
}

export interface BrandFilter {
  keyword?: string;
  status?: CatalogStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}

export interface CategoryQueryParams {
  page?: number;
  size?: number;
  search?: string;
  status?: CatalogStatus;
  parentId?: number;
}

const slugSchema = z
  .string()
  .min(1, "Vui lòng nhập slug")
  .min(2, "Slug phải có ít nhất 2 ký tự")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
  });

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    schema.optional()
  );

export const brandFormSchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên thương hiệu")
    .min(2, "Tên thương hiệu phải có ít nhất 2 ký tự")
    .max(255, "Tên thương hiệu không được vượt quá 255 ký tự"),
  slug: emptyToUndefined(slugSchema), // Slug là optional - backend sẽ tự tạo nếu không có
  description: emptyToUndefined(
    z.string().max(5000, "Mô tả không được vượt quá 5000 ký tự")
  ),
  logoUrl: emptyToUndefined(
    z.string().max(500, "URL logo không được vượt quá 500 ký tự")
  ),
  country: emptyToUndefined(
    z.string().max(100, "Tên quốc gia không được vượt quá 100 ký tự")
  ),
  website: emptyToUndefined(
    z.string().max(500, "URL website không được vượt quá 500 ký tự")
  ), // Backend nhận "website", trả về "websiteUrl"
  displayOrder: emptyToUndefined(
    z.preprocess(
      (value) => (value === undefined ? undefined : Number(value)),
      z
        .number({
          invalid_type_error: "Vui lòng nhập số hợp lệ",
        })
        .int("Thứ tự hiển thị phải là số nguyên")
        .min(0, "Thứ tự hiển thị phải lớn hơn hoặc bằng 0")
    )
  ),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type BrandFormData = z.infer<typeof brandFormSchema>;

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên danh mục")
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(255, "Tên danh mục không được vượt quá 255 ký tự"),
  slug: slugSchema,
  description: emptyToUndefined(
    z.string().max(5000, "Mô tả không được vượt quá 5000 ký tự")
  ),
  imageUrl: emptyToUndefined(z.string().url("URL hình ảnh không hợp lệ")),
  parentId: emptyToUndefined(
    z.preprocess(
      (value) => (value === undefined ? undefined : Number(value)),
      z
        .number({
          invalid_type_error: "Vui lòng nhập số hợp lệ",
        })
        .int("ID danh mục cha phải là số nguyên")
        .positive("ID danh mục cha phải lớn hơn 0")
    )
  ),
  displayOrder: emptyToUndefined(
    z.preprocess(
      (value) => (value === undefined ? undefined : Number(value)),
      z
        .number({
          invalid_type_error: "Vui lòng nhập số hợp lệ",
        })
        .int("Thứ tự hiển thị phải là số nguyên")
        .min(0, "Thứ tự hiển thị phải lớn hơn hoặc bằng 0")
    )
  ),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
