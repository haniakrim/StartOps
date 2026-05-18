import { describe, it, expect, vi } from "vitest";
import { secureCookieStorage } from "../lib/secure-cookie-storage";

describe("secureCookieStorage", () => {
  it("should set and get items", () => {
    const key = "test-key";
    const value = "test-value";

    // Mock document.cookie
    let cookie = "";
    Object.defineProperty(document, 'cookie', {
      get: () => cookie,
      set: (val) => { cookie = val; },
      configurable: true
    });

    secureCookieStorage.setItem(key, value);
    // document.cookie returns all cookies, but setItem sets one.
    // Our mock simple version:
    expect(document.cookie).toContain(encodeURIComponent(key));
    expect(document.cookie).toContain(encodeURIComponent(value));

    // To test getItem, we need document.cookie to return the format it expects
    cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    expect(secureCookieStorage.getItem(key)).toBe(value);
  });

  it("should remove items", () => {
    const key = "test-key";
    let cookie = "";
    Object.defineProperty(document, 'cookie', {
      get: () => cookie,
      set: (val) => { cookie = val; },
      configurable: true
    });

    secureCookieStorage.removeItem(key);
    expect(document.cookie).toContain("max-age=0");
  });
});
