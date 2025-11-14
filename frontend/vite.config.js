import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendUrl = (process.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/media': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      }
    }
  }
});
