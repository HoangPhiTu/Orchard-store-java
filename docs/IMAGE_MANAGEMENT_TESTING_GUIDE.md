# Image Management Testing Guide

**Date**: 2024-11-29  
**Purpose**: Comprehensive testing guide cho Image Management System

---

## 🎯 Testing Overview

Test toàn bộ flow của Image Management System bao gồm:
- Upload images với date partitioning
- Soft delete (mark for deletion)
- Cleanup job
- Error handling
- Folder structure verification

---

## ✅ Pre-Testing Checklist

Trước khi test, đảm bảo:

- [ ] Backend đã start và migration V10 đã chạy
- [ ] Bảng `image_deletion_queue` tồn tại trong database
- [ ] MinIO đang chạy và accessible
- [ ] Frontend đã build và chạy
- [ ] User đã login với quyền ADMIN hoặc STAFF

---

## 📋 Test Cases

### 1. User Management - Image Upload

**Test Case 1.1: Upload Avatar mới**

1. Vào **Admin Dashboard** → **Users** → **Add New User**
2. Click **Upload Avatar**
3. Chọn file ảnh (JPG/PNG, < 5MB)
4. Verify:
   - [ ] Preview hiển thị đúng
   - [ ] Folder path: `users/2024/11/29/` (date partitioning)
   - [ ] Filename: UUID format (không phải tên gốc)
5. Click **Save**
6. Verify:
   - [ ] User được tạo thành công
   - [ ] Avatar hiển thị đúng trong user list
   - [ ] Image URL trong database đúng format

**Expected Result:**
- ✅ Image upload thành công
- ✅ Folder structure: `users/YYYY/MM/DD/uuid.jpg`
- ✅ Filename là UUID, không phải tên gốc

---

**Test Case 1.2: Update Avatar (Replace)**

1. Vào **Users** → Chọn user có avatar
2. Click **Edit**
3. Upload avatar mới
4. Click **Save**
5. Verify:
   - [ ] Avatar mới hiển thị
   - [ ] Avatar cũ được mark for deletion trong `image_deletion_queue`
   - [ ] Status = `PENDING` trong queue

**Expected Result:**
- ✅ Avatar mới upload thành công
- ✅ Avatar cũ được mark for deletion (soft delete)
- ✅ Record trong `image_deletion_queue` với reason = `REPLACED`

**Verify trong Database:**
```sql
SELECT * FROM image_deletion_queue 
WHERE entity_type = 'users' 
AND reason = 'REPLACED'
ORDER BY marked_at DESC
LIMIT 1;
```

---

**Test Case 1.3: Remove Avatar**

1. Vào **Users** → Chọn user có avatar
2. Click **Edit**
3. Click **Remove Avatar** (X button)
4. Click **Save**
5. Verify:
   - [ ] Avatar bị xóa khỏi form
   - [ ] Avatar cũ được mark for deletion
   - [ ] Status = `PENDING` trong queue

**Expected Result:**
- ✅ Avatar được remove
- ✅ Record trong queue với reason = `REMOVED`

---

### 2. Brand Management - Logo Upload

**Test Case 2.1: Upload Logo mới**

1. Vào **Brands** → **Add New Brand**
2. Upload logo
3. Verify:
   - [ ] Folder path: `brands/2024/11/29/`
   - [ ] Filename: UUID format
4. Click **Save**

**Expected Result:**
- ✅ Logo upload vào `brands/YYYY/MM/DD/uuid.jpg`

---

**Test Case 2.2: Update Logo**

1. Edit brand có logo
2. Upload logo mới
3. Verify:
   - [ ] Logo cũ được mark for deletion
   - [ ] Reason = `REPLACED`

---

### 3. Category Management - Image Upload

**Test Case 3.1: Upload Image mới**

1. Vào **Categories** → **Add New Category**
2. Upload image
3. Verify:
   - [ ] Folder path: `categories/2024/11/29/` (KHÔNG phải `categories/slug/`)
   - [ ] Filename: UUID format
4. Click **Save**

**Expected Result:**
- ✅ Image upload vào flat structure với date partitioning
- ✅ KHÔNG có slug-based hierarchy

---

**Test Case 3.2: Update Image**

