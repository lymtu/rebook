import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const all = loadEnv(mode, process.cwd(), '');
  const proxyTarget = all.REBOOK_API_PROXY ?? 'http://127.0.0.1:3000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      /** 同时监听 IPv4/IPv6，避免仅 localhost 可连、127.0.0.1 拒连（Playwright/部分工具用 127.0.0.1） */
      host: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
    },
  };
});
