import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: 'index.html',
        careerhub: 'careerhub.html',
        about: 'about.html',
        resources: 'resources.html',
        tracker: 'tracker.html'
      }
    }
  }
});

