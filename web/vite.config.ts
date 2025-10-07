import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';
import { fileURLToPath, URL } from 'url';

function getLocalIP() {
  const ifaces = Object.values(os.networkInterfaces()).flat().filter(Boolean) as os.NetworkInterfaceInfo[];
  const ip = ifaces.find(i => i.family === 'IPv4' && !i.internal)?.address;
  return ip;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // read .env/.env.local
  // In Docker dev environment Vite should proxy requests to the API service
  // which is available at the Docker service hostname `api` on port 3001.
  const apiTarget = env.VITE_API_URL || env.VITE_API_TARGET || 'http://api:3001';

  return {
    server: {
      host: true,    // 0.0.0.0 (для работы в контейнере и мобильного доступа)
      port: 5173,
      hmr: {
        host: '192.168.0.100',   // ваш локальный IP для мобильного доступа
        clientPort: 5173,        // используем тот же порт для HMR
        protocol: 'ws'
      },
      proxy: {
        '/api':    { target: apiTarget, changeOrigin: true },
        '/health': { target: apiTarget, changeOrigin: true, rewrite: (path) => path.replace(/^\/health/, '/health') },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  };
});