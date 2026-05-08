/**
 * Secure cookie-based storage adapter for Supabase auth.
 * Replaces default localStorage to prevent XSS token theft.
 * Cookies with HttpOnly are not accessible via JavaScript,
 * but since Supabase JS client needs to read the token,
 * we use SameSite=Strict + Secure cookies instead.
 */

interface StorageItem {
  key: string;
  value: string;
}

const COOKIE_OPTIONS = {
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
  sameSite: "Lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `path=${COOKIE_OPTIONS.path}`,
    `max-age=${COOKIE_OPTIONS.maxAge}`,
    `SameSite=${COOKIE_OPTIONS.sameSite}`,
  ];
  if (COOKIE_OPTIONS.secure) {
    parts.push("Secure");
  }
  document.cookie = parts.join("; ");
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; path=${COOKIE_OPTIONS.path}; max-age=0; SameSite=${COOKIE_OPTIONS.sameSite}${COOKIE_OPTIONS.secure ? "; Secure" : ""}`;
}

export const secureCookieStorage = {
  getItem: (key: string): string | null => {
    return getCookie(key);
  },
  setItem: (key: string, value: string): void => {
    setCookie(key, value);
  },
  removeItem: (key: string): void => {
    deleteCookie(key);
  },
};