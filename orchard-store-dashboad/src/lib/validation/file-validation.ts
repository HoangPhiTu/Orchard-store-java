/**
 * Centralized file validation utilities
 * Provides robust client-side validation for image uploads including magic byte checks
 */

export interface FileValidationOptions {
  maxSize?: number; // in bytes, default: 5MB
  allowedTypes?: string[]; // MIME types, default: ['image/jpeg', 'image/png', 'image/webp']
  validateContent?: boolean; // whether to check magic bytes, default: true
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// Maximum file size: 5MB
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// Magic bytes (file signatures) for image types
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50]], // RIFF....WEBP
};

/**
 * Synchronous file validation (size and type)
 */
export function validateFileSync(
  file: File,
  options?: FileValidationOptions
): FileValidationResult {
  const maxSize = options?.maxSize ?? DEFAULT_MAX_SIZE;
  const allowedTypes = options?.allowedTypes ?? DEFAULT_ALLOWED_TYPES;

  if (file.size > maxSize) {
    return { valid: false, error: `Kích thước file không được vượt quá ${maxSize / (1024 * 1024)}MB.` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Chỉ chấp nhận các định dạng: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}.` };
  }

  return { valid: true };
}

/**
 * Asynchronous content validation (magic bytes)
 */
export async function validateImageContent(file: File): Promise<FileValidationResult> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const checkMagicBytes = (bytes: number[], signature: number[][]) => {
    for (const sig of signature) {
      let match = true;
      for (let i = 0; i < sig.length; i++) {
        if (sig[i] !== null && bytes[i] !== sig[i]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
    return false;
  };

  if (file.type === 'image/jpeg' && checkMagicBytes(uint8Array.slice(0, 3), MAGIC_BYTES['image/jpeg'])) {
    return { valid: true };
  }
  if (file.type === 'image/png' && checkMagicBytes(uint8Array.slice(0, 8), MAGIC_BYTES['image/png'])) {
    return { valid: true };
  }
  if (file.type === 'image/webp' && checkMagicBytes(uint8Array.slice(0, 12), MAGIC_BYTES['image/webp'])) {
    return { valid: true };
  }

  return { valid: false, error: "Nội dung file không khớp với định dạng ảnh đã khai báo." };
}

/**
 * Comprehensive file validation (sync + async content check)
 */
export async function validateFile(
  file: File,
  options?: FileValidationOptions
): Promise<FileValidationResult> {
  const syncResult = validateFileSync(file, options);
  if (!syncResult.valid) {
    return syncResult;
  }

  if (options?.validateContent !== false && file.type.startsWith('image/')) {
    const contentResult = await validateImageContent(file);
    if (!contentResult.valid) {
      return contentResult;
    }
  }

  return { valid: true };
}

