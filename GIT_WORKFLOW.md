# 🔄 Git Workflow - Làm Việc Hàng Ngày

## ✅ Push Nhiều Lần Có Bị Sao Không?

**KHÔNG!** Push nhiều lần là **BÌNH THƯỜNG** và **KHUYẾN KHÍCH**! 

### Tại Sao?

1. ✅ **Git chỉ push thay đổi mới** - Không push lại code cũ
2. ✅ **Code cũ vẫn an toàn** - Không bị mất hay ghi đè
3. ✅ **Lịch sử được lưu** - Mỗi commit là một snapshot
4. ✅ **Dễ rollback** - Có thể quay lại bất kỳ commit nào
5. ✅ **Collaboration tốt** - Team có thể sync code thường xuyên

---

## 📋 Workflow Hàng Ngày

### Khi Bắt Đầu Làm Việc:

```powershell
# 1. Pull code mới nhất từ GitHub (nếu làm việc nhóm)
git pull origin main

# 2. Kiểm tra status
git status
```

### Khi Làm Xong Một Tính Năng:

```powershell
# 1. Xem những gì đã thay đổi
git status
git diff

# 2. Add files
git add .

# 3. Commit với message rõ ràng
git commit -m "feat: Add product search functionality"

# 4. Push lên GitHub
git push origin main
```

---

## 🎯 Best Practices

### 1. Commit Thường Xuyên

✅ **Nên:**
- Commit sau mỗi tính năng nhỏ hoàn thành
- Commit message rõ ràng, mô tả đúng thay đổi
- Commit khi code đang hoạt động tốt

❌ **Không nên:**
- Commit quá ít (mất nhiều thời gian để tìm bug)
- Commit code bị lỗi
- Commit message mơ hồ ("update", "fix")

### 2. Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật documentation
- `style`: Formatting, không ảnh hưởng code
- `refactor`: Refactor code
- `test`: Thêm/sửa tests
- `chore`: Cập nhật build, dependencies

**Ví dụ:**
```bash
git commit -m "feat: Add product search with filters

- Implement search by brand, category, price range
- Add pagination support
- Add sorting functionality"
```

### 3. Push Thường Xuyên

✅ **Nên push:**
- Sau mỗi commit quan trọng
- Cuối ngày làm việc
- Trước khi nghỉ (để backup code)

❌ **Không cần push:**
- Mỗi 5 phút (trừ khi làm việc nhóm)
- Code đang test, chưa hoàn thành

---

## 🚀 Các Cách Push Code

### Option 1: Dùng Script (Khuyến Nghị)

```powershell
# Script đơn giản
.\push-to-github-simple.ps1

# Hoặc script đầy đủ
.\push-to-github.ps1
```

### Option 2: Lệnh Thủ Công

```powershell
# 1. Add files
git add .

# 2. Commit
git commit -m "feat: Your feature description"

# 3. Push
git push origin main
```

### Option 3: Push Nhanh (Nếu đã có branch tracking)

```powershell
git add .
git commit -m "feat: Your feature"
git push  # Tự động push lên origin/main
```

---

## 📊 Ví Dụ Workflow Thực Tế

### Ngày 1: Làm Tính Năng A

```powershell
# Làm xong tính năng A
git add .
git commit -m "feat: Add product search functionality"
git push origin main
```

### Ngày 2: Làm Tính Năng B

```powershell
# Làm xong tính năng B
git add .
git commit -m "feat: Add shopping cart"
git push origin main
```

### Ngày 3: Sửa Lỗi

```powershell
# Sửa lỗi
git add .
git commit -m "fix: Fix product image upload issue"
git push origin main
```

**Kết quả:** GitHub sẽ có 3 commits, mỗi commit là một snapshot riêng biệt!

---

## 🔍 Xem Lịch Sử Commit

```powershell
# Xem tất cả commits
git log

# Xem commits ngắn gọn
git log --oneline

# Xem commits trên GitHub
# Vào: https://github.com/HoangPhiTu/Orchard-store-java/commits/main
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Không Push Code Bị Lỗi

❌ **Không nên:**
```powershell
# Code đang bị lỗi, chưa test
git add .
git commit -m "WIP: Working on feature"
git push  # ❌ Không nên!
```

✅ **Nên:**
```powershell
# Test code trước
# Code hoạt động tốt
git add .
git commit -m "feat: Complete feature X"
git push  # ✅ OK!
```

### 2. Backup Trước Khi Push Lớn

Nếu có thay đổi lớn, nên:
- Test kỹ trước khi push
- Commit từng phần nhỏ
- Có thể tạo branch riêng

### 3. Nếu Làm Việc Nhóm

```powershell
# Luôn pull trước khi push
git pull origin main
git add .
git commit -m "feat: Your feature"
git push origin main
```

---

## 🆘 Troubleshooting

### Lỗi: "Updates were rejected"

**Nguyên nhân:** Có người khác đã push code mới lên GitHub

**Giải pháp:**
```powershell
# Pull code mới nhất
git pull origin main

# Resolve conflicts (nếu có)
# Sau đó push lại
git push origin main
```

### Lỗi: "Authentication failed"

**Giải pháp:**
- Sử dụng Personal Access Token thay vì password
- Hoặc setup SSH keys

### Muốn Xem Code Cũ

```powershell
# Xem commit cũ
git log

# Checkout về commit cũ (chỉ để xem)
git checkout <commit-hash>

# Quay lại hiện tại
git checkout main
```

---

## ✅ Checklist Trước Khi Push

- [ ] Code đã test và hoạt động tốt
- [ ] Commit message rõ ràng
- [ ] Không có file nhạy cảm (application.properties, .env)
- [ ] Đã pull code mới nhất (nếu làm việc nhóm)
- [ ] Sẵn sàng push!

---

## 🎯 Tóm Tắt

**Push nhiều lần:**
- ✅ **Bình thường** và **khuyến khích**
- ✅ **An toàn** - Code cũ không bị mất
- ✅ **Tốt cho collaboration** - Team sync code thường xuyên
- ✅ **Dễ quản lý** - Mỗi commit là một milestone

**Workflow khuyến nghị:**
1. Làm tính năng
2. Test code
3. Commit với message rõ ràng
4. Push lên GitHub
5. Lặp lại!

**Không có gì phải lo lắng!** 🚀

