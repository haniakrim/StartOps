/**
 * Validates that a color value is safe for CSS injection.
 * Only allows hex colors and rgb/rgba values.
 */
const SAFE_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$|^rgba?\(\s*\d+(\s*,\s*\d+){1,3}\s*\)$/;

export function sanitizeColor(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (SAFE_COLOR_REGEX.test(trimmed)) return trimmed;
  // Return a safe fallback
  return "";
}

/**
 * Strips HTML tags and sensitive content (like scripts/styles) from a string.
 * This is a more robust implementation than a simple regex.
 */
export function stripHtml(input: string): string {
  if (!input) return "";

  // 1. Remove script and style tags and their content
  let sanitized = input.replace(/<(script|style|title|textarea|noscript)[^>]*>[\s\S]*?<\/\1\s*>/gi, "");

  // 2. Remove comments
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, "");

  // 3. Remove all other tags but keep their content
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // 4. Decode basic entities if needed, but for simple stripping,
  // we primarily want to ensure no tags remain.
  return sanitized;
}

/**
 * Validates and truncates a string to a maximum length.
 */
export function truncate(value: string, maxLength: number): string {
  if (value.length > maxLength) {
    return value.substring(0, maxLength);
  }
  return value;
}

/**
 * Validates an email format.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}
