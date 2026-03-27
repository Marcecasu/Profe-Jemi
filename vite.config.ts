import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Profe Jemi AI',
        short_name: 'Profe Jemi',
        description: 'Aprende español hablando con inteligencia artificial.',
        theme_color: '#DC2626',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/?source=pwa',
        icons: [
          {
            src: '/icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        cleanupOutdatedCaches: true,
        // Excluir la carpeta /api/ para que no use cache en el checkout
        navigateFallbackDenylist: [/^\/api/]
      }
    })
  ]
})
