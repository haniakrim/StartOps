import { describe, it, expect } from "vitest";
import { stripHtml, truncate, isValidEmail } from "./sanitize";

describe("sanitize utilities", () => {
  describe("stripHtml", () => {
    it("should strip simple HTML tags", () => {
      expect(stripHtml("<p>Hello <b>world</b></p>")).toBe("Hello world");
    });

    it("should handle empty strings", () => {
      expect(stripHtml("")).toBe("");
    });

    it("should return same string if no HTML", () => {
      expect(stripHtml("Just some text")).toBe("Just some text");
    });

    it("should strip tags with attributes", () => {
      expect(stripHtml('<a href="https://example.com">Link</a>')).toBe("Link");
    });

    it("should handle malformed HTML", () => {
      // The current regex /<[^>]*>/g might fail here if not careful
      expect(stripHtml("<div class='foo' >Content")).toBe("Content");
    });

    it("should prevent basic XSS attempts", () => {
      // This is expected to FAIL with the current implementation if it's too simple
      const xss = "<img src=x onerror=alert(1)>";
      const stripped = stripHtml(xss);
      expect(stripped).not.toContain("onerror");
      expect(stripped).not.toContain("alert");
    });

    it("should handle mixed case tags", () => {
      expect(stripHtml("<sCRipt>alert(1)</ScRipt>")).toBe("");
    });

    it("should handle closing tags with whitespace", () => {
      expect(stripHtml("<script>alert(1)</script >")).toBe("");
    });

    it("should handle comments", () => {
      expect(stripHtml("hello <!-- comment --> world")).toBe("hello  world");
    });

    it("should handle nested tags", () => {
       expect(stripHtml("<div><p>Deep <span>nesting</span></p></div>")).toBe("Deep nesting");
    });
  });

  describe("truncate", () => {
    it("should truncate string to max length", () => {
      expect(truncate("Hello World", 5)).toBe("Hello");
    });

    it("should not truncate if shorter than max length", () => {
      expect(truncate("Hi", 5)).toBe("Hi");
    });
  });

  describe("isValidEmail", () => {
    it("should return true for valid emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
    });

    it("should return false for invalid emails", () => {
      expect(isValidEmail("test@example")).toBe(false);
      expect(isValidEmail("not-an-email")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });
});
