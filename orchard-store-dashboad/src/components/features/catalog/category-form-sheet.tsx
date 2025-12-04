"use client";

import {
  type ChangeEvent,
  type WheelEvent,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
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
import { toast } from "sonner";
import type { Page } from "@/types/user.types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CategoryAttributesSection } from "./category-attributes-section";

interface CategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onCategoryMutated?: (category: Category, action: "create" | "update") => void;
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
  onCategoryMutated,
}: CategoryFormSheetProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isEditing = Boolean(category);
  const [isParentSelectOpen, setIsParentSelectOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "attributes">("basic");
  // ✅ State riêng để track categoryId cho CategoryAttributesSection
  // Khởi tạo từ cả prop category và categoryData (nếu đã có)
  const [attributesCategoryId, setAttributesCategoryId] = useState<number | undefined>(() => {
    return category?.id ?? undefined;
  });
  // Use state instead of ref for better React integration and to avoid race conditions
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  
  // ✅ Category state management (giống brand) để tránh conflict khi update category khác
  type CategoryLocalState = {
    latestImageUrl?: string | null;
    imageFile?: File | null | undefined; // ✅ Quản lý imageFile theo từng category ID
    timestampKey: number;
    dataVersion: number;
  };

  const [categoryState, setCategoryState] = useState<Record<string, CategoryLocalState>>(
    {}
  );
  const defaultCategoryStateRef = useRef<Record<string, CategoryLocalState>>({});
  // ✅ Ref để track latestImageUrl đã được set chưa, tránh vòng lặp vô hạn
  const lastSyncedImageUrlRef = useRef<Record<string, string | null | undefined>>({});
  
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

  // ✅ Helper functions để quản lý category state (giống brand)
  const getDefaultCategoryState = useCallback(
    (categoryId: string): CategoryLocalState => {
      if (!defaultCategoryStateRef.current[categoryId]) {
        defaultCategoryStateRef.current[categoryId] = {
          latestImageUrl: undefined,
          imageFile: undefined, // ✅ Khởi tạo imageFile cho mỗi category
          timestampKey: Date.now(),
          dataVersion: 0,
        };
      }
      return defaultCategoryStateRef.current[categoryId];
    },
    []
  );

  const updateCategoryState = useCallback(
    (categoryId: string, updates: Partial<CategoryLocalState>) => {
      // ✅ Cập nhật lastSyncedImageUrlRef khi latestImageUrl thay đổi
      if (updates.latestImageUrl !== undefined) {
        lastSyncedImageUrlRef.current[categoryId] = updates.latestImageUrl;
      }
      // ✅ Cập nhật currentImageFileRef khi imageFile thay đổi
      if (updates.imageFile !== undefined) {
        currentImageFileRef.current[categoryId] = updates.imageFile;
      }
      setCategoryState((prev) => ({
        ...prev,
        [categoryId]: {
          ...(prev[categoryId] ?? getDefaultCategoryState(categoryId)),
          ...updates,
        },
      }));
    },
    [getDefaultCategoryState]
  );

  const currentCategoryId = category?.id?.toString() || "new";
  const currentCategoryState =
    categoryState[currentCategoryId] ?? getDefaultCategoryState(currentCategoryId);
  
  // ✅ Lấy imageFile từ state của category hiện tại
  const imageFile = currentCategoryState.imageFile;

  // Update local state khi categoryDataFromQuery thay đổi
  // ✅ Chỉ sync khi categoryDataFromQuery thay đổi và không phải từ mutation (tránh override giá trị mới)
  useEffect(() => {
    if (categoryDataFromQuery) {
      // ✅ Chỉ update nếu categoryData chưa có hoặc ID khác (tránh override khi vừa update)
      setCategoryData((prev) => {
        // Nếu prev đã có và ID giống nhau, giữ nguyên prev (đã được update từ mutation)
        if (prev && prev.id === categoryDataFromQuery.id) {
          return prev;
        }
        return categoryDataFromQuery;
      });
      // ✅ Clear latestImageUrl khi categoryData được load từ query (không phải từ mutation)
      updateCategoryState(currentCategoryId, {
        latestImageUrl: undefined,
      });
    }
  }, [categoryDataFromQuery?.id, currentCategoryId, updateCategoryState]);

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

  // ✅ Update attributesCategoryId khi category hoặc categoryData thay đổi
  useEffect(() => {
    const newId = category?.id ?? categoryData?.id;
    if (newId && newId > 0) {
      setAttributesCategoryId(newId);
    }
  }, [category?.id, categoryData?.id]);
  const schemaResolver = useMemo(
    () => zodResolver(categorySchema),
    [categorySchema]
  );

  const form = useForm<CategoryFormData>({
    resolver: schemaResolver,
    defaultValues: DEFAULT_VALUES,
  });
  const mutationForm = form as unknown as UseFormReturn<FieldValues>;

  // ✅ Sync category caches để update realtime trong table (giống brand)
  // ✅ Cập nhật tất cả queries có pagination/filters để đảm bảo table update đúng
  const syncCategoryCaches = useCallback(
    (categoryToSync: Category | null | undefined) => {
      if (!categoryToSync?.id) {
        return;
      }

      // Update detail cache
      queryClient.setQueryData<Category>(
        ["admin", "categories", "detail", categoryToSync.id],
        (existing) =>
          existing
            ? {
                ...existing,
                ...categoryToSync,
              }
            : categoryToSync
      );

      // ✅ Update ALL list caches (với bất kỳ filters/pagination nào)
      // Sử dụng queryKey prefix để match tất cả queries có ["admin", "categories", "list", ...]
      queryClient.getQueriesData<Page<Category>>({
        predicate: (query) => {
          const key = query.queryKey;
          // Match ["admin", "categories", "list", ...] hoặc ["admin", "categories", "all", ...]
          return (
            Array.isArray(key) &&
            key.length >= 3 &&
            key[0] === "admin" &&
            key[1] === "categories" &&
            (key[2] === "list" || key[2] === "all")
          );
        },
      }).forEach(([queryKey, data]) => {
        if (data && typeof data === "object" && "content" in data) {
          const pageData = data as Page<Category>;
          if (pageData.content) {
            queryClient.setQueryData<Page<Category>>(queryKey, {
              ...pageData,
              content: pageData.content.map((item) =>
                item.id === categoryToSync.id
                  ? { ...item, ...categoryToSync }
                  : item
              ),
            });
          }
        }
      });
    },
    [queryClient]
  );

  const resetParentSearch = useCallback(() => {
    startTransition(() => {
      setParentSearch("");
    });
  }, []);

  // ✅ Track categoryId trước đó để detect khi chuyển category
  const prevCategoryIdRef = useRef<string | null>(null);
  // ✅ Ref để track xem đã reset form chưa, tránh vòng lặp vô hạn
  const lastResetDataRef = useRef<{ categoryId?: number; imageUrl?: string | null } | null>(null);
  // ✅ Ref để track imageFile của category hiện tại, tránh stale closure
  const currentImageFileRef = useRef<Record<string, File | null | undefined>>({});
  
  // ✅ Sync currentImageFileRef với categoryState khi categoryState thay đổi
  useEffect(() => {
    Object.keys(categoryState).forEach((categoryId) => {
      if (categoryState[categoryId]?.imageFile !== undefined) {
        currentImageFileRef.current[categoryId] = categoryState[categoryId].imageFile;
      }
    });
  }, [categoryState]);
  
  // Reset form when category data is loaded or when opening/closing (giống brand form)
  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      setCategoryData(null); // Clear local state when closing
      setCategoryState({});
      defaultCategoryStateRef.current = {};
      lastSyncedImageUrlRef.current = {};
      prevCategoryIdRef.current = null;
      lastResetDataRef.current = null;
      currentImageFileRef.current = {};
      return;
    }
    
    // ✅ Khi chuyển sang category khác, clear imageFile của category cũ
    if (prevCategoryIdRef.current && prevCategoryIdRef.current !== currentCategoryId) {
      updateCategoryState(prevCategoryIdRef.current, {
        imageFile: undefined,
      });
      currentImageFileRef.current[prevCategoryIdRef.current] = undefined;
      lastResetDataRef.current = null; // ✅ Reset tracking khi chuyển category
    }
    prevCategoryIdRef.current = currentCategoryId;
    
    if (isEditing && categoryData) {
      // ✅ Check xem đã reset form với data này chưa (tránh reset lại không cần thiết)
      const lastReset = lastResetDataRef.current;
      const hasResetForThisData = 
        lastReset?.categoryId === categoryData.id &&
        lastReset?.imageUrl === categoryData.imageUrl;
      
      // ✅ Nếu đã reset form với data này rồi (từ onSuccess), không reset lại
      if (hasResetForThisData) {
        return;
      }
      
      // ✅ Nếu imageFile đang được set (user đang chọn/xóa ảnh), không reset form
      // Sử dụng ref để tránh stale closure
      const categoryId = categoryData.id.toString();
      const currentImageFile = currentImageFileRef.current[categoryId];
      if (currentImageFile !== undefined) {
        return; // ✅ Giữ nguyên form value khi user đang thao tác với ảnh
      }
      
      // ✅ Reset form khi categoryData thay đổi (từ query, không phải từ mutation)
      // Convert null thành undefined cho form (form không chấp nhận null)
      const normalizedImageUrl =
        categoryData.imageUrl === null ? undefined : categoryData.imageUrl ?? undefined;
      
      const lastSynced = lastSyncedImageUrlRef.current[categoryId];
      
      // ✅ Chỉ update categoryState nếu imageUrl thực sự thay đổi (tránh vòng lặp vô hạn)
      if (lastSynced !== normalizedImageUrl) {
        lastSyncedImageUrlRef.current[categoryId] = normalizedImageUrl;
        updateCategoryState(categoryId, {
          latestImageUrl: normalizedImageUrl,
          imageFile: undefined, // ✅ Clear imageFile khi load data mới từ server
          timestampKey: Date.now(),
        });
        currentImageFileRef.current[categoryId] = undefined;
      }
      
      // ✅ Đánh dấu đã reset form với data này
      lastResetDataRef.current = {
        categoryId: categoryData.id,
        imageUrl: categoryData.imageUrl,
      };
      
      form.reset({
        name: categoryData.name,
        slug: categoryData.slug ?? undefined,
        description: categoryData.description ?? undefined,
        imageUrl: normalizedImageUrl, // ✅ undefined khi xóa, string khi có ảnh
        parentId: categoryData.parentId ?? null,
        displayOrder: categoryData.displayOrder ?? undefined,
        status: categoryData.status,
      });
      return;
    }
    if (!isEditing) {
      form.reset(DEFAULT_VALUES);
      setCategoryData(null);
      // ✅ Clear imageFile khi tạo category mới
      updateCategoryState(currentCategoryId, {
        imageFile: undefined,
      });
      currentImageFileRef.current[currentCategoryId] = undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditing, categoryData, categoryData?.id, categoryData?.imageUrl, currentCategoryId]);

  useEffect(() => {
    resetParentSearch();
  }, [open, resetParentSearch]);

  // ✅ Cleanup không cần thiết nữa vì imageFile được quản lý trong categoryState

  // Reset slug edit flag when form opens/closes
  // Use startTransition to avoid cascading renders
  useEffect(() => {
    if (!open) {
      startTransition(() => {
        setIsSlugManuallyEdited(false);
        setActiveTab("basic"); // Reset tab về "basic" khi đóng form
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

  const handleImageChange = async (file: File | null) => {
    if (file) {
      // Use centralized file validation with magic bytes check
      const { validateFile } = await import("@/lib/validation/file-validation");

      const result = await validateFile(file, {
        validateContent: true, // Include magic bytes validation for security
      });

      if (!result.valid) {
        toast.error(result.error || t("admin.forms.category.invalidFile"));
        return;
      }
    }

    // ✅ Update imageFile trong state của category hiện tại (giống brand form)
    updateCategoryState(currentCategoryId, {
      imageFile: file, // ✅ File mới hoặc null khi xóa
    });
    
    if (!file) {
      // ✅ User xóa ảnh - clear form field (giống brand form)
      // Không cần update categoryData vì mutation sẽ xử lý
      form.setValue("imageUrl", undefined, { shouldDirty: true });
      
      // ✅ Update categoryState để UI update ngay lập tức
      updateCategoryState(currentCategoryId, {
        latestImageUrl: null, // ✅ Set null để effectiveValue trả về null
        timestampKey: Date.now(), // ✅ Update timestamp để force re-render
        dataVersion: currentCategoryState.dataVersion + 1, // ✅ Increment version
      });
    }
    // Nếu có file mới, giữ nguyên imageUrl cũ (hoặc undefined) cho đến khi upload xong
  };

  // Create mutation
  const createMutation = useAppMutation<Category, Error, CategoryFormData>({
    mutationFn: async (data) => {
      // Upload image if there's a new File
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        // Upload new file with date partitioning (flat structure)
        imageUrl = await imageManagement.uploadImage(imageFile);
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
    onSuccess: (createdCategory) => {
      // ✅ Cập nhật categoryState để hiển thị ngay lập tức (nếu form vẫn mở)
      if (createdCategory) {
        // ✅ GIỮ NGUYÊN null khi xóa ảnh (không normalize) để logic hiển thị hoạt động đúng
        updateCategoryState(currentCategoryId, {
          latestImageUrl: createdCategory.imageUrl !== undefined ? createdCategory.imageUrl : undefined, // ✅ Giữ null nếu null, undefined nếu undefined
          imageFile: undefined, // ✅ Clear imageFile sau khi upload thành công
          timestampKey: Date.now(),
        });
        currentImageFileRef.current[currentCategoryId] = undefined;
        
        // ✅ Reset form với data mới (giống brand form)
        const normalizedImageUrl =
          createdCategory.imageUrl === null ? undefined : createdCategory.imageUrl ?? undefined;
        form.reset({
          name: createdCategory.name,
          slug: createdCategory.slug ?? undefined,
          description: createdCategory.description ?? undefined,
          imageUrl: normalizedImageUrl,
          parentId: createdCategory.parentId ?? null,
          displayOrder: createdCategory.displayOrder ?? undefined,
          status: createdCategory.status,
        });
        
        // ✅ Sync cache để table update realtime
        syncCategoryCaches(createdCategory);
        
        // ✅ Cập nhật categoryData để CategoryAttributesSection có thể sử dụng categoryId
        // ✅ Đảm bảo createdCategory có id trước khi set
        if (createdCategory?.id) {
          // ✅ Update categoryData và attributesCategoryId cùng lúc
          setCategoryData(createdCategory);
          setAttributesCategoryId(createdCategory.id);
          
          // ✅ Chuyển sang tab "attributes" sau khi tạo category thành công
          // ✅ Sử dụng setTimeout với delay nhỏ để đảm bảo state đã được update
          setTimeout(() => {
            setActiveTab("attributes");
          }, 100);
        }
        
        onCategoryMutated?.(createdCategory, "create");
        // ✅ Tree cần refresh để hiển thị node mới
        queryClient.invalidateQueries({
          queryKey: ["admin", "categories", "tree"],
        });
      }
    },
    // ✅ KHÔNG truyền onClose để giữ form mở sau khi tạo thành công
    // Form sẽ chỉ đóng khi user click Cancel hoặc đóng thủ công
    successMessage: t("admin.forms.category.createCategorySuccess"),
  });

  // Update mutation
  const updateMutation = useAppMutation<
    Category,
    Error,
    { id: number; data: Partial<CategoryFormData> }
  >({
    mutationFn: async ({ id, data }) => {
      // Upload image if there's a new File (giống brand form)
      let imageUrl: string | undefined | null = undefined;
      const previousImageUrl = category?.imageUrl || null;

      if (imageFile) {
        // Upload new file with date partitioning (flat structure)
        imageUrl = await imageManagement.uploadImage(imageFile);
      } else if (imageFile === null) {
        // ✅ User explicitly wants to remove image - set to null để backend xóa
        imageUrl = null;
      } else if (data.imageUrl && typeof data.imageUrl === "string") {
        // ✅ Keep existing URL if no new file and not explicitly removed
        imageUrl = data.imageUrl;
      }
      // ✅ If imageFile is undefined and no existing imageUrl, imageUrl will be undefined (keep existing)

      // Tạo payload với imageUrl có thể là null để xóa ảnh (giống brand form)
      const payload: Record<string, unknown> = {
        ...data,
        // ✅ Gửi null nếu user xóa ảnh, undefined nếu không thay đổi, string nếu có URL mới
        imageUrl:
          imageUrl !== undefined
            ? imageUrl === null
              ? null // ✅ Gửi null để backend xóa ảnh
              : imageUrl
            : undefined,
        // Ensure parentId is null if not selected
        parentId: data.parentId ?? null,
      };

      return categoryService.updateCategory(id, payload);
    },
    queryKey: ["admin", "categories"],
    form: mutationForm,
    onSuccess: (updatedCategory) => {
      // Update cache immediately với data mới để UI update ngay lập tức (realtime)
      if (updatedCategory && category?.id) {
        // ✅ Sync cache TRƯỚC để đảm bảo query cache được cập nhật
        syncCategoryCaches(updatedCategory);
        
        // ✅ Update query cache để categoryDataFromQuery cũng được cập nhật
        queryClient.setQueryData<Category>(
          ["admin", "categories", "detail", category.id],
          updatedCategory
        );
        
        // ✅ Cập nhật categoryState ngay lập tức để form hiển thị đúng (bao gồm khi xóa ảnh)
        // ✅ GIỮ NGUYÊN null khi xóa ảnh (không normalize) để logic hiển thị hoạt động đúng
        updateCategoryState(currentCategoryId, {
          latestImageUrl: updatedCategory.imageUrl !== undefined ? updatedCategory.imageUrl : undefined, // ✅ Giữ null nếu null, undefined nếu undefined
          imageFile: undefined, // ✅ Clear imageFile sau khi update thành công
          timestampKey: Date.now(),
          dataVersion: currentCategoryState.dataVersion + 1, // ✅ Increment để force re-render
        });
        currentImageFileRef.current[currentCategoryId] = undefined;
        
        // ✅ Update local state ngay lập tức
        setCategoryData(updatedCategory);
        onCategoryMutated?.(updatedCategory, "update");
        // ✅ Tree có thể thay đổi (đổi tên/cha), refresh nhẹ
        queryClient.invalidateQueries({
          queryKey: ["admin", "categories", "tree"],
        });
        
        // ✅ Reset form ngay lập tức với data mới (giống brand form)
        // ✅ Normalize null thành undefined cho form (form không chấp nhận null)
        const normalizedImageUrl =
          updatedCategory.imageUrl === null ? undefined : updatedCategory.imageUrl ?? undefined;
        form.reset({
          name: updatedCategory.name,
          slug: updatedCategory.slug ?? undefined,
          description: updatedCategory.description ?? undefined,
          imageUrl: normalizedImageUrl, // ✅ undefined khi xóa, string khi có ảnh
          parentId: updatedCategory.parentId ?? null,
          displayOrder: updatedCategory.displayOrder ?? undefined,
          status: updatedCategory.status,
        });
        
        // ✅ Đánh dấu đã reset form với data mới
        lastResetDataRef.current = {
          categoryId: updatedCategory.id,
          imageUrl: updatedCategory.imageUrl,
        };

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

        // ✅ Chuyển sang tab "attributes" sau khi cập nhật category thành công (nếu đang ở tab "basic")
        if (activeTab === "basic") {
          setActiveTab("attributes");
        }
      }

      // ✅ Không invalidate toàn bộ - syncCategoryCaches đã cập nhật list/detail cache
    },
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      setCategoryState({});
      defaultCategoryStateRef.current = {};
      lastSyncedImageUrlRef.current = {};
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
              <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "basic" | "attributes")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                  <TabsTrigger value="attributes" disabled={!(isEditing || categoryData?.id)}>
                    Cấu hình thuộc tính
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="mt-4">
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
                      const effectiveValue = (() => {
                        // ✅ Ưu tiên imageFile (File hoặc null khi user xóa)
                        if (imageFile !== undefined) {
                          return imageFile; // File hoặc null (khi user xóa)
                        }
                        // ✅ Nếu latestImageUrl là null (đã xóa từ server), trả về null ngay lập tức
                        if (currentCategoryState.latestImageUrl === null) {
                          return null;
                        }
                        // ✅ Nếu latestImageUrl là string (có ảnh), trả về string
                        if (
                          currentCategoryState.latestImageUrl !== undefined &&
                          typeof currentCategoryState.latestImageUrl === "string"
                        ) {
                          return currentCategoryState.latestImageUrl;
                        }
                        // ✅ Nếu categoryData.imageUrl là null (đã xóa từ server), trả về null
                        if (categoryData?.imageUrl === null) {
                          return null;
                        }
                        // ✅ Nếu field.value là null (user đã xóa trong form), trả về null
                        if (field.value === null) {
                          return null;
                        }
                        // ✅ Nếu field.value là string (có ảnh trong form), trả về string
                        if (field.value !== undefined && field.value !== null) {
                          return field.value;
                        }
                        // ✅ Fallback: trả về từ categoryData hoặc undefined
                        return categoryData?.imageUrl || undefined;
                      })();

                      const imageKey = (() => {
                        if (imageFile !== undefined) {
                          if (imageFile instanceof File) {
                            return `file-${imageFile.name}-${imageFile.size}`;
                          }
                          return "null";
                        }
                        if (currentCategoryState.latestImageUrl !== undefined) {
                          return typeof currentCategoryState.latestImageUrl ===
                            "string"
                            ? currentCategoryState.latestImageUrl
                            : "null";
                        }
                        if (field.value !== undefined && field.value !== null) {
                          return typeof field.value === "string"
                            ? field.value
                            : "null";
                        }
                        return categoryData?.imageUrl || "no-image";
                      })();

                      const previewUrl =
                        imageFile === undefined &&
                        currentCategoryState.latestImageUrl === undefined &&
                        field.value === undefined &&
                        field.value !== null && // ✅ Không dùng previewUrl nếu field.value là null (user đã xóa)
                        categoryData?.imageUrl &&
                        categoryData.imageUrl !== null && // ✅ Không dùng previewUrl nếu imageUrl là null (đã xóa)
                        currentCategoryState.latestImageUrl !== null // ✅ Không dùng previewUrl nếu user đã xóa (latestImageUrl = null)
                          ? `${categoryData.imageUrl}?_t=${currentCategoryState.timestampKey}`
                          : null;

                      return (
                        <ImageUpload
                          key={`category-image-${currentCategoryId}-${imageKey}-v${currentCategoryState.dataVersion}-t${currentCategoryState.timestampKey}`}
                          variant="rectangle"
                          folder={uploadFolder}
                          size="lg"
                          value={effectiveValue}
                          cacheKey={currentCategoryState.timestampKey}
                          previewUrl={previewUrl}
                          onChange={handleImageChange}
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
                </TabsContent>

                <TabsContent value="attributes" className="mt-4">
                  <CategoryAttributesSection 
                    categoryId={attributesCategoryId} 
                  />
                </TabsContent>
              </Tabs>
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
