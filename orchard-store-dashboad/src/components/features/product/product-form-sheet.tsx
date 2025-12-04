"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAppMutation } from "@/hooks/use-app-mutation";
import { FormField } from "@/components/ui/form-field";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DynamicAttributesSection } from "@/components/features/catalog/dynamic-attributes-section";
import { useDynamicAttributes } from "@/hooks/use-dynamic-attributes";
import { useVariantAttributes } from "@/hooks/use-category-attributes";
import { generateProductFormSchemaWithAttributes } from "@/lib/utils/generate-zod-schema";
import { productFormSchema } from "@/lib/schemas/product.schema";
import { useBrands } from "@/hooks/use-brands";
import { useCategoriesTree } from "@/hooks/use-categories";
import { useProduct } from "@/hooks/use-products";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import {
  VariantMatrix,
  SelectedAttribute,
} from "@/components/features/product/variant/variant-matrix";
import { VariantAttributeSelector } from "@/components/features/product/variant/variant-attribute-selector";
import { slugify } from "@/lib/utils";
import { ImageUpload } from "@/components/shared/image-upload";
import type { Brand } from "@/types/catalog.types";
import type { Category } from "@/types/catalog.types";
import type {
  ProductDTO,
  ProductFormData,
  ProductImageDTO,
} from "@/types/product.types";
import type { ProductFormSchema } from "@/lib/schemas/product.schema";

interface ProductFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductDTO | null;
  onProductMutated?: (product: ProductDTO, action: "create" | "update") => void;
}

const DEFAULT_VALUES: Partial<
  ProductFormSchema & { attributes?: Record<string, any> }
> = {
  name: "",
  brandId: undefined,
  categoryId: null,
  price: undefined,
  description: "",
  variants: [],
  attributes: {},
};