1. Edit category có image
2. Upload image mới
3. Verify:
   - [ ] Image cũ được mark for deletion
   - [ ] Folder structure vẫn flat (không có slug)

---

### 4. Profile Page - Avatar Update

**Test Case 4.1: Update Profile Avatar**

1. Vào **Profile** (top right menu)
2. Click **Edit Profile**
3. Upload avatar mới
4. Click **Save**
5. Verify:
   - [ ] Avatar mới hiển thị
   - [ ] Avatar cũ được mark for deletion

---

### 5. Soft Delete Flow

**Test Case 5.1: Verify Mark for Deletion**

1. Upload image mới cho bất kỳ entity nào
2. Update image (replace)
3. Check database:

```sql
SELECT 
    id,
    image_url,
    entity_type,
    entity_id,
    reason,
    status,
    marked_at
FROM image_deletion_queue
WHERE status = 'PENDING'
ORDER BY marked_at DESC;
```

**Expected Result:**
- ✅ Record tồn tại với status = `PENDING`
- ✅ `marked_at` = thời điểm hiện tại
- ✅ `reason` = `REPLACED` hoặc `REMOVED`

---

**Test Case 5.2: Verify Cleanup Job**

1. Tạo record trong queue với `marked_at` = 24+ hours ago (test data)
2. Đợi cleanup job chạy (hoặc trigger manual)
3. Check database:

```sql
SELECT * FROM image_deletion_queue
WHERE status = 'COMPLETED'
ORDER BY deleted_at DESC
LIMIT 5;
```

**Expected Result:**
- ✅ Status = `COMPLETED`
- ✅ `deleted_at` được set
- ✅ Image đã bị xóa khỏi MinIO

**Manual Trigger (nếu cần):**
```java
// Trong backend, có thể trigger manual:
@Autowired
private ImageDeletionCleanupJob cleanupJob;

// Trigger
cleanupJob.cleanupPendingDeletions();
```

---

### 6. Error Handling

**Test Case 6.1: Upload File quá lớn**

1. Chọn file > 5MB
2. Verify:
   - [ ] Error message hiển thị
   - [ ] Upload bị reject
   - [ ] Form không submit

**Expected Result:**
- ✅ Validation error: "Kích thước file không được vượt quá 5MB"

---

**Test Case 6.2: Upload File không phải image**

1. Chọn file không phải image (PDF, DOC, etc.)
2. Verify:
   - [ ] Error message hiển thị
   - [ ] Upload bị reject

**Expected Result:**
- ✅ Validation error: "File phải là ảnh (image/*)"

---

**Test Case 6.3: Upload Failed - Network Error**

1. Disconnect network
2. Upload image
3. Verify:
   - [ ] Error message hiển thị
   - [ ] Form không submit
   - [ ] No orphaned images trong MinIO

**Expected Result:**
- ✅ Error handling graceful
- ✅ No orphaned files

---

### 7. Folder Structure Verification

**Test Case 7.1: Verify Date Partitioning**

1. Upload images cho Users, Brands, Categories
2. Check MinIO/S3 structure:

```
users/2024/11/29/uuid1.jpg
users/2024/11/29/uuid2.jpg
brands/2024/11/29/uuid3.jpg
categories/2024/11/29/uuid4.jpg
```

**Expected Result:**
- ✅ Tất cả images trong folder với date partitioning
- ✅ KHÔNG có slug-based folders cho categories
- ✅ Filenames là UUID, không phải tên gốc

---

**Test Case 7.2: Verify Folder Names**

1. Check tất cả folders trong MinIO
2. Verify:
   - [ ] `users/` (số nhiều, viết thường)
   - [ ] `brands/` (số nhiều, viết thường)
   - [ ] `categories/` (số nhiều, viết thường)
   - [ ] KHÔNG có `user/`, `User/`, `avatars/`

**Expected Result:**
- ✅ Tất cả folder names đúng chuẩn

---

### 8. API Endpoints Testing

**Test Case 8.1: Mark for Deletion API**

