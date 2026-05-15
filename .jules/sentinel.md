## 2026-05-15 - Security Enhancements: Auth Storage & Error Handling
**Vulnerability:** 1. Supabase auth tokens were stored in `localStorage` by default (XSS risk). 2. `ErrorBoundary` was leaking raw error messages to users in production (Information Disclosure).
**Learning:** Defense in depth requires addressing both data protection (cookies) and information leakage (error masking).
**Prevention:** 1. Integrated `secureCookieStorage` with Supabase client for more resilient token storage. 2. Updated `ErrorBoundary` to mask error details in production using `import.meta.env.DEV`.
