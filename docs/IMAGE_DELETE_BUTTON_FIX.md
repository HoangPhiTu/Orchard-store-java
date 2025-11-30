# Image Delete Button Fix

**Date**: 2024-11-29  
**Issue**: Nút X để xóa hình ảnh trong form chỉnh sửa và thêm mới chưa hoạt động

---

## 🐛 Vấn đề

Khi user click nút X để xóa ảnh:
- `onChange(null)` được gọi
- Form field được set thành `null`
- Nhưng ảnh vẫn hiển thị vì `previewUrl` vẫn có giá trị

---

## ✅ Giải pháp

### 1. ImageUpload Component

**File**: `src/components/shared/image-upload.tsx`

**Changes**:
- Khi `value === null` (user đã xóa), không dùng `previewUrl` nữa
- Clear `filePreview` state khi xóa
- Clear file input value

**Code**:
```typescript
const handleRemove = (e: React.MouseEvent) => {
  e.stopPropagation();
  if (disabled) return;
  
  setFilePreview(null); // Clear preview
  if (fileInputRef.current) {
    fileInputRef.current.value = ""; // Clear input
  }
  onChange(null); // Notify parent
};

const effectivePreview = (() => {
  // Nếu value === null (user đã xóa), không hiển thị previewUrl nữa
  if (value === null) {
    return null;
  }
  // ... rest of logic
})();
```

### 2. User Form

**File**: `src/components/features/user/user-form-sheet.tsx`

**Changes**:
- Chỉ dùng `previewUrl` khi `field.value === undefined` (chưa có giá trị)
- Nếu `field.value === null` (user đã xóa), không dùng `previewUrl`

**Code**:
```typescript
<ImageUpload
  value={field.value}
  previewUrl={
    // Chỉ dùng previewUrl khi field.value là undefined
    field.value === undefined && user?.avatarUrl
      ? user.avatarUrl
      : null
  }
  onChange={(file) => {
    field.onChange(file || null);
    form.trigger("avatarUrl");
  }}
/>
```

### 3. Category Form

**File**: `src/components/features/catalog/category-form-sheet.tsx`

**Changes**:
- Tương tự User form
- Chỉ dùng `previewUrl` khi `field.value === undefined`

**Code**:
```typescript
<ImageUpload
  value={field.value}
  previewUrl={
    field.value === undefined
      ? (categoryData?.imageUrl || category?.imageUrl || null)
      : null
  }
  onChange={(file) => {
    field.onChange(file || null);
    form.trigger("imageUrl");
  }}
/>
```

### 4. Brand Form

**File**: `src/components/features/catalog/brand-form-sheet.tsx`

**Changes**:
- Set `logoUrl` thành `null` thay vì `undefined` khi xóa
- Cải thiện logic `value` prop để ưu tiên `logoFile` state
- Tách `previewUrl` riêng

**Code**:
```typescript
const handleLogoChange = async (file: File | null) => {
  // ...
  if (!file) {
    form.setValue("logoUrl", null); // ✅ null để ImageUpload biết đã xóa
  }
};

<ImageUpload
  value={
    logoFile !== undefined
      ? logoFile  // Ưu tiên logoFile state
      : form.watch("logoUrl") || brandData?.logoUrl || null
  }
  previewUrl={
    logoFile === undefined &&
    !form.watch("logoUrl") &&
    brandData?.logoUrl
      ? brandData.logoUrl
      : null
  }
/>
```

### 5. Profile Page

**File**: `src/app/admin/profile/page.tsx`

**Changes**:
- Tương tự User form
- Chỉ dùng `previewUrl` khi `formAvatarFile === undefined`

**Code**:
```typescript
<ImageUpload
  value={formAvatarFile}
  previewUrl={
    formAvatarFile === undefined && displayUser?.avatarUrl
      ? displayUser.avatarUrl
      : null
  }
  onChange={(file) => {
    setFormAvatarFile(file);
    editForm.setValue("avatarUrl", file || null);
  }}
/>
```

---

## 🔄 Flow hoạt động

### Khi user click nút X:

1. `handleRemove` được gọi trong ImageUpload
2. Clear `filePreview` state
3. Clear file input value
4. Gọi `onChange(null)`
5. Form set `field.value = null`
6. ImageUpload nhận `value = null`
7. `effectivePreview` trả về `null` (không dùng `previewUrl`)
8. Ảnh biến mất khỏi UI ngay lập tức

### Khi user Save form:

1. Form submit với `avatarUrl/imageUrl = null`
2. Backend nhận `null` và xóa ảnh
3. Old image được mark for deletion (soft delete)

---

## ✅ Verification

Sau khi fix, test:

1. **User Form**:
   - [ ] Click X → Ảnh biến mất ngay
   - [ ] Save → Ảnh bị xóa (mark for deletion)

2. **Brand Form**:
   - [ ] Click X → Logo biến mất ngay
   - [ ] Save → Logo bị xóa (mark for deletion)

3. **Category Form**:
   - [ ] Click X → Ảnh biến mất ngay
   - [ ] Save → Ảnh bị xóa (mark for deletion)

4. **Profile Page**:
   - [ ] Click X → Avatar biến mất ngay
   - [ ] Save → Avatar bị xóa (mark for deletion)

---

## 📝 Files Modified

1. ✅ `src/components/shared/image-upload.tsx` - Core logic fix
2. ✅ `src/components/features/user/user-form-sheet.tsx` - PreviewUrl logic
3. ✅ `src/components/features/catalog/category-form-sheet.tsx` - PreviewUrl logic
4. ✅ `src/components/features/catalog/brand-form-sheet.tsx` - Value & PreviewUrl logic
5. ✅ `src/app/admin/profile/page.tsx` - PreviewUrl logic

---

**Last Updated**: 2024-11-29  
**Status**: ✅ Fixed

