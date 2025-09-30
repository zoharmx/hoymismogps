import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      closeBundle() {
        try {
          copyFileSync('_redirects', 'dist/_redirects')
        } catch (e) {
          console.log('_redirects file not found or copy failed')
        }
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/database'],
          'mapbox': ['mapbox-gl']
        }
      }
    }
  }
})
