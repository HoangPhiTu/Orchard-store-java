# Image Management Implementation Status

## Overview

Tài liệu này track progress triển khai Image Management Strategy cho admin dashboard.

**Reference**: [IMAGE_MANAGEMENT_STRATEGY.md](./IMAGE_MANAGEMENT_STRATEGY.md)

---

## Implementation Status

### ✅ Phase 1: Core Utilities (Completed)

#### 1. Image Utilities (`src/lib/image/image-utils.ts`)

- ✅ Date partitioning helper (`getImageFolder`)
- ✅ URL parsing utilities
- ✅ Filename generation với UUID
- ✅ URL validation

#### 2. Image Deletion Service (`src/services/image-deletion.service.ts`)

- ✅ Soft delete service
- ✅ Mark for deletion API
- ✅ Batch mark for deletion

#### 3. Image Management Hook (`src/hooks/use-image-management.ts`)

- ✅ Reusable hook cho tất cả entities
- ✅ Upload với date partitioning
- ✅ Soft delete integration
- ✅ Error handling và cleanup

### ✅ Phase 2: User Management (Completed)

#### Refactored Files

- ✅ `src/components/features/user/user-form-sheet.tsx`
  - Sử dụng `useImageManagement("users")` hook
  - Soft delete thay vì hard delete
  - Date partitioning tự động

#### Changes

- ✅ Removed direct `uploadService` calls
- ✅ Removed hard delete logic
- ✅ Added soft delete (mark for deletion)
- ✅ Improved error handling

### ✅ Phase 3: Brand Management (Completed)

#### Refactored Files

- ✅ `src/components/features/catalog/brand-form-sheet.tsx`
  - Sử dụng `useImageManagement("brands")` hook
  - Soft delete thay vì hard delete
  - Date partitioning tự động

#### Changes

- ✅ Removed direct `uploadService.uploadImage(file, "brands")` calls
- ✅ Added `useImageManagement("brands")` hook
- ✅ Added soft delete in `onSuccess` handler
- ✅ Updated ImageUpload folder prop to use date partitioning

### ✅ Phase 4: Category Management (Completed)

#### Refactored Files

- ✅ `src/components/features/catalog/category-form-sheet.tsx`
  - Sử dụng `useImageManagement("categories")` hook
  - Soft delete thay vì hard delete
  - Date partitioning tự động
  - **Removed slug-based folder hierarchy**

#### Changes

- ✅ Removed `resolveUploadFolder()` function (slug-based)
- ✅ Removed direct `uploadService` calls
- ✅ Added `useImageManagement("categories")` hook
- ✅ Added soft delete in `onSuccess` handler
- ✅ Updated ImageUpload folder prop to use date partitioning

### ✅ Phase 5: Profile Page (Completed)

#### Refactored Files

- ✅ `src/app/admin/profile/page.tsx`
  - Sử dụng `useImageManagement("users")` hook
  - Soft delete thay vì hard delete
  - Date partitioning tự động

#### Changes

- ✅ Removed direct `uploadService` calls
- ✅ Added `useImageManagement("users")` hook
- ✅ Replaced hard delete với soft delete
- ✅ Updated ImageUpload folder prop

---

## Backend Requirements

### ⏳ Required Endpoints (Pending)

#### 1. Mark Image for Deletion

```
POST /api/admin/upload/mark-for-deletion
Request: {
  imageUrl: string;
  entityType: string;
  entityId?: number;
  reason: "replaced" | "removed" | "entity_deleted" | "orphaned";
}
Response: {
  id: number;
  imageUrl: string;
  markedAt: string;
}
```

#### 2. Batch Mark for Deletion

```
POST /api/admin/upload/mark-for-deletion/batch
Request: {
  images: MarkImageForDeletionRequest[];
}
Response: MarkImageForDeletionResponse[]
```

### ⏳ Database Schema (Pending)

```sql
CREATE TABLE image_deletion_queue (
  id BIGSERIAL PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  entity_type VARCHAR(50),
  entity_id BIGINT,
  reason VARCHAR(100),
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending'
);

CREATE INDEX idx_image_deletion_marked_at ON image_deletion_queue(marked_at);
CREATE INDEX idx_image_deletion_status ON image_deletion_queue(status);
```

### ⏳ Cleanup Job (Pending)

Scheduled job để cleanup marked images:

- Chạy mỗi đêm (2h AM)
- Quét images marked > 24 hours
- Verify DB không còn reference
- Delete từ MinIO
- Update status trong queue

---

## Migration Checklist

### Frontend

- [x] Create image utilities
- [x] Create image deletion service
- [x] Create image management hook
- [x] Refactor User Management
- [x] Refactor Brand Management
- [x] Refactor Category Management
- [x] Refactor Profile Page
- [ ] Update ImageUpload component (nếu cần)
- [ ] Add fallback image strategy (async processing)

### Backend

- [x] Create image_deletion_queue table
- [x] Implement mark-for-deletion endpoint
- [x] Implement batch mark-for-deletion endpoint
- [ ] Update upload endpoint để support date partitioning (hiện tại nhận folder từ frontend - OK)
- [x] Create cleanup scheduled job
- [ ] Add image verification (stat object) khi save URL (optional)
- [ ] Add MinIO event webhook handler (optional, advanced)

### Testing

- [ ] Test User Management image upload/delete
- [ ] Test Brand Management image upload/delete
- [ ] Test Category Management image upload/delete
- [ ] Test Profile Page image upload/delete
- [ ] Test soft delete flow
- [ ] Test cleanup job
- [ ] Test error handling và cleanup
- [ ] Verify date partitioning folder structure

**Testing Guide**: [IMAGE_MANAGEMENT_TESTING_GUIDE.md](./IMAGE_MANAGEMENT_TESTING_GUIDE.md)

---

## Next Steps

1. ✅ **Backend**: Implement deletion queue table và endpoints - **COMPLETED**
2. ✅ **Backend**: Implement cleanup job - **COMPLETED**
3. ✅ **Database**: Migration V10 executed - **COMPLETED**
4. ⏳ **Testing**: Test toàn bộ flow (User, Brand, Category, Profile) - **READY**
5. ⏳ **Frontend**: Add fallback image strategy cho async processing (optional)
6. ⏳ **Backend**: Add image verification (stat object) khi save URL (optional)

**Testing**: Follow [IMAGE_MANAGEMENT_TESTING_GUIDE.md](./IMAGE_MANAGEMENT_TESTING_GUIDE.md)

---

## Notes

- Tất cả code đã được viết để reusable cho Brand và Category
- Chỉ cần thay entity type là có thể dùng ngay
- Backend cần implement deletion queue trước khi deploy production
- Cleanup job có thể chạy sau khi có đủ data để test

---

**Last Updated**: 2024-11-29  
**Status**: ✅ Frontend & Backend Core Implementation Completed
