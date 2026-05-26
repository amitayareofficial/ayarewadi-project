import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/framer-motion/")) {
            return "vendor-motion";
          }
          if (id.includes("node_modules/react-markdown/") || id.includes("node_modules/remark") || id.includes("node_modules/rehype") || id.includes("node_modules/unified") || id.includes("node_modules/micromark") || id.includes("node_modules/mdast")) {
            return "vendor-markdown";
          }
          if (id.includes("node_modules/axios/")) {
            return "vendor-axios";
          }
        },
      },
    },
  },
})