```bash
POST /api/admin/upload/mark-for-deletion
Authorization: Bearer {token}
Content-Type: application/json

{
  "imageUrl": "http://127.0.0.1:9000/orchard-bucket/users/2024/11/29/uuid.jpg",
  "entityType": "users",
  "entityId": 123,
  "reason": "REPLACED"
}
```

**Expected Response:**
```json
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

---

**Test Case 8.2: Batch Mark for Deletion API**

```bash
POST /api/admin/upload/mark-for-deletion/batch
Authorization: Bearer {token}
Content-Type: application/json

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
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã đánh dấu 2 ảnh để xóa",
  "data": [...]
}
```

---

## 🔍 Verification Queries

### Check Queue Status

```sql
-- Pending deletions
SELECT COUNT(*) as pending_count
FROM image_deletion_queue
WHERE status = 'PENDING';

-- Completed deletions (last 24h)
SELECT COUNT(*) as completed_count
FROM image_deletion_queue
WHERE status = 'COMPLETED'
AND deleted_at >= NOW() - INTERVAL '24 hours';

-- Failed deletions
SELECT COUNT(*) as failed_count
FROM image_deletion_queue
WHERE status = 'FAILED';
```

### Check Folder Structure

```sql
-- Count images by entity type (from URLs in queue)
SELECT 
    entity_type,
    COUNT(*) as image_count
FROM image_deletion_queue
GROUP BY entity_type;
```

### Check Recent Deletions

```sql
-- Recent deletions by reason
SELECT 
    reason,
    COUNT(*) as count,
    MAX(marked_at) as last_marked
FROM image_deletion_queue
WHERE marked_at >= NOW() - INTERVAL '7 days'
GROUP BY reason
ORDER BY count DESC;
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Images không hiển thị sau upload

**Symptoms**: Upload thành công nhưng image không hiển thị

**Check:**
1. Image URL trong database có đúng không?
2. MinIO có accessible không?
3. CORS config đúng chưa?

**Solution:**
- Check network tab trong browser DevTools
- Verify MinIO endpoint
- Check CORS settings

---

### Issue 2: Cleanup job không chạy

**Symptoms**: Images marked for deletion nhưng không bị xóa

**Check:**
1. Cleanup job có được schedule không?
2. Logs có error không?

**Solution:**
- Check backend logs
- Verify `@Scheduled` annotation
- Check cron expression

---

### Issue 3: Folder structure không đúng

**Symptoms**: Images không nằm trong date partitioning folder

**Check:**
1. Frontend có dùng `useImageManagement` hook không?
2. `getImageFolder()` có trả về đúng format không?

**Solution:**
- Verify hook implementation
- Check date partitioning logic

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________

### User Management
- [ ] Upload avatar: PASS / FAIL
- [ ] Update avatar: PASS / FAIL
- [ ] Remove avatar: PASS / FAIL

### Brand Management
- [ ] Upload logo: PASS / FAIL
- [ ] Update logo: PASS / FAIL

### Category Management
- [ ] Upload image: PASS / FAIL
- [ ] Update image: PASS / FAIL
- [ ] Folder structure: PASS / FAIL

### Soft Delete
- [ ] Mark for deletion: PASS / FAIL
- [ ] Cleanup job: PASS / FAIL

### Error Handling
- [ ] File too large: PASS / FAIL
- [ ] Invalid file type: PASS / FAIL
- [ ] Network error: PASS / FAIL

### API Endpoints
- [ ] Mark for deletion: PASS / FAIL
- [ ] Batch mark: PASS / FAIL

### Folder Structure
- [ ] Date partitioning: PASS / FAIL
- [ ] Folder names: PASS / FAIL
- [ ] Filename format: PASS / FAIL

**Overall Status**: ✅ PASS / ❌ FAIL
**Issues Found**: ___________
```

---

## ✅ Acceptance Criteria

Hệ thống được coi là PASS nếu:

- [ ] Tất cả test cases PASS
- [ ] Folder structure đúng chuẩn (date partitioning, UUID filenames)
- [ ] Soft delete hoạt động đúng
- [ ] Cleanup job chạy và xóa images
- [ ] Error handling graceful
- [ ] API endpoints hoạt động
- [ ] Không có orphaned images
- [ ] Performance acceptable (< 2s cho upload)

---

**Last Updated**: 2024-11-29

