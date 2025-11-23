/**
 * Client-Side Password Hashing (Optional Security Layer)
 *
 * Mã hóa password phía Client trước khi gửi lên server
 * Giảm rủi ro nếu có Man-in-the-Middle attack (dù đã có HTTPS)
 *
 * LƯU Ý: Backend phải hỗ trợ giải mã tương ứng!
 * Nếu Backend chưa hỗ trợ, bỏ qua bước này và chỉ dựa vào HTTPS.
 */

/**
 * Hash password bằng SHA-256 (one-way hash)
 *
 * Backend cần lưu password đã hash này thay vì hash lại từ plain text
 * Hoặc Backend có thể verify bằng cách hash lại và so sánh
 */
export async function hashPasswordSHA256(password: string): Promise<string> {
  if (typeof window === "undefined") {
    // Server-side: return as-is (should not be called on server)
    return password;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

/**
 * Hash password bằng MD5 (legacy, không khuyến khích)
 * Chỉ dùng nếu Backend yêu cầu
 */
export async function hashPasswordMD5(password: string): Promise<string> {
  if (typeof window === "undefined") {
    return password;
  }

  // MD5 không có trong Web Crypto API, cần thư viện bên ngoài
  // Tạm thời return as-is, cần cài đặt crypto-js nếu muốn dùng
  console.warn("MD5 hashing requires crypto-js library");
  return password;
}

/**
 * Mã hóa password bằng Base64 (không bảo mật, chỉ obfuscation)
 * Chỉ dùng cho testing hoặc khi Backend yêu cầu
 */
export function encodePasswordBase64(password: string): string {
  if (typeof window === "undefined") {
    return password;
  }

  return window.btoa(password);
}

/**
 * Hash password với salt (recommended)
 *
 * @param password - Plain text password
 * @param salt - Optional salt (nếu không có sẽ generate random)
 * @returns Object với hash và salt
 */
export async function hashPasswordWithSalt(
  password: string,
  salt?: string
): Promise<{ hash: string; salt: string }> {
  if (typeof window === "undefined") {
    return { hash: password, salt: salt || "" };
  }

  // Generate random salt nếu chưa có
  const finalSalt =
    salt ||
    Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  // Hash password + salt
  const encoder = new TextEncoder();
  const data = encoder.encode(password + finalSalt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { hash: hashHex, salt: finalSalt };
}

/**
 * Default: SHA-256 hash (one-way)
 *
 * Backend cần:
 * 1. Nhận hash từ client
 * 2. Hash lại password từ DB bằng SHA-256
 * 3. So sánh 2 hash
 *
 * HOẶC:
 * 1. Lưu password đã hash SHA-256 vào DB
 * 2. So sánh trực tiếp
 */
export async function hashPassword(password: string): Promise<string> {
  return hashPasswordSHA256(password);
}
