import { AxiosError } from "axios";
import { toast } from "sonner";
import type { UseFormSetError, FieldValues, Path } from "react-hook-form";

/**
 * ===== BỘ NÃO XỬ LÝ LỖI API =====
 *
 * File này cung cấp hàm xử lý lỗi tập trung cho toàn bộ dự án.
 * Tự động:
 * - Dịch message backend sang Tiếng Việt
 * - Gán lỗi vào đúng field trong form
 * - Hiển thị toast khi không có field cụ thể
 */

// ===== TYPE DEFINITIONS =====

/**
 * Error response format từ backend
 * Format 1: ApiResponse { status, message, data, timestamp }
 * Format 2: GlobalExceptionHandler { status, error, message, timestamp, path, errors? }
 */
interface BackendErrorResponse {
  status?: number;
  message?: string;
  error?: string;
  errors?: Record<string, string>; // Validation errors: { field: message }
  timestamp?: string;
  path?: string;
}

/**
 * Config options cho handleApiError
 */
interface HandleErrorOptions<T extends FieldValues> {
  setError?: UseFormSetError<T>;
  showToast?: boolean; // Default: true - hiển thị toast cho lỗi không có field
  formFieldPrefix?: string; // Prefix cho form fields (ví dụ: "address.")
}

// ===== VALIDATION MESSAGE MAPPING =====

/**
 * Mapping validation messages từ backend sang Tiếng Việt
 * Dễ dàng mở rộng thêm các message mới
 *
 * Pattern matching: Sử dụng includes() để match partial strings
 * Ví dụ: "must be at least 8 characters" sẽ match "must be at least"
 */
const VALIDATION_MESSAGE_MAP: Array<{ pattern: string; translation: string }> =
  [
    // Common validation
    { pattern: "must not be blank", translation: "Không được để trống" },
    { pattern: "must not be null", translation: "Không được để trống" },
    { pattern: "must not be empty", translation: "Không được để trống" },
    { pattern: "is required", translation: "Là bắt buộc" },
    { pattern: "cannot be null", translation: "Không được để trống" },
    { pattern: "cannot be empty", translation: "Không được để trống" },
    { pattern: "required", translation: "Là bắt buộc" },
    { pattern: "not null", translation: "Không được để trống" },
    { pattern: "not empty", translation: "Không được để trống" },

    // Email
    {
      pattern: "must be a well-formed email address",
      translation: "Email không hợp lệ",
    },
    { pattern: "must be a valid email", translation: "Email không hợp lệ" },
    { pattern: "email is invalid", translation: "Email không hợp lệ" },
    { pattern: "invalid email format", translation: "Email không hợp lệ" },
    { pattern: "invalid email", translation: "Email không hợp lệ" },
    { pattern: "email format", translation: "Email không hợp lệ" },
    { pattern: "well-formed email", translation: "Email không hợp lệ" },

    // Length
    { pattern: "size must be between", translation: "Độ dài không hợp lệ" },
    { pattern: "length must be between", translation: "Độ dài không hợp lệ" },
    { pattern: "must be at least", translation: "Quá ngắn" },
    { pattern: "must be at most", translation: "Quá dài" },
    { pattern: "minimum length", translation: "Quá ngắn" },
    { pattern: "maximum length", translation: "Quá dài" },
    { pattern: "too short", translation: "Quá ngắn" },
    { pattern: "too long", translation: "Quá dài" },

    // Number
    { pattern: "must be greater than", translation: "Giá trị quá nhỏ" },
    { pattern: "must be less than", translation: "Giá trị quá lớn" },
    { pattern: "must be positive", translation: "Phải là số dương" },
    { pattern: "must be a number", translation: "Phải là số" },
    { pattern: "must be numeric", translation: "Phải là số" },
    { pattern: "invalid number", translation: "Phải là số" },
    { pattern: "not a number", translation: "Phải là số" },

    // Pattern
    { pattern: "must match", translation: "Định dạng không hợp lệ" },
    { pattern: "pattern", translation: "Định dạng không hợp lệ" },
    { pattern: "invalid format", translation: "Định dạng không hợp lệ" },
    { pattern: "format", translation: "Định dạng không hợp lệ" },

    // Phone
    {
      pattern: "invalid phone number",
      translation: "Số điện thoại không hợp lệ",
    },
    {
      pattern: "phone number is invalid",
      translation: "Số điện thoại không hợp lệ",
    },
    { pattern: "invalid phone", translation: "Số điện thoại không hợp lệ" },
    { pattern: "phone format", translation: "Số điện thoại không hợp lệ" },

    // Password
    { pattern: "password is too weak", translation: "Mật khẩu quá yếu" },
    { pattern: "password must contain", translation: "Mật khẩu phải chứa" },
    { pattern: "password too short", translation: "Mật khẩu quá ngắn" },
    { pattern: "password too long", translation: "Mật khẩu quá dài" },
    { pattern: "weak password", translation: "Mật khẩu quá yếu" },
    { pattern: "invalid password", translation: "Mật khẩu không hợp lệ" },

    // Date/Time
    { pattern: "invalid date", translation: "Ngày không hợp lệ" },
    { pattern: "must be a date", translation: "Ngày không hợp lệ" },
    { pattern: "date format", translation: "Ngày không hợp lệ" },

    // URL
    { pattern: "invalid url", translation: "URL không hợp lệ" },
    { pattern: "must be a valid url", translation: "URL không hợp lệ" },

    // Array/Collection
    { pattern: "must not be empty", translation: "Không được để trống" },
    { pattern: "at least one", translation: "Phải chọn ít nhất một" },
    { pattern: "must select", translation: "Phải chọn" },

    // User-specific validations
    {
      pattern: "Phải chọn ít nhất một vai trò",
      translation: "Phải chọn ít nhất một vai trò",
    },
    { pattern: "vai trò", translation: "Vai trò" },
    { pattern: "role", translation: "Vai trò" },
    {
      pattern: "Họ tên không được để trống",
      translation: "Họ tên không được để trống",
    },
    {
      pattern: "Họ tên không được vượt quá",
      translation: "Họ tên không được vượt quá 255 ký tự",
    },
    {
      pattern: "Email không được để trống",
      translation: "Email không được để trống",
    },
    {
      pattern: "Email không được vượt quá",
      translation: "Email không được vượt quá 255 ký tự",
    },
    {
      pattern: "Mật khẩu không được để trống",
      translation: "Mật khẩu không được để trống",
    },
    {
      pattern: "Mật khẩu phải có ít nhất",
      translation: "Mật khẩu phải có ít nhất 6 ký tự",
    },
    {
      pattern: "Số điện thoại không được vượt quá",
      translation: "Số điện thoại không được vượt quá 20 ký tự",
    },
    {
      pattern: "Trạng thái không hợp lệ",
      translation: "Trạng thái không hợp lệ",
    },
  ];

