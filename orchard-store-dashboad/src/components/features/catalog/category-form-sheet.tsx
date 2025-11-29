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
import { uploadService } from "@/services/upload.service";
import {
  useCategory,
  useCategories,
  useCategoriesTree,
} from "@/hooks/use-categories";
import { categoryService } from "@/services/category.service";
import type { Category, CategoryFormData } from "@/types/catalog.types";
import type { Page } from "@/types/user.types";
import { createCategoryFormSchema } from "@/types/catalog.types";
import { slugify } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

export function CategoryFormSheet({
  open,
  onOpenChange,
  category,
}: CategoryFormSheetProps) {
  const isEditing = Boolean(category);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isParentSelectOpen, setIsParentSelectOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  // Use state instead of ref for better React integration and to avoid race conditions
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Fetch category details if editing
  const { data: categoryData, isLoading: isLoadingCategory } = useCategory(
    category?.id ?? null
  );

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
      return;
    }
    if (isEditing && categoryData) {
      form.reset({
        name: categoryData.name,
        slug: categoryData.slug ?? undefined,
        description: categoryData.description ?? undefined,
        imageUrl: categoryData.imageUrl ?? undefined,
        parentId: categoryData.parentId ?? null,
        displayOrder: categoryData.displayOrder ?? undefined,
        status: categoryData.status,
      });
      return;
    }
    if (!isEditing) {
      form.reset(DEFAULT_VALUES);
    }
  }, [categoryData, isEditing, open, form]);

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
  const watchedImageUrl = useWatch({
    control: form.control,
    name: "imageUrl",
  });
  const watchedStatus = useWatch({
    control: form.control,
    name: "status",
  });
  const watchedSlug = useWatch({
    control: form.control,
    name: "slug",
  });

  const resolveUploadFolder = useCallback(
    (parentId: number | null | undefined) => {
      if (!parentId) {
        return "categories";
      }
      const parentCat = allCategories.find((cat) => cat.id === parentId);
      if (!parentCat?.slug) {
        return "categories";
      }
      return `categories/${parentCat.slug}`;
    },
    [allCategories]
  );

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

  const uploadFolder = useMemo(
    () => resolveUploadFolder(watchedParentId),
    [resolveUploadFolder, watchedParentId]
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
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        // Upload new file
        imageUrl = await uploadService.uploadImage(
          imageFile,
          resolveUploadFolder(data.parentId ?? null)
        );
      } else if (data.imageUrl && typeof data.imageUrl === "string") {
        // Keep existing URL if no new file
        imageUrl = data.imageUrl;
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
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      setImageFile(null);
    },
    successMessage: "Tạo danh mục thành công!",
  });

  // Update mutation
  const updateMutation = useAppMutation<
    Category,
    Error,
    { id: number; data: Partial<CategoryFormData> }
  >({
    mutationFn: async ({ id, data }) => {
      // Upload image if there's a new File
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        // Upload new file
        const parentContextId = data.parentId ?? category?.parentId ?? null;
        imageUrl = await uploadService.uploadImage(
          imageFile,
          resolveUploadFolder(parentContextId)
        );
      } else if (data.imageUrl && typeof data.imageUrl === "string") {
        // Keep existing URL if no new file
        imageUrl = data.imageUrl;
      }
      // If imageFile is null and no existing imageUrl, imageUrl will be undefined (remove image)

      const payload: Partial<CategoryFormData> = {
        ...data,
        imageUrl: imageUrl,
        // Ensure parentId is null if not selected
        parentId: data.parentId ?? null,
      };

      return categoryService.updateCategory(id, payload);
    },
    queryKey: ["admin", "categories"],
    form: mutationForm,
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      setImageFile(null);
    },
    successMessage: "Cập nhật danh mục thành công!",
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: CategoryFormData) => {
    if (isEditing && category) {
      updateMutation.mutate({ id: category.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    // Không set File vào imageUrl - chỉ lưu vào state riêng
    // imageUrl sẽ được set sau khi upload File thành công
    if (!file) {
      // Nếu xóa file, clear imageUrl
      form.setValue("imageUrl", undefined);
    }
    // Nếu có file mới, giữ nguyên imageUrl cũ (hoặc undefined) cho đến khi upload xong
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
                {isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {isEditing
                  ? "Cập nhật thông tin danh mục. Slug sẽ tự động tạo từ tên."
                  : "Thêm danh mục mới vào hệ thống. Slug sẽ tự động tạo từ tên nếu bạn không nhập."}
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="flex-1">
              <div className="space-y-6 py-4">
                {/* Image - Đặt lên đầu */}
                <FormField
                  label="Hình ảnh danh mục"
                  htmlFor="category-image"
                  error={form.formState.errors.imageUrl}
                  description={`Upload hình ảnh danh mục (khuyến nghị 300x300px). Thư mục: ${uploadFolder}`}
                >
                  <ImageUpload
                    variant="rectangle"
                    folder={uploadFolder}
                    size="lg"
                    value={
                      imageFile ||
                      (categoryData?.imageUrl &&
                      typeof categoryData.imageUrl === "string"
                        ? categoryData.imageUrl
                        : null) ||
                      (watchedImageUrl && typeof watchedImageUrl === "string"
                        ? watchedImageUrl
                        : null) ||
                      null
                    }
                    onChange={handleImageChange}
                    disabled={isSubmitting || (isEditing && isLoadingCategory)}
                  />
                </FormField>

                {/* Parent Category */}
                <FormField
                  label="Danh mục cha"
                  htmlFor="category-parent"
                  error={form.formState.errors.parentId}
                  description="Chọn danh mục cha (để trống nếu là danh mục gốc)"
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
                            : "Chọn danh mục cha"}
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
                            placeholder="Tìm kiếm danh mục..."
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
                            <span>Không có (Danh mục gốc)</span>
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
                  label="Tên danh mục"
                  htmlFor="category-name"
                  required
                  error={form.formState.errors.name}
                >
                  <Input
                    placeholder="Ví dụ: Nước hoa"
                    {...form.register("name")}
                  />
                </FormField>

                {/* Slug */}
                <FormField
                  label="Slug"
                  htmlFor="category-slug"
                  required
                  error={form.formState.errors.slug}
                  description="Slug dùng trong URL, chỉ bao gồm chữ thường, số và dấu gạch ngang."
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
                      title="Tạo lại slug từ tên"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </FormField>

                {/* Description */}
                <FormField
                  label="Mô tả"
                  htmlFor="category-description"
                  error={form.formState.errors.description}
                >
                  <textarea
                    placeholder="Mô tả về danh mục..."
                    rows={4}
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                    {...form.register("description")}
                  />
                </FormField>

                {/* Display Order & Status */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Thứ tự hiển thị"
                    htmlFor="category-display-order"
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
                    htmlFor="category-status"
                    error={form.formState.errors.status}
                    description="Bật/tắt để hiển thị danh mục"
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
                        {watchedStatus === "ACTIVE" ? "Active" : "Inactive"}
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
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-32 rounded-lg"
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
