"use client";

import {
  type ChangeEvent,
  type WheelEvent,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useForm,
  useWatch,
  Controller,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCw, ChevronsUpDown, Check } from "lucide-react";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { FormField } from "@/components/ui/form-field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/shared/image-upload";
import { useCategory, useCategoriesTree } from "@/hooks/use-categories";
import { useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import type { Category, CategoryFormData } from "@/types/catalog.types";
import { createCategoryFormSchema } from "@/types/catalog.types";
import { slugify } from "@/lib/utils";
import { useImageManagement } from "@/hooks/use-image-management";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";

interface CategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

const DEFAULT_VALUES: CategoryFormData = {
  name: "",
  slug: "",
  description: undefined,
  imageUrl: undefined,
  parentId: null,
  displayOrder: undefined,
  status: "ACTIVE",
};

/**
 * Find all descendant category IDs (children, grandchildren, etc.)
 * using path field if available, or by checking parentId recursively
 */
const findDescendantIds = (
  categoryId: number,
  allCategories: Category[]
): number[] => {
  const descendants: number[] = [];
  const category = allCategories.find((c) => c.id === categoryId);

  if (!category) return descendants;

  // If path is available, find all categories whose path starts with current path
  if (category.path) {
    const currentPath = category.path;
    allCategories.forEach((c) => {
      if (c.path && c.path.startsWith(currentPath) && c.id !== categoryId) {
        descendants.push(c.id);
      }
    });
  } else {
    // Fallback: recursively find children by parentId
    const findChildren = (parentId: number) => {
      allCategories.forEach((c) => {
        if (c.parentId === parentId) {
          descendants.push(c.id);
          findChildren(c.id);
        }
      });
    };
    findChildren(categoryId);
  }

  return descendants;
};

// Helper function to check if value is a File object
const isFile = (value: unknown): value is File => {
  return value instanceof File;
};

export function CategoryFormSheet({
  open,
  onOpenChange,
  category,
}: CategoryFormSheetProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isEditing = Boolean(category);
  const [isParentSelectOpen, setIsParentSelectOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  // Use state instead of ref for better React integration and to avoid race conditions
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  
  // Image management hook (reusable, implements best practices)
  const imageManagement = useImageManagement("categories");

  // Fetch category details if editing
  const {
    data: categoryDataFromQuery,
    isLoading: isLoadingCategory,
    refetch: refetchCategory,
  } = useCategory(category?.id ?? null);

  // Local state để track category data - update trực tiếp trong onSuccess
  const [categoryData, setCategoryData] = useState<Category | null>(
    categoryDataFromQuery ?? null
  );
  // ✅ State để hiển thị image ngay lập tức sau khi update/create
  const [latestImageUrl, setLatestImageUrl] = useState<string | null | undefined>(undefined);

  // Update local state khi categoryDataFromQuery thay đổi
  useEffect(() => {
    if (categoryDataFromQuery) {
      setCategoryData(categoryDataFromQuery);
          // ✅ Clear latestImageUrl khi categoryData được load
          setLatestImageUrl(undefined);
    }
  }, [categoryDataFromQuery]);

  // Sử dụng categories tree thay vì fetch all với size 1000
  // Tree API nhanh hơn vì đã có cache ở backend và trả về flat list
  // Prefetch từ page sẽ giúp form mở nhanh hơn
  const categoriesTreeQuery = useCategoriesTree();
  const allCategories = useMemo<Category[]>(
    () => categoriesTreeQuery.data ?? [],
    [categoriesTreeQuery.data]
  );

  // Filter categories: Remove current category and all its descendants
  const availableParentCategories = useMemo<Category[]>(() => {
    if (!isEditing || !category?.id) {
      return allCategories;
    }

    const excludedIds = new Set<number>([
      category.id,
      ...findDescendantIds(category.id, allCategories),
    ]);

    return allCategories.filter((cat) => !excludedIds.has(cat.id));
  }, [allCategories, isEditing, category]);

  const categorySchema = useMemo(
    () => createCategoryFormSchema({ currentCategoryId: category?.id }),
    [category?.id]
  );
  const schemaResolver = useMemo(
    () => zodResolver(categorySchema),
    [categorySchema]
  );

  const form = useForm<CategoryFormData>({
    resolver: schemaResolver,
    defaultValues: DEFAULT_VALUES,
  });
  const mutationForm = form as unknown as UseFormReturn<FieldValues>;

  const resetParentSearch = useCallback(() => {
    startTransition(() => {
      setParentSearch("");
    });
  }, []);

  // Reset form when category data is loaded or when opening/closing
  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      setCategoryData(null); // Clear local state when closing
      return;
    }
    if (isEditing && categoryData) {
      // Reset form khi categoryData thay đổi (bao gồm sau khi update)
      form.reset({
        name: categoryData.name,
        slug: categoryData.slug ?? undefined,
        description: categoryData.description ?? undefined,
        // Convert null thành undefined cho form (form không chấp nhận null)
        imageUrl:
          categoryData.imageUrl === null
            ? undefined
            : categoryData.imageUrl ?? undefined,
        parentId: categoryData.parentId ?? null,
        displayOrder: categoryData.displayOrder ?? undefined,
        status: categoryData.status,
      });
      return;
    }
    if (!isEditing) {
      form.reset(DEFAULT_VALUES);
      setCategoryData(null);
    }
  }, [categoryData?.id, categoryData?.imageUrl, isEditing, open, form]);

  useEffect(() => {
    resetParentSearch();
  }, [open, resetParentSearch]);

  // Reset slug edit flag when form opens/closes
  // Use startTransition to avoid cascading renders
  useEffect(() => {
    if (!open) {
      startTransition(() => {
        setIsSlugManuallyEdited(false);
      });
    } else if (isEditing) {
      // When editing, assume slug was manually set initially
      startTransition(() => {
        setIsSlugManuallyEdited(true);
      });
    }
  }, [open, isEditing]);

  const watchedName = useWatch({
    control: form.control,
    name: "name",
  });

  // Auto-generate slug from name when name changes
  // Only if slug hasn't been manually edited or when creating new category
  useEffect(() => {
    if (!watchedName) {
      // Clear slug if name is empty (unless editing and slug was manually edited)
      if (!isEditing || !isSlugManuallyEdited) {
        form.setValue("slug", "", { shouldValidate: true, shouldDirty: true });
      }
      return;
    }

    // Only auto-generate if:
    // 1. Creating new category (not editing), OR
    // 2. Editing but slug hasn't been manually edited
    if (!isSlugManuallyEdited || !isEditing) {
      const generated = slugify(watchedName);
      form.setValue("slug", generated, {
        shouldValidate: true,
        shouldDirty: !isEditing,
      });
    }
  }, [watchedName, isEditing, isSlugManuallyEdited, form]);

  const watchedParentId = useWatch({
    control: form.control,
    name: "parentId",
  });
  const watchedStatus = useWatch({
    control: form.control,
    name: "status",
  });
  const watchedSlug = useWatch({
    control: form.control,
    name: "slug",
  });

  const filteredParentCategories = useMemo(() => {
    if (!parentSearch.trim()) {
      return availableParentCategories;
    }
    const query = parentSearch.trim().toLowerCase();
    return availableParentCategories.filter((cat) => {
      const nameMatch = cat.name.toLowerCase().includes(query);
      const slugMatch = cat.slug?.toLowerCase().includes(query);
      return nameMatch || slugMatch;
    });
  }, [availableParentCategories, parentSearch]);

  // Get upload folder with date partitioning (flat structure, no slug-based hierarchy)
  const uploadFolder = useMemo(
    () => imageManagement.getImageFolder(),
    [imageManagement]
  );

  const selectedParent = useMemo(() => {
    if (watchedParentId === null || watchedParentId === undefined) {
      return null;
    }
    return allCategories.find((cat) => cat.id === watchedParentId) ?? null;
  }, [allCategories, watchedParentId]);

  const handleParentSelectOpenChange = useCallback(
    (nextOpen: boolean) => {
      setIsParentSelectOpen(nextOpen);
      if (!nextOpen) {
        resetParentSearch();
      }
      // Categories are already fetched when form opens, no need to trigger here
    },
    [resetParentSearch]
  );

  const handleParentSelect = (value: number | null) => {
    form.setValue("parentId", value, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setIsParentSelectOpen(false);
  };

  const handleParentPopoverWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      event.stopPropagation();
    },
    []
  );

  // Create mutation
  const createMutation = useAppMutation<Category, Error, CategoryFormData>({
    mutationFn: async (data) => {
      // Upload image if there's a new File
      // Note: data.imageUrl can be File | string | null | undefined from form field
      let imageUrl: string | undefined = undefined;
      const imageValue = data.imageUrl as File | string | null | undefined;
      if (isFile(imageValue)) {
        // Upload new file with date partitioning (flat structure)
        imageUrl = await imageManagement.uploadImage(imageValue);
      } else if (imageValue && typeof imageValue === "string") {
        // Keep existing URL if no new file
        imageUrl = imageValue;
      }

      const payload: CategoryFormData = {
        ...data,
        imageUrl: imageUrl,
        // Ensure parentId is null if not selected
        parentId: data.parentId ?? null,
      };

      return categoryService.createCategory(payload);
    },
    queryKey: ["admin", "categories"],
    form: mutationForm,
    onSuccess: (createdCategory) => {
      // ✅ Cập nhật latestImageUrl để hiển thị ngay lập tức (nếu form vẫn mở)
      if (createdCategory) {
        setLatestImageUrl(createdCategory.imageUrl ?? undefined);
      }
    },
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      setLatestImageUrl(undefined);
    },
    successMessage: t("admin.forms.category.createCategorySuccess"),
  });

  // Update mutation
  const updateMutation = useAppMutation<
    Category,
    Error,
    { id: number; data: Partial<CategoryFormData> }
  >({
    mutationFn: async ({ id, data }) => {
      // Upload image if there's a new File
      // Note: data.imageUrl can be File | string | null | undefined from form field
      let imageUrl: string | undefined | null = undefined;
      const imageValue = data.imageUrl as File | string | null | undefined;
      const previousImageUrl = category?.imageUrl || null;

      if (isFile(imageValue)) {
        // Upload new file with date partitioning (flat structure)
        imageUrl = await imageManagement.uploadImage(imageValue);
      } else if (imageValue === null) {
        // User explicitly wants to remove image
        imageUrl = null;
      } else if (imageValue && typeof imageValue === "string") {
        // Keep existing URL if no new file and not explicitly removed
        imageUrl = imageValue;
      }
      // If data.imageUrl is undefined, imageUrl will be undefined (keep existing)

      // Tạo payload với imageUrl có thể là null để xóa ảnh
      const payload = {
        ...data,
        // Giữ nguyên null nếu muốn xóa ảnh để service gửi null lên backend
        // undefined nếu không thay đổi (service sẽ không gửi field này)
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        // Ensure parentId is null if not selected
        parentId: data.parentId ?? null,
      } as Partial<CategoryFormData>;

      return categoryService.updateCategory(id, payload);
    },
    queryKey: ["admin", "categories"],
    form: mutationForm,
    onSuccess: (updatedCategory) => {
      // ✅ Cập nhật latestImageUrl để hiển thị ngay lập tức
      if (updatedCategory) {
        setLatestImageUrl(updatedCategory.imageUrl ?? undefined);
      }

      // Update cache immediately với data mới để UI update ngay lập tức (realtime)
      if (updatedCategory && category?.id) {
        // Update detail cache trước - điều này sẽ trigger re-render của useCategory hook
        queryClient.setQueryData(
          ["admin", "categories", "detail", category.id],
          updatedCategory
        );

        // Update local state ngay lập tức - điều này sẽ trigger re-render và reset form trong useEffect
        setCategoryData(updatedCategory);

        // Mark old image for deletion (soft delete) AFTER DB update success
        const previousImageUrl = category?.imageUrl || null;
        if (previousImageUrl && updatedCategory.imageUrl !== previousImageUrl) {
          imageManagement.markImageForDeletion(previousImageUrl, {
            entityId: category.id,
            reason: "replaced",
          });
        }
        
        // Mark for deletion if image removed
        if (previousImageUrl && !updatedCategory.imageUrl) {
          imageManagement.markImageForDeletion(previousImageUrl, {
            entityId: category.id,
            reason: "removed",
        });
        }
      }

      // Invalidate và refetch để đảm bảo tất cả queries liên quan được refresh
      // refetchType: "active" sẽ refetch các queries đang active (đang được sử dụng)
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories", "detail", category?.id],
        refetchType: "active", // Chỉ refetch queries đang active
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "categories"],
      });

      // Refetch category detail để đảm bảo useCategory hook có data mới nhất
      if (category?.id) {
        refetchCategory();
      }
    },
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      setLatestImageUrl(undefined);
    },
    successMessage: t("admin.forms.category.updateCategorySuccess"),
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: CategoryFormData) => {
    if (isEditing && category) {
      updateMutation.mutate({ id: category.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleSlugInputChange = (value: string) => {
    setIsSlugManuallyEdited(true);
    form.setValue("slug", value, { shouldValidate: true, shouldDirty: true });
  };

  const handleRegenerateSlug = () => {
    const currentName = form.getValues("name") || "";
    const regenerated = slugify(currentName);
    form.setValue("slug", regenerated, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setIsSlugManuallyEdited(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-[600px]">
        <div className="relative flex h-full flex-col">
          <form
            className="flex h-full flex-col overflow-y-auto"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <SheetHeader>
              <SheetTitle className="text-xl font-semibold text-foreground">
                {isEditing
                  ? t("admin.forms.category.editCategory")
                  : t("admin.forms.category.addNewCategory")}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {isEditing
                  ? t("admin.forms.category.updateCategoryInfo")
                  : t("admin.forms.category.createNewCategory")}
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="flex-1">
              <div className="space-y-6 py-4">
                {/* Image - Đặt lên đầu */}
                <FormField
                  label={t("admin.forms.category.categoryImage")}
                  htmlFor="category-image"
                  error={form.formState.errors.imageUrl}
                  description={`${t(
                    "admin.forms.category.uploadCategoryImage"
                  )}: ${uploadFolder}`}
                >
                  <Controller
                    name="imageUrl"
                    control={form.control}
                    render={({ field }) => {
                      // ✅ Ưu tiên latestImageUrl để hiển thị ngay sau khi update/create
                      const effectiveValue = (() => {
                        if (field.value !== undefined) {
                          return field.value; // File hoặc null
                        }
                        if (latestImageUrl !== undefined) {
                          return typeof latestImageUrl === "string" ? latestImageUrl : null;
                        }
                        return field.value;
                      })();

                      return (
                      <ImageUpload
                          key={(() => {
                            // ✅ Key thay đổi khi image URL thay đổi để force re-render
                            const currentValue = (() => {
                              if (field.value !== undefined) {
                                return field.value instanceof File 
                                  ? `file-${field.value.name}-${field.value.size}` 
                                  : field.value === null ? "null" : String(field.value);
                              }
                              if (latestImageUrl !== undefined) {
                                return typeof latestImageUrl === "string" ? latestImageUrl : "null";
                              }
                              return categoryData?.imageUrl || category?.imageUrl || "no-image";
                            })();
                            return `image-upload-${categoryData?.id || category?.id || "new"}-${currentValue}`;
                          })()}
                        variant="rectangle"
                        folder={uploadFolder}
                        size="lg"
                          value={effectiveValue}
                        previewUrl={
                            // Chỉ dùng previewUrl khi field.value là undefined và không có latestImageUrl
                            // Nếu field.value === null (user đã xóa), không dùng previewUrl
                            field.value === undefined && latestImageUrl === undefined
                              ? (categoryData?.imageUrl &&
                            typeof categoryData.imageUrl === "string"
                            ? categoryData.imageUrl
                            : category?.imageUrl &&
                              typeof category.imageUrl === "string"
                            ? category.imageUrl
                                  : null)
                            : null
                        }
                        onChange={(file) => {
                            field.onChange(file || null);
                            form.trigger("imageUrl");
                        }}
                        disabled={
                          isSubmitting || (isEditing && isLoadingCategory)
                        }
                      />
                      );
                    }}
                  />
                </FormField>

                {/* Parent Category */}
                <FormField
                  label={t("admin.forms.category.parentCategory")}
                  htmlFor="category-parent"
                  error={form.formState.errors.parentId}
                  description={t("admin.forms.category.selectParentCategory")}
                >
                  <Popover
                    open={isParentSelectOpen}
                    onOpenChange={handleParentSelectOpenChange}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "h-11 w-full justify-between text-left text-sm font-medium text-slate-900",
                          selectedParent ? "" : ""
                        )}
                      >
                        <span className="truncate font-medium text-slate-900">
                          {selectedParent
                            ? selectedParent.name
                            : t("admin.forms.category.selectParentCategory")}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-600" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      side="bottom"
                      collisionPadding={10}
                      sideOffset={4}
                      className="w-[--radix-popover-trigger-width] p-0"
                      onWheel={handleParentPopoverWheel}
                    >
                      <div className="flex flex-col">
                        <div className="border-b border-border/60 bg-card px-3 py-2">
                          <Input
                            placeholder={t(
                              "admin.forms.category.searchParentCategory"
                            )}
                            value={parentSearch}
                            onChange={(e) => setParentSearch(e.target.value)}
                            className="h-9 bg-transparent px-0 text-sm font-semibold text-foreground placeholder:text-muted-foreground shadow-none outline-none ring-0 focus-visible:ring-0"
                          />
                        </div>
                        <div className="max-h-72 overflow-y-auto bg-card">
                          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Danh mục
                          </div>
                          <button
                            type="button"
                            onClick={() => handleParentSelect(null)}
                            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                          >
                            <span>{t("admin.forms.category.noParent")}</span>
                            {watchedParentId == null && (
                              <Check className="ml-auto h-4 w-4 text-indigo-600" />
                            )}
                          </button>
                          {filteredParentCategories.length === 0 && (
                            <div className="px-3 py-4 text-center text-sm font-semibold text-muted-foreground">
                              Không tìm thấy danh mục phù hợp.
                            </div>
                          )}
                          {filteredParentCategories.map((cat) => {
                            const isSelected = watchedParentId === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleParentSelect(cat.id)}
                                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                              >
                                <span className="text-xs font-medium text-muted-foreground">
                                  L{cat.level ?? 0}
                                </span>
                                <span className="truncate font-medium text-foreground">
                                  {cat.name}
                                </span>
                                {isSelected && (
                                  <Check className="ml-auto h-4 w-4 text-indigo-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </FormField>

                {/* Name */}
                <FormField
                  label={t("admin.forms.category.categoryName")}
                  htmlFor="category-name"
                  required
                  error={form.formState.errors.name}
                >
                  <Input
                    placeholder={t("admin.forms.category.enterCategoryName")}
                    {...form.register("name")}
                  />
                </FormField>

                {/* Slug */}
                <FormField
                  label={t("admin.forms.category.slug")}
                  htmlFor="category-slug"
                  required
                  error={form.formState.errors.slug}
                  description={
                    isSlugManuallyEdited
                      ? t("admin.forms.category.slugManuallyEdited")
                      : t("admin.forms.category.slugAutoGenerated")
                  }
                >
                  <div className="flex items-center gap-2">
                    <Input
                      id="category-slug"
                      placeholder="nuoc-hoa-nam"
                      value={watchedSlug ?? ""}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleSlugInputChange(event.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={handleRegenerateSlug}
                      disabled={!watchedName}
                      title={t("admin.forms.category.regenerateSlug")}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </FormField>

                {/* Description */}
                <FormField
                  label={t("admin.forms.category.description")}
                  htmlFor="category-description"
                  error={form.formState.errors.description}
                >
                  <textarea
                    placeholder={t("admin.forms.category.enterDescription")}
                    rows={4}
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                    {...form.register("description")}
                  />
                </FormField>

                {/* Display Order & Status */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label={t("admin.forms.category.displayOrder")}
                    htmlFor="category-display-order"
                    error={form.formState.errors.displayOrder}
                    description={t("admin.forms.category.enterDisplayOrder")}
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
                    label={t("admin.forms.category.status")}
                    htmlFor="category-status"
                    error={form.formState.errors.status}
                    description={t("admin.forms.category.status")}
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={watchedStatus === "ACTIVE"}
                        onCheckedChange={(checked) => {
                          form.setValue(
                            "status",
                            checked ? "ACTIVE" : "INACTIVE"
                          );
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {watchedStatus === "ACTIVE"
                          ? t("admin.forms.category.active")
                          : t("admin.forms.category.inactive")}
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
                  className="w-32 rounded-lg font-semibold shadow-sm"
                >
                  {t("admin.forms.common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-32 rounded-lg"
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
