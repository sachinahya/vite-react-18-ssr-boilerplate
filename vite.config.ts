/// <reference types="vitest/config" />
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import browserslist from 'browserslist';
import { resolveToEsbuildTarget } from 'esbuild-plugin-browserslist';
import { defineConfig } from 'vite';

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
    plugins: [vanillaExtractPlugin(), react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setup-tests.ts',
    },
  };
});
