import { slugify as baseSlugify } from "@/lib/utils";

/**
 * Sinh cartesian product từ object các mảng giá trị.
 * Ví dụ:
 *  { dung_tich: ["50ml", "100ml"], loai_hang: ["Fullbox", "Tester"] }
 * =>
 *  [
 *    { dung_tich: "50ml", loai_hang: "Fullbox" },
 *    { dung_tich: "50ml", loai_hang: "Tester" },
 *    { dung_tich: "100ml", loai_hang: "Fullbox" },
 *    { dung_tich: "100ml", loai_hang: "Tester" },
 *  ]
 */
export function generateVariantCombinations(
  attributes: Record<string, string[]>
): Array<Record<string, string>> {
  const entries = Object.entries(attributes).filter(
    ([, values]) => Array.isArray(values) && values.length > 0
  );

  if (entries.length === 0) {
    return [];
  }

  return entries.reduce<Array<Record<string, string>>>(
    (acc, [key, values]) => {
      if (acc.length === 0) {
        return values.map((value) => ({ [key]: value }));
      }

      const next: Array<Record<string, string>> = [];
      for (const combo of acc) {
        for (const value of values) {
          next.push({
            ...combo,
            [key]: value,
          });
        }
      }
      return next;
    },
    []
  );
}

/**
 * Chuẩn hoá chuỗi thành token dùng trong SKU:
 * - Bỏ dấu tiếng Việt
 * - Uppercase
 * - Thay khoảng trắng và ký tự đặc biệt bằng gạch ngang
 * - Loại bỏ gạch dư ở đầu/cuối
 */
function toSkuToken(value: string): string {
  if (!value) return "";

  // Dùng slugify nội bộ để bỏ dấu & chuẩn hoá, sau đó upper-case
  const slug = baseSlugify(value);

  // Đảm bảo uppercase và bỏ gạch đầu/cuối nếu có
  return slug
    .toUpperCase()
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Sinh SKU gợi nhớ theo format:
 *  {PRODUCT_SLUG}-{ATTR_1}-{ATTR_2}
 *
 * - productSlug sẽ được chuẩn hoá về SKU token (bỏ dấu, uppercase, gạch ngang).
 * - attributes có thể là:
 *   - mảng giá trị (theo thứ tự)
 *   - hoặc object { key: value }
 */
export function generateSku(
  productSlug: string,
  attributes:
    | string[]
    | Record<string, string | number | null | undefined>
): string {
  const base = toSkuToken(productSlug);

  let attrTokens: string[] = [];

  if (Array.isArray(attributes)) {
    attrTokens = attributes
      .map((v) => (v != null ? String(v) : ""))
      .filter((v) => v.trim() !== "")
      .map(toSkuToken)
      .filter((v) => v.length > 0);
  } else if (attributes && typeof attributes === "object") {
    // Duyệt theo thứ tự key để ổn định
    attrTokens = Object.keys(attributes)
      .sort()
      .map((key) => attributes[key])
      .filter((v): v is string | number => v !== null && v !== undefined)
      .map((v) => String(v))
      .filter((v) => v.trim() !== "")
      .map(toSkuToken)
      .filter((v) => v.length > 0);
  }

  return [base, ...attrTokens].join("-").replace(/-+/g, "-");
}


