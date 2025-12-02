# Admin Product – Implementation Roadmap

Tài liệu này liệt kê các hạng mục cần hoàn thiện trước khi bắt đầu xây dựng màn quản trị sản phẩm ở FE. Kế hoạch bám sát cấu trúc CSDL chính (`V1__init_schema.sql`) và hiện trạng backend.

---

## Giai đoạn 1 – Hoàn thiện Backend (API & Logic)

### 1.1 Concentration Module

- **Mục tiêu**: đảm bảo API quản lý nồng độ nước hoa đầy đủ trước khi FE gọi.
- **Tác vụ**:
  1. Rà soát các file trong `modules/catalog/concentration` (controller, service, repository, DTO, entity).
  2. Kiểm tra và bổ sung các endpoint trong `ConcentrationController`:
     - `GET /api/admin/concentrations`: hỗ trợ phân trang + search theo tên.
     - `POST /api/admin/concentrations`: tạo mới, validate trùng `name/slug`.
     - `PUT /api/admin/concentrations/{id}`: cập nhật đầy đủ field.
     - `DELETE /api/admin/concentrations/{id}`: chặn xóa nếu đã được tham chiếu bởi `product_variants`.
  3. Đảm bảo `ConcentrationDTO` trả về đủ thông tin (`id`, `name`, `slug/code`, `description`, `intensityLevel`, `status`, `displayOrder`, timestamps).
  4. Viết test (nếu cần) cho các trường hợp: tạo trùng slug, xóa khi có sản phẩm đang dùng nồng độ.

> 📌 **Prompt Gợi ý** (dùng khi làm việc với backend):
>
> ```
> Tôi đang chuẩn bị làm module Product. Trước hết, hãy kiểm tra và hoàn thiện module Concentration (Nồng độ nước hoa) trong Backend Spring Boot.
>
> Kiểm tra Codebase: Xem các file trong modules/catalog/concentration.
>
> Yêu cầu API: Đảm bảo ConcentrationController đã có đủ các endpoint CRUD:
>
> GET /api/admin/concentrations: Lấy danh sách (có phân trang, search theo tên).
>
> POST: Tạo mới (Validate trùng tên/code).
>
> PUT: Cập nhật.
>
> DELETE: Xóa (Check ràng buộc nếu đã có sản phẩm dùng nồng độ này thì không cho xóa).
>
> DTO: Đảm bảo ConcentrationDTO trả về đủ thông tin (id, name, code, description).
> ```

---

### 1.2 Product Attributes Module

- **Mục tiêu**: chuẩn hóa hệ thống thuộc tính sản phẩm (Attribute/AttributeValue) để phục vụ variant.
- **Tác vụ**:
  1. Rà soát module `modules/catalog/attribute`.
  2. Bảo đảm quan hệ giữa `ProductAttribute` (cha) và `AttributeValue` (con) đúng như schema (`product_attributes`, `attribute_values`, `product_attribute_values`).
  3. API bắt buộc:
     - `GET /api/admin/attributes/{id}`: trả về Attribute + danh sách Values (join/EntityGraph tránh N+1).
     - `POST /api/admin/attributes`: tạo Attribute cha (validate `attribute_key` unique).
     - `POST /api/admin/attributes/{id}/values`: thêm Value con.
     - `PUT /api/admin/attributes/{id}`: **bắt buộc nested update** – nhận toàn bộ danh sách values, xử lý insert/update/delete theo ID.
  4. Logic nested update:
     - Value thiếu ID => coi là mới, `INSERT`.
     - Value có ID => `UPDATE`.
     - Value tồn tại trong DB nhưng không nằm trong payload => `DELETE` (bật `orphanRemoval = true`, cascade phù hợp).
  5. Ràng buộc dữ liệu:
     - Trước khi xoá `AttributeValue` trong nested update, kiểm tra nó có đang được tham chiếu trong `product_attribute_values` hoặc `product_variants` không. Nếu có:
       - Chặn xoá và trả về lỗi rõ ràng **hoặc**
       - Thực hiện soft delete/ẩn khỏi UI nhưng vẫn giữ foreign key (định nghĩa trong thiết kế).
     - Khi xoá Attribute cha, cũng cần kiểm tra các constraints tương tự.
  6. Validation:
     - `attribute_key` định dạng chuẩn (chữ thường/kebab-case) và unique.
     - `displayOrder/position` nếu có phải là số dương, không trùng trong cùng Attribute để bảo toàn thứ tự.
     - Value không trùng về `displayValue` hoặc `value` trong cùng Attribute.

