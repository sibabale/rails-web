/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLIENT_SERVER: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_ALLOW_INDEXING: string;
  readonly VITE_SEO_TITLE: string;
  readonly VITE_PORT: string;
  readonly VITE_ENABLE_AUTH_VIEWS: string;
  readonly VITE_SHOW_AUTH_BUTTONS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
