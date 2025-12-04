## Quản lý danh mục – Tổng hợp triển khai

Tài liệu này tổng hợp lại các thay đổi/triển khai liên quan đến **Quản lý danh mục** (Category Management) và **Cấu hình thuộc tính cho danh mục** (Category Attribute Configuration) ở cả backend và dashboard admin.

---

## 1. Backend – Category Attributes

### 1.1. Service triển khai logic thuộc tính danh mục

File: `CategoryAttributeServiceImpl.java`

- **Các chức năng chính:**
  - **`getAttributesByCategory(Long categoryId)`**
    - Lấy danh sách `CategoryAttribute` theo `categoryId`.
    - Map sang `CategoryAttributeDTO` để trả cho API.
  - **`assignAttributeToCategory(CategoryAttributeDTO dto)`**
    - Validate `Category` (`categoryId`) và `ProductAttribute` (`attributeId`) tồn tại.
    - Chặn gán trùng (`existsByCategoryIdAndAttributeId`).
    - Lưu `CategoryAttribute` mới với các metadata:
      - `required` (mặc định `false` nếu null).
      - `displayOrder` (mặc định `0` nếu null).
      - `groupName`.
  - **`removeAttributeFromCategory(Long categoryId, Long attributeId)`**
    - Xóa binding attribute khỏi danh mục, có kiểm tra tồn tại trước.
  - **`updateCategoryAttributeMetadata(Long categoryId, Long attributeId, CategoryAttributeDTO dto)`**
    - Tìm `CategoryAttribute` theo `categoryId` + `attributeId`.
    - Cho phép cập nhật từng phần:
      - `required`.
      - `displayOrder`.
      - `groupName` (trim, chuỗi rỗng → `null`).
  - **`getAttributesForProduct(Long categoryId)`**
    - Lấy toàn bộ `CategoryAttribute` theo cây phân cấp category (dựa vào `path`).
    - Chỉ lấy các `ProductAttribute` có `variantSpecific = false`.
    - Merge theo `attributeId` để loại trùng từ nhiều cấp danh mục.
    - Group theo:
      - `groupName` nếu có và không rỗng.
      - Fallback: `domain` (`PERFUME`, `COSMETICS`, ...) nếu không có `groupName`.
      - Fallback cuối: `"COMMON"`.
    - Sort trong từng group theo `displayOrder` (null đứng sau).
    - Trả về `Map<String, List<ProductAttributeDTO>>` cho Product Form.
  - **`getVariantAttributesForCategory(Long categoryId)`**
    - Tương tự `getAttributesForProduct` nhưng chỉ lấy `variantSpecific = true`.
  - **`getHierarchyCategoryAttributes(Long categoryId)`**
    - Tìm `Category` theo ID, dùng `ResourceNotFoundException("Category", categoryId)`.
    - Xây dựng danh sách `hierarchyIds` từ `path` + `category.id`.
    - Lấy tất cả `CategoryAttribute` của các category trong hierarchy.
    - Sort theo:
      - Độ sâu trong cây (cha trước con).
      - `displayOrder` trong cùng một category.
  - **`buildHierarchyIds(Category category)`**
    - Parse `category.path` dạng `"1/2/3"` thành list ID `[1,2,3]`.
    - Đảm bảo phần tử cuối luôn là `category.id`.

### 1.2. DTO

File: `CategoryAttributeDTO.java`

- Trường dữ liệu:
  - `id`
  - `categoryId`
  - `attributeId`
  - `attributeName`
  - `attributeKey`
  - `required`
  - `displayOrder`
  - `groupName`

### 1.3. API Controller cho category attributes

File: `CategoryAttributeController.java`

- Base path: **`/api/admin/category-attributes`**

- **Lấy danh sách thuộc tính đã gán cho danh mục**

  - `GET /api/admin/category-attributes/{categoryId}`
  - Trả về:
    - `ApiResponse<List<CategoryAttributeDTO>>`
    - Message: `"Lấy danh sách thuộc tính danh mục thành công"`.

