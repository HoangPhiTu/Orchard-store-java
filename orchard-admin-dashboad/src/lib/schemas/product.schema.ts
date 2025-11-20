import { z } from "zod";

const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Variant price must be greater than 0"),
  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .int("Stock must be an integer")
    .nonnegative("Stock cannot be negative"),
});

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  brandId: z.union([
    z.number({ invalid_type_error: "Brand ID must be a number" }),
    z.string().min(1, "Brand ID is required"),
  ]),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0"),
  description: z.string().optional(),
  variants: z.array(variantSchema).optional(),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;
export type ProductVariantSchema = z.infer<typeof variantSchema>;
