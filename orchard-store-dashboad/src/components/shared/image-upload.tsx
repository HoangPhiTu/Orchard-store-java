"use client";

import { useState, useRef } from "react";
import { User, X, Loader2, Upload } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import { toast } from "sonner";

interface ImageUploadProps {
  /**
   * URL ảnh hiện tại (nếu có)
   */
  value?: string | null;

  /**
   * Callback được gọi khi upload thành công hoặc xóa ảnh
   * @param url URL ảnh mới (hoặc null nếu xóa)
   */
  onChange: (url: string | null) => void;

  /**
   * Có disable component không
   */
  disabled?: boolean;

  /**
   * Tên folder trong bucket (default: "others")
   */
  folder?: string;

  /**
   * Kích thước avatar (default: "lg")
   */
  size?: "sm" | "md" | "lg" | "xl";

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

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  folder = "others",
  size = "lg",
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Mở file dialog để chọn ảnh
   */
  const handleClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  /**
   * Xử lý khi chọn file
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Upload file
    setIsUploading(true);
    try {
      const imageUrl = await uploadService.uploadImage(file, folder);
      onChange(imageUrl);
      toast.success("Upload ảnh thành công");
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể upload ảnh. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Xóa ảnh
   */
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn trigger click vào avatar
    if (disabled || isUploading) return;
    onChange(null);
    toast.success("Đã xóa ảnh");
  };

  const sizeClass = sizeClasses[size];
  const hasImage = Boolean(value);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Avatar với ảnh hoặc placeholder */}
      <div className="relative">
        <Avatar
          className={cn(
            sizeClass,
            "cursor-pointer transition-all hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50",
            isUploading && "cursor-wait"
          )}
          onClick={handleClick}
        >
          {hasImage && !isUploading ? (
            <AvatarImage src={value || undefined} alt="Avatar" />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-violet-100">
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              ) : (
                <User className="h-8 w-8 text-indigo-600" />
              )}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/50 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}

        {/* Remove Button (chỉ hiển thị khi có ảnh và không đang upload) */}
        {hasImage && !isUploading && !disabled && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full shadow-md"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Xóa ảnh</span>
          </Button>
        )}
      </div>

      {/* Upload Button (optional - có thể ẩn nếu chỉ click vào avatar) */}
      {!hasImage && !isUploading && (
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
        disabled={disabled || isUploading}
      />
    </div>
  );
}

