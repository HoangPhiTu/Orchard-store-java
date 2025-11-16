# 📚 Tài Liệu Kỹ Thuật - Orchard Store

Tài liệu kỹ thuật chi tiết cho Orchard Store E-Commerce Platform.

---

## 📋 Mục Lục

- [Bean Validation](#-bean-validation)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)

---

## ✅ Bean Validation

### 🎯 Bean Validation Là Gì?

**Bean Validation** (Jakarta Bean Validation) là một framework Java để **validate dữ liệu tự động** trước khi xử lý business logic. Thay vì viết code kiểm tra thủ công, bạn chỉ cần thêm **annotations** vào các field trong DTO.

---

### ❓ Tại Sao Cần Bean Validation?

#### **Vấn Đề Khi KHÔNG Có Validation:**

```java
// ❌ Code cũ - Phải kiểm tra thủ công
@PostMapping("/api/brands")
public ResponseEntity<BrandDTO> createBrand(@RequestBody BrandDTO brandDTO) {
    // Phải kiểm tra từng field
    if (brandDTO.getName() == null || brandDTO.getName().trim().isEmpty()) {
        return ResponseEntity.badRequest().body("Tên không được để trống");
    }
    if (brandDTO.getName().length() < 2 || brandDTO.getName().length() > 255) {
        return ResponseEntity.badRequest().body("Tên phải từ 2-255 ký tự");
    }
    // ... và còn nhiều nữa
    
    return brandService.createBrand(brandDTO);
}
```

**Nhược điểm:**
- ❌ Code dài dòng, khó maintain
- ❌ Dễ quên kiểm tra một số field
- ❌ Lỗi không nhất quán
- ❌ Khó tái sử dụng

#### **Giải Pháp Với Bean Validation:**

```java
// ✅ Code mới - Validation tự động
@PostMapping("/api/brands")
public ResponseEntity<BrandDTO> createBrand(@Valid @RequestBody BrandDTO brandDTO) {
    // Validation đã được xử lý tự động!
    // Nếu không hợp lệ, sẽ throw MethodArgumentNotValidException
    // và GlobalExceptionHandler sẽ xử lý
    return brandService.createBrand(brandDTO);
}
```

**Ưu điểm:**
- ✅ Code ngắn gọn, dễ đọc
- ✅ Validation tự động, không thể quên
- ✅ Thông báo lỗi nhất quán
- ✅ Dễ tái sử dụng

---

### 📋 Các Annotation Validation Phổ Biến

#### 1. **@NotBlank** - Không được để trống (String)

```java
@NotBlank(message = "Tên thương hiệu không được để trống")
private String name;
```

**Kiểm tra:**
- ✅ Không null
- ✅ Không phải chuỗi rỗng ""
- ✅ Không phải chuỗi chỉ có khoảng trắng "   "

---

#### 2. **@NotNull** - Không được null (Object)

```java
@NotNull(message = "Brand ID không được để trống")
@Positive(message = "Brand ID phải là số dương")
private Long brandId;
```

---

#### 3. **@Size** - Kiểm tra độ dài

```java
@Size(min = 2, max = 255, message = "Tên sản phẩm phải từ 2 đến 255 ký tự")
private String name;
```

---

#### 4. **@Pattern** - Kiểm tra regex

```java
@Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", 
         message = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang")
private String slug;
```

---

#### 5. **@Min / @Max** - Kiểm tra số nguyên

```java
@Min(value = 0, message = "Số lượng tồn kho phải >= 0")
@Max(value = 10000, message = "Ngưỡng tồn kho thấp phải <= 10000")
private Integer stockQuantity;
```

---

#### 6. **@DecimalMin / @DecimalMax** - Kiểm tra số thập phân

```java
@DecimalMin(value = "0.0", inclusive = true, message = "Giá gốc phải >= 0")
@Digits(integer = 13, fraction = 2, message = "Giá không hợp lệ")
private BigDecimal basePrice;
```

---

#### 7. **@Digits** - Kiểm tra số chữ số

```java
@Digits(integer = 13, fraction = 2, message = "Giá không hợp lệ")
private BigDecimal price;
```

---

#### 8. **@Positive / @Negative** - Số dương/âm

```java
@Positive(message = "Brand ID phải là số dương")
private Long brandId;
```

---

#### 9. **@Email** - Kiểm tra email

```java
@Email(message = "Email không hợp lệ")
private String email;
```

---

#### 10. **@Valid** - Validate nested objects

```java
@Valid
@Builder.Default
private List<ProductImageDTO> images = new ArrayList<>();
```

---

### 🔄 Workflow Validation

```
1. Client gửi POST /api/brands với dữ liệu không hợp lệ
2. Spring nhận request → Parse JSON → Tạo BrandDTO object
3. Spring kiểm tra @Valid annotation → Gọi Bean Validation framework
4. Validation framework kiểm tra từng field
5. Nếu có lỗi → Throw MethodArgumentNotValidException
6. GlobalExceptionHandler bắt exception → Tạo error response
7. Trả về cho client với chi tiết lỗi theo từng field
```

---

### 📝 Ví Dụ Response Khi Validation Fail

```json
{
  "timestamp": "2024-01-20T10:00:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường sau:",
  "errors": {
    "name": "Tên thương hiệu không được để trống",
    "slug": "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
    "basePrice": "Giá gốc phải >= 0"
  }
}
```

---

### 🎯 Lợi Ích

1. **Bảo Mật**: Ngăn chặn SQL Injection, XSS, invalid data
2. **Data Integrity**: Đảm bảo dữ liệu đúng format trước khi lưu
3. **User Experience**: Thông báo lỗi rõ ràng, dễ hiểu
4. **Developer Experience**: Code ngắn gọn, dễ maintain

---

### ✅ Đã Implement

- ✅ BrandDTO - Validate name, slug, URLs, status
- ✅ CategoryDTO - Validate name, slug, URLs, status
- ✅ ProductDTO - Validate name, slug, prices, brandId, categoryId
- ✅ ProductVariantDTO - Validate SKU, price, stock, dimensions
- ✅ ProductImageDTO - Validate imageUrl, displayOrder
- ✅ GlobalExceptionHandler - Xử lý validation errors

---

## 🗄️ Database Schema

Xem chi tiết tại: **[DATABASE_SCHEMA_ENHANCED.md](./DATABASE_SCHEMA_ENHANCED.md)**

### Tổng Quan

- **38 tables** bao gồm:
  - Core entities (Brands, Categories, Products)
  - Dynamic attributes system
  - Inventory intelligence
  - Product bundling
  - Analytics & SEO
  - VIP customer system
  - Order management

### Đặc Điểm

- ✅ Simplified Authentication (khách hàng không cần đăng ký)
- ✅ VIP Customer System (tự động nâng cấp tier)
- ✅ Email Verification cho orders
- ✅ Database functions & triggers tự động

---

## 🔌 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication
- **Admin/Staff**: JWT authentication (chưa implement)
- **Customers**: Không cần đăng ký, xác thực qua email verification code

### Endpoints

Xem chi tiết tại: **[README.md](./README.md#-api-endpoints)**

---

**Last Updated**: 2024-01-20