// ===== CONFLICT FIELD DETECTION =====

/**
 * Mapping keywords trong message để detect field bị conflict
 * Key: keyword trong message (lowercase)
 * Value: field name trong form
 *
 * Pattern matching: Sử dụng includes() để match partial strings
 * Ví dụ: "Email already exists" sẽ match "email"
 */
const CONFLICT_FIELD_MAP: Array<{ keywords: string[]; field: string }> = [
  // Email
  { keywords: ["email", "địa chỉ email", "e-mail", "mail"], field: "email" },

  // Phone
  {
    keywords: [
      "phone",
      "số điện thoại",
      "điện thoại",
      "sđt",
      "phone number",
      "mobile",
    ],
    field: "phone",
  },

  // SKU
  { keywords: ["sku", "mã sku", "product sku", "product code"], field: "sku" },

  // Slug
  { keywords: ["slug", "đường dẫn", "url slug", "path"], field: "slug" },

  // Code
  { keywords: ["code", "mã", "mã code"], field: "code" },

  // Username
  {
    keywords: ["username", "tên đăng nhập", "user name", "login name"],
    field: "username",
  },

  // Name (ưu tiên "brand name", "tên thương hiệu" trước "name" chung)
  { keywords: ["brand name", "tên thương hiệu", "tên brand"], field: "name" },
  { keywords: ["name", "tên", "full name", "fullname"], field: "name" },
  { keywords: ["full name", "fullname", "họ tên"], field: "fullName" },

  // Password
  { keywords: ["password", "mật khẩu", "pass"], field: "password" },

  // Role (ưu tiên roleIds vì đây là field trong form)
  {
    keywords: ["role", "vai trò", "roles", "quyền", "chức vụ"],
    field: "roleIds",
  },

  // Category
  { keywords: ["category", "danh mục"], field: "categoryId" },

  // Brand
  { keywords: ["brand", "thương hiệu"], field: "brandId" },
];

