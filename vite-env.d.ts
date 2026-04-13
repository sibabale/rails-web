/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLIENT_SERVER: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_ALLOW_INDEXING: string;
  readonly VITE_SEO_TITLE: string;
  readonly VITE_PORT: string;
  readonly VITE_ENABLE_AUTH_VIEWS: string;
  readonly VITE_SHOW_AUTH_BUTTONS: string;
  /** Optional. Public GitHub repo root for SDK sample app folders (dashboard links). */
  readonly VITE_SAMPLES_REPO_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
