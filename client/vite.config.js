import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Compose and native development use the same repository-root .env file.
  const environment = { ...loadEnv(mode, '..', ''), ...process.env };
  const apiBaseUrl = environment.VITE_API_BASE_URL || 'http://localhost:8000';
  const legacyProcessEnv = {
    VALUATE_ENVIRONMENT: {
      REACT_APP_SERVER_URL: `${apiBaseUrl.replace(/\/$/, '')}/`,
      REACT_APP_ENABLE_UPLOAD: 'true',
    },
    GOOGLE_MAPS_API_KEY: '',
  };

  return {
  define: {
    __SWIFTLY_DEFAULT_API_BASE_URL__: JSON.stringify(apiBaseUrl),
    'process.env': JSON.stringify(legacyProcessEnv),
  },
  plugins: [
    {
      name: 'legacy-jsx',
      enforce: 'pre',
      async transform(code, id) {
        if (id.includes('/src/') && id.endsWith('.js')) {
          return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
        }
      },
    },
    react({ include: '**/*.{js,jsx,ts,tsx}' }),
  ],
  esbuild: { loader: 'jsx', include: /src\/.*\.(js|jsx)$/ },
  optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
  resolve: {
    alias: {
      'mixpanel-browser': '/src/analytics.js',
      'react-datetime/css/react-datetime.css': '/src/components/Common/datetime-compat.css',
      'react-datetime': '/src/components/Common/DatetimeCompat.jsx',
      'react-moment': '/src/components/Common/MomentDisplay.jsx',
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
          if (/node_modules\/(react-dnd|react-sortable-hoc|react-select|react-table|react-data-grid|react-datetime)\//.test(id)) return 'editors';
          if (/node_modules\/(axios|bluebird|moment|underscore|jquery)\//.test(id)) return 'utilities';
          return 'vendor';
        },
      },
    },
  },
  server: { port: 5173 },
  test: { exclude: ['e2e/**', 'node_modules/**', 'dist/**'] },
  };
});