- **Gán thuộc tính vào danh mục**

  - `POST /api/admin/category-attributes`
  - Request body: `CategoryAttributeDTO` với `categoryId`, `attributeId`, `required?`, `displayOrder?`, `groupName?`.
  - Trả về:
    - `ApiResponse<CategoryAttributeDTO>`
    - Message: `"Gán thuộc tính cho danh mục thành công"`.

- **Xóa thuộc tính khỏi danh mục**

  - `DELETE /api/admin/category-attributes/{categoryId}/{attributeId}`
  - Trả về:
    - `ApiResponse<Void>`
    - Message: `"Xóa thuộc tính khỏi danh mục thành công"`.

- **Cập nhật metadata của thuộc tính đã gán**

  - `PUT /api/admin/category-attributes/{categoryId}/{attributeId}`
  - Request body: `CategoryAttributeDTO` (chỉ cần các trường cần cập nhật).
  - Trả về:
    - `ApiResponse<CategoryAttributeDTO>`
    - Message: `"Cập nhật thuộc tính danh mục thành công"`.

- **Lấy attributes cho Product Form**

  - `GET /api/admin/category-attributes/{categoryId}/for-product`
  - Trả về:
    - `ApiResponse<Map<String, List<ProductAttributeDTO>>>`
    - Group theo `groupName` hoặc `domain` như mô tả ở trên.

- **Lấy Variant Attributes cho Variant Generator**

  - `GET /api/admin/category-attributes/{categoryId}/for-variants`
  - Trả về:
    - `ApiResponse<List<ProductAttributeDTO>>`

### 1.4. Chuẩn hóa `ResourceNotFoundException`

- Cập nhật chỗ dùng trong `CategoryAttributeServiceImpl`:
  - Từ constructor không tồn tại:
    - `new ResourceNotFoundException("Category", "id", categoryId)`
  - Sang constructor hợp lệ:
    - `new ResourceNotFoundException("Category", categoryId)`

---

## 2. Frontend (Dashboard) – Category Management

### 2.1. Cấu hình route API

File: `src/config/api-routes.ts`

- Khai báo:
  - `CATEGORY_ATTRIBUTES: "/api/admin/category-attributes"`

### 2.2. Service làm việc với API thuộc tính danh mục

File: `src/services/category-attribute.service.ts`

- Sử dụng `http` (axios client) với unwrap `response.data` từ backend.

- **Các hàm chính:**
  - `getCategoryAttributes(categoryId: number): Promise<CategoryAttribute[]>`
    - `GET /api/admin/category-attributes/{categoryId}`
    - Trả về `CategoryAttribute[]` (unwrap từ `ApiResponse`).
  - `assignAttribute(data: Omit<CategoryAttribute, "id" | "attributeName" | "attributeKey">): Promise<CategoryAttribute>`
    - `POST /api/admin/category-attributes`
    - Body: `{ categoryId, attributeId, required?, displayOrder?, groupName? }`
    - Trả về `CategoryAttribute` (unwrap từ `ApiResponse`).
  - `removeAttribute(categoryId: number, attributeId: number): Promise<void>`
    - `DELETE /api/admin/category-attributes/{categoryId}/{attributeId}`
  - `updateAttributeMetadata(categoryId: number, attributeId: number, data: { required?: boolean; displayOrder?: number; groupName?: string }): Promise<CategoryAttribute>`
    - `PUT /api/admin/category-attributes/{categoryId}/{attributeId}`
  - `getAttributesForProduct(categoryId: number): Promise<Record<string, ProductAttribute[]>>`
    - `GET /api/admin/category-attributes/{categoryId}/for-product`
  - `getVariantAttributes(categoryId: number): Promise<ProductAttribute[]>`
    - `GET /api/admin/category-attributes/{categoryId}/for-variants`

### 2.3. Hooks React Query cho category attributes

File: `src/hooks/use-category-attributes.ts`

- **`useCategoryAttributes(categoryId)`**
  - Query key: `["admin", "category-attributes", categoryId]`.
  - Chỉ chạy khi `categoryId > 0`.
  - Xử lý retry, bỏ retry nếu lỗi 400 (Bad Request – category chưa tồn tại).

- **`useAssignCategoryAttribute()`**
  - Mutation dùng `useAppMutation`.
  - Gọi `categoryAttributeService.assignAttribute`.
  - Invalidate query `["admin", "category-attributes"]` sau khi thành công.

