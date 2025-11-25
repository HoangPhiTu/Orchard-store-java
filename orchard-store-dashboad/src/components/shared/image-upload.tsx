"use client";

import { useRef, useEffect, useState } from "react";
import { User, X, Upload } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File phải là ảnh (image/*)");
      return;
    }

    // Validate file size (tối đa 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Kích thước file không được vượt quá 5MB");
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
    onChange(null);
  };

  const effectivePreview = (() => {
    if (value instanceof File) {
      return filePreview;
    }
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
    if (
      previewUrl &&
      typeof previewUrl === "string" &&
      previewUrl.trim() !== ""
    ) {
      return previewUrl;
    }
    return null;
  })();

  const sizeClass = variant === "rectangle" ? rectangleSizeClasses[size] : sizeClasses[size];
  const hasImage = Boolean(effectivePreview);

  // Rectangle variant
  if (variant === "rectangle") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <div className="relative">
          <div
            className={cn(
              sizeClass,
              "relative cursor-pointer overflow-hidden rounded-lg border-2 border-slate-200 bg-white transition-all hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2",
              disabled && "cursor-not-allowed opacity-50"
            )}
            onClick={handleClick}
          >
            {hasImage && effectivePreview ? (
              <img
                key={effectivePreview}
                src={effectivePreview}
                alt="Logo"
                className="h-full w-full object-contain p-2"
                onError={() => {
                  toast.error(
                    "Không thể tải ảnh xem trước. Vui lòng chọn ảnh khác."
                  );
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-50">
                <Upload className="h-8 w-8 text-slate-400" />
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

        {/* Upload Button */}
        {!hasImage && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={disabled}
            className="w-full text-sm"
          >
            <Upload className="mr-2 h-4 w-4" />
            Chọn logo {folder && `(${folder})`}
          </Button>
        )}

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
            "cursor-pointer transition-all hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={handleClick}
        >
          {hasImage && effectivePreview ? (
            <AvatarImage
              key={effectivePreview} // Force re-render when preview changes
              src={effectivePreview}
              alt="Avatar"
              onError={() => {
                toast.error(
                  "Không thể tải ảnh xem trước. Vui lòng chọn ảnh khác."
                );
              }}
            />
          ) : (
            <AvatarFallback className="bg-linear-to-br from-indigo-100 to-violet-100">
              <User className="h-8 w-8 text-indigo-600" />
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

      {/* Upload Button (optional - có thể ẩn nếu chỉ click vào avatar) */}
      {!hasImage && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled}
          className="text-sm"
        >
          <Upload className="mr-2 h-4 w-4" />
          Chọn ảnh
        </Button>
      )}

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
