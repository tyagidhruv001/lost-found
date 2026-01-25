import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('firebase')) {
                            return 'firebase';
                        }
                        if (id.includes('react')) {
                            return 'react-vendor';
                        }
                        if (id.includes('framer-motion') || id.includes('lucide')) {
                            return 'ui-vendor';
                        }
                        return 'vendor';
                    }
                }
            }
        }
    }
})
