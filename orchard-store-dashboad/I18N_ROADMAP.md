# 🌍 Roadmap: Đa Ngôn Ngữ (i18n) cho Admin Dashboard

## 📋 Tổng Quan

Triển khai tính năng đa ngôn ngữ cho Admin Dashboard với 2 ngôn ngữ:

- 🇻🇳 **Tiếng Việt** (vi)
- 🇬🇧 **Tiếng Anh** (en)

**Yêu cầu**: Khi chọn ngôn ngữ, toàn bộ giao diện phải đồng bộ thay đổi ngay lập tức.

---

## 🎯 Mục Tiêu

1. ✅ Hỗ trợ 2 ngôn ngữ: Tiếng Việt và Tiếng Anh
2. ✅ Chuyển đổi ngôn ngữ mượt mà, đồng bộ toàn bộ ứng dụng
3. ✅ Lưu trữ ngôn ngữ đã chọn (localStorage/cookies)
4. ✅ Type-safe translations với TypeScript
5. ✅ Dễ dàng mở rộng thêm ngôn ngữ trong tương lai

---

## 🛠️ Giải Pháp Đề Xuất

### **Option 1: next-intl (Khuyến nghị) ⭐**

**Ưu điểm:**

- ✅ Được thiết kế riêng cho Next.js App Router
- ✅ Type-safe với TypeScript
- ✅ Hỗ trợ routing với locale (ví dụ: `/vi/admin/dashboard`, `/en/admin/dashboard`)
- ✅ SSR/SSG support
- ✅ Dễ sử dụng và maintain
- ✅ Cộng đồng lớn, tài liệu tốt

**Nhược điểm:**

- ⚠️ Cần thay đổi cấu trúc routing (thêm `[locale]` segment)
- ⚠️ Cần migrate một số code

### **Option 2: react-i18next**

**Ưu điểm:**

- ✅ Phổ biến, nhiều tài liệu
- ✅ Không cần thay đổi routing

**Nhược điểm:**

- ⚠️ Setup phức tạp hơn với App Router
- ⚠️ Cần tự handle SSR
- ⚠️ Không tích hợp sẵn với Next.js routing

### **Option 3: Giải pháp tự xây dựng**

**Ưu điểm:**

- ✅ Kiểm soát hoàn toàn
- ✅ Không cần thêm dependency

**Nhược điểm:**

- ❌ Phải tự implement nhiều tính năng
- ❌ Không có type-safety mặc định
- ❌ Tốn thời gian phát triển

---

## 📦 Khuyến Nghị: Sử dụng **next-intl**

---

## 🗺️ Roadmap Chi Tiết

### **Phase 1: Setup & Cấu Hình (Bước 1-3)**

#### **Bước 1: Cài Đặt Dependencies**

```bash
npm install next-intl
```

#### **Bước 2: Tạo Cấu Trúc Thư Mục**

```
src/
├── i18n/
│   ├── config.ts              # Cấu hình i18n
│   ├── request.ts             # Helper cho server components
│   └── messages/
│       ├── en.json            # Bản dịch tiếng Anh
│       └── vi.json            # Bản dịch tiếng Việt
├── app/
│   └── [locale]/              # Thêm locale segment
│       ├── (auth)/
│       ├── (admin)/
│       └── layout.tsx
```

#### **Bước 3: Cấu Hình next-intl**

**File: `src/i18n/config.ts`**

```typescript
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

**File: `next.config.js` (hoặc `next.config.ts`)**

```typescript
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/config.ts");

export default withNextIntl({
  // ... existing config
});
```

**File: `src/middleware.ts`**

```typescript
import createMiddleware from "next-intl/middleware";
import { locales } from "./i18n/config";

