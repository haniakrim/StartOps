## 2025-02-14 - [Insecure Default Storage in Supabase Auth]
**Vulnerability:** Supabase client in `src/integrations/supabase/client.ts` was using the default `localStorage` to persist session tokens, leaving them vulnerable to Cross-Site Scripting (XSS) token theft.
**Learning:** A custom secure storage implementation (`src/lib/secure-cookie-storage.ts`) had been implemented but was left unused in the configuration. We must always verify that security-enhancing code/modules are actually hooked up and in use.
**Prevention:** Ensure new security configurations are properly wired into the client options (`storage` property in `createClient`).
