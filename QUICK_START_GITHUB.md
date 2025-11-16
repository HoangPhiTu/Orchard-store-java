# ⚡ Quick Start - Push Lên GitHub

## 🚀 3 Bước Nhanh

### 1. Tạo Repository Trên GitHub

1. Vào https://github.com/new
2. Đặt tên: `orchard-store` (hoặc tên bạn muốn)
3. Chọn **Private** (khuyến nghị)
4. **KHÔNG** tích "Initialize with README"
5. Click **Create repository**

---

### 2. Add Remote và Push

```bash
# Thay YOUR_USERNAME và YOUR_REPO_NAME
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Add tất cả files
git add .

# Commit
git commit -m "Initial commit: Orchard Store E-Commerce Platform

- Spring Boot backend với Product, Brand, Category management
- Next.js admin panel setup
- Database schema design (38 tables)
- Bean Validation implementation"

# Push lên GitHub
git branch -M main
git push -u origin main
```

**Lưu ý:** Nếu hỏi username/password:
- Username: GitHub username của bạn
- Password: **Personal Access Token** (không phải password GitHub)

---

### 3. Tạo Personal Access Token (Nếu Cần)

1. GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate new token (classic)
3. Chọn scope: `repo`
4. Generate và copy token
5. Dùng token này khi push (thay vì password)

---

## ✅ Đã Sẵn Sàng

- ✅ Git repository đã được khởi tạo
- ✅ `.gitignore` đã cấu hình (ignore credentials, logs, node_modules)
- ✅ `application.properties.example` đã tạo
- ✅ `.env.local.example` đã tạo

**Chỉ cần tạo repository trên GitHub và push!**

Xem chi tiết tại: [GITHUB_SETUP.md](./GITHUB_SETUP.md)

