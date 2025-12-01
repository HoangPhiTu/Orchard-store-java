"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
import type { Page } from "@/types/user.types";
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

  type BrandLocalState = {
    latestLogoUrl?: string | null;
    timestampKey: number;
    dataVersion: number;
  };

  const isEditing = Boolean(brand);
  const [isSlugEditable, setIsSlugEditable] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null | undefined>(undefined);
  const [brandState, setBrandState] = useState<Record<string, BrandLocalState>>(
    {}
  );
  const defaultBrandStateRef = useRef<Record<string, BrandLocalState>>({});
  // ✅ Ref để lưu logoUrl đã upload (dùng cho cleanup khi có lỗi)
  const uploadedLogoUrlRef = useRef<string | undefined>(undefined);

  // Image management hook (reusable, implements best practices)
  const imageManagement = useImageManagement("brands");

  // Fetch brand details if editing
  const { data: brandData, isLoading: isLoadingBrand } = useBrand(
    brand?.id ?? null
  );

  const getDefaultBrandState = useCallback(
    (brandId: string): BrandLocalState => {
      if (!defaultBrandStateRef.current[brandId]) {
        defaultBrandStateRef.current[brandId] = {
          latestLogoUrl: undefined,
          timestampKey: Date.now(),
          dataVersion: 0,
        };
      }
      return defaultBrandStateRef.current[brandId];
    },
    []
  );

  const updateBrandState = useCallback(
    (brandId: string, updates: Partial<BrandLocalState>) => {
      setBrandState((prev) => ({
        ...prev,
        [brandId]: {
          ...(prev[brandId] ?? getDefaultBrandState(brandId)),
          ...updates,
        },
      }));
    },
    [getDefaultBrandState]
  );

  const currentBrandId = brand?.id?.toString() || "new";
  const currentBrandState =
    brandState[currentBrandId] ?? getDefaultBrandState(currentBrandId);

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const syncBrandCaches = (brandToSync: Brand | null | undefined) => {
    if (!brandToSync?.id) {
      return;
    }

    queryClient.setQueryData<Brand>(
      ["admin", "brands", "detail", brandToSync.id],
      (existing) =>
        existing
          ? {
              ...existing,
              ...brandToSync,
            }
          : brandToSync
    );

    queryClient.setQueriesData<Page<Brand>>(
      { queryKey: ["admin", "brands", "list"] },
      (existing) => {
        if (!existing?.content) {
          return existing;
        }
        return {
          ...existing,
          content: existing.content.map((item) =>
            item.id === brandToSync.id ? { ...item, ...brandToSync } : item
          ),
        };
      }
    );
  };

  // Watch name to auto-generate slug (only when not editing slug manually)
  const watchedName = form.watch("name");

  // Auto-generate slug from name whenever name changes and slug editing is disabled
  useEffect(() => {
    if (isSuperAdmin && watchedName && !isSlugEditable) {
      const generatedSlug = toSlug(watchedName);
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [watchedName, isSlugEditable, form, isSuperAdmin]);

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      setIsSlugEditable(false);
      setLogoFile(undefined);
      setBrandState({});
      defaultBrandStateRef.current = {};
      return;
    }

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
      setLogoFile(undefined);
    } else if (!isEditing) {
      form.reset(DEFAULT_VALUES);
      setIsSlugEditable(false);
      setLogoFile(undefined);
    }
  }, [open, isEditing, brandData, brandData?.id, brandData?.logoUrl, form]);

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
        // ✅ Lưu logoUrl đã upload vào ref để cleanup nếu có lỗi
        uploadedLogoUrlRef.current = logoUrl;
      } else if (data.logoUrl && typeof data.logoUrl === "string") {
        // Keep existing URL if no new file
        logoUrl = data.logoUrl;
        uploadedLogoUrlRef.current = undefined; // Không cần cleanup nếu dùng URL cũ
      } else {
        uploadedLogoUrlRef.current = undefined; // Reset ref
      }

      const payload = {
        ...data,
        logoUrl: logoUrl,
      };

      try {
        const result = await brandService.createBrand(payload);
        // ✅ Clear ref sau khi thành công
        uploadedLogoUrlRef.current = undefined;
        return result;
      } catch (error) {
        // ✅ Nếu có lỗi, giữ lại ref để cleanup trong onError
        throw error;
      }
    },
    // ✅ Chỉ invalidate, không refetch - sẽ refetch thủ công nếu cần
    // Điều này tránh duplicate refetch và cải thiện hiệu năng
    queryKey: undefined, // Không auto refetch, sẽ refetch thủ công trong onSuccess
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: form as any, // Type workaround: React Hook Form's UseFormReturn is not fully compatible with FieldValues generic
    onSuccess: async (createdBrand) => {
      if (createdBrand) {
        const normalizedLogo =
          createdBrand.logoUrl === null ? undefined : createdBrand.logoUrl;
        updateBrandState(currentBrandId, {
          latestLogoUrl: normalizedLogo,
          timestampKey: Date.now(),
        });
        form.reset({
          ...form.getValues(),
          logoUrl: normalizedLogo,
        });
        setLogoFile(undefined);
        syncBrandCaches(createdBrand);
        
        // ✅ Chỉ invalidate, không refetch - syncBrandCaches đã update cache rồi
        // Điều này tránh duplicate refetch và cải thiện hiệu năng
        queryClient.invalidateQueries({
          queryKey: ["admin", "brands"],
          refetchType: "none", // ✅ Không tự động refetch
        });
      }
      uploadedLogoUrlRef.current = undefined;
    },
    onError: async () => {
      // ✅ Cleanup uploaded image on error
      // Nếu có logoUrl đã upload (trong ref) nhưng create brand fail,
      // thì cần cleanup image đã upload
      if (uploadedLogoUrlRef.current) {
        await imageManagement.cleanupImage(uploadedLogoUrlRef.current);
        uploadedLogoUrlRef.current = undefined; // Clear ref sau khi cleanup
      }
    },
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      setIsSlugEditable(false);
      setLogoFile(undefined);
      setBrandState({});
      uploadedLogoUrlRef.current = undefined;
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
        // ✅ Lưu logoUrl đã upload vào ref để cleanup nếu có lỗi
        uploadedLogoUrlRef.current = logoUrl;
      } else if (logoFile === null) {
        // User explicitly removed logo - set to null để backend xóa
        logoUrl = null as unknown as string | undefined; // Backend cần null để xóa logo
        uploadedLogoUrlRef.current = undefined; // Không cần cleanup
      } else if (data.logoUrl && typeof data.logoUrl === "string") {
        // Keep existing URL if no new file and no deletion
        logoUrl = data.logoUrl;
        uploadedLogoUrlRef.current = undefined; // Không cần cleanup nếu dùng URL cũ
      } else {
        uploadedLogoUrlRef.current = undefined; // Reset ref
      }
      // If logoFile is undefined and no existing logoUrl, logoUrl will be undefined (no change)

      const payload: Partial<BrandFormData> = {
        ...data,
        // ✅ Gửi null nếu user xóa logo, undefined nếu không thay đổi, string nếu có URL mới
        // Note: BrandFormData không chấp nhận null, nhưng payload này sẽ được convert trong service
        logoUrl:
          logoUrl !== undefined
            ? logoUrl === null
              ? (null as unknown as string | undefined)
              : logoUrl
            : undefined,
      };

      try {
        const result = await brandService.updateBrand(id, payload);
        // ✅ Clear ref sau khi thành công
        uploadedLogoUrlRef.current = undefined;
        return result;
      } catch (error) {
        // ✅ Nếu có lỗi, giữ lại ref để cleanup trong onError
        throw error;
      }
    },
    // ✅ Chỉ invalidate, không refetch - sẽ refetch thủ công nếu cần
    // Điều này tránh duplicate refetch và cải thiện hiệu năng
    queryKey: undefined, // Không auto refetch, sẽ refetch thủ công trong onSuccess
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: form as any, // Type workaround: React Hook Form's UseFormReturn is not fully compatible with FieldValues generic
    showErrorToast: true, // ✅ Hiển thị toast error để user luôn biết có lỗi
    onSuccess: async (updatedBrand) => {
      // Mark old logo for deletion (soft delete) AFTER DB update success
      if (updatedBrand && brand?.id) {
        const previousLogoUrl = brand?.logoUrl || null;
        const newLogoUrl = updatedBrand.logoUrl || null;

        if (previousLogoUrl && newLogoUrl !== previousLogoUrl) {
          imageManagement.markImageForDeletion(previousLogoUrl, {
            entityId: brand.id,
            reason: "replaced",
          });
        }

        // Mark for deletion if logo removed
        if (previousLogoUrl && !newLogoUrl) {
          imageManagement.markImageForDeletion(previousLogoUrl, {
            entityId: brand.id,
            reason: "removed",
          });
        }
      }

      if (updatedBrand) {
        const normalizedLogo =
          updatedBrand.logoUrl === null ? undefined : updatedBrand.logoUrl;
        updateBrandState(currentBrandId, {
          latestLogoUrl: normalizedLogo,
          timestampKey: Date.now(),
        });
        form.reset({
          ...form.getValues(),
          logoUrl: normalizedLogo,
        });
        setLogoFile(undefined);
        syncBrandCaches(updatedBrand);
        
        // ✅ Chỉ invalidate, không refetch - syncBrandCaches đã update cache rồi
        // Điều này tránh duplicate refetch và cải thiện hiệu năng
        queryClient.invalidateQueries({
          queryKey: ["admin", "brands"],
          refetchType: "none", // ✅ Không tự động refetch
        });
      }
      uploadedLogoUrlRef.current = undefined;
    },
    onError: async () => {
      // ✅ Cleanup uploaded image on error
      // Nếu có logoUrl đã upload (trong ref) nhưng update brand fail,
      // thì cần cleanup image mới đã upload (image cũ vẫn còn trong DB)
      if (uploadedLogoUrlRef.current) {
        await imageManagement.cleanupImage(uploadedLogoUrlRef.current);
        uploadedLogoUrlRef.current = undefined; // Clear ref sau khi cleanup
      }
    },
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      setIsSlugEditable(false);
      setLogoFile(undefined);
      setBrandState({});
      uploadedLogoUrlRef.current = undefined;
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
    if (!file) {
      form.setValue("logoUrl", undefined);
      updateBrandState(currentBrandId, {
        latestLogoUrl: null,
        timestampKey: Date.now(),
      });
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
                      const effectiveValue = (() => {
                        if (logoFile !== undefined) {
                          return logoFile;
                        }
                        if (currentBrandState.latestLogoUrl !== undefined) {
                          return typeof currentBrandState.latestLogoUrl ===
                            "string"
                            ? currentBrandState.latestLogoUrl
                            : null;
                        }
                        if (field.value !== undefined && field.value !== null) {
                          return field.value;
                        }
                        return brandData?.logoUrl || undefined;
                      })();

                      const imageKey = (() => {
                        if (logoFile !== undefined) {
                          if (logoFile instanceof File) {
                            return `file-${logoFile.name}-${logoFile.size}`;
                          }
                          return "null";
                        }
                        if (currentBrandState.latestLogoUrl !== undefined) {
                          return typeof currentBrandState.latestLogoUrl ===
                            "string"
                            ? currentBrandState.latestLogoUrl
                            : "null";
                        }
                        if (field.value !== undefined && field.value !== null) {
                          return typeof field.value === "string"
                            ? field.value
                            : "null";
                        }
                        return brandData?.logoUrl || "no-logo";
                      })();

                      const previewUrl =
                        logoFile === undefined &&
                        currentBrandState.latestLogoUrl === undefined &&
                        field.value === undefined &&
                        brandData?.logoUrl
                          ? `${brandData.logoUrl}?_t=${currentBrandState.timestampKey}`
                          : null;

                      return (
                        <ImageUpload
                          key={`brand-logo-${currentBrandId}-${imageKey}-v${currentBrandState.dataVersion}-t${currentBrandState.timestampKey}`}
                          variant="rectangle"
                          folder={imageManagement.getImageFolder()}
                          size="lg"
                          value={effectiveValue}
                          cacheKey={currentBrandState.timestampKey}
                          previewUrl={previewUrl}
                          onChange={handleLogoChange}
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
