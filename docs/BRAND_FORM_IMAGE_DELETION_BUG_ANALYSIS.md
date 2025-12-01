# Brand Form Image Deletion Bug - Analysis Report

## 🚨 **Vấn đề nghiêm trọng**

Bạn đang gặp **critical bug** về image deletion:

1. **Xóa ảnh brand A** → **Ảnh brand B cũng bị xóa trên form**
2. **Cập nhật lại** → **Ảnh đã xóa khỏi MinIO vẫn hiển thị lại**

---

## 🔍 **Phân tích Root Cause**

### **Bug Type: State Pollution & Race Condition**

#### **Vấn đề 1: Shared State Pollution**

```typescript
// ❌ PROBLEM: Global state bị ảnh hưởng bởi nhiều brands
const [latestLogoUrl, setLatestLogoUrl] = useState<string | null | undefined>(
  undefined
);
const [timestampKey, setTimestampKey] = useState(Date.now());
const [brandDataVersion, setBrandDataVersion] = useState(0);
```

**Khi bạn mở brand A, rồi brand B:**

1. Brand A: `setLatestLogoUrl("brand-a-logo.png")`
2. Brand B: `setLatestLogoUrl("brand-b-logo.png")`
3. **Brand A vẫn còn reference đến state cũ!**

#### **Vấn đề 2: useEffect Race Condition**

```typescript
// ❌ PROBLEM: useEffect chạy khi brandData thay đổi
useEffect(() => {
  if (open && isEditing && brandData) {
    form.reset({
      logoUrl: brandData.logoUrl ?? undefined,
    });
    setLatestLogoUrl(undefined); // ❌ Có thể bị overwrite bởi useEffect khác
    setBrandDataVersion((v) => v + 1);
  }
}, [brandData, brandData?.logoUrl, isEditing, open, form]);
```

**Khi switch giữa brands nhanh:**

1. Brand A data load → useEffect A chạy
2. Brand B data load → useEffect B chạy
3. **useEffect A có thể chạy sau useEffect B → overwrite state**

#### **Vấn đề 3: ImageUpload Key Conflict**

```typescript
// ❌ PROBLEM: Key không đủ unique để phân biệt brands
key={`brand-logo-${brand?.id || "new"}-${currentValue}-v${brandDataVersion}`}
```

**Khi brandDataVersion bị share:**

1. Brand A update → `brandDataVersion = 1`
2. Brand B cũng thấy `brandDataVersion = 1` → re-render không đúng

---

## 🔧 **Solutions**

### **Solution 1: Brand-specific State Management**

```typescript
// ✅ FIX: State riêng cho mỗi brand
const [brandState, setBrandState] = useState<{
  [brandId: string]: {
    latestLogoUrl?: string;
    timestampKey: number;
    dataVersion: number;
  };
}>({});

// ✅ Helper functions
const getBrandState = (brandId: string) => {
  return (
    brandState[brandId] || {
      latestLogoUrl: undefined,
      timestampKey: Date.now(),
      dataVersion: 0,
    }
  );
};

const updateBrandState = (
  brandId: string,
  updates: Partial<(typeof brandState)[string]>
) => {
  setBrandState((prev) => ({
    ...prev,
    [brandId]: {
      ...getBrandState(brandId),
      ...updates,
    },
  }));
};
```

### **Solution 2: Brand-isolated useEffect**

```typescript
// ✅ FIX: useEffect riêng cho mỗi brand
useEffect(() => {
  if (open && isEditing && brandData) {
    const currentBrandId = brand.id?.toString() || "new";

    // Reset form với data mới nhất
    form.reset({
      name: brandData.name,
      slug: brandData.slug,
      description: brandData.description ?? undefined,
      logoUrl: brandData.logoUrl ?? undefined,
      country: brandData.country ?? undefined,
      website: brandData.websiteUrl ?? undefined,
      displayOrder: brandData.displayOrder ?? undefined,
      status: brandData.status,
    });

    setIsSlugEditable(false);
    setLogoFile(undefined);

    // ✅ Chỉ clear state của brand hiện tại
    updateBrandState(currentBrandId, {
      latestLogoUrl: undefined,
      dataVersion: getBrandState(currentBrandId).dataVersion + 1,
    });
  } else if (!isEditing) {
    // Reset cho create form
    form.reset(DEFAULT_VALUES);
    setIsSlugEditable(false);
    setLogoFile(undefined);
  }

  // ✅ Reset khi đóng form
  if (!open) {
    form.reset(DEFAULT_VALUES);
    setIsSlugEditable(false);
    setLogoFile(undefined);
  }
}, [brandData?.id, brandData?.logoUrl, isEditing, open, form]); // ✅ Brand ID trong dependency
```

