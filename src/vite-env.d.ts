/// <reference types="vite/client" />

interface ImportMetaEnv {
  mode: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*?raw";
