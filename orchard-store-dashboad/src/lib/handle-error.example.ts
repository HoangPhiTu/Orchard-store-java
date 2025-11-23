/**
 * ===== VÍ DỤ SỬ DỤNG handleApiError =====
 *
 * File này chứa các ví dụ cách sử dụng handleApiError trong các component
 */

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { handleApiError } from "./handle-error";

// ===== VÍ DỤ 1: FORM TẠO USER =====

interface UserFormData {
  email: string;
  fullName: string;
  phone?: string;
  password: string;
  roleIds: number[];
}

function UserFormExample() {
  const form = useForm<UserFormData>();

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      // API call here
      return await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      await createUserMutation.mutateAsync(data);
      // Success handling
    } catch (error) {
      // ✅ SỬ DỤNG handleApiError
      // Tự động:
      // - Gán lỗi validation vào đúng field (email, phone...)
      // - Detect conflict (email/phone đã tồn tại) và gán vào field
      // - Hiển thị toast cho các lỗi khác (403, 500...)
      handleApiError(error as AxiosError, {
        setError: form.setError,
      });
    }
  };

  return null; // JSX here
}

// ===== VÍ DỤ 2: FORM CẬP NHẬT SẢN PHẨM =====

interface ProductFormData {
  name: string;
  sku: string;
  slug: string;
  price: number;
  categoryId: number;
}

function ProductFormExample() {
  const form = useForm<ProductFormData>();

  const onSubmit = async (data: ProductFormData) => {
    try {
      // API call
    } catch (error) {
      // ✅ Tự động detect SKU/slug conflict và gán vào field
      handleApiError(error as AxiosError, {
        setError: form.setError,
      });
    }
  };

  return null;
}

// ===== VÍ DỤ 3: KHÔNG CẦN FORM - CHỈ HIỂN THỊ TOAST =====

function DeleteUserExample() {
  const deleteUser = async (userId: number) => {
    try {
      // API call
    } catch (error) {
      // ✅ Không có form -> chỉ hiển thị toast
      handleApiError(error as AxiosError);
      // Tự động hiển thị:
      // - 403: "Không có quyền truy cập"
      // - 404: "Không tìm thấy dữ liệu"
      // - 500: "Lỗi hệ thống"
    }
  };

  return null;
}

// ===== VÍ DỤ 4: TẮT TOAST (chỉ gán lỗi vào form, không toast) =====

function SilentErrorExample() {
  const form = useForm<UserFormData>();

  const onSubmit = async (data: UserFormData) => {
    try {
      // API call
    } catch (error) {
      // ✅ showToast: false -> chỉ gán lỗi vào form, không hiển thị toast
      handleApiError(error as AxiosError, {
        setError: form.setError,
        showToast: false,
      });
    }
  };

  return null;
}

// ===== VÍ DỤ 5: NESTED FORM FIELDS (có prefix) =====

interface AddressFormData {
  "address.street": string;
  "address.city": string;
  "address.phone": string;
}

function NestedFormExample() {
  const form = useForm<AddressFormData>();

  const onSubmit = async (data: AddressFormData) => {
    try {
      // API call
    } catch (error) {
      // ✅ formFieldPrefix -> tự động thêm prefix vào field name
      // Backend trả về: { phone: "đã tồn tại" }
      // -> Gán vào: address.phone
      handleApiError(error as AxiosError, {
        setError: form.setError,
        formFieldPrefix: "address.",
      });
    }
  };

  return null;
}

// ===== VÍ DỤ 6: XỬ LÝ LỖI TRONG REACT QUERY =====

function ReactQueryExample() {
  const form = useForm<UserFormData>();

  const mutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      // API call
    },
    onError: (error) => {
      // ✅ Xử lý lỗi ngay trong onError callback
      handleApiError(error as AxiosError, {
        setError: form.setError,
      });
    },
  });

  return null;
}

// ===== CÁC TRƯỜNG HỢP XỬ LÝ TỰ ĐỘNG =====

/**
 * VALIDATION ERRORS (400/422):
 * - Backend: { errors: { email: "must be a well-formed email" } }
 * - Auto: Dịch "must be a well-formed email" -> "Email không hợp lệ"
 * - Auto: Gán vào form.setError("email", { message: "Email không hợp lệ" })
 *
 * CONFLICT ERRORS (409):
 * - Backend: { message: "Email đã tồn tại: test@example.com" }
 * - Auto: Detect keyword "email" -> Gán vào field "email"
 * - Auto: Message: "Email này đã được sử dụng"
 *
 * - Backend: { message: "SKU code already exists" }
 * - Auto: Detect keyword "sku" -> Gán vào field "sku"
 * - Auto: Message: "Mã SKU này đã tồn tại"
 *
 * PERMISSION ERRORS (403):
 * - Auto: Toast "Không có quyền truy cập"
 *
 * HIERARCHY ERRORS (400):
 * - Backend: { message: "Bạn không có quyền chỉnh sửa..." }
 * - Auto: Toast với message từ backend
 *
 * NOT FOUND (404):
 * - Auto: Toast "Không tìm thấy dữ liệu"
 *
 * SERVER ERROR (500):
 * - Auto: Toast "Lỗi hệ thống. Vui lòng thử lại sau."
 *
 * NETWORK ERROR:
 * - Auto: Toast "Mất kết nối máy chủ"
 */

export {};
