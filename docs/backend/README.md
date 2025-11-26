# 🔧 Backend Documentation Index

> **Complete guide to Orchard Store Backend**

---

## 📚 Documentation Files

| File                                                 | Description                                        | Status      |
| ---------------------------------------------------- | -------------------------------------------------- | ----------- |
| [BE_ARCHITECTURE.md](./BE_ARCHITECTURE.md)           | Architecture overview, tech stack, design patterns | ✅ Complete |
| [BE_DATABASE_SCHEMA.md](./BE_DATABASE_SCHEMA.md)     | Complete database schema with ERD diagrams         | ✅ Complete |
| [BE_API_SPECS.md](./BE_API_SPECS.md)                 | API specifications (Auth & User modules)           | ✅ Complete |
| [JSONB_BEST_PRACTICES.md](./JSONB_BEST_PRACTICES.md) | JSONB usage, query patterns, optimization          | ✅ Complete |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)           | Flyway migration best practices                    | ✅ Complete |
| [MINIO_GUIDE.md](./MINIO_GUIDE.md)                   | MinIO setup, image upload, troubleshooting         | ✅ Complete |

---

## 🎯 Reading Order

### For New Backend Developers

1. **Start:** [BE_ARCHITECTURE.md](./BE_ARCHITECTURE.md)

   - Understand tech stack
   - Learn architecture style (Modular Monolith)
   - See project structure
   - Review design patterns

2. **Database:** [BE_DATABASE_SCHEMA.md](./BE_DATABASE_SCHEMA.md)

   - Understand RBAC system
   - Learn Hybrid EAV pattern
   - See all tables and relationships
   - Review indexing strategy

3. **API Specs:** [BE_API_SPECS.md](./BE_API_SPECS.md)

   - Auth endpoints (login, OTP, reset password)
   - User CRUD endpoints
   - Request/response examples
   - Error codes & messages

4. **JSONB Deep Dive:** [JSONB_BEST_PRACTICES.md](./JSONB_BEST_PRACTICES.md)

   - Learn when to use JSONB
   - Query patterns and operators
   - Performance optimization
   - Common pitfalls