- **`useRemoveCategoryAttribute()`**
  - Gọi `categoryAttributeService.removeAttribute`.

- **`useUpdateCategoryAttribute()`**
  - Gọi `categoryAttributeService.updateAttributeMetadata`.

- **`useCategoryAttributesForProduct(categoryId)`**
  - Dùng cho Product Form (dynamic attributes).

- **`useVariantAttributes(categoryId)`**
  - Dùng cho Variant Generator (variant-specific attributes).

### 2.4. UI Cấu hình thuộc tính cho danh mục

File: `src/components/features/catalog/category-form-sheet.tsx`

- **Form chỉnh sửa / tạo danh mục** (`CategoryFormSheet`):
  - Dùng `Tabs` với 2 tab:
    - `"basic"` – thông tin cơ bản của danh mục.
    - `"attributes"` – cấu hình thuộc tính.
  - Theo dõi `attributesCategoryId`:
    - Khởi tạo từ `category?.id`.
    - Cập nhật khi:
      - `category?.id` thay đổi (edit category).
      - `categoryData?.id` thay đổi (sau khi tạo mới thành công).
    - Dùng truyền xuống `CategoryAttributesSection`.
  - Sau khi tạo mới / cập nhật danh mục:
    - Đồng bộ cache React Query (`syncCategoryCaches`).
    - Cập nhật `categoryData` và `attributesCategoryId`.
    - Có logic chuyển sang tab `"attributes"` để người dùng cấu hình thuộc tính ngay sau khi tạo/cập nhật.

### 2.5. Component `CategoryAttributesSection`

File: `src/components/features/catalog/category-attributes-section.tsx`

- **Props:**
  - `categoryId?: number` – ID danh mục đang cấu hình.

- **Hooks sử dụng:**
  - `useCategoryAttributes(categoryId)` – danh sách attributes đã gán.
  - `useAllAttributes()` – danh sách toàn bộ attributes để gán thêm.
  - `useAssignCategoryAttribute()` – gán attribute.
  - `useRemoveCategoryAttribute()` – xóa attribute.
  - `useUpdateCategoryAttribute()` – cập nhật metadata.

- **Các trạng thái UI:**
  - Nếu `!categoryId || categoryId <= 0`:
    - Hiện message: *"Vui lòng lưu category trước khi cấu hình thuộc tính"*.
  - Loading:
    - Spinner khi đang load assigned attributes / all attributes.
  - Error:
    - Nếu lỗi 400 → thông báo *"Category chưa được lưu hoặc không tồn tại..."*.
    - Các lỗi khác → block màu đỏ hiển thị `attributesError.message`.

- **Danh sách thuộc tính đã gán:**
  - Hiển thị từng `CategoryAttribute` với:
    - Tên thuộc tính (`attributeName`) + key (`attributeKey`).
    - Nút xóa (trash) → gọi `useRemoveCategoryAttribute`.
    - Toggle `required` (Switch) → gọi `useUpdateCategoryAttribute`.
    - Input `displayOrder` (number) → gọi `useUpdateCategoryAttribute`.
    - Input `groupName` (text) → gọi `useUpdateCategoryAttribute`.

