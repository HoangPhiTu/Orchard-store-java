# 🎛️ Kế Hoạch Phát Triển Admin Panel - Orchard Store

## 📊 Đánh Giá Checklist Hiện Tại

### ✅ Đã Hoàn Thành (Cơ Bản)
- [x] **Admin Layout & Navigation** - Đã có Sidebar và Header cơ bản
- [x] **Dashboard Overview** - Đã có stats cards placeholder

### ⚠️ Cần Hoàn Thiện
- [ ] **Admin Layout & Navigation** - Cần responsive, breadcrumb, mobile menu
- [ ] **Dashboard Overview** - Cần kết nối API, charts, recent activities

### ❌ Chưa Có
- [ ] **Admin Authentication** - Chưa có login, protected routes, session management
- [ ] **Product Data Table** - Chưa có
- [ ] **Product CRUD Operations** - Chưa có
- [ ] **Category Management** - Chưa có
- [ ] **Order Management** - Chưa có
- [ ] **Customer Management** - Chưa có
- [ ] **Analytics Dashboard** - Chưa có
- [ ] **Inventory Management** - Chưa có

---

## 🎯 Kế Hoạch Phát Triển Chi Tiết

### **PHASE 1: Foundation & Authentication** (Tuần 1)

#### 1.1 Hoàn Thiện Admin Layout & Navigation
**Mục tiêu**: Tạo layout hoàn chỉnh, responsive, professional

**Tasks**:
- [ ] **Responsive Sidebar**
  - Mobile menu (hamburger)
  - Collapse/expand sidebar
  - Active state highlighting
  - Submenu support (nếu cần)

- [ ] **Header Component**
  - User menu dropdown
  - Notifications bell (placeholder)
  - Search bar (global search)
  - Profile avatar
  - Logout functionality

- [ ] **Breadcrumb Component**
  - Dynamic breadcrumb based on route
  - Clickable navigation
  - Responsive design

- [ ] **Mobile-Friendly Design**
  - Mobile sidebar overlay
  - Touch-friendly buttons
  - Responsive tables
  - Mobile navigation

**Deliverables**:
- Sidebar component hoàn chỉnh
- Header component với user menu
- Breadcrumb component
- Responsive layout cho mobile

**Files to Create/Update**:
```
orchard-store-admin/
├── components/
│   ├── admin/
│   │   ├── Sidebar.tsx (update)
│   │   ├── Header.tsx (update)
│   │   ├── Breadcrumb.tsx (new)
│   │   └── MobileMenu.tsx (new)
│   └── ui/
│       ├── dropdown-menu.tsx (new - shadcn/ui)
│       ├── avatar.tsx (new - shadcn/ui)
│       └── badge.tsx (new - shadcn/ui)
```

---

#### 1.2 Admin Authentication System
**Mục tiêu**: Bảo mật admin panel với JWT authentication

**Tasks**:
- [ ] **Backend API** (nếu chưa có)
  - `POST /api/admin/auth/login` - Admin login
  - `POST /api/admin/auth/refresh` - Refresh token
  - `POST /api/admin/auth/logout` - Logout
  - `GET /api/admin/auth/me` - Get current user

- [ ] **Frontend Authentication**
  - Login page (`/login`)
  - Auth context/store (Zustand)
  - Token storage (localStorage/sessionStorage)
  - Auto token refresh
  - Protected route wrapper

- [ ] **Session Management**
  - Token expiration handling
  - Auto logout on token expiry
  - Remember me functionality
  - Session timeout warning

- [ ] **Role-Based Access Control (RBAC)**
  - Admin vs Staff permissions
  - Route-level protection
  - Component-level permissions
  - API call authorization

**Deliverables**:
- Login page hoàn chỉnh
- Protected routes middleware
- Auth store (Zustand)
- Token management utilities

**Files to Create**:
```
orchard-store-admin/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx (new)
│   └── middleware.ts (new - route protection)
├── components/
│   └── auth/
│       └── LoginForm.tsx (new)
├── lib/
│   ├── api/
│   │   └── auth.ts (new)
│   └── utils/
│       └── token.ts (new)
└── store/
    └── authStore.ts (new - Zustand)
```

**Dependencies to Install**:
```bash
npm install zustand @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
```

---

### **PHASE 2: Dashboard & Statistics** (Tuần 2)

#### 2.1 Dashboard Overview
**Mục tiêu**: Dashboard với statistics thực tế và charts

