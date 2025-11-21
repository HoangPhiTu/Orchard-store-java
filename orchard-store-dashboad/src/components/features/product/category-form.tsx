"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/features/product/image-upload";
import { slugify } from "@/lib/utils";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";
import type { Category, CategoryFormData } from "@/types/catalog.types";
import { categoryFormSchema } from "@/types/catalog.types";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  initialData?: Category | null;
}

const DEFAULT_VALUES: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  status: "ACTIVE",
  parentId: undefined,
  displayOrder: undefined,
};

export function CategoryForm({
  open,
  onOpenChange,
  categories,
  initialData,
}: CategoryFormProps) {
  const isEditing = Boolean(initialData);
  const [hasManualSlugEdit, setHasManualSlugEdit] = useState(false);
  const slugManuallyEdited = initialData ? true : hasManualSlugEdit;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const createCategory = useCreateCategory({
    onSuccess: () => {
      toast.success("Category created");
      onOpenChange(false);
      setHasManualSlugEdit(false);
      form.reset(DEFAULT_VALUES);
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateCategory = useUpdateCategory({
    onSuccess: () => {
      toast.success("Category updated");
      onOpenChange(false);
      setHasManualSlugEdit(false);
      form.reset(DEFAULT_VALUES);
    },
    onError: () => toast.error("Failed to update category"),
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description ?? "",
        imageUrl: initialData.imageUrl ?? "",
        status: initialData.status,
        parentId: initialData.parentId ?? undefined,
        displayOrder: initialData.displayOrder ?? undefined,
      });
      // Keep slug locked to initial value while editing existing category
    } else {
      form.reset(DEFAULT_VALUES);
      startTransition(() => setHasManualSlugEdit(false));
    }
  }, [initialData, form]);

  const watchedName = useWatch({
    control: form.control,
    name: "name",
  });
  const imageValue = useWatch({
    control: form.control,
    name: "imageUrl",
  });
  const parentIdValue = useWatch({
    control: form.control,
    name: "parentId",
  });

  useEffect(() => {
    if (!slugManuallyEdited && watchedName) {
      form.setValue("slug", slugify(watchedName));
    }
  }, [watchedName, slugManuallyEdited, form]);

  const parentOptions = useMemo(() => {
    if (!initialData) return categories;
    return categories.filter((category) => category.id !== initialData.id);
  }, [categories, initialData]);

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const handleSubmit = (values: CategoryFormData) => {
    const payload = { ...values, parentId: values.parentId ?? undefined };

    if (isEditing && initialData) {
      updateCategory.mutate({ id: initialData.id, data: payload });
    } else {
      createCategory.mutate(payload);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <form
          className="flex h-full flex-col"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Category" : "Create Category"}
            </SheetTitle>
            <SheetDescription>
              Organize the catalog structure with categories and subcategories.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Skin Care"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-rose-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="skin-care"
                {...form.register("slug", {
                  onChange: () => setHasManualSlugEdit(true),
                })}
              />
              {form.formState.errors.slug && (
                <p className="text-xs text-rose-500">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="min-h-[100px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                placeholder="Describe what products belong to this category"
                {...form.register("description")}
              />
            </div>

            <ImageUpload
              label="Category image"
              value={imageValue ?? ""}
              onChange={(value) => form.setValue("imageUrl", value ?? "")}
            />

            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Category</Label>
              <select
                id="parentId"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                value={parentIdValue ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  form.setValue(
                    "parentId",
                    value === "" ? undefined : Number(value)
                  );
                }}
              >
                <option value="">(No parent)</option>
                {parentOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.parentId && (
                <p className="text-xs text-rose-500">
                  {form.formState.errors.parentId.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  placeholder="0"
                  {...form.register("displayOrder")}
                />
                {form.formState.errors.displayOrder && (
                  <p className="text-xs text-rose-500">
                    {form.formState.errors.displayOrder.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  {...form.register("status")}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <SheetFooter>
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800"
                isLoading={isSubmitting}
              >
                {isEditing ? "Save changes" : "Create Category"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
