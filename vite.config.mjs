import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@data": resolve(__dirname, process.env.VITE_DATA_FOLDER || "data"),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    emptyOutDir: true,
    outDir: process.env.PUBLIC_URL,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("react")) {
            return "r";
          }
        },
      },
    },
  },
});
