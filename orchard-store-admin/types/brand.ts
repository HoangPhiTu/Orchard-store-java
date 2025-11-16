export interface BrandDTO {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  country?: string;
  websiteUrl?: string;
  displayOrder?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