> 📌 **Prompt Gợi ý**:
>
> ```
> Tiếp theo, hãy rà soát module Product Attributes (Thuộc tính sản phẩm) trong Backend. Đây là module quan trọng để tạo biến thể (Variant).
>
> Cấu trúc dữ liệu: Kiểm tra quan hệ giữa ProductAttribute (Cha) và AttributeValue (Con).
>
> Yêu cầu API:
>
> GET /api/admin/attributes/{id}: Phải trả về thông tin Attribute kèm theo danh sách values của nó (Eager load hoặc Fetch join để tránh N+1).
>
> POST /api/admin/attributes: Cho phép tạo Attribute cha.
>
> POST /api/admin/attributes/{id}/values: Cho phép thêm Value con vào Attribute cha.
>
> PUT /api/admin/attributes/{id}: Bắt buộc xử lý nested update. Nếu client gửi danh sách values thiếu một ID nào đó so với DB thì xóa value đó (orphanRemoval=true). Nếu value không có ID thì tạo mới. Các value có ID thì cập nhật thông tin.
>
> Validation: Attribute code phải là unique (ví dụ: 'color', 'size').
>
> Trước khi xóa Attribute/Value, hãy kiểm tra xem chúng đã được gán cho sản phẩm/variant nào chưa. Nếu có, chặn xóa hoặc chuyển sang soft delete.
> ```

---

### 1.3 Warehouses Module

- **Mục tiêu**: đảm bảo có dữ liệu kho hàng phục vụ Inventory Transaction (nhập/xuất tồn kho, set tồn ban đầu).
- **Tác vụ**:
  1. Tạo entity + bảng `warehouses` (nếu chưa có) với các field: `id`, `name`, `code` (unique), `address`, `is_default`, `status`, timestamps.
  2. Xây dựng API CRUD ` /api/admin/warehouses` (GET list + lọc, POST, PUT, DELETE/soft-delete).
  3. Business rules:
     - Luôn có ít nhất 1 warehouse mặc định (`is_default = true`); khi xoá hoặc disable phải chuyển quyền default.
     - `code` duy nhất, auto slug từ name nếu không nhập.
     - `checkUsageBeforeDelete`: nếu warehouse đã có transaction hoặc inventory records thì chặn xoá cứng, chỉ cho soft delete/disabled.
  4. Chuẩn bị service hỗ trợ Inventory Transaction (Phase sau): endpoint trả về danh sách warehouse cho dropdown nhập kho.

> 📌 **Prompt Gợi ý**:
>
> ```
> Dựa trên kế hoạch Inventory Transaction, hãy bổ sung module Warehouse ở Backend.
>
> Tasks:
> - Tạo entity + repository + controller/service cho Warehouses.
> - API: GET (paging, search), POST, PUT, DELETE/soft-delete.
> - Field: name, code (unique), address, isDefault, status.
> - Business rule: luôn có 1 kho mặc định; khi xoá kiểm tra xem warehouse đã được dùng trong inventory_transaction chưa.
> ```

---

## Giai đoạn 2 – Frontend: Service & Hooks (Lớp kết nối API)

### 2.1 Thiết lập API Client cho Attributes & Concentrations

- **Mục tiêu**: chuẩn bị type, service, hooks để UI trang quản trị có thể gọi API backend.
- **Tác vụ**:
  1. **Định nghĩa type** (`src/types/attribute.types.ts`):
     - `Attribute`, `AttributeValue`, `Concentration` – khớp với DTO backend (id, name, slug, description, intensityLevel, status…).
  2. **Service layer**:
     - `src/services/attribute.service.ts`: hàm CRUD:
       - `getAttributes` (list, filter, pagination),
       - `getAttributeById`,
       - `createAttribute`,
       - `updateAttribute`,
       - `deleteAttribute`,
       - `addAttributeValue`.
     - `src/services/concentration.service.ts`: tương tự cho concentrations.
  3. **Hooks dùng React Query**:
     - `src/hooks/use-attributes.ts`:
       - `useAttributes(filters)`, `useAttribute(id)`,
       - `useCreateAttribute`, `useUpdateAttribute`, `useDeleteAttribute`, `useAddAttributeValue`.
     - `src/hooks/use-concentrations.ts`: tương tự (list/detail/mutations).

