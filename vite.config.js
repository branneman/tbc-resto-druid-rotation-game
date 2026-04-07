import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/tbc-resto-druid-rotation-game/',
  plugins: [react()],
})
