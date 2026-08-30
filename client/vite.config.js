import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@api': '/src/api',
      '@utils': '/src/utils',
      '@components': '/src/components',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/node_modules\/(bootstrap|reactstrap|react-transition-group|@fortawesome)\//.test(id)) return 'ui';
          if (/node_modules\/(google-map-react|d3|chart\.js|chartist|react-chartist|raphael)\//.test(id)) return 'visualization';
          if (/node_modules\/(pdfmake|jszip|docxtemplater|pizzip)\//.test(id)) return 'documents';
          if (/node_modules\/(@dnd-kit|react-select|react-table|react-data-grid|react-datetime)\//.test(id)) return 'editors';
          if (/node_modules\/(axios|date-fns|underscore)\//.test(id)) return 'utilities';
          return 'vendor';
        },
      },
    },
  },
  server: { port: 5173 },
  css: { preprocessorOptions: { scss: { quietDeps: true } } },
  test: { exclude: ['e2e/**', 'node_modules/**', 'dist/**'] },
});
