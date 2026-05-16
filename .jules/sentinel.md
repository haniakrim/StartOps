## 2024-05-16 - Removed Hardcoded Demo Credentials
**Vulnerability:** The login page (`src/pages/Login.tsx`) had hardcoded demo credentials (`demo@example.com` and `demo123`) as initial state values for the form fields.
**Learning:** Hardcoding credentials, even for demo environments, can be flagged by security scanners and accidentally left in production builds, exposing potentially valid or guessable user accounts.
**Prevention:** Form fields for authentication should always initialize empty. Demo credentials, if needed, should be provided via environment variables or explicitly documented outside of the source code.
