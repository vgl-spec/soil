import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
   base: '/',
  plugins: [react()],
  server: {
    proxy: {
      '/login.php': {
        target: 'https://soil-3tik.onrender.com/Test/API',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/login\.php/, '/login.php'),
      
      }
    }
  }
});
