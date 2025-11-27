# 📦 Products Management - Kế hoạch phát triển

> **Module**: Products Management  
> **Status**: Planning  
> **Priority**: High  
> **Estimated Time**: 3-4 weeks

---

## 📋 Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Phân tích hiện trạng](#2-phân-tích-hiện-trạng)
3. [Database Schema Overview](#3-database-schema-overview)
4. [Requirements](#4-requirements)
5. [UI/UX Design](#5-uiux-design)
6. [API Endpoints](#6-api-endpoints)
7. [Components Architecture](#7-components-architecture)
8. [Implementation Plan](#8-implementation-plan)
9. [Testing Strategy](#9-testing-strategy)
10. [Dependencies & Prerequisites](#10-dependencies--prerequisites)

---

## 1. Tổng quan

### 1.1. Mục tiêu

Xây dựng module quản lý sản phẩm hoàn chỉnh cho admin dashboard, bao gồm:

- Quản lý products (CRUD)
- Quản lý product variants (nhiều biến thể cho mỗi product)
- Quản lý product images (gallery)
- Quản lý product attributes (thuộc tính sản phẩm)
- Quản lý product specifications (thông số kỹ thuật)
- Quản lý stock (tồn kho)
- Tích hợp với Brand và Category

### 1.2. Scope

- ✅ Products list với search, filters, pagination
- ✅ Product form (create/edit) với variants
- ✅ Product images gallery
- ✅ Product attributes management
- ✅ Product specifications
- ✅ Stock management per variant
- ✅ Product status management
- ⚠️ Product translations (Phase 2)
- ⚠️ Product bundles (Phase 2)
- ⚠️ Product gifts (Phase 2)

---

## 2. Phân tích hiện trạng

### 2.1. Đã có sẵn ✅

#### Components

- ✅ `product-card.tsx` - Basic product card component
- ✅ `image-upload.tsx` - Image upload component (cần enhance cho multiple images)
- ✅ `brand-form.tsx` - Brand form (có thể tham khảo pattern)
- ✅ `category-form.tsx` - Category form (có thể tham khảo pattern)

#### Services

- ⚠️ `product.service.ts` - Chỉ có `list()` method, rất cơ bản

#### Types

- ⚠️ `product.types.ts` - Chỉ có `ProductDTO` và `VariantDTO` cơ bản

#### Schemas

- ⚠️ `product.schema.ts` - Schema validation cơ bản, chưa đầy đủ

#### API Routes

- ✅ `API_ROUTES.PRODUCTS = "/api/admin/products"` - Đã có route

### 2.2. Cần phát triển ❌

#### Pages

- ❌ Products list page (`/admin/products`)
- ❌ Product detail page (optional, có thể dùng modal/sheet)

#### Components

- ❌ `product-table.tsx` - Product list table
- ❌ `product-form-sheet.tsx` - Product create/edit form
- ❌ `product-variants-section.tsx` - Variants management section
- ❌ `product-images-gallery.tsx` - Images gallery với drag & drop
- ❌ `product-attributes-section.tsx` - Attributes management
- ❌ `product-specifications-section.tsx` - Specifications management
- ❌ `product-stock-section.tsx` - Stock management per variant
- ❌ `delete-product-dialog.tsx` - Delete confirmation
- ❌ `product-table-toolbar.tsx` - Search, filter, pagination toolbar

#### Services

- ❌ Complete `product.service.ts` với đầy đủ CRUD methods
- ❌ `variant.service.ts` (optional, có thể gộp vào product service)

#### Hooks

- ❌ `use-products.ts` - Products data fetching
- ❌ `use-product.ts` - Single product data fetching
- ❌ `use-product-variants.ts` - Variants management

#### Types

- ❌ Complete `product.types.ts` với đầy đủ types
- ❌ `Product`, `ProductVariant`, `ProductImage`, `ProductAttribute`, `ProductSpecification`

#### Schemas

- ❌ Complete `product.schema.ts` với validation đầy đủ

---

## 3. Database Schema Overview

### 3.1. Core Tables

#### `products` (10 columns)

```sql
- id (BIGINT, PK)
- name (VARCHAR, NOT NULL)
- brand_id (BIGINT, FK -> brands)
- status (VARCHAR, NOT NULL) -- DRAFT, PUBLISHED, ARCHIVED
- published_at (TIMESTAMP)
- archived_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- created_by (BIGINT, FK -> users)
- updated_by (BIGINT, FK -> users)
```

#### `product_variants` (41 columns) - **QUAN TRỌNG**

```sql
- id (BIGINT, PK)
- product_id (BIGINT, FK -> products, NOT NULL)
- variant_name (VARCHAR, NOT NULL)
- sku (VARCHAR, NOT NULL, UNIQUE)
- slug (VARCHAR, NOT NULL)
- price (NUMERIC, NOT NULL)
- sale_price (NUMERIC)
- cost_price (NUMERIC)
- stock_quantity (INTEGER)
- reserved_quantity (INTEGER)
- stock_status (VARCHAR) -- IN_STOCK, OUT_OF_STOCK, LOW_STOCK, BACKORDER
- status (VARCHAR) -- ACTIVE, INACTIVE
- is_default (BOOLEAN) -- Chỉ 1 variant default per product
- manage_inventory (BOOLEAN)
- allow_backorder (BOOLEAN)
- allow_out_of_stock_purchase (BOOLEAN)
- low_stock_threshold (INTEGER)
- short_description (TEXT)
- full_description (TEXT)
- meta_title (VARCHAR)
- meta_description (TEXT)
- category_id (BIGINT, FK -> categories)
- concentration_id (BIGINT, FK -> concentrations)
- tax_class_id (BIGINT, FK -> tax_classes)
- currency_code (VARCHAR)
- weight_grams (NUMERIC)
- weight_unit (VARCHAR)
- volume_ml (INTEGER)
- volume_unit (VARCHAR)
- barcode (VARCHAR)
- concentration_code (VARCHAR)
- cached_attributes (JSONB) -- Cache attributes for performance
- available_from (TIMESTAMP)
- available_to (TIMESTAMP)
- display_order (INTEGER)
- sold_count (INTEGER)
- view_count (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- created_by (BIGINT, FK -> users)
- updated_by (BIGINT, FK -> users)
```

#### `product_images` (13 columns)

```sql
- id (BIGINT, PK)
- product_id (BIGINT, FK -> products, NOT NULL)
- product_variant_id (BIGINT, FK -> product_variants) -- NULL = product-level image
- image_url (VARCHAR, NOT NULL)
- thumbnail_url (VARCHAR)
- alt_text (VARCHAR)
- is_primary (BOOLEAN) -- Chỉ 1 primary image per product/variant
- image_type (VARCHAR) -- MAIN, GALLERY, THUMBNAIL
- display_order (INTEGER)
- width (INTEGER)
- height (INTEGER)
- file_size_bytes (BIGINT)
- created_at (TIMESTAMP)
```

#### `product_attributes` (11 columns)

```sql
- id (BIGINT, PK)
- product_id (BIGINT, FK -> products, NOT NULL)
- product_variant_id (BIGINT, FK -> product_variants) -- NULL = product-level attribute
- attribute_type_id (BIGINT, FK -> attribute_types, NOT NULL)
- attribute_option_id (BIGINT, FK -> attribute_options)
- scope (VARCHAR, NOT NULL) -- PRODUCT, VARIANT
- custom_value (TEXT)
- numeric_value (NUMERIC)
- is_primary (BOOLEAN)
- display_order (INTEGER)
- created_at (TIMESTAMP)
```

#### `product_specifications` (6 columns)

```sql
- id (BIGINT, PK)
- product_id (BIGINT, FK -> products, NOT NULL)
- specification_key (VARCHAR, NOT NULL)
- specification_value (TEXT, NOT NULL)
- display_order (INTEGER, NOT NULL)
- created_at (TIMESTAMP)
```

### 3.2. Related Tables

#### `warehouse_stock` (6 columns)

```sql
- id (BIGINT, PK)
- product_variant_id (BIGINT, FK -> product_variants, NOT NULL)
- warehouse_id (BIGINT, FK -> warehouses, NOT NULL)
- quantity (INTEGER, NOT NULL)
- reserved_quantity (INTEGER)
- updated_at (TIMESTAMP)
```

#### `product_stats` (7 columns)

```sql
- product_id (BIGINT, PK, FK -> products)
- average_rating (DECIMAL(3,2))
- total_reviews (INTEGER)
- total_verified_reviews (INTEGER)
- total_sold (INTEGER)
- total_views (INTEGER)
- last_calculated_at (TIMESTAMP)
```

### 3.3. Relationships

```
products (1) ──< (N) product_variants
products (1) ──< (N) product_images
products (1) ──< (N) product_attributes
products (1) ──< (N) product_specifications
products (1) ──< (1) product_stats

product_variants (1) ──< (N) product_images
product_variants (1) ──< (N) product_attributes
product_variants (1) ──< (N) warehouse_stock

brands (1) ──< (N) products
categories (1) ──< (N) product_variants
```

---

## 4. Requirements

### 4.1. Functional Requirements

#### Products List Page

- [ ] Display products với pagination (20 items per page)
- [ ] Search products (name, SKU, brand, category)
- [ ] Filter by:
  - Status (DRAFT, PUBLISHED, ARCHIVED)
  - Brand
  - Category
  - Stock status (IN_STOCK, OUT_OF_STOCK, LOW_STOCK)
- [ ] Sort by:
  - Name (A-Z, Z-A)
  - Created date (newest, oldest)
  - Price (low to high, high to low)
  - Stock quantity
- [ ] Actions per product:
  - View details
  - Edit
  - Delete
  - Duplicate
- [ ] Bulk actions:
  - Bulk status update
  - Bulk delete
  - Bulk export

#### Product Form (Create/Edit)

- [ ] Basic Information:
  - Product name (required)
  - Brand (required, dropdown)
  - Slug (auto-generate từ name, editable)
  - Status (DRAFT, PUBLISHED, ARCHIVED)
  - Published date
- [ ] Variants Section:
  - Add/Edit/Delete variants
  - Variant name (required)
  - SKU (required, unique)
  - Price (required)
  - Sale price (optional)
  - Cost price (optional)
  - Stock quantity
  - Stock status
  - Is default variant (radio button, chỉ 1 default)
  - Manage inventory toggle
  - Allow backorder toggle
  - Low stock threshold
  - Category (optional, per variant)
  - Tax class (optional)
  - Weight & Volume
  - Barcode
  - Short description
  - Full description
  - Meta title & description
- [ ] Images Section:
  - Upload multiple images
  - Drag & drop để sắp xếp
  - Set primary image
  - Delete image
  - Image preview
  - Variant-specific images (optional)
- [ ] Attributes Section:
  - Add/Edit/Delete attributes
  - Select attribute type
  - Select attribute option (hoặc custom value)
  - Product-level hoặc Variant-level
  - Mark as primary attribute
- [ ] Specifications Section:
  - Add/Edit/Delete specifications
  - Key-Value pairs
  - Drag & drop để sắp xếp
- [ ] Stock Section (per variant):
  - View stock per warehouse
  - Update stock quantity
  - View reserved quantity
  - Stock alerts

### 4.2. Non-Functional Requirements

- **Performance**:
  - Lazy load images
  - Virtual scrolling cho large lists
  - Optimistic updates
- **UX**:
  - Auto-save draft (optional)
  - Form validation với clear error messages
  - Loading states
  - Confirmation dialogs cho destructive actions
- **Accessibility**:
  - Keyboard navigation
  - ARIA labels
  - Screen reader support

---

## 5. UI/UX Design

### 5.1. Products List Page

```
┌─────────────────────────────────────────────────────────────┐
│ Products Management                                          │
│ Manage all products in the store                            │
├─────────────────────────────────────────────────────────────┤
│ [Search...] [Status: All ▼] [Brand: All ▼] [+ Add Product] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Name        │ Brand │ Variants │ Stock │ Status │ Actions│ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Product 1   │ Brand │ 3        │ 150   │ Active │ [⋮]   │ │
│ │ Product 2   │ Brand │ 1        │ 0     │ Draft  │ [⋮]   │ │
│ │ ...         │ ...   │ ...      │ ...   │ ...    │ ...   │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [< 1 2 3 ... 10 >]                                          │
└─────────────────────────────────────────────────────────────┘
```

### 5.2. Product Form Sheet

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Product                                    [X]          │
├─────────────────────────────────────────────────────────────┤
│ [Basic Info] [Variants] [Images] [Attributes] [Specs] [Stock]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Product Name *                                              │
│  [___________________________]                              │
│                                                              │
│  Brand *                                                      │
│  [Select Brand ▼]                                            │
│                                                              │
│  Slug                                                         │
│  [product-name-slug]                                         │
│                                                              │
│  Status                                                       │
│  [○] Draft  [●] Published  [○] Archived                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Variants (3)                                          │  │
│  │ ┌──────────────────────────────────────────────────┐ │  │
│  │ │ Variant 1 (Default)                              │ │  │
│  │ │ SKU: PROD-001 | Price: $29.99 | Stock: 150       │ │  │
│  │ │ [Edit] [Delete]                                  │ │  │
│  │ └──────────────────────────────────────────────────┘ │  │
│  │ [+ Add Variant]                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Images (5)                                           │  │
│  │ [🖼️] [🖼️] [🖼️] [🖼️] [🖼️] [+ Add Image]            │  │
│  │ Primary: First image                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [Cancel] [Save Draft] [Publish]                            │
└─────────────────────────────────────────────────────────────┘
```

### 5.3. Design Patterns

- **Follow existing patterns**: Brand và Category management
- **Consistent styling**: Sử dụng cùng UI components (Sheet, FormField, Badge, etc.)
- **Status badges**: Đồng bộ với User/Brand/Category
- **Form layout**: Tabs cho các sections (Basic, Variants, Images, etc.)

---

## 6. API Endpoints

### 6.1. Products Endpoints

```typescript
// List products với filters
GET /api/admin/products
Query params:
  - page: number (default: 0)
  - size: number (default: 20)
  - keyword?: string (search name, SKU)
  - status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  - brandId?: number
  - categoryId?: number
  - stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK'
  - sortBy?: 'name' | 'createdAt' | 'price' | 'stock'
  - direction?: 'ASC' | 'DESC'

Response: ApiResponse<Page<ProductDTO>>

// Get single product với đầy đủ details
GET /api/admin/products/{id}
Response: ApiResponse<ProductDetailDTO>

// Create product
POST /api/admin/products
Body: CreateProductRequestDTO
Response: ApiResponse<ProductDetailDTO>

// Update product
PUT /api/admin/products/{id}
Body: UpdateProductRequestDTO
Response: ApiResponse<ProductDetailDTO>

// Delete product
DELETE /api/admin/products/{id}
Response: ApiResponse<void>

// Bulk operations
POST /api/admin/products/bulk-status
Body: { productIds: number[], status: string }
Response: ApiResponse<void>

POST /api/admin/products/bulk-delete
Body: { productIds: number[] }
Response: ApiResponse<void>
```

### 6.2. Product Variants Endpoints

```typescript
// Get variants của một product
GET /api/admin/products/{productId}/variants
Response: ApiResponse<ProductVariantDTO[]>

// Create variant
POST /api/admin/products/{productId}/variants
Body: CreateVariantRequestDTO
Response: ApiResponse<ProductVariantDTO>

// Update variant
PUT /api/admin/products/{productId}/variants/{variantId}
Body: UpdateVariantRequestDTO
Response: ApiResponse<ProductVariantDTO>

// Delete variant
DELETE /api/admin/products/{productId}/variants/{variantId}
Response: ApiResponse<void>

// Set default variant
PATCH /api/admin/products/{productId}/variants/{variantId}/set-default
Response: ApiResponse<void>
```

### 6.3. Product Images Endpoints

```typescript
// Get images của một product
GET /api/admin/products/{productId}/images
Response: ApiResponse<ProductImageDTO[]>

// Upload image
POST /api/admin/products/{productId}/images
Body: FormData (file, isPrimary, displayOrder, variantId?)
Response: ApiResponse<ProductImageDTO>

// Update image (reorder, set primary)
PUT /api/admin/products/{productId}/images/{imageId}
Body: UpdateImageRequestDTO
Response: ApiResponse<ProductImageDTO>

// Delete image
DELETE /api/admin/products/{productId}/images/{imageId}
Response: ApiResponse<void>
```

### 6.4. Product Attributes Endpoints

```typescript
// Get attributes của một product
GET /api/admin/products/{productId}/attributes
Query params:
  - variantId?: number (nếu muốn lấy attributes của variant)
Response: ApiResponse<ProductAttributeDTO[]>

// Create attribute
POST /api/admin/products/{productId}/attributes
Body: CreateAttributeRequestDTO
Response: ApiResponse<ProductAttributeDTO>

// Update attribute
PUT /api/admin/products/{productId}/attributes/{attributeId}
Body: UpdateAttributeRequestDTO
Response: ApiResponse<ProductAttributeDTO>

// Delete attribute
DELETE /api/admin/products/{productId}/attributes/{attributeId}
Response: ApiResponse<void>
```

### 6.5. Product Specifications Endpoints

```typescript
// Get specifications của một product
GET /api/admin/products/{productId}/specifications
Response: ApiResponse<ProductSpecificationDTO[]>

// Create specification
POST /api/admin/products/{productId}/specifications
Body: CreateSpecificationRequestDTO
Response: ApiResponse<ProductSpecificationDTO>

// Update specification
PUT /api/admin/products/{productId}/specifications/{specId}
Body: UpdateSpecificationRequestDTO
Response: ApiResponse<ProductSpecificationDTO>

// Delete specification
DELETE /api/admin/products/{productId}/specifications/{specId}
Response: ApiResponse<void>

// Reorder specifications
PATCH /api/admin/products/{productId}/specifications/reorder
Body: { specificationIds: number[] }
Response: ApiResponse<void>
```

### 6.6. Stock Endpoints

```typescript
// Get stock của một variant
GET / api / admin / products / { productId } / variants / { variantId } / stock;
Response: ApiResponse<WarehouseStockDTO[]>;

// Update stock
PUT / api / admin / products / { productId } / variants / { variantId } / stock;
Body: UpdateStockRequestDTO;
Response: ApiResponse<WarehouseStockDTO>;
```

---

## 7. Components Architecture

### 7.1. Component Tree

```
ProductsManagementPage
├── ProductTableToolbar
│   ├── SearchInput
│   ├── StatusFilter
│   ├── BrandFilter
│   ├── CategoryFilter
│   └── AddProductButton
├── ProductTable
│   ├── ProductTableRow
│   │   ├── ProductInfo
│   │   ├── BrandBadge
│   │   ├── VariantsCount
│   │   ├── StockStatus
│   │   ├── StatusBadge
│   │   └── ActionsDropdown
│   └── BulkActionsBar
└── DataTablePagination

ProductFormSheet
├── Tabs
│   ├── BasicInfoTab
│   │   ├── ProductNameField
│   │   ├── BrandSelect
│   │   ├── SlugField
│   │   └── StatusRadio
│   ├── VariantsTab
│   │   ├── VariantsList
│   │   │   └── VariantCard
│   │   │       ├── VariantForm
│   │   │       └── VariantActions
│   │   └── AddVariantButton
│   ├── ImagesTab
│   │   ├── ImagesGallery
│   │   │   └── ImageCard (draggable)
│   │   └── ImageUpload
│   ├── AttributesTab
│   │   ├── AttributesList
│   │   │   └── AttributeForm
│   │   └── AddAttributeButton
│   ├── SpecificationsTab
│   │   ├── SpecificationsList
│   │   │   └── SpecificationRow (draggable)
│   │   └── AddSpecificationButton
│   └── StockTab
│       ├── StockPerWarehouse
│       └── StockUpdateForm
└── FormFooter
    ├── CancelButton
    ├── SaveDraftButton
    └── PublishButton
```

### 7.2. Component Files

```
src/components/features/product/
├── product-table.tsx
├── product-table-toolbar.tsx
├── product-table-row.tsx
├── product-form-sheet.tsx
├── product-basic-info-tab.tsx
├── product-variants-tab.tsx
├── product-variant-card.tsx
├── product-variant-form.tsx
├── product-images-tab.tsx
├── product-images-gallery.tsx
├── product-image-card.tsx
├── product-attributes-tab.tsx
├── product-attribute-form.tsx
├── product-specifications-tab.tsx
├── product-specification-row.tsx
├── product-stock-tab.tsx
├── product-stock-warehouse-card.tsx
├── delete-product-dialog.tsx
└── duplicate-product-dialog.tsx
```

---

## 8. Implementation Plan

### Phase 1: Foundation (Week 1)

#### Day 1-2: Types & Schemas

- [ ] **Types** (`src/types/product.types.ts`)
  - [ ] `Product` interface
  - [ ] `ProductVariant` interface
  - [ ] `ProductImage` interface
  - [ ] `ProductAttribute` interface
  - [ ] `ProductSpecification` interface
  - [ ] `ProductFilters` interface
  - [ ] `CreateProductRequestDTO`
  - [ ] `UpdateProductRequestDTO`
  - [ ] `CreateVariantRequestDTO`
  - [ ] `UpdateVariantRequestDTO`
- [ ] **Schemas** (`src/lib/schemas/product.schema.ts`)
  - [ ] `productFormSchema` với Zod validation
  - [ ] `variantFormSchema`
  - [ ] `imageFormSchema`
  - [ ] `attributeFormSchema`
  - [ ] `specificationFormSchema`

#### Day 3-4: Services & Hooks

- [ ] **Service** (`src/services/product.service.ts`)
  - [ ] `getProducts(filters)` - List với filters
  - [ ] `getProduct(id)` - Single product
  - [ ] `createProduct(data)` - Create
  - [ ] `updateProduct(id, data)` - Update
  - [ ] `deleteProduct(id)` - Delete
  - [ ] `bulkUpdateStatus(ids, status)` - Bulk status
  - [ ] `bulkDelete(ids)` - Bulk delete
  - [ ] `getVariants(productId)` - Get variants
  - [ ] `createVariant(productId, data)` - Create variant
  - [ ] `updateVariant(productId, variantId, data)` - Update variant
  - [ ] `deleteVariant(productId, variantId)` - Delete variant
  - [ ] `setDefaultVariant(productId, variantId)` - Set default
  - [ ] `getImages(productId)` - Get images
  - [ ] `uploadImage(productId, file, data)` - Upload image
  - [ ] `updateImage(productId, imageId, data)` - Update image
  - [ ] `deleteImage(productId, imageId)` - Delete image
  - [ ] `getAttributes(productId, variantId?)` - Get attributes
  - [ ] `createAttribute(productId, data)` - Create attribute
  - [ ] `updateAttribute(productId, attributeId, data)` - Update attribute
  - [ ] `deleteAttribute(productId, attributeId)` - Delete attribute
  - [ ] `getSpecifications(productId)` - Get specifications
  - [ ] `createSpecification(productId, data)` - Create specification
  - [ ] `updateSpecification(productId, specId, data)` - Update specification
  - [ ] `deleteSpecification(productId, specId)` - Delete specification
  - [ ] `reorderSpecifications(productId, specIds)` - Reorder
  - [ ] `getStock(productId, variantId)` - Get stock
  - [ ] `updateStock(productId, variantId, data)` - Update stock
- [ ] **Hooks** (`src/hooks/use-products.ts`)
  - [ ] `useProducts(filters)` - List với TanStack Query
  - [ ] `useProduct(id)` - Single product
  - [ ] `useCreateProduct()` - Create mutation
  - [ ] `useUpdateProduct()` - Update mutation
  - [ ] `useDeleteProduct()` - Delete mutation
  - [ ] `useBulkUpdateStatus()` - Bulk status mutation
  - [ ] `useBulkDelete()` - Bulk delete mutation
- [ ] **Hooks** (`src/hooks/use-product-variants.ts`)
  - [ ] `useProductVariants(productId)` - Get variants
  - [ ] `useCreateVariant()` - Create variant mutation
  - [ ] `useUpdateVariant()` - Update variant mutation
  - [ ] `useDeleteVariant()` - Delete variant mutation
  - [ ] `useSetDefaultVariant()` - Set default mutation

#### Day 5: API Routes Configuration

- [ ] **Update** (`src/config/api-routes.ts`)
  - [ ] Thêm các routes cho products, variants, images, attributes, specifications, stock

### Phase 2: Products List Page (Week 2)

#### Day 1-2: Table Components

- [ ] **ProductTableToolbar** (`product-table-toolbar.tsx`)
  - [ ] Search input
  - [ ] Status filter dropdown
  - [ ] Brand filter dropdown
  - [ ] Category filter dropdown
  - [ ] Add Product button
- [ ] **ProductTable** (`product-table.tsx`)
  - [ ] Table structure
  - [ ] Columns: Name, Brand, Variants, Stock, Status, Actions
  - [ ] Loading state
  - [ ] Empty state
  - [ ] Error state
- [ ] **ProductTableRow** (`product-table-row.tsx`)
  - [ ] Product info display
  - [ ] Brand badge
  - [ ] Variants count
  - [ ] Stock status badge
  - [ ] Status badge
  - [ ] Actions dropdown (View, Edit, Duplicate, Delete)

#### Day 3: Products List Page

- [ ] **ProductsManagementPage** (`src/app/admin/products/page.tsx`)
  - [ ] State management (search, filters, pagination)
  - [ ] Integrate ProductTableToolbar
  - [ ] Integrate ProductTable
  - [ ] Integrate DataTablePagination
  - [ ] Handle actions (edit, delete, duplicate)

#### Day 4-5: Enhancements

- [ ] **Bulk Actions**
  - [ ] Checkbox selection
  - [ ] Bulk status update
  - [ ] Bulk delete
- [ ] **Delete Dialog** (`delete-product-dialog.tsx`)
  - [ ] Confirmation dialog
  - [ ] Warning message
- [ ] **Duplicate Dialog** (`duplicate-product-dialog.tsx`)
  - [ ] Duplicate confirmation
  - [ ] Options (duplicate variants, images, etc.)

### Phase 3: Product Form - Basic & Variants (Week 3)

#### Day 1-2: Basic Info Tab

- [ ] **ProductFormSheet** (`product-form-sheet.tsx`)
  - [ ] Sheet structure
  - [ ] Tabs navigation
  - [ ] Form state management
  - [ ] Submit handlers
- [ ] **ProductBasicInfoTab** (`product-basic-info-tab.tsx`)
  - [ ] Product name field
  - [ ] Brand select (dropdown với search)
  - [ ] Slug field (auto-generate, editable)
  - [ ] Status radio buttons
  - [ ] Published date picker

#### Day 3-4: Variants Tab

- [ ] **ProductVariantsTab** (`product-variants-tab.tsx`)
  - [ ] Variants list display
  - [ ] Add variant button
  - [ ] Variant management logic
- [ ] **ProductVariantCard** (`product-variant-card.tsx`)
  - [ ] Variant info display
  - [ ] Edit/Delete buttons
  - [ ] Default badge
- [ ] **ProductVariantForm** (`product-variant-form.tsx`)
  - [ ] Variant form fields:
    - Variant name
    - SKU (unique validation)
    - Price, Sale price, Cost price
    - Stock quantity
    - Stock status
    - Is default (radio)
    - Manage inventory toggle
    - Allow backorder toggle
    - Low stock threshold
    - Category select
    - Tax class select
    - Weight & Volume
    - Barcode
    - Short description
    - Full description
    - Meta title & description

#### Day 5: Variants Logic

- [ ] **Variant Management**
  - [ ] Add variant
  - [ ] Edit variant
  - [ ] Delete variant
  - [ ] Set default variant (chỉ 1 default)
  - [ ] Validation (SKU unique, price > 0, etc.)

### Phase 4: Product Form - Images, Attributes, Specs, Stock (Week 4)

#### Day 1: Images Tab

- [ ] **ProductImagesTab** (`product-images-tab.tsx`)
  - [ ] Images gallery display
  - [ ] Upload button
- [ ] **ProductImagesGallery** (`product-images-gallery.tsx`)
  - [ ] Grid layout
  - [ ] Drag & drop reordering
  - [ ] Primary image indicator
  - [ ] Delete image
- [ ] **ProductImageCard** (`product-image-card.tsx`)
  - [ ] Image preview
  - [ ] Primary badge
  - [ ] Delete button
  - [ ] Drag handle
- [ ] **Image Upload**
  - [ ] Multiple file upload
  - [ ] Progress indicator
  - [ ] Preview before upload

#### Day 2: Attributes Tab

- [ ] **ProductAttributesTab** (`product-attributes-tab.tsx`)
  - [ ] Attributes list
  - [ ] Add attribute button
- [ ] **ProductAttributeForm** (`product-attribute-form.tsx`)
  - [ ] Attribute type select
  - [ ] Attribute option select (hoặc custom value)
  - [ ] Scope select (PRODUCT/VARIANT)
  - [ ] Variant select (nếu scope = VARIANT)
  - [ ] Is primary checkbox
  - [ ] Display order

#### Day 3: Specifications Tab

- [ ] **ProductSpecificationsTab** (`product-specifications-tab.tsx`)
  - [ ] Specifications list
  - [ ] Add specification button
- [ ] **ProductSpecificationRow** (`product-specification-row.tsx`)
  - [ ] Key input
  - [ ] Value input
  - [ ] Drag handle (reorder)
  - [ ] Delete button

#### Day 4: Stock Tab

- [ ] **ProductStockTab** (`product-stock-tab.tsx`)
  - [ ] Variant select
  - [ ] Stock per warehouse display
- [ ] **ProductStockWarehouseCard** (`product-stock-warehouse-card.tsx`)
  - [ ] Warehouse name
  - [ ] Quantity display
  - [ ] Reserved quantity
  - [ ] Available quantity
  - [ ] Update stock form

#### Day 5: Integration & Testing

- [ ] **Form Integration**
  - [ ] Connect all tabs
  - [ ] Form validation
  - [ ] Submit handler
  - [ ] Error handling
- [ ] **Testing**
  - [ ] Create product flow
  - [ ] Edit product flow
  - [ ] Delete product flow
  - [ ] Variants management
  - [ ] Images upload
  - [ ] Attributes management
  - [ ] Specifications management

---

## 9. Testing Strategy

### 9.1. Unit Tests

- [ ] Form validation schemas
- [ ] Service methods
- [ ] Utility functions

### 9.2. Integration Tests

- [ ] Products list với filters
- [ ] Create product flow
- [ ] Update product flow
- [ ] Delete product flow
- [ ] Variants CRUD
- [ ] Images upload & management
- [ ] Attributes CRUD
- [ ] Specifications CRUD

### 9.3. E2E Tests (Optional)

- [ ] Complete product creation flow
- [ ] Product editing flow
- [ ] Bulk operations

---

## 10. Dependencies & Prerequisites

### 10.1. Backend Requirements

- [ ] Backend APIs phải sẵn sàng (theo spec ở section 6)
- [ ] Image upload endpoint (`POST /api/admin/upload`)
- [ ] Attribute types & options endpoints (nếu cần)

### 10.2. Frontend Dependencies

- ✅ TanStack Query (đã có)
- ✅ React Hook Form (đã có)
- ✅ Zod (đã có)
- ✅ Shadcn/ui components (đã có)
- ⚠️ **Drag & Drop**: Cần thêm `@dnd-kit/core` và `@dnd-kit/sortable` cho image/spec reordering
- ⚠️ **Date Picker**: Có thể cần thêm date picker component

### 10.3. External Services

- ✅ MinIO/S3 cho image upload (đã có)
- ✅ Supabase database (đã có)

---

## 11. Notes & Considerations

### 11.1. Performance

- **Lazy Loading**: Load variants, images, attributes khi cần (khi mở tab)
- **Optimistic Updates**: Update UI trước khi API response
- **Debouncing**: Debounce search input
- **Virtual Scrolling**: Cho products list lớn (nếu cần)

### 11.2. UX Improvements

- **Auto-save Draft**: Tự động lưu draft khi user đang edit (optional)
- **Form Validation**: Real-time validation với clear error messages
- **Loading States**: Skeleton loaders cho better UX
- **Confirmation Dialogs**: Cho tất cả destructive actions

### 11.3. Edge Cases

- **No Variants**: Product phải có ít nhất 1 variant
- **Default Variant**: Phải có đúng 1 default variant
- **SKU Uniqueness**: Validate SKU unique khi create/update
- **Image Limits**: Giới hạn số lượng images (ví dụ: 10 images max)
- **Stock Sync**: Sync stock giữa variant và warehouse_stock

### 11.4. Future Enhancements (Phase 2)

- Product translations (multi-language)
- Product bundles
- Product gifts
- Product comparisons
- Product analytics
- Bulk import/export (CSV, Excel)

---

## 12. Checklist Summary

### Phase 1: Foundation

- [ ] Types & Schemas
- [ ] Services & Hooks
- [ ] API Routes Configuration

### Phase 2: Products List

- [ ] Table Components
- [ ] Products List Page
- [ ] Bulk Actions
- [ ] Delete/Duplicate Dialogs

### Phase 3: Product Form - Basic & Variants

- [ ] Basic Info Tab
- [ ] Variants Tab
- [ ] Variant Management Logic

### Phase 4: Product Form - Images, Attributes, Specs, Stock

- [ ] Images Tab
- [ ] Attributes Tab
- [ ] Specifications Tab
- [ ] Stock Tab
- [ ] Integration & Testing

---

**Estimated Total Time**: 3-4 weeks (120-160 hours)

**Priority**: High

**Dependencies**: Backend APIs phải sẵn sàng

---

**Last Updated**: 2024  
**Status**: Planning
