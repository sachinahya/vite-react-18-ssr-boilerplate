/// <reference types="vite/client" />
import { fastifyExpress } from '@fastify/express';
import { default as react } from '@vitejs/plugin-react';

declare module '@fastify/express' {
  export = fastifyExpress;
}

declare module '@vitejs/plugin-react' {
  export = react;
}

declare global {
  const __VITE_CLIENT_ASSETS__: {
    scripts: string[];
    styles: string[];
  };

  interface Window {
    // __ssr_chunks__: unknown;

    // __ssr_data__: unknown;

    /**
     * @deprecated
     */
    __REACT_QUERY_STATE__: unknown;
  }
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
