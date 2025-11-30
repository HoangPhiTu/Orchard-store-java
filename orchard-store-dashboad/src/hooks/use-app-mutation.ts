import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  UseMutationOptions,
  UseMutationResult,
  QueryKey,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type {
  UseFormSetError,
  UseFormReturn,
  FieldValues,
} from "react-hook-form";
import { handleApiError } from "@/lib/handle-error";

/**
 * ===== CUSTOM HOOK: useAppMutation =====
 *
 * Hook tự động hóa xử lý mutation cho toàn bộ dự án.
 * ✅ CHẶN CRASH APP: throwOnError: false (mặc định), bắt mọi lỗi
 * ✅ Tự động dịch lỗi sang Tiếng Việt và gán vào form
 * ✅ Tự động invalidate queries, hiển thị toast
 * ✅ Type-safe với generics
 *
 * @example
 * // Cách dùng cơ bản
 * const mutation = useAppMutation({
 *   mutationFn: createProduct,
 *   queryKey: ['products'],
 *   form: form, // Tự động map lỗi vào form
 *   successMessage: 'Tạo sản phẩm thành công!',
 * });
 *
 * @example
 * // Với setError (deprecated, nên dùng form)
 * const mutation = useAppMutation({
 *   mutationFn: updateUser,
 *   queryKey: ['users'],
 *   setError: form.setError, // Tự động map lỗi vào form
 *   successMessage: 'Cập nhật thành công!',
 * });
 *
 * @example
 * // Tự động đóng modal khi thành công
 * const mutation = useAppMutation({
 *   mutationFn: deleteItem,
 *   queryKey: ['items'],
 *   onClose: () => setOpen(false), // Tự động đóng khi thành công
 *   successMessage: 'Xóa thành công!',
 * });
 */

// ===== TYPE DEFINITIONS =====

/**
 * Options cho useAppMutation
 * Mở rộng UseMutationOptions với các tính năng tự động
 */
interface UseAppMutationOptions<
  TData = unknown,
  TError = AxiosError,
  TVariables = void,
  TContext = unknown,
  TFormData extends FieldValues = FieldValues
> extends Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "onError" | "onSuccess"
  > {
  /**
   * Hàm mutation (required)
   */
  mutationFn: (variables: TVariables) => Promise<TData>;

  /**
   * Query key để invalidate sau khi mutation thành công
   * Có thể là 1 key hoặc array of keys
   *
   * @example
   * queryKey: 'products'
   * queryKey: ['products']
   * queryKey: [['products'], ['categories']]
   */
  queryKey?: QueryKey | QueryKey[];

  /**
   * setError từ React Hook Form để gán lỗi vào form fields
   * Nếu không truyền -> chỉ hiển thị toast
   *
   * @deprecated Sử dụng `form` thay vì `setError` để có đầy đủ tính năng (reset form, setError)
   */
  setError?: UseFormSetError<TFormData>;

  /**
   * Form instance từ React Hook Form (UseFormReturn)
   * Dùng để:
   * - Tự động gán lỗi vào form fields (setError)
   * - Tự động reset form khi thành công (nếu resetOnSuccess = true)
   *
   * @example
   * const form = useForm<UserFormData>();
   * const mutation = useAppMutation({
   *   form: form,
   *   ...
   * });
   */
  form?: UseFormReturn<TFormData>;

  /**
   * Hàm đóng Modal/Sheet (Optional)
   * Chỉ được gọi khi mutation thành công (onSuccess)
   * KHÔNG được gọi khi có lỗi (onError) - để giữ form mở cho user sửa lỗi
   *
   * @example
   * onClose: () => setOpen(false)
   * onClose: () => onOpenChange(false)
   */
  onClose?: () => void;

  /**
   * Message hiển thị khi mutation thành công
   * Nếu không truyền -> không hiển thị toast success
   *
   * @example
   * successMessage: 'Tạo sản phẩm thành công!'
   */
  successMessage?: string;

  /**
   * Có tự động reset form khi thành công hay không (default: false)
   * Chỉ hoạt động nếu có truyền `form`
   *
   * @example
   * resetOnSuccess: true // Reset form sau khi thành công
   */
  resetOnSuccess?: boolean;

  /**
   * Custom onSuccess callback (optional)
   * Được gọi sau khi invalidate queries và hiển thị toast
   */
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;

  /**
   * Custom onError callback (optional)
   * Được gọi sau khi handleApiError xử lý
   */
  onError?: (error: TError, variables: TVariables, context: TContext) => void;

  /**
   * Có hiển thị toast error hay không (default: true nếu không gán được vào form)
   * Nếu có setError/form và lỗi được gán vào form -> không hiển thị toast
   * Nếu không có setError/form hoặc không gán được -> hiển thị toast
   */
  showErrorToast?: boolean;

  /**
   * Có hiển thị toast success hay không (default: true nếu có successMessage)
   * Set false nếu muốn tự xử lý success message
   */
  showSuccessToast?: boolean;

  /**
   * Có throw error ra ngoài hay không (default: false)
   * ⚠️ QUAN TRỌNG: Set false để chặn crash app
   * Nếu set true, lỗi sẽ được throw ra Error Boundary
   */
  throwOnError?: boolean;

  /**
   * Prefix cho form field (dành cho nested forms)
   * @example
   * formFieldPrefix: 'address.'
   */
  formFieldPrefix?: string;
}

