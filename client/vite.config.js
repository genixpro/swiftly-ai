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
  server: { port: 5173 },
  test: { exclude: ['e2e/**', 'node_modules/**', 'dist/**'] },
  };
});
