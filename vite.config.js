import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, 'src/newtab.html'),
      },
      output: {
        // Split large locales into lazy chunks so the main bundle stays lean
        manualChunks(id) {
          if (
            id.includes('locales') &&
            id.match(/en\.json|percentages\.json/) === null
          ) {
            const idx = id.indexOf('locales/');
            return `locales/${id.substring(idx + 8)}`;
          }
          if (id.includes('@excalidraw/mermaid-to-excalidraw')) {
            return 'mermaid-to-excalidraw';
          }
        },
      },
    },
  },
  publicDir: 'public',
});
