import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.indexOf('node_modules') >= 0) {
            if (
              id.indexOf('react') >= 0 ||
              id.indexOf('react-dom') >= 0 ||
              id.indexOf('react-router-dom') >= 0
            ) {
              return 'react-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})
