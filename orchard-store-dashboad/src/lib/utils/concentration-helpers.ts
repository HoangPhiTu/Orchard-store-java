/**
 * Helper functions for Concentration form auto-generation
 * Tái sử dụng được cho các form khác nếu cần
 */

/**
 * Hàm generateSlug: Chuyển đổi tên thành Slug chuẩn SEO
 *
 * Quy tắc:
 * - Chuyển thành chữ thường
 * - Bỏ dấu Tiếng Việt (ví dụ: 'đ' -> 'd', 'á' -> 'a')
 * - Thay khoảng trắng bằng dấu gạch ngang (-)
 * - Loại bỏ ký tự đặc biệt
 *
 * @param name - Tên cần chuyển đổi
 * @returns Slug chuẩn SEO
 *
 * @example
 * generateSlug("Eau de Parfum") // "eau-de-parfum"
 * generateSlug("Nước Hoa Đậm Đà") // "nuoc-hoa-dam-da"
 */
export const generateSlug = (name: string): string => {
  if (!name || name.trim() === "") return "";

  return name
    .toLowerCase()
    .normalize("NFD") // Tách ký tự và dấu (Normalization Form Decomposed)
    .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu (combining diacritical marks)
    .replace(/[đĐ]/g, "d") // Chuyển đ/Đ thành d
    .replace(/[^a-z0-9\s-]/g, "") // Loại bỏ ký tự đặc biệt, chỉ giữ chữ, số, khoảng trắng và dấu gạch ngang
    .trim()
    .replace(/\s+/g, "-") // Thay một hoặc nhiều khoảng trắng bằng một dấu gạch ngang
    .replace(/-+/g, "-") // Loại bỏ nhiều dấu gạch ngang liên tiếp
    .replace(/^-+|-+$/g, ""); // Loại bỏ dấu gạch ngang ở đầu và cuối
};

/**
 * Hàm generateShortName: Tạo tên viết tắt từ các ký tự đầu của mỗi từ
 *
 * Quy tắc:
 * - Lấy chữ cái đầu của TẤT CẢ các từ (bao gồm cả "de", "le", "la")
 * - Chuyển thành in hoa (UpperCase)
 * - Chỉ bỏ qua từ 1 ký tự đơn lẻ (như "a", "i") nếu không phải là từ quan trọng
 *
 * @param name - Tên cần tạo viết tắt
 * @returns Tên viết tắt (acronym)
 *
 * @example
 * generateShortName("Eau de Parfum") // "EDP"
 * generateShortName("Eau Fraiche") // "EF"
 * generateShortName("Eau de Toilette") // "EDT"
 * generateShortName("Eau de Cologne") // "EDC"
 * generateShortName("Parfum") // "P"
 */
export const generateShortName = (name: string): string => {
  if (!name || name.trim() === "") return "";

  // Tách thành các từ
  const words = name.trim().split(/\s+/);

  // Lấy chữ cái đầu của mỗi từ và chuyển thành in hoa
  const acronym = words
    .map((word) => {
      // Loại bỏ ký tự đặc biệt và lấy chữ cái đầu tiên
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "");
      const firstChar = cleanWord.charAt(0);
      return firstChar ? firstChar.toUpperCase() : "";
    })
    .filter((char) => char !== "") // Loại bỏ ký tự rỗng
    .join(""); // Nối thành chuỗi

  return acronym;
};

/**
 * Hàm validateSlug: Kiểm tra slug có hợp lệ không
 *
 * @param slug - Slug cần kiểm tra
 * @returns true nếu hợp lệ, false nếu không hợp lệ
 */
export const validateSlug = (slug: string): boolean => {
  if (!slug || slug.trim() === "") return false;

  // Slug chỉ được chứa chữ thường, số và dấu gạch ngang
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Hàm validateAcronym: Kiểm tra acronym có hợp lệ không
 *
 * @param acronym - Acronym cần kiểm tra
 * @returns true nếu hợp lệ, false nếu không hợp lệ
 */
export const validateAcronym = (acronym: string): boolean => {
  if (!acronym || acronym.trim() === "") return false;

  // Acronym chỉ được chứa chữ cái in hoa, tối đa 20 ký tự
  const acronymRegex = /^[A-Z]{1,20}$/;
  return acronymRegex.test(acronym);
};
