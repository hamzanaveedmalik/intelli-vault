/**
 * File validation utilities for meeting recordings
 */

const ALLOWED_EXTENSIONS = [".mp3", ".mp4", ".wav", ".m4a"];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file extension
 */
export function validateFileExtension(filename: string): FileValidationResult {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(size: number): FileValidationResult {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
    };
  }

  if (size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return { valid: true };
}

/**
 * Validate file (extension + size)
 */
export function validateFile(
  filename: string,
  size: number
): FileValidationResult {
  const extensionCheck = validateFileExtension(filename);
  if (!extensionCheck.valid) {
    return extensionCheck;
  }

  const sizeCheck = validateFileSize(size);
  if (!sizeCheck.valid) {
    return sizeCheck;
  }

  return { valid: true };
}

/**
 * Get MIME type from filename
 */
export function getContentType(filename: string): string {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  
  const mimeTypes: Record<string, string> = {
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
  };

  return mimeTypes[ext] || "application/octet-stream";
}


