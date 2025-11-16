# 🚀 Hướng Dẫn Đẩy Dự Án Lên GitHub

## ⚠️ Quan Trọng: Bảo Mật

Trước khi push lên GitHub, đảm bảo:
- ✅ File `application.properties` đã được thêm vào `.gitignore`
- ✅ File `application.properties.example` đã được tạo (không có credentials)
- ✅ File `.env.local` đã được ignore
- ✅ Không commit passwords, API keys, JWT secrets

---

## 📋 Các Bước Thực Hiện

### Bước 1: Tạo GitHub Repository

1. Đăng nhập vào [GitHub](https://github.com)
2. Click **New repository** (hoặc vào: https://github.com/new)
3. Điền thông tin:
   - **Repository name**: `orchard-store` (hoặc tên bạn muốn)
   - **Description**: `E-Commerce Platform for Perfumes & Cosmetics - Orchard Store`
   - **Visibility**: Private (khuyến nghị) hoặc Public
   - **Không** tích "Initialize with README" (vì đã có README.md)
4. Click **Create repository**

---

### Bước 2: Khởi Tạo Git Repository (Local)

```bash
# Di chuyển vào thư mục project
cd C:\xampp\htdocs\JAVA-ORCHARD-STORE

# Khởi tạo git repository
git init

# Thêm remote repository (thay YOUR_USERNAME và YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Hoặc nếu dùng SSH:
# git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

---

### Bước 3: Kiểm Tra Files Sẽ Commit

```bash
# Xem các file sẽ được commit
git status

# Xem các file đã được ignore
git status --ignored
```

**Đảm bảo các file sau KHÔNG xuất hiện:**
- ❌ `application.properties` (có credentials)
- ❌ `.env.local`
- ❌ `logs/`
- ❌ `node_modules/`
- ❌ `target/`

---

### Bước 4: Add và Commit Files

```bash
# Add tất cả files (trừ những file trong .gitignore)
git add .

# Commit với message
git commit -m "Initial commit: Orchard Store E-Commerce Platform

- Spring Boot backend với Product, Brand, Category management
- Next.js admin panel setup
- Database schema design (38 tables)
- Bean Validation implementation
- VIP customer system design
- Simplified authentication (email-based order verification)"
```

---

### Bước 5: Push Lên GitHub

```bash
# Push lên GitHub (lần đầu)
git branch -M main
git push -u origin main
```

Nếu gặp lỗi authentication, bạn có thể:
- Sử dụng **Personal Access Token** (PAT) thay vì password
- Hoặc setup **SSH keys**

---

### Bước 6: Tạo Personal Access Token (Nếu Cần)

1. Vào GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click **Generate new token (classic)**
3. Đặt tên token: `orchard-store-dev`
4. Chọn scopes: `repo` (full control)
5. Click **Generate token**
6. **Copy token ngay** (chỉ hiển thị 1 lần)
7. Khi push, dùng token thay vì password

---

## 🔐 Bảo Mật Credentials

### File Đã Được Bảo Vệ

✅ **Đã ignore:**
- `application.properties` (chứa database password, JWT secrets)
- `.env.local` (chứa API keys)
- `logs/` (log files)

✅ **Đã tạo file example:**
- `application.properties.example` (template không có credentials)
- `.env.local.example` (template không có credentials)

### Hướng Dẫn Cho Team Members

Khi clone project, cần:

1. **Backend:**
```bash
cd orchard-store-backend/src/main/resources
cp application.properties.example application.properties
# Sau đó điền credentials thực tế vào application.properties
```

2. **Admin Panel:**
```bash
cd orchard-store-admin
cp .env.local.example .env.local
# Sau đó điền API URL vào .env.local
```

---

## 📝 Commit Message Best Practices

### Format:
```
<type>: <subject>

<body>

<footer>
```

### Types:
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật documentation
- `style`: Formatting, không ảnh hưởng code
- `refactor`: Refactor code
- `test`: Thêm/sửa tests
- `chore`: Cập nhật build, dependencies

### Ví dụ:
```bash
git commit -m "feat: Add product search with filters

- Implement search by brand, category, price range
- Add pagination support
- Add sorting functionality

Closes #123"
```

---

## 🔄 Workflow Hàng Ngày

### Khi Làm Việc:

```bash
# 1. Pull latest changes
git pull origin main

# 2. Tạo branch mới cho feature
git checkout -b feature/product-attributes

# 3. Làm việc, commit thường xuyên
git add .
git commit -m "feat: Add product attributes entity"

# 4. Push branch lên GitHub
git push -u origin feature/product-attributes

# 5. Tạo Pull Request trên GitHub
# 6. Sau khi merge, quay về main và pull
git checkout main
git pull origin main
```

---

## 📚 GitHub Repository Structure

Sau khi push, repository sẽ có cấu trúc:

```
orchard-store/
├── .gitignore
├── README.md
├── docs/
│   ├── DOCUMENTATION.md
│   ├── DATABASE_SCHEMA_ENHANCED.md
│   └── ROADMAP_ENHANCED.md
├── orchard-store-backend/
│   ├── src/
│   ├── pom.xml
│   └── ...
├── orchard-store-admin/
│   ├── app/
│   ├── package.json
│   └── ...
└── ...
```

---

## ✅ Checklist Trước Khi Push

- [ ] Đã tạo `application.properties.example`
- [ ] Đã tạo `.env.local.example`
- [ ] Đã cập nhật `.gitignore`
- [ ] Đã kiểm tra `git status` - không có file nhạy cảm
- [ ] Đã tạo GitHub repository
- [ ] Đã setup remote origin
- [ ] Đã commit với message rõ ràng
- [ ] Sẵn sàng push!

---

## 🆘 Troubleshooting

### Lỗi: "fatal: remote origin already exists"
```bash
# Xóa remote cũ
git remote remove origin

# Thêm lại
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Lỗi: "Authentication failed"
- Sử dụng Personal Access Token thay vì password
- Hoặc setup SSH keys

### Lỗi: "Large files detected"
```bash
# Nếu có file lớn, thêm vào .gitignore
echo "large-file.zip" >> .gitignore
git rm --cached large-file.zip
git commit -m "Remove large file"
```

---

**Sau khi push thành công, bạn có thể:**
- ✅ Xem code trên GitHub
- ✅ Tạo branches cho features mới
- ✅ Tạo Pull Requests
- ✅ Track issues và milestones
- ✅ Collaborate với team

