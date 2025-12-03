"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { useConcentration } from "@/hooks/use-concentrations";
import { concentrationService } from "@/services/concentration.service";
import type {
  Concentration,
  ConcentrationFormData,
} from "@/types/concentration.types";
import { concentrationFormSchema } from "@/types/concentration.types";
import {
  generateSlug,
  generateShortName,
} from "@/lib/utils/concentration-helpers";
import { useI18n } from "@/hooks/use-i18n";

interface ConcentrationFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  concentration?: Concentration | null;
}

const DEFAULT_VALUES: ConcentrationFormData = {
  name: "",
  slug: undefined,
  description: undefined,
  acronym: undefined,
  minOilPercentage: undefined,
  maxOilPercentage: undefined,
  longevity: undefined,
  intensityLevel: undefined,
  displayOrder: undefined,
  status: "ACTIVE",
};

export function ConcentrationFormSheet({
  open,
  onOpenChange,
  concentration,
}: ConcentrationFormSheetProps) {
  const { t } = useI18n();
  const isEditing = Boolean(concentration);
  const [formKey, setFormKey] = useState(0);

  // Track xem user đã chỉnh sửa thủ công slug/acronym chưa
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [acronymManuallyEdited, setAcronymManuallyEdited] = useState(false);

  // Fetch concentration details if editing
  const { data: concentrationData, isLoading: isLoadingConcentration } =
    useConcentration(concentration?.id ?? null);

  const form = useForm<ConcentrationFormData>({
    resolver: zodResolver(concentrationFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Reset form when concentration data changes or when opening/closing
  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      setFormKey((prev) => prev + 1);
      setSlugManuallyEdited(false);
      setAcronymManuallyEdited(false);
      return;
    }

    if (isEditing && concentrationData) {
      form.reset({
        name: concentrationData.name ?? "",
        slug: concentrationData.slug ?? undefined,
        description: concentrationData.description ?? undefined,
        acronym: concentrationData.acronym ?? undefined,
        minOilPercentage: concentrationData.minOilPercentage ?? undefined,
        maxOilPercentage: concentrationData.maxOilPercentage ?? undefined,
        longevity: concentrationData.longevity ?? undefined,
        intensityLevel: concentrationData.intensityLevel ?? undefined,
        displayOrder: concentrationData.displayOrder ?? undefined,
        status: concentrationData.status ?? "ACTIVE",
      });
      // Khi edit, đánh dấu là đã có giá trị (không tự động điền)
      setSlugManuallyEdited(!!concentrationData.slug);
      setAcronymManuallyEdited(!!concentrationData.acronym);
    } else if (!isEditing) {
      form.reset(DEFAULT_VALUES);
      setSlugManuallyEdited(false);
      setAcronymManuallyEdited(false);
    }
  }, [open, isEditing, concentrationData, form]);

  // Watch name để tự động điền slug và acronym
  const nameValue = form.watch("name");

  // Auto-generate slug và acronym từ name - REALTIME
  useEffect(() => {
    // Chỉ tự động điền khi:
    // 1. Name có giá trị
    // 2. Slug/Acronym chưa được chỉnh sửa thủ công
    if (nameValue && nameValue.trim() !== "") {
      const generatedSlug = generateSlug(nameValue);
      const generatedAcronym = generateShortName(nameValue);

      // Tự động cập nhật Slug nếu chưa được chỉnh sửa thủ công
      if (!slugManuallyEdited && generatedSlug) {
        form.setValue("slug", generatedSlug, { shouldValidate: false });
      }

      // Tự động cập nhật Acronym nếu chưa được chỉnh sửa thủ công
      if (!acronymManuallyEdited && generatedAcronym) {
        form.setValue("acronym", generatedAcronym, { shouldValidate: false });
      }
    } else {
      // Khi name bị xóa hết, reset slug và acronym nếu chưa chỉnh sửa thủ công
      if (!slugManuallyEdited) {
        form.setValue("slug", "", { shouldValidate: false });
      }
      if (!acronymManuallyEdited) {
        form.setValue("acronym", "", { shouldValidate: false });
      }
    }
  }, [nameValue, slugManuallyEdited, acronymManuallyEdited, form]);

  // Create mutation
  const createMutation = useAppMutation<
    Concentration,
    Error,
    ConcentrationFormData,
    unknown,
    ConcentrationFormData
  >({
    mutationFn: (data) => concentrationService.createConcentration(data),
    queryKey: ["admin", "concentrations"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: form as any,
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
    },
    successMessage: t(
      "admin.forms.concentration.createConcentrationSuccess"
    ),
  });

  // Update mutation
  const updateMutation = useAppMutation<
    Concentration,
    Error,
    { id: number; data: Partial<ConcentrationFormData> },
    unknown,
    ConcentrationFormData
  >({
    mutationFn: ({ id, data }) =>
      concentrationService.updateConcentration(id, data),
    queryKey: ["admin", "concentrations"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: form as any,
    onClose: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
    },
    successMessage: t(
      "admin.forms.concentration.updateConcentrationSuccess"
    ),
  });

  const onSubmit = async (data: ConcentrationFormData) => {
    if (isEditing && concentration?.id) {
      await updateMutation.mutateAsync({
        id: concentration.id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const isLoading = isLoadingConcentration;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-2xl">
        <div className="relative flex h-full flex-col">
          <LoadingOverlay isLoading={isLoading} />

          <form
            key={formKey}
            className="flex h-full flex-col overflow-y-auto"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <SheetHeader>
              <SheetTitle className="text-xl font-semibold text-foreground">
                {isEditing
                  ? t("admin.forms.concentration.editConcentration")
                  : t("admin.forms.concentration.addNewConcentration")}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {isEditing
                  ? t("admin.forms.concentration.updateConcentrationInfo")
                  : t("admin.forms.concentration.createNewConcentration")}
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="flex-1">
              <div className="space-y-6 py-4">
                <FormField
                  label={t("admin.forms.concentration.nameLabel")}
                  htmlFor="name"
                  required
                  error={form.formState.errors.name}
                  description={t(
                    "admin.forms.concentration.nameDescription"
                  )}
                >
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t(
                          "admin.forms.concentration.namePlaceholder"
                        )}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </FormField>

                <FormField
                  label={t("admin.forms.concentration.slugLabel")}
                  htmlFor="slug"
                  error={form.formState.errors.slug}
                  description={t(
                    "admin.forms.concentration.slugDescription"
                  )}
                >
                  <Controller
                    name="slug"
                    control={form.control}
                    render={({ field }) => {
                      const expectedSlug = nameValue
                        ? generateSlug(nameValue)
                        : "";

                      return (
                        <Input
                          {...field}
                          placeholder={t(
                            "admin.forms.concentration.slugPlaceholder"
                          )}
                          disabled={isSubmitting}
                          onFocus={() => {
                            // Khi user focus vào slug, nếu giá trị hiện tại khác với auto-generated
                            // thì đánh dấu là đã chỉnh sửa thủ công
                            if (field.value !== expectedSlug) {
                              setSlugManuallyEdited(true);
                            }
                          }}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Nếu user thay đổi giá trị khác với auto-generated, đánh dấu là đã chỉnh sửa
                            if (value !== expectedSlug) {
                              setSlugManuallyEdited(true);
                            } else {
                              // Nếu user xóa và nhập lại đúng với auto-generated, reset flag
                              setSlugManuallyEdited(false);
                            }
                            field.onChange(e);
                          }}
                          onBlur={(e) => {
                            // Validate và format lại slug khi blur
                            const value = e.target.value.trim();
                            if (value) {
                              const formatted = generateSlug(value);
                              if (formatted !== value) {
                                form.setValue("slug", formatted, {
                                  shouldValidate: true,
                                });
                              }
                            }
                            field.onBlur();
                          }}
                        />
                      );
                    }}
                  />
                </FormField>

                <FormField
                  label={t("admin.forms.concentration.descriptionLabel")}
                  htmlFor="description"
                  error={form.formState.errors.description}
                  description=""
                >
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        placeholder={t(
                          "admin.forms.concentration.descriptionPlaceholder"
                        )}
                        rows={4}
                        disabled={isSubmitting}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    )}
                  />
                </FormField>

                {/* Nhóm hiển thị UI/UX */}
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("admin.forms.concentration.uiGroupTitle")}
                  </h3>
                  <FormField
                    label={t("admin.forms.concentration.acronymLabel")}
                    htmlFor="acronym"
                    error={form.formState.errors.acronym}
                    description={t(
                      "admin.forms.concentration.acronymDescription"
                    )}
                  >
                    <Controller
                      name="acronym"
                      control={form.control}
                      render={({ field }) => {
                        const expectedAcronym = nameValue
                          ? generateShortName(nameValue)
                          : "";

                        return (
                          <Input
                            {...field}
                            placeholder="EDP"
                            maxLength={20}
                            disabled={isSubmitting}
                            className="uppercase"
                            onFocus={() => {
                              // Khi user focus vào acronym, nếu giá trị hiện tại khác với auto-generated
                              // thì đánh dấu là đã chỉnh sửa thủ công
                              if (
                                field.value?.toUpperCase() !== expectedAcronym
                              ) {
                                setAcronymManuallyEdited(true);
                              }
                            }}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Nếu user thay đổi giá trị khác với auto-generated, đánh dấu là đã chỉnh sửa
                              if (value.toUpperCase() !== expectedAcronym) {
                                setAcronymManuallyEdited(true);
                              } else {
                                // Nếu user xóa và nhập lại đúng với auto-generated, reset flag
                                setAcronymManuallyEdited(false);
                              }
                              field.onChange(e);
                            }}
                            onBlur={(e) => {
                              // Tự động chuyển thành uppercase khi blur
                              const value = e.target.value.trim().toUpperCase();
                              if (value !== e.target.value) {
                                form.setValue("acronym", value, {
                                  shouldValidate: true,
                                });
                              }
                              field.onBlur();
                            }}
                          />
                        );
                      }}
                    />
                  </FormField>
                </div>

                {/* Nhóm dữ liệu kỹ thuật */}
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("admin.forms.concentration.technicalGroupTitle")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label={t("admin.forms.concentration.minOilLabel")}
                      htmlFor="minOilPercentage"
                      error={form.formState.errors.minOilPercentage}
                      description={t(
                        "admin.forms.concentration.minOilDescription"
                      )}
                    >
                      <Controller
                        name="minOilPercentage"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            max={100}
                            placeholder="15"
                            disabled={isSubmitting}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        )}
                      />
                    </FormField>

                    <FormField
                      label={t("admin.forms.concentration.maxOilLabel")}
                      htmlFor="maxOilPercentage"
                      error={form.formState.errors.maxOilPercentage}
                      description={t(
                        "admin.forms.concentration.maxOilDescription"
                      )}
                    >
                      <Controller
                        name="maxOilPercentage"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            max={100}
                            placeholder="20"
                            disabled={isSubmitting}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        )}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label={t("admin.forms.concentration.longevityLabel")}
                    htmlFor="longevity"
                    error={form.formState.errors.longevity}
                    description={t(
                      "admin.forms.concentration.longevityDescription"
                    )}
                  >
                    <Controller
                      name="longevity"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="6 - 8 tiếng"
                          maxLength={100}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label={t("admin.forms.concentration.intensityLabel")}
                    htmlFor="intensityLevel"
                    error={form.formState.errors.intensityLevel}
                    description={t(
                      "admin.forms.concentration.intensityDescription"
                    )}
                  >
                    <Controller
                      name="intensityLevel"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          max={10}
                          placeholder="5"
                          disabled={isSubmitting}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                  </FormField>

                  <FormField
                    label={t("admin.forms.concentration.displayOrderLabel")}
                    htmlFor="displayOrder"
                    error={form.formState.errors.displayOrder}
                    description={t(
                      "admin.forms.concentration.displayOrderDescription"
                    )}
                  >
                    <Controller
                      name="displayOrder"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          placeholder="0"
                          disabled={isSubmitting}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                  </FormField>
                </div>

                <FormField
                    label={t("admin.forms.concentration.statusLabel")}
                  htmlFor="status"
                  error={form.formState.errors.status}
                  description="Trạng thái hoạt động của nồng độ"
                >
                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <select
                        {...field}
                        disabled={isSubmitting}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                      </select>
                    )}
                  />
                </FormField>
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
