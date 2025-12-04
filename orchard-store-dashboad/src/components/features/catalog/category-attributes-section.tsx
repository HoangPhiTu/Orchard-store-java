"use client";

import { useMemo, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategoryAttributes } from "@/hooks/use-category-attributes";
import { useAllAttributes } from "@/hooks/use-attributes";
import {
  useAssignCategoryAttribute,
  useRemoveCategoryAttribute,
  useUpdateCategoryAttribute,
} from "@/hooks/use-category-attributes";
import type { CategoryAttribute } from "@/types/catalog.types";
import type { AttributeDomain } from "@/types/attribute.types";

interface CategoryAttributesSectionProps {
  categoryId?: number;
}

export function CategoryAttributesSection({
  categoryId,
}: CategoryAttributesSectionProps) {
  // State
  const [domainFilter, setDomainFilter] = useState<
    "ALL" | "PERFUME" | "COSMETICS" | "COMMON"
  >("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Hooks
  const { 
    data: assignedAttributes, 
    isLoading,
    error: attributesError,
  } = useCategoryAttributes(categoryId);
  const { data: allAttributes, isLoading: isLoadingAttributes } =
    useAllAttributes();
  const assignMutation = useAssignCategoryAttribute();
  const removeMutation = useRemoveCategoryAttribute();
  const updateMutation = useUpdateCategoryAttribute();

  // Filter: Chỉ hiển thị attributes chưa được gán
  const availableAttributes = useMemo(() => {
    if (!allAttributes || !assignedAttributes) return allAttributes ?? [];
    const assignedIds = new Set(assignedAttributes.map((a) => a.attributeId));
    return allAttributes.filter((a) => !assignedIds.has(a.id));
  }, [allAttributes, assignedAttributes]);

  // Filter theo Domain
  const filteredAvailableAttributes = useMemo(() => {
    if (domainFilter === "ALL") return availableAttributes;
    return availableAttributes.filter((attr) => attr.domain === domainFilter);
  }, [availableAttributes, domainFilter]);

  // Filter theo từ khóa tìm kiếm (theo tên & key)
  const searchedAttributes = useMemo(() => {
    if (!searchTerm.trim()) return filteredAvailableAttributes;
    const query = searchTerm.trim().toLowerCase();
    return filteredAvailableAttributes.filter((attr) => {
      const name = (attr.attributeName || "").toLowerCase();
      const key = (attr.attributeKey || "").toLowerCase();
      return name.includes(query) || key.includes(query);
    });
  }, [filteredAvailableAttributes, searchTerm]);

  // Handlers
  const handleAssign = (attributeId: number) => {
    // Tránh gọi API nhiều lần nếu mutation đang pending
    if (assignMutation.isPending) {
      return;
    }

    if (!categoryId || categoryId <= 0) {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.warn(
          "[CategoryAttributesSection] Invalid categoryId when assigning attribute",
          { categoryId, attributeId }
        );
      }
      return;
    }

    assignMutation.mutate({
        categoryId,
        attributeId,
        required: false,
        displayOrder: assignedAttributes?.length ?? 0,
    });
  };

  const handleRemove = (attributeId: number) => {
    if (!categoryId) return;
    removeMutation.mutate({ categoryId, attributeId });
  };

  const handleUpdateMetadata = (
    attributeId: number,
    updates: { required?: boolean; displayOrder?: number; groupName?: string }
  ) => {
    if (!categoryId) return;
    const current = assignedAttributes?.find(
      (ca) => ca.attributeId === attributeId
    );
    if (!current) return;

    updateMutation.mutate({
      categoryId,
      attributeId,
      required: updates.required ?? current.required ?? false,
      displayOrder: updates.displayOrder ?? current.displayOrder ?? 0,
      groupName:
        updates.groupName !== undefined ? updates.groupName : current.groupName,
    });
  };

  // Empty state: Category chưa được lưu
  if (!categoryId || categoryId <= 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Vui lòng lưu category trước khi cấu hình thuộc tính
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading || isLoadingAttributes) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state: Xử lý lỗi 400 (category không tồn tại hoặc chưa được lưu)
  if (attributesError) {
    const isBadRequest = 
      "response" in attributesError &&
      (attributesError as any).response?.status === 400;
    
    if (isBadRequest) {
      return (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Category chưa được lưu hoặc không tồn tại. Vui lòng lưu category
            trước.
          </p>
        </div>
      );
    }
    
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="text-sm text-destructive">
          Lỗi khi tải thuộc tính: {attributesError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thêm thuộc tính - Đặt lên trên, dropdown có search tích hợp */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Thêm thuộc tính
          </h3>
          {assignMutation.isPending && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Đang thêm...
            </span>
          )}
        </div>

        {/* Filter theo Domain */}
        <div className="mb-3">
          <Tabs
            value={domainFilter}
            onValueChange={(val) =>
              setDomainFilter(val as "ALL" | "PERFUME" | "COSMETICS" | "COMMON")
            }
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="ALL" className="text-xs">
                Tất cả
              </TabsTrigger>
              <TabsTrigger value="PERFUME" className="text-xs">
                Nước hoa
              </TabsTrigger>
              <TabsTrigger value="COSMETICS" className="text-xs">
                Mỹ phẩm
              </TabsTrigger>
              <TabsTrigger value="COMMON" className="text-xs">
                Chung
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Nút dropdown + panel search/list khi mở */}
        <div className="space-y-2 relative">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted transition-colors"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <span className="truncate">
              {searchedAttributes.length === 0
                ? "Không còn thuộc tính nào để gán"
                : "Chọn thuộc tính để gán..."}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              {isDropdownOpen ? "▲" : "▼"}
            </span>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-background shadow-md">
              <div className="space-y-2 p-2">
                <Input
                  placeholder="Tìm kiếm theo tên hoặc key thuộc tính..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 text-xs"
                />

                <div className="max-h-56 overflow-y-auto rounded-md border border-border bg-background">
                  {searchedAttributes.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      Không còn thuộc tính nào để gán
                    </div>
                  ) : (
                    searchedAttributes.map((attr) => (
                      <button
                        key={attr.id}
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-muted transition-colors text-left"
                        onClick={() => {
                          handleAssign(attr.id);
                        }}
                        disabled={assignMutation.isPending}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-foreground">
                            {attr.attributeName}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {attr.attributeKey}
                            {attr.domain ? ` • ${attr.domain}` : ""}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danh sách attributes đã gán - Có thể chỉnh sửa metadata */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">
          Thuộc tính đã gán
        </h3>
        {!assignedAttributes || assignedAttributes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có thuộc tính nào được gán
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignedAttributes.map((ca) => (
              <div
                key={ca.id}
                className="p-4 border rounded-lg bg-card space-y-3"
              >
                {/* Header: Tên và nút Xóa */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {ca.attributeName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ca.attributeKey}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(ca.attributeId);
                    }}
                    disabled={removeMutation.isPending}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Metadata: Required, Display Order, và Group Name */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground whitespace-nowrap">
                        Bắt buộc:
                      </label>
                      <Switch
                        checked={ca.required ?? false}
                        onCheckedChange={(checked) =>
                          handleUpdateMetadata(ca.attributeId, {
                            required: checked,
                          })
                        }
                        disabled={updateMutation.isPending}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground whitespace-nowrap">
                        Thứ tự:
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={ca.displayOrder ?? 0}
                        onChange={(e) =>
                          handleUpdateMetadata(ca.attributeId, {
                            displayOrder: Number(e.target.value),
                          })
                        }
                        disabled={updateMutation.isPending}
                        className="w-20 h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground whitespace-nowrap">
                      Nhóm:
                    </label>
                    <Input
                      placeholder="Ví dụ: Mùi hương, Thông số..."
                      value={ca.groupName ?? ""}
                      onChange={(e) =>
                        handleUpdateMetadata(ca.attributeId, {
                          groupName: e.target.value,
                        })
                      }
                      disabled={updateMutation.isPending}
                      className="flex-1 h-8 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      (Để trống = group theo domain)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