export default createMiddleware({
  locales,
  defaultLocale: "vi",
  localePrefix: "as-needed", // hoặc 'always', 'never'
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
```

---

### **Phase 2: Tạo Translation Files (Bước 4-5)**

#### **Bước 4: Tạo File Dịch Tiếng Việt**

**File: `src/i18n/messages/vi.json`**

```json
{
  "common": {
    "dashboard": "Bảng điều khiển",
    "brands": "Thương hiệu",
    "categories": "Danh mục",
    "users": "Người dùng",
    "profile": "Hồ sơ",
    "settings": "Cài đặt",
    "logout": "Đăng xuất",
    "search": "Tìm kiếm",
    "filter": "Lọc",
    "create": "Tạo mới",
    "edit": "Chỉnh sửa",
    "delete": "Xóa",
    "save": "Lưu",
    "cancel": "Hủy",
    "confirm": "Xác nhận",
    "close": "Đóng",
    "loading": "Đang tải...",
    "noData": "Không có dữ liệu",
    "actions": "Thao tác"
  },
  "dashboard": {
    "title": "Bảng điều khiển",
    "totalRevenue": "Tổng doanh thu",
    "totalOrders": "Tổng đơn hàng",
    "newCustomers": "Khách hàng mới",
    "lowStockAlert": "Cảnh báo tồn kho thấp",
    "vsLastMonth": "so với tháng trước",
    "revenueChart": "Biểu đồ doanh thu",
    "topProducts": "Sản phẩm bán chạy",
    "recentOrders": "Đơn hàng gần đây"
  },
  "users": {
    "title": "Quản lý người dùng",
    "createUser": "Tạo người dùng mới",
    "editUser": "Chỉnh sửa người dùng",
    "deleteUser": "Xóa người dùng",
    "resetPassword": "Đặt lại mật khẩu",
    "toggleStatus": "Thay đổi trạng thái",
    "email": "Email",
    "fullName": "Họ và tên",
    "phone": "Số điện thoại",
    "role": "Vai trò",
    "status": "Trạng thái",
    "active": "Hoạt động",
    "inactive": "Không hoạt động",
    "banned": "Đã khóa",
    "suspended": "Tạm ngưng"
  },
  "brands": {
    "title": "Quản lý thương hiệu",
    "createBrand": "Tạo thương hiệu mới",
    "editBrand": "Chỉnh sửa thương hiệu",
    "deleteBrand": "Xóa thương hiệu",
    "name": "Tên thương hiệu",
    "slug": "Đường dẫn",
    "description": "Mô tả",
    "logo": "Logo",
    "status": "Trạng thái"
  },
  "categories": {
    "title": "Quản lý danh mục",
    "createCategory": "Tạo danh mục mới",
    "editCategory": "Chỉnh sửa danh mục",
    "deleteCategory": "Xóa danh mục",
    "name": "Tên danh mục",
    "slug": "Đường dẫn",
    "description": "Mô tả",
    "parentCategory": "Danh mục cha",
    "noParent": "Không có (Danh mục gốc)",
    "level": "Cấp độ",
    "status": "Trạng thái"
  },
  "notifications": {
    "title": "Thông báo",
    "noNotifications": "Không có thông báo",
    "markAllAsRead": "Đánh dấu tất cả",
    "clearAll": "Xóa tất cả",
    "ago": "trước"
  },
  "profile": {
    "title": "Hồ sơ cá nhân",
    "personalInfo": "Thông tin cá nhân",
    "editInfo": "Chỉnh sửa thông tin cá nhân",
    "fullName": "Họ và tên",
    "email": "Email",
    "phone": "Số điện thoại",
    "avatar": "Ảnh đại diện",
    "changePassword": "Đổi mật khẩu",
    "loginHistory": "Lịch sử đăng nhập"
  },
  "auth": {
    "login": "Đăng nhập",
    "logout": "Đăng xuất",
    "forgotPassword": "Quên mật khẩu",
    "resetPassword": "Đặt lại mật khẩu",
    "email": "Email",
    "password": "Mật khẩu",
    "rememberMe": "Ghi nhớ đăng nhập"
  },
  "errors": {
    "required": "Trường này là bắt buộc",
    "invalidEmail": "Email không hợp lệ",
    "invalidPhone": "Số điện thoại không hợp lệ",
    "minLength": "Tối thiểu {min} ký tự",
    "maxLength": "Tối đa {max} ký tự"
  }
}
```

#### **Bước 5: Tạo File Dịch Tiếng Anh**

**File: `src/i18n/messages/en.json`**

```json
{
  "common": {
    "dashboard": "Dashboard",
    "brands": "Brands",
    "categories": "Categories",
    "users": "Users",
    "profile": "Profile",
    "settings": "Settings",
    "logout": "Logout",
    "search": "Search",
    "filter": "Filter",
    "create": "Create",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "close": "Close",
    "loading": "Loading...",
    "noData": "No data",
    "actions": "Actions"
  },
  "dashboard": {
    "title": "Dashboard",
    "totalRevenue": "Total Revenue",
    "totalOrders": "Total Orders",
    "newCustomers": "New Customers",
    "lowStockAlert": "Low Stock Alert",
    "vsLastMonth": "vs last month",
    "revenueChart": "Revenue Chart",
    "topProducts": "Top Products",
    "recentOrders": "Recent Orders"
  },
  "users": {
    "title": "User Management",
    "createUser": "Create New User",
    "editUser": "Edit User",
    "deleteUser": "Delete User",
    "resetPassword": "Reset Password",
    "toggleStatus": "Toggle Status",
    "email": "Email",
    "fullName": "Full Name",
    "phone": "Phone",
    "role": "Role",
    "status": "Status",
    "active": "Active",
    "inactive": "Inactive",
    "banned": "Banned",
    "suspended": "Suspended"
  },
  "brands": {
    "title": "Brand Management",
    "createBrand": "Create New Brand",
    "editBrand": "Edit Brand",
    "deleteBrand": "Delete Brand",
    "name": "Brand Name",
    "slug": "Slug",
    "description": "Description",
    "logo": "Logo",
    "status": "Status"
  },
  "categories": {
    "title": "Category Management",
    "createCategory": "Create New Category",
    "editCategory": "Edit Category",
    "deleteCategory": "Delete Category",
    "name": "Category Name",
    "slug": "Slug",
    "description": "Description",
    "parentCategory": "Parent Category",
    "noParent": "None (Root Category)",
    "level": "Level",
    "status": "Status"
  },
  "notifications": {
    "title": "Notifications",
    "noNotifications": "No notifications",
    "markAllAsRead": "Mark all as read",
    "clearAll": "Clear all",
    "ago": "ago"
  },
  "profile": {
    "title": "Profile",
    "personalInfo": "Personal Information",
    "editInfo": "Edit Personal Information",
    "fullName": "Full Name",
    "email": "Email",
    "phone": "Phone",
    "avatar": "Avatar",
    "changePassword": "Change Password",
    "loginHistory": "Login History"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "forgotPassword": "Forgot Password",
    "resetPassword": "Reset Password",
    "email": "Email",
    "password": "Password",
    "rememberMe": "Remember Me"
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Invalid email",
    "invalidPhone": "Invalid phone number",
    "minLength": "Minimum {min} characters",
    "maxLength": "Maximum {max} characters"
  }
}
```

---

### **Phase 3: Migrate Routing (Bước 6-7)**

#### **Bước 6: Di Chuyển App Directory**

Di chuyển tất cả các route từ:

```
src/app/(auth)/
src/app/(admin)/
```

Thành:

```
src/app/[locale]/(auth)/
src/app/[locale]/(admin)/
```

#### **Bước 7: Tạo Root Layout với Locale**

**File: `src/app/[locale]/layout.tsx`**

```typescript
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Load messages
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

---

### **Phase 4: Tạo Language Switcher (Bước 8-9)**

#### **Bước 8: Tạo Language Switcher Component**

**File: `src/components/shared/language-switcher.tsx`**

```typescript
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { locales } from "@/i18n/config";

const languageNames: Record<string, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, "");
    // Navigate to new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          title="Change language"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={locale === loc ? "bg-accent" : ""}
          >
            {languageNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### **Bước 9: Thêm Language Switcher vào Header**

**File: `src/components/layout/header.tsx`**

```typescript
import { LanguageSwitcher } from "@/components/shared/language-switcher";

// ... trong component Header
<div className="flex items-center gap-2">
  <LanguageSwitcher />
  <ModeToggle />
  {/* ... rest of header */}
</div>;
```

---

### **Phase 5: Migrate Components (Bước 10-12)**

#### **Bước 10: Migrate Server Components**

**Ví dụ: `src/app/[locale]/admin/dashboard/page.tsx`**

```typescript
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <div>
      <h1>{t("title")}</h1>
      {/* ... */}
    </div>
  );
}
```

#### **Bước 11: Migrate Client Components**

**Ví dụ: `src/components/features/user/user-table.tsx`**

```typescript
"use client";

