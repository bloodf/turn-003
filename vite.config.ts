import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({ base: './', plugins: [vue()], worker: { format: 'es' }, build: { target: 'es2022', chunkSizeWarningLimit: 3000 }, server: { host: true, port: 5173 }, preview: { host: true, port: 4173 }, test: { testTimeout: 120000, include: ['tests/**/*.test.ts'] } } as any)
