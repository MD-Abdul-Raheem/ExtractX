/**
 * File validation and security utilities for ExtractX
 */

export const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  // Check MIME type
  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
  const isExtValid = ALLOWED_EXTENSIONS.includes(fileExt);

  if (!isMimeValid && !isExtValid) {
    return {
      valid: false,
      error: `Unsupported file format "${file.name}". Supported types: PDF, PNG, JPG, JPEG, WEBP.`,
    };
  }

  // Check size limit
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File "${file.name}" (${sizeMb} MB) exceeds maximum allowed size of 25 MB.`,
    };
  }

  return { valid: true };
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function sanitizeExcelFilename(name: string): string {
  // Remove dangerous characters, path traversal, control characters
  let clean = name.replace(/[^a-zA-Z0-9_\-\. ]/g, '_').trim();
  if (!clean) clean = 'extracted_data';
  if (!clean.endsWith('.xlsx')) {
    // If it has another extension like .csv or .xls, strip it
    clean = clean.replace(/\.[a-zA-Z0-9]+$/, '') + '.xlsx';
  }
  return clean;
}
