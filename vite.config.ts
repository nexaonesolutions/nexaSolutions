import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:4002',
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      visualizer({
        filename: './dist/stats.html',
        open: false,
        brotliSize: true,
      }),
    ],
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Function-based manualChunks: splits every node_module into its own named chunk
          // This prevents ANY vendor library from bloating the main index bundle
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) return 'firebase';
              if (id.includes('framer-motion')) return 'framer';
              if (id.includes('@stripe')) return 'stripe';
              if (id.includes('lucide-react')) return 'lucide';
              if (id.includes('date-fns')) return 'date-fns';
              if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
              if (id.includes('react')) return 'react-vendor';
              // All other node_modules go into a shared vendor chunk
              return 'vendor';
            }
          },
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
