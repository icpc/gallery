import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "path";
import { cwd } from "process";
import { defineConfig, loadEnv } from "vite";

import { robotsTxtGenerator } from "./src/plugins/robotsTxtGenerator.ts";
import { sitemapGenerator } from "./src/plugins/sitemapGenerator.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseUrl = "https://news.icpc.global";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), "");

  return {
    plugins: [
      react(),
      sitemapGenerator({
        baseUrl,
        publicUrl: env.PUBLIC_URL,
      }),
      robotsTxtGenerator({
        baseUrl,
        publicUrl: env.PUBLIC_URL,
      }),
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@data": resolve(__dirname, env.VITE_DATA_FOLDER || "data"),
      },
    },
    server: {
      port: 3000,
    },
    build: {
      target: "esnext",
      emptyOutDir: true,
      outDir: env.PUBLIC_URL || "dist",
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
  };
});
