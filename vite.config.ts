import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Relative asset paths so the built site works on GitHub Pages subpaths too.
  base: "./",
  plugins: [react(), tailwindcss()],
  server: { host: "0.0.0.0", port: 5173, strictPort: true, allowedHosts: true },
});
