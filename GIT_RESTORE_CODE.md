# 🔄 Cách Lấy Lại Code Cũ Từ GitHub

## 📋 Tổng Quan

Khi đã push code lên GitHub, bạn có nhiều cách để lấy lại code cũ:

1. **Xem code cũ trên GitHub** (chỉ xem, không thay đổi)
2. **Checkout về commit cũ** (tạm thời để xem/test)
3. **Restore file từ commit cũ** (lấy lại 1 file cụ thể)
4. **Tạo branch từ commit cũ** (làm việc trên code cũ)
5. **Revert commit** (undo thay đổi, tạo commit mới)

---

## 1. 👀 Xem Code Cũ Trên GitHub (Dễ Nhất)

### Cách 1: Xem Lịch Sử Commit

1. Vào repository: https://github.com/HoangPhiTu/Orchard-store-java
2. Click vào số commits (ví dụ: "2 commits")
3. Click vào commit bạn muốn xem
4. Xem code tại thời điểm đó

### Cách 2: Xem File Tại Commit Cụ Thể

1. Vào file bạn muốn xem
2. Click vào "History" (biểu tượng đồng hồ)
3. Chọn commit bạn muốn xem
4. Xem nội dung file tại commit đó

### Cách 3: Browse Code Tại Commit

1. Vào repository
2. Click vào commit hash (ví dụ: `d8a32df`)
3. Click "Browse files" để xem toàn bộ code tại commit đó

---

## 2. 🔍 Xem Code Cũ Bằng Git (Local)

### Xem Lịch Sử Commit

```powershell
# Xem tất cả commits
git log

# Xem commits ngắn gọn (1 dòng)
git log --oneline

# Xem commits với graph
git log --oneline --graph

# Xem commits của 1 file cụ thể
git log --oneline README.md
```

**Ví dụ output:**
```
b23d312 docs: Add Git workflow guide
d8a32df Initial commit: Orchard Store E-Commerce Platform
```

### Xem Nội Dung File Tại Commit Cũ

```powershell
# Xem file tại commit cụ thể
git show <commit-hash>:<file-path>

# Ví dụ: Xem README.md tại commit d8a32df
git show d8a32df:README.md

# Xem file tại commit trước đó
git show HEAD~1:README.md
```

### So Sánh Code Giữa Các Commit

```powershell
# So sánh 2 commits
git diff <commit-1> <commit-2>

# So sánh với commit trước
git diff HEAD~1 HEAD

# So sánh 1 file giữa 2 commits
git diff <commit-1> <commit-2> -- README.md
```

---

## 3. 🔄 Checkout Về Commit Cũ (Tạm Thời)

### Checkout Để Xem/Test

```powershell
# Xem commit hash
git log --oneline

# Checkout về commit cũ (detached HEAD state)
git checkout <commit-hash>

# Ví dụ
git checkout d8a32df
```

**Lưu ý:** 
- Bạn đang ở "detached HEAD" state
- Có thể xem/test code
- **KHÔNG nên commit** ở đây (trừ khi tạo branch mới)

### Quay Lại Code Hiện Tại

```powershell
# Quay lại branch main
git checkout main

# Hoặc
git checkout master
```

---

## 4. 📁 Restore File Từ Commit Cũ

### Lấy Lại 1 File Từ Commit Cũ

```powershell
# Restore file từ commit cũ về working directory
git checkout <commit-hash> -- <file-path>

# Ví dụ: Lấy lại README.md từ commit d8a32df
git checkout d8a32df -- README.md

# Sau đó commit
git add README.md
git commit -m "restore: Restore README.md from previous commit"
git push origin main
```

### Lấy Lại Nhiều Files

```powershell
# Lấy lại nhiều files
git checkout <commit-hash> -- file1.txt file2.txt

# Lấy lại cả thư mục
git checkout <commit-hash> -- folder/
```

### Lấy Lại File Về Trạng Thái Commit Trước

```powershell
# Lấy lại file về commit trước đó (HEAD~1)
git checkout HEAD~1 -- README.md

# Lấy lại file về commit trước 2 lần (HEAD~2)
git checkout HEAD~2 -- README.md
```

---

## 5. 🌿 Tạo Branch Từ Commit Cũ

### Tạo Branch Mới Từ Commit Cũ

```powershell
# Tạo branch mới từ commit cũ
git checkout -b <branch-name> <commit-hash>

# Ví dụ: Tạo branch "old-version" từ commit d8a32df
git checkout -b old-version d8a32df

# Làm việc trên branch này
# ... make changes ...

# Push branch lên GitHub
git push -u origin old-version
```

### Làm Việc Trên Branch Cũ

```powershell
# Switch sang branch cũ
git checkout old-version

# Làm việc, commit
git add .
git commit -m "fix: Fix something on old version"

# Merge vào main (nếu cần)
git checkout main
git merge old-version
```

---

## 6. ↩️ Revert Commit (Undo Thay Đổi)

### Revert 1 Commit (Tạo Commit Mới Để Undo)

```powershell
# Revert commit cuối cùng
git revert HEAD

# Revert commit cụ thể
git revert <commit-hash>

# Ví dụ
git revert b23d312

# Push
git push origin main
```

**Lưu ý:** 
- `revert` tạo commit mới để undo thay đổi
- **KHÔNG xóa** commit cũ (an toàn)
- Lịch sử vẫn giữ nguyên

### Revert Nhiều Commits

```powershell
# Revert từ commit A đến commit B
git revert <commit-A>..<commit-B>

# Revert commit cuối cùng và commit trước đó
git revert HEAD~1..HEAD
```

---

## 7. 🔙 Reset Về Commit Cũ (Nguy Hiểm!)

