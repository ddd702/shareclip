import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    base: mode==='production'?'/dist/':'/',
    server: {
      host: '0.0.0.0',
      port: 8090,
    },
  }
  
})