**Tasks**:
- [ ] **Backend API** (nếu chưa có)
  - `GET /api/admin/dashboard/stats` - Overall statistics
  - `GET /api/admin/dashboard/recent-orders` - Recent orders
  - `GET /api/admin/dashboard/revenue` - Revenue data
  - `GET /api/admin/dashboard/top-products` - Top selling products

- [ ] **Stats Cards**
  - Total Products (active)
  - Total Orders (this month)
  - Total Customers
  - Total Revenue (this month)
  - Growth percentage indicators
  - Loading states
  - Error handling

- [ ] **Recent Activities Feed**
  - Recent orders list
  - Recent customer registrations
  - Recent product updates
  - Activity timeline

- [ ] **Quick Action Buttons**
  - Add new product
  - View all orders
  - View all customers
  - View analytics

- [ ] **Basic Charts Placeholder**
  - Revenue chart (line chart)
  - Orders chart (bar chart)
  - Top products chart (pie/bar chart)
  - Use Recharts or Chart.js

**Deliverables**:
- Dashboard page với real data
- Statistics cards với API integration
- Charts với sample data
- Recent activities feed

**Files to Create/Update**:
```
orchard-store-admin/
├── app/
│   └── (admin)/
│       └── dashboard/
│           └── page.tsx (update)
├── components/
│   ├── admin/
│   │   ├── StatsCard.tsx (new)
│   │   ├── RecentActivities.tsx (new)
│   │   ├── QuickActions.tsx (new)
│   │   └── RevenueChart.tsx (new)
│   └── ui/
│       └── skeleton.tsx (new - loading states)
└── lib/
    └── api/
        └── dashboard.ts (new)
```

**Dependencies to Install**:
```bash
npm install recharts
# hoặc
npm install chart.js react-chartjs-2
```

---

### **PHASE 3: Product Management** (Tuần 3-4)

#### 3.1 Product Data Table
**Mục tiêu**: Table hiển thị products với đầy đủ tính năng

**Tasks**:
- [ ] **Backend API** (đã có cơ bản, cần enhance)
  - `GET /api/admin/products` - List với pagination, filter, sort
  - `GET /api/admin/products/{id}` - Product detail
  - `POST /api/admin/products` - Create product
  - `PUT /api/admin/products/{id}` - Update product
  - `DELETE /api/admin/products/{id}` - Delete product
  - `POST /api/admin/products/bulk` - Bulk operations

- [ ] **Data Table Component**
  - Server-side pagination
  - Column sorting (name, price, stock, created_at)
  - Column filtering (status, brand, category)
  - Search functionality
  - Row selection (checkbox)
  - Image preview trong table
  - Status badges
  - Action buttons (edit, delete, view)

- [ ] **Bulk Operations**
  - Select all/none
  - Bulk activate/deactivate
  - Bulk delete (với confirmation)
  - Bulk category assignment
  - Bulk price update

- [ ] **Export Functionality**
  - Export to Excel/CSV
  - Export filtered results
  - Export selected items

**Deliverables**:
- Product list page với data table
- Search, filter, sort functionality
- Bulk operations
- Export functionality

**Files to Create**:
```
orchard-store-admin/
├── app/
│   └── (admin)/
│       └── products/
│           ├── page.tsx (new)
│           └── [id]/
│               └── page.tsx (new - detail)
├── components/
│   ├── admin/
│   │   ├── products/
│   │   │   ├── ProductTable.tsx (new)
│   │   │   ├── ProductFilters.tsx (new)
│   │   │   ├── ProductSearch.tsx (new)
│   │   │   └── BulkActions.tsx (new)
│   └── ui/
│       ├── table.tsx (new - shadcn/ui)
│       ├── checkbox.tsx (new - shadcn/ui)
│       ├── select.tsx (new - shadcn/ui)
│       └── dialog.tsx (new - shadcn/ui)
└── lib/
    └── api/
        └── products.ts (update)
```

**Dependencies to Install**:
```bash
npm install @tanstack/react-table
npm install xlsx # cho export Excel
```

---

#### 3.2 Product CRUD Operations
**Mục tiêu**: Form tạo/sửa product với đầy đủ tính năng

**Tasks**:
- [ ] **Create Product Form**
  - Basic info (name, slug, description)
  - Rich text editor cho description
  - Brand selection (dropdown)
  - Category selection (multi-select, hierarchical)
  - Price & compare price
  - SKU generation
  - Status toggle
  - SEO fields (meta title, meta description)

