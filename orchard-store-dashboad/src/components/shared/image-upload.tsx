"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useEffect, useState } from "react";
import { User, X, Upload } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, getImageUrlWithTimestamp } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  /**
   * File mới được chọn (File object) hoặc URL ảnh cũ (string) hoặc null
   */
  value?: File | string | null;

  /**
   * URL ảnh cũ từ database (để hiển thị preview khi chưa chọn file mới)
   */
  previewUrl?: string | null;

  /**
   * Callback được gọi khi chọn file mới hoặc xóa ảnh
   * @param value File object (nếu chọn ảnh mới) hoặc null (nếu xóa)
   */
  onChange: (value: File | null) => void;

  /**
   * Có disable component không
   */
  disabled?: boolean;

  /**
   * Kích thước avatar (default: "lg")
   */
  size?: "sm" | "md" | "lg" | "xl";

  /**
   * Variant hiển thị: "circle" (Avatar tròn) hoặc "rectangle" (Hình chữ nhật/vuông)
   */
  variant?: "circle" | "rectangle";

  /**
   * Folder để upload (dùng cho label/helper text)
   */
  folder?: string;

  /**
   * Class name tùy chỉnh
   */
  className?: string;

  /**
   * Cache busting key - thay đổi để force reload ảnh
   * Dùng khi cần force browser reload ảnh mới (ví dụ: sau khi upload)
   */
  cacheKey?: string | number;
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
  xl: "h-40 w-40",
};

const rectangleSizeClasses = {
  sm: "h-16 w-24",
  md: "h-24 w-36",
  lg: "h-32 w-48",
  xl: "h-40 w-60",
};

