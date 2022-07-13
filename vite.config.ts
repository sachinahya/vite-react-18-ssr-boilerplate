/// <reference types="vitest/config" />
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
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
    },
    plugins: [vanillaExtractPlugin(), react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setup-tests.ts',
    },
  };
});
