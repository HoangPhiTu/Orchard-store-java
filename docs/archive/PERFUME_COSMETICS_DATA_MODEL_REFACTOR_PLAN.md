## Perfume & Cosmetics Data Model – Gaps & Remediation Plan

**Context:**  
Hệ thống hiện tại đã có nền tảng rất tốt (Product, Product Variants, Product Attributes, Category Attributes, Inventory…).  
Tuy nhiên, khi soi chiếu với mô hình thực tế của Orchard.vn (đặc biệt là **Nước hoa** và **Mỹ phẩm**), xuất hiện một số “khoảng trống thiết kế” cần xử lý để tránh technical debt về sau.

Tài liệu này tóm tắt:
- Các **vấn đề chính** (Critical Gaps) trong mô hình dữ liệu hiện tại.
- Ảnh hưởng tới **Perfume**, **Cosmetics**, **Inventory** và **UI/UX**.
- **Kế hoạch khắc phục** (Action Plan) theo từng bước, có thể triển khai dần mà không phải “đập đi xây lại”.

---

## 1. Tổng quan 3 tầng dữ liệu (mapping với hệ thống hiện tại)

| Tầng dữ liệu Orchard.vn              | Ví dụ thực tế                                            | Mapping vào hệ thống hiện tại                           | Đánh giá |
|--------------------------------------|----------------------------------------------------------|---------------------------------------------------------|---------|
| **1. Product Info (Core Product)**   | Tên, Brand, Mô tả, …                                    | Bảng `products` (hiện đang dùng `product_variants` là core) | ✅ Ổn nếu coi Variant là đơn vị bán |
| **2. Attributes (Metadata)**         | Nhóm hương, Nồng độ, Phong cách, Tầng hương,…           | `attribute_types` + `attribute_values` + `category_attributes` | ⚠️ Cần chuẩn hóa domain & grouping |
| **3. Variants (Biến thể để bán)**    | Dung tích, Quy cách (Fullbox/Tester/Chiết), Màu Son,…   | `product_variants` (+ JSONB cached_attributes)         | 🛑 Rủi ro nếu lạm dụng JSONB & auto-matrix |

Ghi chú:
- Tầng 2 (**Attributes**) dùng để mô tả sản phẩm và phục vụ lọc, SEO, content.
- Tầng 3 (**Variants**) là nơi tạo SKU thực tế (giá, tồn kho, mã vạch, ảnh riêng…).

---

## 2. Vấn đề 1 – “Ma trận” Biến thể Nước hoa (The Variant Matrix)

### Mô tả vấn đề

Đối với Nước hoa, biến thể không chỉ là 1 chiều “Dung tích” mà là tổ hợp:
- **Dung tích**: 30ml, 50ml, 100ml
- **Quy cách (Loại hàng)**: Fullbox, Tester, Chiết, Giftset…

Nếu coi `Dung tích` và `Loại hàng` đều là **Variant Attributes** và để hệ thống auto-sinh ma trận (capacity × type), ta sẽ sinh ra **biến thể vô nghĩa**:
- Ví dụ: 30ml + Tester (hãng không sản xuất tester 30ml), nhưng hệ thống vẫn tạo.

Hiện trạng:
- Mô hình Variant hiện tại dựa nhiều vào:
  - Bảng `product_variants` với **JSONB `cached_attributes`**.
  - Tư duy EAV mềm → linh hoạt nhưng **dễ sinh dữ liệu rác** nếu không kiểm soát.

### Hệ quả

- **Data rác**: Nhiều SKU không tồn tại trong thực tế.
- **Inventory khó quản lý**: SKU “ảo” gây sai lệch tồn kho tổng.
- **UI phức tạp**: Admin phải tự tay xóa các variant vô lý sau khi sinh tự động.

### Hướng khắc phục

