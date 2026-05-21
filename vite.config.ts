import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['motion/react'],
          icons: ['lucide-react'],
        }
      }
    },
    target: 'es2015',
    minify: 'esbuild',
    cssMinify: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'motion/react', 'lucide-react']
  }
})