/**
 * Conflict keywords để detect lỗi duplicate/exists
 * Nếu message chứa một trong các từ này + field keyword -> conflict error
 */
const CONFLICT_KEYWORDS = [
  "already exists",
  "đã tồn tại",
  "exists",
  "tồn tại",
  "duplicate",
  "trùng lặp",
  "already",
  "đã được sử dụng",
  "đã có",
  "is already",
  "was already",
  "has been used",
  "đã sử dụng",
];

// ===== CONFLICT ERROR MESSAGES =====

/**
 * Message hiển thị cho các lỗi conflict (409)
 */
/**
 * Message hiển thị cho các lỗi conflict (409)
 * Mapping field name -> Vietnamese error message
 */
const CONFLICT_MESSAGES: Record<string, string> = {
  // User fields
  email: "Email này đã được sử dụng",
  phone: "Số điện thoại này đã được sử dụng",
  username: "Tên đăng nhập này đã được sử dụng",
  fullName: "Tên này đã tồn tại",
  name: "Tên này đã tồn tại", // Generic - sẽ được override bởi context-specific message
  password: "Mật khẩu không hợp lệ",

  // Product fields
  sku: "Mã SKU này đã tồn tại",
  slug: "Đường dẫn này đã được sử dụng",
  code: "Mã này đã tồn tại",

  // Category/Brand fields
  categoryId: "Danh mục này đã tồn tại",
  brandId: "Thương hiệu này đã tồn tại",

  // Role fields
  roleIds: "Vai trò không hợp lệ",
};

// ===== HELPER FUNCTIONS =====

/**
 * Extract error message từ backend response
 */
function extractErrorMessage(error: AxiosError<unknown>): string {
  const response = error.response?.data;

  if (!response || typeof response !== "object") {
    return "";
  }

  const typedResponse = response as Record<string, unknown>;

  // Ưu tiên message field
  if (typedResponse.message && typeof typedResponse.message === "string") {
    return typedResponse.message;
  }

  // Fallback sang error field
  if (typedResponse.error && typeof typedResponse.error === "string") {
    return typedResponse.error;
  }

  return "";
}

/**
 * Extract validation errors từ 422 response
 */
function extractValidationErrors(
  error: AxiosError<unknown>
): Record<string, string> | null {
  const response = error.response?.data;

  if (!response || typeof response !== "object") {
    return null;
  }

  const typedResponse = response as Record<string, unknown>;

  // Check for errors field (validation errors)
  if (
    typedResponse.errors &&
    typeof typedResponse.errors === "object" &&
    typedResponse.errors !== null
  ) {
    return typedResponse.errors as Record<string, string>;
  }

  return null;
}

/**
 * Dịch validation message sang Tiếng Việt
 *
 * @param message - Error message từ backend
 * @returns Message đã dịch sang Tiếng Việt
 */
function translateValidationMessage(message: string): string {
  const messageLower = message.toLowerCase();

  // Tìm trong mapping (theo thứ tự ưu tiên - pattern dài hơn trước)
  const sortedMappings = [...VALIDATION_MESSAGE_MAP].sort(
    (a, b) => b.pattern.length - a.pattern.length
  );

  for (const { pattern, translation } of sortedMappings) {
    if (messageLower.includes(pattern.toLowerCase())) {
      return translation;
    }
  }

  // Không tìm thấy -> giữ nguyên (có thể là message tiếng Việt từ backend)
  return message;
}

/**
 * Detect field bị conflict từ error message
 *
 * Logic:
 * 1. Kiểm tra xem message có chứa conflict keywords (exists, duplicate, etc.)
 * 2. Nếu có, tìm field keyword trong message
 * 3. Trả về field name tương ứng
 *
 * @param message - Error message từ backend
 * @returns Field name hoặc null nếu không detect được
 *
 * @example
 * detectConflictField("Email already exists") -> "email"
 * detectConflictField("Số điện thoại đã được sử dụng") -> "phone"
 * detectConflictField("SKU code is duplicate") -> "sku"
 */
function detectConflictField(message: string): string | null {
  const messageLower = message.toLowerCase();

  // Bước 1: Kiểm tra xem có phải conflict error không
  const hasConflictKeyword = CONFLICT_KEYWORDS.some((keyword) =>
    messageLower.includes(keyword.toLowerCase())
  );

  if (!hasConflictKeyword) {
    return null;
  }

  // Bước 2: Tìm field keyword trong message (theo thứ tự ưu tiên - keyword dài hơn trước)
  const sortedMappings = [...CONFLICT_FIELD_MAP].sort((a, b) => {
    const aMaxLength = Math.max(...a.keywords.map((k) => k.length));
    const bMaxLength = Math.max(...b.keywords.map((k) => k.length));
    return bMaxLength - aMaxLength;
  });

  for (const { keywords, field } of sortedMappings) {
    for (const keyword of keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        return field;
      }
    }
  }

  return null;
}

