# 📦 Tổng Quan Kế Hoạch Triển Khai

Tài liệu này mô tả chi tiết phạm vi, roadmap và checklist triển khai cho **3 khối chính** của hệ thống Orchard Store:

1. `Backend (Spring Boot API)`
2. `Admin Dashboard (Next.js)`
3. `Orchard Storefront (Next.js/React - giao diện khách hàng)`

Mỗi phần đều trình bày: mục tiêu, kiến trúc, hạng mục công việc, thứ tự ưu tiên và tiêu chí bàn giao.

---

## 1. Backend (Spring Boot)

### 1.1. Mục Tiêu

- Cung cấp API REST cho Admin và Storefront.
- Đảm bảo RBAC, JWT auth, OTP guest login, rate limiting.
- Hỗ trợ schema Supabase với Flyway và JSONB caching cho search.

### 1.2. Kiến Trúc & Thành phần chính

- Modules: Auth, Catalog (Products/Variants/Attributes), Orders, Customers/VIP, Inventory, Promotion, Analytics.
- Công nghệ: Spring Boot 3.5, JPA/Hibernate, Hypersistence Utils, Redis, PostgreSQL Supabase, Flyway.
- Phụ trợ: Image upload (local/S3), Email service (SMTP), Event-driven (CLV update).

### 1.3. Roadmap triển khai

| Giai đoạn | Hạng mục                     | Mô tả                                                                 |
| --------- | ---------------------------- | --------------------------------------------------------------------- |
| ✅        | Flyway V1 schema             | Tích hợp customer_id vào carts/promotion_usage, tạo toàn bộ bảng core |
| ✅        | Auth & RBAC                  | JWT login, OTP guest, Redis rate limit                                |
| ✅        | Product Admin API            | `ProductAdminController`, DTO/MapStruct, Image upload                 |
| ✅        | Product Store API            | `/api/store/products/**` với hybrid filters                           |
| ✅        | Cart & Checkout              | Rate limit addToCart, promotion validation, checkout engine           |
| ⚙️        | Admin endpoints bổ sung      | Brand/Category CRUD, Promotion CRUD, Member tier                      |
| ⚙️        | Order/Customer API cho admin | Filter/sort orders, customer LTV, VIP history                         |
| ⚙️        | Analytics API                | Aggregate metrics (conversion, top selling)                           |

### 1.4. Checklist bàn giao backend

- [ ] Flyway scripts + hướng dẫn chạy.
- [ ] Swagger/OpenAPI hoặc Postman collection.
- [ ] Scripts seed (default admin/user).
- [ ] Monitoring: Actuator `/actuator/health`, metrics.
- [ ] Tài liệu `.md` đồng bộ (DOCUMENTATION.md, BACKEND_IMPLEMENTATION_STATUS.md).

---

## 2. Admin Dashboard (Next.js)

### 2.1. Mục Tiêu

- Giao diện quản trị tập trung (sản phẩm, đơn hàng, khách hàng, promotion).
- Sử dụng token admin (`ROLE_ADMIN`/`ROLE_STAFF`), phân quyền menu theo role.
- Trải nghiệm mượt (React Query, form validation rõ ràng).

### 2.2. Stack & Thư viện

- Next.js 14 (App Router).
- UI: Ant Design / Material UI + styled components.
- State/Data: TanStack Query, Zustand (nếu cần), Axios interceptor.
- Form: React Hook Form + Zod.
- Build & lint: ESLint, Prettier, Husky.

### 2.3. Roadmap chi tiết

| Pha | Nội dung                    | Bước chi tiết                                                                          |
| --- | --------------------------- | -------------------------------------------------------------------------------------- |
| 1   | **Flow đăng nhập + layout** | Login page, JWT storage, axios interceptors, layout với sidebar                        |
| 2   | **Brand & Category**        | CRUD, upload logo/icon, tree view category                                             |
| 3   | **Product Admin**           | Listing + filters, form create/update (stepper), attribute picker, image upload        |
| 4   | **Promotion & Pricing**     | Voucher CRUD, member tier management, usage log viewer                                 |
| 5   | **Orders & Customers**      | Order board, detail modal, actions (confirm/shipping). Customer profile & VIP progress |
| 6   | **Inventory**               | Warehouse list, stock adjustments, alerts, pre-order handling                          |
| 7   | **Analytics**               | Dashboard cards, charts (sales, conversion, top products)                              |
| 8   | **System settings**         | User management, roles, audit log, content management                                  |

### 2.4. Checklist giao từng module

- API integration (success/error handling chuẩn).
- Form validation + UX states (loading, disabled, success toast).
- Unit test component chính (Jest/RTL).
- Storybook (nếu dùng design system).
- Release notes + cập nhật ADMIN_PANEL_DEVELOPMENT_PLAN.md.

