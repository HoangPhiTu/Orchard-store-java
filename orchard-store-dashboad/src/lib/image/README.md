# Image Management Utilities

Reusable utilities và hooks cho quản lý hình ảnh trong admin dashboard.

## Overview

Các utilities này implement best practices từ `IMAGE_MANAGEMENT_STRATEGY.md`:
- ✅ Date partitioning cho folder structure
- ✅ Soft delete strategy (mark for deletion)
- ✅ Reusable hooks cho tất cả entities
- ✅ Error handling và cleanup

## Files

- `image-utils.ts` - Utility functions (folder generation, URL parsing, etc.)
- `../hooks/use-image-management.ts` - React hook cho image management
- `../../services/image-deletion.service.ts` - Service cho soft delete

## Usage

### 1. Use Image Management Hook

```typescript
import { useImageManagement } from "@/hooks/use-image-management";

function MyForm() {
  // Initialize hook với entity type
  const imageManagement = useImageManagement("users"); // or "brands", "categories", etc.
  
  // Upload image
  const handleUpload = async (file: File) => {
    const imageUrl = await imageManagement.uploadImage(file);
    // Image sẽ được upload vào: users/2024/11/29/uuid.jpg
  };
  
  // Mark for deletion (soft delete)
  await imageManagement.markImageForDeletion(oldImageUrl, {
    entityId: userId,
    reason: "replaced",
  });
  
  // Handle image update (upload + mark old for deletion)
  const finalUrl = await imageManagement.handleImageUpdate(
    newImageFile,
    previousImageUrl,
    entityId
  );
}
```

### 2. Folder Structure

Images sẽ được lưu với date partitioning:
```
users/2024/11/29/uuid.jpg
brands/2024/11/29/uuid.png
categories/2024/11/29/uuid.jpg
```

### 3. Soft Delete

Thay vì xóa ngay (hard delete), images được mark for deletion:
- Image được mark trong deletion queue
- Cleanup job sẽ xóa sau khi verify DB transaction thành công
- Đảm bảo data consistency

## Migration Guide

### For User Management (✅ Completed)

Đã refactor `user-form-sheet.tsx` để sử dụng `useImageManagement` hook.

### For Brand Management (Next)

1. Import hook:
```typescript
import { useImageManagement } from "@/hooks/use-image-management";
```

2. Initialize:
```typescript
const imageManagement = useImageManagement("brands");
```

3. Replace upload logic:
```typescript
// Before
const imageUrl = await uploadService.uploadImage(file, "brands");

// After
const imageUrl = await imageManagement.uploadImage(file);
```

4. Replace delete logic:
```typescript
// Before
await uploadService.deleteImage(oldImageUrl);

// After
await imageManagement.markImageForDeletion(oldImageUrl, {
  entityId: brandId,
  reason: "replaced",
});
```

### For Category Management (Next)

Tương tự Brand Management, chỉ cần thay `"brands"` → `"categories"`.

## API Endpoints Required

Backend cần implement các endpoints sau:

### 1. Mark Image for Deletion
```
POST /api/admin/upload/mark-for-deletion
Body: {
  imageUrl: string;
  entityType: string;
  entityId?: number;
  reason: "replaced" | "removed" | "entity_deleted" | "orphaned";
}
```

### 2. Batch Mark for Deletion
```
POST /api/admin/upload/mark-for-deletion/batch
Body: {
  images: MarkImageForDeletionRequest[];
}
```

## Database Schema Required

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

## Cleanup Job (Backend)

Backend cần implement scheduled job để cleanup marked images:

```java
@Scheduled(cron = "0 0 2 * * ?") // Chạy mỗi đêm 2h
public void cleanupMarkedImages() {
    // Get images marked > 24 hours ago
    // Verify DB không còn reference
    // Delete from MinIO
    // Update status in queue
}
```

## Benefits

1. **Consistency**: Tất cả entities dùng cùng pattern
2. **Maintainability**: Code tập trung, dễ maintain
3. **Best Practices**: Implement đúng strategy từ documentation
4. **Scalability**: Date partitioning, soft delete support scale
5. **Data Safety**: Soft delete đảm bảo không mất data khi transaction fail