⚠️ **CẢNH BÁO:** `reset` sẽ **XÓA** commits sau đó. Chỉ dùng khi chắc chắn!

### Reset Soft (Giữ Thay Đổi)

```powershell
# Reset về commit cũ, giữ thay đổi trong staging
git reset --soft <commit-hash>

# Ví dụ: Reset về commit d8a32df
git reset --soft d8a32df

# Files vẫn còn, chỉ cần commit lại
git commit -m "New commit"
```

### Reset Mixed (Giữ Thay Đổi, Bỏ Staging)

```powershell
# Reset về commit cũ, giữ thay đổi nhưng bỏ staging
git reset --mixed <commit-hash>
# Hoặc
git reset <commit-hash>
```

### Reset Hard (XÓA TẤT CẢ!)

```powershell
# ⚠️ NGUY HIỂM: Xóa tất cả thay đổi!
git reset --hard <commit-hash>

# Ví dụ: Reset về commit d8a32df, XÓA mọi thứ sau đó
git reset --hard d8a32df
```

**Lưu ý:** 
- `--hard` sẽ **XÓA** tất cả thay đổi chưa commit
- **KHÔNG thể khôi phục** nếu chưa push
- Chỉ dùng khi **CHẮC CHẮN**!

### Force Push Sau Reset (Nguy Hiểm!)

```powershell
# ⚠️ NGUY HIỂM: Ghi đè lịch sử trên GitHub!
git push --force origin main
```

**Lưu ý:**
- Chỉ dùng khi làm việc **MỘT MÌNH**
- **KHÔNG dùng** khi làm việc nhóm
- Có thể làm mất code của người khác!

---

## 8. 📦 Download Code Từ Commit Cũ

### Download ZIP Từ GitHub

1. Vào repository trên GitHub
2. Click vào commit bạn muốn
3. Click "Browse files"
4. Click "Code" > "Download ZIP"
5. Giải nén và sử dụng

### Clone Repository Và Checkout

```powershell
# Clone repository
git clone https://github.com/HoangPhiTu/Orchard-store-java.git
cd Orchard-store-java

# Checkout về commit cũ
git checkout <commit-hash>
```

---

## 9. 🎯 Các Tình Huống Thường Gặp

### Tình Huống 1: "Tôi vô tình xóa code, muốn lấy lại"

```powershell
# Tìm commit có code đó
git log --oneline --all

# Lấy lại file từ commit đó
git checkout <commit-hash> -- <file-path>

# Commit lại
git add <file-path>
git commit -m "restore: Restore deleted file"
git push origin main
```

### Tình Huống 2: "Tôi muốn xem code tại thời điểm hôm qua"

```powershell
# Xem commits hôm qua
git log --since="yesterday" --oneline

# Checkout về commit đó
git checkout <commit-hash>

# Xem code, test
# ...

# Quay lại
git checkout main
```

### Tình Huống 3: "Tôi muốn undo commit vừa push"

```powershell
# Revert commit (an toàn)
git revert HEAD
git push origin main

# Hoặc reset (nguy hiểm, chỉ khi làm việc một mình)
git reset --hard HEAD~1
git push --force origin main
```

### Tình Huống 4: "Tôi muốn lấy lại version cũ của 1 file"

```powershell
# Xem lịch sử file
git log --oneline README.md

# Lấy lại từ commit cụ thể
git checkout <commit-hash> -- README.md

# Commit
git add README.md
git commit -m "restore: Restore old version of README.md"
git push origin main
```

---

## 10. 🔍 Tìm Kiếm Trong Lịch Sử

### Tìm Commit Theo Message

```powershell
# Tìm commit có chứa từ khóa
git log --grep="search"

# Tìm commit theo author
git log --author="HoangPhiTu"
```

### Tìm Commit Có Thay Đổi File

```powershell
# Tìm commits thay đổi file
git log --follow -- README.md

# Tìm commits thay đổi nội dung
git log -S "function name" --source --all
```

### Tìm Commit Theo Ngày

```powershell
# Commits hôm nay
git log --since="today"

# Commits tuần này
git log --since="1 week ago"

# Commits trong khoảng thời gian
git log --since="2024-01-01" --until="2024-01-31"
```

---

## ✅ Checklist

Khi muốn lấy lại code cũ:

- [ ] Xác định commit hash hoặc thời điểm
- [ ] Quyết định phương pháp (xem, restore, revert, reset)
- [ ] Backup code hiện tại (nếu cần)
- [ ] Thực hiện thao tác
- [ ] Test code sau khi restore
- [ ] Commit và push (nếu cần)

---

## 🎯 Tóm Tắt

| Mục Đích | Phương Pháp | Lệnh |
|----------|-------------|------|
| **Chỉ xem** | Xem trên GitHub hoặc `git show` | `git show <hash>:<file>` |
| **Xem tạm thời** | Checkout về commit cũ | `git checkout <hash>` |
| **Lấy lại 1 file** | Checkout file từ commit cũ | `git checkout <hash> -- <file>` |
| **Làm việc trên code cũ** | Tạo branch từ commit cũ | `git checkout -b <branch> <hash>` |
| **Undo commit** | Revert (an toàn) | `git revert <hash>` |
| **Xóa commits** | Reset (nguy hiểm) | `git reset --hard <hash>` |

---

## 🆘 Lưu Ý Quan Trọng

1. ✅ **Luôn backup** trước khi reset hoặc force push
2. ✅ **Dùng revert** thay vì reset khi có thể
3. ✅ **Không force push** khi làm việc nhóm
4. ✅ **Test kỹ** sau khi restore code
5. ✅ **Commit message rõ ràng** khi restore

---

**Nhớ:** Git lưu tất cả lịch sử, bạn có thể lấy lại bất kỳ code nào từ bất kỳ commit nào! 🚀