**Mục tiêu:** Không cố gắng làm “auto-matrix thông minh” ngay, mà cho phép:
- Admin **chỉ định thủ công** các biến thể hợp lệ.
- Hạn chế auto-generate, ưu tiên “tạo từng variant” hoặc “sinh rồi xóa bớt”.

**Action items:**

1. **Thiết kế rõ Variant Attributes cho Perfume**
   - Trong `attribute_types` (domain = `PERFUME`):
     - `dung_tich` (`capacity`) – `SELECT`, `is_variant_specific = TRUE`
     - `loai_hang` (`package_type`) – `SELECT`, `is_variant_specific = TRUE`
   - Không auto-treat **mọi SELECT** là biến thể; chỉ các attribute được gắn `variantSpecific = TRUE`.

2. **Variant Generator – Phase 1 (Manual-first)**
   - Thay vì auto-sinh full matrix:
     - Cho phép Admin:
       - Chọn một số `Dung tích` + `Loại hàng` cụ thể.
       - Click “Tạo biến thể được chọn”.
   - Không cần constraint cứng giữa 2 chiều; Admin sẽ chịu trách nhiệm loại bỏ tổ hợp vô nghĩa.

3. **(Phase 2 – sau này)**  
   - Có thể cấu hình rule:
     - Ví dụ: `Tester` chỉ đi với `100ml`.
   - Nhưng không nằm trong scope MVP hiện tại.

---

## 3. Vấn đề 2 – Tầng hương (Scent Pyramid) & Grouping

### Mô tả vấn đề

Đối với Nước hoa, **Tầng hương** là phần content quan trọng nhất:
- **Hương đầu (Top Notes)**
- **Hương giữa (Heart / Middle Notes)**
- **Hương cuối (Base Notes)**

Nếu model hóa 3 attribute riêng lẻ (`huong_dau`, `huong_giua`, `huong_cuoi`) mà không grouping:
- UI dễ bị rời rạc (hiển thị như 3 field bình thường).
- Không tạo được cảm giác “Pyramid” trực quan như trên Orchard.vn.

### Hiện trạng kỹ thuật

- Đã có:
  - Bảng `attribute_types` + `attribute_values`.
  - Bảng `category_attributes` và **cột `group_name`** (thêm bởi `V15__add_group_name_to_category_attributes.sql`).
- Chưa sử dụng hết sức mạnh của `group_name` cho các nhóm đặc thù như **Tầng hương**.

### Hướng khắc phục

**Mục tiêu:** Sử dụng `group_name` trong `category_attributes` để:
- Gom 3 attribute `huong_dau`, `huong_giua`, `huong_cuoi` vào **Group “Tầng hương”**.
- Cho phép UI render block riêng (Pyramid).

**Action items:**

1. **Seed các Attribute chuẩn cho Perfume (Tầng hương)**
   - Trong `attribute_types` (domain = `PERFUME`, `variantSpecific = FALSE`):
     - `nhom_huong` – `SELECT`  
     - `huong_dau` – `MULTISELECT`
     - `huong_giua` – `MULTISELECT`
     - `huong_cuoi` – `MULTISELECT`

2. **Binding với `category_attributes`**
   - Khi cấu hình category “Nước hoa”, gán:
     - `huong_dau`, `huong_giua`, `huong_cuoi` với `group_name = 'Tầng hương'`.

3. **Frontend (Product Detail / Product Form)**
   - Khi load attributes cho Product:
     - Group theo `group_name`.
     - Nếu `group_name == 'Tầng hương'` → render theo layout đặc biệt (Pyramid UI).
   - Phần này có thể implement dần sau khi dynamic product form ổn định.

---

## 4. Vấn đề 3 – Sản phẩm Chiết (Decant) & Inventory

### Mô tả vấn đề

Sản phẩm Chiết (Decant) là chai nhỏ (10ml, 5ml…) được chiết từ chai full:
- Ví dụ: `narciso-rodriguez-for-her-edp-chiet/`.
- Thông thường:
  - 1 chai 100ml fullbox → có thể chiết ra nhiều chai 10ml.

