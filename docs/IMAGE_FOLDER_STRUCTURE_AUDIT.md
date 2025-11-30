# Image Folder Structure Audit Report

**Date**: 2024-11-29  
**Status**: ✅ Completed

## Audit Summary

Kiểm tra 3 điểm quan trọng về cấu trúc thư mục hình ảnh theo best practices.

---

## ✅ 1. Tên Folder Gốc

### Chuẩn
- ✅ Số nhiều, viết thường: `users/`, `brands/`, `categories/`

### Kết quả kiểm tra

| Entity | Folder Name | Status | Location |
|--------|-------------|--------|----------|
| Users | `users` | ✅ OK | `user-form-sheet.tsx`, `profile/page.tsx` |
| Brands | `brands` | ✅ OK | `brand-form-sheet.tsx` |
| Categories | `categories` | ✅ OK | `category-form-sheet.tsx` |

**Kết luận**: ✅ **Tất cả đều đúng chuẩn**

---

## ✅ 2. Folder Con (Sub-folder)

### Chuẩn
- ✅ **Flat**: Không có folder con (ảnh nằm trực tiếp trong `users/`)
- ✅ **Date Partitioning**: Chia theo ngày tháng `users/2024/11/29/`
- ❌ **KHÔNG**: Chia theo ID (`users/1/`, `users/123/`)

### Kết quả kiểm tra

#### Frontend

| Entity | Current Structure | Status | Action |
|--------|------------------|--------|--------|
| Users | `users/` (flat) | ✅ OK | Đã refactor dùng date partitioning |
| Brands | `brands/` (flat) | ✅ OK | Cần refactor dùng date partitioning |
| Categories | `categories/${slug}/` | ❌ **CẦN SỬA** | ✅ **ĐÃ SỬA** - Chuyển sang date partitioning |

**Category Form - Đã sửa**:
- ❌ **Trước**: `categories/${parentSlug}/` (rủi ro khi slug thay đổi)
- ✅ **Sau**: `categories/2024/11/29/` (date partitioning)

#### Backend

**S3ImageService.java**:
```java
// ✅ OK - Chỉ dùng folderName/fileName, không chia theo ID
String keyPath = folderName + "/" + fileName;
```

**Kết luận**: 
- ✅ **Category đã được sửa** - Loại bỏ slug-based hierarchy
- ✅ **Backend OK** - Không chia theo ID
- ⏳ **Brand cần refactor** - Để dùng date partitioning

---

## ✅ 3. Tên File

### Chuẩn
- ✅ **UUID**: `c0e9a5d1-5561-4c4b-bf9d-d421e1dbbf25.png`
- ❌ **KHÔNG**: `avatar.png`, `profile.jpg`, `nguyen-van-a.jpg`

### Kết quả kiểm tra

#### Backend

**S3ImageService.java** (Line 99):
```java
// ✅ OK - Dùng UUID
String fileName = UUID.randomUUID().toString() + extension;
```

**LocalStorageService.java** (Line 70):
```java
// ✅ OK - Dùng UUID
String uniqueFilename = UUID.randomUUID().toString() + "." + extension;
```

**Kết luận**: ✅ **Backend đã đúng chuẩn** - Tất cả đều dùng UUID

---

## 📋 Action Items

### ✅ Completed

1. ✅ **Category Form**: Loại bỏ slug-based folder hierarchy
2. ✅ **Category Form**: Chuyển sang date partitioning
3. ✅ **Category Form**: Sử dụng `useImageManagement` hook
4. ✅ **Category Form**: Soft delete thay vì hard delete

### ⏳ Pending (Next Steps)

1. ⏳ **Brand Form**: Refactor để dùng `useImageManagement("brands")`
2. ⏳ **Profile Page**: Refactor để dùng `useImageManagement("users")`
3. ⏳ **Backend**: Implement date partitioning trong upload endpoint
4. ⏳ **Backend**: Implement deletion queue table và endpoints

---

## 📊 Current Structure

### Before (Category - ❌)

```
categories/
├── nuoc-hoa/          # ❌ Rủi ro khi slug thay đổi
│   └── uuid.jpg
└── nuoc-hoa-nam/      # ❌ Phải copy + delete khi rename
    └── uuid.jpg
```

### After (Category - ✅)

```
categories/
├── 2024/
│   ├── 11/
│   │   ├── 29/
│   │   │   └── uuid.jpg
│   │   └── 30/
│   │       └── uuid.jpg
│   └── 12/
│       └── 01/
│           └── uuid.jpg
```

### Users (✅)

```
users/
├── 2024/
│   ├── 11/
│   │   └── 29/
│   │       └── uuid.jpg
```

### Brands (⏳ Cần refactor)

```
brands/
└── uuid.jpg  # ⏳ Cần chuyển sang date partitioning
```

---

## 🔍 Code Changes Summary

### Category Form (`category-form-sheet.tsx`)

**Removed**:
- ❌ `resolveUploadFolder()` function (slug-based)
- ❌ `uploadService` import (direct usage)

**Added**:
- ✅ `useImageManagement("categories")` hook
- ✅ Date partitioning tự động
- ✅ Soft delete integration

**Changes**:
```typescript
// Before
const folder = resolveUploadFolder(parentId); // categories/slug/
await uploadService.uploadImage(file, folder);

// After
const imageManagement = useImageManagement("categories");
await imageManagement.uploadImage(file); // categories/2024/11/29/
```

---

## ✅ Verification Checklist

- [x] Tên folder gốc: Tất cả đều số nhiều, viết thường
- [x] Folder con: Loại bỏ slug-based hierarchy
- [x] Folder con: Không chia theo ID
- [x] Tên file: Backend dùng UUID
- [x] Category form: Đã refactor
- [ ] Brand form: Cần refactor
- [ ] Profile page: Cần refactor
- [ ] Backend: Cần support date partitioning

---

## 📝 Notes

1. **Category form đã được sửa** - Loại bỏ hoàn toàn slug-based folder
2. **Backend file naming OK** - Đã dùng UUID từ đầu
3. **Brand và Profile** - Cần refactor để đồng bộ với User và Category
4. **Backend upload endpoint** - Cần update để support date partitioning (hiện tại nhận folder từ frontend)

---

**Last Updated**: 2024-11-29  
**Auditor**: Development Team

