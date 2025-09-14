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
      '/sop-api': {
        target: 'http://14.103.223.101:6007',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/sop-api/, ''),
        secure: false
      },
      '/chatapi': {
        target: 'http://14.103.223.101:9010',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api-153/, ''),
      }
    }
  }
})
