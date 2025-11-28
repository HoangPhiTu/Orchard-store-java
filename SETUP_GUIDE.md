# 🚀 Hướng Dẫn Setup Dự Án Orchard Store

> **Hướng dẫn chi tiết và đầy đủ để clone và chạy dự án từ GitHub**

---

## 📋 Mục Lục

1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Bước 1: Clone Repository](#bước-1-clone-repository)
3. [Bước 2: Setup Backend (Spring Boot)](#bước-2-setup-backend-spring-boot)
4. [Bước 3: Setup Frontend Dashboard](#bước-3-setup-frontend-dashboard)
5. [Bước 4: Setup Frontend Storefront](#bước-4-setup-frontend-storefront)
6. [Bước 5: Chạy Dự Án](#bước-5-chạy-dự-án)
7. [Kiểm Tra & Xác Minh](#kiểm-tra--xác-minh)
8. [Troubleshooting Chi Tiết](#troubleshooting-chi-tiết)

---

## ✅ Yêu Cầu Hệ Thống

### Phần Mềm Bắt Buộc

| Phần Mềm | Phiên Bản Tối Thiểu | Download Link |
|----------|---------------------|---------------|
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

### Kiểm Tra Yêu Cầu

```bash
# Kiểm tra Java
java -version
# Kết quả mong đợi: openjdk version "21" hoặc tương tự

# Kiểm tra Maven (nếu đã cài)
mvn -version
# Hoặc dùng Maven Wrapper: .\mvnw.cmd -version (Windows) hoặc ./mvnw -version (Linux/Mac)

# Kiểm tra Node.js
node -v
# Kết quả mong đợi: v20.x.x hoặc cao hơn

# Kiểm tra npm
npm -v
# Kết quả mong đợi: 10.x.x hoặc cao hơn

# Kiểm tra Git
git --version
```

---

## 📥 Bước 1: Clone Repository

### 1.1. Clone từ GitHub

```bash
# Clone repository
git clone https://github.com/HoangPhiTu/Orchard-store-java-private.git

# Di chuyển vào thư mục dự án
cd Orchard-store-java-private
```

### 1.2. Kiểm Tra Cấu Trúc Dự Án

Sau khi clone, bạn sẽ thấy cấu trúc như sau:

```
Orchard-store-java-private/
├── orchard-store-backend/      # Spring Boot Backend
├── orchard-store-dashboad/     # Next.js Admin Dashboard
├── orchard-storefront/          # Next.js Storefront
├── docs/                        # Tài liệu
├── README.md                    # Tài liệu tổng quan
└── SETUP_GUIDE.md              # File này
```

---

## ☕ Bước 2: Setup Backend (Spring Boot)

### 2.1. Di Chuyển Vào Thư Mục Backend

```bash
cd orchard-store-backend
```

### 2.2. Kiểm Tra Java Version

```bash
java -version
```

**Kết quả mong đợi:** `openjdk version "21"` hoặc tương tự

Nếu chưa có Java 21, cài đặt từ:
- Windows: [Adoptium](https://adoptium.net/)
- Linux: `sudo apt install openjdk-21-jdk`
- Mac: `brew install openjdk@21`

### 2.3. Cấu Hình Database

Dự án đã có sẵn file `application.properties` với cấu hình Supabase. File này đã được commit vào repository.

**File:** `orchard-store-backend/src/main/resources/application.properties`

Các thông tin database đã được cấu hình sẵn:
- Database URL: Supabase PostgreSQL
- Username và Password: Đã có sẵn
- JWT Secrets: Đã có sẵn
- Email Configuration: Đã có sẵn

**Lưu ý:** Nếu muốn thay đổi database, chỉnh sửa file `application.properties`.

### 2.4. Build Backend

```bash
# Build project với Maven (sẽ tải dependencies và compile)
# Lần đầu có thể mất 5-10 phút
mvn clean install

# Hoặc nếu không có Maven global, dùng Maven Wrapper:
# Windows:
.\mvnw.cmd clean install
# Linux/Mac:
./mvnw clean install
```

**Lưu ý quan trọng:**
- Lần đầu build sẽ tải tất cả dependencies (có thể mất 5-10 phút)
- Annotation processors (Lombok, MapStruct) sẽ chạy tự động
- Nếu gặp lỗi, xem phần [Troubleshooting](#troubleshooting-chi-tiết)

### 2.5. Chạy Backend

```bash
# Chạy Spring Boot application
mvn spring-boot:run

# Hoặc dùng Maven Wrapper:
# Windows:
.\mvnw.cmd spring-boot:run
# Linux/Mac:
./mvnw spring-boot:run

# Hoặc chạy JAR trực tiếp (sau khi build):
java -jar target/orchard-store-backend-0.0.1-SNAPSHOT.jar
```

**Backend sẽ chạy tại:** `http://localhost:8080`

**API Base URL:** `http://localhost:8080/api`

**Kiểm tra Backend đã chạy:**
- Mở trình duyệt: `http://localhost:8080/api/brands`
- Hoặc dùng curl: `curl http://localhost:8080/api/brands`

---

## 🎨 Bước 3: Setup Frontend Dashboard

### 3.1. Di Chuyển Vào Thư Mục Dashboard

```bash
# Từ thư mục gốc dự án
cd orchard-store-dashboad
```

### 3.2. Cài Đặt Dependencies

```bash
# Cài đặt tất cả dependencies
# Lần đầu có thể mất 3-5 phút
npm install

# Hoặc nếu dùng yarn:
yarn install

# Hoặc nếu dùng pnpm:
pnpm install
```

**Lưu ý:** Lần đầu cài đặt sẽ tải tất cả packages từ npm registry.

### 3.3. Cấu Hình Environment Variables

File `.env.local` đã có sẵn trong repository với cấu hình mặc định:

**File:** `orchard-store-dashboad/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ACCESS_TOKEN_KEY=orchard_admin_token
JWT_SECRET=your-jwt-secret-key-here
```

**Lưu ý:** File này đã được commit vào repository, bạn không cần tạo mới.

Nếu cần thay đổi, chỉnh sửa file `orchard-store-dashboad/.env.local`.

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

**Kiểm tra Dashboard:**
- Mở trình duyệt: `http://localhost:3000`
- Trang login sẽ hiển thị
- Đăng nhập với:
  - Email: `tuhoang.170704@gmail.com`
  - Password: `admin123`

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

## 🔧 Troubleshooting Chi Tiết

### ❌ Lỗi: "Java not found" hoặc "java: command not found"

**Nguyên nhân:** Java chưa được cài đặt hoặc chưa được thêm vào PATH.

**Giải pháp:**

```bash
# Kiểm tra Java đã cài đặt chưa
java -version

# Nếu chưa có, cài đặt Java 21:
# Windows: Tải từ https://adoptium.net/ và cài đặt
# Linux: 
sudo apt update
sudo apt install openjdk-21-jdk

# Mac:
brew install openjdk@21

# Sau khi cài, kiểm tra lại:
java -version
```

### ❌ Lỗi: "Maven not found" hoặc "mvn: command not found"

**Nguyên nhân:** Maven chưa được cài đặt.

**Giải pháp:**
- Dự án đã có Maven Wrapper, không cần cài Maven global
- Dùng `.\mvnw.cmd` (Windows) hoặc `./mvnw` (Linux/Mac) thay vì `mvn`

```bash
# Windows:
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run

# Linux/Mac:
./mvnw clean install
./mvnw spring-boot:run
```

### ❌ Lỗi: "Could not find or load main class com.orchard.orchard_store_backend.OrchardStoreBackendApplication"

**Nguyên nhân:** 
- Annotation processors (Lombok, MapStruct) chưa chạy
- Target folder bị lỗi
- Main class chưa được compile

**Giải pháp:**

```bash
# Bước 1: Clean project
mvn clean

# Bước 2: Xóa target folder (nếu cần)
# Windows:
rmdir /s /q target
# Linux/Mac:
rm -rf target

# Bước 3: Rebuild
mvn clean compile

# Bước 4: Kiểm tra main class đã được compile
# Windows:
dir target\classes\com\orchard\orchard_store_backend\OrchardStoreBackendApplication.class
# Linux/Mac:
ls target/classes/com/orchard/orchard_store_backend/OrchardStoreBackendApplication.class

# Bước 5: Build JAR
mvn clean package

# Bước 6: Chạy
mvn spring-boot:run
```

**Nếu vẫn lỗi:**

1. Kiểm tra IDE settings (nếu dùng IntelliJ IDEA):
   - File → Settings → Build, Execution, Deployment → Compiler → Annotation Processors
   - Đảm bảo "Enable annotation processing" được bật
   - Rebuild project: Build → Rebuild Project

2. Kiểm tra Java version:
   ```bash
   java -version
   # Phải là version 21
   ```

3. Xóa .m2 cache và tải lại:
   ```bash
   # Windows:
   rmdir /s /q %USERPROFILE%\.m2\repository\org\projectlombok
   rmdir /s /q %USERPROFILE%\.m2\repository\org\mapstruct
   
   # Linux/Mac:
   rm -rf ~/.m2/repository/org/projectlombok
   rm -rf ~/.m2/repository/org/mapstruct
   
   # Rebuild
   mvn clean install
   ```

### ❌ Lỗi: "Cannot connect to database"

**Nguyên nhân:** Database connection không đúng hoặc database không khả dụng.

**Giải pháp:**

1. Kiểm tra file `application.properties` có đúng thông tin database không
2. Kiểm tra Supabase project đang hoạt động
3. Kiểm tra network connection
4. Kiểm tra logs trong `orchard-store-backend/logs/orchard-backend.log`

### ❌ Lỗi: "Port 8080 already in use"

**Nguyên nhân:** Port 8080 đã được sử dụng bởi process khác.

**Giải pháp:**

```bash
# Windows: Tìm process đang dùng port 8080
netstat -ano | findstr :8080

# Kill process (thay PID bằng process ID tìm được)
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8080 | xargs kill -9

# Hoặc đổi port trong application.properties:
server.port=8081
```

### ❌ Lỗi: "npm install failed"

**Nguyên nhân:** Network issue hoặc npm cache bị lỗi.

**Giải pháp:**

```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json

# Windows:
rmdir /s /q node_modules
del package-lock.json

# Cài lại
npm install

# Hoặc clear npm cache:
npm cache clean --force
npm install

# Hoặc dùng yarn:
yarn install
```

### ❌ Lỗi: "Module not found" hoặc "Cannot find module"

**Nguyên nhân:** Dependencies chưa được cài đặt.

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
4. Kiểm tra CORS settings trong backend

### ❌ Lỗi: "Cannot find path" (Windows với OneDrive)

**Nguyên nhân:** Đường dẫn có ký tự đặc biệt (như "Tài liệu") có thể gây vấn đề.

**Giải pháp:**

Di chuyển project ra ngoài OneDrive:

```bash
# Di chuyển project ra C:\
# Ví dụ: C:\Projects\Orchard-store-java-private
```

Sau đó clone lại:

```bash
cd C:\Projects
git clone https://github.com/HoangPhiTu/Orchard-store-java-private.git
cd Orchard-store-java-private\orchard-store-backend
mvn clean compile
mvn spring-boot:run
```

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
- ✅ `.mvn/wrapper/` - Maven Wrapper files
- ✅ Tất cả source code

### 🔒 Bảo Mật

**Lưu ý:** File `application.properties` và `.env.local` chứa thông tin nhạy cảm (database credentials, JWT secrets). Repository này là **private**, nhưng vẫn nên cẩn thận khi chia sẻ.

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
- [Main README](./README.md)

---

## 🆘 Cần Giúp Đỡ?

Nếu gặp vấn đề không giải quyết được:

1. Kiểm tra [Troubleshooting](#troubleshooting-chi-tiết) ở trên
2. Xem logs trong `orchard-store-backend/logs/orchard-backend.log`
3. Kiểm tra console của trình duyệt (F12) cho frontend errors
4. Tạo issue trên GitHub repository: https://github.com/HoangPhiTu/Orchard-store-java-private

---

## ✅ Checklist Sau Khi Setup

- [ ] Java 21 đã được cài đặt và có trong PATH
- [ ] Node.js 20+ đã được cài đặt
- [ ] Backend build thành công (`mvn clean install`)
- [ ] Backend chạy được (`mvn spring-boot:run`)
- [ ] Backend API hoạt động (`http://localhost:8080/api/brands`)
- [ ] Dashboard dependencies đã được cài (`npm install`)
- [ ] Dashboard chạy được (`npm run dev`)
- [ ] Dashboard hiển thị trang login (`http://localhost:3000`)
- [ ] Có thể đăng nhập vào Dashboard
- [ ] Storefront (nếu cần) đã được setup và chạy

---

**Last Updated:** 2025-11-28  
**Version:** 2.0.0  
**Repository:** https://github.com/HoangPhiTu/Orchard-store-java-private