Về mặt Inventory:
- Câu hỏi: **Bán 1 chai chiết 10ml có trừ tồn của chai 100ml gốc không?**
- Để làm đúng chuẩn cần:
  - **BOM / Bundle / Component tracking** giữa “Chiết” và “Chai gốc”.

### Rủi ro nếu làm quá sớm

- Tăng độ phức tạp Inventory rất lớn:
  - Cần định nghĩa tỷ lệ chuyển đổi (1 × 100ml = 10 × 10ml).
  - Cần trigger khi bán Chiết để update tồn của chai gốc.
- Hiện tại module Inventory của dự án đã tương đối đầy đủ (warehouse, stock, reservations, transactions, …) nhưng:
  - Chưa có logic BOM/Bundling cho **nguyên liệu vs sản phẩm con**.

### Hướng khắc phục (giai đoạn MVP)

**Mục tiêu:** **Giảm độ phức tạp**, chấp nhận đánh đổi một chút chính xác inventory tự động.

**Action items:**

1. **Đối xử Chiết như SKU độc lập**
   - Tạo product/variant riêng cho `…-chiet` (như Orchard đang làm).
   - Nhập kho **riêng** cho SKU Chiết (không tự trừ từ chai gốc).

2. **Sau này (Phase 2+) – BOM/Bundle Support**
   - Thiết kế bảng:
     - `product_components` hoặc `variant_components`:
       - `component_variant_id`, `parent_variant_id`, `quantity_ratio`.
   - Khi bán 1 Chiết:
     - Tự động tạo transaction giảm stock của chai gốc dựa trên `quantity_ratio`.
   - Không bắt buộc cho MVP; chỉ nên làm khi business đã ổn định.

---

## 5. Vấn đề 4 – Mỹ phẩm & Swatch màu (Color Swatches)

### Mô tả vấn đề

Với Mỹ phẩm (đặc biệt là Son, Phấn):
- Mỗi biến thể thường là **một màu sắc khác nhau**.
- Khách hàng mong đợi UI:
  - Hiển thị **ô màu** (color swatch) – dùng `hex_color` hoặc `image_url`.
  - Khi chọn màu → đổi ảnh chính của sản phẩm sang ảnh đúng của màu đó.

### Hiện trạng kỹ thuật

- `attribute_values` đã có:
  - `hex_color`
  - `image_url`
- Tức là: **Level Attribute đã đủ**.
- Còn thiếu:
  - `product_variants` chưa chắc có `image_url` riêng cho từng SKU.
  - UI Product Detail chưa dùng swatch logic theo domain `COSMETICS`.

### Hướng khắc phục

**Mục tiêu:**  
Cho phép mỗi Variant (đặc biệt là COSMETICS) có ảnh riêng, và UI hiển thị swatches đẹp.

**Action items:**

1. **Đảm bảo `product_variants` có trường ảnh riêng**
   - Thêm cột (nếu chưa có):
     - `variant_image_url VARCHAR(500)` (hoặc `image_url` nếu chưa tồn tại).
   - Entity `ProductVariant`:
     - Field `imageUrl` (String).
     - Nếu không set → UI fallback sang ảnh chính của Product.

2. **Seed Attribute cho COSMETICS**
   - `mau_sac` – `SELECT`, `variantSpecific = TRUE`, `domain = 'COSMETICS'`.
   - `attribute_values` của `mau_sac`:
     - `hex_color` bắt buộc.
     - `image_url` nếu có ảnh texture riêng.

3. **Frontend – Product Detail**
   - Nếu Category/Attribute domain = `COSMETICS`:
     - Render danh sách biến thể bằng **swatches**:
       - Nếu có `hex_color` → vẽ ô màu.
       - Nếu có `image_url` → thể hiện texture.
     - Khi click vào 1 swatch:
       - Đổi **Variant đang chọn**.
       - Đổi ảnh chính sang `variant.imageUrl` (hoặc fallback).

