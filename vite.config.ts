import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.png',
        'icons/*.png',
        'images/og-social-share.png',
        'robots.txt',
      ],
      manifest: {
        name: 'SignBridgeGhana — GSL Translation Platform',
        short_name: 'SignBridge',
        description:
          'Real-time Ghanaian Sign Language translation, dictionary, and 3D avatar signing — accessible communication for everyone.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        lang: 'en-GH',
        icons: [
          {
            src: '/icons/favicon-16.png',
            sizes: '16x16',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/favicon-32.png',
            sizes: '32x32',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/shortcut-icon-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/maskable-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/maskable-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        categories: ['education', 'accessibility', 'utilities'],
        screenshots: [
          {
            src: '/images/og-social-share.png',
            sizes: '1200x630',
            type: 'image/png',
            form_factor: 'wide',
            label: 'SignBridgeGhana — Ghanaian Sign Language Platform',
          },
        ],
        shortcuts: [
          {
            name: 'Translate',
            short_name: 'Translate',
            description: 'Open the real-time translation studio',
            url: '/translate',
            icons: [{ src: '/icons/shortcut-icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'Dictionary',
            short_name: 'Dictionary',
            description: 'Browse the GSL dictionary',
            url: '/dictionary',
            icons: [{ src: '/icons/shortcut-icon-96.png', sizes: '96x96' }],
          },
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