import { useTranslations } from "next-intl";

export function UserTable() {
  const t = useTranslations("users");

  return (
    <div>
      <h2>{t("title")}</h2>
      <button>{t("createUser")}</button>
      {/* ... */}
    </div>
  );
}
```

#### **Bước 12: Migrate Form Labels & Messages**

**Ví dụ: Form validation messages**

```typescript
import { useTranslations } from "next-intl";

export function UserForm() {
  const t = useTranslations("users");
  const tErrors = useTranslations("errors");

  const schema = z.object({
    email: z
      .string()
      .email(tErrors("invalidEmail"))
      .min(1, tErrors("required")),
    // ...
  });

  return (
    <form>
      <label>{t("email")}</label>
      {/* ... */}
    </form>
  );
}
```

---

### **Phase 6: Xử Lý Edge Cases (Bước 13-14)**

#### **Bước 13: Xử Lý Dynamic Routes**

**Ví dụ: `/admin/users/[id]`**

```typescript
// URL: /vi/admin/users/123
// URL: /en/admin/users/123

export default function UserDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  // ...
}
```

#### **Bước 14: Xử Lý API Routes**

API routes không cần locale:

```typescript
// ✅ /api/users (không có locale)
// ✅ /vi/admin/users (có locale)
```

---

## 📝 Checklist Triển Khai

### **Setup & Config**

- [ ] Cài đặt `next-intl`
- [ ] Tạo cấu trúc thư mục `i18n/`
- [ ] Cấu hình `next.config.js`
- [ ] Cấu hình `middleware.ts`
- [ ] Tạo file `vi.json` và `en.json`

### **Routing**

- [ ] Di chuyển routes vào `[locale]/`
- [ ] Tạo `[locale]/layout.tsx`
- [ ] Cập nhật tất cả imports

### **Components**

- [ ] Tạo `LanguageSwitcher` component
- [ ] Thêm vào Header
- [ ] Migrate Dashboard page
- [ ] Migrate Users pages
- [ ] Migrate Brands pages
- [ ] Migrate Categories pages
- [ ] Migrate Profile page
- [ ] Migrate Auth pages
- [ ] Migrate Notification component
- [ ] Migrate tất cả form components
- [ ] Migrate tất cả dialog components

### **Testing**

- [ ] Test chuyển đổi ngôn ngữ
- [ ] Test navigation giữa các trang
- [ ] Test form validation messages
- [ ] Test error messages
- [ ] Test với cả 2 ngôn ngữ

---

## 🎨 UI/UX Considerations

### **Language Switcher Placement**

- Đặt trong Header, bên cạnh Theme Toggle
- Icon Globe hoặc Language icon
- Dropdown menu với tên ngôn ngữ đầy đủ

### **Visual Feedback**

- Highlight ngôn ngữ đang chọn
- Smooth transition khi chuyển đổi
- Loading state nếu cần

---

## 🔧 Advanced Features (Tùy chọn)

### **1. Lưu Ngôn Ngữ Đã Chọn**

```typescript
// Sử dụng cookies hoặc localStorage
// next-intl tự động handle với cookies
```

### **2. Auto-detect Browser Language**

```typescript
// Cấu hình trong middleware
localeDetection: true;
```

### **3. Date/Time Formatting**

```typescript
import { useFormatter } from "next-intl";

