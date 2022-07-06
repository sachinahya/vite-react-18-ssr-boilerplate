/// <reference types="vite/client" />

declare const __VITE_CLIENT_ASSETS__: {
  scripts: string[];
  styles: string[];
};

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __REACT_QUERY_STATE__: unknown;
}
