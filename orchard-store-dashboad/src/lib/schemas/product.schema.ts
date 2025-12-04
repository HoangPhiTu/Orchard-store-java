import { z } from "zod";

const variantSchema = z.object({
  isEnabled: z.boolean().optional().default(true),
  sku: z.string().min(1, "Vui lòng nhập SKU"),
  price: z
    .number({ invalid_type_error: "Vui lòng nhập số hợp lệ" })
    .positive("Giá sản phẩm phải lớn hơn 0"),
  stock: z
    .number({ invalid_type_error: "Vui lòng nhập số hợp lệ" })
    .int("Số lượng tồn kho phải là số nguyên")
    .nonnegative("Số lượng tồn kho không được âm"),
  imageUrl: z.string().optional().nullable(),
  attributes: z.record(z.string()).optional(),
});

export const productFormSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
  brandId: z.union([
    z.number({ invalid_type_error: "Vui lòng nhập số hợp lệ" }),
    z.string().min(1, "Vui lòng chọn thương hiệu"),
  ]),
  categoryId: z
    .number({ invalid_type_error: "Vui lòng chọn danh mục" })
    .positive("Vui lòng chọn danh mục hợp lệ")
    .nullable()
    .optional(),
  price: z
    .number({ invalid_type_error: "Vui lòng nhập số hợp lệ" })
    .positive("Giá sản phẩm phải lớn hơn 0"),
  description: z.string().optional(),
  variants: z.array(variantSchema).optional(),
  // Attributes will be added dynamically via generateProductFormSchemaWithAttributes
  attributes: z.record(z.any()).optional(),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;
export type ProductVariantSchema = z.infer<typeof variantSchema>;
