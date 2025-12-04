import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";
import type {
  ProductDTO,
  ProductFilter,
  ProductFormData,
} from "@/types/product.types";
import type { ApiResponse } from "@/types/api.types";
import type { Page } from "@/types/user.types";

/**
 * Unwrap ApiResponse<Page<T>> to Page<T>
 */
const unwrapPage = <T>(response: ApiResponse<Page<T>>): Page<T> => {
  if (!response.data) {
    throw new Error(response.message || "Product data not found");
  }
  return response.data;
};

/**
 * Unwrap ApiResponse<T> to T
 */
const unwrapItem = <T>(response: ApiResponse<T>): T => {
  if (!response.data) {
    throw new Error(response.message || "Product data not found");
  }
  return response.data;
};

/**
 * Unwrap ApiResponse<ProductDTO[]> to ProductDTO[]
 */
const unwrapList = (response: ApiResponse<ProductDTO[]>): ProductDTO[] => {
  return response.data ?? [];
};

/**
 * Helper function to upload image (defined before productService to avoid circular reference)
 */
const uploadImageFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  return http
    .post<ApiResponse<string>>(
      `${API_ROUTES.PRODUCTS}/upload-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then((res) => {
      if (!res.data) {
        throw new Error(res.message || "Upload image failed");
      }
      return res.data;
    });
};

export const productService = {
  /**
   * ===== ADMIN API =====
   * Lấy danh sách products với pagination và filters (admin)
   * GET /api/admin/products?page=0&size=10&keyword=...&status=...&sortBy=name&direction=ASC
   */
  getProducts: (params?: ProductFilter) => {
    const queryParams: Record<string, string | number> = {};
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.size !== undefined) queryParams.size = params.size;
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.direction) queryParams.direction = params.direction;
    // Add filters
    if (params?.keyword && params.keyword.trim() !== "") {
      queryParams.keyword = params.keyword.trim();
    }
    if (params?.status) {
      queryParams.status = params.status;
    }
    if (params?.brandId) {
      queryParams.brandId = params.brandId;
    }
    if (params?.categoryId) {
      queryParams.categoryId = params.categoryId;
    }

    return http
      .get<ApiResponse<Page<ProductDTO>>>(API_ROUTES.PRODUCTS, {
        params: queryParams,
      })
      .then((res) => unwrapPage(res));
  },

  /**
   * Lấy chi tiết product theo ID (admin) - bao gồm variants và images
   * GET /api/admin/products/{id}
   */
  getProduct: (id: number): Promise<ProductDTO> => {
    return http
      .get<ApiResponse<ProductDTO>>(`${API_ROUTES.PRODUCTS}/${id}`)
      .then((res) => unwrapItem(res));
  },

  /**
   * Upload ảnh riêng lẻ
   * POST /api/admin/products/upload-image
   */
  uploadImage: uploadImageFile,

  /**
   * Tạo product mới
   * POST /api/admin/products
   * Body: ProductCreateRequest
   */
  createProduct: async (data: ProductFormData): Promise<ProductDTO> => {
    // Upload images first if any
    const imageUrls: string[] = [];

    if (data.thumbnail instanceof File) {
      const thumbnailUrl = await uploadImageFile(data.thumbnail);
      imageUrls.push(thumbnailUrl);
    } else if (typeof data.thumbnail === "string") {
      imageUrls.push(data.thumbnail);
    }

    if (data.detailImages && data.detailImages.length > 0) {
      for (const img of data.detailImages) {
        if (img instanceof File) {
          const url = await uploadImageFile(img);
          imageUrls.push(url);
        } else if (typeof img === "string") {
          imageUrls.push(img);
        }
      }
    }

    // Prepare images array for backend
    const images = imageUrls.map((url, index) => ({
      imageUrl: url,
      thumbnailUrl: url,
      isPrimary: index === 0,
      displayOrder: index,
    }));

    // Also include images from data.images if provided (existing URLs)
    if (data.images && data.images.length > 0) {
      data.images.forEach((img, index) => {
        if (
          typeof img.imageUrl === "string" &&
          !imageUrls.includes(img.imageUrl)
        ) {
          images.push({
            ...img,
            displayOrder: images.length + index,
          });
        }
      });
    }

    const payload = {
      name: data.name,
      brandId:
        typeof data.brandId === "string" ? Number(data.brandId) : data.brandId,
      categoryId: data.categoryId || undefined,
      price: data.price,
      description: data.description || undefined,
      variants: data.variants || undefined,
      attributes: data.attributes || undefined,
      images: images.length > 0 ? images : undefined,
    };

    return http
      .post<ApiResponse<ProductDTO>>(API_ROUTES.PRODUCTS, payload)
      .then((res) => unwrapItem(res));
  },

  /**
   * Cập nhật product
   * PUT /api/admin/products/{id}
   * Body: ProductUpdateRequest (tất cả fields optional)
   */
  updateProduct: async (
    id: number,
    data: Partial<ProductFormData>
  ): Promise<ProductDTO> => {
    // Upload images first if any
    const imageUrls: string[] = [];

    if (data.thumbnail instanceof File) {
      const thumbnailUrl = await uploadImageFile(data.thumbnail);
      imageUrls.push(thumbnailUrl);
    } else if (typeof data.thumbnail === "string") {
      imageUrls.push(data.thumbnail);
    }

    if (data.detailImages && data.detailImages.length > 0) {
      for (const img of data.detailImages) {
        if (img instanceof File) {
          const url = await uploadImageFile(img);
          imageUrls.push(url);
        } else if (typeof img === "string") {
          imageUrls.push(img);
        }
      }
    }

    // Prepare images array for backend
    const images = imageUrls.map((url, index) => ({
      imageUrl: url,
      thumbnailUrl: url,
      isPrimary: index === 0,
      displayOrder: index,
    }));

    // Also include images from data.images if provided (existing URLs)
    if (data.images && data.images.length > 0) {
      data.images.forEach((img, index) => {
        if (
          typeof img.imageUrl === "string" &&
          !imageUrls.includes(img.imageUrl)
        ) {
          images.push({
            ...img,
            displayOrder: images.length + index,
          });
        }
      });
    }

    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.brandId !== undefined) {
      payload.brandId =
        typeof data.brandId === "string" ? Number(data.brandId) : data.brandId;
    }
    if (data.categoryId !== undefined) payload.categoryId = data.categoryId;
    if (data.price !== undefined) payload.price = data.price;
    if (data.description !== undefined) payload.description = data.description;
    if (data.variants !== undefined) payload.variants = data.variants;
    if (data.attributes !== undefined) payload.attributes = data.attributes;
    if (images.length > 0) payload.images = images;

    return http
      .put<ApiResponse<ProductDTO>>(`${API_ROUTES.PRODUCTS}/${id}`, payload)
      .then((res) => unwrapItem(res));
  },

  /**
   * Xóa product
   * DELETE /api/admin/products/{id}
   */
  deleteProduct: (id: number): Promise<void> => {
    return http
      .delete<ApiResponse<void>>(`${API_ROUTES.PRODUCTS}/${id}`)
      .then(() => undefined);
  },

  /**
   * ===== LEGACY METHODS (Giữ lại cho tương thích) =====
   */
  list: () =>
    http
      .get<ApiResponse<ProductDTO[]>>(API_ROUTES.PRODUCTS)
      .then((res) => unwrapList(res)),
};
