"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/image-upload";
import { useImageManagement } from "@/hooks/use-image-management";
import { useAttribute } from "@/hooks/use-attributes";
import { attributeService } from "@/services/attribute.service";
import type {
  ProductAttribute,
  AttributeFormData,
  AttributeValue,
} from "@/types/attribute.types";
import { attributeFormSchema } from "@/types/attribute.types";
import { generateAttributeKey } from "@/lib/utils/attribute-helpers";
import { useI18n } from "@/hooks/use-i18n";

interface AttributeFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute?: ProductAttribute | null;
  /**
   * Domain xác định Thuộc tính này dùng cho Nước hoa, Mỹ phẩm hay dùng chung.
   * Nếu không truyền, mặc định COMMON.
   */
  domain?: "PERFUME" | "COSMETICS" | "COMMON";
}

const DEFAULT_VALUES: AttributeFormData = {
  attributeKey: "",
  attributeName: "",
  attributeType: "SELECT",
  dataType: "STRING",
  filterable: true,
  searchable: false,
  required: false,
  variantSpecific: false,
  displayOrder: 0,
  unit: undefined,
  domain: "COMMON",
  status: "ACTIVE",
  values: [],
};

export function AttributeFormSheet({
  open,
  onOpenChange,
  attribute,
  domain = "COMMON",
}: AttributeFormSheetProps) {
  const { t } = useI18n();
  const isEditing = Boolean(attribute);
  const [formKey, setFormKey] = useState(0);
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);
  const [activeDomain, setActiveDomain] = useState<
    "PERFUME" | "COSMETICS" | "COMMON"
  >(domain);

  // Image management hook for attribute values (use "others" as entity type)
  const imageManagement = useImageManagement("others");

  // Fetch attribute details if editing
  const { data: attributeData, isLoading: isLoadingAttribute } = useAttribute(
    attribute?.id ?? null
  );

  const form = useForm<AttributeFormData>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      domain,
    },
  });

  // useFieldArray for dynamic values
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "values",
  });

  // Reset form when attribute data changes or when opening/closing
  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      setFormKey((prev) => prev + 1);
      setKeyManuallyEdited(false);
      setActiveDomain(domain);
      return;
    }

    if (isEditing && attributeData) {
      form.reset({
        attributeKey: attributeData.attributeKey ?? "",
        attributeName: attributeData.attributeName ?? "",
        attributeType: attributeData.attributeType ?? "SELECT",
        dataType: attributeData.dataType ?? "STRING",
        filterable: attributeData.filterable ?? true,
        searchable: attributeData.searchable ?? false,
        required: attributeData.required ?? false,
        variantSpecific: attributeData.variantSpecific ?? false,
        displayOrder: attributeData.displayOrder ?? 0,
        unit: attributeData.unit ?? undefined,
        domain: attributeData.domain ?? domain,
        status: attributeData.status ?? "ACTIVE",
        values: (attributeData.values ?? []).map((v) => ({
          id: v.id ?? undefined,
          value: v.value,
          displayValue: v.displayValue,
          imageUrl: v.imageUrl ?? undefined,
          hexColor: v.hexColor ?? undefined,
          displayOrder: v.displayOrder ?? undefined,
          isDefault: v.isDefault ?? undefined,
        })),
      });
      setKeyManuallyEdited(!!attributeData.attributeKey);
      setActiveDomain((attributeData.domain as typeof activeDomain) || domain);
    } else if (!isEditing) {
      form.reset(DEFAULT_VALUES);
      setKeyManuallyEdited(false);
    }
  }, [open, isEditing, attributeData, form]);

  // Watch attributeName to auto-generate attributeKey
  const nameValue = form.watch("attributeName");
  const variantSpecific = form.watch("variantSpecific");
  const attributeType = form.watch("attributeType");

  // Auto-generate attributeKey from attributeName
  useEffect(() => {
    if (nameValue && nameValue.trim() !== "") {
      const generatedKey = generateAttributeKey(nameValue);
      if (!keyManuallyEdited && generatedKey) {
        form.setValue("attributeKey", generatedKey, { shouldValidate: false });
      }
    } else {
      if (!keyManuallyEdited) {
        form.setValue("attributeKey", "", { shouldValidate: false });
      }
    }
  }, [nameValue, keyManuallyEdited, form]);

  // Logic: Nếu is_variant_specific = TRUE, thì attribute_type phải là SELECT
  useEffect(() => {
    if (variantSpecific === true && attributeType !== "SELECT") {
      form.setValue("attributeType", "SELECT", { shouldValidate: false });
    }
  }, [variantSpecific, attributeType, form]);

  // Tự động set các giá trị mặc định cho các trường ẩn
  useEffect(() => {
    // dataType: Mặc định là 'STRING'
    if (!form.getValues("dataType")) {
      form.setValue("dataType", "STRING", { shouldValidate: false });
    }
    // displayOrder: Mặc định là 0
    if (
      form.getValues("displayOrder") === undefined ||
      form.getValues("displayOrder") === null
    ) {
      form.setValue("displayOrder", 0, { shouldValidate: false });
    }
    // status: Mặc định là 'ACTIVE'
    if (!form.getValues("status")) {
      form.setValue("status", "ACTIVE", { shouldValidate: false });
    }
    // filterable: Mặc định là true
    if (
      form.getValues("filterable") === undefined ||
      form.getValues("filterable") === null
    ) {
      form.setValue("filterable", true, { shouldValidate: false });
    }
    // searchable: Mặc định là false
    if (
      form.getValues("searchable") === undefined ||
      form.getValues("searchable") === null
    ) {
      form.setValue("searchable", false, { shouldValidate: false });
    }
    // required: Mặc định là false
    if (
      form.getValues("required") === undefined ||
      form.getValues("required") === null
    ) {
      form.setValue("required", false, { shouldValidate: false });
    }
  }, [form]);

  // Watch unit để hiển thị bên cạnh displayValue
  const unitValue = form.watch("unit");

  // Watch tất cả displayValue để tự động copy sang value
  const allDisplayValues = form.watch("values");

  // Tự động copy displayValue → value và set displayOrder theo index
  useEffect(() => {
    if (!allDisplayValues || allDisplayValues.length === 0) return;

    allDisplayValues.forEach((val, index) => {
      // Tự động copy displayValue → value (slugify)
      if (val.displayValue && val.displayValue.trim() !== "") {
        const generatedValue = generateAttributeKey(val.displayValue);
        const currentValue = form.getValues(`values.${index}.value`);
        // Luôn update value từ displayValue để đảm bảo đồng bộ
        if (currentValue !== generatedValue) {
          form.setValue(`values.${index}.value`, generatedValue, {
            shouldValidate: false,
          });
        }
      } else if (!val.displayValue || val.displayValue.trim() === "") {
        // Nếu displayValue rỗng, clear value
        const currentValue = form.getValues(`values.${index}.value`);
        if (currentValue && currentValue !== "") {
          form.setValue(`values.${index}.value`, "", {
            shouldValidate: false,
          });
        }
      }
      // Tự động set displayOrder theo index
      const currentDisplayOrder = form.getValues(
        `values.${index}.displayOrder`
      );
      if (currentDisplayOrder !== index) {
        form.setValue(`values.${index}.displayOrder`, index, {
          shouldValidate: false,
        });
      }
    });
  }, [allDisplayValues, form]);

  // Create mutation
  const createMutation = useAppMutation<
    ProductAttribute,
    Error,
    AttributeFormData,
    unknown,
    AttributeFormData
  >({
    mutationFn: (data) => attributeService.createAttribute(data),
    queryKey: ["admin", "attributes"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: form as any,
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
    },
    successMessage: t("admin.forms.attribute.createAttributeSuccess"),
  });

  // Update mutation
  const updateMutation = useAppMutation<
    ProductAttribute,
    Error,
    { id: number; data: AttributeFormData },
    unknown,
    AttributeFormData
  >({
    mutationFn: ({ id, data }) => attributeService.updateAttribute(id, data),
    queryKey: ["admin", "attributes"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: form as any,
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
    },
    successMessage: t("admin.forms.attribute.updateAttributeSuccess"),
  });

  const onSubmit = async (data: AttributeFormData) => {
    try {
      // Đảm bảo các giá trị mặc định được set trước khi submit
      // Đặc biệt: Đảm bảo value cho mỗi attribute value được set từ displayValue
      const processedValues = (data.values || []).map((val, index) => {
        // Tự động generate value từ displayValue nếu chưa có
        const value =
          val.value ||
          (val.displayValue ? generateAttributeKey(val.displayValue) : "");
        // Đảm bảo displayOrder được set theo index
        const displayOrder = val.displayOrder ?? index;

        return {
          ...val,
          value: value || val.displayValue || "", // Fallback về displayValue nếu generateAttributeKey trả về rỗng
          displayOrder,
        };
      });

      const submitData: AttributeFormData = {
        attributeKey:
          data.attributeKey ||
          (nameValue ? generateAttributeKey(nameValue) : ""),
        attributeName: data.attributeName,
        attributeType: data.attributeType,
        dataType: data.dataType || "STRING",
        filterable: data.filterable ?? true,
        searchable: data.searchable ?? false,
        required: data.required ?? false,
        variantSpecific: data.variantSpecific ?? false,
        displayOrder: data.displayOrder ?? 0,
        unit: data.unit || undefined,
        domain: data.domain || "COMMON",
        status: data.status || "ACTIVE",
        values: processedValues.length > 0 ? processedValues : undefined,
      };

      console.log("Submitting data:", submitData);

      if (isEditing && attribute?.id) {
        await updateMutation.mutateAsync({
          id: attribute.id,
          data: submitData,
        });
      } else {
        await createMutation.mutateAsync(submitData);
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      throw error;
    }
  };

  // Handle form errors
  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
  };

  const addValue = () => {
    const newIndex = fields.length;
    append({
      value: "",
      displayValue: "",
      imageUrl: undefined,
      hexColor: undefined,
      displayOrder: newIndex,
      isDefault: false,
    });
  };

  const isLoading = isLoadingAttribute;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-3xl">
        <div className="relative flex h-full flex-col">
          <LoadingOverlay isLoading={isLoading} />

          <form
            key={formKey}
            className="flex h-full flex-col overflow-y-auto"
            onSubmit={form.handleSubmit(onSubmit, onError)}
          >
            <SheetHeader>
              <SheetTitle className="text-xl font-semibold text-foreground">
                {isEditing
                  ? t("admin.forms.attribute.editAttribute")
                  : t("admin.forms.attribute.addNewAttribute")}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {isEditing
                  ? t("admin.forms.attribute.updateAttributeInfo")
                  : t("admin.forms.attribute.createNewAttribute")}
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="flex-1">
              <div className="space-y-6 py-4">
                {/* Section 1: Thông tin cơ bản - Các trường quan trọng nhất */}
                <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    {t("admin.forms.attribute.basicInfo")}
                  </h3>

                  {/* Trường 1: Tên thuộc tính (Required - Quan trọng nhất) */}
                  <FormField
                    label={t("admin.attributes.attributeName")}
                    htmlFor="attributeName"
                    required
                    error={form.formState.errors.attributeName}
                    description={t(
                      "admin.forms.attribute.attributeNameDescription"
                    )}
                  >
                    <Controller
                      name="attributeName"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t(
                            "admin.forms.attribute.attributeNamePlaceholder"
                          )}
                          disabled={isSubmitting}
                          className="font-medium"
                        />
                      )}
                    />
                  </FormField>

                  {/* Trường 2: Loại thuộc tính (Required) */}
                  <FormField
                    label={t("admin.forms.attribute.attributeTypeLabel")}
                    htmlFor="attributeType"
                    required
                    error={form.formState.errors.attributeType}
                    description={
                      variantSpecific
                        ? t("admin.forms.attribute.variantSpecificDescription")
                        : t("admin.forms.attribute.attributeTypeDescription")
                    }
                  >
                    <Controller
                      name="attributeType"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting || variantSpecific === true}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại thuộc tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SELECT">Select</SelectItem>
                            <SelectItem value="MULTISELECT">
                              Multi-Select
                            </SelectItem>
                            <SelectItem value="BOOLEAN">Boolean</SelectItem>
                            <SelectItem value="TEXT">Text</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>

                  {/* Trường 3: Thuộc nhóm sản phẩm (Quan trọng) */}
                  <FormField
                    label={t("admin.forms.attribute.domainLabel")}
                    htmlFor="domain"
                    error={form.formState.errors.domain}
                    description={t("admin.forms.attribute.domainDescription")}
                  >
                    <Controller
                      name="domain"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          value={field.value || "COMMON"}
                          onValueChange={(value) => {
                            const next = value as
                              | "PERFUME"
                              | "COSMETICS"
                              | "COMMON";
                            field.onChange(next);
                            setActiveDomain(next);
                          }}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhóm sản phẩm" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PERFUME">
                              {t("admin.forms.attribute.perfumeTab")}
                            </SelectItem>
                            <SelectItem value="COSMETICS">
                              {t("admin.forms.attribute.cosmeticsTab")}
                            </SelectItem>
                            <SelectItem value="COMMON">
                              {t("admin.forms.attribute.commonTab") ||
                                "Dùng chung"}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>

                  {/* Trường 4: Đơn vị tính (Optional nhưng quan trọng) */}
                  <FormField
                    label={t("admin.forms.attribute.unitLabel")}
                    htmlFor="unit"
                    error={form.formState.errors.unit}
                    description={t("admin.forms.attribute.unitDescription")}
                  >
                    <Controller
                      name="unit"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="ml, g, %"
                          maxLength={50}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </FormField>
                </div>

                {/* Section 2: Cấu hình nâng cao */}
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Cấu hình nâng cao
                  </h3>

                  {/* Switch: Dùng cho biến thể */}
                  <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                    <div className="space-y-0.5 flex-1">
                      <label className="text-sm font-medium text-foreground">
                        {t("admin.forms.attribute.variantSpecificLabel")}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {t("admin.forms.attribute.variantSpecificDescription")}
                      </p>
                    </div>
                    <Controller
                      name="variantSpecific"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value ?? false}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            // Tự động set attributeType về SELECT nếu bật
                            if (checked) {
                              form.setValue("attributeType", "SELECT", {
                                shouldValidate: false,
                              });
                            }
                          }}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </div>

                  {/* Hidden fields: Tự động điền với giá trị mặc định (đã xử lý trong useEffect) */}
                  {/* 
                    Các trường ẩn được tự động điền:
                    - attributeKey: Tự động sinh từ attributeName (logic trong useEffect)
                    - dataType: Mặc định 'STRING' (logic trong useEffect)
                    - displayOrder: Mặc định 0 (logic trong useEffect)
                    - status: Mặc định 'ACTIVE' (logic trong useEffect)
                    - filterable: Mặc định true (logic trong useEffect)
                    - searchable: Mặc định false (logic trong useEffect)
                    - required: Mặc định false (logic trong useEffect)
                  */}
                </div>

                {/* Attribute Values Section - Smart Form: Đơn giản hóa UI */}
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      {t("admin.forms.attribute.valuesTitle")}
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addValue}
                      disabled={isSubmitting}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t("admin.forms.attribute.addValue")}
                    </Button>
                  </div>

                  {fields.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        {t("admin.forms.attribute.noValues")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Simple Row List */}
                      {fields.map((field, index) => {
                        return (
                          <div
                            key={field.id}
                            className="space-y-3 rounded-lg border border-border bg-background p-4"
                          >
                            {/* Main Row: displayValue, isDefault, Delete */}
                            <div className="flex items-center gap-3">
                              {/* Tên hiển thị với Unit */}
                              <div className="flex-1">
                                <Controller
                                  name={`values.${index}.displayValue`}
                                  control={form.control}
                                  render={({ field }) => (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        {...field}
                                        placeholder={t(
                                          "admin.forms.attribute.valuePlaceholder"
                                        )}
                                        disabled={isSubmitting}
                                        className="h-9 text-sm"
                                        onChange={(e) => {
                                          field.onChange(e);
                                          // Tự động update value ngay lập tức khi displayValue thay đổi
                                          const newDisplayValue =
                                            e.target.value;
                                          if (
                                            newDisplayValue &&
                                            newDisplayValue.trim() !== ""
                                          ) {
                                            const generatedValue =
                                              generateAttributeKey(
                                                newDisplayValue
                                              );
                                            form.setValue(
                                              `values.${index}.value`,
                                              generatedValue,
                                              {
                                                shouldValidate: true,
                                              }
                                            );
                                          } else {
                                            form.setValue(
                                              `values.${index}.value`,
                                              "",
                                              {
                                                shouldValidate: true,
                                              }
                                            );
                                          }
                                        }}
                                      />
                                      {unitValue && (
                                        <span className="text-sm font-medium text-muted-foreground shrink-0">
                                          {unitValue}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                />
                                {form.formState.errors.values?.[index]
                                  ?.displayValue && (
                                  <p className="mt-1 text-xs text-destructive">
                                    {
                                      form.formState.errors.values?.[index]
                                        ?.displayValue?.message
                                    }
                                  </p>
                                )}
                                {/* Hidden: value (tự động copy từ displayValue) */}
                                <Controller
                                  name={`values.${index}.value`}
                                  control={form.control}
                                  render={({ field }) => (
                                    <input type="hidden" {...field} />
                                  )}
                                />
                                {/* Hidden: displayOrder (tự động set theo index) */}
                                <Controller
                                  name={`values.${index}.displayOrder`}
                                  control={form.control}
                                  render={({ field }) => (
                                    <input type="hidden" {...field} />
                                  )}
                                />
                              </div>

                              {/* Mặc định */}
                              <div className="flex items-center gap-2 shrink-0">
                                <label className="text-xs text-muted-foreground whitespace-nowrap">
                                  {t("admin.forms.attribute.defaultLabel")}
                                </label>
                                <Controller
                                  name={`values.${index}.isDefault`}
                                  control={form.control}
                                  render={({ field }) => {
                                    const handleDefaultChange = (
                                      checked: boolean
                                    ) => {
                                      // Nếu bật, tắt tất cả các giá trị khác
                                      if (checked) {
                                        const currentValues =
                                          form.getValues("values") || [];
                                        currentValues.forEach((val, idx) => {
                                          if (idx !== index) {
                                            form.setValue(
                                              `values.${idx}.isDefault`,
                                              false,
                                              { shouldValidate: false }
                                            );
                                          }
                                        });
                                      }
                                      field.onChange(checked);
                                    };

                                    return (
                                      <Switch
                                        checked={field.value ?? false}
                                        onCheckedChange={handleDefaultChange}
                                        disabled={isSubmitting}
                                      />
                                    );
                                  }}
                                />
                              </div>

                              {/* Nút Xóa */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                disabled={isSubmitting}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Conditional: Ảnh mẫu (chỉ hiện khi SELECT/MULTISELECT) */}
                            {(attributeType === "SELECT" ||
                              attributeType === "MULTISELECT") && (
                              <div className="flex flex-wrap items-center gap-4 border-t border-border pt-2">
                                {/* Image Upload */}
                                <Controller
                                  name={`values.${index}.imageUrl`}
                                  control={form.control}
                                  render={({ field }) => {
                                    const handleImageChange = async (
                                      file: File | null
                                    ) => {
                                      if (file) {
                                        try {
                                          const imageUrl =
                                            await imageManagement.uploadImage(
                                              file
                                            );
                                          field.onChange(imageUrl);
                                        } catch (error) {
                                          console.error(
                                            "Failed to upload image:",
                                            error
                                          );
                                        }
                                      } else {
                                        if (field.value) {
                                          await imageManagement.markImageForDeletion(
                                            field.value
                                          );
                                        }
                                        field.onChange(null);
                                      }
                                    };

                                    return (
                                      <div className="flex-1">
                                        <ImageUpload
                                          value={
                                            field.value ? field.value : null
                                          }
                                          previewUrl={field.value || undefined}
                                          onChange={handleImageChange}
                                          disabled={isSubmitting}
                                          variant="rectangle"
                                          size="sm"
                                          folder="attributes/swatches"
                                        />
                                      </div>
                                    );
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </SheetBody>

            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t("admin.forms.common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing
                  ? t("admin.forms.common.save")
                  : t("admin.forms.common.save")}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
