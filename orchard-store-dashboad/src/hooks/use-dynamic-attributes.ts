import { useMemo } from "react";
import { useCategoryAttributesForProduct } from "@/hooks/use-category-attributes";
import type { AttributeGroup } from "@/types/catalog.types";
import type { ProductAttribute } from "@/types/attribute.types";

/**
 * Hook để transform grouped attributes thành array of groups
 * - Sort groups (custom groups first, then domain groups)
 * - Sort attributes trong mỗi group theo displayOrder
 */
export const useDynamicAttributes = (categoryId: number | null) => {
  const {
    data: groupedAttributes,
    isLoading,
    error,
  } = useCategoryAttributesForProduct(categoryId);

  const attributeGroups = useMemo<AttributeGroup[]>(() => {
    if (!groupedAttributes) return [];

    return Object.entries(groupedAttributes)
      .map(([groupName, attributes]) => ({
        groupName,
        attributes: attributes.sort(
          (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
        ),
      }))
      .sort((a, b) => {
        // Custom groups first, then domain groups
        const domainGroups = ["PERFUME", "COSMETICS", "COMMON"];
        const aIsCustom = !domainGroups.includes(a.groupName);
        const bIsCustom = !domainGroups.includes(b.groupName);

        if (aIsCustom && !bIsCustom) return -1;
        if (!aIsCustom && bIsCustom) return 1;
        return a.groupName.localeCompare(b.groupName);
      });
  }, [groupedAttributes]);

  return {
    attributeGroups,
    isLoading,
    error,
    hasAttributes: attributeGroups.length > 0,
  };
};

