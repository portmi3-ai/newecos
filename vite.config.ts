import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      splitVendorChunkPlugin(),
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      // Optimize bundle
      target: 'esnext',
      sourcemap: false,
      // Improve chunking
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['react-hot-toast'],
            'query': ['@tanstack/react-query'],
            'auth': ['@supabase/supabase-js'],
          }
        }
      },
      // Asset optimization
      assetsInlineLimit: 4096, // 4KB
      chunkSizeWarningLimit: 500, // 500KB warning
      // Minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    // Development server
    server: {
      port: 5173,
      open: true,
      cors: true,
      proxy: {
        // Proxy API requests to backend
        '/api': {
          target: env.VITE_API_URL || 'https://agent-ecos-api-xxxxxxxxxx-uc.a.run.app',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  };
});