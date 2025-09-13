import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/monitor-api': {
        target: 'http://153.35.82.15:8080', // 你的 monitor-svc
        changeOrigin: true,
        rewrite: p => p.replace(/^\/monitor-api/, '/api')
      },
      '/api-153': {
        target: 'http://153.35.82.15:31117',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api-153/, ''),
      }
    }
  }
})
