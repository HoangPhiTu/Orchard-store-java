/**
 * Token Encryption Utilities
 *
 * Encrypts/decrypts tokens stored in localStorage to prevent XSS attacks
 * from easily reading tokens.
 *
 * Note: Client-side encryption is not 100% secure (key is in code),
 * but it adds a layer of protection against casual XSS attacks.
 *
 * For production, backend should set HttpOnly cookies instead.
 */

const STORAGE_KEY_PREFIX = "orchard_encrypted_";
const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

/**
 * Derive encryption key from a passphrase
 * Uses PBKDF2 to derive a key from a static passphrase
 */
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("orchard-store-salt"), // Static salt (not ideal but acceptable for client-side)
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Get encryption key (cached for performance)
 */
let cachedKey: CryptoKey | null = null;

async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey) {
    return cachedKey;
  }

  // Use a combination of domain and a static secret
  // In production, this could be an environment variable
  const passphrase =
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY ||
    `${
      typeof window !== "undefined" ? window.location.hostname : "orchard"
    }-secret-key-v1`;

  cachedKey = await deriveKey(passphrase);
  return cachedKey;
}

/**
 * Generate a random IV (Initialization Vector)
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Encrypt a token
 * @param token - Plain text token to encrypt
 * @returns Encrypted token as base64 string
 */
export async function encryptToken(token: string): Promise<string> {
  if (typeof window === "undefined" || !crypto.subtle) {
    // Fallback to plain text if crypto API is not available
    // Use logger if available, otherwise silent fallback
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn("Crypto API not available, storing token in plain text");
    }
    return token;
  }

  try {
    const key = await getEncryptionKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const iv = generateIV();

    const encrypted = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    // Log error only in development
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.error("Token encryption failed:", error);
    }
    // Fallback to plain text on error
    return token;
  }
}

/**
 * Decrypt a token
 * @param encryptedToken - Encrypted token as base64 string
 * @returns Decrypted token as plain text
 */
export async function decryptToken(encryptedToken: string): Promise<string> {
  if (typeof window === "undefined" || !crypto.subtle) {
    // Fallback: assume it's plain text
    return encryptedToken;
  }

  try {
    const key = await getEncryptionKey();

    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedToken), (c) =>
      c.charCodeAt(0)
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    // Log error only in development
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.error("Token decryption failed:", error);
    }
    // If decryption fails, try returning as-is (might be plain text from old version)
    return encryptedToken;
  }
}

/**
 * Check if a stored value is encrypted (has our prefix)
 */
function isEncrypted(value: string): boolean {
  try {
    // Try to decode as base64 and check structure
    const decoded = atob(value);
    return decoded.length > IV_LENGTH;
  } catch {
    return false;
  }
}

/**
 * Store encrypted token in localStorage
 */
export async function setEncryptedToken(
  key: string,
  token: string | null
): Promise<void> {
  if (typeof window === "undefined") return;

  if (!token) {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`);
    return;
  }

  try {
    const encrypted = await encryptToken(token);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, encrypted);
  } catch (error) {
    console.error("Failed to store encrypted token:", error);
    // Fallback to plain text storage
    localStorage.setItem(key, token);
  }
}

/**
 * Get and decrypt token from localStorage
 */
export async function getEncryptedToken(key: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    // Try encrypted storage first
    const encrypted = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    if (encrypted) {
      return await decryptToken(encrypted);
    }

    // Fallback: check plain text storage (for migration)
    const plain = localStorage.getItem(key);
    if (plain) {
      // Migrate to encrypted storage
      if (plain && !isEncrypted(plain)) {
        await setEncryptedToken(key, plain);
        localStorage.removeItem(key);
      }
      return plain;
    }

    return null;
  } catch (error) {
    // Log error only in development
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.error("Failed to get encrypted token:", error);
    }
    // Fallback to plain text
    return localStorage.getItem(key);
  }
}

/**
 * Remove encrypted token from localStorage
 */
export function removeEncryptedToken(key: string): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`);
  // Also remove plain text version if exists
  localStorage.removeItem(key);
}
