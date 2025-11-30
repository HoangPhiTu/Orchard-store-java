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
  level?: number | null;
  path?: string | null;
  status: CatalogStatus;
  displayOrder?: number | null;
  createdAt?: string | null; // ISO date string
  updatedAt?: string | null; // ISO date string
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

export interface CategoryFilter {
  keyword?: string;
  status?: CatalogStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
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

/**
 * Schema cho Image URL (Optional)
 * - URL ảnh của category hoặc File object (trong form)
 * - Tối đa 500 ký tự
 * - Cho phép null, undefined, hoặc empty string
 * - Nếu có giá trị thì phải là URL hợp lệ hoặc File object
 * - File object sẽ được convert sang URL khi submit
 */
const imageUrlSchema = z.preprocess(
  (val) => {
    // Chuyển empty string thành null
    if (typeof val === "string" && val.trim() === "") return null;
    // Nếu là File object, giữ nguyên (sẽ được xử lý trong onSubmit)
    if (val instanceof File) return val;
    return val;
  },
  z
    .union([
      // Cho phép File object (trong form, trước khi upload)
      z.instanceof(File),
      // Hoặc URL string hợp lệ
      z
        .string()
        .url("URL ảnh không hợp lệ")
        .max(500, "URL ảnh không được vượt quá 500 ký tự"),
      z.null(),
    ])
    .optional()
    .nullable()
);

const categoryFormSchemaBase = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên danh mục")
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(255, "Tên danh mục không được vượt quá 255 ký tự"),
  slug: slugSchema,
  description: emptyToUndefined(
    z.string().max(5000, "Mô tả không được vượt quá 5000 ký tự")
  ),
  imageUrl: imageUrlSchema,
  parentId: z
    .preprocess(
      (value) => {
        if (value === "" || value === null || value === undefined) {
          return null;
        }
        return Number(value);
      },
      z
        .number({
          invalid_type_error: "Vui lòng nhập số hợp lệ",
        })
        .int("ID danh mục cha phải là số nguyên")
        .positive("ID danh mục cha phải lớn hơn 0")
        .nullable()
        .optional()
    )
    .optional()
    .nullable(),
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

export const categoryFormSchema = categoryFormSchemaBase;

export const createCategoryFormSchema = (
  options?: { currentCategoryId?: number | null }
) =>
  categoryFormSchemaBase.superRefine((data, ctx) => {
    if (
      options?.currentCategoryId &&
      data.parentId !== null &&
      data.parentId !== undefined &&
      data.parentId === options.currentCategoryId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["parentId"],
        message: "Không thể chọn chính danh mục làm cha",
      });
    }
  });

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