/**
 * Get conflict error message cho field
 *
 * @param field - Field name (ví dụ: "email", "phone")
 * @param originalMessage - Original error message từ backend (optional)
 * @returns Vietnamese error message
 */
function getConflictMessage(field: string, originalMessage?: string): string {
  // Kiểm tra context-specific messages từ originalMessage
  if (originalMessage) {
    const messageLower = originalMessage.toLowerCase();
    
    // Brand name context
    if (field === "name" && (messageLower.includes("brand") || messageLower.includes("thương hiệu"))) {
      return "Tên thương hiệu này đã tồn tại";
    }
    
    // Category name context
    if (field === "name" && (messageLower.includes("category") || messageLower.includes("danh mục"))) {
      return "Tên danh mục này đã tồn tại";
    }
    
    // Product name context
    if (field === "name" && (messageLower.includes("product") || messageLower.includes("sản phẩm"))) {
      return "Tên sản phẩm này đã tồn tại";
    }
    
    // Nếu có originalMessage và nó đã là tiếng Việt, giữ nguyên
    const hasVietnameseChars =
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
        originalMessage
      );

    if (hasVietnameseChars) {
      // Nếu message đã rõ ràng, giữ nguyên
      return originalMessage;
    }
  }

  // Ưu tiên message có sẵn trong CONFLICT_MESSAGES
  if (CONFLICT_MESSAGES[field]) {
    return CONFLICT_MESSAGES[field];
  }

  // Fallback: tạo message chung
  return `${field} đã tồn tại`;
}

// ===== MAIN FUNCTION =====

/**
 * HÀM XỬ LÝ LỖI API CHÍNH
 *
 * @param error - AxiosError từ API call
 * @param options - Config options
 *
 * @example
 * // Trong form component với React Hook Form
 * const form = useForm<UserFormData>();
 *
 * try {
 *   await createUser(data);
 * } catch (error) {
 *   handleApiError(error as AxiosError, { setError: form.setError });
 * }
 */