- [ ] **Image Upload**
  - Drag & drop upload
  - Multiple images
  - Image preview
  - Image ordering (drag to reorder)
  - Image deletion
  - Image optimization (resize, compress)
  - Upload progress indicator

- [ ] **Product Variants**
  - Add/remove variants
  - Variant attributes (size, color, etc.)
  - Variant pricing
  - Variant stock quantity
  - Variant SKU
  - Variant images

- [ ] **Category Assignment**
  - Multi-category selection
  - Hierarchical category tree
  - Primary category selection
  - Category-specific attributes

- [ ] **Inventory Management** (trong product form)
  - Stock quantity
  - Low stock threshold
  - Stock status (in stock, out of stock, pre-order)
  - Track inventory toggle

- [ ] **Form Validation**
  - Client-side validation (Zod schema)
  - Server-side validation feedback
  - Error messages
  - Success notifications

- [ ] **Edit Product**
  - Load existing data
  - Update form
  - Version history (optional)

**Deliverables**:
- Create product page với form đầy đủ
- Edit product page
- Image upload component
- Product variant management
- Form validation

**Files to Create**:
```
orchard-store-admin/
├── app/
│   └── (admin)/
│       └── products/
│           ├── new/
│           │   └── page.tsx (new)
│           └── [id]/
│               └── edit/
│                   └── page.tsx (new)
├── components/
│   ├── admin/
│   │   └── products/
│   │       ├── ProductForm.tsx (new)
│   │       ├── ImageUpload.tsx (new)
│   │       ├── VariantManager.tsx (new)
│   │       └── CategorySelector.tsx (new)
│   └── ui/
│       ├── textarea.tsx (new - shadcn/ui)
│       ├── label.tsx (new - shadcn/ui)
│       ├── switch.tsx (new - shadcn/ui)
│       └── tabs.tsx (new - shadcn/ui)
└── lib/
    ├── api/
    │   └── upload.ts (new)
    └── utils/
        └── productValidation.ts (new - Zod schema)
```

**Dependencies to Install**:
```bash
npm install react-dropzone # cho drag & drop upload
npm install react-quill # hoặc tiptap cho rich text editor
npm install react-dnd react-dnd-html5-backend # cho drag to reorder
```

---

### **PHASE 4: Category Management** (Tuần 5)

#### 4.1 Category Management
**Mục tiêu**: Quản lý categories với tree view và drag & drop

**Tasks**:
- [ ] **Backend API** (đã có cơ bản, cần enhance)
  - `GET /api/admin/categories` - List với tree structure
  - `GET /api/admin/categories/{id}` - Category detail
  - `POST /api/admin/categories` - Create category
  - `PUT /api/admin/categories/{id}` - Update category
  - `DELETE /api/admin/categories/{id}` - Delete category
  - `PUT /api/admin/categories/reorder` - Reorder categories

- [ ] **Category Tree View**
  - Hierarchical display
  - Expand/collapse nodes
  - Drag & drop để reorder
  - Drag & drop để change parent
  - Visual indentation
  - Category count (số products)

- [ ] **Category CRUD**
  - Create category form
  - Edit category form
  - Delete category (với confirmation, check products)
  - Category image upload
  - SEO fields

- [ ] **Bulk Category Operations**
  - Bulk activate/deactivate
  - Bulk delete
  - Bulk move to parent

- [ ] **SEO Fields Management**
  - Meta title
  - Meta description
  - Slug (auto-generate từ name)
  - Canonical URL

**Deliverables**:
- Category management page
- Tree view với drag & drop
- Category CRUD forms
- Bulk operations

**Files to Create**:
```
orchard-store-admin/
├── app/
│   └── (admin)/
│       └── categories/
│           ├── page.tsx (new)
│           ├── new/
│           │   └── page.tsx (new)
│           └── [id]/
│               └── edit/
│                   └── page.tsx (new)
├── components/
│   └── admin/
│       └── categories/
│           ├── CategoryTree.tsx (new)
│           ├── CategoryForm.tsx (new)
│           └── CategoryNode.tsx (new)
└── lib/
    └── api/
        └── categories.ts (update)
```

**Dependencies to Install**:
```bash
npm install react-sortable-tree # hoặc
npm install @dnd-kit/core @dnd-kit/sortable # cho drag & drop
```

---

### **PHASE 5: Order Management** (Tuần 6-7)

#### 5.1 Order Management
**Mục tiêu**: Quản lý orders với advanced filters và status workflow

