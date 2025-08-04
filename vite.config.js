import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite' // <-- IMPORTA el plugin oficial

// https://vite.dev/config/
export default defineConfig({
  // Utiliza el plugin de tailwind aquí
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        credentials: true,
      },
    },
  },
})