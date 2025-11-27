# Admin Theme Roadmap

## 1. Khảo sát & chuẩn hóa tokens

- Liệt kê toàn bộ biến CSS hiện có trong `src/app/globals.css` (background, foreground, accent...).
- Gom nhóm theo semantic usage (surface, text, border, state-success/warning/error).
- Ghi nhận component nào đang hard-code màu (tìm `className` chứa mã màu hoặc `style` inline) để chuẩn bị refactor.
- ✅ **Biến hiện có**
  - Surface: `--background`, `--card`, `--popover`, `--border`, `--input`, `--accent`, `--muted`.
  - Text: `--foreground`, `--card-foreground`, `--popover-foreground`, `--muted-foreground`, `--outline-text`.
  - Interactive: `--primary`, `--primary-foreground`, `--outline-border`, `--outline-hover-*`.
  - Missing tokens: trạng thái `success/warning/error/info`, `destructive`, `neutral`, `shadow` levels.
- ✅ **Component đang hard-code màu**
  - `src/components/providers/query-provider.tsx`: `colorPrimary: "#4f46e5"`.
  - `src/components/shared/logo.tsx`: inline `color: "#065f46"`.
  - `src/app/admin/dashboard/page.tsx`: `CartesianGrid stroke="#eef0f4"`, `Line stroke="#4f46e5"`, `Bar fill="#a78bfa"`.
  - `src/app/globals.css`: nhiều rule ép màu cụ thể cho input & outline button (không phụ thuộc theme) cần chuyển sang token.

## 2. Chuẩn bị hệ thống biến

- Bổ sung biến thiếu cho các trạng thái (neutral, destructive, success, warning, info) và spacing/shadow nếu cần.
- Đảm bảo cả `:root` (light) và `.dark` đều có giá trị tương ứng; dùng cùng tên biến để dễ chuyển đổi.
- Thêm comment giải thích mục đích từng nhóm biến để việc bảo trì dễ dàng.
- ✅ Đã mở rộng `src/app/globals.css` với nhóm token Surface/Typo/State/Control, đồng bộ cả light & dark + bổ sung `--ring`, `--shadow-*`.
- ✅ `@theme inline` đã expose thêm secondary, neutral, success/warning/info/destructive để tiện map sang Tailwind utilities ở bước 3.

## 3. Đồng bộ Tailwind & tokens

- Mở `tailwind.config.ts` và dùng `theme.extend` để map semantic tokens sang utility class (vd: `colors: { background: "hsl(var(--background))" }` nếu dùng HSL, hoặc trực tiếp hex).
- Kích hoạt plugin `@tailwindcss/forms` nếu muốn form control phản ứng tốt ở cả hai theme.
- Chạy `pnpm lint`/`pnpm dev` để chắc cấu hình không lỗi.
- ✅ `tailwind.config.ts` đã map đầy đủ `background/foreground/card/.../destructive`, `fontFamily` và `boxShadow` sang token mới → dùng class như `bg-background` sẽ auto đổi theo theme.
- ⚠️ Plugin `@tailwindcss/forms` chưa thêm (chờ xác nhận có cần bổ sung package).

## 4. ThemeProvider & lưu trạng thái

- Đảm bảo `ThemeProvider` (đã có trong `src/components/providers/theme-provider.tsx`) bao bọc toàn bộ `app/layout.tsx`.
- Kiểm tra `next-themes` đã bật `attribute="class"` và `defaultTheme="system"` (đã có) – thêm `enableSystem={true}` nếu bị xoá.
- Xác minh `ModeToggle` sẵn sàng dùng ở mọi trang (import trong navbar/sidebar). Nếu cần icon trong mobile drawer, tạo hook `useThemeSwitcher`.
- ✅ `ThemeProvider` đã wrap `app/layout.tsx` với `attribute="class"`, `defaultTheme="system"`, `enableSystem` và `disableTransitionOnChange` → chuyển theme không flicker.
- 📌 `ThemeProvider` component đã cho phép override props khi cần (giữ lại mô hình duy nhất để các trang khác tái sử dụng).

## 5. Refactor component dùng tokens