- **Thêm mới thuộc tính cho danh mục:**
  - Phần **filter Domain**:
    - Tabs: `"ALL"`, `"PERFUME"`, `"COSMETICS"`, `"COMMON"`.
    - Lọc `availableAttributes` theo `domain`.
  - **Command Combobox** (`Command` + `CommandItem` + `Popover`):
    - Tìm kiếm theo `attributeName` / `attributeKey` / domain.
    - Chỉ hiển thị attributes **chưa được gán** (lọc bằng `assignedIds`).
  - **Xử lý click & keyboard:**
    - Hàm `handleAssign(attributeId: number)`:
      - Log debug (hỗ trợ diagnose).
      - Bỏ qua nếu mutation đang pending.
      - Nếu `categoryId` không hợp lệ → warn.
      - Gọi `assignMutation.mutate` với:
        - `categoryId`
        - `attributeId`
        - `required: false`
        - `displayOrder: assignedAttributes?.length ?? 0`
      - Sau khi thành công → đóng popover.
    - **Fix quan trọng** cho UX:
      - Trước đó:
        - Dùng `onSelect` của `CommandItem`, key Enter hoạt động nhưng click chuột không luôn kích hoạt assign (do event bubbling/popover).
      - Hiện tại:
        - Vẫn giữ `onSelect={() => handleAssign(attr.id)}` để hỗ trợ bàn phím.
        - Bổ sung:
          ```tsx
          onMouseDown={(e) => {
            e.preventDefault();      // Ngăn Command xử lý mặc định
            handleAssign(attr.id);   // Bảo đảm click chuột cũng gán thuộc tính
          }}
          ```
        - Thêm guard `if (assignMutation.isPending) return;` để tránh double-call.
      - Kết quả:
        - **Click chuột** và **di chuyển bằng bàn phím + Enter** đều gán thuộc tính bình thường.

---

## 3. Types & Model liên quan tới Category Management

### 3.1. `Category` & `CategoryAttribute` (frontend)

File: `src/types/catalog.types.ts`

- **`Category`**
  - Các trường cơ bản: `id`, `name`, `slug`, `description`, `imageUrl`, `status`, `parentId`, `displayOrder`, `path`, `children`, ...
  - Dùng trong:
    - `CategoryFormSheet`.
    - Trang quản lý danh mục (`/admin/categories`).

- **`CategoryAttribute`**

  ```ts
  export interface CategoryAttribute {
    id?: number;
    categoryId: number;
    attributeId: number;
    attributeName?: string;
    attributeKey?: string;
    required?: boolean;
    displayOrder?: number;
    groupName?: string;
  }
  ```

  - Khớp với `CategoryAttributeDTO` từ backend.
  - Được sử dụng trong:
    - `category-attribute.service.ts`.
    - `use-category-attributes.ts`.
    - `CategoryAttributesSection`.

### 3.2. Validation schema cho Category Form

File: `src/types/catalog.types.ts`

- `categoryFormSchemaBase` + `categoryFormSchema` + `createCategoryFormSchema`.
- Một số điểm chính:
  - `name`: required, min length.
  - `slug`: validate pattern slug, có helper tự sinh từ `name`.
  - `parentId`: cho phép `null`/`undefined`, validate không được chọn chính nó làm cha (`createCategoryFormSchema`).
  - `displayOrder`: số nguyên ≥ 0.
  - `status`: `"ACTIVE"` hoặc `"INACTIVE"`.

---

## 4. Tóm tắt kết quả đạt được

- **Backend**
  - Hoàn thiện service và API chuẩn cho:
    - Gán / xóa / cập nhật metadata thuộc tính danh mục.
    - Lấy attributes cho Product Form (group + sort).
    - Lấy Variant Attributes cho Variant Generator.
  - Chuẩn hóa format response dùng `ApiResponse<T>` cho toàn bộ endpoints category attributes.
  - Sửa lỗi `ResourceNotFoundException` không khớp constructor.

- **Frontend – Dashboard**
  - Tích hợp đầy đủ service + hooks React Query cho category attributes.
  - Cải tiến `CategoryFormSheet`:
    - Tách tab "Thông tin cơ bản" và "Cấu hình thuộc tính".
    - Quản lý chính xác `attributesCategoryId` theo category đang edit/đã tạo.
  - Xây dựng UI `CategoryAttributesSection`:
    - Xem / sửa / xóa các thuộc tính đã gán cho danh mục.
    - Thêm mới thuộc tính với lọc theo domain + search.
    - Cập nhật metadata (`required`, `displayOrder`, `groupName`) realtime.
  - Fix lỗi UX quan trọng:
    - Trước: **chỉ sử dụng được bàn phím + Enter**, click chuột vào thuộc tính không hoạt động.
    - Nay: **click chuột và bàn phím đều hoạt động ổn định**, request gán thuộc tính được gửi chính xác.

Tài liệu này có thể được mở rộng thêm nếu sau này có thay đổi về data model (ví dụ thêm domain mới, thay đổi logic kế thừa thuộc tính theo cây danh mục, v.v.).


