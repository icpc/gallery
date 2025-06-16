/* eslint-disable no-undef */
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

import { robotsTxtGenerator } from "./src/plugins/robotsTxtGenerator.ts";
import { sitemapGenerator } from "./src/plugins/sitemapGenerator.ts";

const baseUrl = "https://news.icpc.global";

export default defineConfig({
  plugins: [
    react(),
    sitemapGenerator({
      baseUrl,
      publicUrl: process.env.PUBLIC_URL || "/",
    }),
    robotsTxtGenerator({
      baseUrl,
      publicUrl: process.env.PUBLIC_URL || "/",
    }),
  ],
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
          if (id.includes("@tanstack")) {
            return "tanstack";
          }
          if (id.includes("react")) {
            return "react";
          }
        },
      },
    },
  },
});