export function ImageUpload({
  value,
  previewUrl,
  onChange,
  disabled = false,
  size = "lg",
  variant = "circle",
  folder,
  className,
  cacheKey,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Tạo preview URL từ File object (dùng FileReader để tạo data URL thay vì blob URL)
  // Data URL không bị CSP chặn và an toàn hơn
  useEffect(() => {
    // Cleanup object URL cũ trước khi tạo mới
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setFilePreview(dataUrl);
      };
      reader.onerror = () => {
        toast.error("Không thể đọc file ảnh. Vui lòng thử lại.");
        setFilePreview(null);
      };
      reader.readAsDataURL(value);
    } else if (value === null) {
      // Clear preview khi value = null (user đã xóa)
      setFilePreview(null);
    }

    // Cleanup: Revoke object URL khi component unmount hoặc value thay đổi
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [value]);

  /**
   * Mở file dialog để chọn ảnh
   */
  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  /**
   * Xử lý khi chọn file
   * KHÔNG upload ngay, chỉ trả về File object
   */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Quick synchronous validation first
    const { validateFileSync, validateFile } = await import(
      "@/lib/validation/file-validation"
    );

    const syncResult = validateFileSync(file);
    if (!syncResult.valid) {
      toast.error(syncResult.error || "File không hợp lệ");
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Full validation with magic bytes (async)
    const fullResult = await validateFile(file, {
      validateContent: true,
    });

    if (!fullResult.valid) {
      toast.error(fullResult.error || "File không hợp lệ");
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Reset input để có thể chọn lại file cùng tên
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Chỉ trả về File object, KHÔNG upload
    onChange(file);
  };

  /**
   * Xóa ảnh
   */
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn trigger click vào avatar
    if (disabled) return;

    // Clear file preview state
    setFilePreview(null);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Notify parent that image is removed
    onChange(null);
  };

  // Logic tính toán effectivePreview
  const effectivePreview = (() => {
    // Nếu value === null (user đã xóa), không hiển thị previewUrl nữa
    if (value === null) {
      return null;
    }

    if (value instanceof File) {
      return filePreview; // File mới chọn thì giữ nguyên (blob/data url)
    }

    if (typeof value === "string" && value.trim() !== "") {
      return value; // URL từ server
    }

    // Chỉ dùng previewUrl khi value là undefined (chưa có giá trị)
    if (
      value === undefined &&
      previewUrl &&
      typeof previewUrl === "string" &&
      previewUrl.trim() !== ""
    ) {
      return previewUrl;
    }

    return null;
  })();

  // 👇 Tính URL hiển thị (QUAN TRỌNG)
  // File (blob/data URL) thì giữ nguyên, URL string thì áp dụng timestamp để tránh cache
  const displayUrl = (() => {
    if (value instanceof File) {
      return effectivePreview; // File preview (blob/data URL)
    }

    if (typeof effectivePreview === "string" && effectivePreview) {
      // ✅ Sử dụng cacheKey nếu có (từ timestampKey) để force reload ảnh mới
      // Nếu không có cacheKey, dùng timestamp hiện tại
      const timestamp = cacheKey || Date.now();
      return getImageUrlWithTimestamp(effectivePreview, timestamp);
    }

    return null;
  })();

  const sizeClass =
    variant === "rectangle" ? rectangleSizeClasses[size] : sizeClasses[size];
  const hasImage = Boolean(effectivePreview);

  // Rectangle variant
  if (variant === "rectangle") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <div className="relative">
          <div
            className={cn(
              sizeClass,
              "relative cursor-pointer overflow-hidden rounded-lg border-2 border-border bg-card transition-all hover:border-primary/50 hover:ring-1 hover:ring-primary/20 hover:ring-offset-1",
              disabled && "cursor-not-allowed opacity-50"
            )}
            onClick={handleClick}
          >
            {hasImage && displayUrl ? (
              <img
                key={`${displayUrl}-${cacheKey || Date.now()}`} // 👈 QUAN TRỌNG: Key thay đổi khi cacheKey thay đổi -> React vẽ lại ảnh
                src={displayUrl || ""} // 👈 QUAN TRỌNG: Src có timestamp -> Trình duyệt tải ảnh mới
                alt="Logo"
                className="h-full w-full object-contain p-2"
                loading="eager" // ✅ Force load ngay lập tức, không lazy load
                onError={(e) => {
                  // Fallback nếu ảnh timestamp lỗi
                  if (
                    effectivePreview &&
                    e.currentTarget.src !== effectivePreview
                  ) {
                    e.currentTarget.src = effectivePreview;
                  } else {
                    toast.error(
                      "Không thể tải ảnh xem trước. Vui lòng chọn ảnh khác."
                    );
                  }
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            {/* Remove Button */}
            {hasImage && !disabled && (
              <Button
                type="button"
                variant="default"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Xóa ảnh</span>
              </Button>
            )}
          </div>
        </div>

        {/* Helper text */}
        <p className="text-xs text-center text-muted-foreground">
          Nhấp vào ô để chọn hình ảnh
          {folder ? ` (${folder})` : ""}
        </p>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  // Circle variant (original Avatar)
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Avatar với ảnh hoặc placeholder */}
      <div className="relative">
        <Avatar
          className={cn(
            sizeClass,
            "cursor-pointer transition-all hover:ring-2 hover:ring-primary/30 hover:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={handleClick}
        >
          {hasImage && displayUrl ? (
            <AvatarImage
              key={`${displayUrl}-${cacheKey || Date.now()}`} // 👈 QUAN TRỌNG: Key thay đổi khi cacheKey thay đổi -> React vẽ lại ảnh
              src={displayUrl || ""} // 👈 QUAN TRỌNG: Src có timestamp -> Trình duyệt tải ảnh mới
              alt="Avatar"
              onError={(e) => {
                // Fallback nếu ảnh timestamp lỗi
                if (
                  effectivePreview &&
                  e.currentTarget.src !== effectivePreview
                ) {
                  e.currentTarget.src = effectivePreview;
                } else {
                  toast.error(
                    "Không thể tải ảnh xem trước. Vui lòng chọn ảnh khác."
                  );
                }
              }}
            />
          ) : (
            <AvatarFallback className="bg-linear-to-br from-primary/20 to-violet-500/20">
              <User className="h-8 w-8 text-primary" />
            </AvatarFallback>
          )}
        </Avatar>

        {/* Remove Button (chỉ hiển thị khi có ảnh) */}
        {hasImage && !disabled && (
          <Button
            type="button"
            variant="default"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Xóa ảnh</span>
          </Button>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-center text-muted-foreground">
        Nhấp vào avatar để chọn hình ảnh
        {folder ? ` (${folder})` : ""}
      </p>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
