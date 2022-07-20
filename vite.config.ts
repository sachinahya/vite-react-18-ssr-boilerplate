/// <reference types="vitest/config" />

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { default as react } from '@vitejs/plugin-react';
import browserslist from 'browserslist';
import { resolveToEsbuildTarget } from 'esbuild-plugin-browserslist';
import { defineConfig } from 'vite';
import { default as inspect } from 'vite-plugin-inspect';

import { reactSsrContext } from './tooling/vite-plugin-react-ssr-context.js';

// https://vitejs.dev/config/
export default defineConfig(({ ssrBuild }) => {
  const browsers = browserslist(undefined, {
    env: ssrBuild ? 'server' : 'browser',
    throwOnMissing: true,
    ignoreUnknownVersions: false,
  });

  const target = resolveToEsbuildTarget(browsers);

  return {
    clearScreen: false,
    server: {
      port: 3000,
      open: false,
      host: true,
    },
    build: {
      emptyOutDir: true,
      sourcemap: true,
      // So we can read the code and see what's going on.
      // In a real app you wouldn't do this.
      minify: false,
      manifest: !ssrBuild,
      ssrManifest: !ssrBuild,
      target,
    },
    plugins: [inspect(), reactSsrContext(), vanillaExtractPlugin(), react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setup-tests.ts',
    },
  };
});