export function handleApiError<T extends FieldValues>(
  error: AxiosError<unknown>,
  options: HandleErrorOptions<T> = {}
): void {
  const { setError, showToast = true, formFieldPrefix = "" } = options;

  const status = error.response?.status;
  const errorMessage = extractErrorMessage(error);

  // ===== ƯU TIÊN 1: LỖI VALIDATION (400/422) CÓ FIELD CỤ THỂ =====

  if (status === 422 || status === 400) {
    const validationErrors = extractValidationErrors(error);

    if (validationErrors && setError) {
      // Có validation errors với field cụ thể
      let hasSetError = false;

      for (const [field, message] of Object.entries(validationErrors)) {
        const translatedMessage = translateValidationMessage(message);
        const fieldName = (formFieldPrefix + field) as Path<T>;

        setError(fieldName, {
          type: "manual",
          message: translatedMessage,
        });

        hasSetError = true;
      }

      // Đã set error vào form -> không cần toast
      if (hasSetError) {
        return;
      }
    }
  }

  // ===== ƯU TIÊN 2: LỖI XUNG ĐỘT (409) HOẶC LOGIC CHUNG =====

  // Xử lý conflict errors (409) hoặc bad request với conflict message (400)
  if (status === 409 || status === 400) {
    // Kiểm tra lỗi hierarchy/permission trước (không map vào field cụ thể)
    const messageLower = errorMessage.toLowerCase();
    const isHierarchyError =
      messageLower.includes("cấp bậc") ||
      messageLower.includes("hierarchy") ||
      messageLower.includes("level") ||
      messageLower.includes("không có quyền chỉnh sửa") ||
      messageLower.includes("không thể gán role") ||
      messageLower.includes("không có quyền");

    const isSelfProtectionError =
      messageLower.includes("tự khóa") ||
      messageLower.includes("tự xóa") ||
      messageLower.includes("tự thay đổi") ||
      messageLower.includes("tự thay đổi chức vụ") ||
      messageLower.includes("chính mình") ||
      messageLower.includes("tự xóa tài khoản");

    // Nếu là lỗi hierarchy/permission -> hiển thị toast, không map vào field
    if (isHierarchyError || isSelfProtectionError) {
      if (showToast) {
        toast.error(errorMessage || "Thao tác không được phép");
      }
      return;
    }

    // Kiểm tra lỗi roleIds (phải chọn ít nhất một vai trò)
    // Chỉ map vào field nếu message rõ ràng về roleIds, không phải hierarchy error
    if (
      (messageLower.includes("phải chọn ít nhất một vai trò") ||
        messageLower.includes("danh sách quyền không được để trống")) &&
      !isHierarchyError
    ) {
      if (setError) {
        const fieldName = (formFieldPrefix + "roleIds") as Path<T>;
        setError(fieldName, {
          type: "manual",
          message: "Phải chọn ít nhất một vai trò",
        });
        return;
      }
    }

    // Kiểm tra lỗi conflict (email, phone đã tồn tại)
    const conflictField = detectConflictField(errorMessage);

    if (conflictField && setError) {
      // Detect được field bị conflict
      const conflictMessage = getConflictMessage(conflictField, errorMessage);
      const fieldName = (formFieldPrefix + conflictField) as Path<T>;

      try {
        setError(fieldName, {
          type: "manual",
          message: conflictMessage,
        });
        
        // ✅ Vẫn hiển thị toast để user biết có lỗi (ngay cả khi đã map vào form)
        // Điều này đảm bảo user luôn thấy thông báo lỗi
        if (showToast) {
          toast.error(conflictMessage);
        }
      } catch (setErrorException) {
        // Nếu setError fail (ví dụ: field không tồn tại), vẫn hiển thị toast
        console.error("[handleApiError] Failed to set error on form field:", setErrorException);
        if (showToast) {
          toast.error(conflictMessage || errorMessage || "Đã có lỗi xảy ra");
        }
      }

      // Đã xử lý error -> return
      return;
    }

    // Nếu là 400 nhưng không detect được field, có thể là lỗi logic khác
    // (ví dụ: role không tồn tại) -> xử lý ở phần toast
  }

  // ===== ƯU TIÊN 3: LỖI KHÔNG XÁC ĐỊNH - HIỂN THỊ TOAST =====

  if (!showToast) {
    return;
  }

  // Các lỗi khác: hiển thị toast với message thân thiện
  switch (status) {
    case 401:
      toast.error("Phiên đăng nhập hết hạn");
      break;

    case 403:
      toast.error("Không có quyền truy cập");
      break;

    case 404:
      // Not Found - User không tồn tại, Role không tồn tại
      // Kiểm tra xem có phải lỗi role không tồn tại không
      const messageLower404 = (errorMessage || "").toLowerCase();
      if (
        messageLower404.includes("quyền không tồn tại") ||
        messageLower404.includes("role") ||
        messageLower404.includes("vai trò")
      ) {
        // Lỗi role không tồn tại -> map vào roleIds field
        if (setError) {
          const fieldName = (formFieldPrefix + "roleIds") as Path<T>;
          setError(fieldName, {
            type: "manual",
            message: "Một hoặc nhiều quyền không tồn tại",
          });
          return; // Đã set error vào form -> không cần toast
        }
      }
      // Nếu không có setError hoặc không phải lỗi role -> hiển thị toast
      toast.error(errorMessage || "Không tìm thấy dữ liệu");
      break;

    case 400:
      // Bad Request với message cụ thể (ví dụ: role hierarchy)
      toast.error(errorMessage || "Yêu cầu không hợp lệ");
      break;

    case 409:
      // Conflict không xác định được field
      toast.error(errorMessage || "Dữ liệu đã tồn tại");
      break;

    case 422:
      // Validation error không có field cụ thể
      toast.error(errorMessage || "Dữ liệu không hợp lệ");
      break;

    case 500:
      toast.error("Lỗi hệ thống. Vui lòng thử lại sau.");
      break;

    default:
      if (!error.response) {
        // Network error
        toast.error("Mất kết nối máy chủ");
      } else {
        // Other errors
        toast.error(errorMessage || "Đã có lỗi xảy ra");
      }
      break;
  }
}

// ===== EXPORT HELPERS (nếu cần dùng riêng) =====

export {
  extractErrorMessage,
  extractValidationErrors,
  translateValidationMessage,
  detectConflictField,
  getConflictMessage,
};

// ===== EXPORT TYPES =====

export type { BackendErrorResponse, HandleErrorOptions };
