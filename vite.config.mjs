import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dataRawPlugin from "vite-raw-plugin";

export default defineConfig({
  plugins: [
    react(),
    dataRawPlugin({
      fileRegex: /\.(?:team|event|people)$/,
    }),
  ],
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
