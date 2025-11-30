# Image Management Strategy for Admin Dashboard

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Kiến trúc hiện tại](#kiến-trúc-hiện-tại)
3. [Cấu trúc Folder Organization](#cấu-trúc-folder-organization)
4. [Naming Convention](#naming-convention)
5. [Validation & Optimization](#validation--optimization)
6. [Upload Flow & Error Handling](#upload-flow--error-handling)
7. [Delete & Cleanup Strategy](#delete--cleanup-strategy)
8. [Caching Strategy](#caching-strategy)
9. [Performance Optimization](#performance-optimization)
10. [Best Practices](#best-practices)
11. [Code Patterns](#code-patterns)
12. [Migration & Future Improvements](#migration--future-improvements)

---

## Tổng quan

### Mục tiêu

Tài liệu này mô tả chiến lược tổ chức và vận hành hình ảnh trong admin dashboard nhằm:

- **Tối ưu hiệu năng**: Giảm thời gian tải, tối ưu băng thông
- **Dễ bảo trì**: Cấu trúc rõ ràng, dễ quản lý
- **Mở rộng**: Dễ dàng thêm tính năng mới
- **Bảo mật**: Validate đầy đủ, tránh lỗ hổng
- **Hiệu quả**: Tối ưu storage, giảm chi phí

### Phạm vi

- Upload và quản lý hình ảnh trong admin dashboard
- Tổ chức folder structure trong MinIO
- Validation và optimization
- Error handling và cleanup
- Performance optimization

---

## Kiến trúc hiện tại

### Storage Backend

- **MinIO**: Object storage service
- **Bucket**: `orchard-bucket`
- **API Endpoint**: `/api/admin/upload`

### Upload Service

**File**: `src/services/upload.service.ts`

```typescript
uploadService.uploadImage(file: File, folder: string): Promise<string>
uploadService.deleteImage(imageUrl: string): Promise<void>
```

### Image Upload Component

**File**: `src/components/shared/image-upload.tsx`

- Hỗ trợ 2 variants: `circle` (avatar) và `rectangle` (logo/banner)
- Preview real-time
- Validation client-side
- Error handling

### Validation

**File**: `src/lib/validation/file-validation.ts`

- **Sync validation**: Size, MIME type
- **Async validation**: Magic bytes (file signature)
- **Supported formats**: JPEG, PNG, WebP
- **Max size**: 5MB

---

## Cấu trúc Folder Organization

### ⚠️ CRITICAL: Không dùng Mutable Data trong Folder Path

**Vấn đề với Object Storage (S3/MinIO)**:

- Object Storage **KHÔNG PHẢI** File System
- **Không có lệnh Rename Folder** - phải Copy + Delete
- Nếu slug thay đổi: `nuoc-hoa` → `nuoc-hoa-nam`
  - Phải copy 10,000 ảnh sang folder mới
  - Xóa folder cũ
  - **Rủi ro**: Timeout, treo hệ thống, gãy link (404)

**Giải pháp**: **TUYỆT ĐỐI KHÔNG** dùng dữ liệu có thể thay đổi (slug, name) trong folder path.

### Quy tắc đặt tên folder

#### ✅ Flat Structure (Khuyến nghị)

**Sử dụng cho TẤT CẢ entities** - Đơn giản, hiệu quả, không rủi ro:

```
bucket/
├── users/           # Avatar của users
├── brands/          # Logo của brands
├── categories/      # Hình ảnh categories (KHÔNG phân cấp)
├── products/        # Hình ảnh sản phẩm
└── others/          # Hình ảnh khác
```

**Lý do**:

- ✅ Không phụ thuộc vào dữ liệu có thể thay đổi
- ✅ Không cần rename khi slug/name thay đổi
- ✅ Phân loại ảnh thuộc entity nào là việc của **Database**, không phải Folder
- ✅ Dễ quản lý và scale

#### ❌ KHÔNG dùng: Hierarchical với Slug

```
❌ categories/{parent-slug}/     # Rủi ro khi slug thay đổi
❌ categories/{parent-id}/        # Có thể dùng nhưng không cần thiết
```

### Folder Mapping (Updated)

| Entity     | Folder Pattern | Example               | Lý do                                        |
| ---------- | -------------- | --------------------- | -------------------------------------------- |
| Users      | `users`        | `users/uuid.jpg`      | Flat, đơn giản                               |
| Brands     | `brands`       | `brands/uuid.png`     | Flat, đơn giản                               |
| Categories | `categories`   | `categories/uuid.jpg` | **KHÔNG phân cấp** - dùng DB để track parent |
| Products   | `products`     | `products/uuid.jpg`   | Flat, đơn giản                               |
| Others     | `others`       | `others/uuid.jpg`     | Flat, đơn giản                               |

### Implementation (Updated)

#### ✅ Category Folder Resolution (Simplified)

```typescript
// ✅ Good - Flat structure
const resolveUploadFolder = () => {
  return "categories"; // Luôn dùng flat, không phân cấp
};

// ❌ Bad - Dùng slug (rủi ro khi slug thay đổi)
const resolveUploadFolder = (parentId: number | null | undefined) => {
  if (!parentId) {
    return "categories";
  }
  const parentCat = allCategories.find((cat) => cat.id === parentId);
  return `categories/${parentCat.slug}`; // ❌ Rủi ro!
};
```

**Lợi ích của Flat Structure**:

- ✅ Không bị ảnh hưởng khi slug/name thay đổi
- ✅ Không cần rename folder (không có rename trong S3/MinIO)
- ✅ URL ảnh ổn định, không bị 404
- ✅ Phân loại theo parent là việc của Database (foreign key)
- ✅ Dễ scale và maintain

### ⚠️ CRITICAL: Flat Structure khi quá lớn (Ops Nightmare)

**Vấn đề khi scale**:

```
categories/uuid.jpg
categories/uuid.jpg
... (100,000 files sau 2 năm)
```

**Hậu quả**:

- ❌ **UI treo**: MinIO Console/S3 Browser không load được folder có 100k files
- ❌ **Backup khó**: Không thể backup theo tháng/ngày
- ❌ **Quản lý khó**: Không thể xóa log cũ dễ dàng
- ❌ **Performance**: List objects chậm khi có quá nhiều files

**Giải pháp: Date Partitioning (Phân vùng theo thời gian)**

#### ✅ Date-based Partitioning

**Cấu trúc mới**:

```
categories/YYYY/MM/DD/{uuid}.jpg
```

**Ví dụ**:

- `categories/2024/11/29/550e8400-e29b-41d4-a716-446655440000.jpg`
- `categories/2024/12/01/a1b2c3d4-e5f6-7890-abcd-ef1234567890.png`

**Implementation**:

```typescript
// Generate folder path with date
const getUploadFolder = (entityType: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${entityType}/${year}/${month}/${day}`;
};

// Usage
const folder = getUploadFolder("categories");
// Result: categories/2024/11/29
```

**Lợi ích**:

- ✅ **Vẫn immutable**: Không phụ thuộc vào slug/name (dùng date upload)
- ✅ **Dễ quản lý**: Mỗi folder chỉ có ~100-1000 files (tùy traffic)
- ✅ **Dễ backup**: Backup theo ngày/tháng
- ✅ **Dễ cleanup**: Xóa folder cũ theo lifecycle policy
- ✅ **Performance tốt**: List objects nhanh hơn

**Lifecycle Policy Example**:

```yaml
# MinIO Lifecycle Policy
Rules:
  - Id: DeleteOldImages
    Status: Enabled
    Expiration:
      Days: 365 # Xóa ảnh cũ hơn 1 năm (nếu cần)
    Filter:
      Prefix: categories/2023/ # Chỉ áp dụng cho ảnh năm 2023
```

**Migration Strategy**:

- **New uploads**: Dùng date partitioning ngay
- **Old files**: Giữ nguyên, không migrate (tránh downtime)
- **Gradual cleanup**: Xóa old flat structure sau khi đã migrate hết

**Recommendation**: Áp dụng **Date Partitioning** ngay từ đầu cho tất cả entities

---

## Naming Convention

### ⚠️ CRITICAL: Security & Information Leakage

**Vấn đề với Hybrid Naming**:

- ❌ **Information Leakage**: `user-123-uuid.jpg` → Hacker biết user ID = 123
- ❌ **Enumeration Attack**: Có thể đoán user-124, user-125...
- ❌ **Tên file dài**: Tăng kích thước database lưu URL

**Giải pháp**: **CHỈ DÙNG UUID** - Metadata lưu trong Object Tags/Metadata

### File Naming Strategy

#### ✅ UUID-based (Khuyến nghị - Duy nhất)

```
{uuid}.{extension}
```

**Ví dụ**:

- `550e8400-e29b-41d4-a716-446655440000.jpg`
- `a1b2c3d4-e5f6-7890-abcd-ef1234567890.png`

**Ưu điểm**:

- ✅ Tránh conflict tên file
- ✅ **Bảo mật cao** (không lộ thông tin nghiệp vụ)
- ✅ Unique globally
- ✅ Tên file ngắn gọn
- ✅ Không bị Enumeration Attack

**Nhược điểm**:

- ⚠️ Khó debug (nhưng có thể dùng Object Tags/Metadata)

#### ❌ KHÔNG dùng: Hybrid Naming

```
❌ {entity-type}-{id}-{uuid}.{extension}
❌ user-123-550e8400-e29b-41d4-a716-446655440000.jpg
```

**Lý do từ chối**:

- ❌ Lộ thông tin nghiệp vụ (user ID, category ID...)
- ❌ Rủi ro Enumeration Attack
- ❌ Tên file quá dài

### Alternative: Object Tags/Metadata (Khuyến nghị)

**Thay vì nhét thông tin vào tên file**, dùng Object Tags của MinIO/S3:

```typescript
// Upload với metadata
await minioClient.putObject(
  bucketName,
  fileName, // Chỉ UUID
  fileStream,
  {
    "Content-Type": "image/jpeg",
    "X-Entity-Type": "user", // Metadata
    "X-Entity-Id": "123", // Metadata
    "X-Uploaded-By": "user-id", // Metadata
  }
);

// Query bằng metadata (không cần parse tên file)
const objects = await minioClient.listObjects(bucketName, {
  prefix: "users/",
  // Filter by metadata if needed
});
```

**Lợi ích**:

- ✅ Tên file ngắn gọn (chỉ UUID)
- ✅ Metadata lưu riêng, không lộ trong URL
- ✅ Có thể query/filter bằng metadata
- ✅ Bảo mật tốt hơn

### File Extension Handling

- **Giữ nguyên extension** từ file gốc
- **Validate extension** khớp với MIME type
- **Không convert** extension (backend xử lý)

---

## Validation & Optimization

### Client-side Validation

#### 1. File Type Validation

```typescript
// Allowed MIME types
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
```

#### 2. File Size Validation

```typescript
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
```

#### 3. Magic Bytes Validation

Kiểm tra file signature để tránh file giả mạo:

```typescript
const MAGIC_BYTES = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46, ..., 0x57, 0x45, 0x42, 0x50]],
};
```

### Server-side Validation (Backend)

Backend cần validate:

- File type (MIME type)
- File size
- File content (magic bytes)
- Malware scanning (nếu có)

### ⚠️ CRITICAL: Image Processing Scalability

**Vấn đề với Sync Processing tại Backend**:

- ❌ **CPU Intensive**: Resize/compress ảnh tốn CPU
- ❌ **Blocking**: Backend vừa phục vụ API, vừa xử lý ảnh → Server quá tải
- ❌ **Slow Response**: User phải chờ xử lý xong mới có response
- ❌ **Không scale**: 10 uploads đồng thời → CPU 100%

**Giải pháp**: **Async Processing** - Đẩy sang Worker hoặc Lambda Function

### Image Optimization Strategy

#### ❌ KHÔNG làm: Sync Processing tại Backend

```java
// ❌ Bad - Blocking, CPU intensive
@PostMapping("/upload")
public ResponseEntity<String> uploadImage(@RequestParam MultipartFile file) {
    // Upload file
    String url = minioService.upload(file);

    // Resize/compress ngay tại đây (BLOCKING)
    ImageProcessor.resize(url, 150, 150); // CPU intensive!
    ImageProcessor.compress(url, 0.8);     // CPU intensive!

    return ResponseEntity.ok(url); // User phải chờ!
}
```

#### ✅ Recommended: Async Processing

##### Option 1: Message Queue (Kafka/RabbitMQ)

```java
// Backend chỉ nhận file, trả về OK ngay
@PostMapping("/upload")
public ResponseEntity<String> uploadImage(@RequestParam MultipartFile file) {
    // Upload original file
    String url = minioService.upload(file);

    // Send message to queue (async)
    imageProcessingQueue.send(new ImageProcessingRequest(
        url,
        Arrays.asList(
            new ResizeTask(150, 150),  // Thumbnail
            new ResizeTask(300, 300),  // Small
            new ResizeTask(600, 600),  // Medium
            new CompressTask(0.8)      // Compression
        )
    ));

    return ResponseEntity.ok(url); // Return ngay, không chờ
}

// Worker xử lý ngầm
@RabbitListener(queues = "image-processing")
public void processImage(ImageProcessingRequest request) {
    for (Task task : request.getTasks()) {
        task.execute(request.getImageUrl());
    }
}
```

##### Option 2: MinIO Webhook + Lambda Function

```typescript
// MinIO triggers webhook when file uploaded
// Lambda function processes image
export const handler = async (event: MinIOEvent) => {
  const imageUrl = event.objectUrl;

  // Process in parallel
  await Promise.all([
    resizeImage(imageUrl, 150, 150, "thumbnails/"),
    resizeImage(imageUrl, 300, 300, "small/"),
    resizeImage(imageUrl, 600, 600, "medium/"),
    compressImage(imageUrl, 0.8),
  ]);
};
```

##### Option 3: Background Job (Spring @Async)

```java
@Service
public class ImageProcessingService {

    @Async
    public CompletableFuture<Void> processImage(String imageUrl) {
        // Process in background thread
        resizeImage(imageUrl, 150, 150);
        resizeImage(imageUrl, 300, 300);
        compressImage(imageUrl, 0.8);
        return CompletableFuture.completedFuture(null);
    }
}

@PostMapping("/upload")
public ResponseEntity<String> uploadImage(@RequestParam MultipartFile file) {
    String url = minioService.upload(file);

    // Trigger async processing (non-blocking)
    imageProcessingService.processImage(url);

    return ResponseEntity.ok(url); // Return ngay
}
```

### Image Optimization Specs

#### 1. Compression

- **JPEG**: Quality 80-85%
- **PNG**: Optimize với pngquant
- **WebP**: Auto-convert nếu browser support

#### 2. Resizing (Generated asynchronously)

- **Thumbnail**: 150x150px (for lists)
- **Small**: 300x300px (for cards)
- **Medium**: 600x600px (for detail pages)
- **Large**: 1200x1200px (for full view)
- **Original**: Giữ nguyên (max 1920px)

#### 3. Format Conversion

- **Auto WebP**: Convert nếu browser support
- **Fallback**: JPEG/PNG cho browser cũ

**Lợi ích của Async Processing**:

- ✅ **Non-blocking**: Backend trả về ngay, không chờ
- ✅ **Scale tốt**: Worker có thể scale riêng
- ✅ **Resilient**: Nếu processing fail, original vẫn còn
- ✅ **Flexible**: Có thể thêm/bớt processing tasks dễ dàng

### ⚠️ CRITICAL: User Experience với Async Processing

**Vấn đề**:

```
1. User upload avatar ✅
2. User bấm Save ✅
3. Worker đang resize thumbnail (async, chưa xong) ⏳
4. User quay ra trang chủ → Avatar bị vỡ hoặc chưa hiện ❌
```

**Hậu quả**:

- ❌ **Bad UX**: User thấy ảnh chết (broken image)
- ❌ **Confusion**: User nghĩ upload thất bại
- ❌ **Retry loop**: User upload lại nhiều lần

**Giải pháp: Fallback Image Strategy**

#### ✅ Frontend Fallback Logic

```tsx
// ✅ Good - Fallback to original if thumbnail not ready
const ImageWithFallback = ({ thumbnailUrl, originalUrl, alt }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <img
      src={imageError ? originalUrl : thumbnailUrl}
      alt={alt}
      onError={(e) => {
        // If thumbnail fails, fallback to original
        if (!imageError && e.target.src !== originalUrl) {
          setImageError(true);
          e.target.src = originalUrl;
        }
      }}
      loading="lazy"
    />
  );
};

// Usage
<ImageWithFallback
  thumbnailUrl={`${imageUrl}?size=thumbnail`}
  originalUrl={imageUrl}
  alt="User avatar"
/>;
```

#### ✅ Backend: Return Processing Status

```typescript
// Backend response includes processing status
interface ImageResponse {
  url: string;
  thumbnailUrl?: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  originalUrl: string; // Always available as fallback
}

// Frontend logic
const ImageComponent = ({ image }: { image: ImageResponse }) => {
  // Use thumbnail if ready, otherwise use original
  const displayUrl =
    image.processingStatus === "completed" && image.thumbnailUrl
      ? image.thumbnailUrl
      : image.originalUrl;

  return (
    <img
      src={displayUrl}
      alt="Image"
      onError={(e) => {
        // Ultimate fallback to original
        e.target.src = image.originalUrl;
      }}
    />
  );
};
```

#### ✅ Progressive Enhancement

```tsx
// Show loading state while processing
const ImageWithProgressiveLoad = ({ imageUrl }) => {
  const [thumbnailReady, setThumbnailReady] = useState(false);

  useEffect(() => {
    // Check if thumbnail exists
    const checkThumbnail = async () => {
      try {
        const response = await fetch(`${imageUrl}?size=thumbnail`, {
          method: "HEAD",
        });
        if (response.ok) {
          setThumbnailReady(true);
        }
      } catch (error) {
        // Thumbnail not ready yet, use original
      }
    };

    checkThumbnail();
    // Poll every 2 seconds until ready
    const interval = setInterval(checkThumbnail, 2000);
    return () => clearInterval(interval);
  }, [imageUrl]);

  return (
    <div className="relative">
      {/* Show original while waiting */}
      <img
        src={imageUrl}
        alt="Image"
        className={thumbnailReady ? "hidden" : ""}
      />
      {/* Show thumbnail when ready */}
      {thumbnailReady && (
        <img
          src={`${imageUrl}?size=thumbnail`}
          alt="Image"
          className="fade-in"
        />
      )}
    </div>
  );
};
```

**Best Practice**:

1. **Always provide original URL**: Original luôn có sẵn, dùng làm fallback
2. **Graceful degradation**: Nếu thumbnail chưa ready, hiển thị original (dù nặng hơn)
3. **Error handling**: `onError` handler để fallback tự động
4. **Status tracking**: Backend trả về processing status để frontend biết
5. **Progressive enhancement**: Tự động chuyển sang thumbnail khi ready

**Recommendation**: Implement **Fallback Strategy** ngay từ đầu để đảm bảo UX tốt

---

## Upload Flow & Error Handling

### ⚠️ CRITICAL: Performance Bottleneck

**Vấn đề với Current Flow (Client → Backend → MinIO)**:

- ❌ **Tốn tài nguyên Server**: File đi qua RAM của Java Backend
- ❌ **100 users upload 5MB** → Server gánh **500MB I/O** không cần thiết
- ❌ **Chậm**: Tăng độ trễ (Latency) gấp đôi
- ❌ **Không scale**: Server bị bottleneck khi nhiều upload đồng thời

**Giải pháp**: **Presigned URL** - Client upload trực tiếp lên MinIO

### Upload Flow

#### Current Flow (MVP - Đơn giản cho giai đoạn đầu)

```
┌─────────────┐
│ User Select │
│    File     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Client     │
│ Validation  │
└──────┬──────┘
       │
       ├─ Invalid ──► Show Error ──► Stop
       │
       ▼ Valid
┌─────────────┐
│   Upload    │
│   to API    │  ← File đi qua Backend (bottleneck)
└──────┬──────┘
       │
       ├─ Error ──► Show Error ──► Retry?
       │
       ▼ Success
┌─────────────┐
│  Get URL    │
│  from API   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Update     │
│   Form      │
└─────────────┘
```

#### ✅ Recommended Flow (Presigned URL - Best Practice)

```
┌─────────────┐
│ User Select │
│    File     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Client     │
│ Validation  │
└──────┬──────┘
       │
       ├─ Invalid ──► Show Error ──► Stop
       │
       ▼ Valid
┌─────────────┐
│ Request     │
│ Presigned   │  ← Chỉ request URL, không gửi file
│ URL from   │
│   API       │
└──────┬──────┘
       │
       ├─ Error ──► Show Error ──► Retry?
       │
       ▼ Success
┌─────────────┐
│  Upload     │
│ Direct to   │  ← Upload trực tiếp, bỏ qua Backend
│   MinIO     │
└──────┬──────┘
       │
       ├─ Error ──► Show Error ──► Retry?
       │
       ▼ Success
┌─────────────┐
│  Notify     │
│  Backend    │  ← Chỉ gửi URL, không gửi file
│  with URL   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Update     │
│   Form      │
└─────────────┘
```

### Implementation: Presigned URL

#### Backend API

```java
// GET /api/admin/upload/presigned-url
@GetMapping("/presigned-url")
public ResponseEntity<PresignedUrlResponse> getPresignedUrl(
    @RequestParam String folder,
    @RequestParam String fileName,
    @RequestParam String contentType
) {
    // Generate presigned URL (expires in 5 minutes)
    String presignedUrl = minioService.generatePresignedPutUrl(
        bucketName,
        folder + "/" + fileName,
        contentType,
        Duration.ofMinutes(5)
    );

    return ResponseEntity.ok(new PresignedUrlResponse(
        presignedUrl,
        folder + "/" + fileName  // Final object key
    ));
}
```

#### Frontend Service

```typescript
// Request presigned URL
const getPresignedUrl = async (
  folder: string,
  fileName: string,
  contentType: string
): Promise<PresignedUrlResponse> => {
  const response = await http.get<ApiResponse<PresignedUrlResponse>>(
    "/api/admin/upload/presigned-url",
    { params: { folder, fileName, contentType } }
  );
  return response.data!;
};

// Upload directly to MinIO
const uploadToMinIO = async (
  file: File,
  presignedUrl: string
): Promise<void> => {
  await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
};

// Complete flow
const uploadImage = async (file: File, folder: string): Promise<string> => {
  // 1. Generate unique filename
  const fileName = `${uuid()}.${getExtension(file.name)}`;

  // 2. Get presigned URL
  const { presignedUrl, objectKey } = await getPresignedUrl(
    folder,
    fileName,
    file.type
  );

  // 3. Upload directly to MinIO
  await uploadToMinIO(file, presignedUrl);

  // 4. Return final URL
  return `${minioBaseUrl}/${bucketName}/${objectKey}`;
};
```

**Lợi ích**:

- ✅ **Giảm tải Backend**: File không đi qua Backend
- ✅ **Nhanh hơn**: Upload trực tiếp, giảm latency
- ✅ **Scale tốt**: Backend chỉ generate URL, không xử lý file
- ✅ **Bảo mật**: Presigned URL có expiration time

**Migration Path**:

- **Phase 1 (Current)**: Giữ flow hiện tại cho đơn giản (MVP)
- **Phase 2 (3-6 months)**: Migrate sang Presigned URL

### ⚠️ CRITICAL: Security Gap với Presigned URL

**Vấn đề với Presigned URL Flow**:

```
1. Frontend xin Presigned URL ✅
2. Frontend upload lên MinIO ✅
3. Frontend gửi URL về Backend để lưu DB ✅
```

**Lỗ hổng bảo mật**:

- ❌ **Hacker có thể bỏ qua bước 2**: Không upload gì cả
- ❌ **Gửi URL giả**: URL trỏ đến file độc hại khác
- ❌ **Backend lưu URL mà không verify**: File có tồn tại? File có hợp lệ?

**Hậu quả**:

- Database lưu URL không hợp lệ → 404 khi load
- URL trỏ đến file độc hại → Security risk
- Không kiểm soát được file thực sự được upload

**Giải pháp: Upload Verification**

#### ✅ Cách 1: Stat Object Verification (Đơn giản)

```java
@PostMapping("/save-image")
public ResponseEntity<String> saveImageUrl(
    @RequestParam String imageUrl,
    @RequestParam String entityType,
    @RequestParam Long entityId
) {
    // Verify file exists before saving
    try {
        StatObjectResponse stat = minioClient.statObject(
            StatObjectArgs.builder()
                .bucket(bucketName)
                .object(extractObjectKey(imageUrl))
                .build()
        );

        // Verify file is valid
        if (stat.size() == 0) {
            throw new IllegalArgumentException("File is empty");
        }

        // Verify content type
        if (!stat.contentType().startsWith("image/")) {
            throw new IllegalArgumentException("File is not an image");
        }

        // Safe to save
        return service.updateEntityImage(entityId, entityType, imageUrl);

    } catch (ErrorResponseException e) {
        if (e.errorResponse().code().equals("NoSuchKey")) {
            throw new IllegalArgumentException("File does not exist");
        }
        throw e;
    }
}
```

#### ✅ Cách 2: MinIO Event Webhook (Xịn hơn)

**Cấu hình MinIO Event Notification**:

```yaml
# MinIO config
notify:
  webhook:
    1:
      endpoint: http://backend:8080/api/admin/upload/verify
      events:
        - s3:ObjectCreated:*
```

**Backend Webhook Handler**:

```java
@PostMapping("/upload/verify")
public ResponseEntity<Void> verifyUpload(@RequestBody MinIOEvent event) {
    String objectKey = event.getObjectKey();
    String bucket = event.getBucket();

    // Mark file as verified
    imageVerificationService.markAsVerified(bucket, objectKey, {
        uploadedAt: event.getTime(),
        size: event.getSize(),
        contentType: event.getContentType(),
    });

    return ResponseEntity.ok().build();
}

// When saving image URL
@PostMapping("/save-image")
public ResponseEntity<String> saveImageUrl(
    @RequestParam String imageUrl
) {
    // Check if file is verified
    if (!imageVerificationService.isVerified(imageUrl)) {
        throw new IllegalArgumentException(
            "File not verified. Please upload first."
        );
    }

    // Safe to save
    return service.updateEntityImage(entityId, entityType, imageUrl);
}
```

**Lợi ích của Webhook**:

- ✅ **Tự động verify**: MinIO tự bắn event khi upload thành công
- ✅ **Không thể fake**: Event chỉ xảy ra khi file thực sự được upload
- ✅ **Real-time**: Verify ngay khi upload xong
- ✅ **Audit trail**: Có log khi nào file được upload

**Recommendation**: Dùng **Cách 2 (Webhook)** cho production, **Cách 1 (Stat)** cho MVP/development

### Error Handling

#### Client-side Errors

| Error           | Message                                        | Action                  |
| --------------- | ---------------------------------------------- | ----------------------- |
| No file         | "File không được để trống"                     | Prevent submit          |
| Invalid type    | "Chỉ chấp nhận các định dạng: jpeg, png, webp" | Show error, clear input |
| File too large  | "Kích thước file không được vượt quá 5MB"      | Show error, clear input |
| Invalid content | "Nội dung file không khớp với định dạng"       | Show error, clear input |
| Upload failed   | "Upload thất bại: {error}"                     | Show error, allow retry |
| Network error   | "Lỗi kết nối. Vui lòng thử lại"                | Show error, allow retry |

#### Implementation Pattern

```typescript
try {
  // Upload image
  const imageUrl = await uploadService.uploadImage(file, folder);
  // Success - update form
  form.setValue("imageUrl", imageUrl);
} catch (error) {
  // Handle error
  if (error instanceof Error) {
    form.setError("imageUrl", {
      type: "manual",
      message: error.message,
    });
    toast.error(error.message);
  }
}
```

### Retry Logic (Future)

- **Auto retry**: 3 lần với exponential backoff
- **Manual retry**: Button "Thử lại" cho user
- **Progress tracking**: Show upload progress

---

## Delete & Cleanup Strategy

### ⚠️ CRITICAL: Data Consistency & Transaction Failure

**Vấn đề với Hard Delete ngay lập tức**:

```
1. Upload ảnh mới (New) ✅
2. Xóa ảnh cũ (Old) ✅
3. Lưu DB thất bại (DB sập, lỗi mạng...) ❌
```

**Hậu quả**:

- ❌ DB vẫn lưu URL cũ (đã bị xóa) → 404 khi load
- ❌ File mới thành file rác (Orphan) - không có entity reference
- ❌ User mất cả avatar cũ và avatar mới

**Giải pháp**: **Soft Delete + Cleanup Job** - Chỉ xóa sau khi DB commit thành công

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
// Scheduled job (chạy mỗi đêm)
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
        logger.info(`Deleted image: ${image.url}`);
      } else {
        // Still referenced - keep it
        await removeDeletionMark(image.id);
        logger.warn(`Image still referenced, keeping: ${image.url}`);
      }
    } catch (error) {
      logger.error(`Failed to cleanup image: ${image.url}`, error);
    }
  }
}
```

#### 3. Database Schema (Deletion Queue)

```sql
CREATE TABLE image_deletion_queue (
  id BIGSERIAL PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  entity_type VARCHAR(50),
  entity_id BIGINT,
  reason VARCHAR(100), -- 'replaced', 'removed', 'entity_deleted'
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'processing', 'completed', 'failed'
);

CREATE INDEX idx_image_deletion_marked_at ON image_deletion_queue(marked_at);
CREATE INDEX idx_image_deletion_status ON image_deletion_queue(status);
```

### When to Mark Images for Deletion

#### 1. User Updates Avatar

```typescript
// Mark old avatar for deletion (after DB update success)
if (previousImageUrl && newImageUrl !== previousImageUrl) {
  await markImageForDeletion(previousImageUrl, {
    entityType: "user",
    entityId: userId,
    reason: "replaced",
  });
}
```

#### 2. User Removes Image

```typescript
// Mark for deletion (after DB update success)
if (shouldRemoveImage && existingImageUrl) {
  await markImageForDeletion(existingImageUrl, {
    entityType: "user",
    entityId: userId,
    reason: "removed",
  });
}
```

#### 3. Entity Deletion

```typescript
// Mark all entity images for deletion
await markEntityImagesForDeletion(entityId, entityType, {
  reason: "entity_deleted",
});
```

### Cleanup Strategy

#### ⚠️ CRITICAL: Orphaned Images Detection (Performance Suicide)

**Vấn đề với approach hiện tại**:

```typescript
// ❌ NGUY HIỂM - Performance suicide
async function detectOrphanedImages() {
  const allImageUrls = await getAllImageUrlsFromDatabase(); // 1M records
  const bucketFiles = await listAllBucketFiles(); // 1M files

  // So khớp 1M với 1M = O(n²) = 1 TRIỆU x 1 TRIỆU operations
  const orphaned = bucketFiles.filter(
    (file) => !allImageUrls.includes(file.url)
  );
}
```

**Hậu quả**:

- ❌ **RAM sập**: Load 1M files vào memory
- ❌ **Chạy mất cả ngày**: O(n²) complexity
- ❌ **Timeout**: Job không bao giờ hoàn thành
- ❌ **Không scale**: Không thể chạy khi có nhiều files

**Giải pháp: Reconciliation Strategy (Đối soát thông minh)**

#### ✅ Cơ chế chính: Chỉ tin tưởng Deletion Queue

```typescript
// ✅ Good - Chỉ quét deletion queue (nhỏ, nhanh)
async function cleanupMarkedImages() {
  // Chỉ lấy images đã được mark (thường < 1000 records)
  const markedImages = await getMarkedForDeletionImages({
    olderThan: 24 * 60 * 60 * 1000, // 24 hours
    limit: 1000, // Batch processing
  });

  for (const image of markedImages) {
    try {
      // Verify DB không còn reference
      const entity = await getEntityByImageUrl(image.url);
      if (!entity || entity.imageUrl !== image.url) {
        // Safe to delete
        await uploadService.deleteImage(image.url);
        await removeDeletionMark(image.id);
      }
    } catch (error) {
      logger.error(`Failed to cleanup: ${image.url}`, error);
    }
  }
}
```

**Lợi ích**:

- ✅ **Nhanh**: Chỉ quét deletion queue (nhỏ)
- ✅ **An toàn**: Chỉ xóa những gì đã được mark
- ✅ **Scale tốt**: Batch processing, không load hết vào RAM

#### ✅ Cơ chế phụ: Lifecycle Policy (Dọn rác mồ côi)

**Thay vì quét toàn bộ**, dùng **MinIO/S3 Lifecycle Policy**:

**Strategy: Temp Folder + Lifecycle Policy**

```typescript
// Upload flow với temp folder
const uploadImage = async (file: File, folder: string): Promise<string> => {
  // 1. Upload vào temp/ folder (tạm thời)
  const tempKey = `temp/${folder}/${uuid()}.${getExtension(file.name)}`;
  await uploadToMinIO(file, tempKey);

  // 2. Return temp URL
  return `${minioBaseUrl}/${bucketName}/${tempKey}`;
};

// Khi user bấm Save
const saveImage = async (tempUrl: string, entityId: number) => {
  // 1. Move từ temp/ sang official/
  const tempKey = extractKey(tempUrl);
  const officialKey = tempKey.replace("temp/", "");

  await minioClient.copyObject(
    CopyObjectArgs.builder()
      .bucket(bucketName)
      .object(officialKey)
      .source(CopySource.builder().bucket(bucketName).object(tempKey).build())
      .build()
  );

  // 2. Delete temp file
  await minioClient.removeObject(
    RemoveObjectArgs.builder().bucket(bucketName).object(tempKey).build()
  );

  // 3. Save official URL to DB
  const officialUrl = `${minioBaseUrl}/${bucketName}/${officialKey}`;
  await service.updateEntityImage(entityId, officialUrl);
};
```

**MinIO Lifecycle Policy**:

```yaml
# MinIO Lifecycle Policy
Rules:
  - Id: AutoDeleteTempFiles
    Status: Enabled
    Expiration:
      Days: 1 # Tự xóa sau 24h
    Filter:
      Prefix: temp/ # Chỉ áp dụng cho temp folder
```

**Lợi ích**:

- ✅ **Tự động cleanup**: File trong temp/ tự xóa sau 24h (không tốn code)
- ✅ **Không cần quét**: MinIO tự xử lý
- ✅ **Hiệu quả**: Không tốn tài nguyên Backend
- ✅ **Đơn giản**: Không cần complex reconciliation logic

**Orphaned Images Detection (Optional - Chỉ khi cần)**:

Nếu vẫn cần detect orphaned images, dùng **sampling approach**:

```typescript
// ✅ Good - Sampling approach (không quét hết)
async function detectOrphanedImagesSample() {
  // Chỉ quét 1% files mỗi lần (sampling)
  const sampleFiles = await listBucketFilesSample({
    prefix: "categories/",
    sampleRate: 0.01, // 1%
    limit: 1000,
  });

  for (const file of sampleFiles) {
    const exists = await checkImageExistsInDB(file.url);
    if (!exists) {
      await markImageForDeletion(file.url, { reason: "orphaned" });
    }
  }

  // Chạy mỗi tuần, mỗi lần quét 1% → 100 tuần mới quét hết
  // Nhưng thường orphaned images sẽ được cleanup qua temp/ policy
}
```

**Recommendation**:

- **Primary**: Dùng Deletion Queue + Lifecycle Policy (temp folder)
- **Secondary**: Sampling approach nếu cần detect orphaned (optional)
- **KHÔNG BAO GIỜ**: Quét toàn bộ bucket để so khớp với DB

### Soft Delete vs Hard Delete

**Current (MVP)**: Hard delete ngay (đơn giản nhưng rủi ro)

**Recommended**: Soft Delete + Cleanup Job

- ✅ **An toàn**: Chỉ xóa sau khi DB commit thành công
- ✅ **Recoverable**: Có thể khôi phục nếu cần
- ✅ **Audit trail**: Biết được lý do xóa
- ✅ **Batch processing**: Xóa hàng loạt hiệu quả

### Cleanup Strategy

#### Orphaned Images

Images không còn được reference bởi bất kỳ entity nào:

**Detection**:

- Scan database for all image URLs
- Compare with MinIO bucket contents
- Identify orphaned files

**Cleanup**:

- Scheduled job (daily/weekly)
- Manual cleanup command
- Log cleanup actions

#### Implementation (Future)

```typescript
// Scheduled cleanup job
async function cleanupOrphanedImages() {
  const allImageUrls = await getAllImageUrlsFromDatabase();
  const bucketFiles = await listAllBucketFiles();

  const orphaned = bucketFiles.filter(
    (file) => !allImageUrls.includes(file.url)
  );

  for (const file of orphaned) {
    await uploadService.deleteImage(file.url);
    logger.info(`Deleted orphaned image: ${file.url}`);
  }
}
```

### Soft Delete vs Hard Delete

**Current**: Hard delete (xóa ngay lập tức)

**Future consideration**: Soft delete

- Move to `deleted/` folder
- Keep for 30 days
- Auto cleanup after period

---

## Caching Strategy

### Browser Caching

#### Cache Headers (Backend)

```
Cache-Control: public, max-age=31536000, immutable
ETag: "{file-hash}"
Last-Modified: {timestamp}
```

**Benefits**:

- Images cached for 1 year
- Immutable = never revalidate
- Reduce server load

### CDN Integration (Future)

#### CloudFront / Cloudflare

- **Edge locations**: Global distribution
- **Auto compression**: WebP conversion
- **Image optimization**: On-the-fly resizing

#### Implementation

```
Original URL: http://minio:9000/bucket/users/uuid.jpg
CDN URL: https://cdn.example.com/users/uuid.jpg?w=300&h=300&format=webp
```

### Image Lazy Loading

#### Current Implementation

```tsx
<img
  src={imageUrl}
  alt="Description"
  loading="lazy" // Native lazy loading
/>
```

#### Future: Intersection Observer

```typescript
const [isVisible, setIsVisible] = useState(false);
const imgRef = useRef<HTMLImageElement>(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    },
    { rootMargin: "50px" }
  );

  if (imgRef.current) {
    observer.observe(imgRef.current);
  }

  return () => observer.disconnect();
}, []);
```

### Preloading Critical Images

```tsx
<link rel="preload" as="image" href={criticalImageUrl} />
```

---

## Performance Optimization

### Image Compression

#### Client-side (Before Upload)

- **Browser native**: Limited control
- **Library**: `browser-image-compression` (future)

#### Server-side (After Upload)

- **JPEG**: Quality 80-85%
- **PNG**: Optimize với pngquant
- **WebP**: Auto-convert

### Responsive Images

#### srcset Attribute

```tsx
<img
  srcSet={`
    ${imageUrl}?w=300 300w,
    ${imageUrl}?w=600 600w,
    ${imageUrl}?w=1200 1200w
  `}
  sizes="(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px"
  src={imageUrl}
  alt="Description"
/>
```

### Thumbnail Generation

#### Backend Service

- Generate thumbnails on upload
- Store in `thumbnails/` folder
- Multiple sizes: 150x150, 300x300, 600x600

#### Usage

```typescript
// Original
const originalUrl = "users/uuid.jpg";

// Thumbnail
const thumbnailUrl = "users/thumbnails/uuid-150x150.jpg";
```

### Image Placeholder

#### Blur Placeholder

```tsx
<img
  src={imageUrl}
  placeholder="blur"
  blurDataURL={base64Thumbnail}
  alt="Description"
/>
```

#### Color Placeholder

```tsx
<div
  style={{
    backgroundColor: dominantColor,
    aspectRatio: "1/1",
  }}
>
  <img src={imageUrl} alt="Description" />
</div>
```

---

## Best Practices

### 1. Always Validate Before Upload

```typescript
// ✅ Good
const result = await validateFile(file);
if (!result.valid) {
  toast.error(result.error);
  return;
}
await uploadService.uploadImage(file, folder);

// ❌ Bad
await uploadService.uploadImage(file, folder); // No validation
```

### 2. Handle Errors Gracefully

```typescript
// ✅ Good
try {
  const imageUrl = await uploadService.uploadImage(file, folder);
  form.setValue("imageUrl", imageUrl);
} catch (error) {
  if (error instanceof Error) {
    form.setError("imageUrl", { message: error.message });
    toast.error(error.message);
  }
}

// ❌ Bad
const imageUrl = await uploadService.uploadImage(file, folder); // No error handling
```

### 3. Clean Up Old Images (Updated)

```typescript
// ✅ Good - Soft delete (mark for deletion)
if (previousImageUrl && newImageUrl !== previousImageUrl) {
  // Mark for deletion AFTER DB update success
  await markImageForDeletion(previousImageUrl, {
    entityType: "user",
    entityId: userId,
    reason: "replaced",
  });
  // Cleanup job will delete it later
}

// ❌ Bad - Hard delete ngay (rủi ro transaction failure)
if (previousImageUrl && newImageUrl !== previousImageUrl) {
  await uploadService.deleteImage(previousImageUrl); // ❌ Rủi ro!
}
```

### 4. Use Appropriate Folder Structure (Updated)

```typescript
// ✅ Good - Flat structure (khuyến nghị)
const folder = "categories"; // Luôn flat, không phân cấp

// ✅ Good - Flat for all entities
const folder = "users";
const folder = "brands";
const folder = "products";

// ❌ Bad - Dùng slug (rủi ro khi slug thay đổi)
const folder = `categories/${parentSlug}`; // ❌ Rủi ro!

// ❌ Bad - Inconsistent
const folder = "user"; // Should be "users"
```

### 5. Provide User Feedback

```typescript
// ✅ Good
const [uploading, setUploading] = useState(false);

const handleUpload = async (file: File) => {
  setUploading(true);
  try {
    const url = await uploadService.uploadImage(file, folder);
    toast.success("Upload thành công");
    form.setValue("imageUrl", url);
  } catch (error) {
    toast.error("Upload thất bại");
  } finally {
    setUploading(false);
  }
};

// ❌ Bad
// No loading state, user doesn't know what's happening
```

### 6. Optimize Image Display

```tsx
// ✅ Good - Lazy loading
<img src={imageUrl} alt="Description" loading="lazy" />

// ✅ Good - Responsive
<img
  srcSet={`${imageUrl}?w=300 300w, ${imageUrl}?w=600 600w`}
  sizes="(max-width: 600px) 300px, 600px"
  src={imageUrl}
  alt="Description"
/>

// ❌ Bad - No optimization
<img src={imageUrl} alt="Description" />
```

---

## Code Patterns

### Pattern 1: Form with Image Upload

```typescript
// Schema allows File | string | null
const imageUrlSchema = z.preprocess(
  (val) => {
    if (typeof val === "string" && val.trim() === "") return null;
    if (val instanceof File) return val;
    return val;
  },
  z
    .union([z.instanceof(File), z.string().url().max(500), z.null()])
    .optional()
    .nullable()
);

// Form component
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { imageUrl: null },
});

// Mutation
const mutation = useAppMutation({
  mutationFn: async (data) => {
    let imageUrl: string | null = null;

    if (data.imageUrl instanceof File) {
      // Upload new file
      imageUrl = await uploadService.uploadImage(data.imageUrl, folder);
    } else if (data.imageUrl === null) {
      // User wants to remove image
      imageUrl = null;
    } else if (typeof data.imageUrl === "string") {
      // Keep existing URL
      imageUrl = data.imageUrl;
    }

    return service.update({ ...data, imageUrl });
  },
});
```

### Pattern 2: ImageUpload Component Usage

```tsx
<Controller
  name="imageUrl"
  control={form.control}
  render={({ field }) => (
    <ImageUpload
      value={field.value}
      previewUrl={entity?.imageUrl || null}
      onChange={(file) => {
        field.onChange(file || null);
        form.trigger("imageUrl");
      }}
      variant="rectangle"
      folder={uploadFolder}
      size="lg"
      disabled={isSubmitting}
    />
  )}
/>
```

### Pattern 3: Cleanup on Update (Updated - Soft Delete)

```typescript
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
      // Cleanup job will delete it later (safe)
    }

    return updated;
  },
});
```

---

## Migration & Future Improvements

### Short-term (1-3 months)

#### 1. Fix Critical Issues (PRIORITY)

- [ ] **Migrate to Flat Folder Structure** - Remove slug-based folders
- [ ] **Implement Soft Delete** - Add deletion queue table
- [ ] **Cleanup Job** - Scheduled job to delete marked images
- [ ] **Fix Naming Convention** - Ensure only UUID, no entity info

#### 2. Async Image Processing

- [ ] Setup message queue (Kafka/RabbitMQ) or Lambda
- [ ] Implement async compression
- [ ] Generate thumbnails asynchronously
- [ ] Multiple sizes: 150x150, 300x300, 600x600

#### 3. Better Error Handling

- [ ] Retry logic with exponential backoff
- [ ] Progress tracking
- [ ] Better error messages

#### 4. Monitoring & Logging

- [ ] Track image upload metrics
- [ ] Monitor cleanup job performance
- [ ] Alert on orphaned images

### Medium-term (3-6 months)

#### 1. Presigned URL Migration

- [ ] Implement Presigned URL API
- [ ] Migrate frontend to use Presigned URL
- [ ] Remove direct upload through Backend
- [ ] Performance testing and optimization

#### 2. CDN Integration

- [ ] Setup CloudFront/Cloudflare
- [ ] Image optimization on-the-fly
- [ ] Global distribution

#### 3. Advanced Image Features

- [ ] Image cropping/editing
- [ ] Multiple image upload
- [ ] Drag & drop reordering

#### 4. Analytics

- [ ] Track image usage
- [ ] Storage usage reports
- [ ] Performance metrics

### Long-term (6-12 months)

#### 1. AI Features

- [ ] Auto-tagging
- [ ] Content moderation
- [ ] Image search

#### 2. Advanced Optimization

- [ ] AVIF format support
- [ ] Responsive image generation
- [ ] Smart compression

#### 3. Object Metadata Enhancement

- [ ] Rich metadata storage (tags, labels)
- [ ] Metadata-based search
- [ ] Analytics on metadata

---

## Quy trình phát triển

### Phase 1: Foundation (Hoàn thành)

- ✅ Upload service với MinIO
- ✅ ImageUpload component
- ✅ Client-side validation
- ✅ Basic error handling
- ✅ Folder organization

### Phase 2: Optimization (Đang phát triển)

- 🔄 Image compression
- 🔄 Thumbnail generation
- 🔄 Better error handling
- 🔄 Cleanup strategy

### Phase 3: Advanced Features (Kế hoạch)

- ⏳ CDN integration
- ⏳ Advanced image features
- ⏳ Analytics
- ⏳ AI features

### Phase 4: Scale (Tương lai)

- ⏳ Multi-region storage
- ⏳ Advanced optimization
- ⏳ Migration to new naming

---

## Tài liệu tham khảo

### Internal Documentation

- [MinIO Guide](../docs/backend/MINIO_GUIDE.md)
- [API Reference](../docs/backend/API_REFERENCE.md)
- [Coding Standards](../docs/CODING_STANDARDS_COMPLETE.md)

### External Resources

- [MinIO Documentation](https://min.io/docs/)
- [WebP Guide](https://developers.google.com/speed/webp)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)

---

## Changelog

### 2024-11-29 (v1.2.0) - Additional Security & Performance Updates

- ✅ **CRITICAL FIX**: Presigned URL verification (stat object + webhook)
- ✅ **CRITICAL FIX**: Date partitioning for flat structure (avoid ops nightmare)
- ✅ **CRITICAL FIX**: Reconciliation strategy (avoid full bucket scan)
- ✅ **CRITICAL FIX**: Fallback image strategy (better UX with async processing)
- ✅ Added temp folder + lifecycle policy approach
- ✅ Added image verification service pattern
- ✅ Added progressive image loading pattern

### 2024-11-29 (v1.1.0) - Architect Review Updates

- ✅ **CRITICAL FIX**: Flat folder structure (removed slug-based hierarchy)
- ✅ **CRITICAL FIX**: UUID-only naming (removed entity info from filename)
- ✅ **CRITICAL FIX**: Soft delete strategy (removed hard delete)
- ✅ **CRITICAL FIX**: Async image processing (removed sync processing)
- ✅ Added Presigned URL flow (recommended approach)
- ✅ Added deletion queue schema
- ✅ Updated best practices with security considerations

### 2024-11-29 (v1.0.0)

- ✅ Initial documentation
- ✅ Folder organization strategy
- ✅ Validation rules
- ✅ Best practices

---

## Liên hệ & Đóng góp

Nếu có câu hỏi hoặc đề xuất cải thiện, vui lòng:

1. Tạo issue trên repository
2. Liên hệ team lead
3. Cập nhật tài liệu này

---

**Last Updated**: 2024-11-29  
**Version**: 1.2.0  
**Maintainer**: Development Team  
**Reviewed By**: Architect Team

---

## ⚠️ Critical Changes Summary

Dựa trên review từ Architect, tài liệu đã được cập nhật với **9 thay đổi quan trọng**:

### Phase 1: Core Architecture (v1.1.0)

1. **Folder Structure**: Chuyển từ hierarchical (slug-based) sang **flat structure** để tránh rủi ro khi slug thay đổi
2. **Naming Convention**: Chỉ dùng **UUID**, không lộ thông tin entity (tránh Information Leakage)
3. **Upload Flow**: Thêm **Presigned URL** approach (best practice) để giảm tải Backend
4. **Delete Strategy**: Chuyển từ hard delete sang **soft delete + cleanup job** để đảm bảo data consistency
5. **Image Processing**: Chuyển từ sync sang **async processing** để tránh blocking Backend

### Phase 2: Security & Performance (v1.2.0)

6. **Presigned URL Verification**: Thêm **stat object + webhook** để verify file thực sự được upload (tránh security gap)
7. **Date Partitioning**: Thêm **date-based folder structure** (YYYY/MM/DD) để tránh ops nightmare khi scale
8. **Reconciliation Strategy**: Thay đổi từ full bucket scan sang **deletion queue + lifecycle policy** (tránh performance suicide)
9. **Fallback Image Strategy**: Thêm **fallback logic** để đảm bảo UX tốt khi async processing chưa hoàn thành

**Lưu ý**: Tất cả các thay đổi này là **CRITICAL** cho scaling và security. Nếu không áp dụng ngay từ đầu, sẽ phải đập đi xây lại khi dữ liệu lớn hoặc gặp security incident.
