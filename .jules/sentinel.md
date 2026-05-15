## 2026-05-15 - [Removed Hardcoded Credentials]
**Vulnerability:** Found hardcoded demo credentials (`demo@example.com`, `demo123`) in the initial state of the Login component (`src/pages/Login.tsx`).
**Learning:** Hardcoded credentials on the frontend, even for demo purposes, can lead to unauthorized access or information disclosure and are a poor security practice.
**Prevention:** Avoid initializing form state with hardcoded credentials; always initialize with empty strings and rely on secure authentication flows.
