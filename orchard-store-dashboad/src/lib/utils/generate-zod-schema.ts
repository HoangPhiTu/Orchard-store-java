import { z } from "zod";
import type { AttributeGroup, ProductAttribute } from "@/types/catalog.types";

/**
 * Generate Zod schema for product attributes based on AttributeGroup[]
 * 
 * @param attributeGroups - Array of attribute groups
 * @returns Zod schema object for attributes
 */
export function generateZodSchema(attributeGroups: AttributeGroup[]) {
  const attributeValidations: Record<string, z.ZodTypeAny> = {};

  attributeGroups.forEach((group) => {
    group.attributes.forEach((attr) => {
      const fieldName = `attributes.${attr.attributeKey}`;
      let fieldSchema: z.ZodTypeAny;

      switch (attr.attributeType) {
        case "SELECT":
          // Single select - string value
          fieldSchema = z.string();
          
          // Validate against allowed values if available
          if (attr.values && attr.values.length > 0) {
            const allowedValues = attr.values.map((v) => v.value);
            fieldSchema = fieldSchema.refine(
              (val) => allowedValues.includes(val),
              {
                message: `Giá trị không hợp lệ. Chỉ chấp nhận: ${allowedValues.join(", ")}`,
              }
            );
          }
          break;

        case "MULTISELECT":
          // Multi-select - array of strings
          fieldSchema = z.array(z.string());
          
          // Validate against allowed values if available
          if (attr.values && attr.values.length > 0) {
            const allowedValues = attr.values.map((v) => v.value);
            fieldSchema = fieldSchema.refine(
              (vals) => vals.every((val) => allowedValues.includes(val)),
              {
                message: `Một hoặc nhiều giá trị không hợp lệ. Chỉ chấp nhận: ${allowedValues.join(", ")}`,
              }
            );
          }
          break;

        case "RANGE":
          // Range - number (min/max from validationRules)
          fieldSchema = z.number({
            required_error: `${attr.attributeName} là bắt buộc`,
            invalid_type_error: `${attr.attributeName} phải là số`,
          });

          // Parse validationRules for min/max
          if (attr.validationRules) {
            try {
              const rules = JSON.parse(attr.validationRules);
              if (typeof rules.min === "number") {
                fieldSchema = fieldSchema.min(
                  rules.min,
                  `${attr.attributeName} phải lớn hơn hoặc bằng ${rules.min}`
                );
              }
              if (typeof rules.max === "number") {
                fieldSchema = fieldSchema.max(
                  rules.max,
                  `${attr.attributeName} phải nhỏ hơn hoặc bằng ${rules.max}`
                );
              }
            } catch (e) {
              // Invalid JSON, ignore
            }
          }
          break;

        case "BOOLEAN":
          // Boolean - true/false
          fieldSchema = z.boolean({
            required_error: `${attr.attributeName} là bắt buộc`,
            invalid_type_error: `${attr.attributeName} phải là true hoặc false`,
          });
          break;

        case "TEXT":
          // Text - string
          fieldSchema = z.string();

          // Parse validationRules for minLength/maxLength
          if (attr.validationRules) {
            try {
              const rules = JSON.parse(attr.validationRules);
              if (typeof rules.minLength === "number") {
                fieldSchema = fieldSchema.min(
                  rules.minLength,
                  `${attr.attributeName} phải có ít nhất ${rules.minLength} ký tự`
                );
              }
              if (typeof rules.maxLength === "number") {
                fieldSchema = fieldSchema.max(
                  rules.maxLength,
                  `${attr.attributeName} không được vượt quá ${rules.maxLength} ký tự`
                );
              }
            } catch (e) {
              // Invalid JSON, ignore
            }
          }
          break;

        default:
          // Unknown type - default to string
          fieldSchema = z.string();
      }

      // Apply required validation
      if (attr.required) {
        if (attr.attributeType === "MULTISELECT") {
          fieldSchema = (fieldSchema as z.ZodArray<any>).min(
            1,
            `${attr.attributeName} là bắt buộc`
          );
        } else {
          fieldSchema = fieldSchema.min(1, `${attr.attributeName} là bắt buộc`);
        }
      } else {
        // Optional field
        if (attr.attributeType === "MULTISELECT") {
          fieldSchema = (fieldSchema as z.ZodArray<any>).optional();
        } else if (attr.attributeType === "BOOLEAN") {
          // Boolean can't be optional in the same way, use nullable
          fieldSchema = fieldSchema.nullable().optional();
        } else {
          fieldSchema = fieldSchema.optional();
        }
      }

      attributeValidations[fieldName] = fieldSchema;
    });
  });

  // Return schema as a record
  return z.object(attributeValidations).optional();
}

/**
 * Generate full product form schema with dynamic attributes
 * 
 * @param baseSchema - Base product form schema (name, sku, price, etc.)
 * @param attributeGroups - Array of attribute groups
 * @returns Extended Zod schema with attributes
 */
export function generateProductFormSchemaWithAttributes<T extends z.ZodTypeAny>(
  baseSchema: T,
  attributeGroups: AttributeGroup[]
) {
  const attributesSchema = generateZodSchema(attributeGroups);
  
  return baseSchema.extend({
    attributes: attributesSchema,
  });
}

