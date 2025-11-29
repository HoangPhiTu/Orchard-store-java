# 📦 Products Management - Complete Development Plan

**Module:** Products Management (Backend + Frontend)  
**Status:** Planning & Development  
**Priority:** High  
**Estimated Time:** 4-5 weeks total

---

## 📋 Executive Summary

### **Overall Assessment: 60% Backend Ready, 20% Frontend Ready**

Products Management là module core của Orchard Store, cần phát triển đầy đủ cả backend APIs và frontend admin interface.

**Current Status:**

- **Backend:** 60% complete - Entities ready, CRUD partial
- **Frontend:** 20% complete - Basic components only
- **Integration:** 0% - Frontend chưa kết nối backend

---

## 🏗️ Architecture Overview

### **Backend (Spring Boot)**

- **Entities:** Product, ProductVariant, ProductImage, ProductSpecification
- **DTOs:** Create/Update/Response DTOs với MapStruct
- **Controllers:** REST APIs với validation
- **Services:** Business logic với interface/implementation pattern
- **Repositories:** JPA với custom queries cho filters

### **Frontend (Next.js)**

- **Pages:** Products list, Product form (create/edit)
- **Components:** Table, Form sections, Gallery, Attributes management
- **Services:** API clients với React Query
- **Types:** TypeScript interfaces
- **Forms:** React Hook Form với Zod validation

---

## 🔧 Backend Development Plan

### **Phase 1: Complete CRUD APIs (Week 1-2)**

#### **1.1 Products Controller**

```java
@RestController
@RequestMapping("/api/admin/products")
public class ProductAdminController {

    @GetMapping
    public Page<ProductDTO> listProducts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String searchTerm,
        @RequestParam(required = false) Long brandId,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) String status
    ) { /* implementation */ }

    @PostMapping
    public ProductDetailDTO createProduct(@Valid @RequestBody ProductCreateRequestDTO request) { /* implementation */ }

    @GetMapping("/{id}")
    public ProductDetailDTO getProduct(@PathVariable Long id) { /* implementation */ }

    @PutMapping("/{id}")
    public ProductDetailDTO updateProduct(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequestDTO request) { /* implementation */ }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) { /* implementation */ }
}
```

#### **1.2 Variants Management**

```java
@RestController
@RequestMapping("/api/admin/products/{productId}/variants")
public class ProductVariantController {

    @GetMapping
    public List<ProductVariantDTO> getVariants(@PathVariable Long productId) { /* implementation */ }

    @PostMapping
    public ProductVariantDTO createVariant(@PathVariable Long productId, @Valid @RequestBody ProductVariantDTO request) { /* implementation */ }

    @PutMapping("/{variantId}")
    public ProductVariantDTO updateVariant(@PathVariable Long productId, @PathVariable Long variantId, @Valid @RequestBody ProductVariantDTO request) { /* implementation */ }

    @DeleteMapping("/{variantId}")
    public void deleteVariant(@PathVariable Long productId, @PathVariable Long variantId) { /* implementation */ }
}
```

#### **1.3 Images Management**

```java
@RestController
@RequestMapping("/api/admin/products/{productId}/images")
public class ProductImageController {

    @GetMapping
    public List<ProductImageDTO> getImages(@PathVariable Long productId) { /* implementation */ }

    @PostMapping
    public ProductImageDTO uploadImage(@PathVariable Long productId, @Valid @RequestBody ProductImageDTO request) { /* implementation */ }

    @PutMapping("/{imageId}")
    public ProductImageDTO updateImage(@PathVariable Long productId, @PathVariable Long imageId, @Valid @RequestBody ProductImageDTO request) { /* implementation */ }

    @DeleteMapping("/{imageId}")
    public void deleteImage(@PathVariable Long productId, @PathVariable Long imageId) { /* implementation */ }

    @PostMapping("/{imageId}/set-primary")
    public ProductImageDTO setPrimaryImage(@PathVariable Long productId, @PathVariable Long imageId) { /* implementation */ }
}
```

### **Phase 2: Advanced Features (Week 2-3)**

#### **2.1 Search & Filters**

- Implement JPA Specifications for complex filters
- Add full-text search with PostgreSQL
- Implement sorting by multiple fields
- Add pagination with metadata

#### **2.2 Bulk Operations**

```java
@PostMapping("/bulk-update")
public BulkUpdateResponse bulkUpdateProducts(@Valid @RequestBody BulkUpdateRequest request) { /* implementation */ }

@PostMapping("/bulk-delete")
public BulkDeleteResponse bulkDeleteProducts(@Valid @RequestBody BulkDeleteRequest request) { /* implementation */ }
```