**Tasks**:
- [ ] **Backend API** (cần tạo)
  - `GET /api/admin/orders` - List với pagination, filter, sort
  - `GET /api/admin/orders/{id}` - Order detail
  - `PUT /api/admin/orders/{id}/status` - Update order status
  - `PUT /api/admin/orders/{id}` - Update order (address, notes)
  - `POST /api/admin/orders/{id}/cancel` - Cancel order
  - `GET /api/admin/orders/{id}/history` - Order status history

- [ ] **Order List với Advanced Filters**
  - Filter by status (pending, confirmed, processing, shipped, delivered, cancelled)
  - Filter by date range
  - Filter by customer (email, phone)
  - Filter by payment status
  - Filter by total amount range
  - Search by order code, customer name, email
  - Sort by date, total, status

- [ ] **Order Detail View**
  - Order information (code, date, status)
  - Customer information
  - Shipping address
  - Order items (products, variants, quantities, prices)
  - Order totals (subtotal, shipping, discount, tax, total)
  - Payment information
  - Order status history timeline
  - Notes/comments

- [ ] **Status Update Workflow**
  - Status dropdown với workflow validation
  - Status change confirmation
  - Auto notifications (email) khi status change
  - Status history tracking
  - Cannot change to previous status (business rule)

- [ ] **Customer Communication Logs**
  - Communication history
  - Add notes/comments
  - Email sent history
  - SMS sent history (nếu có)

**Deliverables**:
- Order list page với filters
- Order detail page
- Status update functionality
- Communication logs

**Files to Create**:
```
orchard-store-admin/
├── app/
│   └── (admin)/
│       └── orders/
│           ├── page.tsx (new)
│           └── [id]/
│               └── page.tsx (new)
├── components/
│   └── admin/
│       └── orders/
│           ├── OrderTable.tsx (new)
│           ├── OrderFilters.tsx (new)
│           ├── OrderDetail.tsx (new)
│           ├── OrderStatusUpdate.tsx (new)
│           └── CommunicationLog.tsx (new)
└── lib/
    └── api/
        └── orders.ts (new)
```

---

### **PHASE 6: Customer Management** (Tuần 8)

#### 6.1 Customer Management
**Mục tiêu**: Quản lý customers với segmentation và analytics

**Tasks**:
- [ ] **Backend API** (cần tạo)
  - `GET /api/admin/customers` - List với pagination, filter, sort
  - `GET /api/admin/customers/{id}` - Customer detail
  - `GET /api/admin/customers/{id}/orders` - Customer order history
  - `GET /api/admin/customers/{id}/analytics` - Customer analytics
  - `PUT /api/admin/customers/{id}/tier` - Update VIP tier (manual)

- [ ] **Customer List với Segmentation**
  - Filter by VIP tier
  - Filter by total spent range
  - Filter by order count
  - Filter by registration date
  - Filter by location (city, province)
  - Search by name, email, phone
  - Sort by name, total spent, order count, tier

- [ ] **Customer Detail**
  - Customer information (name, email, phone, address)
  - Customer statistics (total orders, total spent, average order value)
  - VIP tier information (current tier, next tier, progress)
  - Order history (list of orders)
  - Customer notes/comments

- [ ] **Membership Tier Management**
  - Current tier display
  - Tier benefits
  - Progress to next tier
  - Manual tier upgrade/downgrade (admin only)
  - Tier history

- [ ] **Customer Analytics**
  - Total orders
  - Total spent (lifetime value)
  - Average order value
  - Last order date
  - Favorite products/categories
  - Purchase frequency

**Deliverables**:
- Customer list page với segmentation
- Customer detail page
- VIP tier management
- Customer analytics

**Files to Create**:
```
orchard-store-admin/
├── app/
│   └── (admin)/
│       └── customers/
│           ├── page.tsx (new)
│           └── [id]/
│               └── page.tsx (new)
├── components/
│   └── admin/
│       └── customers/
│           ├── CustomerTable.tsx (new)
│           ├── CustomerFilters.tsx (new)
│           ├── CustomerDetail.tsx (new)
│           ├── CustomerAnalytics.tsx (new)
│           └── TierBadge.tsx (new)
└── lib/
    └── api/
        └── customers.ts (new)
```

---

### **PHASE 7: Analytics Dashboard** (Tuần 9)

#### 7.1 Analytics Dashboard
**Mục tiêu**: Dashboard với charts và reports

