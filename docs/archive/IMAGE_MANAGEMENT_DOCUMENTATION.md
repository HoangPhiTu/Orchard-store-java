# Image Management - Documentation

**Module:** Image Management (Quản lý Hình ảnh)  
**Version:** 1.0  
**Last Updated:** 2025-12-03

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Database Schema](#database-schema)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [API Documentation](#api-documentation)
6. [Tính Năng Đặc Biệt](#tính-năng-đặc-biệt)
7. [Folder Organization Strategy](#folder-organization-strategy)
8. [Soft Delete Strategy](#soft-delete-strategy)
9. [Code Examples](#code-examples)
10. [Testing Guide](#testing-guide)

---

## 📊 Tổng Quan

Module **Image Management** cung cấp hệ thống quản lý hình ảnh toàn diện cho toàn bộ ứng dụng, bao gồm:

- ✅ Upload hình ảnh lên MinIO (Object Storage)
- ✅ Quản lý folder structure với date partitioning
- ✅ Soft delete strategy (mark for deletion)
- ✅ Cleanup job tự động
- ✅ Image validation và optimization
- ✅ Reusable hooks và components
- ✅ Error handling và retry logic

### Đặc Điểm Nổi Bật

- 📁 **Date Partitioning:** Folder structure theo ngày để dễ quản lý và scale
- 🔒 **Soft Delete:** Mark for deletion thay vì xóa ngay để đảm bảo data consistency
- 🎯 **UUID Naming:** Chỉ dùng UUID cho tên file, không lộ thông tin nghiệp vụ
- 🔄 **Cleanup Job:** Scheduled job tự động xóa images đã được mark
- 🛡️ **Security:** Validation đầy đủ, tránh information leakage

### Tech Stack

**Backend:**

- Spring Boot 3.x
- AWS S3 SDK (MinIO compatible)
- Spring Scheduler
- Flyway (Database Migration)

**Frontend:**

- Next.js 14 (App Router)
- React Hooks
- TypeScript
- FileReader API (preview)

**Storage:**

- MinIO (Object Storage)
- Bucket: `orchard-bucket`

---

## 🗄️ Database Schema

### Bảng `image_deletion_queue`

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
```

### Indexes

```sql
CREATE INDEX idx_image_deletion_marked_at ON image_deletion_queue(marked_at);
CREATE INDEX idx_image_deletion_status ON image_deletion_queue(status);
CREATE INDEX idx_image_deletion_entity ON image_deletion_queue(entity_type, entity_id);
```

### Mô Tả Các Trường

| Trường       | Kiểu         | Mô Tả                                          | Ví Dụ                          |
| ------------ | ------------ | ---------------------------------------------- | ------------------------------ |
| `id`         | BIGSERIAL    | Primary key tự động tăng                       | `1`                            |
| `image_url`  | VARCHAR(500) | URL đầy đủ của ảnh cần xóa                    | `"http://..."`                 |
| `entity_type` | VARCHAR(50) | Loại entity (users, brands, categories, etc.)  | `"users"`                      |
| `entity_id`  | BIGINT       | ID của entity (optional)                       | `123`                          |
| `reason`     | VARCHAR(100) | Lý do xóa (REPLACED, REMOVED, ENTITY_DELETED, ORPHANED) | `"REPLACED"`      |
| `marked_at`  | TIMESTAMP    | Thời điểm mark for deletion                    | `2025-12-03 10:00:00`          |
| `deleted_at` | TIMESTAMP    | Thời điểm xóa vật lý (sau cleanup job)         | `2025-12-04 02:00:00`          |
| `status`     | VARCHAR(20)  | Trạng thái (PENDING, PROCESSING, COMPLETED, FAILED) | `"PENDING"`         |
| `updated_at` | TIMESTAMP    | Thời gian cập nhật                             | `2025-12-03 10:00:00`          |

### Constraints

- **Check Constraint:** `status` chỉ được là `PENDING`, `PROCESSING`, `COMPLETED`, hoặc `FAILED`
- **Check Constraint:** `reason` chỉ được là `REPLACED`, `REMOVED`, `ENTITY_DELETED`, hoặc `ORPHANED`

---

## 🔧 Backend Implementation

### Package Structure

```
com.orchard.orchard_store_backend.modules.catalog.product
├── controller/
│   └── UploadController.java
├── service/
│   ├── ImageUploadService.java
│   └── ImageDeletionService.java
├── repository/
│   └── ImageDeletionQueueRepository.java
├── entity/
│   └── ImageDeletionQueue.java
└── scheduler/
    └── ImageDeletionCleanupJob.java
```

### Entity: `ImageDeletionQueue.java`

```java
@Entity
@Table(name = "image_deletion_queue")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageDeletionQueue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url", length = 500, nullable = false)
    private String imageUrl;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "reason", length = 100)
    @Enumerated(EnumType.STRING)
    private DeletionReason reason;

    @CreationTimestamp
    @Column(name = "marked_at", nullable = false, updatable = false)
    private LocalDateTime markedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "status", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DeletionStatus status = DeletionStatus.PENDING;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum DeletionReason {
        REPLACED,      // Ảnh bị thay thế bởi ảnh mới
        REMOVED,      // User xóa ảnh
        ENTITY_DELETED, // Entity bị xóa
        ORPHANED      // Ảnh mồ côi
    }

    public enum DeletionStatus {
        PENDING,      // Chờ xử lý
        PROCESSING,   // Đang xử lý
        COMPLETED,    // Đã xóa thành công
        FAILED        // Xóa thất bại
    }
}
```

**Đặc điểm:**

- Soft delete strategy: Mark for deletion thay vì xóa ngay
- Tracking: Lưu lại lý do và thời điểm mark
- Status tracking: Theo dõi quá trình xử lý
- Retry support: Failed records có thể retry

### Service: `ImageUploadService.java`

**Các phương thức chính:**

1. **`uploadImage(MultipartFile file, String folderName)`**

   - Validate file (type, size)
   - Generate unique filename (UUID)
   - Upload lên MinIO với ACL PublicRead
   - Trả về URL đầy đủ

2. **`deleteImage(String imageUrl)`**

   - Extract object key từ URL
   - Xóa từ MinIO
   - Log warning nếu không xóa được (không throw exception)

### Service: `ImageDeletionService.java`

**Các phương thức chính:**

1. **`markForDeletion(imageUrl, entityType, entityId, reason)`**

   - Kiểm tra duplicate (tránh mark nhiều lần)
   - Tạo record trong deletion queue
   - Return queue record

2. **`markBatchForDeletion(requests)`**

   - Batch mark nhiều images
   - Xử lý từng request

3. **`processPendingDeletions()`**

   - Query records với status = PENDING và markedAt > 24h
   - Mark status = PROCESSING
   - Delete từ MinIO
   - Mark status = COMPLETED hoặc FAILED

4. **`cleanupOldRecords()`**

   - Xóa records với status = COMPLETED và deletedAt > 30 days
   - Archive old records

### Controller: `UploadController.java`

**Endpoints:**

- `POST /api/admin/upload` - Upload image
- `DELETE /api/admin/upload` - Delete image (hard delete - deprecated)
- `POST /api/admin/upload/mark-for-deletion` - Mark image for deletion (soft delete)
- `POST /api/admin/upload/mark-for-deletion/batch` - Batch mark for deletion

**Security:**

- Tất cả endpoints yêu cầu role `ADMIN` hoặc `STAFF`
- Sử dụng `@PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")`

### Scheduler: `ImageDeletionCleanupJob.java`

**Scheduled Jobs:**

1. **Daily Cleanup (2h AM)**

   ```java
   @Scheduled(cron = "0 0 2 * * ?")
   public void cleanupPendingDeletions() {
       // Process pending deletions older than 24 hours
   }
   ```

2. **Weekly Archive (Sunday 3h AM)**

   ```java
   @Scheduled(cron = "0 0 3 * * SUN")
   public void cleanupOldRecords() {
       // Archive completed records older than 30 days
   }
   ```

3. **Hourly Monitoring**

   ```java
   @Scheduled(cron = "0 0 * * * ?")
   public void logPendingCount() {
       // Log pending count for monitoring
   }
   ```

---

## 🎨 Frontend Implementation

### Package Structure

```
orchard-store-dashboad/src
├── components/
│   └── shared/
│       └── image-upload.tsx
├── hooks/
│   └── use-image-management.ts
├── services/
│   ├── upload.service.ts
│   └── image-deletion.service.ts
└── lib/
    └── image/
        └── image-utils.ts
```

### TypeScript Types

```typescript
export type ImageEntityType = "users" | "brands" | "categories" | "products" | "others";

export interface MarkImageForDeletionRequest {
  imageUrl: string;
  entityType: string;
  entityId?: number;
  reason: "replaced" | "removed" | "entity_deleted" | "orphaned";
}

export interface MarkImageForDeletionResponse {
  id: number;
  imageUrl: string;
  markedAt: string;
}
```

### Utilities: `image-utils.ts`

**Functions:**

1. **`getImageFolder(entityType: ImageEntityType): string`**

   - Generate folder path với date partitioning
   - Format: `{entityType}/YYYY/MM/DD`
   - Ví dụ: `"users/2024/11/29"`

2. **`generateImageFileName(originalFileName: string): string`**

   - Generate unique filename với UUID
   - Format: `{uuid}.{extension}`
   - Ví dụ: `"550e8400-e29b-41d4-a716-446655440000.jpg"`

3. **`extractObjectKey(imageUrl: string): string | null`**

   - Extract object key từ full URL
   - Ví dụ: `"users/2024/11/29/uuid.jpg"`

4. **`extractEntityTypeFromUrl(imageUrl: string): ImageEntityType | null`**

   - Extract entity type từ URL
   - Ví dụ: `"users"`

### Hook: `use-image-management.ts`

**Functions:**

1. **`uploadImage(file: File): Promise<string>`**

   - Upload image với date partitioning tự động
   - Return image URL

2. **`markImageForDeletion(imageUrl, options): Promise<void>`**

   - Mark image for deletion (soft delete)
   - Non-blocking (không throw error)

3. **`handleImageUpdate(newImageUrl, previousImageUrl, entityId): Promise<string | null>`**

   - Handle image update với soft delete tự động
   - Upload new image nếu là File
   - Mark old image for deletion nếu có thay đổi

4. **`cleanupImage(imageUrl): Promise<void>`**

   - Cleanup orphaned image
   - Mark for deletion với reason = "orphaned"

**Usage Example:**

```typescript
const imageManagement = useImageManagement("users");

// Upload new image
const imageUrl = await imageManagement.uploadImage(file);

// Handle update (upload new + mark old for deletion)
const finalUrl = await imageManagement.handleImageUpdate(
  newFile,
  previousImageUrl,
  userId
);
```

### Service: `upload.service.ts`

```typescript
export const uploadService = {
  uploadImage: async (file: File, folder: string): Promise<string> => {
    // Validate file
    // Create FormData
    // Call API
    // Return URL
  },
};
```

### Service: `image-deletion.service.ts`

```typescript
export async function markImageForDeletion(
  request: MarkImageForDeletionRequest
): Promise<MarkImageForDeletionResponse> {
  // Call API to mark for deletion
}

export async function markImagesForDeletion(
  requests: MarkImageForDeletionRequest[]
): Promise<MarkImageForDeletionResponse[]> {
  // Batch mark for deletion
}
```

### Component: `image-upload.tsx`

**Props:**

```typescript
interface ImageUploadProps {
  value?: File | string | null; // File mới hoặc URL cũ
  previewUrl?: string | null; // URL ảnh cũ từ DB
  onChange: (value: File | null) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "circle" | "rectangle";
  folder?: string;
  className?: string;
  cacheKey?: string | number;
}
```

**Features:**

- Preview real-time với FileReader (data URL)
- Variant: `circle` (avatar) hoặc `rectangle` (logo/banner)
- Delete button để xóa ảnh
- Error handling với toast
- Client-first upload flow (chỉ upload khi submit form)

---

## 📡 API Documentation

### Base URL

```
/api/admin/upload
```

### 1. POST /api/admin/upload

Upload hình ảnh lên MinIO.

**Request:**

```http
POST /api/admin/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [MultipartFile]
folder: users (optional, default: "others")
```

**Request Parameters:**

| Parameter | Type         | Required | Description                    |
| --------- | ------------ | -------- | ------------------------------ |
| `file`    | MultipartFile | ✅ Yes  | File ảnh cần upload            |
| `folder`  | String       | ❌ No    | Tên folder (default: "others") |

**Response:**

```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": "http://127.0.0.1:9000/orchard-bucket/users/2024/11/29/uuid.jpg"
}
```

**Status Codes:**

- `200 OK` - Upload thành công
- `400 Bad Request` - Validation error (file empty, invalid type, too large)
- `500 Internal Server Error` - Upload failed

**Validation Rules:**

- File type: Chỉ chấp nhận `image/*` (jpg, png, webp, etc.)
- File size: Tối đa 5MB (configurable)

### 2. DELETE /api/admin/upload

Xóa hình ảnh khỏi MinIO (hard delete - deprecated, dùng mark-for-deletion thay thế).

**Request:**

```http
DELETE /api/admin/upload?imageUrl={full_url}
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "Đã xử lý yêu cầu xóa ảnh",
  "data": null
}
```

> **Note:** Endpoint này "fire-and-forget" - luôn trả 200 để tránh chặn luồng chính.

### 3. POST /api/admin/upload/mark-for-deletion

Mark image for deletion (soft delete).

**Request:**

```http
POST /api/admin/upload/mark-for-deletion
Authorization: Bearer {token}
Content-Type: application/json

{
  "imageUrl": "http://127.0.0.1:9000/orchard-bucket/users/2024/11/29/uuid.jpg",
  "entityType": "users",
  "entityId": 123,
  "reason": "replaced"
}
```

**Request Body:**

| Field       | Type   | Required | Description                                    |
| ----------- | ------ | -------- | ---------------------------------------------- |
| `imageUrl`  | String | ✅ Yes   | URL đầy đủ của ảnh                             |
| `entityType` | String | ✅ Yes   | Loại entity (users, brands, categories, etc.) |
| `entityId`  | Number | ❌ No    | ID của entity                                  |
| `reason`    | String | ✅ Yes   | Lý do xóa (replaced, removed, entity_deleted, orphaned) |

**Response:**

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
    "markedAt": "2025-12-03T10:00:00"
  }
}
```

**Status Codes:**

- `200 OK` - Mark thành công
- `400 Bad Request` - Validation error
- `409 Conflict` - Image đã được mark (duplicate prevention)

### 4. POST /api/admin/upload/mark-for-deletion/batch

Batch mark multiple images for deletion.

**Request:**

```http
POST /api/admin/upload/mark-for-deletion/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "images": [
    {
      "imageUrl": "http://...",
      "entityType": "users",
      "entityId": 123,
      "reason": "replaced"
    },
    {
      "imageUrl": "http://...",
      "entityType": "brands",
      "entityId": 456,
      "reason": "removed"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đã đánh dấu 2 ảnh để xóa",
  "data": [
    {
      "id": 1,
      "imageUrl": "http://...",
      "markedAt": "2025-12-03T10:00:00"
    },
    {
      "id": 2,
      "imageUrl": "http://...",
      "markedAt": "2025-12-03T10:00:00"
    }
  ]
}
```

---

## ⚡ Tính Năng Đặc Biệt

### 1. Date Partitioning

**Cấu trúc folder:**

```
{entityType}/YYYY/MM/DD/{uuid}.{ext}
```

**Ví dụ:**

- `users/2024/11/29/550e8400-e29b-41d4-a716-446655440000.jpg`
- `brands/2024/12/01/a1b2c3d4-e5f6-7890-abcd-ef1234567890.png`

**Lợi ích:**

- ✅ Dễ quản lý: Mỗi folder chỉ có ~100-1000 files
- ✅ Dễ backup: Backup theo ngày/tháng
- ✅ Dễ cleanup: Xóa folder cũ theo lifecycle policy
- ✅ Performance tốt: List objects nhanh hơn
- ✅ Immutable: Không phụ thuộc vào dữ liệu có thể thay đổi (slug, name)

**Implementation:**

```typescript
export function getImageFolder(entityType: ImageEntityType): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${entityType}/${year}/${month}/${day}`;
}
```

### 2. UUID Naming

**Quy tắc:**

- ✅ **CHỈ DÙNG UUID:** `{uuid}.{extension}`
- ❌ **KHÔNG DÙNG:** `{entity-type}-{id}-{uuid}.{extension}`

**Ví dụ:**

- ✅ `550e8400-e29b-41d4-a716-446655440000.jpg`
- ❌ `user-123-550e8400-e29b-41d4-a716-446655440000.jpg`

**Lý do:**

- ✅ Bảo mật: Không lộ thông tin nghiệp vụ (user ID, category ID)
- ✅ Tránh Enumeration Attack
- ✅ Tên file ngắn gọn
- ✅ Metadata lưu trong Object Tags/Metadata (không phải tên file)

### 3. Soft Delete Strategy

**Flow:**

```
1. User upload ảnh mới ✅
2. Update DB với URL mới ✅
3. Mark ảnh cũ for deletion (AFTER DB success) ✅
4. Cleanup job xóa ảnh cũ sau 24h ✅
```

**Lợi ích:**

- ✅ Data consistency: Không mất data khi transaction fail
- ✅ Recoverable: Có thể khôi phục nếu cần
- ✅ Audit trail: Biết được lý do xóa
- ✅ Batch processing: Xóa hàng loạt hiệu quả

### 4. Cleanup Job

**Daily Cleanup (2h AM):**

- Query records với status = PENDING và markedAt > 24h
- Verify DB không còn reference
- Delete từ MinIO
- Update status = COMPLETED

**Weekly Archive (Sunday 3h AM):**

- Xóa records với status = COMPLETED và deletedAt > 30 days
- Archive old queue records

---

## 📁 Folder Organization Strategy

### ⚠️ CRITICAL: Không dùng Mutable Data trong Folder Path

**Vấn đề với Object Storage (S3/MinIO):**

- Object Storage **KHÔNG PHẢI** File System
- **Không có lệnh Rename Folder** - phải Copy + Delete
- Nếu slug thay đổi: `nuoc-hoa` → `nuoc-hoa-nam`
  - Phải copy 10,000 ảnh sang folder mới
  - Xóa folder cũ
  - **Rủi ro**: Timeout, treo hệ thống, gãy link (404)

**Giải pháp:** **TUYỆT ĐỐI KHÔNG** dùng dữ liệu có thể thay đổi (slug, name) trong folder path.

### ✅ Flat Structure với Date Partitioning (Khuyến nghị)

**Cấu trúc:**

```
bucket/
├── users/           # Avatar của users
│   ├── 2024/
│   │   ├── 11/
│   │   │   └── 29/
│   │   │       └── uuid.jpg
│   │   └── 12/
│   │       └── 01/
│   │           └── uuid.jpg
├── brands/          # Logo của brands
│   └── 2024/11/29/
├── categories/      # Hình ảnh categories
│   └── 2024/11/29/
└── products/        # Hình ảnh sản phẩm
    └── 2024/11/29/
```

**Lý do:**

- ✅ Không phụ thuộc vào dữ liệu có thể thay đổi
- ✅ Không cần rename khi slug/name thay đổi
- ✅ Phân loại ảnh thuộc entity nào là việc của **Database**, không phải Folder
- ✅ Dễ quản lý và scale
- ✅ Date partitioning để tránh ops nightmare (100k files trong 1 folder)

### ❌ KHÔNG dùng: Hierarchical với Slug

```
❌ categories/{parent-slug}/     # Rủi ro khi slug thay đổi
❌ categories/{parent-id}/        # Có thể dùng nhưng không cần thiết
❌ users/{user-id}/               # Rủi ro information leakage
```

### Folder Mapping

| Entity     | Folder Pattern                    | Example                                    | Lý do                                        |
| ---------- | -------------------------------- | ------------------------------------------ | -------------------------------------------- |
| Users      | `users/YYYY/MM/DD`                | `users/2024/11/29/uuid.jpg`                | Date partitioning, đơn giản                  |
| Brands     | `brands/YYYY/MM/DD`               | `brands/2024/11/29/uuid.png`               | Date partitioning, đơn giản                  |
| Categories | `categories/YYYY/MM/DD`           | `categories/2024/11/29/uuid.jpg`            | **KHÔNG phân cấp** - dùng DB để track parent |
| Products   | `products/YYYY/MM/DD`              | `products/2024/11/29/uuid.jpg`              | Date partitioning, đơn giản                  |
| Others     | `others/YYYY/MM/DD`               | `others/2024/11/29/uuid.jpg`               | Date partitioning, đơn giản                  |

---

## 🗑️ Soft Delete Strategy

### ⚠️ CRITICAL: Data Consistency & Transaction Failure

**Vấn đề với Hard Delete ngay lập tức:**

```
1. Upload ảnh mới (New) ✅
2. Xóa ảnh cũ (Old) ✅
3. Lưu DB thất bại (DB sập, lỗi mạng...) ❌
```

**Hậu quả:**

- ❌ DB vẫn lưu URL cũ (đã bị xóa) → 404 khi load
- ❌ File mới thành file rác (Orphan) - không có entity reference
- ❌ User mất cả avatar cũ và avatar mới

**Giải pháp:** **Soft Delete + Cleanup Job** - Chỉ xóa sau khi DB commit thành công

### ✅ Recommended: Soft Delete Strategy

#### 1. Mark for Deletion (Không xóa ngay)

```typescript
// ✅ Good - Soft delete
const updateMutation = useAppMutation({
  mutationFn: async ({ id, data }) => {
    const previousImageUrl = entity?.imageUrl;
    let imageUrl: string | null = null;

    if (data.imageUrl instanceof File) {
      imageUrl = await uploadService.uploadImage(data.imageUrl, folder);
    } else if (data.imageUrl === null) {
      imageUrl = null;
    } else {
      imageUrl = data.imageUrl;
    }

    // Update DB FIRST (transaction)
    const updated = await service.update(id, { ...data, imageUrl });

    // Mark old image for deletion (AFTER DB success)
    if (previousImageUrl && imageUrl !== previousImageUrl) {
      await markImageForDeletion(previousImageUrl, {
        entityType: "user",
        entityId: id,
        reason: "replaced",
      });
    }

    return updated;
  },
});
```

#### 2. Cleanup Job (Scheduled)

```typescript
// Scheduled job (chạy mỗi đêm 2h AM)
async function cleanupMarkedImages() {
  // Get all images marked for deletion (older than 24 hours)
  const markedImages = await getMarkedForDeletionImages({
    olderThan: 24 * 60 * 60 * 1000, // 24 hours
  });

  for (const image of markedImages) {
    try {
      // Verify DB transaction committed
      const entity = await getEntityByImageUrl(image.url);
      if (!entity || entity.imageUrl !== image.url) {
        // Safe to delete - DB doesn't reference it anymore
        await uploadService.deleteImage(image.url);
        await removeDeletionMark(image.id);
      } else {
        // Still referenced - keep it
        await removeDeletionMark(image.id);
      }
    } catch (error) {
      logger.error(`Failed to cleanup image: ${image.url}`, error);
    }
  }
}
```

### When to Mark Images for Deletion

1. **User Updates Avatar**

   ```typescript
   if (previousImageUrl && newImageUrl !== previousImageUrl) {
     await markImageForDeletion(previousImageUrl, {
       entityType: "user",
       entityId: userId,
       reason: "replaced",
     });
   }
   ```

2. **User Removes Image**

   ```typescript
   if (shouldRemoveImage && existingImageUrl) {
     await markImageForDeletion(existingImageUrl, {
       entityType: "user",
       entityId: userId,
       reason: "removed",
     });
   }
   ```

3. **Entity Deletion**

   ```typescript
   await markEntityImagesForDeletion(entityId, entityType, {
     reason: "entity_deleted",
   });
   ```

---

## 💻 Code Examples

### Backend: Upload Image

```java
@PostMapping
public ResponseEntity<ApiResponse<String>> uploadImage(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "folder", required = false, defaultValue = "others") String folder
) {
    // Validate file
    if (file == null || file.isEmpty()) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, "File không được để trống"));
    }

    // Upload to MinIO
    String imageUrl = imageUploadService.uploadImage(file, folder);

    return ResponseEntity.ok(ApiResponse.success("Upload ảnh thành công", imageUrl));
}
```

### Backend: Mark for Deletion

```java
@PostMapping("/mark-for-deletion")
public ResponseEntity<ApiResponse<ImageDeletionQueueDTO>> markForDeletion(
        @RequestBody MarkForDeletionRequest request
) {
    ImageDeletionQueue queue = imageDeletionService.markForDeletion(
            request.imageUrl(),
            request.entityType(),
            request.entityId(),
            request.reason()
    );

    return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu ảnh để xóa", toDTO(queue)));
}
```

### Frontend: Use Image Management Hook

```typescript
function UserFormSheet({ user }: { user?: User }) {
  const imageManagement = useImageManagement("users");
  const { updateMutation } = useUsers();

  const onSubmit = async (data: UserFormData) => {
    // Handle image update with soft delete
    const finalAvatarUrl = await imageManagement.handleImageUpdate(
      data.avatarUrl, // File | string | null
      user?.avatarUrl, // Previous URL
      user?.id
    );

    // Update user
    await updateMutation.mutateAsync({
      id: user.id,
      data: { ...data, avatarUrl: finalAvatarUrl },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        name="avatarUrl"
        control={form.control}
        render={({ field }) => (
          <ImageUpload
            value={field.value}
            previewUrl={user?.avatarUrl || null}
            onChange={(file) => field.onChange(file || null)}
            variant="circle"
            size="lg"
            folder={imageManagement.getImageFolder()}
          />
        )}
      />
    </form>
  );
}
```

### Frontend: Image Upload Component

```tsx
<ImageUpload
  value={form.watch("imageUrl")}
  previewUrl={entity?.imageUrl || null}
  onChange={(file) => {
    form.setValue("imageUrl", file || null);
    form.trigger("imageUrl");
  }}
  variant="rectangle" // "circle" | "rectangle"
  size="lg"
  folder="brands"
  disabled={isSubmitting}
/>
```

---

## 🧪 Testing Guide

### Backend Testing

1. **Unit Tests:**

   - Test file validation (type, size)
   - Test UUID generation
   - Test date partitioning
   - Test mark for deletion logic
   - Test duplicate prevention

2. **Integration Tests:**

   - Test upload API
   - Test mark-for-deletion API
   - Test cleanup job
   - Test MinIO integration

### Frontend Testing

1. **Component Tests:**

   - Test ImageUpload component
   - Test preview functionality
   - Test file selection
   - Test delete button

2. **Hook Tests:**

   - Test `useImageManagement` hook
   - Test upload flow
   - Test soft delete flow
   - Test error handling

3. **E2E Tests:**

   - Test upload image
   - Test update image (mark old for deletion)
   - Test remove image
   - Test cleanup job

### Test Cases

**Backend:**

- ✅ Upload image với file hợp lệ
- ✅ Upload image với file quá lớn → throw exception
- ✅ Upload image với file type không hợp lệ → throw exception
- ✅ Mark for deletion → tạo record trong queue
- ✅ Mark duplicate → không tạo record mới
- ✅ Cleanup job → xóa images đã mark > 24h

**Frontend:**

- ✅ Upload image → preview hiển thị
- ✅ Update image → mark old for deletion
- ✅ Remove image → mark for deletion với reason = "removed"
- ✅ Error handling → hiển thị error message

---

## 📝 Notes & Best Practices

### Backend

1. **Validation:**

   - Validate file type (MIME type)
   - Validate file size (max 5MB)
   - Validate file content (magic bytes)

2. **Error Handling:**

   - Upload errors: Throw exception với message rõ ràng
   - Delete errors: Log warning, không throw (fire-and-forget)

3. **Performance:**

   - Date partitioning để tránh ops nightmare
   - Batch processing cho cleanup job
   - Indexes cho deletion queue

### Frontend

1. **State Management:**

   - Client-first upload flow (chỉ upload khi submit)
   - Preview với FileReader (data URL)
   - Soft delete integration

2. **UX:**

   - Real-time preview
   - Loading states
   - Error handling với user-friendly messages
   - Non-blocking deletion (không throw error)

3. **Code Reusability:**

   - `useImageManagement` hook cho tất cả entities
   - `ImageUpload` component reusable
   - Utilities tách riêng

### Security

1. **File Naming:**

   - Chỉ dùng UUID, không lộ thông tin nghiệp vụ
   - Metadata lưu trong Object Tags

2. **Validation:**

   - Client-side và server-side validation
   - Magic bytes validation để tránh file giả mạo

3. **Access Control:**

   - Tất cả endpoints yêu cầu authentication
   - Role-based access control

---

## 🚀 Future Enhancements

1. **Presigned URL:** Client upload trực tiếp lên MinIO (giảm tải Backend)
2. **Async Image Processing:** Resize/compress ảnh trong background
3. **CDN Integration:** CloudFront/Cloudflare cho global distribution
4. **Image Optimization:** Auto WebP conversion, responsive images
5. **Advanced Features:** Image cropping/editing, multiple upload
6. **Analytics:** Track image usage, storage reports

---

## 📚 References

- [Image Management Strategy](../IMAGE_MANAGEMENT_STRATEGY.md)
- [MinIO Guide](../backend/MINIO_GUIDE.md)
- [Backend Image Deletion Implementation](../BACKEND_IMAGE_DELETION_IMPLEMENTATION.md)
- [Image Folder Structure Audit](../IMAGE_FOLDER_STRUCTURE_AUDIT.md)

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-03  
**Author:** Development Team

