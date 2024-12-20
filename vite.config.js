import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server:{
    proxy:{
      '/api': {
        target: 'https://inmobiliariaarg.onrender.com',
        secure: false,
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
})
