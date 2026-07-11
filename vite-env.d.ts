/// <reference types="vite/client" />

interface ViteTypeOptions {
  // Makes ImportMetaEnv strict: accessing keys not declared below is an error.
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_EMAIL?: string;
  readonly VITE_LINKEDIN_URL?: string;
  readonly VITE_GITHUB_URL?: string;
  readonly VITE_X_URL?: string;
  readonly VITE_PDF_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
