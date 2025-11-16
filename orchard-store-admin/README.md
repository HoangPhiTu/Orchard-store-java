# 🎛️ Orchard Store Admin Panel

Admin Panel cho Orchard Store E-Commerce Platform, được xây dựng với Next.js 14+ và TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm hoặc yarn
- Spring Boot backend đang chạy tại `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Run development server
npm run dev
```

Admin panel sẽ chạy tại: `http://localhost:3001`

## 📁 Project Structure

```
orchard-store-admin/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (admin)/           # Admin routes (protected)
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── admin/            # Admin-specific components
├── lib/                  # Utilities & API clients
│   ├── api/             # API clients
│   └── utils/           # Helper functions
├── types/               # TypeScript types
└── store/              # Zustand stores
```

## 🔧 Configuration

### Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

## 📚 Features

- ✅ Product Management (CRUD)
- ✅ Brand Management (CRUD)
- ✅ Category Management (CRUD, Hierarchical)
- ✅ Order Management (View, Update status)
- ✅ Customer Management (View, Analytics)
- ✅ Dashboard với statistics
- ✅ Authentication (JWT)
- ✅ Responsive Design

## 🛠️ Tech Stack

- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

## 📖 Documentation

Xem [ADMIN_PANEL_SETUP.md](../ADMIN_PANEL_SETUP.md) để biết chi tiết setup.