### **Solution 3: Brand-specific ImageUpload Key**

```typescript
// ✅ FIX: Key unique cho mỗi brand
<Controller
  name="logoUrl"
  control={form.control}
  render={({ field }) => {
    const currentBrandId = brand?.id?.toString() || "new";
    const currentBrandState = getBrandState(currentBrandId);

    const effectiveValue = (() => {
      // 1. Ưu tiên logoFile (File mới chọn)
      if (logoFile !== undefined) {
        return logoFile;
      }
      // 2. Sau đó đến latestLogoUrl của brand hiện tại
      if (currentBrandState.latestLogoUrl !== undefined) {
        return typeof currentBrandState.latestLogoUrl === "string"
          ? currentBrandState.latestLogoUrl
          : null;
      }
      // 3. Cuối cùng là field.value hoặc brandData.logoUrl
      if (field.value !== undefined && field.value !== null) {
        return field.value;
      }
      return brandData?.logoUrl || undefined;
    })();

    return (
      <ImageUpload
        key={`brand-logo-${currentBrandId}-${(() => {
          // ✅ Key unique cho brand hiện tại
          if (logoFile !== undefined) {
            return logoFile instanceof File
              ? `file-${logoFile.name}-${logoFile.size}`
              : "null";
          }
          if (currentBrandState.latestLogoUrl !== undefined) {
            return typeof currentBrandState.latestLogoUrl === "string"
              ? currentBrandState.latestLogoUrl
              : "null";
          }
          if (field.value !== undefined && field.value !== null) {
            return typeof field.value === "string" ? field.value : "null";
          }
          return brandData?.logoUrl || "no-logo";
        })()}-v${currentBrandState.dataVersion}-t${
          currentBrandState.timestampKey
        }`}
        variant="rectangle"
        folder={imageManagement.getImageFolder()}
        size="lg"
        value={effectiveValue}
        previewUrl={(() => {
          // ✅ Preview URL với cache-busting
          const baseUrl =
            logoFile === undefined &&
            currentBrandState.latestLogoUrl === undefined &&
            field.value === undefined &&
            brandData?.logoUrl
              ? brandData.logoUrl
              : null;

          return baseUrl
            ? `${baseUrl}?_t=${currentBrandState.timestampKey}`
            : null;
        })()}
        onChange={handleLogoChange}
        disabled={isSubmitting || (isEditing && isLoadingBrand)}
      />
    );
  }}
/>
```

### **Solution 4: Brand-isolated Mutations**

```typescript
// ✅ FIX: Update mutation với brand-specific state
const updateMutation = useAppMutation<...>({
  mutationFn: async ({ id, data }) => {
    // ...existing logic
  },
  onSuccess: (updatedBrand) => {
    if (updatedBrand && brand?.id) {
      const currentBrandId = brand.id.toString();

      // ✅ Chỉ update state của brand hiện tại
      updateBrandState(currentBrandId, {
        latestLogoUrl: updatedBrand.logoUrl ?? undefined,
        timestampKey: Date.now(),
      });

      // ✅ Reset form với data mới
      form.reset({
        ...form.getValues(),
        logoUrl: updatedBrand.logoUrl ?? undefined,
      });

      setLogoFile(undefined);

      // ✅ Refetch chỉ brand hiện tại
      queryClient.invalidateQueries({
        queryKey: ["admin", "brands", "detail", brand.id],
      });
      queryClient.refetchQueries({
        queryKey: ["admin", "brands", "detail", brand.id],
      });
    }
  },
});
```

### **Solution 5: Cleanup State khi Switch Brand**

```typescript
// ✅ FIX: Cleanup state khi chuyển brand
useEffect(() => {
  const currentBrandId = brand?.id?.toString();

  // Cleanup state của brand cũ khi chuyển brand mới
  return () => {
    if (currentBrandId) {
      // Không cleanup state của brand hiện tại
      // Chỉ cleanup khi form đóng hoàn toàn
    }
  };
}, [brand?.id]);

// ✅ Cleanup khi đóng form
useEffect(() => {
  if (!open) {
    // Reset tất cả state về default
    setBrandState({});
    setLogoFile(undefined);
    form.reset(DEFAULT_VALUES);
    setIsSlugEditable(false);
  }
}, [open, form]);
```

---

## 🧪 **Testing Scenarios**

### **Test Case 1: Switch Between Brands**

1. Mở Brand A (có logo)
2. Mở Brand B (có logo khác)
3. **Expected**: Brand A hiển thị logo A, Brand B hiển thị logo B
4. **Actual (Bug)**: Cả hai đều hiển thị logo của brand cuối cùng

