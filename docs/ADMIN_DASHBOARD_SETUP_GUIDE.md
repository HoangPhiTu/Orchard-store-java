## Admin Dashboard – Step-by-step Runbook

This guide shows exactly how to prepare, run, and verify the Orchard Admin Dashboard (Next.js 14) so that only authenticated admins can access `/admin/**`. Keep it nearby whenever you reset the environment.

### 1. Prerequisites

- Node.js ≥ 20 and npm ≥ 10.
- Backend API (Spring Boot) running and exposing `/api/auth/login`.
- Supabase DB + Redis already configured for the backend.

### 2. Environment variables (`orchard-admin-dashboad/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ACCESS_TOKEN_KEY=orchard_admin_token
```

> `NEXT_PUBLIC_ACCESS_TOKEN_KEY` must match the cookie name that `middleware.ts` reads.

### 3. Install & start the dashboard

```bash
cd orchard-admin-dashboad
npm install          # first time only
npm run dev          # starts Next.js on http://localhost:3000
```

### 4. Login flow (client side)

1. Visit `http://localhost:3000/login`.
2. Submit valid admin credentials.
3. On success, the app stores the JWT in:
   - `localStorage[TOKEN_KEY]`
   - Cookie `TOKEN_KEY` (used by middleware)
4. Browser automatically redirects to `/admin/dashboard`.
5. Tùy chọn **Remember me** (checkbox) → cookie/token sẽ sống 7 ngày giống trải nghiệm Saledash; nếu bỏ chọn thì chỉ là session cookie.

#### 4.1. Saved login snapshots

- Trang Login lưu lại tối đa 3 lần đăng nhập gần nhất (email + mật khẩu được mã hoá Base64 trong `localStorage`).
- Khi focus vào Email/Password hoặc bấm nút `Saved logins`, một popover hiển thị danh sách tài khoản đã đăng nhập trước đó.
- Chọn một tài khoản sẽ tự động điền cả email và mật khẩu; có nút 🗑 để xoá từng dòng.
- Mỗi bản ghi hiển thị thời điểm đăng nhập lần cuối theo ngôn ngữ `vi-VN` để dễ nhận biết tài khoản nào mới nhất.

### 5. Route protection (middleware)

`middleware.ts` enforces authentication for every route except `/login` and static assets:

```ts
const token = request.cookies.get(TOKEN_KEY)?.value;
const isAuthRoute = pathname.startsWith("/login");

if (!token && !isAuthRoute) {
  return NextResponse.redirect(new URL("/login", request.url));
}

if (token && isAuthRoute) {
  return NextResponse.redirect(new URL("/", request.url));
}
```

- Not logged in → redirect to `/login?next=<requested-path>`.
- Already logged in → blocked from revisiting `/login`, redirected to `/`.

### 6. Dashboard structure

- `src/app/(admin)/layout.tsx`: global admin shell (sidebar, header, profile dropdown, search).
- `src/app/(admin)/page.tsx`: redirects `/admin` → `/admin/dashboard`.
- `src/app/(admin)/admin/dashboard/page.tsx`: Overview page with stats, charts, recent orders.
- `src/app/(auth)/login/page.tsx`: Shadcn UI + React Hook Form login screen.
- `src/components/layout/*`: responsive header + sidebar components.

### 7. Mock data checkpoints

Until backend analytics endpoints are ready, the dashboard uses mock data:

- Stat cards: total revenue, orders, customers, low-stock alert.
- Charts: `recharts` line + bar data seeded in the page.
- Recent orders table: 5 sample orders with colored status badges.

Swap these with live API hooks once endpoints are available (e.g., via TanStack Query).

### 8. Verifying authentication manually

1. **Without token**: open a fresh incognito window → hitting `/admin/dashboard` must redirect to `/login`.
2. **With token**: log in → try visiting `/login` again → should bounce back to `/admin/dashboard`.

### 9. Common tweaks

- Change dashboard accent colors or spacing → update `components/layout/*` or Tailwind classes in the layout.
- Add new protected pages → create routes under `src/app/(admin)/admin/*`; middleware will guard them automatically.
- Update token key → change both `.env.local` and `TOKEN_KEY` fallback in `middleware.ts`.

### 10. Troubleshooting

- **401 during login**: confirm backend `/api/auth/login` works via Postman and CORS allows `http://localhost:3000`.
- **Stuck on login**: ensure `NEXT_PUBLIC_API_URL` is correct and backend is reachable.
- **Access without login**: verify the cookie name matches and that middleware `matcher` still includes all routes.

That’s it—follow these steps sequentially whenever you need to rebuild or onboard someone new to the Admin Dashboard.
