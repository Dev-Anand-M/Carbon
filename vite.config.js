import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for CarbonWise
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  build: {
    /* Generate source maps for debugging */
    sourcemap: false,
    /* Split vendor chunks for better caching */
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
            return 'vendor';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'charts';
          }
        },
      },
    },
    /* Target modern browsers for smaller bundles */
    target: 'es2020',
  },
  server: {
    port: 3000,
    open: true,
  },
  /* Security: prevent exposing .env variables unintentionally */
  envPrefix: 'CARBONWISE_',
});
