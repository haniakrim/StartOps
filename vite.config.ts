import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    headers: {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "X-XSS-Protection": "0",
      "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://dtrwtbmxvscrfkzdpsqt.supabase.co https://*.supabase.co wss://dtrwtbmxvscrfkzdpsqt.supabase.co wss://*.supabase.co; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
    },
  },
  clearScreen: false,
  ...(host
    ? {
        server: {
          hmr: { host },
          watch: { ignored: ["**/src-tauri/**"] },
        },
      }
    : {}),
});