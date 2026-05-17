## 2026-05-17 - [Remove Hardcoded Credentials in React Components]
**Vulnerability:** Found hardcoded demo credentials in the initial state of the Login component (`src/pages/Login.tsx`).
**Learning:** Even though they are demo credentials, hardcoding credentials in React `useState` hooks or component files exposes them to the client-side bundle, which can be viewed by anyone inspecting the source code.
**Prevention:** Initial states for sensitive fields like email and password should always default to empty strings (`""`). Ensure any demo or mock authentication data is managed securely on the server-side, never hardcoded in client-side code.
