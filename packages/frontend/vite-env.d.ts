interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DEFAULT_MODEL_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}