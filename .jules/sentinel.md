## 2026-05-21 - Secure Auth Storage with Cookies
**Vulnerability:** Supabase auth tokens were stored in `localStorage` by default, making them vulnerable to theft via Cross-Site Scripting (XSS).
**Learning:** React applications using Supabase often default to `localStorage` for session persistence. While convenient, it lacks the protection of cookies (like `SameSite` and `Secure` attributes).
**Prevention:** Use a custom storage adapter for Supabase that utilizes secure cookies. This centralizes session management and leverages browser-level security features to protect sensitive tokens.