export function ProductFormSheet({
  open,
  onOpenChange,
  product,
  onProductMutated,
}: ProductFormSheetProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(product);
  const [activeTab, setActiveTab] = useState<
    "basic" | "attributes" | "variants"
  >("basic");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // Fetch product details if editing
  const { data: productData, isLoading: isLoadingProduct } = useProduct(
    product?.id ?? null
  );

  // Get dynamic attributes for selected category
  const { attributeGroups } = useDynamicAttributes(categoryId);
  const {
    data: variantAttributes,
    isLoading: isLoadingVariantAttributes,
    error: variantAttributesError,
  } = useVariantAttributes(categoryId);

  // Generate dynamic schema based on category attributes
  const dynamicSchema = useMemo(() => {
    return generateProductFormSchemaWithAttributes(
      productFormSchema,
      attributeGroups
    );
  }, [attributeGroups]);

  // Form setup
  const form = useForm<
    ProductFormSchema & { attributes?: Record<string, any> }
  >({
    resolver: zodResolver(dynamicSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const [variantSelections, setVariantSelections] = useState<
    Record<string, string[]>
  >({});

  // State for images
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
    null
  );
  const [detailImageFiles, setDetailImageFiles] = useState<File[]>([]);
  const [detailImagePreviewUrls, setDetailImagePreviewUrls] = useState<
    string[]
  >([]);

  // Watch categoryId to update attributes
  const watchedCategoryId = form.watch("categoryId" as any);
  useEffect(() => {
    if (watchedCategoryId) {
      setCategoryId(watchedCategoryId);
    }
  }, [watchedCategoryId]);

  // Map field names to tabs
  // Fields starting with "attributes." belong to attributes tab
  // Fields related to variants belong to variants tab
  const getTabForField = (fieldName: string): string => {
    // Check if it's an attribute field
    if (fieldName.startsWith("attributes.")) {
      return "attributes";
    }

    // Check if it's a variant field (including array-level errors like "variants")
    if (
      fieldName.startsWith("variants.") ||
      fieldName === "variants" ||
      fieldName.includes("variant")
    ) {
      return "variants";
    }

    // Basic fields
    const basicFields = [
      "name",
      "brandId",
      "categoryId",
      "price",
      "description",
    ];
    if (basicFields.includes(fieldName)) {
      return "basic";
    }

    // Default to basic
    return "basic";
  };

  // Function to handle first error field - scroll and switch tab
  const handleFirstErrorField = (fieldName: string) => {
    // Determine which tab contains this field
    const tab = getTabForField(fieldName);

    // Switch to the correct tab if needed
    if (tab !== activeTab) {
      setActiveTab(tab as any);
    }

    // Wait a bit for tab to switch, then scroll and focus
    setTimeout(
      () => {
        // Special handling for array-level errors (e.g., "variants" không được để trống)
        if (fieldName === "variants") {
          // First try to find the error message box by ID
          const errorBox = document.getElementById("variants-error-message");

          if (errorBox) {
            errorBox.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            return;
          }

          // If error box not found, find the variants tab content
          const variantsTabContent = document.querySelector(
            '[value="variants"][role="tabpanel"], [data-state="active"][data-value="variants"]'
          ) as HTMLElement;

          // Alternative: find by TabsContent with value="variants"
          const variantsContent = Array.from(
            document.querySelectorAll(
              '[role="tabpanel"], [class*="TabsContent"]'
            )
          ).find((el) => {
            const text = el.textContent || "";
            return (
              text.includes("Sinh danh sách biến thể") ||
              text.includes("Ma trận biến thể")
            );
          }) as HTMLElement;

          const targetElement = variantsTabContent || variantsContent;

          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });

            // Try to find the "Sinh danh sách biến thể" button
            setTimeout(() => {
              const buttons = targetElement.querySelectorAll(
                'button[type="button"]'
              );
              for (const button of Array.from(buttons)) {
                const buttonText = button.textContent || "";
                if (buttonText.includes("Sinh danh sách biến thể")) {
                  button.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                  (button as HTMLElement).focus();
                  return;
                }
              }
            }, 300);
          }
          return;
        }

        // Try multiple selectors to find the field element
        // Escape special characters in fieldName for CSS selector
        const escapedFieldName = fieldName.replace(/[\[\]\.]/g, "\\$&");

        const selectors = [
          `[name="${fieldName}"]`,
          `[name="${escapedFieldName}"]`,
        ];

        // Only add ID selector if fieldName is a valid CSS identifier
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(fieldName)) {
          selectors.push(`#${fieldName}`);
        }

        // Add more selectors for nested fields
        selectors.push(
          `[id*="${escapedFieldName}"]`,
          `input[name="${fieldName}"]`,
          `input[name="${escapedFieldName}"]`,
          `select[name="${fieldName}"]`,
          `select[name="${escapedFieldName}"]`,
          `textarea[name="${fieldName}"]`,
          `textarea[name="${escapedFieldName}"]`
        );

        let fieldElement: HTMLElement | null = null;

        for (const selector of selectors) {
          try {
            fieldElement = document.querySelector(selector) as HTMLElement;
            if (fieldElement) break;
          } catch (e) {
            // Skip invalid selectors
            console.warn(`Invalid selector: ${selector}`, e);
            continue;
          }
        }

        // If not found, try to find by data attribute or aria-label
        if (!fieldElement) {
          const allInputs = document.querySelectorAll(
            "input, select, textarea"
          );
          const fieldNamePart = fieldName.split(".").pop() || fieldName;
          for (const input of Array.from(allInputs)) {
            const name = (input as HTMLElement).getAttribute("name");
            if (name && (name === fieldName || name.includes(fieldNamePart))) {
              fieldElement = input as HTMLElement;
              break;
            }
          }
        }

        // For nested fields like "variants.0.sku", try to find the first variant field
        if (!fieldElement && fieldName.startsWith("variants.")) {
          const variantIndex = fieldName.match(/variants\.(\d+)/)?.[1];
          if (variantIndex) {
            // Try to find any field in that variant row
            const variantFields = document.querySelectorAll(
              `[name^="variants.${variantIndex}."]`
            );
            if (variantFields.length > 0) {
              fieldElement = variantFields[0] as HTMLElement;
            }
          }
        }

        if (fieldElement) {
          // Scroll to element
          fieldElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Focus on element after scroll
          setTimeout(() => {
            if (
              fieldElement instanceof HTMLInputElement ||
              fieldElement instanceof HTMLSelectElement ||
              fieldElement instanceof HTMLTextAreaElement
            ) {
              fieldElement.focus();
            } else {
              // Try to find input inside the element
              const input = fieldElement.querySelector(
                "input, select, textarea"
              ) as HTMLElement;
              if (input) {
                input.focus();
              }
            }
          }, 300);
        }
      },
      tab !== activeTab ? 200 : 100
    ); // Wait longer if switching tabs
  };

  // Fetch brands and categories
  const { data: brandsPage, isLoading: isLoadingBrands } = useBrands({
    page: 0,
    size: 1000,
    status: "ACTIVE",
  });
  const brands = useMemo(() => brandsPage?.content ?? [], [brandsPage]);
  const { data: categories, isLoading: isLoadingCategories } =
    useCategoriesTree();

  // Mutations - truyền form để tự động hiển thị lỗi validation
  // Sử dụng custom hook với onFirstErrorField để tự động scroll/focus vào field có lỗi
  const createMutation = useCreateProduct(form, handleFirstErrorField);
  const updateMutation = useUpdateProduct(form, handleFirstErrorField);

  // Reset form when product changes
  useEffect(() => {
    if (isEditing && productData) {
      // Load variants - map từ ProductDTO sang form format
      const mappedVariants =
        productData.variants?.map((v) => ({
          id: v.id,
          sku: v.sku,
          price: typeof v.price === "number" ? v.price : Number(v.price),
          stock: v.stockQuantity ?? v.stock ?? 0,
          isEnabled: true, // Default enabled
          imageUrl: v.imageUrl,
          variantName: v.variantName,
          attributes: v.attributes || v.cachedAttributes || {},
        })) || [];

      // Calculate price from variants if not available in productData
      let productPrice = productData.price ?? 0;
      if (!productPrice && mappedVariants.length > 0) {
        // Get the first variant's price or minimum price
        const prices = mappedVariants.map((v) => v.price).filter((p) => p > 0);
        if (prices.length > 0) {
          productPrice = Math.min(...prices);
        }
      }

      form.reset({
        name: productData.name ?? "",
        brandId: productData.brandId,
        price: productPrice,
        description: productData.description ?? "",
        variants: mappedVariants,
        attributes: productData.attributes ?? {},
        categoryId: productData.categoryId,
      });
      setCategoryId(productData.categoryId ?? null);

      // Load images
      if (productData.images && productData.images.length > 0) {
        // Primary image (thumbnail)
        const primaryImage =
          productData.images.find((img) => img.isPrimary) ||
          productData.images[0];
        if (primaryImage) {
          setThumbnailPreviewUrl(primaryImage.imageUrl);
        }

        // Detail images (non-primary)
        const detailImages = productData.images
          .filter((img) => !img.isPrimary)
          .map((img) => img.imageUrl);
        setDetailImagePreviewUrls(detailImages);
      } else {
        // Fallback to primaryImageUrl if no images array
        if (productData.primaryImageUrl) {
          setThumbnailPreviewUrl(productData.primaryImageUrl);
        }
      }
    } else if (!isEditing) {
      form.reset(DEFAULT_VALUES);
      setCategoryId(null);
      setThumbnailFile(null);
      setThumbnailPreviewUrl(null);
      setDetailImageFiles([]);
      setDetailImagePreviewUrls([]);
    }
  }, [productData, isEditing, form]);

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      setCategoryId(null);
      setVariantSelections({});
      setActiveTab("basic");
    }
  }, [open, form]);

  // Reset variant selections when category changes
  useEffect(() => {
    setVariantSelections({});
  }, [categoryId]);

  const selectedVariantAttributes = useMemo<SelectedAttribute[]>(() => {
    if (!variantAttributes) return [];
    return variantAttributes
      .map((attribute) => ({
        key: attribute.attributeKey,
        label: attribute.attributeName,
        values: variantSelections[attribute.attributeKey] ?? [],
        type:
          attribute.attributeKey === "mau_sac" ||
          attribute.attributeName?.toLowerCase().includes("màu")
            ? ("COLOR" as const)
            : ("DEFAULT" as const),
      }))
      .filter((attr) => attr.values.length > 0);
  }, [variantAttributes, variantSelections]);

  const onSubmit = (
    data: ProductFormSchema & { attributes?: Record<string, any> }
  ) => {
    // Generate variantName for each variant from attributes
    const variantsWithName = data.variants?.map((variant, index) => {
      // Generate variant name from attributes (same logic as VariantMatrix)
      const combo = variant.attributes || {};
      let variantName = "";

      if (combo && Object.keys(combo).length > 0) {
        // Generate từ attributes: "50 ml - Eau de Parfum"
        variantName = Object.entries(combo)
          .map(([key, value]) => {
            // Value có thể là string hoặc object, lấy string value
            const val = typeof value === "string" ? value : String(value);
            return val || key;
          })
          .filter(Boolean)
          .join(" - ");
      }

      // Fallback: dùng SKU hoặc tên sản phẩm + index
      if (!variantName || variantName.trim() === "") {
        variantName = variant.sku
          ? `${data.name} - ${variant.sku}`
          : `${data.name} - Biến thể ${index + 1}`;
      }

      return {
        ...variant,
        variantName: variantName.trim(),
      };
    });

    const formData: ProductFormData = {
      name: data.name,
      brandId: data.brandId,
      categoryId: data.categoryId ?? null,
      price: data.price,
      description: data.description,
      variants: variantsWithName,
      attributes: data.attributes,
      thumbnail: thumbnailFile || thumbnailPreviewUrl || null,
      detailImages:
        detailImageFiles.length > 0
          ? detailImageFiles
          : detailImagePreviewUrls.filter(Boolean).length > 0
          ? detailImagePreviewUrls.filter(Boolean)
          : undefined,
    };

    if (isEditing && product?.id) {
      updateMutation.mutate(
        { id: product.id, data: formData },
        {
          onSuccess: (updatedProduct) => {
            onProductMutated?.(updatedProduct, "update");
            onOpenChange(false);
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: (createdProduct) => {
          onProductMutated?.(createdProduct, "create");
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Cập nhật thông tin sản phẩm"
              : "Điền thông tin để tạo sản phẩm mới"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SheetBody>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                <TabsTrigger value="attributes" disabled={!categoryId}>
                  Đặc tính sản phẩm
                </TabsTrigger>
                <TabsTrigger value="variants">Biến thể</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 py-4">
                <FormField
                  label="Hình ảnh đại diện"
                  htmlFor="thumbnail"
                  description="Ảnh chính hiển thị trên danh sách sản phẩm"
                >
                  <ImageUpload
                    value={thumbnailFile}
                    previewUrl={thumbnailPreviewUrl}
                    onChange={(file) => setThumbnailFile(file)}
                    variant="rectangle"
                    size="lg"
                    folder="products"
                  />
                </FormField>

                <FormField
                  label="Tên sản phẩm"
                  htmlFor="name"
                  required
                  error={form.formState.errors.name}
                >
                  <Input
                    {...form.register("name")}
                    placeholder="Nhập tên sản phẩm..."
                  />
                </FormField>

                <FormField
                  label="Thương hiệu"
                  htmlFor="brandId"
                  required
                  error={form.formState.errors.brandId}
                >
                  <Controller
                    name="brandId"
                    control={form.control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                      >
                        <option value="">Chọn thương hiệu...</option>
                        {brands?.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </FormField>

                <FormField
                  label="Danh mục"
                  htmlFor="categoryId"
                  required
                  error={form.formState.errors.categoryId as any}
                  description="Chọn danh mục để hiển thị các thuộc tính tương ứng"
                >
                  <Controller
                    name="categoryId"
                    control={form.control}
                    render={({ field }) => (
                      <select
                        {...field}
                        onChange={(e) => {
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          );
                          setCategoryId(
                            e.target.value ? Number(e.target.value) : null
                          );
                        }}
                        className="flex h-11 w-full rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                      >
                        <option value="">Chọn danh mục...</option>
                        {categories?.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {"  ".repeat(cat.level ?? 0)}
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </FormField>

                <FormField
                  label="Giá"
                  htmlFor="price"
                  required
                  error={form.formState.errors.price}
                >
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register("price", { valueAsNumber: true })}
                    placeholder="Nhập giá sản phẩm..."
                  />
                </FormField>

                <FormField
                  label="Mô tả"
                  htmlFor="description"
                  error={form.formState.errors.description}
                >
                  <textarea
                    {...form.register("description")}
                    rows={4}
                    className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                    placeholder="Nhập mô tả sản phẩm..."
                  />
                </FormField>

                <FormField
                  label="Hình ảnh chi tiết"
                  htmlFor="detailImages"
                  description="Thêm nhiều ảnh để hiển thị chi tiết sản phẩm"
                >
                  <div className="space-y-4">
                    {/* Existing images preview */}
                    {detailImagePreviewUrls.map((url, index) => (
                      <div key={`preview-${index}`} className="relative">
                        <ImageUpload
                          value={detailImageFiles[index] || null}
                          previewUrl={url}
                          onChange={(file) => {
                            const newFiles = [...detailImageFiles];
                            const newUrls = [...detailImagePreviewUrls];
                            if (file) {
                              newFiles[index] = file;
                            } else {
                              // Remove image
                              newFiles.splice(index, 1);
                              newUrls.splice(index, 1);
                            }
                            setDetailImageFiles(newFiles);
                            setDetailImagePreviewUrls(newUrls);
                          }}
                          variant="rectangle"
                          size="md"
                          folder="products"
                        />
                      </div>
                    ))}

                    {/* Add new image button */}
                    <div className="relative">
                      <ImageUpload
                        value={null}
                        previewUrl={null}
                        onChange={(file) => {
                          if (file) {
                            setDetailImageFiles([...detailImageFiles, file]);
                            setDetailImagePreviewUrls([
                              ...detailImagePreviewUrls,
                              "",
                            ]);
                          }
                        }}
                        variant="rectangle"
                        size="md"
                        folder="products"
                      />
                    </div>
                  </div>
                </FormField>
              </TabsContent>

              <TabsContent value="attributes" className="space-y-6 py-4">
                <DynamicAttributesSection
                  categoryId={categoryId}
                  form={form as any}
                />
              </TabsContent>

              <TabsContent value="variants" className="space-y-6 py-4">
                <VariantAttributeSelector
                  categoryId={categoryId}
                  attributes={variantAttributes}
                  value={variantSelections}
                  onChange={setVariantSelections}
                  isLoading={isLoadingVariantAttributes}
                  error={variantAttributesError}
                />

                {/* Display variant validation error if exists */}
                {form.formState.errors.variants && (
                  <div
                    id="variants-error-message"
                    data-field-error="variants"
                    className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive"
                  >
                    <p className="font-medium">
                      {typeof form.formState.errors.variants === "object" &&
                      "message" in form.formState.errors.variants
                        ? form.formState.errors.variants.message
                        : "Vui lòng tạo ít nhất một biến thể cho sản phẩm"}
                    </p>
                    <p className="mt-1 text-xs text-destructive/80">
                      Chọn giá trị thuộc tính ở trên và bấm &quot;Sinh danh sách
                      biến thể&quot; để tạo các biến thể.
                    </p>
                  </div>
                )}

                <VariantMatrix
                  form={form as any}
                  selectedAttributes={selectedVariantAttributes}
                  productSlug={
                    productData?.slug || slugify(form.watch("name") || "")
                  }
                  defaultPrice={form.watch("price") || 0}
                />
              </TabsContent>
            </Tabs>
          </SheetBody>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting ||
                createMutation.isPending ||
                updateMutation.isPending ||
                isLoadingProduct
              }
            >
              {(form.formState.isSubmitting ||
                createMutation.isPending ||
                updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Cập nhật" : "Tạo mới"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
