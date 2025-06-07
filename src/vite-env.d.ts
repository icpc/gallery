/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_DATA_FOLDER: string;
  mode: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*?raw";