---

## 6. Chuẩn hóa Seed Data cho Attributes (Perfume & Cosmetics)

Mục tiêu: **Admin không tự “bịa” attribute**, mà dùng bộ chuẩn hỗ trợ đúng domain.

### 6.1. Perfume (domain = `PERFUME`)

**Nhóm “Thông số cơ bản”**
- `nong_do` – Nồng độ (SELECT; EDP, EDT, Parfum…; `variantSpecific = FALSE`)
- `gioi_tinh` – Giới tính (SELECT; Nam/Nữ/Unisex; `variantSpecific = FALSE`)

**Nhóm “Cấu trúc mùi hương”**
- `nhom_huong` – Nhóm hương (SELECT; Woody, Floral, Oriental…)
- `huong_dau` – Hương đầu (MULTISELECT)
- `huong_giua` – Hương giữa (MULTISELECT)
- `huong_cuoi` – Hương cuối (MULTISELECT)
  - Tất cả `variantSpecific = FALSE`.
  - Khi bind vào Category:
    - `group_name = 'Tầng hương'`.

**Nhóm “Variant Attributes”**
- `dung_tich` – Dung tích (SELECT; 30ml, 50ml, 100ml; `variantSpecific = TRUE`)
- `loai_hang` – Quy cách (SELECT; Fullbox, Tester, Chiết; `variantSpecific = TRUE`)

### 6.2. Cosmetics (domain = `COSMETICS`)

**Variant Attributes**
- `mau_sac` – Màu sắc:
  - `attributeType = SELECT`
  - `variantSpecific = TRUE`
  - `hex_color` + `image_url` trong `attribute_values`.

**Product Attributes**
- `loai_da` – Loại da (MULTISELECT; Dầu, Khô, Hỗn hợp, Nhạy cảm; `variantSpecific = FALSE`)
- Các thuộc tính khác: Finish, Coverage, Skin concern, SPF…, đều `variantSpecific = FALSE`.

---

## 7. Action Plan – Thứ tự triển khai

### Phase 1 – Ổn định Data Model (Backend & DB)

1. **Xác nhận & chạy đầy đủ migrations:**
   - `V1__init_schema.sql` – schema gốc.
   - `V14__add_domain_to_attribute_types.sql` – thêm `domain` vào `attribute_types`.
   - `V15__add_group_name_to_category_attributes.sql` – thêm `group_name` vào `category_attributes`.

2. **Seed các Attribute chuẩn:**
   - Viết script seed (Flyway hoặc manual SQL) cho:
     - Perfume attributes (`nong_do`, `gioi_tinh`, `nhom_huong`, `huong_dau`, `huong_giua`, `huong_cuoi`, `dung_tich`, `loai_hang`).
     - Cosmetics attributes (`mau_sac`, `loai_da`, …).

3. **Đảm bảo Entity/DTO mapping khớp với schema:**
   - `ProductAttribute` ↔ `attribute_types` (có `domain`).
   - `CategoryAttribute` ↔ `category_attributes` (có `groupName`).

### Phase 2 – Variant Handling & UI Perfume/Cosmetics

4. **Variant Entity & Image**
   - Thêm `imageUrl` (hoặc `variantImageUrl`) cho `product_variants`.
   - Backend: expose field này trong DTO.

5. **Variant Management UI**
   - Perfume:
     - Cho phép chọn `Dung tích` + `Loại hàng` để tạo variant.
     - Không auto-sinh full matrix; Admin chọn tổ hợp hợp lệ.
   - Cosmetics:
     - Hiển thị variants theo `mau_sac` với swatches + ảnh riêng.

6. **Product Detail UI**
   - Perfume:
     - Block “Tầng hương” dùng `group_name = 'Tầng hương'`.
   - Cosmetics:
     - Swatch selector cho màu + đổi ảnh variant.

