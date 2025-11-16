export interface CategoryDTO {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: number;
  parentName?: string;
  level?: number;
  displayOrder?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  children?: CategoryDTO[];
  createdAt?: string;
  updatedAt?: string;
}

