import { defineConfig } from 'vite';

export default defineConfig({
    base: '/contact-book/',
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
            },
        },
    },
});
