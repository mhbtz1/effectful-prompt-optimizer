import { defineConfig } from 'vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  server: {
    proxy: {
      '/rpc': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    }
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
  },
  define: {
    'import.meta.env.VITE_DEFAULT_MODEL_NAME': JSON.stringify(process.env.DEFAULT_MODEL_NAME),
  },
});
