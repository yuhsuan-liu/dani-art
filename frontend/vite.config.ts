import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local: http://localhost:5173/
// GitHub Pages build: https://yuhsuan-liu.github.io/dani-art/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/dani-art/' : '/',
}))
