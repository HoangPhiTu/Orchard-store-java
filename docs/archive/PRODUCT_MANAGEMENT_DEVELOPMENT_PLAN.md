# KẾ HOẠCH PHÁT TRIỂN MODULE PRODUCT MANAGEMENT (ADMIN)

**Phiên bản:** 2.0 (Cập nhật sau khi hoàn thành Attribute & Concentration Management)  
**Ngữ cảnh:** Hệ thống JAVA ORCHARD STORE – Catalog Nước hoa & Mỹ phẩm  
**Ngày cập nhật:** 2025-01-XX

---

## MỤC LỤC

1. [Tổng quan & Nguyên tắc](#1-tổng-quan--nguyên-tắc)
2. [Cấu trúc Product/Variant](#2-cấu-trúc-productvariant)
3. [Quy ước Đặt tên & Slug](#3-quy-ước-đặt-tên--slug)
4. [Schema Database](#4-schema-database)
5. [Product Attributes](#5-product-attributes)
6. [Kế hoạch Triển khai](#6-kế-hoạch-triển-khai)
7. [Checklist Chi tiết](#7-checklist-chi-tiết)

---

## 1. TỔNG QUAN & NGUYÊN TẮC

### 1.1. Mục tiêu

- ✅ **Chuẩn hoá mô hình Product/Variant theo logic Orchard.vn**
- ✅ **Giảm trùng lặp dữ liệu, tăng khả năng SEO**
- ✅ **Đảm bảo Admin nhập liệu đơn giản, nhất quán**
- ✅ **Hỗ trợ cả Nước hoa và Mỹ phẩm** (thông qua Attribute Domain)

### 1.2. Nguyên tắc thiết kế

#### **Product (Cha) = "Định danh mùi hương + Nồng độ"**

- Mỗi **mùi hương + nồng độ** = 1 Product riêng biệt
- Ví dụ:
  - `Dior Sauvage EDP` → 1 Product
  - `Dior Sauvage EDT` → 1 Product khác
  - `Dior Sauvage Elixir EDP` → 1 Product khác nữa

**Lý do:**

- ✅ SEO tốt hơn (mỗi nồng độ có URL riêng)
- ✅ Mô tả chi tiết khác nhau cho từng nồng độ
- ✅ Dễ quản lý và mở rộng

#### **ProductVariant (Con) = "Các lựa chọn thương mại"**

- Mỗi **dung tích/phiên bản** = 1 Variant
- Ví dụ cho `Dior Sauvage EDP`:
  - Variant 1: `100ml` (Full box)
  - Variant 2: `60ml` (Full box)
  - Variant 3: `10ml` (Chiết)

**Lý do:**

- ✅ Giá, tồn kho, SKU khác nhau theo dung tích
- ✅ Một số variant có thể là "Tester", "Giftset", "Chiết"

---

## 2. CẤU TRÚC PRODUCT/VARIANT

### 2.1. Product (Cha) - Thông tin chung

#### **Trường bắt buộc:**

- `id` (PK)
- `name` - Tên sản phẩm (ví dụ: "Dior Sauvage EDP")
- `brand_id` (FK → brands)
- `status` (DRAFT / UNDER_REVIEW / ACTIVE / INACTIVE / ARCHIVED)
- `created_at`, `updated_at`

#### **Trường cần thêm (Migration):**

- ✅ `full_description` (TEXT) - Bài viết chi tiết về mùi hương
- ✅ `category_id` (FK → categories) - Danh mục chính (Nước hoa Nữ/Nam/Unisex)
- ✅ `concentration_id` (FK → concentrations) - Nồng độ (EDP, EDT, Parfum...)

#### **Trường SEO:**

- `meta_title` (VARCHAR 255)
- `meta_description` (TEXT)
- `slug` (VARCHAR 255, UNIQUE) - URL slug cho Product

#### **Trường quản lý:**

- `published_at` (TIMESTAMP)
- `archived_at` (TIMESTAMP)
- `created_by`, `updated_by` (FK → users)

#### **Trường thống kê:**

- `view_count` (INTEGER, default 0)
- `sold_count` (INTEGER, default 0)

### 2.2. ProductVariant (Con) - Thông tin thương mại

#### **Trường bắt buộc:**

- `id` (PK)
- `product_id` (FK → products)
- `variant_name` - Tên biến thể (ví dụ: "100ml", "60ml", "10ml Chiết")
- `slug` (VARCHAR 255, UNIQUE) - URL slug cho Variant
- `sku` (VARCHAR 100, UNIQUE) - Mã SKU
- `price` (DECIMAL 15,2) - Giá gốc
- `stock_quantity` (INTEGER, default 0)

#### **Trường giá:**

- `sale_price` (DECIMAL 15,2) - Giá khuyến mãi
- `cost_price` (DECIMAL 15,2) - Giá vốn
- `currency_code` (VARCHAR 3, default 'VND')

#### **Trường tồn kho:**

- `reserved_quantity` (INTEGER, default 0)
- `low_stock_threshold` (INTEGER, default 10)
- `manage_inventory` (BOOLEAN, default TRUE)
- `allow_backorder` (BOOLEAN, default FALSE)
- `allow_out_of_stock_purchase` (BOOLEAN, default FALSE)
- `stock_status` (VARCHAR 20) - IN_STOCK / OUT_OF_STOCK / LOW_STOCK

#### **Trường vật lý:**

- `volume_ml` (INTEGER) - Dung tích (ml)
- `volume_unit` (VARCHAR 10, default 'ml')
- `weight_grams` (INTEGER)
- `weight_unit` (VARCHAR 10, default 'g')

#### **Trường hiển thị:**

- `short_description` (TEXT) - Mô tả ngắn riêng cho variant (ví dụ: "Tester", "Giftset")
- `is_default` (BOOLEAN) - Variant mặc định
- `display_order` (INTEGER) - Thứ tự hiển thị
- `available_from`, `available_to` (TIMESTAMP)

#### **Trường SEO:**

- `meta_title` (VARCHAR 255)
- `meta_description` (TEXT)

#### **Trường cache:**

- `cached_attributes` (JSONB) - Cache các attribute đã gán cho variant

**⚠️ Cấu trúc `cached_attributes` JSONB:**

Lưu **GỘP CẢ HAI**: Attribute của Product (Cha) + Attribute của Variant (Con)

**Ví dụ cấu trúc:**

```json
{
  "product_attributes": {
    "gender": "Nam",
    "origin": "Pháp",
    "year_released": "2015",
    "fragrance_family": ["Gỗ", "Xạ hương"],
    "top_notes": ["Bergamot", "Pink pepper"],
    "middle_notes": ["Lavender", "Geranium"],
    "base_notes": ["Ambroxan", "Cedar"],
    "longevity": "6-8 giờ",
    "sillage": "1-2 mét",
    "style": ["Cá tính", "Thanh lịch"],
    "season": ["Xuân", "Hạ", "Thu", "Đông"],
    "occasion": ["Hàng ngày", "Văn phòng"]
  },
  "variant_attributes": {
    "volume": "100ml",
    "packaging": "Full box"
  },
  "metadata": {
    "cached_at": "2025-01-XXT10:00:00Z",
    "product_id": 123,
    "variant_id": 456
  }
}
```

**Lợi ích:**

- ✅ **Performance:** Khi query danh sách sản phẩm trên Storefront, chỉ cần lấy `cached_attributes` từ Variant → Không cần JOIN với `products` hoặc `product_attributes`
- ✅ **Filter nhanh:** Có thể filter trực tiếp trên JSONB field (PostgreSQL hỗ trợ GIN index)
- ✅ **Hiển thị đầy đủ:** Frontend có đủ thông tin để hiển thị filter và product cards

**Logic Update:**

- ✅ **Khi Product attributes thay đổi** → Update `cached_attributes` của TẤT CẢ Variants con
- ✅ **Khi Variant attributes thay đổi** → Chỉ update `cached_attributes` của Variant đó
- ✅ **Implementation:**
  - Service method: `ProductVariantService.updateCachedAttributes(ProductVariant variant)`
  - Trigger sau khi save Product hoặc Variant
  - Có thể schedule job để rebuild cache định kỳ (nếu cần)

**Indexing:**

```sql
-- GIN index cho JSONB để query/filter nhanh
CREATE INDEX idx_product_variants_cached_attributes_gin
ON product_variants USING GIN (cached_attributes);

-- Index cho các field thường query
CREATE INDEX idx_product_variants_cached_attrs_gender
ON product_variants ((cached_attributes->'product_attributes'->>'gender'));
```

#### **Trường thống kê:**

- `view_count` (INTEGER, default 0)
- `sold_count` (INTEGER, default 0)

#### **Trường cần XÓA (sau migration):**

- ❌ `full_description` → Chuyển lên Product
- ❌ `category_id` → Chuyển lên Product
- ❌ `concentration_id` → Chuyển lên Product

---

## 3. QUY ƯỚC ĐẶT TÊN & SLUG

### 3.1. Product Name (Tên sản phẩm cha)

**Công thức:**

```
[Brand Name] + [Base Product Name] + [Concentration Code]
```

**Ví dụ:**

- `Dior Sauvage EDP`
- `Dior Sauvage EDT`
- `Dior Sauvage Elixir EDP`
- `Narciso Rodriguez For Her EDP`

**Quy tắc:**

- ✅ Tự động ghép từ: `Brand.name` + `Product.baseName` + `Concentration.acronym`
- ✅ Admin có thể chỉnh sửa thủ công nếu cần
- ✅ Không bao gồm dung tích (vì dung tích ở Variant)

### 3.2. Product Slug (URL của Product)

**Công thức:**

```
[brand-slug]-[product-slug]-[concentration-slug]
```

**Ví dụ:**

- `dior-sauvage-edp`
- `dior-sauvage-edt`
- `dior-sauvage-elixir-edp`
- `narciso-rodriguez-for-her-edp`

**Quy tắc:**

- ✅ Tự động tạo từ `Product.name` (slugify)
- ✅ Admin có thể chỉnh sửa thủ công
- ✅ Phải UNIQUE trong hệ thống

### 3.3. Variant Name (Tên biến thể)

**Công thức:**

```
[Brand Name] + [Base Product Name] + [Concentration Code] + [Volume] + [Suffix (Optional)]
```

**Ví dụ:**

- `Dior Sauvage EDP 100ml`
- `Dior Sauvage EDP 60ml`
- `Dior Sauvage EDT 10ml (Chiết)`
- `Dior Sauvage EDP 100ml (Tester)`

**Quy tắc:**

- ✅ Tự động ghép từ: `Product.name` + `Volume` + `Suffix`
- ✅ `Volume` và `Suffix` do Admin nhập thủ công (không tự động)
- ✅ `Suffix` là optional (ví dụ: "(Chiết)", "(Tester)", "(Giftset)")

**⚠️ Logic Cascade Update:**

- ✅ **Khi Product name thay đổi** → Tự động cập nhật `variant_name` của TẤT CẢ Variants con
- ✅ **Khi Brand name thay đổi** → Tự động cập nhật Product name → Cascade update Variant names
- ✅ **Khi Concentration thay đổi** → Tự động cập nhật Product name → Cascade update Variant names
- ✅ **Implementation:**
  - Service layer (`ProductServiceImpl.updateProduct()`) sẽ trigger update tất cả variants
  - Hoặc dùng Database Trigger (PostgreSQL) để tự động sync
  - **Lưu ý:** Chỉ update nếu variant_name chưa được chỉnh sửa thủ công (có flag `is_name_manually_edited`)

### 3.4. Variant Slug (URL của Variant)

**Công thức:**

```
[brand-slug]-[product-slug]-[concentration-slug]-[volume]-[suffix-slug]
```

**Ví dụ:**

- `dior-sauvage-edp-100ml`
- `dior-sauvage-edp-60ml`
- `dior-sauvage-edt-10ml-chiet`
- `dior-sauvage-edp-100ml-tester`

**Quy tắc:**

- ✅ Tự động tạo từ `Variant.variantName` (slugify)
- ✅ Admin có thể chỉnh sửa thủ công
- ✅ Phải UNIQUE trong hệ thống

### 3.5. SKU (Mã kho) - Auto Generation Rules

**Công thức chuẩn:**

```
[BrandCode]-[ProductCode]-[ConcentrationCode]-[Volume]-[Type]
```

**Ví dụ:**

- `DIO-SAU-EDP-100-FULL` → Dior Sauvage EDP 100ml Full box
- `DIO-SAU-EDP-60-FULL` → Dior Sauvage EDP 60ml Full box
- `DIO-SAU-EDP-10-CHIET` → Dior Sauvage EDP 10ml Chiết
- `DIO-SAU-EDP-100-TEST` → Dior Sauvage EDP 100ml Tester
- `NAR-FOR-EDP-100-FULL` → Narciso Rodriguez For Her EDP 100ml Full box

**Quy tắc chi tiết:**

| Component           | Nguồn                                          | Format                   | Ví dụ                           |
| ------------------- | ---------------------------------------------- | ------------------------ | ------------------------------- |
| `BrandCode`         | `Brand.code` hoặc auto từ `Brand.name`         | 3-4 ký tự, UPPERCASE     | `DIO`, `NAR`, `CHANEL` → `CHAN` |
| `ProductCode`       | `Product.baseName` hoặc auto từ `Product.name` | 3-4 ký tự, UPPERCASE     | `SAU`, `FOR`, `BLOOM` → `BLOO`  |
| `ConcentrationCode` | `Concentration.acronym`                        | 2-4 ký tự, UPPERCASE     | `EDP`, `EDT`, `PARFUM` → `PARF` |
| `Volume`            | `ProductVariant.volumeMl`                      | Số nguyên, không có "ml" | `100`, `60`, `10`               |
| `Type`              | Từ `packaging` attribute hoặc suffix           | 3-5 ký tự, UPPERCASE     | `FULL`, `TEST`, `CHIET`, `GIFT` |

**Mapping Type:**

- Full box (mặc định) → `FULL`
- Tester → `TEST`
- Chiết → `CHIET`
- Giftset → `GIFT`
- Limited edition → `LIMIT`

**Implementation:**

- ✅ Service method: `ProductVariantService.generateSKU(ProductVariant variant)`
- ✅ Tự động generate khi tạo Variant mới (nếu SKU để trống)
- ✅ Admin có thể override thủ công nếu cần
- ✅ Validation: SKU phải UNIQUE trong hệ thống

**Lợi ích:**

- ✅ Nhân viên kho nhìn SKU là biết ngay: Brand, Product, Nồng độ, Dung tích, Loại đóng gói
- ✅ Dễ dàng tìm kiếm và quản lý kho
- ✅ Hỗ trợ barcode scanning nếu cần

---

## 4. SCHEMA DATABASE

### 4.1. Migration Plan

#### **Bước 1: Thêm các trường mới vào `products`**

```sql
-- Migration: V15__add_product_fields.sql
ALTER TABLE products
ADD COLUMN IF NOT EXISTS full_description TEXT,
ADD COLUMN IF NOT EXISTS category_id BIGINT,
ADD COLUMN IF NOT EXISTS concentration_id BIGINT,
ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

-- Foreign keys
ALTER TABLE products
ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
ADD CONSTRAINT fk_products_concentration FOREIGN KEY (concentration_id) REFERENCES concentrations(id);

-- Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_concentration ON products(concentration_id);
CREATE UNIQUE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status_category ON products(status, category_id);
```

#### **Bước 2: Migrate dữ liệu từ `product_variants` lên `products`**

```sql
-- Migration: V16__migrate_product_data.sql
-- Copy full_description từ variant default về product
UPDATE products p
SET full_description = (
    SELECT pv.full_description
    FROM product_variants pv
    WHERE pv.product_id = p.id
      AND (pv.is_default = TRUE OR pv.id = (
          SELECT id FROM product_variants
          WHERE product_id = p.id
          ORDER BY is_default DESC, display_order ASC, id ASC
          LIMIT 1
      ))
    LIMIT 1
)
WHERE p.full_description IS NULL;

-- Copy category_id từ variant default về product
UPDATE products p
SET category_id = (
    SELECT pv.category_id
    FROM product_variants pv
    WHERE pv.product_id = p.id
      AND pv.category_id IS NOT NULL
      AND (pv.is_default = TRUE OR pv.id = (
          SELECT id FROM product_variants
          WHERE product_id = p.id
          ORDER BY is_default DESC, display_order ASC, id ASC
          LIMIT 1
      ))
    LIMIT 1
)
WHERE p.category_id IS NULL;

-- Copy concentration_id từ variant về product
UPDATE products p
SET concentration_id = (
    SELECT pv.concentration_id
    FROM product_variants pv
    WHERE pv.product_id = p.id
      AND pv.concentration_id IS NOT NULL
      AND (pv.is_default = TRUE OR pv.id = (
          SELECT id FROM product_variants
          WHERE product_id = p.id
          ORDER BY is_default DESC, display_order ASC, id ASC
          LIMIT 1
      ))
    LIMIT 1
)
WHERE p.concentration_id IS NULL;

-- Generate slug từ name nếu chưa có
UPDATE products
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';
```

#### **Bước 3: Xóa các trường không còn dùng ở `product_variants`**

```sql
-- Migration: V17__remove_variant_fields.sql
-- Sau khi kiểm tra dữ liệu đã migrate ổn, xóa các cột:
ALTER TABLE product_variants
DROP COLUMN IF EXISTS full_description,
DROP COLUMN IF EXISTS category_id,
DROP COLUMN IF EXISTS concentration_id;
```

### 4.2. Entity Changes

#### **Product.java**

```java
@Entity
@Table(name = "products")
public class Product {
    // ... existing fields ...

    @Column(name = "full_description", columnDefinition = "TEXT")
    private String fullDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concentration_id")
    private Concentration concentration;

    @Column(name = "slug", unique = true)
    private String slug;

    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "TEXT")
    private String metaDescription;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "sold_count")
    private Integer soldCount = 0;

    // ... getters/setters ...
}
```

#### **ProductVariant.java**

```java
@Entity
@Table(name = "product_variants")
public class ProductVariant {
    // ... existing fields ...

    // ❌ REMOVE: fullDescription, category, concentration

    // ✅ KEEP: shortDescription, volumeMl, price, stockQuantity, etc.
}
```

---

## 5. PRODUCT ATTRIBUTES

### 5.1. Attribute Domain

Tất cả Attribute được phân loại theo `domain`:

- `PERFUME` - Dành cho nước hoa
- `COSMETICS` - Dành cho mỹ phẩm
- `COMMON` - Dùng chung cho cả hai

### 5.2. Attributes cho Nước hoa (PERFUME)

#### **Thông tin cơ bản:**

| Attribute Key   | Type   | is_variant_specific | Unit | Mô tả                     |
| --------------- | ------ | ------------------- | ---- | ------------------------- |
| `gender`        | SELECT | false               | -    | Giới tính (Nam/Nữ/Unisex) |
| `origin`        | SELECT | false               | -    | Xuất xứ (Pháp/Ý/Mỹ...)    |
| `year_released` | TEXT   | false               | -    | Năm phát hành             |
| `perfumer`      | TEXT   | false               | -    | Nhà chế tác               |

#### **Mùi hương:**

| Attribute Key      | Type               | is_variant_specific | Unit | Mô tả                                    |
| ------------------ | ------------------ | ------------------- | ---- | ---------------------------------------- |
| `fragrance_family` | SELECT/MULTISELECT | false               | -    | Nhóm hương (Hoa/Gỗ/Xạ hương...)          |
| `main_accords`     | MULTISELECT        | false               | -    | Mùi hương chính (white floral, musky...) |
| `top_notes`        | MULTISELECT        | false               | -    | Hương đầu (Bergamot, Lemon...)           |
| `middle_notes`     | MULTISELECT        | false               | -    | Hương giữa (Rose, Jasmine...)            |
| `base_notes`       | MULTISELECT        | false               | -    | Hương cuối (Musk, Sandalwood...)         |

#### **Đặc tính:**

| Attribute Key     | Type   | is_variant_specific | Unit | Mô tả                       |
| ----------------- | ------ | ------------------- | ---- | --------------------------- |
| `longevity`       | SELECT | false               | giờ  | Độ lưu hương (6-8h, >8h...) |
| `sillage`         | SELECT | false               | -    | Độ tỏa hương (1m, 1-2m...)  |
| `intensity_level` | SELECT | false               | -    | Mức độ nồng độ (1-10)       |

#### **Phong cách & Dịp:**

| Attribute Key | Type        | is_variant_specific | Unit | Mô tả                                |
| ------------- | ----------- | ------------------- | ---- | ------------------------------------ |
| `style`       | MULTISELECT | false               | -    | Phong cách (Lãng mạn/Nữ tính...)     |
| `season`      | MULTISELECT | false               | -    | Mùa phù hợp (Xuân/Hạ/Thu/Đông)       |
| `occasion`    | MULTISELECT | false               | -    | Dịp sử dụng (Hàng ngày/Văn phòng...) |

#### **Bộ sưu tập:**

| Attribute Key | Type               | is_variant_specific | Unit | Mô tả                                  |
| ------------- | ------------------ | ------------------- | ---- | -------------------------------------- |
| `collection`  | SELECT/MULTISELECT | false               | -    | Bộ sưu tập (Gucci Bloom Collection...) |

### 5.3. Attributes cho Mỹ phẩm (COSMETICS)

| Attribute Key  | Type        | is_variant_specific | Unit | Mô tả                        |
| -------------- | ----------- | ------------------- | ---- | ---------------------------- |
| `skin_type`    | MULTISELECT | false               | -    | Loại da (Da dầu/Da khô...)   |
| `skin_concern` | MULTISELECT | false               | -    | Vấn đề da (Mụn/Nám/Nhăn...)  |
| `ingredients`  | TEXT        | false               | -    | Thành phần chính             |
| `spf`          | SELECT      | false               | -    | Chỉ số SPF (nếu có)          |
| `texture`      | SELECT      | false               | -    | Kết cấu (Gel/Cream/Serum...) |

### 5.4. Attributes dùng cho Variant (is_variant_specific = true)

| Attribute Key | Type   | is_variant_specific | Unit | Mô tả                                      |
| ------------- | ------ | ------------------- | ---- | ------------------------------------------ |
| `volume`      | SELECT | true                | ml   | Dung tích (50ml, 100ml...)                 |
| `packaging`   | SELECT | true                | -    | Loại đóng gói (Full box/Tester/Giftset...) |

---

## 6. KẾ HOẠCH TRIỂN KHAI

### 6.1. Phase 1: Backend Refactoring ✅ (Đã hoàn thành một phần)

#### **1.1. Database Migration**

- [x] Tạo migration `V15__add_product_fields.sql`
- [ ] Tạo migration `V16__migrate_product_data.sql`
- [ ] Tạo migration `V17__remove_variant_fields.sql`
- [ ] Test migration trên database dev

#### **1.2. Entity & DTO Updates**

- [ ] Cập nhật `Product.java` entity
- [ ] Cập nhật `ProductVariant.java` entity (xóa fields)
- [ ] Cập nhật `ProductDTO.java`
- [ ] Cập nhật `ProductMapper.java`
- [ ] Cập nhật `ProductServiceImpl.java`

#### **1.3. Service Logic**

- [ ] Cập nhật logic tạo Product (auto-generate name, slug)
- [ ] Cập nhật logic tạo Variant (auto-generate variantName, slug)
- [ ] **Cascade Update Logic:**
  - [ ] Khi Product name thay đổi → Auto update tất cả Variant names
  - [ ] Khi Brand name thay đổi → Cascade update Product → Variant names
  - [ ] Khi Concentration thay đổi → Cascade update Product → Variant names
  - [ ] Thêm flag `is_name_manually_edited` để tránh override khi user đã chỉnh sửa thủ công
- [ ] **SKU Generation:**
  - [ ] Implement `ProductVariantService.generateSKU()` method
  - [ ] Auto-generate SKU khi tạo Variant mới (nếu để trống)
  - [ ] Format: `[BrandCode]-[ProductCode]-[ConcentrationCode]-[Volume]-[Type]`
  - [ ] Validation: SKU phải UNIQUE
- [ ] **Cached Attributes:**
  - [ ] Implement `ProductVariantService.updateCachedAttributes()` method
  - [ ] Merge Product attributes + Variant attributes vào JSONB
  - [ ] Auto-update khi Product attributes thay đổi (cascade to all variants)
  - [ ] Auto-update khi Variant attributes thay đổi (chỉ variant đó)
  - [ ] Tạo GIN index cho `cached_attributes` JSONB field
- [ ] Cập nhật validation (category, concentration required)
- [ ] Cập nhật search/filter logic

### 6.2. Phase 2: Attribute Setup ✅ (Đã hoàn thành)

- [x] Module Attribute Management hoàn chỉnh
- [x] Hỗ trợ Domain (PERFUME/COSMETICS/COMMON)
- [x] Form Smart cho Attribute
- [ ] Tạo các Attribute chuẩn cho Nước hoa (checklist bên dưới)
- [ ] Tạo các Attribute chuẩn cho Mỹ phẩm (nếu cần)

### 6.3. Phase 3: Admin UI Product Management

#### **3.1. Product List Page**

- [ ] Table hiển thị danh sách Products
- [ ] Filter theo Brand, Category, Concentration, Status
- [ ] Search theo tên, SKU
- [ ] Pagination
- [ ] Actions: View, Edit, Delete, Duplicate

#### **3.2. Product Detail Page (2 Tabs)**

**Tab 1: Thông tin chung (Product)**

- [ ] Form nhập:
  - Tên sản phẩm (auto từ Brand + Base Name + Concentration)
  - Thương hiệu (dropdown)
  - Danh mục (dropdown, required)
  - Nồng độ (dropdown, required)
  - Slug (auto-generate, có thể chỉnh sửa)
  - Meta title, Meta description
  - Full description (rich text editor)
  - Upload ảnh sản phẩm
- [ ] Section: Gán Attributes cấp Product
  - Form chọn các Attribute (PERFUME domain)
  - Hiển thị dạng cards/tags
  - Support MULTISELECT

**Tab 2: Biến thể (Variants)**

- [ ] Table hiển thị các Variants
- [ ] Form thêm/sửa Variant:
  - Variant name (auto từ Product name + Volume + Suffix)
  - Slug (auto-generate)
  - SKU (required, unique)
  - Barcode
  - Volume (ml)
  - Price, Sale price, Cost price
  - Stock quantity
  - Short description
  - Is default checkbox
  - Display order
- [ ] Actions: Add, Edit, Delete, Set Default

#### **3.3. Smart Form Features**

- [ ] Auto-generate Product name từ Brand + Base Name + Concentration
- [ ] Auto-generate Product slug từ name
- [ ] Auto-generate Variant name từ Product name + Volume + Suffix
- [ ] Auto-generate Variant slug từ variantName
- [ ] **Auto-generate SKU** từ công thức: `[BrandCode]-[ProductCode]-[ConcentrationCode]-[Volume]-[Type]`
- [ ] **Cascade update Variant names** khi Product name/Brand/Concentration thay đổi
- [ ] **Auto-update cached_attributes** khi Product/Variant attributes thay đổi
- [ ] Validation: Category và Concentration bắt buộc khi tạo Product
- [ ] Validation: SKU phải UNIQUE
- [ ] Warning khi xóa Product có Variants

### 6.4. Phase 4: Testing & Documentation

- [ ] Unit tests cho ProductService
- [ ] Integration tests cho Product API
- [ ] E2E tests cho Admin UI
- [ ] Documentation cho Admin users
- [ ] Migration guide từ hệ thống cũ

---

## 7. CHECKLIST CHI TIẾT

### 7.1. Checklist: Tạo Attributes cho Nước hoa

Sử dụng form **"Thêm thuộc tính mới"** trong Admin → Thuộc tính → Tab "Nước hoa":

#### **A. Thông tin cơ bản**

- [ ] `gender` - SELECT, Domain: PERFUME, is_variant_specific: false
  - Values: Nam, Nữ, Unisex
- [ ] `origin` - SELECT, Domain: PERFUME, is_variant_specific: false
  - Values: Pháp, Ý, Mỹ, Anh, Tây Ban Nha, Đức, Thụy Sĩ, Nhật Bản, Hàn Quốc...
- [ ] `year_released` - TEXT, Domain: PERFUME, is_variant_specific: false
- [ ] `perfumer` - TEXT, Domain: PERFUME, is_variant_specific: false

#### **B. Mùi hương**

- [ ] `fragrance_family` - MULTISELECT, Domain: PERFUME, is_variant_specific: false
  - Values: Hoa (Floral), Gỗ (Woody), Xạ hương (Oriental), Tươi mát (Fresh), Cam quýt (Citrus), Gourmand, Chypre, Fougère...
- [ ] `main_accords` - MULTISELECT, Domain: PERFUME, is_variant_specific: false
  - Values: White floral, Powdery, Musky, Woody, Spicy, Fruity, Green, Aquatic, Aromatic...
- [ ] `top_notes` - MULTISELECT, Domain: PERFUME, is_variant_specific: false
  - Values: Bergamot, Lemon, Orange, Grapefruit, Blackcurrant, Pink pepper, Lavender...
- [ ] `middle_notes` - MULTISELECT, Domain: PERFUME, is_variant_specific: false
  - Values: Rose, Jasmine, Tuberose, Ylang-Ylang, Lily, Peony, Violet, Iris...
- [ ] `base_notes` - MULTISELECT, Domain: PERFUME, is_variant_specific: false
  - Values: Musk, Sandalwood, Cedar, Patchouli, Vanilla, Amber, Tonka bean, Vetiver...

#### **C. Đặc tính**

- [ ] `longevity` - SELECT, Domain: PERFUME, is_variant_specific: false, Unit: giờ
  - Values: Đến 4 giờ, 4-6 giờ, 6-8 giờ, Trên 8 giờ
- [ ] `sillage` - SELECT, Domain: PERFUME, is_variant_specific: false
  - Values: Rất gần (skin scent), ~1 mét, 1-2 mét, Trên 2 mét
- [ ] `intensity_level` - SELECT, Domain: PERFUME, is_variant_specific: false
  - Values: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

#### **D. Phong cách & Dịp**

- [ ] `style` - MULTISELECT, Domain: PERFUME, is_variant_specific: false
  - Values: Lãng mạn, Nữ tính, Cá tính, Thanh lịch, Tươi mát, Ấm áp, Quyến rũ, Trẻ trung, Trưởng thành...
- [ ] `season` - MULTISELECT, Domain: PERFUME, is_variant_specific: false
  - Values: Xuân, Hạ, Thu, Đông
- [ ] `occasion` - MULTISELECT, Domain: PERFUME, is_variant_specific: false
  - Values: Hàng ngày, Văn phòng, Hẹn hò, Dự tiệc, Du lịch, Thể thao, Tối, Sáng...

#### **E. Bộ sưu tập**

- [ ] `collection` - MULTISELECT, Domain: PERFUME, is_variant_specific: false
  - Values: (Tạo theo từng bộ sưu tập thực tế: Gucci Bloom Collection, Dior Sauvage Collection...)

#### **F. Variant-specific**

- [ ] `volume` - SELECT, Domain: PERFUME, is_variant_specific: **true**, Unit: ml
  - Values: 10ml, 30ml, 50ml, 60ml, 75ml, 100ml, 125ml, 200ml...
- [ ] `packaging` - SELECT, Domain: PERFUME, is_variant_specific: **true**
  - Values: Full box, Tester, Giftset, Chiết, Limited edition...

### 7.2. Checklist: Tạo Product mới (Admin Workflow)

#### **Bước 1: Tạo Product (Cha)**

1. [ ] Vào Admin → Sản phẩm → "Thêm sản phẩm mới"
2. [ ] Tab "Thông tin chung":
   - [ ] Chọn Thương hiệu (Brand)
   - [ ] Nhập Tên cơ bản (Base Name) - ví dụ: "Sauvage"
   - [ ] Chọn Nồng độ (Concentration) - ví dụ: "EDP"
   - [ ] Hệ thống tự động tạo: Tên = "Dior Sauvage EDP", Slug = "dior-sauvage-edp"
   - [ ] Chọn Danh mục (Category) - ví dụ: "Nước hoa Nam"
   - [ ] Nhập Meta title, Meta description
   - [ ] Nhập Full description (bài viết chi tiết)
   - [ ] Upload ảnh sản phẩm
3. [ ] Section "Thuộc tính sản phẩm":
   - [ ] Chọn các Attribute đã tạo:
     - [ ] Giới tính: Nam
     - [ ] Xuất xứ: Pháp
     - [ ] Năm phát hành: 2015
     - [ ] Nhóm hương: Gỗ, Xạ hương
     - [ ] Hương đầu: Bergamot, Pink pepper
     - [ ] Hương giữa: Lavender, Geranium
     - [ ] Hương cuối: Ambroxan, Cedar
     - [ ] Độ lưu hương: 6-8 giờ
     - [ ] Độ tỏa hương: 1-2 mét
     - [ ] Phong cách: Cá tính, Thanh lịch
     - [ ] Mùa: Xuân, Hạ, Thu, Đông
     - [ ] Dịp: Hàng ngày, Văn phòng
4. [ ] Click "Lưu" để tạo Product

#### **Bước 2: Tạo Variants (Con)**

1. [ ] Tab "Biến thể"
2. [ ] Click "Thêm biến thể mới"
3. [ ] Nhập thông tin:
   - [ ] Volume: 100ml
   - [ ] Suffix: (để trống hoặc nhập "Chiết", "Tester"...)
   - [ ] Hệ thống tự động tạo: Variant name = "Dior Sauvage EDP 100ml", Slug = "dior-sauvage-edp-100ml"
   - [ ] SKU: DIOR-SAUVAGE-EDP-100ML
   - [ ] Barcode: (nếu có)
   - [ ] Price: 3.500.000
   - [ ] Sale price: (nếu có)
   - [ ] Stock quantity: 50
   - [ ] Short description: (để trống hoặc nhập "Full box chính hãng")
   - [ ] Is default: ✓ (nếu là variant mặc định)
   - [ ] Display order: 1
4. [ ] Click "Lưu" để tạo Variant
5. [ ] Lặp lại cho các dung tích khác (60ml, 10ml Chiết...)

### 7.3. Checklist: Migration Database

#### **Trước khi migration:**

- [ ] Backup database đầy đủ
- [ ] Test migration trên database dev/staging
- [ ] Review script migration với team

#### **Thực hiện migration:**

- [ ] Chạy `V15__add_product_fields.sql`
- [ ] Verify: Kiểm tra các cột mới đã được thêm vào `products`
- [ ] Chạy `V16__migrate_product_data.sql`
- [ ] Verify: Kiểm tra dữ liệu đã được copy đúng từ variants về products
- [ ] Test: Tạo Product mới với category và concentration
- [ ] Chạy `V17__remove_variant_fields.sql` (sau khi confirm dữ liệu OK)
- [ ] Verify: Kiểm tra các cột đã được xóa khỏi `product_variants`

#### **Sau khi migration:**

- [ ] Update Entity classes
- [ ] Update DTOs và Mappers
- [ ] Update Service logic
- [ ] Test API endpoints
- [ ] Update Frontend components

---

## 8. GHI CHÚ & MỞ RỘNG TƯƠNG LAI

### 8.1. Các Module liên quan

- **Review & Rating Module**

  - Hiển thị đánh giá và rating cho Product
  - Tính toán `average_rating`, `total_reviews` trong `product_stats`

- **Promotion Module**

  - Áp dụng khuyến mãi cho Product hoặc Category
  - Tính giá sau khuyến mãi cho Variant

- **Inventory Module**

  - Quản lý tồn kho chi tiết (warehouse, bin location)
  - Tracking lịch sử nhập/xuất kho

- **Search & Filter Storefront**
  - Filter sản phẩm theo Attribute (gender, fragrance_family, price range...)
  - Search full-text trong `full_description`
  - Sort theo: Giá, Độ phổ biến, Rating, Mới nhất

### 8.2. Tối ưu hóa

- **Caching:**

  - Cache `cached_attributes` (JSONB) cho Product và Variant
  - Cache danh sách Products theo Category/Brand
  - Redis cache cho search results

- **Performance:**

  - Index cho các trường thường xuyên filter (category_id, concentration_id, status)
  - Pagination cho Product list
  - Lazy loading cho Product images

- **SEO:**
  - Auto-generate `meta_title` và `meta_description` từ Product name và description
  - Sitemap cho Products
  - Structured data (JSON-LD) cho Product pages

---

**File này là tài liệu định hướng chính thức cho Module Product Management. Cập nhật khi có thay đổi về thiết kế hoặc quy trình.**
