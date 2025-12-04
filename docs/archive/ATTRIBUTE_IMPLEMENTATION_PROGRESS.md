# Báo cáo tiến độ Attribute

## 1. Bối cảnh

Tài liệu này ghi nhận tiến độ các hạng mục liên quan đến hệ thống Attribute trong kế hoạch `PERFUME_COSMETICS_DATA_MODEL_REFACTOR_PLAN.md`. Mục tiêu: đảm bảo các thay đổi được theo dõi rõ ràng, dễ kiểm tra, và biết rõ phần nào đã làm, phần nào còn lại.

## 2. Hạng mục đã hoàn thành

### 2.1 Form & UX quản lý Attribute

- `AttributeFormSheet` đã được giản lược theo yêu cầu: chỉ giữ các trường quan trọng, đồng bộ domain PERFUME/COSMETICS/COMMON, tự sinh `attributeKey`, auto copy `displayValue` → `value`, hỗ trợ Image Upload/Color cho option.
- `DeleteAttributeDialog` sử dụng đúng key i18n (`admin.dialogs.cancel`, `admin.common.delete`, `admin.common.loading`) và thêm UX tương tự Delete Brand (icon, overlay).

### 2.2 Dynamic Attribute trong Product Form

- Product Form có tab “Đặc tính sản phẩm” gọi `DynamicAttributesSection`, render theo `group_name` (hoặc domain fallback) thông qua `useDynamicAttributes` + `generateProductFormSchemaWithAttributes`.
- Backend cung cấp API `/api/admin/category-attributes/{categoryId}/for-product` (trước đây đã có) để trả về các attribute non-variant, kèm metadata (`required`, `displayOrder`, `groupName`).

### 2.3 Variant Generator – Phase 1 (Manual-first)

- Thêm API mới `/api/admin/category-attributes/{categoryId}/for-variants` trả về danh sách thuộc tính `variantSpecific = true`. Service `CategoryAttributeServiceImpl` lọc và map sang `ProductAttributeDTO` để FE dùng.
- FE bổ sung `VariantAttributeSelector`:
  - Lấy dữ liệu qua `useVariantAttributes` (React Query).
  - Admin chọn các giá trị thực tế từ chính Attribute Value (VD: `dung_tich`, `loai_hang`, `mau_sac`). Có badge, swatch màu (`next/image`) và nút xóa lựa chọn.
  - Kết quả feed thẳng vào `VariantMatrix` → sinh SKU bằng `generateVariantCombinations` + `generateSku`, có cột `imageUrl`, `isEnabled`, apply price/stock hàng loạt.
- `ProductFormSheet` được refactor để:
  - Reset `variantSelections` khi đổi Category/lúc đóng form.
  - Tab “Biến thể” = `VariantAttributeSelector` + `VariantMatrix`. Không còn CSV tạm.

### 2.4 Database Schema & Seed

- Flyway migrations V16–V19 đã chạy:
  - V16: thêm `image_url` vào `product_variants`, thêm `is_filterable` vào `attribute_types`, index GIN cho JSONB.
  - V17–V19: seed full bộ Perfume/Cosmetics/Common (`nong_do`, `nhom_huong`, `huong_dau/giua/cuoi`, `dung_tich`, `loai_hang`, `mau_sac`, `loai_da`, `gioi_tinh`, …).
  - V18: chuẩn bị script migrate module Concentration → Attribute System (chưa chạy chính thức).
- Entities / DTO (`ProductVariant`, `ProductVariantDTO`, `ProductAttributeDTO`) đã thêm `imageUrl`, `attributes` fields tương ứng.

### 2.5 UI Group đặc biệt – “Tầng hương”

- `AttributeGroup` nhận diện group có tên chứa “tầng hương”/“scent pyramid”.
- Component mới `ScentPyramidGroup` trình bày 3 cột Hương đầu – Hương giữa – Hương cuối, dùng chung `DynamicAttributeRenderer`, giúp nhập liệu trực quan đúng như plan.
- Những attribute khác cùng group (ví dụ `nhom_huong`) vẫn được render phía dưới để không mất dữ liệu.

### 2.6 Tổng hợp riêng cho module “Quản lý thuộc tính”

| Chức năng                       | Mô tả triển khai                                                                                                                                                                   | Ghi chú                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Tạo/Sửa Attribute               | `AttributeFormSheet` dùng `react-hook-form + zod`, auto sinh mã, hỗ trợ domain, unit, flags filter/search/variant, hiển thị giá trị dạng danh sách động với upload ảnh & chọn màu. | Chưa có multi-language preview.                                    |
| Xóa Attribute                   | `DeleteAttributeDialog` + `useDeleteAttribute` đảm bảo i18n đúng, overlay loading, log lỗi.                                                                                        | –                                                                  |
| Danh sách Attribute             | `AttributeTable` (chưa chỉnh gần đây) vẫn tiêu chuẩn; hook filter/search `useAttributes`.                                                                                          | Có thể bổ sung filter theo domain/variantSpecific trong tương lai. |
| Binding Attribute → Category    | Có service/hook (`categoryAttributeService`, `useAssignCategoryAttribute`, `useCategoryAttributes`) để gán/xóa/cập nhật metadata (required, groupName, displayOrder).              | Chưa có seed mặc định nên admin phải gán thủ công.                 |
| Product Form tiêu thụ Attribute | `DynamicAttributesSection` lấy đúng group/metadata, mở rộng schema bằng `generateProductFormSchemaWithAttributes`.                                                                 | Đã có UI đặc biệt cho “Tầng hương”.                                |
| Variant Attribute quản lý       | `VariantAttributeSelector` + API `/for-variants` phân biệt variant vs display attribute.                                                                                           | Cần thêm rule/constraint.                                          |

