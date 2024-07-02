/// <reference types="node" />
import {resolve} from 'path'
import {defineConfig} from 'vite'
import preact from '@preact/preset-vite'

const root = resolve(__dirname, 'src')
const dist = resolve(__dirname, 'dist')

// https://vitejs.dev/config/
export default defineConfig({
  root,
  build: {
    outDir: dist,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        viewer: resolve(root, 'viewer.html'),
      },
    },
  },
  plugins: [preact()],
})
