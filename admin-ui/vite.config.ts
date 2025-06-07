import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Removed lucide-react exclusion to prevent ad blocker issues
  server: {
    host: true,
    port: 5173,
    hmr: {
      clientPort: 5173
    }
  }
});