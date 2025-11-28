# 🚀 Hướng Dẫn Setup Dự Án Orchard Store

> **Hướng dẫn chi tiết để chạy dự án sau khi clone từ GitHub**

---

## 📋 Mục Lục

1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Bước 1: Clone Repository](#bước-1-clone-repository)
3. [Bước 2: Setup Backend (Spring Boot)](#bước-2-setup-backend-spring-boot)
4. [Bước 3: Setup Frontend Dashboard](#bước-3-setup-frontend-dashboard)
5. [Bước 4: Setup Frontend Storefront](#bước-4-setup-frontend-storefront)
6. [Bước 5: Chạy Dự Án](#bước-5-chạy-dự-án)
7. [Kiểm Tra & Xác Minh](#kiểm-tra--xác-minh)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Yêu Cầu Hệ Thống

### Phần Mềm Bắt Buộc

| Phần Mềm | Phiên Bản | Download |
|----------|-----------|----------|
| **Java** | 21 LTS | [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) hoặc [OpenJDK](https://adoptium.net/) |
| **Maven** | 3.9+ | [Maven](https://maven.apache.org/download.cgi) hoặc dùng Maven Wrapper (đã có sẵn) |
| **Node.js** | 20+ | [Node.js](https://nodejs.org/) |
| **npm** | 10+ | Đi kèm với Node.js |
| **Git** | Latest | [Git](https://git-scm.com/) |

### Phần Mềm Tùy Chọn (Khuyến Nghị)

- **PostgreSQL** (nếu dùng local database thay vì Supabase)
- **Redis** (cho caching và session management)
- **MinIO** (cho file storage - S3 compatible)
- **IntelliJ IDEA** / **VS Code** - IDEs
- **Postman** / **Thunder Client** - API testing

---

## 📥 Bước 1: Clone Repository

```bash
# Clone repository từ GitHub
git clone https://github.com/HoangPhiTu/Orchard-store-java-private.git

# Di chuyển vào thư mục dự án
cd Orchard-store-java-private
```

---

## ☕ Bước 2: Setup Backend (Spring Boot)

### 2.1. Kiểm Tra Java Version

```bash
# Kiểm tra Java đã cài đặt chưa
java -version

# Kết quả mong đợi: openjdk version "21" hoặc tương tự
```

### 2.2. Cấu Hình Database

Dự án đã có sẵn file `application.properties` với cấu hình Supabase. Nếu muốn thay đổi:

**File:** `orchard-store-backend/src/main/resources/application.properties`

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://your-host:5432/postgres
spring.datasource.username=your-username
spring.datasource.password=your-password
```

### 2.3. Build Backend

```bash
# Di chuyển vào thư mục backend
cd orchard-store-backend

# Build project với Maven (sẽ tải dependencies và compile)
mvn clean install

# Hoặc nếu không có Maven global, dùng Maven Wrapper:
# Windows:
.\mvnw.cmd clean install
# Linux/Mac:
./mvnw clean install
```

**Lưu ý:** Lần đầu build có thể mất 5-10 phút để tải dependencies.

### 2.4. Chạy Backend

```bash
# Chạy Spring Boot application
mvn spring-boot:run

# Hoặc dùng Maven Wrapper:
# Windows:
.\mvnw.cmd spring-boot:run
# Linux/Mac:
./mvnw spring-boot:run
```

**Backend sẽ chạy tại:** `http://localhost:8080`

**API Base URL:** `http://localhost:8080/api`

---

## 🎨 Bước 3: Setup Frontend Dashboard

### 3.1. Di Chuyển Vào Thư Mục Dashboard

```bash
# Từ thư mục gốc dự án
cd orchard-store-dashboad
```

### 3.2. Cài Đặt Dependencies

```bash
# Cài đặt tất cả dependencies (lần đầu có thể mất 3-5 phút)
npm install

# Hoặc nếu dùng yarn:
yarn install

# Hoặc nếu dùng pnpm:
pnpm install
```

### 3.3. Cấu Hình Environment Variables

File `.env.local` đã có sẵn trong repository với cấu hình mặc định:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ACCESS_TOKEN_KEY=orchard_admin_token
JWT_SECRET=your-jwt-secret-key-here
```

Nếu cần thay đổi, chỉnh sửa file `orchard-store-dashboad/.env.local`

### 3.4. Chạy Dashboard

```bash
# Chạy development server
npm run dev

# Hoặc:
yarn dev
# Hoặc:
pnpm dev
```

**Dashboard sẽ chạy tại:** `http://localhost:3000`

---

## 🛒 Bước 4: Setup Frontend Storefront

### 4.1. Di Chuyển Vào Thư Mục Storefront

```bash
# Từ thư mục gốc dự án
cd orchard-storefront
```

### 4.2. Cài Đặt Dependencies

```bash
# Cài đặt tất cả dependencies
npm install
```

### 4.3. Cấu Hình Environment Variables

Tạo file `.env.local` (nếu chưa có):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 4.4. Chạy Storefront

```bash
# Chạy development server
npm run dev
```

**Storefront sẽ chạy tại:** `http://localhost:3001` (hoặc port khác nếu 3001 đã được dùng)

---

## 🚀 Bước 5: Chạy Dự Án

### Thứ Tự Chạy Các Service

1. **Backend** (Spring Boot) - Port 8080
2. **Dashboard** (Next.js) - Port 3000
3. **Storefront** (Next.js) - Port 3001 (tùy chọn)

### Chạy Tất Cả Cùng Lúc

Mở **3 terminal windows** và chạy từng service:

**Terminal 1 - Backend:**
```bash
cd orchard-store-backend
mvn spring-boot:run
```

**Terminal 2 - Dashboard:**
```bash
cd orchard-store-dashboad
npm run dev
```

**Terminal 3 - Storefront (tùy chọn):**
```bash
cd orchard-storefront
npm run dev
```

---

## ✅ Kiểm Tra & Xác Minh

### 1. Kiểm Tra Backend

```bash
# Health check
curl http://localhost:8080/api/brands

# Hoặc mở trình duyệt:
# http://localhost:8080/api/brands
```

**Kết quả mong đợi:** JSON response với danh sách brands (có thể là mảng rỗng `[]`)

### 2. Kiểm Tra Dashboard

Mở trình duyệt: `http://localhost:3000`

- ✅ Trang login hiển thị
- ✅ Có thể đăng nhập với:
  - Email: `tuhoang.170704@gmail.com`
  - Password: `admin123`

### 3. Kiểm Tra Storefront

Mở trình duyệt: `http://localhost:3001` (hoặc port tương ứng)

- ✅ Trang chủ hiển thị

---

## 🔧 Troubleshooting

### ❌ Lỗi: "Java not found"

**Giải pháp:**
```bash
# Kiểm tra Java đã cài đặt chưa
java -version

# Nếu chưa có, cài đặt Java 21:
# Windows: Tải từ https://adoptium.net/
# Linux: sudo apt install openjdk-21-jdk
# Mac: brew install openjdk@21
```

### ❌ Lỗi: "Maven not found"

**Giải pháp:**
- Dự án đã có Maven Wrapper, không cần cài Maven global
- Dùng `.\mvnw.cmd` (Windows) hoặc `./mvnw` (Linux/Mac) thay vì `mvn`

### ❌ Lỗi: "Cannot connect to database"

**Giải pháp:**
1. Kiểm tra file `application.properties` có đúng thông tin database không
2. Kiểm tra Supabase project đang hoạt động
3. Kiểm tra network connection

### ❌ Lỗi: "Port 8080 already in use"

**Giải pháp:**
```bash
# Windows: Tìm process đang dùng port 8080
netstat -ano | findstr :8080

# Kill process (thay PID bằng process ID tìm được)
taskkill /PID <PID> /F

# Hoặc đổi port trong application.properties:
server.port=8081
```

### ❌ Lỗi: "npm install failed"

**Giải pháp:**
```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json

# Cài lại
npm install

# Hoặc dùng yarn:
yarn install
```

### ❌ Lỗi: "Module not found" hoặc "Cannot find module"

**Giải pháp:**
```bash
# Đảm bảo đã chạy npm install
cd orchard-store-dashboad
npm install

# Hoặc cho storefront:
cd orchard-storefront
npm install
```

### ❌ Lỗi: "Backend không chạy được"

**Giải pháp:**
1. Kiểm tra Java version: `java -version` (phải là 21)
2. Kiểm tra Maven build: `mvn clean install` (phải thành công)
3. Kiểm tra logs trong `orchard-store-backend/logs/orchard-backend.log`
4. Kiểm tra database connection trong `application.properties`

### ❌ Lỗi: "Frontend không kết nối được Backend"

**Giải pháp:**
1. Đảm bảo Backend đang chạy tại `http://localhost:8080`
2. Kiểm tra file `.env.local` có đúng `NEXT_PUBLIC_API_URL=http://localhost:8080` không
3. Restart frontend server sau khi sửa `.env.local`

---

## 📝 Lưu Ý Quan Trọng

### ⚠️ Dependencies Không Được Commit

Các thư mục sau **KHÔNG** được commit vào Git (đã có trong `.gitignore`):
- `node_modules/` - Dependencies của Node.js (cần chạy `npm install`)
- `target/` - Build output của Maven (tự động tạo khi build)
- `logs/` - Log files
- `.next/` - Build output của Next.js

**Sau khi clone, BẮT BUỘC phải:**
1. Chạy `npm install` trong các thư mục frontend
2. Chạy `mvn clean install` trong thư mục backend

### ✅ Files Đã Được Commit

Các file quan trọng đã được commit:
- ✅ `pom.xml` - Maven dependencies
- ✅ `package.json` - Node.js dependencies
- ✅ `package-lock.json` - Locked dependency versions
- ✅ `application.properties` - Backend configuration (với credentials)
- ✅ `.env.local` - Frontend environment variables
- ✅ `mvnw` / `mvnw.cmd` - Maven Wrapper
- ✅ Tất cả source code

---

## 🎯 Quick Start (Tóm Tắt)

```bash
# 1. Clone repository
git clone https://github.com/HoangPhiTu/Orchard-store-java-private.git
cd Orchard-store-java-private

# 2. Setup Backend
cd orchard-store-backend
mvn clean install
mvn spring-boot:run
# Backend chạy tại http://localhost:8080

# 3. Setup Dashboard (terminal mới)
cd orchard-store-dashboad
npm install
npm run dev
# Dashboard chạy tại http://localhost:3000

# 4. Setup Storefront (terminal mới, tùy chọn)
cd orchard-storefront
npm install
npm run dev
# Storefront chạy tại http://localhost:3001
```

---

## 📚 Tài Liệu Tham Khảo

- [Backend Documentation](./docs/backend/README.md)
- [Frontend Documentation](./docs/frontend/README.md)
- [Getting Started Guide](./docs/01_GETTING_STARTED.md)
- [API Reference](./docs/backend/API_REFERENCE.md)

---

## 🆘 Cần Giúp Đỡ?

Nếu gặp vấn đề không giải quyết được:
1. Kiểm tra [Troubleshooting](#troubleshooting) ở trên
2. Xem logs trong `orchard-store-backend/logs/orchard-backend.log`
3. Kiểm tra console của trình duyệt (F12) cho frontend errors
4. Tạo issue trên GitHub repository

---

**Last Updated:** 2025-11-27  
**Version:** 1.0.0

