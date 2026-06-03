import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const appRoot = process.cwd();

export default defineConfig({
  root: appRoot,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.join(appRoot, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.join(appRoot, 'dist'),
    emptyOutDir: true,
  },
});
