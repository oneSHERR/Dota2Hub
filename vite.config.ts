import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // Для GitHub Pages: замени '/dota2-hub/' на '/имя-твоего-репо/'
  // Для локальной разработки оставь '/'
  base: '/Dota2Hub/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  },
});
