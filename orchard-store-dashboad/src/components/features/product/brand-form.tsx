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
  SheetBody,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/features/product/image-upload";
import { slugify } from "@/lib/utils";
import { useCreateBrand, useUpdateBrand } from "@/hooks/use-brands";
import type { Brand, BrandFormData } from "@/types/catalog.types";
import { brandFormSchema } from "@/types/catalog.types";

interface BrandFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Brand | null;
}

const DEFAULT_VALUES: BrandFormData = {
  name: "",
  slug: "",
  description: "",
  logoUrl: "",
  status: "ACTIVE",
  country: "",
  websiteUrl: "",
  displayOrder: undefined,
};

export function BrandForm({ open, onOpenChange, initialData }: BrandFormProps) {
  const isEditing = Boolean(initialData);
  const [hasManualSlugEdit, setHasManualSlugEdit] = useState(false);
  const slugManuallyEdited = initialData ? true : hasManualSlugEdit;

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const createBrand = useCreateBrand({
    onSuccess: () => {
      toast.success("Brand created successfully");
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      setHasManualSlugEdit(false);
    },
    onError: () => toast.error("Failed to create brand"),
  });

  const updateBrand = useUpdateBrand({
    onSuccess: () => {
      toast.success("Brand updated successfully");
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      setHasManualSlugEdit(false);
    },
    onError: () => toast.error("Failed to update brand"),
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description ?? "",
        logoUrl: initialData.logoUrl ?? "",
        status: initialData.status,
        country: initialData.country ?? "",
        websiteUrl: initialData.websiteUrl ?? "",
        displayOrder: initialData.displayOrder ?? undefined,
      });
      // Keep slug locked to initial value when editing existing brand
    } else {
      form.reset(DEFAULT_VALUES);
      startTransition(() => setHasManualSlugEdit(false));
    }
  }, [initialData, form]);

  const watchedName = useWatch({
    control: form.control,
    name: "name",
  });
  const logoValue = useWatch({
    control: form.control,
    name: "logoUrl",
  });

  useEffect(() => {
    if (!slugManuallyEdited && watchedName) {
      form.setValue("slug", slugify(watchedName));
    }
  }, [watchedName, slugManuallyEdited, form]);

  const isSubmitting = useMemo(
    () => createBrand.isPending || updateBrand.isPending,
    [createBrand.isPending, updateBrand.isPending]
  );

  const handleSubmit = (values: BrandFormData) => {
    if (isEditing && initialData) {
      updateBrand.mutate({ id: initialData.id, data: values });
    } else {
      createBrand.mutate(values);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <form
          className="flex h-full flex-col"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold text-slate-900">
              {isEditing ? "Edit Brand" : "Add Brand"}
            </SheetTitle>
            <SheetDescription className="text-sm text-slate-500">
              Manage how brands appear across the storefront.
            </SheetDescription>
          </SheetHeader>

          <SheetBody>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Aroma Labs"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium text-slate-700">
                  Slug
                </Label>
                <Input
                  id="slug"
                  placeholder="aroma-labs"
                  {...form.register("slug", {
                    onChange: () => setHasManualSlugEdit(true),
                  })}
                />
                {form.formState.errors.slug && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Description
                </Label>
                <textarea
                  id="description"
                  placeholder="Short bio of the brand"
                  className="min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:text-gray-900"
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <ImageUpload
                label="Logo"
                value={logoValue ?? ""}
                onChange={(value) => form.setValue("logoUrl", value ?? "")}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium text-slate-700">
                    Country
                  </Label>
                  <Input
                    id="country"
                    placeholder="France"
                    {...form.register("country")}
                  />
                  {form.formState.errors.country && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.country.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl" className="text-sm font-medium text-slate-700">
                    Website
                  </Label>
                  <Input
                    id="websiteUrl"
                    placeholder="https://brand.com"
                    {...form.register("websiteUrl")}
                  />
                  {form.formState.errors.websiteUrl && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.websiteUrl.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayOrder" className="text-sm font-medium text-slate-700">
                    Display Order
                  </Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    placeholder="0"
                    {...form.register("displayOrder")}
                  />
                  {form.formState.errors.displayOrder && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.displayOrder.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-slate-700">
                    Status
                  </Label>
                  <select
                    id="status"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    {...form.register("status")}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </SheetBody>

          <SheetFooter>
            <div className="flex w-full gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg"
                isLoading={isSubmitting}
              >
                {isEditing ? "Save changes" : "Create Brand"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
