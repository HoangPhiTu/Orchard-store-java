# 📜 PowerShell Scripts - Hướng Dẫn Sử Dụng

## 📋 Danh Sách Scripts

### 1. `setup-github-repo.ps1` - Setup Repository Lần Đầu

**Mục đích:** Khởi tạo Git repository và cấu hình remote cho lần đầu tiên.

**Cách sử dụng:**
```powershell
.\setup-github-repo.ps1 -GitHubUsername "YOUR_USERNAME" -RepositoryName "orchard-store"
```

**Ví dụ:**
```powershell
.\setup-github-repo.ps1 -GitHubUsername "HoangPhiTu" -RepositoryName "orchard-store"
```

**Tính năng:**
- ✅ Kiểm tra và khởi tạo Git repository
- ✅ Cấu hình Git user.name và user.email (nếu chưa có)
- ✅ Thêm remote origin
- ✅ Kiểm tra .gitignore
- ✅ Hướng dẫn các bước tiếp theo

---

### 2. `push-to-github.ps1` - Push Code (Đầy Đủ Tính Năng)

**Mục đích:** Script đầy đủ với validation và error handling để push code lên GitHub.

**Cách sử dụng:**
```powershell
# Sử dụng mặc định (hỏi thông tin)
.\push-to-github.ps1

# Với tham số
.\push-to-github.ps1 -GitHubUsername "YOUR_USERNAME" -RepositoryName "orchard-store" -CommitMessage "Your commit message"

# Bỏ qua xác nhận
.\push-to-github.ps1 -SkipConfirmation
```

**Tính năng:**
- ✅ Kiểm tra Git đã cài đặt
- ✅ Kiểm tra Git config
- ✅ Tự động thêm remote (nếu chưa có)
- ✅ Kiểm tra files cần commit
- ✅ Cảnh báo nếu application.properties bị commit
- ✅ Hiển thị preview files sẽ commit
- ✅ Xác nhận trước khi push
- ✅ Error handling đầy đủ
- ✅ Hướng dẫn khi gặp lỗi

---

### 3. `push-to-github-simple.ps1` - Push Code (Đơn Giản)

**Mục đích:** Script đơn giản, nhanh chóng để push code.

**Cách sử dụng:**
```powershell
.\push-to-github-simple.ps1
```

**Tính năng:**
- ✅ Kiểm tra Git
- ✅ Tự động thêm remote (nếu chưa có)
- ✅ Hiển thị files sẽ commit
- ✅ Hỏi commit message
- ✅ Push lên GitHub

**Phù hợp cho:** Người đã quen với Git, muốn push nhanh.

---

## 🚀 Workflow Khuyến Nghị

### Lần Đầu Tiên:

```powershell
# Bước 1: Setup repository
.\setup-github-repo.ps1 -GitHubUsername "YOUR_USERNAME" -RepositoryName "orchard-store"

# Bước 2: Tạo repository trên GitHub (theo hướng dẫn trong script)

# Bước 3: Push code
.\push-to-github.ps1
```

### Hàng Ngày:

```powershell
# Option 1: Script đầy đủ (khuyến nghị)
.\push-to-github.ps1

# Option 2: Script đơn giản (nhanh)
.\push-to-github-simple.ps1
```

---

## ⚙️ Cấu Hình

### Git Config (Nếu Chưa Có)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Personal Access Token

Nếu gặp lỗi authentication khi push:

1. Tạo Personal Access Token:
   - GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Generate new token (classic)
   - Chọn scope: `repo`
   - Copy token

2. Khi push, dùng token này thay vì password GitHub

---

## 🔒 Bảo Mật

### Files Đã Được Bảo Vệ

✅ **Đã ignore:**
- `application.properties` (chứa database password, JWT secrets)
- `.env.local` (chứa API keys)
- `logs/`, `node_modules/`, `target/`

### Kiểm Tra Trước Khi Push

Scripts sẽ tự động kiểm tra:
- ✅ `application.properties` có bị commit không
- ✅ `.gitignore` đã cấu hình đúng chưa
- ✅ Files nhạy cảm có bị add không

---

## 🆘 Troubleshooting

### Lỗi: "Git chưa được cài đặt"
- Cài đặt Git từ: https://git-scm.com/downloads
- Hoặc cài qua Chocolatey: `choco install git`

### Lỗi: "Authentication failed"
- Sử dụng Personal Access Token thay vì password
- Hoặc setup SSH keys

### Lỗi: "Repository not found"
- Kiểm tra repository đã được tạo trên GitHub chưa
- Kiểm tra username và repository name đúng chưa
- Kiểm tra quyền truy cập (private repo cần authentication)

### Lỗi: "application.properties bị commit"
- Kiểm tra `.gitignore` đã có rule ignore file này chưa
- Nếu đã commit nhầm, xóa khỏi Git:
  ```powershell
  git rm --cached orchard-store-backend/src/main/resources/application.properties
  git commit -m "Remove application.properties from Git"
  ```

---

## 📝 Ví Dụ Sử Dụng

### Ví Dụ 1: Setup Lần Đầu

```powershell
# 1. Setup
.\setup-github-repo.ps1 -GitHubUsername "HoangPhiTu" -RepositoryName "orchard-store"

# 2. Tạo repository trên GitHub (theo hướng dẫn)

# 3. Push
.\push-to-github.ps1
```

### Ví Dụ 2: Push Thường Xuyên

```powershell
# Mỗi khi có thay đổi
.\push-to-github-simple.ps1
```

### Ví Dụ 3: Push Với Commit Message Cụ Thể

```powershell
.\push-to-github.ps1 -CommitMessage "feat: Add product search functionality"
```

---

## ✅ Checklist

Trước khi push:
- [ ] Đã tạo repository trên GitHub
- [ ] Đã setup remote (hoặc dùng script)
- [ ] Đã kiểm tra `.gitignore`
- [ ] Đã kiểm tra `application.properties` không bị commit
- [ ] Đã có Personal Access Token (nếu cần)

---

**Lưu ý:** Nếu gặp lỗi, scripts sẽ hiển thị hướng dẫn chi tiết để khắc phục.

