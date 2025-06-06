/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  VITE_DATA_FOLDER: string;
  mode: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
