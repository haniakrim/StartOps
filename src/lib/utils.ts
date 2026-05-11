import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx for conditional class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format a date string
 */
export function formatDate(date: string | Date, locale = "en-US", options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(d);
}

/**
 * Format a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date, locale = "en-US"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffDays) >= 365) {
    return rtf.format(Math.round(diffDays / 365), "year");
  }
  if (Math.abs(diffDays) >= 30) {
    return rtf.format(Math.round(diffDays / 30), "month");
  }
  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, "day");
  }
  if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, "hour");
  }
  if (Math.abs(diffMins) >= 1) {
    return rtf.format(diffMins, "minute");
  }
  return rtf.format(diffSecs, "second");
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate a simple unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number, suffix = "..."): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + suffix;
}

/**
 * Capitalize the first letter of each word
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; initialDelay?: number; maxDelay?: number } = {}
): Promise<T> {
  const { maxAttempts = 3, initialDelay = 1000, maxDelay = 10000 } = options;
  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await sleep(delay);
        delay = Math.min(delay * 2, maxDelay);
      }
    }
  }

  throw lastError!;
}
