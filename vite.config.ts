import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-dev-runtime", "react/jsx-runtime"],
    esbuildOptions: {
      define: {
        "process.env.NODE_ENV": '"development"',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "X-XSS-Protection": "0",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://dtrwtbmxvscrfkzdpsqt.supabase.co https://*.supabase.co wss://dtrwtbmxvscrfkzdpsqt.supabase.co wss://*.supabase.co; font-src 'self'; base-uri 'self'; form-action 'self';",
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
