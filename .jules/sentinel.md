## 2026-05-22 - [Supabase Auth Session Persistence via Cookies]
**Vulnerability:** Default `localStorage` persistence for Supabase Auth tokens is vulnerable to XSS-based token theft.
**Learning:** Supabase JS client allows overriding the storage engine. Switching to cookies with `SameSite=Lax` and `Secure` flags provides a significant security improvement over `localStorage` as they are more tightly controlled by the browser, though they must still be accessible via JS for the client-side library to work.
**Prevention:** Always use secure cookie-based storage for sensitive session tokens in client-side applications when possible, especially when a specialized adapter is already available in the codebase.
