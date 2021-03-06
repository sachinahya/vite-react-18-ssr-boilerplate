/// <reference types="vite/client" />
import { fastifyExpress } from '@fastify/express';

declare module '@fastify/express' {
  export = fastifyExpress;
}

declare global {
  const __VITE_CLIENT_ASSETS__: {
    scripts: string[];
    styles: string[];
    ssrManifest: Record<string, string[]>;
  };

  interface Window {
    /**
     * @deprecated
     */
    __REACT_QUERY_STATE__: unknown;
  }
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