### 2.5. Tiến độ đã hoàn thành (11/2025)

- **Enterprise folder structure** cho `orchard-admin-dashboad` (route groups `(auth)/(admin)/(store)`, `api/health`, `not-found`, `providers/query-provider`, `components/{shared,admin,store}`, `hooks`, `stores`, `services`, `types`, `lib/constants.ts`).
- **Auth foundation**: Zustand store mới (`stores/auth-store.ts`, `stores/cart-store.ts`), custom hooks (`use-auth`, `use-cart`), axios client (`lib/axios-client.ts`) với interceptor và `forceLogout`.
- **Login Experience**: Shadcn/Tailwind UI theo Saledash, RHF + Zod, toast feedback, gọi `/api/auth/login`.
- **Dashboard shell**: Sidebar/Header responsive, collapse + mobile drawer, constants-driven menu, admin quick actions.
- **Admin UI placeholders**: shared Logo/Spinner, admin StatsCard/Chart, store ProductCard (Next Image) & CartItem, storefront route stub.
- **Docs & configs**: `components.json`, `tailwind.config.ts`, `.env.local`, README + ADMIN_DASHBOARD_SETUP_GUIDE cập nhật flow mới.

---

## 3. Orchard Storefront (Next.js)

### 3.1. Mục Tiêu

- Giao diện khách hàng với focus search performance, filter mạnh, checkout OTP.
- Kết nối trực tiếp API `/api/store/**`.
- SEO, Lighthouse cao, responsive mobile.

### 3.2. Kiến trúc trang

- Pages chính: Home, Brand listing, Category listing, Product detail (variant slug), Search results.
- Cart/Checkout: giỏ hàng session + merge khi login, OTP login, payment options placeholder.
- Profile khách hàng: `/store/profile/me`, `/store/profile/orders`.

### 3.3. Lộ trình triển khai

| Bước | Nội dung           | Chi tiết                                                                |
| ---- | ------------------ | ----------------------------------------------------------------------- |
| 1    | Foundation         | Layout, theming, SEO metadata, dynamic routing (slug), i18n (nếu cần).  |
| 2    | Home + listing     | Banner, featured products, category sections, skeleton loading.         |
| 3    | Filter/Search      | Form filter (brand, category, price, attrs), connect API hybrid search. |
| 4    | Product detail     | Variant selector, image gallery, stock status, add-to-cart actions.     |
| 5    | Cart & Checkout    | Cart drawer/page, OTP login flow, summary breakdown (VIP + voucher).    |
| 6    | Customer dashboard | Profile (VIP progress), order history, OTP resend, logout.              |
| 7    | Extras             | Wishlist, review system, blog/cms integration nếu cần.                  |

### 3.4. Checklist chất lượng

- SEO: meta tags, OpenGraph, structured data (Product schema).
- Performance: code-splitting, image optimization, caching.
- Accessibility: semantic HTML, keyboard navigation.
- Tracking: GTM/GA events for view/click/add-to-cart.

---

## 4. Phối hợp liên hệ giữa 3 khối

- **API Contract**: Mỗi endpoint dùng bởi Admin/Storefront phải có schema rõ, ghi chú trong DOCUMENTATION.md.
- **State đồng bộ**: Khi backend đổi DTO, admin & storefront cần upgrade đồng bộ → maintain changelog.
- **Testing chéo**:
  - Backend: viết integration tests cho endpoints dùng chung.
  - Admin & Storefront: dùng môi trường staging chung (Supabase schema copy) để UAT.
- **Deployment pipeline**:
  1. Backend build (mvn package) + Flyway migration.
  2. Admin build (npm run build) → deploy.
  3. Storefront build.
  4. Smoke tests (đăng nhập admin, create product, hiển thị ở storefront).

---

## 5. Ghi chú & Next Steps

- Cập nhật file này khi có thay đổi lớn (schema, scope).
- Mỗi sprint nên trích `Checklist` tương ứng đưa vào Jira/Trello để theo dõi chi tiết.
- Ưu tiên:
  1. Ổn định backend + Postgres (đã run).
  2. Dev module Auth + Product Admin trên Dashboard.
  3. Song song build Storefront Home + Product detail để test pipeline.

> Nếu cần bản chi tiết hơn cho từng module (ví dụ Product Admin Step-by-step), hãy mở thêm tài liệu con hoặc mở rộng `ADMIN_PANEL_DEVELOPMENT_PLAN.md`. Tài liệu này giữ vai trò “tổng quan hành trình” cho cả 3 khối.
