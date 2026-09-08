import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brand/favicon.svg', 'brand/sajitap-logo.svg'],
      manifest: {
        name: 'SajiTap — Tap. Order. Enjoy.',
        short_name: 'SajiTap',
        description: 'Pesan menu restoran langsung dari meja Anda.',
        theme_color: '#9f3c20',
        background_color: '#fffaf4',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'id',
        categories: ['food', 'lifestyle'],
        icons: [
          {
            src: '/brand/sajitap-logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/brand/sajitap-logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.hostname.includes('supabase') &&
              (url.pathname.startsWith('/auth/v1/') ||
                url.pathname.includes('/rest/v1/orders') ||
                url.pathname.includes('/rest/v1/order_items') ||
                url.pathname.includes('/rest/v1/order_item_options') ||
                url.pathname.includes('/rest/v1/profiles') ||
                url.pathname.includes('/rest/v1/restaurant_tables') ||
                url.pathname.includes('/rest/v1/rpc/')),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url, request }) =>
              url.hostname.includes('supabase') &&
              request.method === 'GET' &&
              url.pathname === '/rest/v1/menu_items',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sajitap-catalog',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 80, maxAgeSeconds: 3600 },
            },
          },
        ],
      },
    }),
  ],
})