const format = useFormatter();
format.dateTime(new Date(), { dateStyle: "long" });
```

### **4. Number Formatting**

```typescript
format.number(1234.56); // 1,234.56 (en) hoặc 1.234,56 (vi)
```

---

## 📚 Tài Liệu Tham Khảo

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [TypeScript với next-intl](https://next-intl-docs.vercel.app/docs/usage/typescript)

---

## ⚠️ Lưu Ý Quan Trọng

1. **Backup code trước khi migrate** - Thay đổi routing có thể ảnh hưởng nhiều file
2. **Test kỹ từng bước** - Đừng migrate tất cả cùng lúc
3. **Giữ nguyên logic business** - Chỉ thay đổi text, không thay đổi logic
4. **Type-safe** - Sử dụng TypeScript để đảm bảo không miss translation keys
5. **Performance** - next-intl tự động optimize, nhưng cần test với production build

---

## 🚀 Bắt Đầu Triển Khai

Bắt đầu từ **Phase 1** và làm từng bước một. Sau mỗi phase, test kỹ trước khi chuyển sang phase tiếp theo.

**Ưu tiên migrate:**

1. Common components (Header, Sidebar, Menu)
2. Dashboard page
3. Users management
4. Brands & Categories
5. Forms & Dialogs
6. Error messages

---

**Tạo bởi:** AI Assistant  
**Ngày tạo:** 2024  
**Phiên bản:** 1.0