### 2.7 Seed binding Perfume / Cosmetics (Cold Start fix)

- Migration `V20__seed_category_attribute_bindings.sql` tự động gán bộ thuộc tính chuẩn cho mọi category có slug bắt đầu bằng `nuoc-hoa` và `my-pham`.
- Bao gồm cả thuộc tính hiển thị (như `huong_dau`, `nhom_huong`) lẫn thuộc tính biến thể (`dung_tich`, `loai_hang`, `mau_sac`), kèm `group_name` để Product Form hiển thị ngay lập tức.
- Migration idempotent: sử dụng `ON CONFLICT` nên có thể chạy lại nhiều lần, hỗ trợ cả category con qua pattern slug.

### 2.8 Category Attribute Inheritance

- `CategoryAttributeService` được nâng cấp để đọc toàn bộ `path` của category và hợp nhất thuộc tính từ cha đến con (Root → Industry → Leaf).
- FE chỉ cần gọi một API (`/for-product`, `/for-variants`) và mặc định nhận đủ các thuộc tính được gán ở cấp cao; category con có thể override `required`, `displayOrder`, `group_name`.
- Đây là bước quan trọng để giảm thao tác thủ công khi mở rộng cây danh mục.

## 3. Hạng mục còn lại

1. **Front-store swatch & variant image**: Admin đã có thể upload `variant.imageUrl`, nhưng phần storefront chưa đọc/hiển thị. Cần cập nhật trang Product Detail để:
   - Hiển thị swatch theo `mau_sac` (hex hoặc image).
   - Khi chọn màu → đổi ảnh chính/thumbnail của variant.
2. **Variant Validation Rules**: hiện tại Variant Matrix cho phép mọi tổ hợp (theo plan Phase 1). Nếu cần chặn “Tester 30ml” cần thêm rules hoặc cấu hình constraint.
3. **Concentration module sunset**: class `Concentration` mới đánh dấu `@Deprecated`. Cần chạy migration V18, map dữ liệu sang attribute `nong_do`, cập nhật code còn tham chiếu module cũ.
4. **Search & Filter tối ưu**: dù đã có `is_filterable` + GIN indexes, phần FE filter + BE query nâng cao chưa triển khai (materialized view hoặc column riêng).
5. **Liên kết Product ↔ Decant**: tài liệu đề xuất dùng `related_products` hoặc `parent_product_id`. Mới chỉ cập nhật JavaDoc `RelatedProduct.relationType`. Cần actual feature để liên kết SKU full-size với SKU chiết.

## 4. Bước kế tiếp đề xuất

| Ưu tiên | Công việc                                             | Kết quả mong đợi                             |
| ------- | ----------------------------------------------------- | -------------------------------------------- |
| Cao     | Storefront swatch + variant image                     | Người dùng thấy đúng màu ảnh khi đổi variant |
| Trung   | Remove Concentration module (chạy V18, cập nhật code) | Không còn model cũ                           |
| Thấp    | Variant constraint rules                              | Ngăn tổ hợp vô lý                            |
| Thấp    | Search/filter tuning                                  | Chuẩn bị cho SEO & faceted search            |
| Thấp    | Parent ↔ Decant linking                               | Quản lý chiết chính xác hơn                  |

## 5. Tham chiếu file

- FE:
  - `src/components/features/catalog/attribute-form-sheet.tsx`
  - `src/components/features/catalog/dynamic-attributes-section.tsx`
  - `src/components/features/product/product-form-sheet.tsx`
  - `src/components/features/product/variant/variant-attribute-selector.tsx`
  - `src/components/features/product/variant/variant-matrix.tsx`
  - Hooks & services: `use-category-attributes.ts`, `category-attribute.service.ts`
- BE:
  - Controllers/Services: `CategoryAttributeController`, `CategoryAttributeService*`
  - Entities/DTO: `ProductVariant`, `ProductAttribute`
  - Migrations: `V16__update_schema_for_perfume_cosmetics.sql`, `V17__seed_perfume_cosmetics_attributes.sql`, `V18__prepare_migrate_concentration_to_attribute.sql`, `V19__seed_perfume_package_type_attribute.sql`
  - Related doc: `PERFUME_COSMETICS_DATA_MODEL_REFACTOR_PLAN.md`

---

_Cập nhật lần đầu: 2025-12-04._
