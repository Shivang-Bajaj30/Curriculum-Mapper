import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.USE_LOOPBACK === 'true' ? 'http://127.0.0.1:5000' : 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
