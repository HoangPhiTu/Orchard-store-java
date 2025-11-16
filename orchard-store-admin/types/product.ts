export interface ProductDTO {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  content?: string;
  brandId: number;
  brandName?: string;
  categoryId: number;
  categoryName?: string;
  basePrice?: number;
  salePrice?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  viewCount?: number;
  soldCount?: number;
  ratingAverage?: number;
  ratingCount?: number;
  displayOrder?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
  images?: ProductImageDTO[];
  variants?: ProductVariantDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImageDTO {
  id?: number;
  productId?: number;
  imageUrl: string;
  thumbnailUrl?: string;
  altText?: string;
  displayOrder?: number;
  isPrimary?: boolean;
  createdAt?: string;
}

export interface ProductVariantDTO {
  id?: number;
  productId?: number;
  sku: string;
  variantName?: string;
  price: number;
  salePrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  reservedQuantity?: number;
  availableQuantity?: number;
  lowStockThreshold?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  displayOrder?: number;
  isDefault?: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  createdAt?: string;
  updatedAt?: string;
}

