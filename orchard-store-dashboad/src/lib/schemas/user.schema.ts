import { z } from "zod";

/**
 * Regex cho số điện thoại Việt Nam
 * Hỗ trợ các format:
 * - 0912345678 (10 số, bắt đầu bằng 0)
 * - 84912345678 (11 số, bắt đầu bằng 84)
 * - +84912345678 (có dấu +)
 */
const vietnamPhoneRegex =
  /^(0|\+84|84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$/;

/**
 * Schema cho Full Name
 * - Tối thiểu 2 ký tự
 * - Tối đa 50 ký tự
 * - Không chứa ký tự đặc biệt lạ (chỉ cho phép chữ cái, số, khoảng trắng, dấu tiếng Việt)
 */
const fullNameSchema = z
  .string()
  .min(1, "Vui lòng nhập họ tên")
  .min(2, "Họ tên phải có ít nhất 2 ký tự")
  .max(50, "Họ tên không được vượt quá 50 ký tự")
  .regex(
    /^[a-zA-ZÀ-ỹĂăÂâĐđÊêÔôƠơƯư\s]+$/,
    "Họ tên chỉ được chứa chữ cái và khoảng trắng"
  );

/**
 * Schema cho Email
 * - Validate đúng format email
 */
const emailSchema = z
  .string()
  .min(1, "Vui lòng nhập email")
  .email("Email không đúng định dạng")
  .max(255, "Email không được vượt quá 255 ký tự");

/**
 * Schema cho Phone (Optional)
 * - Validate số điện thoại Việt Nam
 * - Cho phép null, undefined, hoặc empty string
 * - Nếu có giá trị thì phải match regex
 */
const phoneSchema = z.preprocess(
  (val) => {
    // Chuyển empty string thành null
    if (typeof val === "string" && val.trim() === "") return null;
    return val;
  },
  z
    .union([
      z
        .string()
        .regex(
          vietnamPhoneRegex,
          "Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)"
        ),
      z.null(),
    ])
    .optional()
    .nullable()
);

/**
 * Schema cho Roles
 * - Mảng ID phải có ít nhất 1 phần tử
 */
const roleIdsSchema = z
  .array(z.number().positive({ message: "Vui lòng chọn vai trò hợp lệ" }))
  .min(1, "Vui lòng chọn ít nhất một vai trò");

/**
 * Schema cho Status
 */
const statusSchema = z.enum(["ACTIVE", "INACTIVE", "BANNED", "SUSPENDED"]);

/**
 * Schema cho Avatar URL (Optional)
 * - URL ảnh avatar của user
 * - Tối đa 500 ký tự
 * - Cho phép null, undefined, hoặc empty string
 * - Nếu có giá trị thì phải là URL hợp lệ
 */
const avatarUrlSchema = z.preprocess(
  (val) => {
    // Chuyển empty string thành null
    if (typeof val === "string" && val.trim() === "") return null;
    return val;
  },
  z
    .union([
      z
        .string()
        .url("URL ảnh không hợp lệ")
        .max(500, "URL ảnh không được vượt quá 500 ký tự"),
      z.null(),
    ])
    .optional()
    .nullable()
);

/**
 * Base User Schema (dùng chung cho Create và Update)
 */
const baseUserSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  roleIds: roleIdsSchema,
  status: statusSchema.optional().default("ACTIVE"),
  avatarUrl: avatarUrlSchema,
});

/**
 * Create User Schema
 * - Password: Bắt buộc (required)
 * - Email: Bắt buộc
 * - Full Name: Bắt buộc
 * - Roles: Bắt buộc (min 1)
 */
export const createUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu không được vượt quá 100 ký tự"),
  email: emailSchema,
  fullName: fullNameSchema,
  roleIds: roleIdsSchema,
});

/**
 * Update User Schema
 * - Password: Optional (nếu nhập thì phải min 6 ký tự, nếu để trống thì không validate)
 * - Email: KHÔNG được cập nhật (không có trong schema)
 * - Full Name: Optional
 * - Phone: Optional
 * - Roles: Optional (nhưng nếu có thì phải min 1)
 * - Status: Optional
 */
export const updateUserSchema = z.object({
  fullName: fullNameSchema.optional(),
  phone: phoneSchema,
  password: z.preprocess(
    (val) => {
      // Chuyển empty string thành null để không validate
      if (typeof val === "string" && val.trim() === "") return null;
      return val;
    },
    z
      .union([
        z
          .string()
          .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
          .max(100, "Mật khẩu không được vượt quá 100 ký tự"),
        z.null(),
      ])
      .optional()
      .nullable()
  ),
  roleIds: roleIdsSchema.optional(),
  status: statusSchema.optional(),
  avatarUrl: avatarUrlSchema,
});

/**
 * Type exports
 */
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
