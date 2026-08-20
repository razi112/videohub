import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Dev proxy: /yt-rss?channel_id=UC... → YouTube RSS (no CORS in dev)
      '/yt-rss': {
        target: 'https://www.youtube.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yt-rss/, '/feeds/videos.xml'),
      },
    },
  },
})
