/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Seego API (tRPC endpoint lives at `${VITE_API_URL}/trpc`). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