**Tasks**:
- [ ] **Backend API** (cần tạo)
  - `GET /api/admin/analytics/sales` - Sales data (by period)
  - `GET /api/admin/analytics/products` - Product performance
  - `GET /api/admin/analytics/customers` - Customer behavior
  - `GET /api/admin/analytics/revenue` - Revenue reports

- [ ] **Sales Charts**
  - Revenue line chart (daily, weekly, monthly, yearly)
  - Orders bar chart
  - Sales by category (pie chart)
  - Sales by brand (bar chart)
  - Date range selector
  - Comparison (this period vs last period)

- [ ] **Product Performance Reports**
  - Top selling products
  - Low selling products
  - Out of stock products
  - Products by revenue
  - Products by quantity sold

- [ ] **Customer Behavior Analytics**
  - New customers over time
  - Customer retention rate
  - Average order value trend
  - Customer lifetime value distribution
  - VIP tier distribution

- [ ] **Revenue Reports by Period**
  - Daily revenue
  - Weekly revenue
  - Monthly revenue
  - Yearly revenue
  - Revenue by category
  - Revenue by payment method
  - Export reports (PDF, Excel)

**Deliverables**:
- Analytics dashboard page
- Multiple charts với real data
- Reports với export functionality

**Files to Create**:
```
orchard-store-admin/
├── app/
│   └── (admin)/
│       └── analytics/
│           └── page.tsx (new)
├── components/
│   └── admin/
│       └── analytics/
│           ├── SalesChart.tsx (new)
│           ├── ProductPerformance.tsx (new)
│           ├── CustomerAnalytics.tsx (new)
│           └── RevenueReport.tsx (new)
└── lib/
    └── api/
        └── analytics.ts (new)
```

**Dependencies to Install**:
```bash
npm install recharts # hoặc chart.js
npm install jspdf jspdf-autotable # cho export PDF
```

---

### **PHASE 8: Inventory Management** (Tuần 10)

#### 8.1 Inventory Management
**Mục tiêu**: Quản lý inventory với monitoring và alerts

**Tasks**:
- [ ] **Backend API** (cần tạo)
  - `GET /api/admin/inventory` - Inventory list
  - `GET /api/admin/inventory/alerts` - Low stock alerts
  - `GET /api/admin/inventory/{id}/history` - Inventory history
  - `PUT /api/admin/inventory/{id}/stock` - Update stock
  - `GET /api/admin/inventory/transactions` - Stock transactions

- [ ] **Stock Level Monitoring**
  - Product list với stock quantity
  - Stock status indicators (in stock, low stock, out of stock)
  - Stock value calculation
  - Filter by stock status
  - Sort by stock quantity

- [ ] **Low Stock Alerts**
  - Alert list (products below threshold)
  - Alert severity (critical, warning)
  - Auto alerts khi stock thấp
  - Alert notifications (email, in-app)

- [ ] **Inventory History Tracking**
  - Stock movement history
  - Transaction types (purchase, sale, adjustment, return)
  - History timeline
  - Filter by date, product, transaction type

- [ ] **Supplier Management** (optional, nếu cần)
  - Supplier list
  - Supplier products
  - Purchase orders
  - Supplier contact information

**Deliverables**:
- Inventory management page
- Stock monitoring dashboard
- Low stock alerts
- Inventory history

**Files to Create**:
```
orchard-store-admin/
├── app/
│   └── (admin)/
│       └── inventory/
│           ├── page.tsx (new)
│           └── [id]/
│               └── history/
│                   └── page.tsx (new)
├── components/
│   └── admin/
│       └── inventory/
│           ├── InventoryTable.tsx (new)
│           ├── StockAlerts.tsx (new)
│           ├── InventoryHistory.tsx (new)
│           └── StockUpdateForm.tsx (new)
└── lib/
    └── api/
        └── inventory.ts (new)
```

---

## 📦 Dependencies Tổng Hợp

### Core Dependencies (Đã có)
```json
{
  "next": "^14.x",
  "react": "^18.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x",
  "axios": "^1.x"
}
```

### Cần Cài Đặt Thêm
```bash
# State Management & Data Fetching
npm install zustand @tanstack/react-query

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# UI Components (shadcn/ui)
npx shadcn-ui@latest init
npx shadcn-ui@latest add dropdown-menu avatar badge table checkbox select dialog textarea label switch tabs

# Charts
npm install recharts
# hoặc
npm install chart.js react-chartjs-2

# File Upload
npm install react-dropzone

# Rich Text Editor
npm install react-quill
# hoặc
npm install @tiptap/react @tiptap/starter-kit

# Drag & Drop
npm install @dnd-kit/core @dnd-kit/sortable

# Export
npm install xlsx jspdf jspdf-autotable

# Icons (đã có lucide-react)
# npm install lucide-react
```

