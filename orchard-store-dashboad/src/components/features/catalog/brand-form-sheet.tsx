"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
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
import { useBrand } from "@/hooks/use-brands";
import { useImageManagement } from "@/hooks/use-image-management";
import { useAuthStore } from "@/stores/auth-store";
import { brandService } from "@/services/brand.service";
import type { Brand, BrandFormData } from "@/types/catalog.types";
import { brandFormSchema } from "@/types/catalog.types";
import { toast } from "sonner";
import { useI18n } from "@/hooks/use-i18n";

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
  const { t } = useI18n();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const isSuperAdmin = currentUser?.roles?.some(
    (role) => role === "SUPER_ADMIN" || role === "ROLE_SUPER_ADMIN"
  );

  const isEditing = Boolean(brand);
  const [isSlugEditable, setIsSlugEditable] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null | undefined>(undefined);
  const [latestLogoUrl, setLatestLogoUrl] = useState<string | null | undefined>(
    undefined
  );
  // ✅ State để force update form khi cập nhật thành công
  const [timestampKey, setTimestampKey] = useState(Date.now());

  // Image management hook (reusable, implements best practices)
  const imageManagement = useImageManagement("brands");

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
  // ❌ KHÔNG thêm timestampKey và latestLogoUrl vào dependency array
  // để tránh form bị reset toàn bộ mỗi khi cập nhật ảnh
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
        setLogoFile(undefined); // Reset về undefined để dùng logoUrl từ form

        // ✅ Chỉ clear latestLogoUrl khi brandData.logoUrl đã khớp với latestLogoUrl
        // Điều này đảm bảo latestLogoUrl được giữ lại cho đến khi brandData được refetch và cập nhật
        // Note: latestLogoUrl không được thêm vào dependency array để tránh form bị reset
        if (
          latestLogoUrl !== undefined &&
          brandData.logoUrl === latestLogoUrl
        ) {
          setLatestLogoUrl(undefined);
        }
      } else if (!isEditing) {
        form.reset(DEFAULT_VALUES);
        setIsSlugEditable(false);
        setLogoFile(undefined);
        setLatestLogoUrl(undefined);
      }
    } else {
      // Reset when closing
      form.reset(DEFAULT_VALUES);
      setIsSlugEditable(false);
      setLogoFile(undefined);
      setLatestLogoUrl(undefined);
    }
    // Note: latestLogoUrl và timestampKey không được thêm vào dependency array
    // để tránh form bị reset toàn bộ mỗi khi cập nhật ảnh
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
        // Upload new file with date partitioning
        logoUrl = await imageManagement.uploadImage(logoFile);
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
    onSuccess: (createdBrand) => {
      // ✅ Cập nhật UI ngay lập tức sau khi tạo mới thành công
      if (createdBrand) {
        // 1. Cập nhật state local để hiển thị ngay lập tức
        const newLogoUrl = createdBrand.logoUrl ?? undefined;
        setLatestLogoUrl(newLogoUrl);

        // 2. Ép React vẽ lại component ảnh
        setTimestampKey(Date.now());

        // 3. Cập nhật form với dữ liệu mới (bao gồm logoUrl)
        form.reset({
          ...form.getValues(),
          logoUrl: createdBrand.logoUrl ?? undefined,
        });

        // 4. Reset file input (quan trọng để xóa preview blob cũ)
        setLogoFile(undefined);
      }
    },
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      setIsSlugEditable(false);
      setLogoFile(undefined);
      setLatestLogoUrl(undefined);
    },
    successMessage: t("admin.forms.brand.createBrandSuccess"),
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
        // Upload new file with date partitioning
        logoUrl = await imageManagement.uploadImage(logoFile);
      } else if (logoFile === null) {
        // User explicitly removed logo - set to undefined to delete (backend sẽ xử lý null)
        logoUrl = undefined;
      } else if (data.logoUrl && typeof data.logoUrl === "string") {
        // Keep existing URL if no new file and no deletion
        logoUrl = data.logoUrl;
      }
      // If logoFile is undefined and no existing logoUrl, logoUrl will be undefined (no change)

      const payload: Partial<BrandFormData> = {
        ...data,
        logoUrl: logoUrl ?? undefined, // Ensure it's undefined, not null
      };

      return brandService.updateBrand(id, payload);
    },
    queryKey: ["admin", "brands"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: form as any, // Type workaround: React Hook Form's UseFormReturn is not fully compatible with FieldValues generic
    onSuccess: (updatedBrand) => {
      // Mark old logo for deletion (soft delete) AFTER DB update success
      if (updatedBrand && brand?.id) {
        const previousLogoUrl = brand?.logoUrl || null;
        if (previousLogoUrl && updatedBrand.logoUrl !== previousLogoUrl) {
          imageManagement.markImageForDeletion(previousLogoUrl, {
            entityId: brand.id,
            reason: "replaced",
          });
        }

        // Mark for deletion if logo removed
        if (previousLogoUrl && !updatedBrand.logoUrl) {
          imageManagement.markImageForDeletion(previousLogoUrl, {
            entityId: brand.id,
            reason: "removed",
          });
        }
      }

      // ✅ Cập nhật giá trị trực tiếp vào form và state (không chờ useEffect)
      if (updatedBrand) {
        // 1. Cập nhật state local để hiển thị ngay lập tức
        const newLogoUrl = updatedBrand.logoUrl ?? undefined;
        setLatestLogoUrl(newLogoUrl);

        // 2. Ép React vẽ lại component ảnh
        setTimestampKey(Date.now());

        // 3. ✅ Reset form với dữ liệu mới để cập nhật logoUrl (giống User form)
        form.reset({
          ...form.getValues(),
          logoUrl: updatedBrand.logoUrl ?? undefined,
        });

        // 4. Reset file input (quan trọng để xóa preview blob cũ)
        setLogoFile(undefined);

        // ✅ Refetch brandData để cập nhật UI ngay lập tức (background)
        if (brand?.id) {
          // Invalidate queries (mark as stale)
          queryClient.invalidateQueries({
            queryKey: ["admin", "brands", "detail", brand.id],
          });
          // ✅ Refetch queries ngay lập tức để tải lại dữ liệu mới
          queryClient.refetchQueries({
            queryKey: ["admin", "brands", "detail", brand.id],
          });
        }
      }
    },
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      setIsSlugEditable(false);
      setLogoFile(undefined);
    },
    successMessage: t("admin.forms.brand.updateBrandSuccess"),
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
        toast.error(result.error || t("admin.forms.brand.invalidFile"));
        return;
      }
    }

    setLogoFile(file);
    // Không set File vào logoUrl - chỉ lưu vào state riêng
    // logoUrl sẽ được set sau khi upload File thành công
    if (!file) {
      // Nếu xóa file, clear logoUrl (set undefined để ImageUpload biết là đã xóa)
      form.setValue("logoUrl", undefined);
    }
    // Nếu có file mới, giữ nguyên logoUrl cũ (hoặc undefined) cho đến khi upload xong
  };

  // Cleanup: Clear logo file when form is closed or component unmounts
  useEffect(() => {
    if (!open) {
      setLogoFile(undefined);
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
                {isEditing
                  ? t("admin.forms.brand.editBrand")
                  : t("admin.forms.brand.addNewBrand")}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {isEditing
                  ? t("admin.forms.brand.updateBrandInfo")
                  : t("admin.forms.brand.createNewBrand")}
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="flex-1">
              <div className="space-y-6 py-4">
                {/* Logo - Đặt lên đầu */}
                <FormField
                  label={t("admin.forms.brand.brandLogo")}
                  htmlFor="logoUrl"
                  error={form.formState.errors.logoUrl}
                  description={t("admin.forms.brand.uploadBrandLogo")}
                >
                  <Controller
                    name="logoUrl"
                    control={form.control}
                    render={({ field }) => {
                      // ✅ Ưu tiên logoFile (File mới chọn) trước, sau đó đến latestLogoUrl (URL mới cập nhật), cuối cùng là field.value
                      const effectiveValue = (() => {
                        // 1. Ưu tiên logoFile (File mới được chọn) - để hiển thị preview ngay khi chọn
                        if (logoFile !== undefined) {
                          return logoFile; // File object hoặc null
                        }
                        // 2. Sau đó đến latestLogoUrl (URL mới cập nhật sau khi submit) - để hiển thị ngay sau khi upload thành công
                        if (latestLogoUrl !== undefined) {
                          return typeof latestLogoUrl === "string"
                            ? latestLogoUrl
                            : null;
                        }
                        // 3. Cuối cùng là field.value (string URL từ form) - giá trị ban đầu từ database
                        if (field.value !== undefined && field.value !== null) {
                          return field.value; // string URL
                        }
                        return undefined;
                      })();

                      return (
                        <ImageUpload
                          key={(() => {
                            // ✅ Key thay đổi khi logo URL thay đổi để force re-render
                            const currentValue = (() => {
                              // Ưu tiên logoFile (File mới chọn)
                              if (logoFile !== undefined) {
                                if (logoFile instanceof File) {
                                  return `file-${logoFile.name}-${logoFile.size}`;
                                }
                                return "null";
                              }
                              // Sau đó đến latestLogoUrl (URL mới cập nhật)
                              if (latestLogoUrl !== undefined) {
                                return typeof latestLogoUrl === "string"
                                  ? latestLogoUrl
                                  : "null";
                              }
                              // Cuối cùng là field.value
                              if (
                                field.value !== undefined &&
                                field.value !== null
                              ) {
                                if (typeof field.value === "string") {
                                  return field.value;
                                }
                                return "null";
                              }
                              return brandData?.logoUrl || "no-logo";
                            })();
                            return `brand-logo-${
                              brand?.id || "new"
                            }-${currentValue}${
                              timestampKey ? `-${timestampKey}` : ""
                            }`;
                          })()}
                          variant="rectangle"
                          folder={imageManagement.getImageFolder()}
                          size="lg"
                          value={effectiveValue}
                          previewUrl={
                            // Chỉ dùng previewUrl khi:
                            // - Không có logoFile (File mới chọn)
                            // - Không có latestLogoUrl (URL mới cập nhật)
                            // - field.value là undefined (chưa có giá trị trong form)
                            // - Có brandData.logoUrl (URL từ database)
                            logoFile === undefined &&
                            latestLogoUrl === undefined &&
                            field.value === undefined &&
                            brandData?.logoUrl
                              ? brandData.logoUrl
                              : null
                          }
                          onChange={(file) => {
                            // ✅ Không set File object vào form (schema chỉ chấp nhận string)
                            // Thay vào đó, lưu File vào state logoFile và chỉ set logoUrl khi có string URL
                            handleLogoChange(file);
                          }}
                          disabled={
                            isSubmitting || (isEditing && isLoadingBrand)
                          }
                        />
                      );
                    }}
                  />
                </FormField>

                {/* Name */}
                <FormField
                  label={t("admin.forms.brand.brandName")}
                  htmlFor="name"
                  required
                  error={form.formState.errors.name}
                >
                  <Input
                    placeholder={t("admin.forms.brand.enterBrandName")}
                    {...form.register("name")}
                  />
                </FormField>

                {/* Slug - Có thể edit */}
                <FormField
                  label={t("admin.forms.brand.slug")}
                  htmlFor="slug"
                  error={form.formState.errors.slug}
                  description={
                    isSlugEditable
                      ? t("admin.forms.brand.slugManuallyEdited")
                      : t("admin.forms.brand.slugAutoGenerated")
                  }
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("admin.forms.brand.enterSlug")}
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
                            ? t("admin.forms.brand.disableSlugEdit")
                            : t("admin.forms.brand.editSlug")
                          : t("admin.forms.brand.onlySuperAdminCanEditSlug")
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
                    label={t("admin.forms.brand.country")}
                    htmlFor="country"
                    error={form.formState.errors.country}
                  >
                    <Input
                      placeholder={t("admin.forms.brand.enterCountry")}
                      {...form.register("country")}
                    />
                  </FormField>

                  <FormField
                    label={t("admin.forms.brand.website")}
                    htmlFor="website"
                    error={form.formState.errors.website}
                  >
                    <Input
                      type="url"
                      placeholder={t("admin.forms.brand.enterWebsite")}
                      {...form.register("website")}
                    />
                  </FormField>
                </div>

                {/* Description */}
                <FormField
                  label={t("admin.forms.brand.description")}
                  htmlFor="description"
                  error={form.formState.errors.description}
                >
                  <textarea
                    placeholder={t("admin.forms.brand.enterDescription")}
                    rows={4}
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                    {...form.register("description")}
                  />
                </FormField>

                {/* Display Order & Status */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label={t("admin.forms.brand.displayOrder")}
                    htmlFor="displayOrder"
                    error={form.formState.errors.displayOrder}
                    description={t("admin.forms.brand.enterDisplayOrder")}
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
                    label={t("admin.forms.brand.status")}
                    htmlFor="status"
                    error={form.formState.errors.status}
                    description={t("admin.forms.brand.status")}
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
                          ? t("admin.forms.brand.active")
                          : t("admin.forms.brand.inactive")}
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
                  {t("admin.forms.common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 w-32 rounded-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("admin.forms.common.loading")}
                    </>
                  ) : isEditing ? (
                    t("admin.common.save")
                  ) : (
                    t("admin.common.addNew")
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
