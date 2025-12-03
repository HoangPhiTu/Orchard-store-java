import { z } from "zod";

export type WarehouseStatus = "ACTIVE" | "INACTIVE";

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address?: string | null;
  contactPhone?: string | null;
  isDefault: boolean;
  status: WarehouseStatus;
  createdAt?: string | null; // ISO date string
  updatedAt?: string | null; // ISO date string
}

export interface WarehouseFilter {
  keyword?: string;
  status?: WarehouseStatus;
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

const codeSchema = z
  .string()
  .min(1, "Vui lòng nhập mã kho")
  .min(2, "Mã kho phải có ít nhất 2 ký tự")
  .max(50, "Mã kho không được vượt quá 50 ký tự")
  .regex(/^[A-Z0-9_-]+$/, {
    message: "Mã kho chỉ được chứa chữ in hoa, số, dấu gạch dưới và dấu gạch ngang",
  });

export const warehouseFormSchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên kho")
    .min(2, "Tên kho phải có ít nhất 2 ký tự")
    .max(255, "Tên kho không được vượt quá 255 ký tự"),
  code: emptyToUndefined(codeSchema), // Code là optional - backend sẽ tự tạo nếu không có
  address: emptyToUndefined(z.string().max(1000, "Địa chỉ không được vượt quá 1000 ký tự")),
  contactPhone: emptyToUndefined(
    z.string().regex(/^[0-9+\\-()\\s]*$/, "Số điện thoại không hợp lệ").max(20)
  ),
  isDefault: z.boolean().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type WarehouseFormData = z.infer<typeof warehouseFormSchema>;

