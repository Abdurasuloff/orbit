import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
 
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.io'],
  },
})
 