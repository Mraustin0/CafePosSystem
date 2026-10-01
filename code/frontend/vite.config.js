import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev: forward API calls to Spring Boot so no CORS config is needed.
    // Default target is the deployed Render backend so `npm run dev` works without
    // running Spring Boot locally. Set VITE_API_PROXY to override (e.g. http://localhost:8080).
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY || 'https://cafepossystem.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
