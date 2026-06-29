import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compression({ algorithm: 'brotliCompress', ext: '.br', deleteOriginFile: false }),
    // eslint-disable-next-line no-undef
    process.env.VITE_ANALYZE && visualizer({ open: true, gzipSize: true, brotliSize: true }),
  ].filter(Boolean),
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'recharts', test: /[\\/]node_modules[\\/]recharts[\\/]/ },
            { name: 'vendor', test: /[\\/]node_modules[\\/]/ },
          ],
        },
      },
    },
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    exclude: ['e2e/**', 'node_modules/**'],
  },
  server: {
    host: true,
    allowedHosts: [
      'returns-distributed-proceed-organizations.trycloudflare.com',
      '.trycloudflare.com'
    ]
  }
})