#### **2.3 Stock Management**

```java
@GetMapping("/{productId}/stock")
public ProductStockDTO getProductStock(@PathVariable Long productId) { /* implementation */ }

@PutMapping("/{productId}/stock")
public ProductStockDTO updateProductStock(@PathVariable Long productId, @Valid @RequestBody StockUpdateRequest request) { /* implementation */ }
```

---

## 🎨 Frontend Development Plan

### **Phase 1: Core Components (Week 2-3)**

#### **1.1 Products List Page**

```typescript
// src/app/admin/products/page.tsx
export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <ProductsHeader />
      <ProductsTableToolbar />
      <ProductsTable />
      <ProductsPagination />
    </div>
  );
}
```

#### **1.2 Products Table Component**

```typescript
// src/components/features/products/product-table.tsx
interface ProductTableProps {
  products: ProductDTO[];
  loading: boolean;
  onEdit: (product: ProductDTO) => void;
  onDelete: (product: ProductDTO) => void;
}

export function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
}: ProductTableProps) {
  // Table implementation with:
  // - Sorting
  // - Pagination
  // - Row selection
  // - Actions (edit, delete, view variants)
}
```

#### **1.3 Product Form Component**

```typescript
// src/components/features/products/product-form-sheet.tsx
interface ProductFormProps {
  product?: ProductDetailDTO;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductFormSheet({
  product,
  open,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const form = useForm<ProductCreateRequestDTO>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {},
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{product ? "Edit Product" : "Create Product"}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info Section */}
            <ProductBasicInfoSection control={form.control} />

            {/* Variants Section */}
            <ProductVariantsSection control={form.control} />

            {/* Images Gallery */}
            <ProductImagesGallery control={form.control} />

            {/* Attributes Section */}
            <ProductAttributesSection control={form.control} />

            {/* Specifications Section */}
            <ProductSpecificationsSection control={form.control} />

            {/* Stock Section */}
            <ProductStockSection control={form.control} />

            <SheetFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {product ? "Update" : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
```

### **Phase 2: Advanced Features (Week 3-4)**

#### **2.1 Variants Management**

```typescript
// src/components/features/products/product-variants-section.tsx
export function ProductVariantsSection({ control }: { control: Control<any> }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Product Variants</CardTitle>
          <Button type="button" onClick={() => append(createEmptyVariant())}>
            <Plus className="mr-2 h-4 w-4" />
            Add Variant
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <ProductVariantForm
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### **2.2 Images Gallery**

```typescript
// src/components/features/products/product-images-gallery.tsx
export function ProductImagesGallery({ control }: { control: Control<any> }) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "images",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
        <CardDescription>
          Upload product images. First image will be set as primary.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fields.map((field, index) => (
            <ProductImageCard
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
              onMoveUp={() => move(index, index - 1)}
              onMoveDown={() => move(index, index + 1)}
              onSetPrimary={() => move(index, 0)}
            />
          ))}

          <ImageUploadCard
            onUpload={(files) => {
              files.forEach((file) => append(createImageFromFile(file)));
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

#### **2.3 Attributes Management**

```typescript
// src/components/features/products/product-attributes-section.tsx
export function ProductAttributesSection({
  control,
}: {
  control: Control<any>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "attributes",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Attributes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <ProductAttributeForm
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
            />
          ))}

          <Button type="button" onClick={() => append(createEmptyAttribute())}>
            <Plus className="mr-2 h-4 w-4" />
            Add Attribute
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🔄 API Integration

### **React Query Hooks**

```typescript
// src/hooks/use-products.ts
export const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create product: " + error.message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductUpdateRequestDTO }) =>
      productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update product: " + error.message);
    },
  });
};
```

### **Service Layer**

```typescript
// src/lib/api/products.service.ts
export const productService = {
  getProducts: (filters: ProductFilters): Promise<Page<ProductDTO>> => {
    return apiClient.get("/admin/products", { params: filters });
  },

  getProduct: (id: number): Promise<ProductDetailDTO> => {
    return apiClient.get(`/admin/products/${id}`);
  },

  createProduct: (data: ProductCreateRequestDTO): Promise<ProductDetailDTO> => {
    return apiClient.post("/admin/products", data);
  },

  updateProduct: (
    id: number,
    data: ProductUpdateRequestDTO
  ): Promise<ProductDetailDTO> => {
    return apiClient.put(`/admin/products/${id}`, data);
  },

  deleteProduct: (id: number): Promise<void> => {
    return apiClient.delete(`/admin/products/${id}`);
  },

  // Variants
  getVariants: (productId: number): Promise<ProductVariantDTO[]> => {
    return apiClient.get(`/admin/products/${productId}/variants`);
  },

  createVariant: (
    productId: number,
    data: ProductVariantDTO
  ): Promise<ProductVariantDTO> => {
    return apiClient.post(`/admin/products/${productId}/variants`, data);
  },

  // Images
  getImages: (productId: number): Promise<ProductImageDTO[]> => {
    return apiClient.get(`/admin/products/${productId}/images`);
  },

  uploadImage: (
    productId: number,
    data: ProductImageDTO
  ): Promise<ProductImageDTO> => {
    return apiClient.post(`/admin/products/${productId}/images`, data);
  },
};
```

---

## 📊 Database Schema

### **Products Table**

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    brand_id BIGINT REFERENCES brands(id),
    category_id BIGINT REFERENCES categories(id),
    base_price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Product Variants Table**

```sql
CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
    weight DECIMAL(8,3),
    length DECIMAL(8,2),
    width DECIMAL(8,2),
    height DECIMAL(8,2),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Product Images Table**

