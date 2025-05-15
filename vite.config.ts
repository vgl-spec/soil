import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
   base: '/type/',
  plugins: [react()],
  server: {
    proxy: {
      '/login.php': {
        target: 'http://localhost:8012/Test/API',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/login\.php/, '/login.php'),
      
      }
    }
  }
});
