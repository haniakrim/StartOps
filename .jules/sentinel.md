# Sentinel's Journal

## 2025-05-14 - Use of Default Storage instead of Secure Cookie Storage
**Vulnerability:** The Supabase client was using default localStorage for session persistence despite a custom `secureCookieStorage` being implemented in the codebase.
**Learning:** Security features like secure cookie storage can remain "orphaned" if not explicitly integrated into the core client initialization.
**Prevention:** Always verify that custom security adapters are properly registered in the initialization logic of the libraries they are intended for.
