import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    return ({
        // Mode "demo" dipakai untuk hosting di subfolder cPanel (public_html/demo-pos-v2).
        // Mode lain tetap root agar deploy GitHub Pages (custom domain) tidak berubah.
        base: mode === 'demo' ? '/demo-pos-v2/' : '/',
        plugins: [vue()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            port: 5173,
            proxy: {
                // Proxy panggilan /api ke backend Go saat development.
                '/api': {
                    target: 'http://localhost:8080',
                    changeOrigin: true,
                },
            },
        },
    });
});
