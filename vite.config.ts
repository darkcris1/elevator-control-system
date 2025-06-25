import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'; // Import the 'path' module

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  resolve: {
    alias: {
      // Set up the alias from tsconfig.json
      // The '@/' should point to your 'src' directory
      '@': path.resolve(__dirname, './src'),
    },
  },
})
