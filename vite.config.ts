import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'robots.txt'],
      manifest: {
        name: 'SignBridgeGhana — GSL Translation Platform',
        short_name: 'SignBridge',
        description:
          'Real-time Ghanaian Sign Language translation, dictionary, and 3D avatar signing.',
        theme_color: '#0f172a',
        background_color: '#f4f6f9',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          { src: '/favicon.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
          { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
        ],
        categories: ['education', 'accessibility', 'utilities'],
        shortcuts: [
          { name: 'Translate', url: '/translate', icons: [{ src: '/favicon.png', sizes: '96x96' }] },
          { name: 'Dictionary', url: '/dictionary', icons: [{ src: '/favicon.png', sizes: '96x96' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^\/data\/dictionary\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gsl-dictionary-data',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'three': ['three'],
          'framer': ['framer-motion'],
        },
      },
    },
  },
});