> 📌 **Prompt Gợi ý**:
>
> ```
> Chuyển sang Frontend Next.js. Hãy tạo các file Service và Hook để kết nối với API Backend vừa rà soát.
>
> Types (src/types/attribute.types.ts):
>
> Định nghĩa interface Attribute, AttributeValue, Concentration khớp với DTO Backend.
>
> Services:
>
> src/services/attribute.service.ts: Các hàm CRUD cho Attribute.
>
> src/services/concentration.service.ts: Các hàm CRUD cho Concentration.
>
> Hooks (React Query):
>
> src/hooks/use-attributes.ts: useAttributes (list), useAttribute (detail), mutations.
>
> src/hooks/use-concentrations.ts: Tương tự.
> ```

### 2.2 Thiết lập API Client cho Warehouses

- **Mục tiêu**: nối Backend Warehouse (Phase 1.3) với UI (Phase 3.3).
- **Tác vụ**:
  1. **Định nghĩa type** (`src/types/warehouse.types.ts`):
     - `Warehouse` với các field: `id`, `name`, `code`, `address`, `isDefault`, `status`, `createdAt`, `updatedAt`.
  2. **Service layer** (`src/services/warehouse.service.ts`):
     - `getWarehouses` (list, filter, pagination),
     - `getWarehouseById`,
     - `createWarehouse`,
     - `updateWarehouse`,
     - `deleteWarehouse` (_soft delete_ hoặc `archiveWarehouse` nếu cần),
     - optional helper `setDefaultWarehouse` nếu backend có endpoint chuyên biệt.
  3. **Hooks React Query** (`src/hooks/use-warehouses.ts`):
     - `useWarehouses(filters)`, `useWarehouse(id)`,
     - `useCreateWarehouse`, `useUpdateWarehouse`, `useDeleteWarehouse`.
  4. Đồng bộ cache với các dropdown nhập hàng sử dụng chung dữ liệu kho.

> 📌 **Prompt Gợi ý**:
>
> ```
> Tôi đang bổ sung module Warehouses cho Inventory Transaction. Hãy tạo type/service/hook ở frontend:
>
> - src/types/warehouse.types.ts
> - src/services/warehouse.service.ts
> - src/hooks/use-warehouses.ts
>
> API gồm GET list/detail, POST, PUT, DELETE (soft delete). Trường dữ liệu: name, code, address, isDefault, status, timestamps.
> ```

---

## Giai đoạn 3 – Frontend: Giao diện Admin

### 3.1 UI Quản lý Nồng độ (Concentrations)

- **Mục tiêu**: xây dựng trang `/admin/concentrations` cho phép admin xem, thêm, sửa, xoá nồng độ nước hoa.
- **Tác vụ**:
  1. Tạo route/page `src/app/admin/concentrations/page.tsx`:
     - Dùng DataTable (Shadcn) để render danh sách (name, slug/code, intensityLevel, status, createdAt).
     - Kết hợp `useConcentrations` hook để fetch dữ liệu + pagination/filter đơn giản.
  2. Xây `ConcentrationFormSheet` (slide-over giống brand/category):
     - Field bắt buộc: `name`, `slug/code` (auto generate từ name nếu để trống), `description`.
     - Optional: `intensityLevel`, `displayOrder`, `status`.
     - Kết nối mutation từ `use-concentrations`.
  3. Thêm dialog confirm khi xoá (nếu BE cho phép).

> 📌 **Prompt Gợi ý**:
>
> ```
> Hãy tạo giao diện quản lý Nồng độ (Concentrations) tại đường dẫn /admin/concentrations.
>
> Yêu cầu:
>
> Sử dụng DataTable của Shadcn UI để hiển thị danh sách.
>
> Tạo ConcentrationFormSheet (Slide-over) để Thêm mới/Chỉnh sửa.
>
> Form gồm: Tên (Required), Mã (Code - tự động generate từ tên nếu trống), Mô tả.
>
> Kết nối với useConcentrations hook để hiển thị và lưu dữ liệu.
> ```

---

