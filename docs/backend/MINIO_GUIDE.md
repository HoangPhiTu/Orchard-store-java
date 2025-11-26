# MinIO Setup & Image Upload Guide

## 📋 Mục Lục

1. [Quick Start (5 phút)](#quick-start-5-phút)
2. [Cài Đặt MinIO](#cài-đặt-minio)
3. [Cấu Hình Bucket](#cấu-hình-bucket)
4. [Backend Configuration](#backend-configuration)
5. [Frontend Integration](#frontend-integration)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)
8. [Security & Best Practices](#security--best-practices)

---

## Quick Start (5 phút)

### 1. Cài Đặt MinIO (Docker - Khuyến nghị)

```powershell
# Windows PowerShell
docker run -d -p 9000:9000 -p 9001:9001 -v D:\minio-data:/data -e "MINIO_ROOT_USER=minioadmin" -e "MINIO_ROOT_PASSWORD=minioadmin" minio/minio server /data --console-address ":9001"
```

### 2. Truy Cập Web UI

Mở trình duyệt: **http://localhost:9001**

- Username: `minioadmin`
- Password: `minioadmin`

### 3. Tạo Bucket

1. Click **"Buckets"** → **"Create Bucket"**
2. Tên: `orchard-bucket`
3. Click **"Create Bucket"**

### 4. Cấu Hình Public Access

1. Click vào bucket **`orchard-bucket`**
2. Vào tab **"Access Policy"**
3. Paste JSON sau:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": ["*"] },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::orchard-bucket/*"]
    }
  ]
}
```

4. Click **"Save"**

### 5. Test Upload

Khởi động Spring Boot và test API:

```bash
POST http://localhost:8080/api/admin/upload
Authorization: Bearer <your-token>
Content-Type: multipart/form-data

file: [chọn ảnh]
folder: users
```

### ✅ Xong!

Xem ảnh tại: `http://127.0.0.1:9000/orchard-bucket/users/[tên-file]`

---

## Cài Đặt MinIO

### Windows (PowerShell)

#### Cách 1: Sử dụng Docker (Khuyến nghị)

```powershell
# Pull MinIO image
docker pull minio/minio

# Chạy MinIO container
docker run -d `
  -p 9000:9000 `
  -p 9001:9001 `
  -v D:\minio-data:/data `
  -e "MINIO_ROOT_USER=minioadmin" `
  -e "MINIO_ROOT_PASSWORD=minioadmin" `
  minio/minio server /data --console-address ":9001"
```

#### Cách 2: Tải Binary

1. Truy cập: https://min.io/download
2. Tải **MinIO Server** cho Windows
3. Giải nén và chạy:

```powershell
# Di chuyển vào thư mục MinIO
cd C:\path\to\minio

# Chạy MinIO server
.\minio.exe server D:\minio-data --console-address ":9001"
```

### Linux/Mac

```bash
# Download MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio

# Chạy MinIO
./minio server ~/minio-data --console-address ":9001"
```

---

## Cấu Hình Bucket

### Bước 1: Tạo Bucket

1. Vào MinIO Web UI: http://localhost:9001
2. Click vào **"Buckets"** ở sidebar bên trái
3. Click nút **"Create Bucket"** (màu xanh)
4. Đặt tên: `orchard-bucket`
5. Click **"Create Bucket"**

### Bước 2: Cấu Hình Bucket Policy (Public Read)

#### Cách 1: Sử dụng MinIO Web UI (Khuyến nghị)

1. Click vào bucket **`orchard-bucket`**
2. Vào tab **"Access Policy"** hoặc **"Summary"**
3. Tìm phần **"Access Policy"** hoặc **"Bucket Policy"**
4. Click **"Add Access Policy"** hoặc **"Edit Policy"**
5. Chọn **"Public"** hoặc **"Download Only"**
6. Click **"Save"**

#### Cách 2: Set Policy thủ công (JSON)

1. Click vào bucket **`orchard-bucket`**
2. Vào tab **"Access Policy"**
3. Click **"Add Access Policy"** hoặc **"Edit Policy"**
4. Paste JSON sau:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::orchard-bucket/*"]
    }
  ]
}
```

5. Click **"Save"**

> ✅ Bây giờ tất cả file trong bucket có thể truy cập công khai (chỉ đọc)

### Bước 3: Cấu Hình CORS (Nếu cần)

Nếu frontend vẫn không load được ảnh (CORS error):

1. Vào bucket **`orchard-bucket`** trong MinIO Console
2. Click tab **"CORS"** hoặc **"Access Rules"**
3. Thêm CORS Rule:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "http://127.0.0.1:3000"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

4. Click **"Save"**

---

## Backend Configuration

### 1. Dependencies (pom.xml)

Đảm bảo có các dependencies sau:

```xml
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-s3</artifactId>
    <version>1.12.x</version>
</dependency>
<dependency>
    <groupId>javax.xml.bind</groupId>
    <artifactId>jaxb-api</artifactId>
    <version>2.3.1</version>
</dependency>
```

### 2. Application Properties

Thêm vào `application.properties`:

```properties
# MinIO Configuration
cloud.aws.s3.endpoint=http://127.0.0.1:9000
cloud.aws.credentials.access-key=minioadmin
cloud.aws.credentials.secret-key=minioadmin
cloud.aws.region.static=us-east-1
cloud.aws.s3.bucket-name=orchard-bucket
```

### 3. S3Config.java

File: `src/main/java/com/orchard/orchard_store_backend/config/S3Config.java`

```java
@Configuration
public class S3Config {
    @Value("${cloud.aws.s3.endpoint}")
    private String s3Endpoint;

    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${cloud.aws.region.static}")
    private String region;

    @Bean
    public AmazonS3 amazonS3() {
        AWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
        AwsClientBuilder.EndpointConfiguration endpointConfiguration =
                new AwsClientBuilder.EndpointConfiguration(s3Endpoint, region);

        return AmazonS3ClientBuilder
                .standard()
                .withEndpointConfiguration(endpointConfiguration)
                .withPathStyleAccessEnabled(true) // ⚠️ QUAN TRỌNG: Bắt buộc cho MinIO
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .build();
    }
}
```

**Key Points**:

- `withPathStyleAccessEnabled(true)` - **Bắt buộc** cho MinIO
- Endpoint configuration với custom endpoint
- Basic credentials (access-key, secret-key)

### 4. S3ImageService.java

File: `src/main/java/com/orchard/orchard_store_backend/modules/catalog/product/service/S3ImageService.java`

**Methods nổi bật**:

| Method                                                       | Mô tả                                                                                                                                                                                                                                           |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uploadImage(MultipartFile file, String folderName)`         | Validate file → tạo tên mới (UUID + extension) → upload với ACL PublicRead → trả về URL đầy đủ.                                                                                                                                                 |
| `uploadImages(List<MultipartFile> files, String folderName)` | Upload nhiều file liên tục (dừng nếu có lỗi).                                                                                                                                                                                                   |
| `deleteImage(String imageUrl)`                               | Nhận **full URL** (vd: `http://127.0.0.1:9000/orchard-bucket/users/a.jpg`), tự động cắt phần sau `bucket-name/` để lấy object key (`users/a.jpg`) rồi gọi `amazonS3.deleteObject`. Nếu URL rỗng/sai định dạng → chỉ log warning, không ném lỗi. |

> Từ phiên bản `0.3.0`: `deleteImage` không trả về boolean nữa. Service chịu trách nhiệm tự log và bỏ qua khi không xóa được để tránh ảnh hưởng tới luồng nghiệp vụ chính (ví dụ update user).

**URL Format**:

```
http://127.0.0.1:9000/orchard-bucket/{folderName}/{UUID}_{originalFilename}
```

---

## Image Lifecycle Automation

> **Mục tiêu:** Không để lại file rác khi user đổi hoặc xóa avatar.

### 1. Backend hooks

- `UserAdminServiceImpl.updateUser`:
  - So sánh `oldAvatarUrl` vs `request.getAvatarUrl()`.
  - Nếu khác (bao gồm trường hợp user xóa avatar) → gọi `imageUploadService.deleteImage(oldAvatarUrl)` trước khi lưu URL mới.
- `UserAdminServiceImpl.deleteUser`:
  - Sau khi `userRepository.delete(user)` → nếu user có avatar → gọi `deleteImage`.
- `UploadController.DELETE /api/admin/upload`:
  - Cho phép admin cleanup thủ công khi cần.

### 2. Frontend hooks

- `ImageUpload` component hoạt động theo client-first:
  1. Preview tức thời bằng FileReader (base64) để tránh CSP.
  2. Chỉ upload lên backend trong `onSubmit`.
  3. Nếu cập nhật chính người đang đăng nhập → `auth-store` và React Query cache `["currentUser"]` được đồng bộ nên header/profile update realtime.

Kết quả: mỗi user chỉ tồn tại đúng **01** file avatar trên MinIO; thao tác delete user cũng dọn ảnh ngay.

---

## Frontend Integration

### 1. Next.js Configuration

File: `next.config.mjs`

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
    ],
  },
};
```

### 2. CSP Configuration

File: `src/app/layout.tsx` và `src/middleware.ts`

Thêm vào `img-src`:

```
img-src 'self' data: blob: http://127.0.0.1:9000 http://localhost:9000
```

### 3. upload.service.ts

File: `src/services/upload.service.ts`

```typescript
import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";

export const uploadService = {
  uploadImage: async (
    file: File,
    folder: string = "others"
  ): Promise<string> => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File phải là ảnh (image/*)");
    }

    // Validate file size (tối đa 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("Kích thước file không được vượt quá 5MB");
    }

    // Create FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    // Call API
    const response = await http.post<ApiResponse<string>>(
      API_ROUTES.UPLOAD,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.data;
  },
};
```

### 4. ImageUpload Component

File: `src/components/shared/image-upload.tsx`

**Props**:

```typescript
interface ImageUploadProps {
  value?: File | string | null; // File mới hoặc URL cũ
  previewUrl?: string | null; // URL ảnh cũ từ DB
  onChange: (value: File | null) => void; // Trả về File object
  disabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}
```

**Features**:

- Avatar tròn với ảnh hoặc placeholder
- Preview ngay khi chọn file (dùng FileReader để tạo data URL)
- Nút X để xóa ảnh
- Error handling với toast
- Client-first upload flow (chỉ upload khi submit form)

### 5. Tích Hợp Vào User Form

File: `src/components/features/user/user-form-sheet.tsx`

```tsx
<Controller
  name="avatarUrl"
  control={form.control}
  render={({ field }) => (
    <ImageUpload
      value={field.value}
      previewUrl={user?.avatarUrl || null}
      onChange={(file) => {
        field.onChange(file || null);
        form.trigger("avatarUrl");
      }}
      size="lg"
      disabled={isPending}
    />
  )}
/>
```

**Submit Logic**:

```typescript
const onSubmit = async (data: UserFormData) => {
  let finalAvatarUrl: string | null = null;

  // Upload ảnh nếu có File mới
  if (data.avatarUrl instanceof File) {
    finalAvatarUrl = await uploadService.uploadImage(data.avatarUrl, "users");
  } else if (typeof data.avatarUrl === "string") {
    finalAvatarUrl = data.avatarUrl; // Giữ nguyên URL cũ
  } else {
    finalAvatarUrl = null;
  }

  // Submit với URL cuối cùng
  const finalData = { ...data, avatarUrl: finalAvatarUrl };
  // ... submit
};
```

---

## API Documentation

### POST /api/admin/upload

**Endpoint**: `POST /api/admin/upload`

**Authentication**: Required (Bearer Token)

**Authorization**: `ADMIN` or `STAFF` role

**Request**:

```http
POST /api/admin/upload HTTP/1.1
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: [MultipartFile]
folder: users (optional, default: "others")
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | MultipartFile | ✅ Yes | File ảnh cần upload |
| `folder` | String | ❌ No | Tên folder trong bucket (default: "others") |

**Response (200 OK)**:

```json
{
  "status": 200,
  "message": "Upload ảnh thành công",
  "data": "http://127.0.0.1:9000/orchard-bucket/users/uuid_filename.jpg",
  "timestamp": "2025-11-23T10:30:00"
}
```

**Response (400 Bad Request)**:

```json
{
  "status": 400,
  "message": "File không được để trống",
  "timestamp": "2025-11-23T10:30:00"
}
```

**Response (500 Internal Server Error)**:

```json
{
  "status": 500,
  "message": "Không thể upload ảnh: [error message]",
  "timestamp": "2025-11-23T10:30:00"
}
```

**Validation Rules**:

- File type: Chỉ chấp nhận `image/*` (jpg, png, gif, webp, etc.)
- File size: Tối đa 5MB (có thể config trong `application.properties`)
- Folder name: Không được chứa ký tự đặc biệt

**Cấu Trúc Thư Mục**:

```
orchard-bucket/
├── users/          # Avatar của users
│   ├── uuid1_avatar.jpg
│   └── uuid2_avatar.png
├── products/       # Ảnh sản phẩm
│   ├── uuid3_product.jpg
│   └── uuid4_product.png
└── others/         # Các file khác
    └── ...
```

---

### DELETE /api/admin/upload

**Endpoint**: `DELETE /api/admin/upload?imageUrl=<full_url>`

**Authentication**: Required (Bearer Token)  
**Authorization**: `ADMIN` hoặc `STAFF`

| Parameter  | Type   | Required | Description                                                                            |
| ---------- | ------ | -------- | -------------------------------------------------------------------------------------- |
| `imageUrl` | String | ✅ Yes   | Full URL trả về từ API upload (ví dụ `http://127.0.0.1:9000/orchard-bucket/users/...`) |

**Response (200 OK)**:

```json
{
  "status": 200,
  "message": "Đã xử lý yêu cầu xóa ảnh",
  "timestamp": "2025-11-24T08:00:00"
}
```

> Lưu ý: Endpoint này “fire-and-forget” – luôn trả 200 để tránh chặn luồng chính. Log backend sẽ ghi lại nếu URL không hợp lệ hoặc ảnh không tồn tại.

---

## Troubleshooting

### ❌ Lỗi: "Connection refused" hoặc "Cannot connect to MinIO"

**Nguyên nhân**: MinIO server chưa chạy

**Giải pháp**:

1. Kiểm tra MinIO có đang chạy không:

   ```powershell
   # Windows
   netstat -an | findstr "9000"

   # Linux/Mac
   lsof -i :9000
   ```

2. Khởi động lại MinIO server

---

### ❌ Lỗi: "Bucket does not exist"

**Nguyên nhân**: Bucket `orchard-bucket` chưa được tạo

**Giải pháp**:

1. Vào MinIO Web UI: http://localhost:9001
2. Tạo bucket `orchard-bucket` theo hướng dẫn ở [Cấu Hình Bucket](#cấu-hình-bucket)

---

### ❌ Lỗi: "Access Denied" khi truy cập ảnh

**Nguyên nhân**: Bucket Policy chưa được cấu hình đúng

**Giải pháp**:

1. Vào MinIO Web UI
2. Click vào bucket `orchard-bucket`
3. Cấu hình lại Bucket Policy theo [Cấu Hình Bucket](#cấu-hình-bucket)

**Kiểm tra nhanh**:

- Mở URL ảnh trực tiếp trong trình duyệt:
  ```
  http://127.0.0.1:9000/orchard-bucket/users/[tên-file]
  ```
- Nếu không mở được → Bucket chưa public
- Nếu mở được trong trình duyệt nhưng không hiển thị trong app → CSP/CORS issue

---

### ❌ Lỗi: "Invalid credentials"

**Nguyên nhân**: Access Key hoặc Secret Key không đúng

**Giải pháp**:

1. Kiểm tra lại `application.properties`:
   ```properties
   cloud.aws.credentials.access-key=minioadmin
   cloud.aws.credentials.secret-key=minioadmin
   ```
2. Nếu bạn đã đổi password MinIO, cập nhật lại trong `application.properties`

---

### ❌ Lỗi: "Path-style access" không hoạt động

**Nguyên nhân**: MinIO yêu cầu path-style access

**Giải pháp**:

- Đảm bảo trong `S3Config.java` có dòng:
  ```java
  .withPathStyleAccessEnabled(true)
  ```

---

### ❌ Lỗi: Ảnh không hiển thị trên frontend

**Nguyên nhân**:

- Bucket Access Policy là PRIVATE
- CSP blocking
- CORS issue

**Giải pháp**:

1. **Kiểm tra Bucket Policy**:

   - Vào MinIO Console → `orchard-bucket` → Access Policy
   - Đảm bảo là **PUBLIC** hoặc **DOWNLOAD**

2. **Kiểm tra CSP**:

   - Đảm bảo `http://127.0.0.1:9000` và `http://localhost:9000` có trong `img-src`
   - Xem [Frontend Integration](#frontend-integration)

3. **Kiểm tra CORS**:

   - Cấu hình CORS trong MinIO Console
   - Xem [Cấu Hình Bucket](#cấu-hình-bucket)

4. **Kiểm tra Console Logs**:

   - Mở Developer Tools (F12) → Console
   - Xem có lỗi CSP violation, CORS error, hoặc Network error (404, 403)

5. **Test URL trực tiếp**:
   - Copy URL ảnh từ backend response
   - Paste vào trình duyệt
   - Nếu ảnh hiển thị → URL đúng, vấn đề là CSP/CORS
   - Nếu lỗi "Access Denied" → Bucket chưa public

---

### ❌ Lỗi: "File too large"

**Nguyên nhân**: File vượt quá 5MB

**Giải pháp**:

- Giảm kích thước ảnh
- Hoặc tăng limit trong `application.properties`:
  ```properties
  spring.servlet.multipart.max-file-size=10MB
  spring.servlet.multipart.max-request-size=10MB
  ```

---

### ❌ Lỗi: "Invalid file type"

**Nguyên nhân**: File không phải ảnh

**Giải pháp**:

- Chỉ upload file ảnh (jpg, png, gif, webp, etc.)

---

## Security & Best Practices

### Development

- Có thể dùng PUBLIC access cho bucket
- Credentials mặc định (`minioadmin/minioadmin`) là OK cho local development

### Production

#### 1. Thay Đổi Credentials

1. Vào MinIO Web UI: http://localhost:9001
2. Click **"Settings"** → **"Identity"** → **"Users"**
3. Tạo user mới hoặc đổi password cho `minioadmin`
4. Cập nhật `application.properties`:
   ```properties
   cloud.aws.credentials.access-key=YOUR_NEW_ACCESS_KEY
   cloud.aws.credentials.secret-key=YOUR_NEW_SECRET_KEY
   ```

#### 2. HTTPS

- Cấu hình SSL/TLS cho MinIO
- Cập nhật endpoint trong `application.properties`:
  ```properties
  cloud.aws.s3.endpoint=https://your-minio-domain.com
  ```

#### 3. Bucket Policy Chi Tiết

Thay vì PUBLIC, nên dùng policy chỉ cho phép đọc từ domain cụ thể:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::orchard-bucket/*"],
      "Condition": {
        "StringLike": {
          "aws:Referer": [
            "https://your-domain.com/*",
            "https://*.your-domain.com/*"
          ]
        }
      }
    }
  ]
}
```

#### 4. File Naming

- Backend tự động tạo tên file duy nhất: `{UUID}_{originalFilename}`
- Tránh conflict và đảm bảo unique

#### 5. File Validation

- Backend validate file type và size
- Frontend cũng validate trước khi upload
- Chỉ chấp nhận `image/*`

---

## ✅ Checklist Setup

- [ ] MinIO server đã được cài đặt và chạy
- [ ] Truy cập được MinIO Web UI (http://localhost:9001)
- [ ] Đăng nhập thành công với `minioadmin/minioadmin`
- [ ] Đã tạo bucket `orchard-bucket`
- [ ] Đã cấu hình Bucket Policy (Public Read)
- [ ] Backend có thể kết nối đến MinIO
- [ ] Test upload ảnh thành công qua API
- [ ] Có thể truy cập ảnh qua URL công khai
- [ ] Frontend ImageUpload component hoạt động
- [ ] User Form có thể upload avatar
- [ ] Ảnh hiển thị được trong form và profile
- [ ] CSP và CORS đã được cấu hình đúng

---

## 📚 References

- **MinIO Official Docs**: https://min.io/docs/
- **AWS S3 Java SDK**: https://docs.aws.amazon.com/sdk-for-java/
- **Next.js Image Optimization**: https://nextjs.org/docs/app/api-reference/components/image

---

**Last Updated**: 2025-11-23  
**Version**: 1.0.0
