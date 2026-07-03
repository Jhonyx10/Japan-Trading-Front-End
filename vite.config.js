import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    tailwindcss(), 
    react(),
    visualizer({ open: true }) // This will open a chart in your browser after build
  ],
 build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Use a function instead of an object
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // This splits all node_modules into a single 'vendor' chunk
            return 'vendor';
          }
        }
      }
    }
  },
});