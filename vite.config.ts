import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
