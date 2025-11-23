/**
 * ===== VÍ DỤ SỬ DỤNG useAppMutation =====
 *
 * Hook tự động hóa xử lý mutation - không cần try-catch thủ công!
 */

import { useForm } from "react-hook-form";
import { useAppMutation } from "./use-app-mutation";

// ===== VÍ DỤ 1: FORM TẠO USER (Full Features) =====

interface UserFormData {
  email: string;
  fullName: string;
  phone?: string;
  password: string;
  roleIds: number[];
}

function UserFormExample() {
  const form = useForm<UserFormData>();

  // ✅ Chỉ cần khai báo mutation với config
  const createUserMutation = useAppMutation({
    mutationFn: async (data: UserFormData) => {
      // API call
      return await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    queryKey: ["users"], // Tự động refresh list sau khi tạo
    setError: form.setError, // Tự động gán lỗi vào form fields
    successMessage: "Tạo người dùng thành công!", // Tự động toast success
  });

  const onSubmit = (data: UserFormData) => {
    // ✅ Không cần try-catch!
    // ✅ Không cần onError callback!
    // ✅ Không cần onSuccess callback!
    // ✅ Không cần invalidateQueries thủ công!
    createUserMutation.mutate(data);
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

  const updateProductMutation = useAppMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductFormData }) => {
      return await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    queryKey: [["products"], ["products", "123"]], // Invalidate multiple queries
    setError: form.setError,
    successMessage: "Cập nhật sản phẩm thành công!",
  });

  const onSubmit = (data: ProductFormData) => {
    updateProductMutation.mutate({ id: 123, data });
  };

  return null;
}

// ===== VÍ DỤ 3: DELETE (không có form) =====

function DeleteUserExample() {
  const deleteUserMutation = useAppMutation({
    mutationFn: async (userId: number) => {
      return await fetch(`/api/users/${userId}`, { method: "DELETE" });
    },
    queryKey: "users", // Single query key
    successMessage: "Xóa người dùng thành công!",
    // Không truyền setError -> chỉ hiển thị toast error (nếu có)
  });

  const handleDelete = (userId: number) => {
    deleteUserMutation.mutate(userId);
  };

  return null;
}

// ===== VÍ DỤ 4: CUSTOM CALLBACKS =====

function CustomCallbacksExample() {
  const form = useForm<UserFormData>();

  const mutation = useAppMutation({
    mutationFn: async (data: UserFormData) => {
      return await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    queryKey: "users",
    setError: form.setError,
    successMessage: "Tạo thành công!",

    // ✅ Có thể thêm custom logic sau khi success
    onSuccess: (data, variables) => {
      console.log("Custom success logic", data);
      // Close modal, redirect, etc.
    },

    // ✅ Có thể thêm custom logic sau khi error
    onError: (error, variables) => {
      console.log("Custom error logic", error);
      // Log to analytics, etc.
    },
  });

  return null;
}

// ===== VÍ DỤ 5: KHÔNG HIỂN THỊ SUCCESS TOAST =====

function NoSuccessToastExample() {
  const form = useForm<UserFormData>();

  const mutation = useAppMutation({
    mutationFn: async (data: UserFormData) => {
      return await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    queryKey: "users",
    setError: form.setError,
    successMessage: "Tạo thành công!", // Có message nhưng không hiển thị
    showSuccessToast: false, // Tắt toast success

    // Tự xử lý success
    onSuccess: () => {
      // Custom success handling
      alert("Success!");
    },
  });

  return null;
}

// ===== VÍ DỤ 6: HIỂN THỊ ERROR TOAST (override axios interceptor) =====

function ShowErrorToastExample() {
  const form = useForm<UserFormData>();

  const mutation = useAppMutation({
    mutationFn: async (data: UserFormData) => {
      return await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    setError: form.setError,
    successMessage: "Tạo thành công!",
    showErrorToast: true, // Override axios interceptor, hiển thị toast error
  });

  return null;
}

// ===== VÍ DỤ 7: NESTED FORM FIELDS =====

interface AddressFormData {
  "address.street": string;
  "address.city": string;
  "address.phone": string;
}

function NestedFormExample() {
  const form = useForm<AddressFormData>();

  const mutation = useAppMutation({
    mutationFn: async (data: AddressFormData) => {
      return await fetch("/api/addresses", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    setError: form.setError,
    formFieldPrefix: "address.", // Tự động thêm prefix vào field name
    successMessage: "Lưu địa chỉ thành công!",
  });

  return null;
}

// ===== VÍ DỤ 8: INVALIDATE NHIỀU QUERIES =====

function MultipleInvalidateExample() {
  const mutation = useAppMutation({
    mutationFn: async (data: ProductFormData) => {
      return await fetch("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    // ✅ Invalidate nhiều queries cùng lúc
    queryKey: [
      ["products"], // Refresh products list
      ["categories"], // Refresh categories (nếu có link)
      ["dashboard", "stats"], // Refresh dashboard stats
    ],
    successMessage: "Tạo sản phẩm thành công!",
  });

  return null;
}

// ===== VÍ DỤ 9: LOADING & ERROR STATE =====

function LoadingStateExample() {
  const form = useForm<UserFormData>();

  const mutation = useAppMutation({
    mutationFn: async (data: UserFormData) => {
      return await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    queryKey: "users",
    setError: form.setError,
    successMessage: "Tạo thành công!",
  });

  // ✅ Có đầy đủ state từ useMutation
  const { isPending, isError, isSuccess, data, error } = mutation;

  return (
    <div>
      {isPending && <p>Đang tải...</p>}
      {isError && <p>Có lỗi xảy ra</p>}
      {isSuccess && <p>Thành công! Data: {JSON.stringify(data)}</p>}
    </div>
  );
}

// ===== SO SÁNH: TRƯỚC VS SAU =====

/**
 * ❌ TRƯỚC (Cách cũ - 50+ dòng code):
 */
function OldWayExample() {
  const form = useForm<UserFormData>();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      return await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: async () => {
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["users"] });

      // Show success toast
      toast.success("Tạo người dùng thành công!");

      // Reset form
      form.reset();
    },
    onError: (error) => {
      // Handle error
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      if (status === 409) {
        // Conflict
        const message = extractErrorMessage(axiosError);
        if (message.includes("email")) {
          form.setError("email", { message: "Email đã tồn tại" });
        }
        if (message.includes("phone")) {
          form.setError("phone", { message: "Phone đã tồn tại" });
        }
      } else if (status === 422) {
        // Validation
        const errors = extractValidationErrors(axiosError);
        if (errors) {
          for (const [field, msg] of Object.entries(errors)) {
            form.setError(field, { message: translateMessage(msg) });
          }
        }
      } else {
        // Other errors
        toast.error("Có lỗi xảy ra");
      }
    },
  });

  // ... 50+ dòng code xử lý lỗi
}

/**
 * ✅ SAU (Cách mới - 7 dòng code):
 */
function NewWayExample() {
  const form = useForm<UserFormData>();

  const mutation = useAppMutation({
    mutationFn: async (data: UserFormData) => {
      return await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    queryKey: "users",
    setError: form.setError,
    successMessage: "Tạo người dùng thành công!",
  });

  // ✅ Tất cả xử lý lỗi, success, invalidate tự động!
}

export {};
