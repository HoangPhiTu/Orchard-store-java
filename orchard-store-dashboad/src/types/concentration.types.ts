import { z } from "zod";

export type ConcentrationStatus = "ACTIVE" | "INACTIVE";

export interface Concentration {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  acronym?: string | null; // Tên viết tắt: EDP, EDT, EDC
  displayName?: string | null; // Tên hiển thị: "Eau de Toilette (EDT)"
  minOilPercentage?: number | null; // Tỷ lệ tinh dầu tối thiểu (%)
  maxOilPercentage?: number | null; // Tỷ lệ tinh dầu tối đa (%)
  longevity?: string | null; // Độ lưu hương: "6 - 8 tiếng"
  intensityLevel?: number | null;
  displayOrder?: number | null;
  status: ConcentrationStatus;
  createdAt?: string | null; // ISO date string
  updatedAt?: string | null; // ISO date string
}

export interface ConcentrationFilter {
  keyword?: string;
  status?: ConcentrationStatus;
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

const slugSchema = z
  .string()
  .min(1, "Vui lòng nhập slug")
  .min(2, "Slug phải có ít nhất 2 ký tự")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
  });

export const concentrationFormSchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên nồng độ")
    .min(2, "Tên nồng độ phải có ít nhất 2 ký tự")
    .max(255, "Tên nồng độ không được vượt quá 255 ký tự"),
  slug: emptyToUndefined(slugSchema), // Slug là optional - backend sẽ tự tạo nếu không có
  description: emptyToUndefined(
    z.string().max(5000, "Mô tả không được vượt quá 5000 ký tự")
  ),
  acronym: emptyToUndefined(
    z.string().max(20, "Tên viết tắt không được vượt quá 20 ký tự")
  ),
  minOilPercentage: emptyToUndefined(
    z.preprocess(
      (value) => (value === undefined ? undefined : Number(value)),
      z
        .number({
          invalid_type_error: "Vui lòng nhập số hợp lệ",
        })
        .int("Tỷ lệ tinh dầu phải là số nguyên")
        .min(0, "Tỷ lệ tinh dầu phải lớn hơn hoặc bằng 0")
        .max(100, "Tỷ lệ tinh dầu không được vượt quá 100%")
    )
  ),
  maxOilPercentage: emptyToUndefined(
    z.preprocess(
      (value) => (value === undefined ? undefined : Number(value)),
      z
        .number({
          invalid_type_error: "Vui lòng nhập số hợp lệ",
        })
        .int("Tỷ lệ tinh dầu phải là số nguyên")
        .min(0, "Tỷ lệ tinh dầu phải lớn hơn hoặc bằng 0")
        .max(100, "Tỷ lệ tinh dầu không được vượt quá 100%")
    )
  ),
  longevity: emptyToUndefined(
    z.string().max(100, "Độ lưu hương không được vượt quá 100 ký tự")
  ),
  intensityLevel: emptyToUndefined(
    z.preprocess(
      (value) => (value === undefined ? undefined : Number(value)),
      z
        .number({
          invalid_type_error: "Vui lòng nhập số hợp lệ",
        })
        .int("Mức độ phải là số nguyên")
        .min(1, "Mức độ phải lớn hơn hoặc bằng 1")
        .max(10, "Mức độ phải nhỏ hơn hoặc bằng 10")
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
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type ConcentrationFormData = z.infer<typeof concentrationFormSchema>;
