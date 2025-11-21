import { z } from "zod";

export type CatalogStatus = "ACTIVE" | "INACTIVE";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  country?: string | null;
  websiteUrl?: string | null;
  displayOrder?: number | null;
  status: CatalogStatus;
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

export interface CategoryQueryParams {
  page?: number;
  size?: number;
  search?: string;
  status?: CatalogStatus;
  parentId?: number;
}

const slugSchema = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug can only contain lowercase letters, numbers and dashes",
  });

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    schema.optional()
  );

export const brandFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: slugSchema,
  description: emptyToUndefined(z.string().max(5000, "Description too long")),
  logoUrl: emptyToUndefined(z.string().url("Logo URL must be valid")),
  country: emptyToUndefined(z.string().max(100, "Country is too long")),
  websiteUrl: emptyToUndefined(z.string().url("Website URL must be valid")),
  displayOrder: emptyToUndefined(
    z.preprocess(
      (value) => (value === undefined ? undefined : Number(value)),
      z.number().int().min(0)
    )
  ),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type BrandFormData = z.infer<typeof brandFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: slugSchema,
  description: emptyToUndefined(z.string().max(5000)),
  imageUrl: emptyToUndefined(z.string().url("Image URL must be valid")),
  parentId: emptyToUndefined(
    z.preprocess(
      (value) => (value === undefined ? undefined : Number(value)),
      z.number().int().positive()
    )
  ),
  displayOrder: emptyToUndefined(
    z.preprocess(
      (value) => (value === undefined ? undefined : Number(value)),
      z.number().int().min(0)
    )
  ),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