```sql
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing Strategy

### **Backend Tests**

```java
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProductControllerTest {

    @Test
    void shouldCreateProduct() {
        ProductCreateRequestDTO request = createValidProductRequest();

        ResponseEntity<ProductDetailDTO> response = restTemplate.postForEntity(
            "/api/admin/products", request, ProductDetailDTO.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getName()).isEqualTo(request.getName());
    }

    @Test
    void shouldGetProductsList() {
        ResponseEntity<Page<ProductDTO>> response = restTemplate.getForEntity(
            "/api/admin/products?page=0&size=20", new ParameterizedTypeReference<Page<ProductDTO>>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getContent()).isNotEmpty();
    }
}
```

### **Frontend Tests**

```typescript
// src/components/features/products/__tests__/product-table.test.tsx
describe("ProductTable", () => {
  it("should render products list", () => {
    const mockProducts = [createMockProduct(), createMockProduct()];

    render(
      <ProductTable
        products={mockProducts}
        loading={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getAllByRole("row")).toHaveLength(3); // 2 products + header
  });

  it("should handle edit action", () => {
    const onEdit = jest.fn();
    const mockProducts = [createMockProduct()];

    render(
      <ProductTable
        products={mockProducts}
        loading={false}
        onEdit={onEdit}
        onDelete={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith(mockProducts[0]);
  });
});
```

---

## 📈 Performance Considerations

### **Backend Optimizations**

1. **Database Indexing**

   ```sql
   CREATE INDEX idx_products_brand_id ON products(brand_id);
   CREATE INDEX idx_products_category_id ON products(category_id);
   CREATE INDEX idx_products_status ON products(status);
   CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
   ```

2. **Query Optimization**

   - Use JPA Specifications for dynamic queries
   - Implement DTO projection to avoid N+1 problems
   - Use pagination for large datasets

3. **Caching**
   ```java
   @Cacheable(value = "products", key = "#filters.toString()")
   public Page<ProductDTO> getProducts(ProductFilters filters) {
       // implementation
   }
   ```

### **Frontend Optimizations**

1. **React Query Caching**

   - Configure stale time and cache time
   - Implement optimistic updates
   - Use infinite scroll for large lists

2. **Component Optimization**

   - Use React.memo for table rows
   - Implement virtual scrolling for large datasets
   - Debounce search inputs

3. **Bundle Optimization**
   - Code split by routes
   - Lazy load heavy components
   - Optimize image loading

---

## 🚀 Deployment Checklist

### **Backend**

- [ ] All APIs implemented and tested
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] API documentation updated
- [ ] Performance testing completed

### **Frontend**

- [ ] All components implemented
- [ ] API integration working
- [ ] Forms validation working
- [ ] Error handling implemented
- [ ] Responsive design tested

### **Integration**

- [ ] End-to-end testing completed
- [ ] User acceptance testing
- [ ] Performance benchmarks met
- [ ] Security testing passed

---

## 📚 Related Documentation

- [Backend API Reference](./backend/API_REFERENCE.md)
- [Frontend Coding Rules](./frontend/FE_CODING_RULES.md)
- [Database Schema](./backend/DATABASE.md)
- [Admin Dashboard Complete](./ADMIN_DASHBOARD_COMPLETE.md)
- [Main Project README](../README.md)

---

**Last Updated:** November 29, 2025  
**Next Review:** December 13, 2025  
**Responsible:** Full Stack Development Team  
**Repository:** https://github.com/HoangPhiTu/Orchard-store-java-private
