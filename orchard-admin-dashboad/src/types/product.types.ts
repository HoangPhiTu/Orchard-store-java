export interface ProductDTO {
  id: number;
  name: string;
  slug: string;
  primaryImageUrl?: string;
  priceRange?: [number, number];
}

export interface VariantDTO {
  id: number;
  sku: string;
  price: number;
  stock: number;
}