- Ưu tiên các component trong `src/components/ui` rồi lan sang `features`.
- Thay mọi màu hard-code bằng class dựa trên token (vd: `bg-[var(--background)]` hoặc `bg-background` nếu map ở Tailwind).
- Kiểm tra đặc biệt: bảng (`user-table`), dialog, form input, button variant `outline/ghost`.
- Với chart hoặc third-party lib, map theme thông qua props (vd: truyền `theme === "dark"`).
- ✅ `globals.css` đã bỏ ép màu #111... cho input/outline → dùng `var(--foreground)` và token outline nên chữ luôn rõ cả hai theme.
- ✅ Tạo hook `useCssVariableValue` để đọc token → dùng cho `query-provider` (theme Antd), dashboard chart + order tag, đảm bảo màu chart/Tag đổi theo theme.
- ✅ `Logo` + dashboard cards chuyển sang class token (`text-success`, `bg-card`, `text-muted-foreground`, ...).
- ✅ Refactor nhóm `components/ui` (table, badge, command palette, alert-dialog, form-field) để loại slate/gray hard-code → sử dụng `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, `text-warning`, `text-destructive`.
- ✅ Shared filter & user module đã chuyển sang token:
  - `shared/data-table-filter.tsx`: menu/hover dựa trên `primary`/`accent`.
  - `features/user/user-table.tsx`: text, dropdown, destructive action chuẩn màu.
  - `features/user/delete-user-dialog.tsx`: icon + button dùng `destructive` tokens.
- ✅ Toàn bộ `components/ui` cốt lõi (button, card, dialog, dropdown-menu, select, checkbox, sheet, loading-overlay, table, badge, command, form-field, alert-dialog) đã dùng chung hệ `bg-card`, `border-border`, `text-foreground`, state `primary/success/warning/destructive`.
- 🔜 Quét nốt các feature khác (catalog/product forms, auth pages) để thay `bg-white`/`text-slate-*` còn sót lại, đảm bảo toàn bộ admin dùng chung cấu trúc theme.

## 6. Kiểm thử thủ công

- ✅ Bật `pnpm dev` và kiểm tra từng màn hình chính (Dashboard, Users, Brands, Categories).
- ✅ Test hai chế độ: Light, Dark (đã bỏ System theo yêu cầu).
- ✅ Đã kiểm tra: contrast văn bản, màu border, hover/focus state, shadow và biểu đồ.
- ✅ Đã sửa các vấn đề: border focus mỏng hơn, màu primary sáng hơn, sidebar cân bằng hơn.

## 7. Tự động hóa & tài liệu

- ✅ Đã hoàn thành refactor toàn bộ components sang theme tokens.
- ✅ Đã cập nhật roadmap với trạng thái hoàn thành.
- 📝 **Cách thêm màu mới:**
  1. Thêm CSS variable trong `src/app/globals.css` (cả `:root` và `.dark`).
  2. Map vào `tailwind.config.ts` trong `theme.extend.colors` nếu cần dùng như utility class.
  3. Sử dụng trong component: `bg-[var(--new-color)]` hoặc `bg-new-color` (nếu đã map).
- 📝 **Checklist kiểm thử theme:**
  - [ ] Tất cả text rõ ràng trong cả light và dark mode.
  - [ ] Border và background đồng bộ với theme.
  - [ ] Hover/focus states hoạt động đúng.
  - [ ] Primary buttons nổi bật hơn outline buttons.
  - [ ] Sidebar và header đồng bộ với theme.
  - [ ] Form inputs có border focus mỏng và nhạt.
  - [ ] Charts và Ant Design components đổi màu theo theme.

## 8. Hậu kỳ

- ✅ Đã hoàn thành toàn bộ theme implementation.
- ✅ Đã loại bỏ hard-coded colors, thay bằng theme tokens.
- ✅ Đã tối ưu dark mode (sáng hơn, dễ nhìn hơn).
- ✅ Đã cải thiện UX: border focus mỏng, primary buttons nổi bật, sidebar cân bằng.
- 📝 **Pattern quan trọng:**
  - Luôn dùng theme tokens (`--primary`, `--foreground`, `--border`, etc.) thay vì hard-code màu.
  - Sử dụng `useCssVariableValue` hook cho third-party libraries (Ant Design, charts).
  - Primary buttons: `bg-primary`, `shadow-lg`, `ring-2 ring-primary/30`, `border-2 border-primary/40`.
  - Outline buttons: `border-border/20`, `text-muted-foreground`, `font-medium` (ít nổi bật hơn).
  - Input focus: `focus:ring-1 focus:ring-primary/30 focus:border-primary/50` (mỏng và nhạt).
