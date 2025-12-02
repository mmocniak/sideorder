import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import pkg from './package.json';
export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.png', 'apple-touch-icon.png'],
            manifest: {
                name: 'Side Order',
                short_name: 'Side Order',
                description: 'Session-based order tracking for Side Hustle Coffee',
                theme_color: '#5C4033',
                background_color: '#FAF7F2',
                display: 'standalone',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}']
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});