### 3.2 UI Quản lý Thuộc tính (Attributes) – Master/Detail

- **Mục tiêu**: trang `/admin/attributes` với khả năng quản lý attribute cha và danh sách value con.
- **Yêu cầu màn hình**:
  1. **Danh sách**: bảng chứa các Attribute (tên, code, type, số lượng value).
  2. **Form `AttributeFormSheet`**:
     - Phần Attribute cha: `name`, `code`, `type` (Select/Radio/Color/...).
     - Phần Value con: dùng `useFieldArray` để thêm/xoá/sắp xếp dòng.
       - Mỗi dòng: `displayValue`, `value`, `position/displayOrder`, nút xóa (`Trash` icon).
       - Nếu `type === "COLOR"`: input `value` chuyển thành Color Picker (tương thích `react-hook-form` – có thể dùng `Controller` với component của `radix-color`, `react-colorful`, ...), đồng thời hiển thị preview HEX hợp lệ.
       - Có nút `+ Thêm giá trị` ở cuối; ưu tiên hỗ trợ drag & drop (dnd-kit/react-beautiful-dnd) để sắp xếp hoặc cung cấp input số thứ tự + reorder buttons cho danh sách dài.
     - Khi submit gửi toàn bộ JSON (attribute + values) lên API.
- **Kết nối**:
  - Sử dụng hooks `useAttributes` / `useAttribute`.
  - Mutations cho create/update/delete attribute và values.

> 📌 **Prompt Gợi ý**:
>
> ```
> Hãy tạo giao diện quản lý Thuộc tính (Attributes) tại /admin/attributes. Đây là phần phức tạp nhất.
>
> Trang Danh sách: Hiển thị bảng các thuộc tính (VD: Màu sắc, Dung tích) và số lượng giá trị con của nó.
>
> Form AttributeFormSheet:
>
> Phần trên: Nhập thông tin Attribute cha (Tên, Code, Loại hiển thị: Select/Radio/Color).
>
> Phần dưới (Dynamic List): Quản lý danh sách Giá trị (Attribute Values).
>
> Dùng useFieldArray của React Hook Form để cho phép thêm/xóa dòng.
>
> Mỗi dòng gồm: Input Display Value (Hiển thị), Input Value (Giá trị thực), và nút Xóa (Trash icon).
>
> Có nút + Thêm giá trị ở cuối danh sách.
>
> Logic: Khi Submit, gửi cả cục JSON (Cha + Danh sách Con) lên API.
> ```

---

### 3.3 UI Quản lý Kho hàng (Warehouses)

- **Mục tiêu**: trang `/admin/warehouses` để admin tạo/sửa danh sách kho phục vụ Inventory Transaction.
- **Tác vụ**:
  1. Page structure giống `brands`/`concentrations`:
     - Dùng `DataTable` với cột `name`, `code`, `address`, `isDefault`, `status`.
     - Toolbar filter theo keyword/status.
  2. `WarehouseFormSheet`:
     - Field: `name` (required), `code` (auto generate nếu trống), `address`, `isDefault` (Switch), `status`.
     - Khi toggle `isDefault`, frontend chỉ gửi payload; backend xử lý trong transaction để đặt true cho bản ghi hiện tại và false cho các kho khác (tránh race condition trên FE).
     - UX: hiển thị confirm dialog cảnh báo "Kho mặc định sẽ được chuyển sang <name>" trước khi gửi request để user hiểu tác động.
  3. Kết nối hooks/service `useWarehouses` (kế hoạch ở Phase 2).
  4. Xóa kho: AlertDialog + nhắc nhở nếu kho đã được dùng => disable nút (nhờ API trả về flag).

> 📌 **Prompt Gợi ý**:
>
> ```
> Hãy tạo giao diện quản lý Kho hàng tại /admin/warehouses với DataTable + Form Sheet giống Brands.
>
> Yêu cầu:
> - Danh sách hiển thị name, code, address, isDefault, status.
> - Form nhập name/code/address/isDefault.
> - Tái sử dụng TableToolbar, FormField, Sheet từ components/shared.
> - Màu sắc tuân thủ bg-card/text-foreground của theme.
> ```

---

## Kế hoạch Frontend – Đồng bộ UI/UX

### Bối cảnh & Pattern hiện tại

