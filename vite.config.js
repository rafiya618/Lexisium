import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
      jsxImportSource: undefined,
    }),
    tailwindcss(),
  ],
  define: {
    'global': 'window',
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})