### **Test Case 2: Delete Brand A Image**

1. Mở Brand A, xóa logo
2. Mở Brand B
3. **Expected**: Brand A không logo, Brand B vẫn có logo
4. **Actual (Bug)**: Cả hai đều mất logo

### **Test Case 3: Update After Delete**

1. Xóa logo Brand A
2. Cập nhật Brand A (với logo khác)
3. **Expected**: Hiển thị logo mới
4. **Actual (Bug)**: Hiển thị logo đã xóa (vì MinIO đã xóa nhưng frontend vẫn cache)

---

## 🚀 **Implementation Steps**

### **Step 1: Refactor State Management**

```typescript
// Thay thế:
const [latestLogoUrl, setLatestLogoUrl] = useState(...);

// Bằng:
const [brandState, setBrandState] = useState<{[key: string]: BrandState}>({});
```

### **Step 2: Add Helper Functions**

```typescript
const getBrandState = (brandId: string) => {
  /* ... */
};
const updateBrandState = (brandId: string, updates) => {
  /* ... */
};
```

### **Step 3: Update useEffect Dependencies**

```typescript
// Thay thế:
useEffect(() => { /* ... */ }, [brandData, brandData?.logoUrl, ...]);

// Bằng:
useEffect(() => { /* ... */ }, [brandData?.id, brandData?.logoUrl, ...]);
```

### **Step 4: Update ImageUpload Key**

```typescript
// Thay thế:
key={`brand-logo-${brand?.id || "new"}-...`}

// Bằng:
key={`brand-logo-${currentBrandId}-${brandSpecificValue}-...`}
```

### **Step 5: Update Mutations**

```typescript
// Sử dụng updateBrandState thay vì setLatestLogoUrl
updateBrandState(currentBrandId, {
  latestLogoUrl: updatedBrand.logoUrl ?? undefined,
  timestampKey: Date.now(),
});
```

---

## 🔍 **Debug Tools**

### **Add Debug Logging**

```typescript
useEffect(() => {
  console.log("Brand Debug:", {
    currentBrandId: brand?.id,
    brandState,
    brandDataLogo: brandData?.logoUrl,
    logoFile,
    timestamp: Date.now(),
  });
}, [brand?.id, brandState, brandData?.logoUrl, logoFile]);
```

### **Network Tab Debugging**

1. Mở DevTools → Network
2. Disable cache
3. Switch giữa brands
4. Verify API calls và responses

### **React DevTools**

1. Mở React DevTools
2. Select BrandFormSheet component
3. Track state changes khi switch brands

---

## 🎯 **Expected Results After Fix**

### **Before Fix**

- ❌ Switch brand A → B: Cả hai hiển thị logo B
- ❌ Delete logo A: Brand B cũng mất logo
- ❌ Update sau delete: Hiển thị logo đã xóa khỏi MinIO

### **After Fix**

- ✅ Switch brand A → B: Brand A hiển thị logo A, Brand B hiển thị logo B
- ✅ Delete logo A: Chỉ Brand A mất logo, Brand B vẫn có logo
- ✅ Update sau delete: Hiển thị logo mới đúng

---

## 📋 **Quick Fix Implementation**

```typescript
// 1. Thay thế state management
const [brandState, setBrandState] = useState({});

// 2. Thêm helper functions
const getBrandState = (brandId: string) => {
  return brandState[brandId] || {
    latestLogoUrl: undefined,
    timestampKey: Date.now(),
    dataVersion: 0,
  };
};

// 3. Update ImageUpload key
const currentBrandId = brand?.id?.toString() || "new";
const currentBrandState = getBrandState(currentBrandId);

key={`brand-logo-${currentBrandId}-v${currentBrandState.dataVersion}-t${currentBrandState.timestampKey}`}

// 4. Update mutations
updateBrandState(currentBrandId, {
  latestLogoUrl: updatedBrand.logoUrl ?? undefined,
  timestampKey: Date.now(),
});
```

---

## 🚨 **Root Cause Summary**

**Bug này xảy ra vì:**

1. **Global state pollution** - State bị share giữa nhiều brands
2. **Race conditions** - useEffect chạy không theo thứ tự
3. **Key conflicts** - ImageUpload không phân biệt được brands
4. **Cache issues** - Browser cache hiển thị ảnh đã xóa

**Fix bằng cách:**

1. **Brand-specific state** - Mỗi brand có state riêng
2. **Proper isolation** - Ngăn chặn state pollution
3. **Unique keys** - ImageUpload key unique cho mỗi brand
4. **Cache busting** - Force reload image sau khi delete

Implement brand-specific state management sẽ solve hoàn toàn bug này!