### Phase 3 – Inventory & Chiết (Optional/Advanced)

7. **Giữ Chiết như SKU riêng trong MVP**
   - Không implement BOM ở giai đoạn này.

8. **Khi business ổn định:**
   - Thiết kế bảng `variant_components` để hỗ trợ:
     - 1 Chiết = X ml từ 1 chai gốc.
   - Tích hợp với inventory transactions.

---

## 8. Kết luận

Hệ thống hiện tại **đã có đầy đủ nền tảng** để hỗ trợ mô hình phức tạp của Nước hoa & Mỹ phẩm:
- EAV cho Product Attributes.
- Category Attribute Binding với `group_name`.
- Product Variants + Inventory tương đối giàu tính năng.

Việc cần làm không phải là “đập bỏ kiến trúc”, mà là:
- **Chuẩn hóa seed data Attributes** theo domain.
- **Khai thác đúng `domain` + `group_name`** để render UI hợp lý.
- **Đơn giản hóa Variant & Inventory cho Chiết** trong giai đoạn MVP.

Tài liệu này đóng vai trò **bản kế hoạch tổng thể**, các bước chi tiết triển khai (task-level) nên được tách ra thành:
- `ATTRIBUTE_DYNAMIC_FORM_IMPLEMENTATION_PLAN.md`
- `PRODUCT_VARIANT_AND_INVENTORY_PLAN.md`
- `PERFUME_COSMETICS_SEED_DATA_PLAN.sql` (file SQL riêng cho seed).

---

## 9. Các Thiếu Sót Bổ Sung (Gap Analysis bổ sung)

### 🛑 9.1. Thiếu cơ chế “Variant Filtering” tại nguồn

- **Hiện trạng:** Kế hoạch Phase 2 mới dừng ở “Admin tự chọn tổ hợp hợp lệ”. Backend vẫn chưa có rào chắn nếu FE/BE sinh nhầm biến thể.
- **Rủi ro:** Có thể xuất hiện SKU vô nghĩa (VD: 30ml + Tester).
- **Cần bổ sung:**  
  - Thiết kế UI “Variant Matrix Builder” (rown = Dung tích, column = Loại hàng).  
  - Lưu whitelist các combo hợp lệ (bảng phụ), backend chỉ cho phép tạo variant trong danh sách whitelist.

### 🛑 9.2. Search & Filter dựa trên JSONB – Chưa xử lý

- **Hiện trạng:** Dữ liệu thuộc tính đang nằm trong JSONB (`cached_attributes`). Tài liệu này chưa đề cập tới chiến lược indexing/filter.
- **Rủi ro:** Truy vấn “Nước hoa hương gỗ + 100ml” sẽ scan toàn bộ bảng, gây chậm.
- **Cần bổ sung:**  
  - Đánh dấu `attribute_types.is_filterable`.  
  - Với các filterable attributes:
    - Hoặc tạo bảng flatten `product_attribute_filters` để join nhanh.  
    - Hoặc tạo JSONB riêng kèm GIN index và precompute data.  
  - API search phải tận dụng các index này.

### 🛑 9.3. Liên kết giữa sản phẩm gốc – sản phẩm chiết

- **Hiện trạng:** Chiết đang được khuyến nghị tách thành SKU/Product riêng, nhưng chưa có quan hệ để hiển thị cross-sell/upsell.
- **Rủi ro:** Khách xem chai 100ml không biết có phiên bản chiết 10ml → mất cơ hội bán hàng.
- **Cần bổ sung:**  
  - Sử dụng bảng `related_products` (đã tồn tại) hoặc thêm `parent_product_id` để liên kết.  
  - FE Product Detail load các related entries (loại `DEBOTTLED`/`DECANT`) để hiển thị “Có phiên bản chiết …”.

Các thiếu sót này nên được đưa vào task list của Phase 2/3 để đảm bảo kiến trúc hoàn chỉnh khi triển khai thực tế.


