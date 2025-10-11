import { defineConfig } from 'vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  server: {
    port: 5173,
  },
  define: {
    'import.meta.env.VITE_DEFAULT_MODEL_NAME': JSON.stringify(process.env.DEFAULT_MODEL_NAME),
  },
});
