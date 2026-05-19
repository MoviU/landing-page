import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  build: {
    rollupOptions: {
      output: {
        // The manualChunks function determines which module goes into which output chunk
        manualChunks(id) {
          // 1. Critical: Split out the massive PDF libraries
          if (id.includes('react-pdf') || id.includes('pdfjs-dist')) {
            return 'vendor-pdf'; // Creates a chunk named vendor-pdf.[hash].js
          }

          // 2. Good Practice: Split out other large vendors (e.g., MUI, React itself)
          if (id.includes('node_modules')) {
            // A common pattern to group all non-PDF node_modules into one vendor chunk
            return 'vendor';
          }

          // 3. Optional: Split large component families (e.g., MUI icons)
          // if (id.includes('@mui/icons-material')) {
          //   return 'vendor-mui-icons';
          // }
        },
      },
    },
  },
});
