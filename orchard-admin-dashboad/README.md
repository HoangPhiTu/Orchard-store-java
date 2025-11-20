## Orchard Admin Dashboard

Next.js 14 (App Router) admin panel for the Orchard e-commerce backend (Spring Boot).  
Tech stack: **TypeScript, Ant Design 5, Tailwind CSS, TanStack Query v5, Zustand, Axios, React Hook Form + Zod**.

### 1. Project structure (enterprise-ready)

```
src/
├─ app/
│  ├─ (auth)/login/page.tsx      # Auth routes
│  ├─ (admin)/admin/dashboard    # Admin dashboard
│  ├─ (store)/page.tsx           # Storefront placeholder
│  ├─ api/health/route.ts        # Example API route
│  ├─ layout.tsx                 # Root layout
│  └─ not-found.tsx
├─ components/
│  ├─ layout/                    # Header, Sidebar
│  ├─ shared/                    # Logo, LoadingSpinner
│  ├─ admin/                     # Dashboard-only widgets
│  ├─ store/                     # Storefront widgets
│  └─ ui/                        # Shadcn base components
├─ lib/
│  ├─ axios-client.ts
│  ├─ utils.ts
│  └─ constants.ts
├─ services/                     # HTTP clients
├─ hooks/                        # Reusable hooks
├─ stores/                       # Zustand stores
├─ types/                        # DTO & API typing
├─ providers/query-provider.tsx  # TanStack Query + AntD theme
└─ middleware.ts                 # Auth guard
```

### 2. Environment variables

Create a `.env.local` file in the project root (or copy `env.local.example`):

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ACCESS_TOKEN_KEY=orchard_admin_token
```

- `NEXT_PUBLIC_API_URL` points to the Spring Boot backend.
- `NEXT_PUBLIC_ACCESS_TOKEN_KEY` is the token key used by axios interceptors, middleware, and Zustand store.

### 3. Installation

```bash
npm install
npm run dev
# visit http://localhost:3000
```

### 4. Authentication flow

- `/login` uses RHF + Zod + Shadcn components to call `POST /api/auth/login`.
- Successful login stores tokens in both `localStorage` and cookies via Zustand (`src/stores/auth-store.ts`).
- `middleware.ts` guards `/admin/**` and reroutes guests to `/login`.
- Axios interceptors (`lib/axios-client.ts`) inject bearer tokens and call `forceLogout()` on `401`.

### 5. Development notes

- Tailwind CSS v4 (`@import "tailwindcss";`) + Ant Design reset CSS.
- TanStack Query client configured in `providers/query-provider.tsx` (with devtools enabled).
- Dashboard shell implemented with custom Sidebar/Header to mirror Saledash UI.

### 6. Scripts

| Command         | Description       |
| --------------- | ----------------- |
| `npm run dev`   | Start dev server  |
| `npm run build` | Production build  |
| `npm run start` | Start prod server |
| `npm run lint`  | Run ESLint        |

Feel free to extend modules under `app/(admin)` or `app/(store)` using the provided services, hooks, and stores.
