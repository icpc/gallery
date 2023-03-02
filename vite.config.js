import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dataRawPlugin from "vite-raw-plugin";

export default defineConfig({
    plugins: [react(), dataRawPlugin({
        fileRegex: /\.(?:team|event|people)$/
    })],
    server: {
        port: 3000,
    },
    build: {
        target: 'esnext',
        emptyOutDir: true,
        outDir: 'dist',
    },
});