5. **Migrations:** [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
   - How to create migrations
   - Naming conventions
   - Best practices
   - Common mistakes

---

## 🛠️ Tech Stack Summary

| Technology          | Version | Purpose               |
| ------------------- | ------- | --------------------- |
| Java                | 21 LTS  | Programming language  |
| Spring Boot         | 3.5.7   | Application framework |
| Hibernate           | 6.3     | ORM                   |
| PostgreSQL          | 16      | Database (Supabase)   |
| Flyway              | Auto    | Database migration    |
| Hypersistence Utils | 3.7.2   | JSONB support         |
| MapStruct           | 1.5.5   | DTO mapping           |
| JJWT                | 0.12.3  | JWT authentication    |
| Slugify             | 3.0.2   | URL-friendly slugs    |

---

## 📐 Architecture Highlights

### Modular Monolith

```
orchard-store-backend/
├── modules/
│   ├── auth/          # Authentication & User Management
│   ├── product/       # Catalog Management
│   ├── shopping/      # Orders & Cart
│   └── customer/      # Customer Management
├── config/            # Configuration
├── security/          # Security (JWT, filters)
└── exception/         # Global exception handling
```

**Benefits:**

- ✅ Simple deployment (single JAR)
- ✅ Easy development (no microservices complexity)
- ✅ Clear module boundaries
- ✅ Can extract to microservices later

---

## 🗄️ Database Design Highlights

### RBAC (Role-Based Access Control)

```
users <-> user_roles <-> roles

Features:
- Hierarchy levels (1-10, higher = more power)
- JSONB permissions (flexible)
- Many-to-many (user can have multiple roles)
- Self-edit exception (user can edit themselves)
```

### Hybrid EAV (Product Attributes)

```
EAV Tables:
product_attributes -> attribute_values -> product_attribute_values

+

JSONB Cache:
product_variants.cached_attributes (for fast queries)

Benefits:
- Flexible schema (add attributes without ALTER TABLE)
- Fast queries (GIN index on JSONB)
- Best of both worlds (normalized + denormalized)
```

### GIN Indexes (JSONB Optimization)

```sql
CREATE INDEX idx_variants_cached_attributes_gin
    ON product_variants USING GIN (cached_attributes);

-- Fast queries:
WHERE cached_attributes @> '{"color": "red"}'::jsonb
```

**Performance:** 5ms vs 500ms (100x faster!)

---

## 🔐 Email Change OTP Flow (0.3.1+)

| Layer      | File / Endpoint                                                                      | Responsibility                                                                                                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Service    | `AdminOtpService`                                                                    | `initiateEmailChange` kiểm tra email trùng, generate 6-digit OTP, lưu Redis key `email_change_otp:{userId}:{newEmail}` (TTL 5 phút) và gửi mail mới qua `EmailService.sendEmailChangeOtp`. `confirmEmailChange` đọc OTP, validate, cập nhật email user và xóa key. |
| Controller | `POST /api/admin/users/{id}/email/init`<br>`POST /api/admin/users/{id}/email/verify` | Chỉ `hasRole('SUPER_ADMIN')` mới truy cập. Path id phải trùng body userId để tránh spoof.                                                                                                                                                                          |
| DTO        | `EmailChangeInitRequest`, `EmailChangeVerifyRequest`                                 | Chuẩn hóa dữ liệu vào (userId, newEmail, otp).                                                                                                                                                                                                                     |
| Security   | `UserAdminServiceImpl.checkHierarchyPermission`                                      | SUPER_ADMIN chỉ có thể đổi email của chính họ; các cấp thấp hơn bị chặn.                                                                                                                                                                                           |

**Lưu ý:** Backend chỉ cập nhật DB sau khi OTP hợp lệ → không còn luồng đổi email silent.

## 📜 User Login History API (0.3.1+)

| Layer      | File / Endpoint                                 | Responsibility                                                                                                                                           |
| ---------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository | `LoginHistoryRepository`                        | `findByUserIdOrderByLoginAtDesc(Long, Pageable)` trả `Page<LoginHistory>` đã sort theo `loginAt DESC`.                                                   |
| Mapper     | `UserAdminMapper#toLoginHistoryResponseDTO`     | Parse `userAgent` để bổ sung `browser`, `os`, `deviceType`, giữ nguyên ip/userAgent/failureReason nhằm phục vụ UI/BI.                                    |
| Service    | `UserAdminService#getUserLoginHistory`          | Validate user tồn tại, gọi repo, trả `Page<LoginHistoryResponseDTO>` với đầy đủ meta-data phục vụ tab lịch sử trong dashboard.                           |
| Controller | `GET /api/admin/users/{id}/history?page=&size=` | Chỉ ADMIN; mặc định size=10. Response bọc bằng `ApiResponse<Page<LoginHistoryResponseDTO>>`, được frontend dùng trực tiếp trong tab “Lịch sử đăng nhập”. |

Frontend sử dụng API này cho tab “Lịch sử” trong User Form → không cần gọi trực tiếp từ bảng riêng.

### Login telemetry pipeline

| Bước | Thành phần                | Mô tả                                                                                                                                                                                          |
| ---- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `AuthController#login`    | Sau mỗi lần đăng nhập (thành công, sai mật khẩu, tài khoản bị khóa) sẽ gọi `loginHistoryService.logLogin(...)` và truyền kèm `HttpServletRequest` để lấy header/IP.                            |
| 2    | `LoginHistoryServiceImpl` | Lấy IP an toàn (ưu tiên `X-Forwarded-For`), parse User-Agent bằng `UserAgentParser` (browser/os/deviceType), set `failureReason` nếu có. Ghi log trong `try/catch` để không phá vỡ luồng auth. |
| 3    | `LoginHistoryRepository`  | Lưu entity `LoginHistory` kèm metadata, phục vụ báo cáo và API `/users/{id}/history`.                                                                                                          |
| 4    | `UserAdminMapper`         | Khi trả về cho frontend, bổ sung các field đã parse sẵn để UI chỉ việc render, không cần tự phân tích user-agent.                                                                              |

---

## 🔑 Key Concepts

### 1. JSONB for Flexible Data

**Use cases:**

- Role permissions (varies by role)
- Product attributes (color, size, origin...)
- User settings
- Metadata

**Best practices:**

- ✅ Always add GIN index
- ✅ Use @> operator for queries
- ✅ Keep size < 100KB
- ✅ Validate structure in code

### 2. Hierarchy-Based Authorization

**Rules:**

```
Level 10 (SUPER_ADMIN) > Level 9 (ADMIN) > Level 7 (MANAGER) > ...

User can manage:
- Lower levels ✅
- Same level ❌
- Higher levels ❌
- Self (limited fields) ✅
```

### 3. Audit Trail

**Every table has:**

```sql
created_by BIGINT,
updated_by BIGINT,
created_at TIMESTAMP,
updated_at TIMESTAMP
```

### 4. Soft Delete

```sql
-- Use status or archived_at
UPDATE users SET status = 'INACTIVE';
UPDATE products SET archived_at = CURRENT_TIMESTAMP;

-- Not hard delete
DELETE FROM users;  -- ❌ Avoid this
```

---

## 🎓 Quick Reference

### Common Queries

**RBAC:**

```sql
-- Get user roles
SELECT r.role_code FROM user_roles ur
INNER JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id = 123 AND ur.is_active = true;

-- Check permission
WHERE permissions @> '{"products": ["create"]}'::jsonb
```

**Product Attributes:**

```sql
-- Find by attributes
WHERE cached_attributes @> '{"color": "red", "organic": true}'::jsonb

-- Get attribute value
SELECT cached_attributes ->> 'color' FROM product_variants
```

**Full-Text Search:**

```sql
-- Search product name
WHERE to_tsvector('english', variant_name) @@ to_tsquery('apple')
```

---

## 📊 Database Statistics

- **Total Tables:** 40+
- **JSONB Columns:** 10+
- **GIN Indexes:** 8+
- **Foreign Keys:** 50+
- **Migrations:** 5+

---

## 🔗 External Resources

### PostgreSQL

- [PostgreSQL 16 Documentation](https://www.postgresql.org/docs/16/)
- [JSONB Functions](https://www.postgresql.org/docs/16/functions-json.html)
- [GIN Indexes](https://www.postgresql.org/docs/16/gin.html)

### Spring Boot

- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Spring Security](https://spring.io/projects/spring-security)
- [Hibernate 6](https://hibernate.org/orm/documentation/6.3/)

### Tools

- [Flyway](https://flywaydb.org/documentation/)
- [Hypersistence Utils](https://github.com/vladmihalcea/hypersistence-utils)
- [MapStruct](https://mapstruct.org/)

---

## ✨ Summary

**What you'll learn:**

1. **Architecture** - Modular Monolith design
2. **Database** - RBAC + Hybrid EAV pattern
3. **JSONB** - Advanced PostgreSQL features
4. **Migrations** - Professional schema versioning

**Key takeaways:**

- ✅ Use JSONB for flexible data (with GIN indexes!)
- ✅ Use Hybrid EAV for product attributes
- ✅ Use Flyway for version control
- ✅ Follow best practices for performance

---

**Happy Coding! 🚀**

**Last Updated:** December 2024  
**Version:** 0.2.0  
**Maintainer:** Backend Team
