import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

import { robotsTxtGenerator } from "./src/plugins/robotsTxtGenerator.ts";
import { sitemapGenerator } from "./src/plugins/sitemapGenerator.ts";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const baseUrl = "https://news.icpc.global";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const dataFolder = env.VITE_DATA_FOLDER || "data";

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
        "@": path.resolve(rootDir, "src"),
        "@data": path.resolve(rootDir, dataFolder),
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
            if (id.includes("node_modules/@tanstack/")) {
              return "tanstack";
            }
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/react-router/")
            ) {
              return "react-vendor";
            }
            if (
              id.includes("node_modules/@mui/") ||
              id.includes("node_modules/@emotion/")
            ) {
              return "mui-vendor";
            }
            return undefined;
          },
        },
      },
    },
  };
});
