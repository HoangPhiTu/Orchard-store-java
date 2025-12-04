export interface ProductImageDTO {
  id?: number;
  productId?: number;
  productVariantId?: number;
  imageUrl: string;
  thumbnailUrl?: string;
  altText?: string;
  imageType?: string;
  fileSizeBytes?: number;
  width?: number;
  height?: number;
  displayOrder?: number;
  isPrimary?: boolean;
  createdAt?: string;
}

export interface ProductDTO {
  id: number;
  name: string;
  slug: string;
  primaryImageUrl?: string;
  thumbnailUrl?: string;
  priceRange?: [number, number];
  brandId?: number;
  brandName?: string;
  categoryId?: number;
  categoryName?: string;
  price?: number;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "DRAFT" | "UNDER_REVIEW" | "ARCHIVED";
  createdAt?: string;
  updatedAt?: string;
  attributes?: Record<string, any>;
  variants?: VariantDTO[];
  images?: ProductImageDTO[];
}

export interface VariantDTO {
  id?: number;
  sku: string;
  price: number;
  stock?: number;
  stockQuantity?: number; // Backend field name
  isEnabled?: boolean;
  imageUrl?: string;
  variantName?: string; // Tên variant (bắt buộc ở backend)
  attributes?: Record<string, string>;
  cachedAttributes?: Record<string, any>;
}

export interface ProductFilter {
  keyword?: string;
  status?: "ACTIVE" | "INACTIVE";
  brandId?: number;
  categoryId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}

export interface ProductFormData {
  name: string;
  brandId: number | string;
  categoryId?: number | null;
  price: number;
  description?: string;
  variants?: VariantDTO[];
  attributes?: Record<string, any>;
  images?: ProductImageDTO[];
  thumbnail?: File | string | null; // File mới hoặc URL ảnh cũ
  detailImages?: (File | string)[]; // Danh sách ảnh chi tiết
}
