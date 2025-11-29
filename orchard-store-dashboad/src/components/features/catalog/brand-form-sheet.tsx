"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Edit2, X } from "lucide-react";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { FormField } from "@/components/ui/form-field";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/shared/image-upload";
import { uploadService } from "@/services/upload.service";
import { useBrand } from "@/hooks/use-brands";
import { useAuthStore } from "@/stores/auth-store";
import { brandService } from "@/services/brand.service";
import type { Brand, BrandFormData } from "@/types/catalog.types";
import { brandFormSchema } from "@/types/catalog.types";
import { toast } from "sonner";

interface BrandFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
}

const DEFAULT_VALUES: BrandFormData = {
  name: "",
  slug: undefined,
  description: undefined,
  logoUrl: undefined,
  country: undefined,
  website: undefined,
  displayOrder: undefined,
  status: "ACTIVE",
};

const toSlug = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export function BrandFormSheet({
  open,
  onOpenChange,
  brand,
}: BrandFormSheetProps) {
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.roles?.some(
    (role) => role === "SUPER_ADMIN" || role === "ROLE_SUPER_ADMIN"
  );

  const isEditing = Boolean(brand);
  const [isSlugEditable, setIsSlugEditable] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Fetch brand details if editing
  const { data: brandData, isLoading: isLoadingBrand } = useBrand(
    brand?.id ?? null
  );

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Watch name to auto-generate slug (only when not editing slug manually)
  const watchedName = form.watch("name");

  // Auto-generate slug from name whenever name changes and slug editing is disabled
  useEffect(() => {
    if (isSuperAdmin && watchedName && !isSlugEditable) {
      const generatedSlug = toSlug(watchedName);
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [watchedName, isSlugEditable, form, isSuperAdmin]);

  // Reset form when brand data is loaded or when opening/closing
  useEffect(() => {
    if (open) {
      if (isEditing && brandData) {
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
        setLogoFile(null);
      } else if (!isEditing) {
        form.reset(DEFAULT_VALUES);
        setIsSlugEditable(false);
        setLogoFile(null);
      }
    } else {
      // Reset when closing
      form.reset(DEFAULT_VALUES);
      setIsSlugEditable(false);
      setLogoFile(null);
    }
  }, [brandData, isEditing, open, form]);

  // Create mutation
  const createMutation = useAppMutation<
    Brand,
    Error,
    BrandFormData,
    unknown,
    BrandFormData
  >({
    mutationFn: async (data) => {
      // Upload logo if there's a new File
      let logoUrl: string | undefined = undefined;
      if (logoFile) {
        // Upload new file
        logoUrl = await uploadService.uploadImage(logoFile, "brands");
      } else if (data.logoUrl && typeof data.logoUrl === "string") {
        // Keep existing URL if no new file
        logoUrl = data.logoUrl;
      }

      const payload = {
        ...data,
        logoUrl: logoUrl,
      };

      return brandService.createBrand(payload);
    },
    queryKey: ["admin", "brands"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: form as any, // Type workaround: React Hook Form's UseFormReturn is not fully compatible with FieldValues generic
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      setIsSlugEditable(false);
      setLogoFile(null);
    },
    successMessage: "Tạo thương hiệu thành công!",
  });

  // Update mutation
  const updateMutation = useAppMutation<
    Brand,
    Error,
    { id: number; data: Partial<BrandFormData> },
    unknown,
    BrandFormData
  >({
    mutationFn: async ({ id, data }) => {
      // Upload logo if there's a new File
      let logoUrl: string | undefined = undefined;
      if (logoFile) {
        // Upload new file
        logoUrl = await uploadService.uploadImage(logoFile, "brands");
      } else if (data.logoUrl && typeof data.logoUrl === "string") {
        // Keep existing URL if no new file
        logoUrl = data.logoUrl;
      }
      // If logoFile is null and no existing logoUrl, logoUrl will be undefined (remove logo)

      const payload: Partial<BrandFormData> = {
        ...data,
        logoUrl: logoUrl,
      };

      return brandService.updateBrand(id, payload);
    },
    queryKey: ["admin", "brands"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: form as any, // Type workaround: React Hook Form's UseFormReturn is not fully compatible with FieldValues generic
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      setIsSlugEditable(false);
      setLogoFile(null);
    },
    successMessage: "Cập nhật thương hiệu thành công!",
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: BrandFormData) => {
    if (isEditing && brand) {
      updateMutation.mutate({ id: brand.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleLogoChange = async (file: File | null) => {
    if (file) {
      // Use centralized file validation with magic bytes check
      const { validateFile } = await import("@/lib/validation/file-validation");

      const result = await validateFile(file, {
        validateContent: true, // Include magic bytes validation for security
      });

      if (!result.valid) {
        toast.error(result.error || "File không hợp lệ");
        return;
      }
    }

    setLogoFile(file);
    // Không set File vào logoUrl - chỉ lưu vào state riêng
    // logoUrl sẽ được set sau khi upload File thành công
    if (!file) {
      // Nếu xóa file, clear logoUrl
      form.setValue("logoUrl", undefined);
    }
    // Nếu có file mới, giữ nguyên logoUrl cũ (hoặc undefined) cho đến khi upload xong
  };

  // Cleanup: Clear logo file when form is closed or component unmounts
  useEffect(() => {
    if (!open) {
      setLogoFile(null);
    }
  }, [open]);

  const handleSlugEditToggle = () => {
    if (!isSuperAdmin) {
      return;
    }
    setIsSlugEditable(!isSlugEditable);
    if (!isSlugEditable && !form.getValues("slug") && watchedName) {
      form.setValue("slug", toSlug(watchedName), { shouldValidate: true });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-[600px]">
        <div className="relative flex h-full flex-col">
          <LoadingOverlay
            isLoading={isSubmitting || (isEditing && isLoadingBrand)}
          />

          <form
            className="flex h-full flex-col overflow-y-auto"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <SheetHeader>
              <SheetTitle className="text-xl font-semibold text-foreground">
                {isEditing ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {isEditing
                  ? "Cập nhật thông tin thương hiệu. Slug sẽ tự động tạo từ tên nếu bạn thay đổi tên."
                  : "Thêm thương hiệu mới vào hệ thống. Slug sẽ tự động tạo từ tên nếu bạn không nhập."}
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="flex-1">
              <div className="space-y-6 py-4">
                {/* Logo - Đặt lên đầu */}
                <FormField
                  label="Logo thương hiệu"
                  htmlFor="logoUrl"
                  error={form.formState.errors.logoUrl}
                  description="Upload logo thương hiệu (hình vuông hoặc chữ nhật, khuyến nghị 200x200px hoặc 300x150px)"
                >
                  <ImageUpload
                    variant="rectangle"
                    folder="brands"
                    size="lg"
                    value={
                      logoFile ||
                      (brandData?.logoUrl &&
                      typeof brandData.logoUrl === "string"
                        ? brandData.logoUrl
                        : null) ||
                      (form.watch("logoUrl") &&
                      typeof form.watch("logoUrl") === "string"
                        ? form.watch("logoUrl")
                        : null) ||
                      null
                    }
                    onChange={handleLogoChange}
                    disabled={isSubmitting || (isEditing && isLoadingBrand)}
                  />
                </FormField>

                {/* Name */}
                <FormField
                  label="Tên thương hiệu"
                  htmlFor="name"
                  required
                  error={form.formState.errors.name}
                >
                  <Input
                    placeholder="Ví dụ: Dior Paris"
                    {...form.register("name")}
                  />
                </FormField>

                {/* Slug - Có thể edit */}
                <FormField
                  label="Slug"
                  htmlFor="slug"
                  error={form.formState.errors.slug}
                  description={
                    isSlugEditable
                      ? "Bạn đang chỉnh sửa slug thủ công. Slug này sẽ được sử dụng trong URL."
                      : "Slug tự động tạo từ tên. Click 'Chỉnh sửa' để tùy chỉnh."
                  }
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder="dior-paris"
                      disabled={!isSuperAdmin || !isSlugEditable}
                      className="flex-1"
                      {...form.register("slug")}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleSlugEditToggle}
                      className="shrink-0"
                      title={
                        isSuperAdmin
                          ? isSlugEditable
                            ? "Tắt chỉnh sửa slug"
                            : "Chỉnh sửa slug"
                          : "Chỉ Super Admin mới có thể chỉnh slug"
                      }
                      disabled={!isSuperAdmin}
                    >
                      {isSuperAdmin ? (
                        isSlugEditable ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Edit2 className="h-4 w-4" />
                        )
                      ) : (
                        <Edit2 className="h-4 w-4 opacity-40" />
                      )}
                    </Button>
                  </div>
                </FormField>

                {/* Country & Website */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Quốc gia"
                    htmlFor="country"
                    error={form.formState.errors.country}
                  >
                    <Input
                      placeholder="Ví dụ: France"
                      {...form.register("country")}
                    />
                  </FormField>

                  <FormField
                    label="Website"
                    htmlFor="website"
                    error={form.formState.errors.website}
                  >
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      {...form.register("website")}
                    />
                  </FormField>
                </div>

                {/* Description */}
                <FormField
                  label="Mô tả"
                  htmlFor="description"
                  error={form.formState.errors.description}
                >
                  <textarea
                    placeholder="Mô tả về thương hiệu..."
                    rows={4}
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                    {...form.register("description")}
                  />
                </FormField>

                {/* Display Order & Status */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Thứ tự hiển thị"
                    htmlFor="displayOrder"
                    error={form.formState.errors.displayOrder}
                    description="Số càng nhỏ, hiển thị càng trước"
                  >
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...form.register("displayOrder", {
                        valueAsNumber: true,
                      })}
                    />
                  </FormField>

                  <FormField
                    label="Trạng thái"
                    htmlFor="status"
                    error={form.formState.errors.status}
                    description="Bật/tắt để hiển thị thương hiệu"
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={form.watch("status") === "ACTIVE"}
                        onCheckedChange={(checked) => {
                          form.setValue(
                            "status",
                            checked ? "ACTIVE" : "INACTIVE"
                          );
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {form.watch("status") === "ACTIVE"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </FormField>
                </div>
              </div>
            </SheetBody>

            <SheetFooter>
              <div className="flex w-full items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="h-10 rounded-lg font-semibold"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 w-32 rounded-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : isEditing ? (
                    "Cập nhật"
                  ) : (
                    "Tạo mới"
                  )}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