- **Tham chiếu chính**:
  - `src/app/admin/brands/page.tsx`
  - `src/app/admin/users/page.tsx`
- **Pattern tái sử dụng**:
  - `DataTable` + `TableToolbar` (`src/components/shared/...`) cho search/filter/pagination.
  - `PageHeader` (title + actions), `PageContent` layout.
  - `Sheet` (Form slide-over), `AlertDialog` confirm delete.
  - Folder structure: `src/components/features/{module}/` (table, columns, form sheet, schema, action buttons).
- **Khả năng mở rộng**:
  - Đảm bảo các component shared hỗ trợ custom cell renderers (ví dụ hiển thị màu HEX) và các props mới (drag handle, badge, actions).
- **Phong cách UI**:
  - Reuse Shadcn primitives (Card, Button, Input, Select, Switch).
  - Colors lấy từ theme tokens (`bg-card`, `text-foreground`, `border`).
- **Loading & Error states**:
  - Thống nhất sử dụng spinner skeleton trong bảng, `FormMessage` cho field error, Sonner toast (success/error) cho mutation.
  - Khi nhận validation error từ backend, map chính xác vào field tương ứng; fallback hiển thị toast chung.

> 📌 **Prompt gợi ý**:
>
> ```
> Tôi chuẩn bị xây dựng giao diện Frontend cho các module mới: Nồng độ (Concentrations), Thuộc tính (Attributes) và Sản phẩm (Products).
>
> Yêu cầu tối thượng là Giao diện và Trải nghiệm (UI/UX) phải hoàn toàn đồng bộ với các module đã hoàn thiện trước đó (Users, Brands, Categories).
>
> Hãy giúp tôi lập một kế hoạch triển khai Frontend chi tiết, dựa trên việc tái sử dụng (reuse) các pattern hiện có.
>
> 1. Phân tích Pattern hiện tại (Context):
>
> Hãy xem lại cấu trúc của trang src/app/admin/brands/page.tsx và src/app/admin/users/page.tsx.
>
> Xác định các component chung đang được sử dụng (Ví dụ: DataTable, PageHeader, Sheet cho form, AlertDialog cho xóa, TableToolbar cho filter).
>
> Ghi chú lại cách tổ chức folder: components/features/{module}/....
>
> 2. Kế hoạch triển khai Module Concentrations (Simple CRUD):
>
> Đây là module đơn giản giống Brands.
>
> Hãy lên danh sách các file cần tạo (Page, Table, Form Sheet, Schema Validation).
>
> Yêu cầu: Copy 90% cấu trúc từ Brands, chỉ đổi tên field.
>
> 3. Kế hoạch triển khai Module Attributes (Master-Detail):
>
> Đây là module phức tạp hơn.
>
> Trang danh sách: Giống Categories.
>
> Trang Form (Sheet): Cần có Dynamic Field Array để thêm nhiều Attribute Values (Giá trị con) cùng lúc.
>
> Hãy đề xuất cách dùng react-hook-form với useFieldArray nhưng vẫn giữ style của Shadcn UI giống các form khác.
>
> 4. Kế hoạch triển khai Module Products (Complex):
>
> Trang danh sách: Giống Users (có Avatar, Badges trạng thái, Filter nhiều tiêu chí).
>
> Trang Form: Đây là form lớn nhất.
>
> Đề xuất sử dụng Tabs hoặc Steps trong Sheet để chia nhỏ nội dung (Thông tin chung, Biến thể, Hình ảnh).
>
> Cách hiển thị danh sách Biến thể (Variants) sao cho khớp với style của DataTable hiện tại.
>
> 5. Yêu cầu đầu ra:
>
> Liệt kê danh sách các file cần tạo.
>
> Chỉ rõ component nào sẽ được tái sử dụng lại từ src/components/shared/....
>
> Đảm bảo màu sắc (bg-card, text-foreground) tuân thủ đúng Dark/Light mode đã fix.
> ```

---

## Các bước tiếp theo sau Giai đoạn 1

(Sẽ bổ sung khi kết thúc giai đoạn backend – ví dụ Giai đoạn 2: Thiết kế API cho Product/Variant, Giai đoạn 3: Frontend Admin Product, v.v.)

---

> ✅ Khi hoàn thành từng giai đoạn, cập nhật file này để theo dõi tiến độ.