---

## 🎯 Ưu Tiên Phát Triển

### High Priority (MVP - Minimum Viable Product)
1. ✅ **Admin Layout & Navigation** - Foundation
2. ✅ **Admin Authentication** - Security
3. ✅ **Dashboard Overview** - Overview
4. ✅ **Product Data Table** - Core functionality
5. ✅ **Product CRUD Operations** - Core functionality

### Medium Priority
6. **Category Management** - Important for organization
7. **Order Management** - Core business function
8. **Customer Management** - Customer insights

### Low Priority (Nice to Have)
9. **Analytics Dashboard** - Insights & reports
10. **Inventory Management** - Advanced inventory control

---

## 📅 Timeline Ước Tính

- **Phase 1**: Foundation & Authentication (1 tuần)
- **Phase 2**: Dashboard & Statistics (1 tuần)
- **Phase 3**: Product Management (2 tuần)
- **Phase 4**: Category Management (1 tuần)
- **Phase 5**: Order Management (2 tuần)
- **Phase 6**: Customer Management (1 tuần)
- **Phase 7**: Analytics Dashboard (1 tuần)
- **Phase 8**: Inventory Management (1 tuần)

**Tổng cộng**: ~10 tuần (2.5 tháng) cho một developer

**Nếu có 2-3 developers**: Có thể rút xuống còn ~4-5 tuần

---

## ✅ Checklist Tổng Hợp

### Phase 1: Foundation & Authentication
- [ ] Responsive sidebar với mobile menu
- [ ] Header với user menu & notifications
- [ ] Breadcrumb component
- [ ] Mobile-friendly design
- [ ] Login page
- [ ] Protected admin routes
- [ ] Role-based access control
- [ ] Session management

### Phase 2: Dashboard & Statistics
- [ ] Stats cards với real data
- [ ] Recent activities feed
- [ ] Quick action buttons
- [ ] Basic charts placeholder

### Phase 3: Product Management
- [ ] Product data table với search, filter, sort
- [ ] Bulk operations
- [ ] Image preview trong table
- [ ] Pagination & export
- [ ] Create product form với rich text editor
- [ ] Edit product form
- [ ] Image upload với drag & drop
- [ ] Category assignment
- [ ] Inventory management trong form

### Phase 4: Category Management
- [ ] Category tree view
- [ ] Drag & drop sorting
- [ ] Bulk category operations
- [ ] SEO fields management

### Phase 5: Order Management
- [ ] Order list với advanced filters
- [ ] Order detail view
- [ ] Status update workflow
- [ ] Customer communication logs

### Phase 6: Customer Management
- [ ] Customer list với segmentation
- [ ] Customer detail với order history
- [ ] Membership tier management
- [ ] Customer analytics

### Phase 7: Analytics Dashboard
- [ ] Sales charts (line, bar charts)
- [ ] Product performance reports
- [ ] Customer behavior analytics
- [ ] Revenue reports by period

### Phase 8: Inventory Management
- [ ] Stock level monitoring
- [ ] Low stock alerts
- [ ] Inventory history tracking
- [ ] Supplier management (optional)

---

## 🚀 Next Steps

1. **Bắt đầu với Phase 1**: Hoàn thiện layout và authentication
2. **Setup dependencies**: Cài đặt các packages cần thiết
3. **Tạo component structure**: Setup folder structure cho components
4. **Implement từng phase**: Làm tuần tự từng phase
5. **Test & Refine**: Test mỗi feature trước khi chuyển phase tiếp theo

---

## 📝 Notes

- **Backend API**: Một số API đã có (products, brands, categories), cần enhance thêm
- **API cần tạo mới**: Orders, Customers, Analytics, Inventory, Dashboard stats
- **UI Components**: Sử dụng shadcn/ui để đảm bảo consistency
- **State Management**: Zustand cho client state, React Query cho server state
- **Form Validation**: Zod schema cho type-safe validation
- **Error Handling**: Global error handling với React Query
- **Loading States**: Skeleton loaders cho better UX
- **Responsive Design**: Mobile-first approach

---

**Last Updated**: 2024-12-19
**Status**: Planning Phase

