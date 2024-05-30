import { defineConfig, Plugin } from 'vite'
import preact from '@preact/preset-vite'

const fullReloadAlways: Plugin = {
  name: 'full-reload',
  handleHotUpdate({ server }) {
      server.hot.send({ type: "full-reload" });
      return [];
  },
};
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), fullReloadAlways],
  preview: {
    open:                   false,
  },
})
