import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 1. Đặt 'define' ở cấp cao nhất (ngang hàng với plugins, server)
  define: {
    global: 'window',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
        // global: 'window', <--- XÓA DÒNG NÀY Ở ĐÂY
        secure: false
      }
    }
  }
});