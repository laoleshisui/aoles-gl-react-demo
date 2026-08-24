/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_AGENT?: string;
  readonly VITE_API_DATA_SERVER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
