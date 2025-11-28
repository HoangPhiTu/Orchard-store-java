# 🚨 Quick Fix: Lỗi ClassNotFoundException Sau Khi Clone

## Vấn Đề

Sau khi clone từ GitHub và chạy `mvn spring-boot:run`, gặp lỗi:
```
Error: Could not find or load main class com.orchard.orchard_store_backend.OrchardStoreBackendApplication
```

## Nguyên Nhân

1. **Annotation Processors chưa chạy**: Lombok và MapStruct cần chạy annotation processors để generate code
2. **Target folder chưa được build đầy đủ**: File .class chưa được tạo ra
3. **Đường dẫn có ký tự đặc biệt**: OneDrive có thể gây vấn đề với đường dẫn

## Giải Pháp Nhanh (3 Bước)

### Bước 1: Clean Project

```bash
cd orchard-store-backend
mvn clean
```

### Bước 2: Compile với Annotation Processors

```bash
# Compile với annotation processors
mvn clean compile

# Hoặc build JAR
mvn clean package
```

### Bước 3: Chạy Application

```bash
# Cách 1: Dùng Maven
mvn spring-boot:run

# Cách 2: Chạy JAR trực tiếp (nếu đã build)
java -jar target/orchard-store-backend-0.0.1-SNAPSHOT.jar
```

## Nếu Vẫn Lỗi

### Giải Pháp 1: Xóa Target và Rebuild Hoàn Toàn

```bash
# Xóa target folder
rmdir /s /q target

# Rebuild
mvn clean install
mvn spring-boot:run
```

### Giải Pháp 2: Kiểm Tra Main Class Đã Được Compile

```bash
# Kiểm tra file .class có tồn tại không
dir target\classes\com\orchard\orchard_store_backend\OrchardStoreBackendApplication.class
```

Nếu file không tồn tại, có nghĩa là compile bị lỗi.

### Giải Pháp 3: Build với Verbose Logging

```bash
# Xem chi tiết quá trình compile
mvn clean compile -X

# Tìm lỗi trong output
```

### Giải Pháp 4: Kiểm Tra IDE Settings (Nếu dùng IntelliJ IDEA)

1. File → Settings → Build, Execution, Deployment → Compiler → Annotation Processors
2. Đảm bảo **"Enable annotation processing"** được bật
3. Rebuild project: **Build → Rebuild Project**

### Giải Pháp 5: Tránh Đường Dẫn Có Ký Tự Đặc Biệt

Nếu project nằm trong `OneDrive\Tài liệu`, có thể gây vấn đề. Nên di chuyển project ra ngoài:

```bash
# Di chuyển project ra C:\
# Ví dụ: C:\Projects\Orchard-store-java-private
```

## Lệnh Tổng Hợp (Copy & Paste)

```bash
# 1. Di chuyển vào thư mục backend
cd orchard-store-backend

# 2. Clean
mvn clean

# 3. Compile
mvn clean compile

# 4. Package (tạo JAR)
mvn clean package

# 5. Chạy
mvn spring-boot:run

# Hoặc chạy JAR:
java -jar target/orchard-store-backend-0.0.1-SNAPSHOT.jar
```

## Kiểm Tra Sau Khi Fix

1. ✅ Main class được compile: `target/classes/com/orchard/orchard_store_backend/OrchardStoreBackendApplication.class` tồn tại
2. ✅ JAR file được tạo: `target/orchard-store-backend-0.0.1-SNAPSHOT.jar` tồn tại
3. ✅ Application chạy được: Backend start tại `http://localhost:8080`

## Lưu Ý Quan Trọng

- **Lần đầu build có thể mất 5-10 phút** để tải dependencies và chạy annotation processors
- **Annotation processors** (Lombok, MapStruct) cần thời gian để generate code
- **Nếu dùng IDE**, đảm bảo annotation processing được bật
- **Tránh đường dẫn có ký tự đặc biệt** (như "Tài liệu" trong OneDrive)

## Troubleshooting

### Lỗi: "annotation processor not found"

```bash
# Xóa .m2 cache và tải lại
rmdir /s /q %USERPROFILE%\.m2\repository\org\projectlombok
rmdir /s /q %USERPROFILE%\.m2\repository\org\mapstruct

# Rebuild
mvn clean install
```

### Lỗi: "Cannot find path"

- Di chuyển project ra ngoài OneDrive
- Hoặc đổi tên thư mục không có ký tự đặc biệt