// ===== MAIN HOOK =====

/**
 * Custom Hook wrapper cho useMutation với tự động hóa:
 * - ✅ Chặn crash app (throwOnError: false)
 * - ✅ Error handling tự động (gán vào form fields, toast)
 * - ✅ Success toast tự động
 * - ✅ Query invalidation tự động
 * - ✅ Type-safe với generics
 */
export function useAppMutation<
  TData = unknown,
  TError = AxiosError,
  TVariables = void,
  TContext = unknown,
  TFormData extends FieldValues = FieldValues
>(
  options: UseAppMutationOptions<TData, TError, TVariables, TContext, TFormData>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient();

  const {
    mutationFn,
    queryKey,
    setError,
    form,
    onClose,
    successMessage,
    onSuccess: customOnSuccess,
    onError: customOnError,
    showErrorToast, // undefined = auto (true nếu không có setError/form)
    showSuccessToast = true,
    formFieldPrefix,
    resetOnSuccess = false,
    throwOnError = false, // ⚠️ QUAN TRỌNG: false để chặn crash
    ...mutationOptions
  } = options;

  // Ưu tiên dùng form.setError nếu có form, fallback sang setError
  const formSetError = form?.setError || setError;

  // Wrap mutationFn để bắt lỗi và không throw ra ngoài
  const safeMutationFn = async (variables: TVariables): Promise<TData> => {
    try {
      return await mutationFn(variables);
    } catch (error) {
      // Log error để debug (chỉ trong development)
      if (process.env.NODE_ENV === "development") {
        console.error("[useAppMutation] Error caught in mutationFn:", error);
      }

      // Re-throw để React Query xử lý (sẽ được bắt trong onError)
      throw error;
    }
  };

  return useMutation({
    mutationFn: safeMutationFn,
    throwOnError, // ⚠️ QUAN TRỌNG: false để không throw ra Error Boundary
    ...mutationOptions,

    // ===== AUTO SUCCESS HANDLING =====
    onSuccess: async (data, variables, context) => {
      try {
        // 1. Invalidate queries (mark as stale)
        if (queryKey) {
          try {
            if (Array.isArray(queryKey) && Array.isArray(queryKey[0])) {
              // Multiple query keys: [['products'], ['categories']]
              await Promise.all(
                (queryKey as QueryKey[]).map((key) =>
                  queryClient.invalidateQueries({ queryKey: key })
                )
              );
              // ✅ Refetch queries ngay lập tức để tải lại dữ liệu mới
              await Promise.all(
                (queryKey as QueryKey[]).map((key) =>
                  queryClient.refetchQueries({ queryKey: key })
                )
              );
            } else {
              // Single query key: 'products' or ['products']
              const key = Array.isArray(queryKey) ? queryKey : [queryKey];
              await queryClient.invalidateQueries({ queryKey: key });
              // ✅ Refetch queries ngay lập tức để tải lại dữ liệu mới
              await queryClient.refetchQueries({ queryKey: key });
            }
          } catch (invalidateError) {
            // Log nhưng không crash nếu invalidate fail
            console.error(
              "[useAppMutation] Error invalidating queries:",
              invalidateError
            );
          }
        }

        // 2. Show success toast
        if (successMessage && showSuccessToast) {
          try {
            toast.success(successMessage);
          } catch (toastError) {
            console.error("[useAppMutation] Error showing toast:", toastError);
          }
        }

        // 3. Reset form nếu được yêu cầu
        if (resetOnSuccess && form) {
          try {
            form.reset();
          } catch (resetError) {
            console.error("[useAppMutation] Error resetting form:", resetError);
          }
        }

        // 4. Đóng Modal/Sheet (chỉ khi thành công)
        // Quan trọng: KHÔNG gọi onClose khi có lỗi (để giữ form mở cho user sửa)
        if (onClose) {
          try {
            onClose();
          } catch (closeError) {
            console.error("[useAppMutation] Error closing modal:", closeError);
          }
        }

        // 5. Call custom onSuccess callback (sau khi đã xử lý các bước trên)
        if (customOnSuccess) {
          try {
            customOnSuccess(data, variables, context as TContext);
          } catch (callbackError) {
            // Nếu custom callback throw lỗi, log nhưng không crash app
            console.error(
              "[useAppMutation] Error in custom onSuccess callback:",
              callbackError
            );
          }
        }
      } catch (successHandlerError) {
        // Nếu bất kỳ bước nào trong onSuccess throw lỗi,
        // log và hiển thị toast để không crash app
        console.error(
          "[useAppMutation] Error in success handler:",
          successHandlerError
        );
        toast.error("Đã có lỗi xảy ra sau khi xử lý thành công.");
      }
    },

    // ===== AUTO ERROR HANDLING =====
    onError: (error, variables, context) => {
      try {
        // 1. Xác định có nên hiển thị toast error không
        // Nếu showErrorToast được set rõ ràng -> dùng giá trị đó
        // Nếu không -> auto: true nếu không có setError/form để gán lỗi
        const shouldShowToast =
          showErrorToast !== undefined ? showErrorToast : !formSetError; // Auto: hiển thị toast nếu không có form để gán lỗi

        // 2. Handle error với handleApiError utility
        // handleApiError sẽ tự động:
        // - Dịch lỗi sang Tiếng Việt
        // - Gán lỗi vào form fields (nếu có setError)
        // - Hiển thị toast (nếu shouldShowToast = true)
        handleApiError(error as AxiosError, {
          setError: formSetError,
          showToast: shouldShowToast,
          formFieldPrefix,
        });

        // 3. KHÔNG gọi onClose() khi có lỗi
        // Giữ form mở để user có thể sửa lỗi và thử lại
        // onClose chỉ được gọi trong onSuccess

        // 4. Call custom onError callback (nếu có)
        if (customOnError) {
          try {
            customOnError(error, variables, context as TContext);
          } catch (callbackError) {
            // Nếu custom callback throw lỗi, log nhưng không crash app
            console.error(
              "[useAppMutation] Error in custom onError callback:",
              callbackError
            );
          }
        }
      } catch (handlerError) {
        // Nếu handleApiError hoặc các bước xử lý lỗi throw lỗi,
        // log và hiển thị toast chung để không crash app
        console.error("[useAppMutation] Error in error handler:", handlerError);
        toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    },
  });
}

// ===== EXPORT TYPE =====
export type { UseAppMutationOptions };
