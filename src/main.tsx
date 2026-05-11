import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML = "<div style='padding:20px;color:red'>Error: #root element not found</div>";
} else {
  try {
    createRoot(rootEl).render(<App />);
  } catch (err: any) {
    console.error("React render error:", err);
    rootEl.innerHTML = `<div style="padding:20px;color:red;font-family:sans-serif"><h2>App Error</h2><pre>${err?.message || String(err)}</pre></div>`;
  }
}
