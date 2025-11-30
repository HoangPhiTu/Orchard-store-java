# Backend Image Deletion Implementation

**Date**: 2024-11-29  
**Status**: ✅ Completed

## Overview

Đã implement soft delete strategy cho images trong backend, bao gồm:
- Entity và Repository cho deletion queue
- Service để mark và process deletions
- API endpoints cho frontend
- Scheduled cleanup job
- Database migration

---

## ✅ Files Created

### 1. Entity
- ✅ `ImageDeletionQueue.java`
  - Entity để quản lý queue xóa ảnh
  - Fields: imageUrl, entityType, entityId, reason, status, markedAt, deletedAt
  - Enums: DeletionReason, DeletionStatus

### 2. Repository
- ✅ `ImageDeletionQueueRepository.java`
  - JPA Repository với custom queries
  - Methods: findByImageUrl, findPendingRecordsForCleanup, countByStatus, etc.

### 3. Service
- ✅ `ImageDeletionService.java`
  - `markForDeletion()` - Mark image for deletion
  - `markBatchForDeletion()` - Batch mark
  - `processPendingDeletions()` - Process deletions (called by job)
  - `cleanupOldRecords()` - Archive old records

### 4. Controller
- ✅ `UploadController.java` (updated)
  - `POST /api/admin/upload/mark-for-deletion` - Mark single image
  - `POST /api/admin/upload/mark-for-deletion/batch` - Batch mark

### 5. Scheduler
- ✅ `ImageDeletionCleanupJob.java`
  - `cleanupPendingDeletions()` - Chạy mỗi đêm 2h AM
  - `cleanupOldRecords()` - Chạy mỗi Chủ nhật 3h AM
  - `logPendingCount()` - Log mỗi giờ (monitoring)

### 6. Migration
- ✅ `V10__create_image_deletion_queue.sql`
  - Tạo table `image_deletion_queue`
  - Indexes cho performance

---

## 📋 API Endpoints

### 1. Mark Image for Deletion

```
POST /api/admin/upload/mark-for-deletion
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "imageUrl": "http://127.0.0.1:9000/orchard-bucket/users/2024/11/29/uuid.jpg",
  "entityType": "users",
  "entityId": 123,
  "reason": "REPLACED"
}

Response:
{
  "success": true,
  "message": "Đã đánh dấu ảnh để xóa",
  "data": {
    "id": 1,
    "imageUrl": "http://...",
    "entityType": "users",
    "entityId": 123,
    "reason": "REPLACED",
    "status": "PENDING",
    "markedAt": "2024-11-29T10:00:00"
  }
}
```

### 2. Batch Mark for Deletion

```
POST /api/admin/upload/mark-for-deletion/batch
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "images": [
    {
      "imageUrl": "http://...",
      "entityType": "users",
      "entityId": 123,
      "reason": "REPLACED"
    },
    {
      "imageUrl": "http://...",
      "entityType": "brands",
      "entityId": 456,
      "reason": "REMOVED"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Đã đánh dấu 2 ảnh để xóa",
  "data": [...]
}
```

---

## 🔄 Cleanup Job Flow

### Daily Cleanup (2h AM)

1. Job chạy `cleanupPendingDeletions()`
2. Query records với:
   - Status = PENDING
   - markedAt <= 24 hours ago
3. Với mỗi record:
   - Mark status = PROCESSING
   - Delete từ MinIO
   - Mark status = COMPLETED
   - Set deletedAt = now()
4. Log kết quả

### Weekly Archive (Sunday 3h AM)

1. Job chạy `cleanupOldRecords()`
2. Delete records với:
   - Status = COMPLETED
   - deletedAt <= 30 days ago
3. Archive old queue records

---

## 📊 Database Schema

```sql
CREATE TABLE image_deletion_queue (
    id BIGSERIAL PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    reason VARCHAR(100),
    marked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_image_deletion_marked_at ON image_deletion_queue(marked_at);
CREATE INDEX idx_image_deletion_status ON image_deletion_queue(status);
CREATE INDEX idx_image_deletion_entity ON image_deletion_queue(entity_type, entity_id);
```

---

## 🔍 Deletion Reasons

- `REPLACED` - Ảnh bị thay thế bởi ảnh mới
- `REMOVED` - User xóa ảnh
- `ENTITY_DELETED` - Entity bị xóa
- `ORPHANED` - Ảnh mồ côi (upload nhưng không được lưu vào DB)

---

## 🔍 Deletion Status

- `PENDING` - Chờ xử lý
- `PROCESSING` - Đang xử lý
- `COMPLETED` - Đã xóa thành công
- `FAILED` - Xóa thất bại (có thể retry)

---

## ✅ Benefits

1. **Data Consistency**: Không mất data khi transaction fail
2. **Retry Logic**: Failed records có thể retry
3. **Monitoring**: Log và count pending records
4. **Performance**: Batch processing, indexes
5. **Cleanup**: Tự động archive old records

---

## 🧪 Testing Checklist

- [ ] Test mark-for-deletion endpoint
- [ ] Test batch mark-for-deletion endpoint
- [ ] Test cleanup job (manual trigger)
- [ ] Test duplicate prevention
- [ ] Test failed record retry
- [ ] Test old records archive
- [ ] Verify MinIO deletion
- [ ] Monitor pending count

---

## 📝 Configuration

### Cleanup Schedule

Có thể config trong `application.properties`:

```properties
# Image deletion cleanup (optional, defaults in code)
# app.image-deletion.cleanup-cron=0 0 2 * * ?
# app.image-deletion.archive-cron=0 0 3 * * SUN
```

Hiện tại hardcoded trong `ImageDeletionCleanupJob`:
- Daily cleanup: `0 0 2 * * ?` (2h AM)
- Weekly archive: `0 0 3 * * SUN` (Sunday 3h AM)

---

## 🔗 Integration

### Frontend Integration

Frontend đã implement và sẵn sàng:
- `useImageManagement` hook
- `imageDeletionService` service
- Tất cả entities (User, Brand, Category, Profile) đã dùng soft delete

### Backend Integration

Backend endpoints đã sẵn sàng:
- `/api/admin/upload/mark-for-deletion`
- `/api/admin/upload/mark-for-deletion/batch`

---

**Last Updated**: 2024-11-29  
**Status**: ✅ Backend Implementation Completed

