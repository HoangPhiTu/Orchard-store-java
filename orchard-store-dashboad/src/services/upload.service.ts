import http from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";

/**
 * Upload Image Service
 *
 * Service để upload ảnh lên MinIO thông qua backend API
 */
export const uploadService = {
  /**
   * Upload một file ảnh lên MinIO
   *
   * @param file File ảnh cần upload
   * @param folder Tên folder trong bucket (VD: "users", "products", "avatars")
   * @returns Promise<string> URL đầy đủ của ảnh sau khi upload thành công
   * @throws Error Nếu upload thất bại
   *
   * @example
   * const imageUrl = await uploadService.uploadImage(file, "users");
   * // imageUrl: "http://127.0.0.1:9000/orchard-bucket/users/uuid.jpg"
   */
  uploadImage: async (
    file: File,
    folder: string = "others"
  ): Promise<string> => {
    // Validate file
    if (!file) {
      throw new Error("File không được để trống");
    }

    // Validate file type (chỉ cho phép ảnh)
    if (!file.type.startsWith("image/")) {
      throw new Error("File phải là ảnh (image/*)");
    }

    // Validate file size (tối đa 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("Kích thước file không được vượt quá 5MB");
    }

    // Tạo FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      // Gọi API upload
      const response = await http.post<ApiResponse<string>>(
        "/api/admin/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Trả về URL từ response
      if (response.data) {
        return response.data;
      }

      throw new Error(response.message || "Upload thất bại");
    } catch (error) {
      // Re-throw error để component xử lý
      throw error;
    }
  },

  /**
   * Xóa ảnh khỏi MinIO
   *
   * @param imageUrl URL đầy đủ của ảnh cần xóa
   */
  deleteImage: async (imageUrl: string): Promise<void> => {
    if (!imageUrl) {
      return;
    }

    try {
      await http.delete<ApiResponse<void>>(API_ROUTES.UPLOAD, {
        params: { imageUrl },
      });
    } catch (error) {
      throw error;
    }
  },
};
