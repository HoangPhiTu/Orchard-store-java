# 🔧 Fix Build Error: ClassNotFoundException

## Vấn Đề

Khi chạy `mvn spring-boot:run`, gặp lỗi:
```
Error: Could not find or load main class com.orchard.orchard_store_backend.OrchardStoreBackendApplication
Caused by: java.lang.ClassNotFoundException: com.orchard.orchard_store_backend.OrchardStoreBackendApplication
```

## Nguyên Nhân

1. **Annotation Processors không chạy đúng**: Lombok và MapStruct cần chạy annotation processors để generate code
2. **Target folder bị lỗi**: Có thể có file .class cũ hoặc không đầy đủ
3. **Thiếu cấu hình mainClass**: Spring Boot plugin không biết class nào là main class

## Giải Pháp

### Bước 1: Clean Project

```bash
# Xóa toàn bộ target folder
mvn clean

# Hoặc xóa thủ công (Windows)
rmdir /s /q target

# Hoặc xóa thủ công (Linux/Mac)
rm -rf target
```

### Bước 2: Rebuild Project

```bash
# Compile lại toàn bộ project
mvn clean compile

# Kiểm tra xem main class đã được compile chưa
# Windows:
dir target\classes\com\orchard\orchard_store_backend\OrchardStoreBackendApplication.class

# Linux/Mac:
ls target/classes/com/orchard/orchard_store_backend/OrchardStoreBackendApplication.class
```

### Bước 3: Chạy Application

```bash
# Chạy Spring Boot
mvn spring-boot:run
```

## Nếu Vẫn Lỗi

### Giải Pháp 1: Đảm Bảo Annotation Processors Chạy

Kiểm tra file `pom.xml` có cấu hình đúng:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </path>
            <path>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.5.5.Final</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

### Giải Pháp 2: Thêm Main Class vào Spring Boot Plugin

File `pom.xml` đã được cập nhật với:

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <mainClass>com.orchard.orchard_store_backend.OrchardStoreBackendApplication</mainClass>
        <excludes>
            <exclude>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </exclude>
        </excludes>
    </configuration>
</plugin>
```

### Giải Pháp 3: Build và Chạy JAR

```bash
# Build JAR file
mvn clean package

# Chạy JAR
java -jar target/orchard-store-backend-0.0.1-SNAPSHOT.jar
```

### Giải Pháp 4: Kiểm Tra IDE Settings (Nếu dùng IntelliJ IDEA)

1. File → Settings → Build, Execution, Deployment → Compiler → Annotation Processors
2. Đảm bảo "Enable annotation processing" được bật
3. Rebuild project: Build → Rebuild Project

### Giải Pháp 5: Kiểm Tra Java Version

```bash
# Kiểm tra Java version (phải là 21)
java -version

# Kiểm tra JAVA_HOME
echo %JAVA_HOME%  # Windows
echo $JAVA_HOME   # Linux/Mac
```

## Quick Fix (Tất Cả Các Bước)

```bash
# 1. Clean
mvn clean

# 2. Compile
mvn clean compile

# 3. Package (tạo JAR)
mvn clean package

# 4. Chạy
mvn spring-boot:run

# Hoặc chạy JAR trực tiếp:
java -jar target/orchard-store-backend-0.0.1-SNAPSHOT.jar
```

## Kiểm Tra Sau Khi Fix

1. ✅ Main class được compile: `target/classes/com/orchard/orchard_store_backend/OrchardStoreBackendApplication.class` tồn tại
2. ✅ JAR file được tạo: `target/orchard-store-backend-0.0.1-SNAPSHOT.jar` tồn tại
3. ✅ Application chạy được: Backend start tại `http://localhost:8080`

## Lưu Ý

- **Lần đầu build có thể mất 5-10 phút** để tải dependencies
- **Annotation processors** (Lombok, MapStruct) cần thời gian để generate code
- **Nếu vẫn lỗi**, thử xóa `.m2/repository` và tải lại dependencies (mất thời gian)

